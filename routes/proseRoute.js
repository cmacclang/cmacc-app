const url = require('url');

const express = require('express');
const expressBodyParser = require('body-parser');

const githubServices = require('../services/githubServices');

const router = express.Router();

const cmacc = require('cmacc-compiler');

router.use('/prose/:user/:repo/:branch/*', (req, res, next) => {
  const context = {
    user: req.params.user,
    repo: req.params.repo,
    branch: req.params.branch || 'master',
    path: req.params[0],
    prop: req.query.prop,
    root: '/prose'
  };
  req.context = context;
  req.token = req.session['token'];
  next();
});

router.get('/prose/:user/:repo/:branch/*', (req, res) => {

  const token = req.session['token'];

  const branches = githubServices.getBranches(req.context, token);

  Promise.all([branches])
    .then(x => {
      const obj = {
        context: req.context,
        branches: x[0],
      };
      res.render('prose', obj);
    });
});

router.post('/prose/:user/:repo/:branch/*', expressBodyParser.json(), (req, res) => {

  const branch = req.body.branch;
  const message = req.body.message;

  if (message) {
    const token = req.session['token'];
    const context = req.context;

    const branchPromise = branch ? githubServices.createBranch(branch, context, token) : Promise.resolve();

    return branchPromise.then(() => {

      const done = req.body.files.map(x => {
        context.path = x.file.replace(`github:///${context.user}/${context.repo}/${context.branch}`, '');

        if(branch){
          context.branch = branch;
        }

        return githubServices.saveCommit(message + ' - ' + context.path, x.content, context, token)
      });

      return Promise.all(done)
         .then(() => res.send("SUCCESS"))
         .catch(e => {
           console.log(e);
           res.send(e);
         })
    })

  } else{
    res.send("NO CONTENT")
  }


});


module.exports = router;