const url = require('url');
const path = require('path');

const cmacc = require('cmacc-compiler');

const fetch = require('node-fetch');

const githubApiUrl = process.env.GITHUB_API_URL;

const getCmacc = function (context, token) {

  const opts = {
    token,
    githubApiUrl,
  };

  const base = 'github:///'
  const urlPath = path.join(context.user, context.repo, context.branch, context.path);
  const location = url.resolve(base, urlPath);

  if (context.format === 'source' || context.format === 'edit') {
    return cmacc.loader(location, opts).then(x => x.data)
  }

  if (context.format === 'assemble') {
    return cmacc.assemble(location, opts);
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
        return cmacc.render(x, opts)
      })
  }

  if (context.format === 'html' || context.format === 'form') {
    return ast
      .then(x => {
        return cmacc.render(x, opts)
      })
      .then(x => {
        return cmacc.remarkable.render(x, opts)
      })
  }

};

const getFiles = function (owner, repo, path1, token) {

  const urlPath = path.join('repos', owner, repo, 'contents', path1);
  const location = url.resolve(githubApiUrl, urlPath);

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(location, opts)
    .then(x => {
      if (x.status === 200) {
        return x.json()
      } else {
        return null;
      }
    })


};

const getUser = (token) => {


  const location = url.resolve(githubApiUrl, 'user');

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
  const location = url.resolve(githubApiUrl, urlPath);

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };
  console.log('getBranches', location, opts)
  return fetch(location, opts)
    .then(x => x.json())

};

const createBranch = (name, context, token) => {

  const urlPath = path.join('repos', context.user, context.repo, 'git/refs');
  const ref = url.resolve(githubApiUrl, urlPath);

  return getBranch(context, token)
    .then(branch => {

      console.log('createBranch', name, context, branch);

      const body = {
        ref: `refs/heads/${name}`,
        sha: branch.object.sha
      };

      const opts = {
        method: 'POST',
        headers: {
          'Authorization': "token " + token
        },
        body: JSON.stringify(body),
      };

      return fetch(ref, opts);
    })
    .then(x => x.json());

};


const getBranch = (context, token) => {

  console.log('getBranch', context)

  const urlPath = path.join('repos', context.user, context.repo, 'git/refs/heads', context.branch);
  const ref = url.resolve(githubApiUrl, urlPath);

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(ref, opts)
    .then(x => x.json());

};

const getCommit = (context, token) => {

  const urlPath = path.join('repos', context.user, context.repo, 'contents', context.path);
  const ref = url.resolve(githubApiUrl, urlPath) + '?ref=' + context.branch;

  const opts = {
    headers: {
      'Authorization': "token " + token
    }
  };

  return fetch(ref, opts)
    .then((x) => {
      return x.json();
    })

};


const saveCommit = (message, content, context, token) => {

  const urlPath = path.join('repos', context.user, context.repo, 'contents', context.path);
  const ref = url.resolve(githubApiUrl, urlPath) + '?ref=' + context.branch;

  return getCommit(context, token)
    .then((commit) => {
      const body = {
        path: context.path,
        message: message,
        branch: context.branch,
        sha: commit.sha,
        content: new Buffer(content).toString('base64')
      };

      const opts = {
        method: 'PUT',
        headers: {
          'Authorization': "token " + token
        },
        body: JSON.stringify(body),
      };

      return fetch(ref, opts);
    })
    .then(x => x.json());

};


module.exports = {getCmacc, getFiles, getUser, getCommit, saveCommit, getBranches, getBranch, createBranch};