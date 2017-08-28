const url = require('url');
const express = require('express');

const expressBodyParser = require('body-parser');

const githubServices = require('../services/githubServices');

const router = express.Router();

const definitions = [
  'Agreement',
  'ConfidentialInfoIncluded',
  'ConfidentialInfoType',
  'ConfidentialInformation',
  'ConfidentialityEngagement',
  'Deliverable',
  'DisclosingParty',
  'EffectiveDate',
  'Entity',
  'ForceMajeureAffectedParty',
  'ForceMajeureCreditorParty',
  'ForceMajeureEvent',
  'LegalProceeding',
  'P1',
  'P2',
  'PO',
  'Parties',
  'Party',
  'Person',
  'PreexistingIP',
  'Purpose',
  'ReceivingParty',
  'SOW',
  'Service',
  'Transclude',
  'Tribunal',
  'WorkProduct',
];

router.use(expressBodyParser.urlencoded({extended: false}));

router.get('/definitions', (req, res) => {

  const token = req.session['token'];

  const user = githubServices.getUser(token);

  const definitionsUS = githubServices.getFiles('cmacclang', 'cmacc-lib-definitions', 'US', token);
  const definitionsFR = githubServices.getFiles('cmacclang', 'cmacc-lib-definitions', 'FR', token);
  const definitionsNL = githubServices.getFiles('cmacclang', 'cmacc-lib-definitions', 'NL', token);

  Promise.all([user, definitionsUS, definitionsFR, definitionsNL]).then(x => {

    const def = definitions.map(definition =>  {
      return {
        'name' : definition,
        'us': x[1].filter(y => y.name === definition + '.cmacc').map(x => 'x'),
        'fr': x[2].filter(y => y.name === definition + '.cmacc').map(x => 'x'),
        'nl': x[3].filter(y => y.name === definition + '.cmacc').map(x => 'x')
      }
    });

    const obj = {};
    obj.context = req.context;
    obj.user = x[0];
    obj.definitions = def;

    res.render('definitions', obj);

  });

});

router.get('/definitions/edit/:definition/:from/:to', (req, res) => {

  const token = req.session['token'];

  const context = {
    definition: req.params.definition,
    from: req.params.from,
    to: req.params.to,
  };

  const user = githubServices.getUser(token);
  const fromPath = context.from.toUpperCase() + '/' + context.definition + '.cmacc';
  const toPath = context.to.toUpperCase() + '/' + context.definition + '.cmacc';
  const definitionsFrom = githubServices.getFiles('cmacclang', 'cmacc-lib-definitions', fromPath, token);
  const definitionsTo = githubServices.getFiles('cmacclang', 'cmacc-lib-definitions', toPath, token);


  Promise.all([user, definitionsFrom, definitionsTo]).then(x => {

    const obj = {};
    obj.definition = context.definition;
    obj.user = x[0];
    obj.from = new Buffer(x[1].content, 'base64');

    if(x[2]){
      obj.to = new Buffer(x[2].content, 'base64');
    }

    res.render('definitions_edit', obj);

  })

});

module.exports = router;