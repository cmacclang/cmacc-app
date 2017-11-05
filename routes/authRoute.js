const express = require('express');

const authServices = require('../services/authService');

const clientId = process.env.GITHUB_CLIENT_ID
const authUrl = process.env.GITHUB_AUTH_URL;

const router = express.Router();

router.get('/auth/full_access', (req, res) => {
  const url = `${authUrl}/authorize?scope=user:email,repo,gist,write:org&client_id=${clientId}`;
  return res.redirect(url);
});

router.get('/auth/login', (req, res) => {
  const url = `${authUrl}/authorize?client_id=${clientId}`;
  return res.redirect(url);
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(function(err) {
    return res.redirect("/login");
  })
});

router.use((req, res, next) => {

  const code = req.query['code']

  if (req.path === '/auth' && code) {

    return authServices.getToken(code).then(token => {
      req.session['token']  = token
      if (req.session['redirect']) {
        return res.redirect(req.session['redirect']);
      } else {
        return res.redirect('/');
      }
    })
  }

  if (!req.session['token']) {
    req.session['redirect'] = req.url;

    if(req.path === '/'){
      return res.redirect('/login');
    }

    return res.redirect('/auth/login');

  }

  return next();

});

module.exports = router