const url = require('url');
const path = require('path');

const cmacc = require('cmacc-compiler');

const fetch = require('node-fetch');

const apiUrl = process.env.GITHUB_API_URL;

const getCmacc = function (context, token) {

  const opts = {
    token
  }

  const base = 'github:///'
  const urlPath = path.join(context.user, context.repo, context.branch, context.path);
  const location = url.resolve(base, urlPath);


  if (context.format === 'source' || context.format === 'edit' ) {
    const opts= {
      token
    }
    return cmacc.loader(location, opts).then(x => x.data)
  }

  const ast = cmacc.compile(location, opts)

    .then(x => {
      return (context.prop) ? x[context.prop] : x;
    });


  if (context.format === 'ast') {
    return ast
  }

  if (context.format === 'group') {
    return ast
      .then(x => {
        return cmacc.render(x)
      })
  }

  if (context.format === 'html' || context.format === 'form') {
    return ast
      .then(x => {
        return cmacc.render(x)
      })
      .then(x => {
        return cmacc.remarkable.render(x)
      })
  }

};

const getUser = (token) => {


  const location = url.resolve(apiUrl, '/user');

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(location, opts)
    .then(x => x.json())

}

const getCommit = (context, token) => {

  const urlPath = path.join('repos', context.user, context.repo, 'commits', context.branch);
  const location = url.resolve(apiUrl, urlPath);

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(location, opts)
    .then(x => x.json())

};

const getBranches = (context, token) => {

  const urlPath = path.join('repos', context.user, context.repo, 'branches');
  const location = url.resolve(apiUrl, urlPath);

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(location, opts)
    .then(x => x.json())

};

const saveCommit = (message, content, context, token) => {

  const urlPath = path.join('repos', context.user, context.repo, 'contents', context.path);
  const location = url.resolve(apiUrl, urlPath);

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(location + '?ref=' + context.branch, opts)
    .then((x) => {
      return x.json();
    })
    .then((x) => {
      const body = {
        path: context.path,
        message: message,
        branch: context.branch,
        sha: x.sha,
        content: new Buffer(content).toString('base64')
      };

      const opts = {
        method: 'PUT',
        headers: {
          'Authorization': "token " + token
        },
        body: JSON.stringify(body),
      };

      return fetch(location, opts);
    })

    .then(x => x.json())
    .then(x => {
      return x;
    })

};


module.exports = {getCmacc, getUser, getCommit, getBranches, saveCommit};