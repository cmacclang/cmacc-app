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

router.get('/api/:user/:repo/:branch/*', (req, res) => {

  const token = req.session['token'];

  githubServices.getCmacc(req.context, token)
    .then(content => {
      res.send(content);
    })
    .catch(e => {
      //console.log(e);
      obj.content = e.stack;
      res.send('error', obj);
    });

});


module.exports = router;