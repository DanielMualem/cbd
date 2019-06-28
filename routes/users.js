var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var crypto = require('crypto');
var async = require('async');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');

var Cart = require('../models/cart');
var Order = require('../models/order');
var User = require('../models/user');
var Product = require('../models/product');
var Review = require('../models/review');


var csrfProtection = csrf();
router.use(csrfProtection);


// Profile
router.get('/profile', isLoggedIn, function(req, res, next) {
  Order.find({user: req.user},  function(err, orders) {
    if (err) {
      return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
    }
    //console.log(orders);
    orders = orders.reverse();
    var cart;
    orders.forEach(function(order) {
      cart = new Cart(order.cart);
      console.log(cart);
      order.items = cart.generateArray();
    });
    console.log(orders);
    res.render('users/profile', {orders: orders, user: req.user});
  });
});

router.get('/review-item', isLoggedIn, function(req, res, next) {
  Product.findOne({'sku': req.query.sku}, function(err, product) {
    if (err) {
      return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
    }
    console.log(product);
    res.render('product-review', {product: product, orderId: req.query.orderId, user: req.user, csrfToken: req.csrfToken()});
  });
});

router.post('/review-item', isLoggedIn, function(req, res, next) {
  Product.findOne({'sku': req.body.sku}, function(err, product) {
    if (err) {
      return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
    }
    var review = new Review({
      user: req.user,
      sku: product.sku,
      category: product.category,
      rating: req.body.rating,
      details: req.body.details
    });

    review.save(function(err, result) {
      if (err) {
        return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
      }
      Order.findOne({'_id': req.body.orderId}, function(err, order) {
        var carty = new Cart(order.cart);
        carty.items[req.body.sku].gotReview = true;
        order.cart = carty;
    
        order.save(function(err, result) {
          if (err) {
            return res.render('error', {errMsg: 'Something went wrong. Please repeat your steps.'});
          }
          return res.render('success', {errMsg: 'Thank you for your review!'});
        });
      });
    });
    
    //console.log(product);
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


router.get('/forgot', function(req, res) {
  var infoMsg = req.flash('info');
  var errMsg = req.flash('error');
  res.render('users/forgot-password', { csrfToken: req.csrfToken(),
    user: req.user, errMsg: errMsg, hasErrors: errMsg.length > 0, infoMsg: infoMsg, hasInfo: infoMsg.length > 0
  });
});



router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ 'email': req.body.email }, function(err, user) {
        if (!user) {
          console.log("not user");
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'amedicaoutlet@gmail.com',
          pass: '4m3dicaoutlet'
          }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@cbdhub.com',
        subject: 'CBDHub Account Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});


router.get('/reset/:token', function(req, res) {
  var errMsg = req.flash('error');
  User.findOne({ 'resetPasswordToken': req.params.token, 'resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
    res.render('users/reset-password', { csrfToken: req.csrfToken(),
      user: req.user, token: req.params.token, errMsg: errMsg, hasErrors: errMsg.length > 0
    });
  });
});


router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ 'resetPasswordToken': req.params.token, 'resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          console.log("errorrrr");
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        if (req.body.newPassword != req.body.reNewPassword) {
          req.flash('error', 'Passwords do not match!');
          return res.redirect('/users/reset/' + req.params.token);
        }

        user.password = user.encryptPassword(req.body.newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;


        user.save(function(err, result) {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'amedicaoutlet@gmail.com',
          pass: '4m3dicaoutlet'
          }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
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
