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

      const value = root[last];
      const type = typeof value;

      console.log(root['$meta'])

      const template = `<form>
        <div class="form-group">
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
        </div>
        <div class="form-group">
          <label for="variable" >Value</label>
          <textarea class="form-control" rows="5" id="variable">${value}</textarea>
        </div>
      </form>`;

      res.send({
        type,
        path,
        value,
        template
      });
    })
    .catch(e => {
      console.log('error', e)
      res.send('hello');
    });

});


module.exports = router;