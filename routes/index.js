var express = require('express');
var router = express.Router();

var Product = require('../models/product');
var Cart = require('../models/cart');
var Order = require('../models/order');
var Review = require('../models/review');

/* GET home page. */
router.get('/', function(req, res, next) {
  var succMsg = req.flash('success')[0];

  Product.find({}).sort({'sold': -1}).limit(3).exec(function(err, items) {
    console.log(items);

    res.render('index', { title: 'Index', succMsg: succMsg, noMessages: !succMsg, best: items});
  });


});



/* GET home page. */
router.get('/products/product-details/:sku', function(req, res, next) {
  Product.findOne({'sku': req.params.sku}, function(err, product) {
    if (err) {
      return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
    }
    Review.find({'sku': req.params.sku}, function(err, reviews) {
      if (err) {
        return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
      }
      res.render('product-details', { title: 'Product Details', product: product, reviews: reviews});
    });
    
  });
});


/* GET products page. */
router.get('/products', function(req, res, next) {
  console.log(req.session);
  Product.find(null, null, {sort: { 'category': 'asc' }},function(err, docs) {
    var productChunks = [];
    var chunkSize = 4;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }

    Review.aggregate(
      [
        {
          $group:
            {
              _id: "$sku",
              avgRating: { $avg: "$rating" },
              count: {$sum: 1}
            }
        }
      ]
   ).exec(function(err, reviews) {
      if (err) {
        return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
      } else {
        //console.log(reviews);
        res.render('products', { title: 'Products', products: productChunks , type: 'all-products', avgReviews: reviews});
      }
    });
  });
});

/* GET products page by category. */
router.get('/products/:category', function(req, res, next) {
  Product.find({"category": req.params.category}, null, {sort: { 'name': 'asc' }}, function(err, docs) {
    if (err) {
      return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
    }

    var productChunks = [];
    var chunkSize = 4;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }

    Review.aggregate(
      [
        {
          $match: {category: req.params.category}
        },
        {
          $group:
            {
              _id: "$sku",
              avgRating: { $avg: "$rating" },
              count: {$sum: 1}
            }
        }
      ]
   ).exec(function(err, reviews) {
      if (err) {
        return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
      } else {
        //console.log(reviews);
        res.render('products', { title: 'Products', products: productChunks , type: 'all-products', avgReviews: reviews});
      }
    });

    //res.render('products', { title: 'Products', products: productChunks, type: req.params.category });
  });
});

/* GET products page by category. */
router.post('/product/search', function(req, res, next) {
  Product.find({"name": {'$regex' : req.body.searchTxt, '$options' : 'i'}}, null, {sort: { 'category': 'asc' }}, function(err, docs) {

    if (err) {
      return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
    }

    var productChunks = [];
    var chunkSize = 4;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }

    Review.aggregate(
      [
        {
          $group:
            {
              _id: "$sku",
              avgRating: { $avg: "$rating" },
              count: {$sum: 1}
            }
        }
      ]
   ).exec(function(err, reviews) {
      if (err) {
        return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
      } else {
        //console.log(reviews);
        res.render('products', { title: 'Products', products: productChunks, searchQuery: req.body.searchTxt, itemsLen: docs.length, avgReviews: reviews});

      }
    });
  });
});



router.get('/add-to-cart/:sku', function(req, res, next) {
  var productSKU = req.params.sku;
  console.log(productSKU);
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findOne({'sku': productSKU}, function(err, product) {
    if (err) {
        return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
    }
    if (!product) {
      return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
  }
    //console.log(product);
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
  return res.render('shopping-cart', { title: 'Shopping Cart', products: cart.generateArray(), totalPrice: cart.totalPrice, coupon: req.session.cart.availableCoupon});
});


/* GET checkout page. */
router.get('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('checkout', { title: 'Shopping Cart', total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var date = new Date();
  var strDate = date.toUTCString();
  var cart = new Cart(req.session.cart);

  for (var sku in cart.items) {
    cart.items[sku].gotReview = false;
    //console.log(cart.items[sku]);
  }

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
  return res.render('shopping-cart', { title: 'Shopping Cart', products: cart.generateArray(), totalPrice: totalPrice, coupon: req.session.cart.availableCoupon});
});

router.get('/success-buy', function(req, res, next) {
  return res.render('success', { title: 'Successful Purchase', succMsg: "Order successfully approved."});
});


module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/users/signin');
}
