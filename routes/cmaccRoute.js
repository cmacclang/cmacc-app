const express = require('express');

const expressBodyParser = require('body-parser')

const githubServices = require('../services/githubServices')


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
    }
  }

  const cmacc = githubServices.getCmacc(req.context, token);
  const user = githubServices.getUser(token);
  const commit = githubServices.getCommit(req.context, token);
  const branches = githubServices.getBranches(req.context, token);

  Promise.all([cmacc, user, branches, commit]).then(x => {

    obj.context = req.context;
    obj.user = x[1];
    obj.branches = x[2];
    obj.commit = x[3];

    if (req.context.format === 'html') {
      obj.content = x[0];
      res.render('html', obj);
    }

    if (req.context.format === 'source') {
      obj.content = x[0];
      res.render('source', obj);
    }

    if (req.context.format === 'ast') {
      obj.content = JSON.stringify(x[0], null, 2);
      res.render('source', obj);
    }

    if (req.context.format === 'edit') {
      obj.content = x[0];
      res.render('edit', obj);
    }

  }).catch(x => console.log(x))

});

router.post('/:user/:repo/:branch/*', (req, res) => {
  console.log(req.body)
  githubServices.saveCommit(req.body.message, req.body.content, req.context, req.token)
    .then((x) => {
      console.log('res', x)
      res.redirect(req.path)
    })
});

module.exports = router;