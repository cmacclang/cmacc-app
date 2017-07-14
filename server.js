const url = require('url');

const express = require('express');
const expressSession = require('express-session');

const app = express();

const proxy = require('http-proxy-middleware');
const fetch = require('node-fetch');

const cmacc = require('cmacc-compiler');

const port = process.env.PORT || 3000;
const secret = process.env.SECRET || "CmaccSecret";

const clientId = process.env.CLIENT_ID || "136ba76cfc7d6e8251dc";
const clientSecret = process.env.CLIENT_SECRET || "db05cc594b050e007c3cc244d7fed5916af5aee0";


global.fs = null;
global.fetch = fetch;

app.use(expressSession({
  secret: secret,
  cookie: {}
}));

app.use((req, res, next) => {

  console.log(req.session['code'], req.session['code'], req.query['code']);
  if (req.path === '/auth' && req.query['code']) {
    req.session['code'] = req.query['code']
    if (req.session['redirect']) {
      return res.redirect(req.session['redirect']);
    } else {
      return res.redirect('/');
    }

  }

  if (!req.session['code']) {
    const url = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${clientId}`;
    req.session['redirect'] = req.path;
    return res.redirect(url);
  }

  return next();

});

app.get('/', (req, res) => {
  res.send('Hello World!')
});


const base = 'https://raw.githubusercontent.com';

app.get('/ast/:user/:repo/:branch/*', (req, res) => {

  const location = url.resolve(base, req.path.replace('/ast', ''));

  return cmacc.compile(location)
    .then(ast => {
      console.log(ast)
      return ast;
    })
    .then(x => res.send(x))
    .catch(x => console.log(x))

});


app.get('/html/:user/:repo/:branch/*', (req, res) => {

  const prop = req.query.prop;
  const location = url.resolve(base, req.path.replace('/html', ''));

  return cmacc.compile(location)
    .then(x => {
      if(prop) return x[prop]
      return x
    })
    .then(cmacc.render)
    .then(x => {
      return cmacc.remarkable.render(x)
    })
    .then(x => {
      res.send(x)
    })
    .catch(x => console.log(x))

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});