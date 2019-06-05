module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;

  this.add = function(item, sku) {
    var storedItem = this.items[sku];
    if (!storedItem) {
      storedItem = this.items[sku] = {item: item, qty: 0, price: 0};
    }
    storedItem.qty++;
    storedItem.price = storedItem.item.price * storedItem.qty;
    this.totalQty++;
    this.totalPrice += storedItem.item.price;
  };

  this.reduceByOne = function(sku) {
    this.items[sku].qty--;
    this.items[sku].price -= this.items[sku].item.price;
    this.totalQty--;
    this.totalPrice -= this.items[sku].item.price;

    if (this.items[sku].qty <= 0) {
      delete this.items[sku];
    }
  };

  this.removeItem = function(sku) {
    this.totalQty -= this.items[sku].qty;
    this.totalPrice -= this.items[sku].price;
    delete this.items[sku];
  }

  this.generateArray = function() {
    var arr = [];
    for (var sku in this.items) {
      arr.push(this.items[sku]);
    }
    return arr;
  };
};
