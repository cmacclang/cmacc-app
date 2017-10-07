const url = require('url');
const express = require('express');

const expressBodyParser = require('body-parser');

const githubServices = require('../services/githubServices');

const router = express.Router();

const cmacc = require('cmacc-compiler');

router.use(expressBodyParser.urlencoded({extended: false}));

router.use('/prose/:user/:repo/:branch/*', (req, res, next) => {
  const context = {
    user: req.params.user,
    repo: req.params.repo,
    branch: req.params.branch || 'master',
    path: req.params[0],
    format: 'ast',
    prop: req.query.prop,
  };
  req.context = context;
  req.token = req.session['token'];
  next();
});

router.get('/prose/:user/:repo/:branch/*', (req, res) => {
  const obj = {
    context: req.context
  };
  res.render('prose', obj);
});

router.get('/prose1/:user/:repo/:branch/*', (req, res) => {

  const token = req.session['token'];

  const path = req.query['path'];

  if (!path) {
    return res.send('Path not set');
  }

  const doc = githubServices.getCmacc(req.context, token);

  doc
    .then(ast => {

      const split = path.split('.');
      const last = split.pop();
      const root = split.reduce((a, b) => a[b], ast);

      const type = typeof root[last];
      const value = typeof root[last] === 'string' ? root[last] : root[last]['$value'];
      const meta = root[last]['$meta'];
      const options = root['$meta']['Options'];

      let template = `<form>`;
      template += `<div class="form-group">
          <label >File</label>
          <p class="form-control-static">${root['$file']}</p>
        </div>
        <div class="form-group">
          <label >Path</label>
          <p class="form-control-static">${path}</p>
        </div>
        <div class="form-group">
          <label >Type</label>
          <p class="form-control-static">${type}</p>
        </div>`;

      if(options){
        template += `<div class="form-group">`;
        template += `<label for="option">Options</label>`;
        template += `<select id="option" class="form-control" >`;
        template += options.map(x => `<option ${last == x ? 'selected' : ''}>${x}</option>`).join('');
        template += `</select>`;
        template += `</div>`;
      }

      if (meta && Object.getOwnPropertyNames(meta).length > 0) {
        template += `<div class="form-group">
          <label >Meta</label>
          <p class="form-control-static">${JSON.stringify(meta)}</p>
        </div>`;
      }

      if (!options && type === 'string') {
        template += `<div class="form-group">
          <label for="variable" >Value</label>
          <textarea class="form-control" rows="5" id="variable">${value}</textarea>
        </div>`;
      }

      if(!options && type === 'object') {
        template += `<div class="form-group">
          <label for="variable" >Value</label>
          <textarea class="form-control" rows="20">${root[last]['$data']}</textarea>
        </div>`;
      }

      template += `</form>`;

      res.send({
        type,
        path,
        value,
        template
      });
    })
    .catch(e => {
      console.error(e)
      res.send('ERROR');
    });

});


module.exports = router;