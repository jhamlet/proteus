
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
    
    /**
     * @param receiver {object}
     * @param arg2..argN-1 {object} list of suppliers
     * @param argN {boolean} optional, overwrite, defaults to true
     * @returns {object} the receiver modified by supplier
     */
    function merge (receiver /*, arg2..argN, overwrite */) {
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
    
    function isSpecLike (obj) {
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
    
    function defineProperty (obj, name, spec) {
        O.defineProperty(obj, name, spec);
    }
    
    function defineProperties (obj, spec) {
        O.defineProperties(obj, spec);
    }
    
    propertySpec = merge({writable: true}, openSpec);
    
    function wrap (obj, props) {
        var 
        
        accessor = {

            extend: function (props) {
                var key, val;
                
                for (key in props) {
                    val = props[key];
                    if (!(val instanceof Array) &&
                        typeof val === "object" &&
                        isSpecLike(val)
                    ) {
                        defineProperty(obj, key, val);
                    }
                    else {
                        obj[key] = props[key];
                    }
                }
            },
            
            property: function (name, val, spec) {
                if (!spec && !val instanceof Array &&
                    typeof val === "object" && isSpecLike(val)
                ) {
                    spec = val;
                    val = undefined;
                }
                defineProperty(
                    obj,
                    name,
                    merge({value: val}, propertySpec, spec)
                );
            },

            method: function (name, fn, spec) {
                spec = typeof fn !== "function" ? fn : spec;
                defineProperty(obj, name, merge({value: fn}, openSpec, spec));
            },

            getter: function (name, fn, spec) {
                spec = typeof fn !== "function" ? fn : spec;
                defineProperty(
                    obj,
                    name,
                    merge({get: fn}, openSpec, spec)
                );
            },

            setter: function (name, fn, spec) {
                    spec = typeof fn !== "function" ? fn : spec;
                    defineProperty(
                        obj,
                        name,
                        merge({set: fn}, openSpec, spec)
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
                        getter = arguments[1];
                        if (typeof arguments[2] === "function") {
                            setter = arguments[2];
                        }
                        else {
                            setter = arguments[1];
                            spec = arguments[2];
                        }
                        break;
                    case 2:
                        if (typeof arguments[1] === "function") {
                            getter = setter = arguments[1];
                        }
                        else {
                            spec = arguments[1];
                        }
                        break;
                }

                spec = merge(
                    getter || setter ? {get: getter, set: setter} : {},
                    openSpec,
                    spec
                );
                
                defineProperty(obj, name, spec);
            }
        };
        
        if (props) {
            defineProperties(accessor, props);
        }
        
        return accessor;
    }
    
    function extend (proto, fn) {
        var meta    = wrap(proto),
            isCtor  = typeof proto === "function",
            obj     = isCtor ? new proto(_doNotInit) : O.create(proto),
            Proteus
        ;
        
        Proteus = wrap(obj, {
            meta: {
                get: function () {
                    return meta;
                }
            },
            _super: {
                get: isCtor ?
                    function () {
                        return proto.prototype;
                    } :
                    function () {
                        return proto;
                    }
            }
        });
        
        fn.call(Proteus, meta, Proteus, Proteus._super);
        
        return isCtor ? proto : obj;
    }
    
    function _extend (proto, fn) {
        var obj, ret, isCtor;
        
        if (arguments.length === 2 && typeof proto === "function") {
            // constructor
            obj = proto;
            isCtor = true;
        }
        else if (arguments.length === 1 && typeof this === "function") {
            obj = this;
            fn = proto;
            isCtor = true;
        }
        else if (arguments.length === 1 && typeof proto === "function") {
            // extend an object of Object.prototype
            fn = proto;
            obj = OP;
        }
        else {
            obj = proto;
        }

        ret = extend(obj, fn);
        
        if (isCtor) {
            ret.prototype = ret;
            ret.constructor = proto;
            ret.extend = _extend;
        }
        
        if (obj !== OP && proto.extended) {
            proto.extended(obj);
        }

        return ret;
    }

    merge(exports, {
        create: function (obj, fn) {
            if (!fn) {
                fn = obj;
                obj = OP;
            }
            
            return extend(obj, fn);
        },
        
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
            };
            
            Ctor.constructor = Ctor;
            Ctor.extend = _extend;
            
            return extend(Ctor, fn);
        },
        
        extend: _extend
    });
}(
    exports ? exports : (window.Proteus = {})
));
