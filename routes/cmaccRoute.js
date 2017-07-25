const url = require('url');
const express = require('express');

const cmacc = require('cmacc-compiler');

const expressBodyParser = require('body-parser');

const githubServices = require('../services/githubServices');
const remarkable = require('cmacc-compiler').remarkable;

const router = express.Router();

router.use(expressBodyParser.urlencoded({extended: false}));

router.use('/:user/:repo/:branch/*', (req, res, next) => {
  const context = {
    user: req.params.user,
    repo: req.params.repo,
    branch: req.params.branch || 'master',
    path: req.params[0],
    format: req.query.format || 'source',
    prop: req.query.prop,
  };
  req.context = context;
  req.token = req.session['token'];
  next();
});

router.get('/:user/:repo/:branch/*', (req, res) => {

  const token = req.session['token'];

  const obj = {
    active: {
      source: req.context.format === 'source',
      ast: req.context.format === 'ast',
      html: req.context.format === 'html',
      edit: req.context.format === 'edit',
      group: req.context.format === 'group',
      form: req.context.format === 'form',
    }
  }

  const doc = githubServices.getCmacc(req.context, token);
  const user = githubServices.getUser(token);
  const commit = githubServices.getCommit(req.context, token);
  const branches = githubServices.getBranches(req.context, token);

  Promise.all([doc, user, branches, commit]).then(x => {

    obj.context = req.context;
    obj.user = x[1];
    obj.branches = x[2];
    obj.commit = x[3];

    if (req.context.format === 'html') {
      obj.content = x[0];
      res.render('cmacc', obj);
    }

    if (req.context.format === 'source') {
      obj.source = true;
      obj.content = x[0].replace(/\[(.*)\]/g, (res, link) => {
        var target = url.resolve(req.path, link)
        target = target.replace('github://', '');
        return `<a href="${target}">${res}</a>`
      });
      res.render('cmacc', obj);
    }

    if (req.context.format === 'ast') {
      obj.source = true;
      obj.content = JSON.stringify(x[0], null, 2);
      res.render('cmacc', obj);
    }

    if (req.context.format === 'group') {

      function transfrom(x) {
        if(x.variable){
          console.log(x)
          x.type = 'htmlblock';
          x.content = `<cmacc variable="${x.variable}">${x.content}</cmacc>`;
        }

        if (x.children)
          x.children = x.children.map(transfrom);
        return x;
      }

      const data = x[0].map(transfrom);
      obj.content = cmacc.remarkable.render(data, {});
      res.render('group', obj);
    }

    if (req.context.format === 'form') {
      req.context.format = 'source';
      obj.path = req.path;
      obj.content = x[0].replace(/{{([^}]*)}}/g, (match, val) => {
        return `<input type="text" placeholder="${val}" name="data.${val}" data-variable="${val}" />`
      });
      res.render('form', obj);

    }

    if (req.context.format === 'edit') {
      obj.content = x[0];
      res.render('edit', obj);
    }

  })
    .catch(e => {
      console.log(e);
      obj.content = e.stack;
      res.render('error', obj);
    })

});

router.post('/:user/:repo/:branch/*', (req, res) => {
  githubServices.saveCommit(req.body.message, req.body.content, req.context, req.token)
    .then((x) => {
      // console.log('res', x)
      res.redirect(req.path)
    })
});

router.post('/form', (req, res) => {
  res.redirect(req.body.path)
});

module.exports = router;