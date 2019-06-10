var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop').then(() => {
    console.log("Connected to Database");
}).catch((err) => {
    console.log("Not Connected to Database ERROR! \n", err);
});

var products = [
  new Product({
    category: 'Vegan',
    name: 'ORGANIC GUMMY BEARS (VEGAN) 750MG',
    sku: '00000',
    description: 'ORGANIC GUMMY BEARS (VEGAN) 750MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/sunstate_750mg-bears-no-lid-(2).jpg',
    price: 41.99,
    quantity: 50
  }),
  new Product({
    category: 'Vegan',
    name: 'ORGANIC GUMMY WORMS (VEGAN) 750MG',
    sku: '00001',
    description: 'ORGANIC GUMMY WORMS (VEGAN) 750MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/sunstate_750mg-worms-no-lid-(2).jpg',
    price: 41.99,
    quantity: 50
  }),
  new Product({
    category: 'Vegan',
    name: 'ORGANIC GUMMY FRUIT SLICES (VEGAN) 750MG',
    sku: '00002',
    description: 'ORGANIC GUMMY FRUIT SLICES (VEGAN) 750MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/vegan-web_1500mg-fruit-slices-no-lid-zoom.png',
    price: 71.99,
    quantity: 50
  }),
  new Product({
    category: 'Edibles',
    name: 'FULL SPECTRUM GUMMY WORMS 750MG',
    sku: '00003',
    description: 'FULL SPECTRUM GUMMY WORMS 750MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/full-spectrum-worms-zoom.jpg',
    price: 32.99,
    quantity: 50
  }),
  new Product({
    category: 'Edibles',
    name: 'FULL SPECTRUM GUMMY PEACH RINGS 750MG',
    sku: '00004',
    description: 'FULL SPECTRUM GUMMY PEACH RINGS 750MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/full-spectrum-peach-rings-zoom.jpg',
    price: 32.99,
    quantity: 50
  }),
  new Product({
    category: 'Edibles',
    name: 'GUMMY BEARS 180MG - 12 COUNT BAG',
    sku: '00005',
    description: 'GUMMY BEARS 180MG - 12 COUNT BAG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/bag-(1).jpg',
    price: 12.99,
    quantity: 50
  }),
  new Product({
    category: 'Tincture',
    name: 'TINCTURE HEMP SEED OIL 150MG',
    sku: '00006',
    description: 'TINCTURE HEMP SEED OIL 150MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/hemp-oils-150-zoom.png',
    price: 17.99,
    quantity: 50
  }),
  new Product({
    category: 'Tincture',
    name: 'TINCTURE HEMP SEED OIL 1000MG',
    sku: '00007',
    description: 'TINCTURE HEMP SEED OIL 1000MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/hempseed-oil-1000-zoom.jpeg',
    price: 99.99,
    quantity: 50
  }),
  new Product({
    category: 'Pet-care',
    name: 'PET CAT TREATS SEAFOOD MIX 100MG',
    sku: '00008',
    description: 'PET CAT TREATS SEAFOOD MIX 100MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/pet-treats-05.jpg',
    price: 29.99,
    quantity: 50
  }),
  new Product({
    category: 'Pet-care',
    name: 'PET TREATS STEAK 100MG',
    sku: '00009',
    description: 'PET TREATS STEAK 100MG',
    imgPath: 'https://www.sunstatehemp.com/templates/themes/frontend/standard/images/product/retry-02.jpg',
    price: 71.99,
    quantity: 50
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
