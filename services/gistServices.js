const url = require('url');
const path = require('path');

const cmacc = require('cmacc-compiler');

const fetch = require('node-fetch');

const apiUrl = process.env.GITHUB_API_URL;

const findAll = function (token) {

  const urlPath = path.join('gists');
  const location = url.resolve(apiUrl, urlPath);

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(location, opts)
    .then(x => x.json())
    .then(x => x
      //.filter(y => y.files.filter())
      .map(y => {
        console.log(y)
        return {
          id: y.id,
          description: y.description,

        }
      }))

};


const create = function (token) {

  const urlPath = path.join('gists');
  const location = url.resolve(apiUrl, urlPath);

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(location, opts)
    .then(x => x.json())
    .then(x => x
      .filter(y => y.files.filter())
      .map(y => {
        console.log(y)
        return {
          id: y.id,
          description: y.description,

        }
      }))

};

module.exports = {findAll, create};