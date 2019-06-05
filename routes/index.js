var express = require('express');
var router = express.Router();

var Product = require('../models/product');
var Cart = require('../models/cart');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  var succMsg = req.flash('success')[0];
  res.render('index', { title: 'Index', succMsg: succMsg, noMessages: !succMsg});
});

/* GET products page. */
router.get('/products', function(req, res, next) {
  Product.find(function(err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('products', { title: 'Products', products: productChunks });
  });
});

router.get('/add-to-cart/:sku', function(req, res, next) {
  var productSKU = req.params.sku;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findOne({'sku': productSKU}, function(err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.sku);
    req.session.cart = cart;
    return res.redirect('/products');
  });
});

router.get('/reduce/:sku', function(req, res, next) {
  var productSKU = req.params.sku;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productSKU);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});


router.get('/remove/:sku', function(req, res, next) {
  var productSKU = req.params.sku;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productSKU);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
  if (!req.session.cart) {
    return res.render('shopping-cart', { products: null});
  }
  var cart = new Cart(req.session.cart);
  return res.render('shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice});
});


/* GET checkout page. */
router.get('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('checkout', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var order = new Order({
    user: req.user,
    cart: cart,
    address: req.body.purchase_units[0].shipping.address,
    name: req.body.purchase_units[0].shipping.name,
    paymentId: req.body.id
  });

  order.save(function(err, result) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }

    for (var sku in cart.items) {
      var conditions = { sku: sku };
      var update = { $inc: { quantity: -cart.items[sku].qty }};
      var options = { multi: true };

      Product.update(conditions, update, options, function (err, numAffected) {
        console.log(numAffected);
      });
    }

    req.flash('success', 'Successfully bought!');
    console.log(req.flash('success')[0]);
    req.session.cart = null;
    res.redirect('/');
  });
});


router.post('/test', isLoggedIn, function(req, res, next) {
  console.log(req.body.purchase_units[0].shipping);
  res.render('index');
});

//-----------------------------------------------------------------------------------------

router.post('/checkout2', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  const stripe = require('stripe')('sk_test_Ml47paQ9pCyCxJxKZakS1r4x00OnuY6YNS');
  const token = req.body.stripeToken;

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: 'usd',
    description: 'Example charge',
    source: token,
  }, function(err, charge) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });

    order.save(function(err, result) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/checkout');
      }
      req.flash('success', 'Successfully bought!');
      req.session.cart = null;
      res.redirect('/');
    });
  });
});


module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/users/signin');
}
