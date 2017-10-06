const url = require('url');
const express = require('express');

const cmacc = require('cmacc-compiler');

const expressBodyParser = require('body-parser');

const githubServices = require('../services/githubServices');

const router = express.Router();

router.use(expressBodyParser.urlencoded({extended: false}));

router.get('/:user/:repo', (req, res) => {
  const token = req.session['token'];
  const user = githubServices.getUser(token);
  const files = githubServices.getFiles('cmacclang', 'cmacc-example-helloworld', 'master', token)

  Promise.all([user, files]).then(x => {
    const opts = {
      user: x[0]
    }
    res.render('repo', opts);
  });
});

module.exports = router;