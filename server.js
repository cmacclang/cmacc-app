const express = require('express');
const expressSession = require('express-session');
const expressHandlebars = require('express-handlebars');

const proxy = require('http-proxy-middleware');
const fetch = require('node-fetch');

const port = process.env.PORT || 3000;
const secret = process.env.SECRET || "CmaccSecret";

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

// Set globals
global.fs = null;
global.fetch = fetch;

const app = express();

app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(expressSession({
  secret: secret,
  cookie: {}
}));

app.use('/assets', express.static('assets'));

app.use(require('./routes/authRoute'));
app.use(require('./routes/contractRoute'));
app.use(require('./routes/definitionsRoute'));
app.use(require('./routes/gistsRoute'));
app.use(require('./routes/cmaccRoute'));
app.use(require('./routes/indexRoute'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});