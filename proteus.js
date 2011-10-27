
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
    
    function _extend (subject, props) {
        var specLike = isSpecLike, // reduce scope lookup
            key, val
        ;
    
        for (key in props) {
            val = props[key];
            if (!(val instanceof Array) &&
                typeof val === "object" &&
                specLike(val)
            ) {
                defineProperty(subject, key, val);
            }
            else {
                subject[key] = props[key];
            }
        }
    }
    
    propertySpec = merge({writable: true}, openSpec);

    function _property (subject, name, val, spec) {
        if (!spec && !val instanceof Array &&
            typeof val === "object" && isSpecLike(val)
        ) {
            spec = val;
            val = undefined;
        }

        defineProperty(
            subject,
            name,
            merge({value: val}, propertySpec, spec)
        );
    }

    function _method (subject, name, fn, spec) {
        spec = !fn.constructor ? fn : spec;
        defineProperty(subject, name, merge({value: fn}, openSpec, spec));
    }

    function _getter (subject, name, fn, spec) {
        spec = !fn.constructor ? fn : spec;
        defineProperty(
            subject,
            name,
            merge({get: fn}, openSpec, spec)
        );
    }

    function _setter (subject, name, fn, spec) {
            spec = fn.constructor ? fn : spec;
            defineProperty(
                subject,
                name,
                merge({set: fn}, openSpec, spec)
            );
    }

    function _getset (/*subject, name, get, set, spec*/) {
        var len     = arguments.length,
            subject = arguments[0],
            name    = arguments[1],
            getter, setter, spec
        ;

        switch (len) {
            case 5:
                getter = arguments[2];
                setter = arguments[3];
                spec = arguments[4];
                break;
            case 4:
                getter = arguments[2];
                if (typeof arguments[3] === "function") {
                    setter = arguments[3];
                }
                else {
                    setter = arguments[2];
                    spec = arguments[3];
                }
                break;
            case 3:
                if (typeof arguments[2] === "function") {
                    getter = setter = arguments[2];
                }
                else {
                    spec = arguments[2];
                }
                break;
        }

        spec = merge(
            getter || setter ? {get: getter, set: setter} : {},
            openSpec,
            spec
        );
    
        defineProperty(subject, name, spec);
    }
    
    function wrap (subject, parent) {
        var wrapper = {
            
            get _super () {
                return parent;
            },
            
            extend:   _extend.bind(wrapper, subject),
        
            property: _property.bind(wrapper, subject),
            
            method:   _method.bind(wrapper, subject),
                      
            getter:   _getter.bind(wrapper, subject),
                      
            setter:   _setter.bind(wrapper, subject),
                      
            getset:   _getset.bind(wrapper, subject)
        };
        
        return wrapper;
    }
    
    function _createObject (proto, fn) {
        var subject, wrapper;
        
        if (!fn) {
            fn = proto;
            proto = OP;
        }
        
        subject = O.create(proto);
        wrapper = wrap(subject, proto);
        fn.call(wrapper, wrapper, proto);
        
        return subject;
    }
    
    function _constructor () {
        return function Proteus () {
            var initialize = arguments[0] !== _doNotInit,
                fn = this.init;
                
            if (initialize && fn) {
                fn.apply(this, arguments);
            }
        };
    }
    
    function _extendClass (baseKlass, fn) {
        var klass   = _constructor(),
            subject = new baseKlass(_doNotInit),
            meta    = wrap(klass),
            wrapper = wrap(subject, baseKlass.prototype)
        ;
        
        klass.prototype = subject;
        klass.constructor = klass;
        klass.extend = _extendClass.bind(klass, klass);
        
        wrapper.__defineGetter__("meta", function () {
            return meta;
        });
        
        fn.call(wrapper, wrapper, meta, baseKlass.prototype);
        
        return klass;
    }
    
    function _createClass (proto, fn) {
        var klass   = _constructor(),
            meta    = wrap(klass),
            wrapper
        ;
        
        if (!fn) {
            fn = proto;
            proto = OP;
        }
        
        klass.prototype = proto;
        klass.constructor = klass;
        klass.extend = _extendClass.bind(klass, klass);
        
        wrapper = wrap(proto, null);
        wrapper.__defineGetter__("meta", function () {
            return meta;
        });

        fn.call(wrapper, wrapper, meta, proto);
        
        return klass;
    }
    
    merge(exports, {
        create: _createObject,
        
        define: _createClass,
        
        extend: _extendClass
    });
}(
    exports ? exports : (window.Proteus = {})
));
