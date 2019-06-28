var register = function(Handlebars) {
    var helpers = {
    fixed: function(num) {
        return num.toFixed(2);
    },
    ifEqual: function(a, b) {
      return a==b;
    },
    len: function(products) {
      return products.length;
    },
    addNum: function(a, b) {
      return (a+b).toFixed(2);
    },
    discount: function(price, coupon) {
      if (coupon == 2) {
        return 0;
      }
      var old = ((10*price)/7).toFixed(2);
      return (old - price).toFixed(2);
    },
    oldPrice: function(price, coupon) {
      if (coupon == 2) {
        return price.toFixed(2);
      }
      return ((10*price)/7).toFixed(2);
    },
    arrToString: function(arr) {
      //console.log(arr);
      var str = "";
      for (var i = 0; i < arr.length; i++) {
        str += arr[i].item.name + '   x   ' + arr[i].qty.toString() + '        total: ' + (arr[i].price).toFixed(2).toString();
      }
      console.log(str);
      return str.toString();
    },
    arrToItems: function(arr) {
      //console.log(arr);
      var items = [];
      for (var i = 0; i < arr.length; i++) {
        var item = {};
        item.name = arr[i].item.name;
        item.unit_amount = {value: (arr[i].price).toFixed(2).toString(), currency_code: 'USD'};
        item.quantity = arr[i].qty.toString();
        item.sku = arr[i].item.sku;

        items.push(item);
      }
      console.log(items);
      return items;
    },
    isMobile: function(agent) {
      console.log(agent);
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent) ) {
        console.log('trueeeeee');
        return true;
        
      }
      console.log('falseeeee');
      return false;
    },
    revToProd: function(reviews, sku) {
      for (var i = 0; i < reviews.length; i++) {
        //console.log(reviews[i]._id + sku);
        if (reviews[i]._id == sku) {
          return reviews[i].avgRating;
        }

      }
      return 0;
    },
    numOfReviews: function(reviews, sku) {
      for (var i = 0; i < reviews.length; i++) {
        //console.log(reviews[i]._id + sku);
        if (reviews[i]._id == sku) {
          return reviews[i].count;
        }

      }
      return 0;
    }
};

if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (var prop in helpers) {
        Handlebars.registerHelper(prop, helpers[prop]);
    }
} else {
    return helpers;
}

};

module.exports.register = register;
module.exports.helpers = register(null);
