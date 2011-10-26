
(function (exports) {
    
    var _doNotInit  = {},
        O           = Object,
        OP          = O.prototype,
        hasOwnProp  = OP.hasOwnProperty,
        propertySpecKeys = [
            "value", "get", "set", "writable", "enumerable", "configurable"
        ],
        openSpec   = {
            enumerable: true,
            configurable: true
        },
        propertySpec,
        Proteus
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
            hasOwn = hasOwnProp,
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
        var O = O,
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
            hasOwn = hasOwnProp,
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
    
    function _defineProperty (obj, name, spec) {
        O.defineProperty(obj, name, spec);
    }
        
    /**
     * 
     * @param proto {obj} description
     * @param fn {type} description
     * @returns {type}
     */
    function _createObj (proto, fn) {
        var obj, P;
        
        if (!fn) {
            fn = obj;
            obj = OP;
        }
        
        obj = O.create(OP);
        P = O.create(Proteus, {
            proto: {value: obj},
            _super: {value: O.create(proto)}
        });

        fn.call(P, P.meta, P._super);

        return obj;
    }

    propertySpec = _merge({writable: true}, openSpec);
    
    function _property (obj, name, val, spec) {
        if (!spec && !val instanceof Array &&
            typeof val === "object" && _isSpecLike(val)
        ) {
            spec = val;
            val = undefined;
        }
        _defineProperty(
            obj,
            name,
            _merge({value: val}, propertySpec, spec)
        );
    }

    function _method (obj, name, fn, spec) {
        spec = typeof fn !== "function" ? fn : spec;
        _defineProperty(obj, name, _merge({value: fn}, openSpec, spec));
    }
        
    function _getter (obj, name, fn, spec) {
        spec = typeof fn !== "function" ? fn : spec;
        _defineProperty(
            obj,
            name,
            _merge({get: fn}, openSpec, spec)
        );
    }
        
    function _setter (obj, name, fn, spec) {
            spec = typeof fn !== "function" ? fn : spec;
            _defineProperty(
                obj,
                name,
                _merge({set: fn}, openSpec, spec)
            );
    }
        
    function _getset () {
        var len = arguments.length,
            name = arguments[1],
            getter, setter, spec
        ;
            
        switch (len) {
            case 4:
                getter = arguments[2];
                setter = arguments[3];
                spec = arguments[4];
                break;
            case 3:
                getter = setter = arguments[2];
                spec = arguments[3];
                break;
            case 2:
                spec = arguments[2];
                break;
        }
        
        spec = _merge(
            getter || setter ? {get: getter, set: setter} : {},
            openSpec,
            spec
        );

        _defineProperty(arguments[0], name, spec);
    }
        
    _merge(exports, {
        create: _createObj,
        
        define: function () {
            
        },
        
        extend: function (obj, fn) {
            
        }
    });
}(
    exports ? exports : (window.Protues = {})
));
