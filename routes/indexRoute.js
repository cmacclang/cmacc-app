const express = require('express');

const expressBodyParser = require('body-parser')

const githubServices = require('../services/githubServices')


const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

module.exports = router