module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;
  this.availableCoupon = oldCart.availableCoupon == 1 ? 1 : 2;

  this.add = function(item, sku) {
    var storedItem = this.items[sku];
    if (!storedItem) {
      storedItem = this.items[sku] = {item: item, qty: 0, price: 0};
    }
    var flag = 1;
    //var tempPrice = storedItem.item.price;
    storedItem.qty++;
    this.totalQty++;
    storedItem.price = storedItem.item.price * storedItem.qty;
    if (this.availableCoupon == 1) {
      //this.items[sku].price = this.items[sku].price + (0.7 * this.items[sku].item.price);
      this.totalPrice = this.totalPrice + (0.7 * this.items[sku].item.price);
    } else {

      this.totalPrice += storedItem.item.price;
    }
  };

  this.reduceByOne = function(sku) {
    this.items[sku].qty--;
    this.totalQty--;
    this.items[sku].price -= this.items[sku].item.price;
    if (this.availableCoupon == 1) {
      this.totalPrice = this.totalPrice - (0.7 * this.items[sku].item.price);
    } else {
      this.totalPrice -= this.items[sku].item.price;
    }


    if (this.items[sku].qty <= 0) {
      delete this.items[sku];
    }
  };

  this.removeItem = function(sku) {
    this.totalQty -= this.items[sku].qty;
    if (this.availableCoupon == 1) {
      this.totalPrice = this.totalPrice - (0.7 * this.items[sku].price);
    } else {
      this.totalPrice -= this.items[sku].price;
    }
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
