const express = require('express');
const expressSession = require('express-session');
const expressHandlebars = require('express-handlebars');

const proxy = require('http-proxy-middleware');
const fetch = require('node-fetch');

const fs = require('fs');

const port = process.env.PORT || 3000;
const secret = process.env.SECRET || "CmaccSecret";

// Set globals
global.fs = fs;
global.fetch = fetch;

const app = express();

app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(expressSession({
  secret: secret,
  cookie: {}
}));

app.use('/assets', express.static('assets'));
app.use('/dist', express.static('dist'));

app.use('/lib/formiojs', express.static('node_modules/formiojs/dist'));

app.use(require('./routes/testRoute'));

app.use(require('./routes/authRoute'));
app.use(require('./routes/apiRoute'));
app.use(require('./routes/pdfRoute'));
app.use(require('./routes/formioRoute'));
app.use(require('./routes/loaderRoute'));
app.use(require('./routes/reposRoute'));
app.use(require('./routes/contractRoute'));
app.use(require('./routes/definitionsRoute'));
app.use(require('./routes/gistsRoute'));
app.use(require('./routes/editorRoute'));
app.use(require('./routes/cmaccRoute'));
app.use(require('./routes/indexRoute'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});