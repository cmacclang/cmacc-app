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

router.get('/full_auth', (req, res) => {

  const url = `${authUrl}/authorize?scope=user:email,repo,gist,write:org&client_id=${clientId}`;
  req.session['redirect'] = req.url;
  return res.redirect(url);
});

module.exports = router