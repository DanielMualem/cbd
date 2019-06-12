var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var Cart = require('../models/cart');
var Order = require('../models/order');


var csrfProtection = csrf();
router.use(csrfProtection);


// Profile
router.get('/profile', isLoggedIn, function(req, res, next) {
  Order.find({user: req.user}, function(err, orders) {
    if (err) {
      return res.write('Error');
    }
    var cart;
    orders.forEach(function(order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    //console.log(orders);
    res.render('users/profile', {orders: orders});
  });

});

// Logout
router.get('/logout', isLoggedIn, function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.use('/', isNotLoggedIn, function(req, res, next) {
  next();
});

// Sign In
router.get('/signin', function(req, res, next) {
  var messages = req.flash('error');
  res.render('users/signin', { csrfToken: req.csrfToken(),
    messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/users/signin',
  failureFlash: true
}), function(req, res, next) {
  if (req.session.oldUrl) {
    var temp = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(temp);
  } else {
    res.redirect('/');
  }
});

// Sign Up
router.get('/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('users/signup', { csrfToken: req.csrfToken(),
    messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/users/signup',
  failureFlash: true
}), function(req, res, next) {
  if (req.session.oldUrl) {
    var temp = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(temp);
  } else {
    res.redirect('/');
  }
});


module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/signin');
}

function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/signin');
}
