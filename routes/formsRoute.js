const url = require('url');
const express = require('express');

const cmacc = require('cmacc-compiler');

const expressBodyParser = require('body-parser');

const cmaccCompiler = require('cmacc-compiler');
const formioServices = require('../services/formioService');

const router = express.Router();

router.use(expressBodyParser.urlencoded({extended: false}));

router.get('/formio/builder', (req, res) => {
  const obj = {};
  obj.context = req.context;

  res.render('formio', obj);
});

router.get('/formio/cmacc-escrow/:id', (req, res) => {
  const id = req.params.id;

  const token = req.session['token'];

  const context = {
    user: 'cmacclang',
    repo: 'cmacc-example-escrow',
    branch: 'master',
    path: 'Escrow.cmacc',
    format: 'ast'
  };

  formioServices.findEscrow(id)
    .then(data => {

      const doc = `$ doc = [github:///cmacclang/cmacc-example-escrow/master/Escrow.cmacc]

$ doc.seller = ${data.data.seller.data.value}
$ doc.purchaser = ${data.data.purchaser.data.value}
$ doc.escrow = ${data.data.escrow.data.value}
$ doc.arbitrator = ${data.data.arbitrator.data.value}
$ doc.shipper = ${data.data.shipper.data.value}


$ doc.product_Description = "${data.data.productDescription}"
$ doc.price_USD = "${data.data.priceUsd}"
$ doc.pickup_Time_Max = "${data.data.pickupTimeMax}"
$ doc.delivery_Claim_Delay = "${data.data.deliveryClaimDelay}"
$ doc.delivery_Payment_TimeSpan = "${data.data.deliveryPaymentTimeSpan}"
$ doc.escrow_Fee_USD = "${data.data.escrowFeeUsd}"
$ doc.escrow_Sign_YMD = "${data.data.escrowSignYMD}"
$ doc.escrow_Effective_YMD = "${data.data.escrowEffectiveYMD}"
$ doc.arb_Fee_USD = "${data.data.arbFeeUsd}"
$ doc.dispute_Notice_Within_Days = "${data.data.disputeNoticeWithinDays}"
$ doc.arb_Seat_City = "${data.data.arbSeatCity}"
$ doc.arb_Org = "${data.data.arbOrg}"
$ doc.arb_Court_CountyState = "${data.data.arbCourtCountyState}"

{{doc}}
`;

      return cmaccCompiler.compile(doc)
    })
    .then(ast => {
      return cmaccCompiler.render(ast);
    })
    .then(md => {
      return cmaccCompiler.remarkable.render(md)
    })
    .then(html => {
      res.send(html)
    })
    .catch(e =>
      res.send(e.message)
    )
});

module.exports = router;