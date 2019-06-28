var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  user: {type: Object, ref: 'User'},
  sku: {type: String, required: true},
  category: {type: String, required: true},
  rating: {type: Number, required: true},
  details: {type: String, required: false}
});

module.exports = mongoose.model('Review', schema);
