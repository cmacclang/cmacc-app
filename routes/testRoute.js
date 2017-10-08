const url = require('url');
const express = require('express');

const expressBodyParser = require('body-parser');

const githubServices = require('../services/githubServices');

const router = express.Router();

const cmacc = require('cmacc-compiler');

router.use(expressBodyParser.urlencoded({extended: false}));

router.use('/api/:user/:repo/:branch/*', (req, res, next) => {
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

router.get('/test', (req, res) => {

  res.render('test');

});


module.exports = router;