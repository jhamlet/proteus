
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
        var p, len, i
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
    
    propertySpec = _merge({writable: true}, openSpec);
    
    function _makeAccessor (obj, props) {
        var accessor = {
            extend: function (obj) {
                
            },
            
            property: function (name, val, spec) {
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
            },

            method: function (name, fn, spec) {
                spec = typeof fn !== "function" ? fn : spec;
                _defineProperty(obj, name, _merge({value: fn}, openSpec, spec));
            },

            getter: function (name, fn, spec) {
                spec = typeof fn !== "function" ? fn : spec;
                _defineProperty(
                    obj,
                    name,
                    _merge({get: fn}, openSpec, spec)
                );
            },

            setter: function (name, fn, spec) {
                    spec = typeof fn !== "function" ? fn : spec;
                    _defineProperty(
                        obj,
                        name,
                        _merge({set: fn}, openSpec, spec)
                    );
            },

            getset: function () {
                var len = arguments.length,
                    name = arguments[0],
                    getter, setter, spec
                ;

                switch (len) {
                    case 4:
                        getter = arguments[1];
                        setter = arguments[2];
                        spec = arguments[3];
                        break;
                    case 3:
                        getter = setter = arguments[1];
                        spec = arguments[2];
                        break;
                    case 2:
                        spec = arguments[1];
                        break;
                }

                spec = _merge(
                    getter || setter ? {get: getter, set: setter} : {},
                    openSpec,
                    spec
                );

                _defineProperty(name, spec);
            }
        };
        
        if (props) {
            _augment(accessor, props);
        }
        
        return accessor;
    }
    /**
     * 
     * @param proto {obj} description
     * @param fn {type} description
     * @returns {type}
     */
    function _createObject (proto, fn) {
        var obj, meta, P;
        
        if (!fn) {
            fn = proto;
            proto = OP;
        }
        
        meta = _makeAccessor(proto);
        
        obj = O.create(proto);
        P = _makeAccessor(obj, O.create(OP, {
            meta: {
                get: function () {
                    return meta;
                }
            }
        }));

        fn.call(P, meta, obj, proto);

        return obj;
    }

    _merge(exports, {
        create: _createObject,
        
        define: function (fn) {
            var Ctor = function () {
                    var initialize = arguments[0] !== _doNotInit,
                        init = this.init
                    ;
                    
                    if (initialize) {
                        if (init) {
                            init.apply(this, arguments);
                        }
                        
                        if (Ctor.initialize) {
                            Ctor.initialize.call(Ctor, arguments);
                        }
                    }
                }
            ;
            
            Ctor.constructor = Ctor;
            Ctor.extend = this.extend;
            return _createClass(Ctor, fn);
        },
        
        extend: function (obj, fn) {
            var Ctor, proto;
            
            if (arguments.length === 2 && typeof obj === "function") {
                // constructor
                return _createClass(new obj(_doNotInit), fn);
            }
            else if (arguments.length === 1 && typeof this === "function") {
                return _createClass(new this(_doNotInit), fn);
            }
            else if (arguments.length === 1 && typeof obj === "function") {
                // extend an object of Object.prototype
                return _createObject(fn);
            }
            
            return _createObject(obj, fn);
        }
    });
}(
    exports ? exports : (window.Protues = {})
));
