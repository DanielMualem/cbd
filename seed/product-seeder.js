var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop').then(() => {
    console.log("Connected to Database");
}).catch((err) => {
    console.log("Not Connected to Database ERROR! \n", err);
});

var products = [
  new Product({
    category: 'Oil',
    name: 'Amenzia',
    sku: '11112',
    description: 'blabla bla',
    imgPath: 'https://images-na.ssl-images-amazon.com/images/I/81bStvgj%2BaL._SY355_.jpg',
    price: 30,
    quantity: 40
  }),
  new Product({
    category: 'Oil',
    name: 'WW',
    sku: '11113',
    description: 'blabla bla',
    imgPath: 'https://images-na.ssl-images-amazon.com/images/I/81bStvgj%2BaL._SY355_.jpg',
    price: 20,
    quantity: 40
  }),
  new Product({
    category: 'Edibles',
    name: 'Gummy Bears',
    sku: '11111',
    description: 'blabla bla',
    imgPath: 'https://images-na.ssl-images-amazon.com/images/I/81bStvgj%2BaL._SY355_.jpg',
    price: 23,
    quantity: 40
  })
];

var done = 0;

for (var i = 0; i < products.length; i++) {
  products[i].save(function(err, result) {
    done++;
    if (done == products.length) {
      exit();
    }
  });
}

function exit() {
  mongoose.disconnect();
}
