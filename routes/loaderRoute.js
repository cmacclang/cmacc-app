const url = require('url');
const express = require('express');

const router = express.Router();

const cmacc = require('cmacc-compiler');

const apiUrl = process.env.GITHUB_API_URL;

router.use('/loader/:protocol/*', (req, res) => {

  const protocol = req.params.protocol;
  const path = req.params[0];

  const ref = `${protocol}:///${path}`;

  const token = req.session['token'];

  const opts = {
    token,
    githubApiUrl: apiUrl,
  };

  cmacc.loader(ref, opts)
    .then((content) => {
      res.send(content)
    });

});

module.exports = router;