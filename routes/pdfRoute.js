const url = require('url');

const express = require('express');
const expressBodyParser = require('body-parser');

const cmacc = require('cmacc-compiler');
const githubServices = require('../services/githubServices');

var pdf = require('html-pdf');

const router = express.Router();

router.use('/pdf/:user/:repo/:branch/*', (req, res, next) => {
  const context = {
    user: req.params.user,
    repo: req.params.repo,
    branch: req.params.branch || 'master',
    path: req.params[0],
    root: '/pdf',
    format: 'ast'
  };
  req.context = context;
  req.token = req.session['token'];
  next();
});

router.get('/pdf/:user/:repo/:branch/*', (req, res) => {

  const token = req.session['token'];

  const opts = {token};

  githubServices.getCmacc(req.context, token)
    .then(ast => {
      Object.keys(req.query).forEach((path) => {
        const split = path.split('.');
        const last = split.pop();
        const res = split.reduce((a, b) => a[b], ast)
        res[last] = req.query[path];
      });
      return ast;
    })
    .then(x => {
      return cmacc.render(x)
    })
    .then(x => {
      return cmacc.remarkable.render(x, opts)
    })
    .then(html => {

      const css = `<style>
  html, body {
    margin: 20px;
  }
</style>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">`
      pdf.create(css + html).toBuffer(function (err, buffer) {
        res.setHeader('Content-disposition', `inline; filename="${req.context.path.replace('.cmacc', '.pdf')}"`);
        res.setHeader('Content-type', 'application/pdf');
        res.send(buffer)
      });
    })

});

module.exports = router;