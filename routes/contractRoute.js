const url = require('url');
const express = require('express');

const expressBodyParser = require('body-parser');

const gistServices = require('../services/gistServices');

const router = express.Router();

router.use(expressBodyParser.urlencoded({extended: false}));

router.use('/contracts', (req, res, next) => {

  const token = req.session['token'];

  gistServices.findGists(token).then(x => {
    res.send(x)
  })

});

module.exports = router;