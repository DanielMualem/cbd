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
