const url = require('url');
const express = require('express');

const expressBodyParser = require('body-parser');

const githubServices = require('../services/githubServices');
const remarkable = require('cmacc-compiler').remarkable;

const router = express.Router();

router.use(expressBodyParser.urlencoded({extended: false}));

router.use('/:user/:repo/:branch/*', (req, res, next) => {
  const context = {
    user: req.params.user,
    repo: req.params.repo,
    branch: req.params.branch || 'master',
    path: req.params[0],
    format: req.query.format || 'source',
    prop: req.query.prop,
  };
  req.context = context;
  req.token = req.session['token'];
  next();
});

router.get('/:user/:repo/:branch/*', (req, res) => {

  const token = req.session['token'];

  const obj = {
    active: {
      source: req.context.format === 'source',
      ast: req.context.format === 'ast',
      html: req.context.format === 'html',
      edit: req.context.format === 'edit',
      group: req.context.format === 'group',
    }
  }

  const cmacc = githubServices.getCmacc(req.context, token);
  const user = githubServices.getUser(token);
  const commit = githubServices.getCommit(req.context, token);
  const branches = githubServices.getBranches(req.context, token);

  Promise.all([cmacc, user, branches, commit]).then(x => {

    obj.context = req.context;
    obj.user = x[1];
    obj.branches = x[2];
    obj.commit = x[3];

    if (req.context.format === 'html') {
      obj.content = x[0];
      res.render('cmacc', obj);
    }

    if (req.context.format === 'source') {
      obj.source = true;
      obj.content = x[0].replace(/\[(.*)\]/g, (res, link) => {
        const target = url.resolve(req.path, link)
        return `<a href="${target}">${res}</a>`
      });
      res.render('cmacc', obj);
    }

    if (req.context.format === 'ast') {
      obj.source = true;
      obj.content = JSON.stringify(x[0], null, 2);
      res.render('cmacc', obj);
    }

    if (req.context.format === 'group') {
      const openTags = [
        'heading_open',
        'paragraph_open',
        'ordered_list_open',
      ];

      var groups = x[0].reduce((acc, cur) => {
        if (openTags.indexOf(cur.type) >= 0) {
          acc.push([cur])
        } else {
          acc[(acc.length - 1)].push(cur)
        }
        return acc;
      }, []);

      obj.content = groups
        .map((md) => {
          const res = remarkable.render(md)
          return res;
        }).reduce((acc, cur) => {
          acc += `<div class="block">${cur}</div>`
          return acc
        }, "");
      res.render('group', obj);
    }

    if (req.context.format === 'edit') {
      obj.content = x[0];
      res.render('edit', obj);
    }

  }).catch(x => console.log(x))

});

router.post('/:user/:repo/:branch/*', (req, res) => {
  githubServices.saveCommit(req.body.message, req.body.content, req.context, req.token)
    .then((x) => {
      console.log('res', x)
      res.redirect(req.path)
    })
});

module.exports = router;