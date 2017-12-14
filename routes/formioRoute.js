const url = require('url');
const express = require('express');

const cmacc = require('cmacc-compiler');

const expressBodyParser = require('body-parser');

const cmaccCompiler = require('cmacc-compiler');
const githubServices = require('../services/githubServices');

const router = express.Router();

router.use(expressBodyParser.urlencoded({extended: false}));

router.use('/formio/:user/:repo/:branch/*', (req, res, next) => {
  const context = {
    user: req.params.user,
    repo: req.params.repo,
    branch: req.params.branch || 'master',
    path: req.params[0],
    prop: req.query.prop,
    root: '/formio'
  };
  req.context = context;
  req.token = req.session['token'];
  next();
});

router.get('/formio/:user/:repo/:branch/*', (req, res) => {

  const context = req.context;
  const token = req.token;

  githubServices.getFile(context.user, context.repo, context.branch, context.path, token).then(data => {
    const content = new Buffer(data.content, 'base64').toString();

    const obj = {};
    obj.context = req.context;
    obj.content = content;
    res.render('formio', obj);
  })


});

module.exports = router;