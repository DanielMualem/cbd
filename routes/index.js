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



/* GET home page. */
router.get('/test', function(req, res, next) {
  res.render('users/test');
});

/* GET products page. */
router.get('/products', function(req, res, next) {
  Product.find(function(err, docs) {
    var productChunks = [];
    var chunkSize = 4;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('products', { title: 'Products', products: productChunks , type: 'all-products'});
  });
});

/* GET products page by category. */
router.get('/products/:category', function(req, res, next) {
  Product.find({"category": req.params.category}, function(err, docs) {
    var productChunks = [];
    var chunkSize = 4;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('products', { title: 'Products', products: productChunks, type: req.params.category });
  });
});

/* GET products page by category. */
router.post('/product/search', function(req, res, next) {
  Product.find({"name": {'$regex' : req.body.searchTxt, '$options' : 'i'}}, function(err, docs) {

    var productChunks = [];
    var chunkSize = 4;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('products', { title: 'Products', products: productChunks, searchQuery: req.body.searchTxt, itemsLen: docs.length});
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
  return res.redirect('/products');
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
  return res.render('shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice, coupon: req.session.cart.availableCoupon});
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
  var date = new Date();
  var strDate = date.toUTCString();
  var cart = new Cart(req.session.cart);
  var order = new Order({
    user: req.user,
    cart: cart,
    address: req.body.purchase_units[0].shipping.address,
    name: req.body.purchase_units[0].shipping.name,
    paymentId: req.body.id,
    date: strDate
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

      Product.updateMany(conditions, update, options, function (err, numAffected) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('/checkout');
        }
      });
    }
    req.flash('success', 'Successfully bought!');
    console.log(req.flash('success')[0]);
    req.session.cart = null;
    res.redirect('/');
  });
});


router.post('/cart/applycoupon', function(req, res, next) {
  var totalPrice = req.session.cart.totalPrice;
  console.log(req.session.cart.availableCoupon);
  if (req.body.coupon == 'nicecode' && req.session.cart.availableCoupon == 2) {
    totalPrice = 0.7 * totalPrice;
    req.session.cart.availableCoupon = 1;
  }
  req.session.cart.totalPrice = totalPrice;
  var cart = new Cart(req.session.cart);
  req.session.cart = cart;
  return res.render('shopping-cart', { products: cart.generateArray(), totalPrice: totalPrice, coupon: req.session.cart.availableCoupon});
});


module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/users/signin');
}
