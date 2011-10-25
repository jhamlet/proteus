
(function (exports) {
    
    var _doNotInit  = {},
        OBJ         = Object,
        OBJ_PROTO   = OBJ.prototype,
        hasOwnProp  = OBJ_PROTO.hasOwnProperty,
        propertySpecKeys = [
            "value", "get", "set", "writable", "enumerable", "configurable"
        ],
        plainSpec   = {
            enumerable: true,
            writable: true,
            configurable: true
        },
        Maker
    ;
    
    function _slice () {
        var o = arguments[0] ? arguments[0] : 0;
        return Array.prototye.slice.call(arguments, o);
    }
    
    /**
     * @param receiver {object}
     * @param arg2..argN-1 {object} list of suppliers
     * @param argN {boolean} optional, overwrite, defaults to true
     * @returns {object} the receiver modified by supplier
     */
    function _merge (receiver /*, arg2..argN, overwrite */) {
        var len = arguments.length,
            hasOwn = hasOwnProperty,
            overwrite = true,
            supplier,
            i, prop
        ;
        
        if (len > 2 && typeof arguments[len-1] === "boolean") {
            len -= 1;
            overwrite = arguments[len];
        }
        
        for (i = 1; i < len; i++) {
            supplier = arguments[i];
            for (prop in supplier) {
                if (hasOwn.call(supplier, prop) &&
                    (!hasOwn.call(receiver, prop) || overwrite)
                ) {
                    receiver[prop] = supplier[prop];
                }
            }
        }
        
        return receiver;
    }
    
    function _augment (r, s) {
        var O = OBJ,
            p, len, i
        ;
        
        p = O.getOwnPropertyNames(s);
        len = p.length;
        i = 0;
        
        for (; i < len; i++) {
            O.defineProperty(r, p, O.getOwnPropertyDescriptor(s, p[i]));
        }
        
        return r;
    }
    
    function _isSpecLike (obj) {
        var list = propertySpecKeys,
            i = list.length,
            hasOwn = hasOwnProperty,
            count = 0
        ;
        
        while (i--) {
            if (hasOwn.call(obj, list[i])) {
                // configurable, writable, enumerable => definitely a spec
                if (i > 2) {
                    return true;
                }
                // value, get, set => hard to tell
                else {
                    count += 1;
                }
            }
        }
        
        return count;
    }
    
    function _spec (obj) {
        return _merge({}, plainSpec, obj);
    }
    
    function _defineProperty (obj, name, spec) {
        OBJ.defineProperty(obj, name, _spec(spec));
    }
        
    function _resetMaker () {
        delete Maker.klass;
        delete Maker.proto;
        delete Maker._super;
    }
    
    function _compose (fn) {
        fn.call(Maker, Maker);
    }
    
    function _specify (obj) {
        var hasOwn = hasOwnProperty,
            key, args;
        
        for (key in obj) {
            if (hasOwn.call(obj, key)) {
                Maker[key].apply(Maker, obj[key]);
            }
        }
    }
    /**
     * 
     * @param obj {obje} description
     * @param fn {type} description
     * @returns {type}
     */
    function _createObj (obj, fn) {
        var twoargs = arguments.length === 2;
        
        _resetMaker();
        
        if (twoargs) {
            Maker.proto = OBJ.create(obj);
            if (typeof fn === "function") {
                _compose(fn);
            }
            else {
                _specify(obj);
            }
        }
        else {
            Maker.proto = OBJ.create(OBJ_PROTO);
            if (typeof obj === "function") {
                _compose(fn);
            }
            else {
                _specify(obj);
            }
        }
        
        return Maker.proto;
    }
    
    Maker = {
        get klass () {
        },
        
        property: function (prop) {
            var arglen = arguments.length,
                spec = _spec(),
                val;
            
            if (arglen === 2) {
                val = arguments[1];
                if (_isSpecLike(val)) {
                    spec = val;
                    val = null;
                }
            }
            else if (arglen === 1) {
                spec = _spec();
            }
            
            console.log("define property: " + prop, spec);
            _defineProperty(this.proto, prop, spec);
        },
        
        method: function () {
            console.log("Make method");
        },
        
        getter: function () {
            console.log("Make getter");
        },
        
        setter: function () {
            console.log("Make setter");
        },
        
        getset: function () {
            console.log("Make getter & setter");
        }
    };
    
    _merge(exports, {
        create: function (obj, fn) {
            return _createObj(obj, fn);
        },
        
        define: function () {
            
        },
        
        extend: function () {
            
        }
    });
}(
    exports ? exports : (window.Protues = {})
));
