const url = require('url');
const path = require('path');

const fetch = require('node-fetch');

const formioKey = process.env.FORMIO_KEY;

const findEscrow = function (id) {

  const urlPath = path.join('gists');

  const opts = {
    headers: {
      'x-token': formioKey
    }
  };

  const location = `https://vsoqkxzelfinxcb.form.io/cmacc-escrow/submission/${id}`;
  return fetch(location, opts)
    .then(x => x.json());

};


module.exports = {findEscrow};