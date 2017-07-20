const express = require('express');

const expressBodyParser = require('body-parser')

const githubServices = require('../services/githubServices')


const router = express.Router();

router.get('/', (req, res) => {

  const token = req.session['token'];
  const user = githubServices.getUser(token);

  Promise.all([user]).then(x => {
    const opts = {
      user: x[0]
    }
    res.render('index', opts);
  });
});

module.exports = router