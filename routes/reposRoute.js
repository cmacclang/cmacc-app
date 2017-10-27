const url = require('url');
const express = require('express');

const cmacc = require('cmacc-compiler');

const expressBodyParser = require('body-parser');

const githubServices = require('../services/githubServices');

const router = express.Router();

router.use(expressBodyParser.urlencoded({extended: false}));

router.use('/repos/:owner/:repo/:branch*', (req, res, next) => {
  const context = {
    owner: req.params.owner,
    user: req.params.owner,
    repo: req.params.repo,
    branch: req.params.branch || 'master',
    path: req.params[0],
    prop: req.query.prop,
    root: '/repos'
  };
  req.context = context;
  req.token = req.session['token'];
  next();
});

router.get('/repos', (req, res) => {
  const token = req.session['token'];
  const q = req.query['q'];

  const user = githubServices.getUser(token);
  const repos = githubServices.getRepos(q, token)

  Promise.all([user, repos]).then(x => {
    const obj = {
      user: x[0],
      repos: x[1],
      q:q
    };
    res.render('repos', obj);
  });
});

router.get('/repos/:owner/:repo/:branch', (req, res) => {
  const token = req.session['token'];
  const context = req.context;

  const user = githubServices.getUser(token);
  const branches = githubServices.getBranches(context, token);
  const files = githubServices.getFiles(context.owner, context.repo, context.branch, token);

  Promise.all([user, branches, files]).then(x => {
    const files = x[2].tree
      .filter(x => x.path.match(/\.cmacc$/))
    const obj = {
      user: x[0],
      branches: x[1],
      context: context,
      files: files,
    };
    res.render('repos', obj);
  });
});

module.exports = router;