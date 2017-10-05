const express = require('express');

const authServices = require('../services/authService');

const clientId = process.env.GITHUB_CLIENT_ID
const authUrl = process.env.GITHUB_AUTH_URL;

const router = express.Router();

router.get('/full_access', (req, res) => {
  const url = `${authUrl}/authorize?scope=user:email,repo,gist,write:org&client_id=${clientId}`;
  return res.redirect(url);
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
    const url = `${authUrl}/authorize?scope=user&client_id=${clientId}`;
    req.session['redirect'] = req.url;
    return res.redirect(url);
  }

  return next();

});

module.exports = router