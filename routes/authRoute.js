const authServices = require('../services/authService');

const clientId = process.env.GITHUB_CLIENT_ID
const authUrl = process.env.GITHUB_AUTH_URL;

const authRoute = (req, res, next) => {

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
    const url = `${authUrl}/authorize?scope=user:email,repo,gist,write:org&client_id=${clientId}`;
    req.session['redirect'] = req.path;
    return res.redirect(url);
  }

  return next();

};

module.exports = authRoute