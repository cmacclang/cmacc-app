const url = require('url');
const express = require('express');

const expressBodyParser = require('body-parser');

const gistService = require('../services/gistServices');
const githubServices = require('../services/githubServices');

const router = express.Router();

router.use(expressBodyParser.urlencoded({extended: false}));

router.get('/gists', (req, res) => {

  const token = req.session['token'];

  const user = githubServices.getUser(token);
  const gists = gistService.findAll(token);

  Promise.all([user, gists]).then(x => {

    const obj = {};
    obj.context = req.context;
    obj.user = x[0];
    obj.gists = x[1];

    res.render('gists', obj);

  });

});

module.exports = router;