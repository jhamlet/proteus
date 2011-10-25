
var should = require("should"),
    O   = Object,
    OP  = O.prototype;
    
O._defineProperty = O.defineProperty;
O.defineProperty = function () {
    console.log(arguments[0]);
    O._defineProperty.apply(O, arguments);
};

O._defineProperties = O.defineProperties;
O.defineProperties = function () {
    console.log("define properties");
    O._defineProperties.apply(O, arguments);
};

O._create = O.create;
O.create = function () {
    console.log("create");
    O.create.apply(O, arguments);
};

module.exports = {
    "one": function () {
        var obj = {
            property: "value"
        };
    }
}