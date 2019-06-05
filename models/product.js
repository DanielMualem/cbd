var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  category: {type: String, required: true},
  name: {type: String, required: true},
  sku: {type: String, required: true},
  description: {type: String, required: true},
  imgPath: {type: String, required: true},
  price: {type: Number, required: true},
  quantity: {type: Number, required: true}
});

module.exports = mongoose.model('Product', schema);
