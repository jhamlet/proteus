
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
     * Merge two or more objects properties into the first.
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
    
    /**
     * Determines if an object looks like a object property specifier.
     * Returns true if the object contains "enumerable", "writable", or 
     * "configurable", otherwise returns the number of properties in 
     * object that look like property specificier properties ("value", "get",
     * or "set")
     * 
     * @param obj {object}
     * @returns {boolean|integer}
     */
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
    
    /**
     * Extend an object with additional properties. If the value of a property
     * looks like an object property specifier, use Object.defineProperty to 
     * define the property on object, otherwise just copy it over.
     * @param obj {object} object to extend
     * @param props {object} properties to extend
     * @returns {type}
     */
    function _extend (obj, props) {
        var specLike = isSpecLike, // reduce scope lookup
            key, val
        ;
    
        for (key in props) {
            val = props[key];
            if (!(val instanceof Array) &&
                typeof val === "object" &&
                specLike(val)
            ) {
                O.defineProperty(obj, key, val);
            }
            else {
                obj[key] = props[key];
            }
        }
        
        return this;
    }
    
    /**
     * A object property specifier for plain (non-function) properties
     */
    propertySpec = merge({writable: true}, openSpec);

    /**
     * Define a property on an object.
     * @param obj {object} object to add the property to
     * @param name {string} name of the property
     * @param val {mixed} optional, value to apply to the property
     * @param spec {object} optional, object specifier for property
     */
    function _property (obj, name, val, spec) {
        if (!spec && !val instanceof Array &&
            typeof val === "object" && isSpecLike(val)
        ) {
            spec = val;
            val = undefined;
        }

        O.defineProperty(
            obj,
            name,
            merge({value: val}, propertySpec, spec)
        );
        
        return this;
    }

    /**
     * Define a method on an object
     * @param obj {object} object to add the property to
     * @param name {string} name of the property
     * @param fn {function} optional
     * @param spec {object} optional, object specifier for property
     */
    function _method (obj, name, fn, spec) {
        spec = !fn.constructor ? fn : spec;
        O.defineProperty(obj, name, merge({value: fn}, openSpec, spec));
        return this;
    }

    /**
     * Define a getter on an object
     * @param obj {object} object to add the property to
     * @param name {string} name of the property
     * @param fn {function} optional
     * @param spec {object} optional, object specifier for property
     */
    function _getter (obj, name, fn, spec) {
        spec = !fn.constructor ? fn : spec;
        O.defineProperty(
            obj,
            name,
            merge({get: fn}, openSpec, spec)
        );
        return this;
    }

    /**
     * Define a setter on an object
     * @param obj {object} object to add the property to
     * @param name {string} name of the property
     * @param fn {function} optional
     * @param spec {object} optional, object specifier for property
     */
    function _setter (obj, name, fn, spec) {
        spec = fn.constructor ? fn : spec;
        O.defineProperty(
            obj,
            name,
            merge({set: fn}, openSpec, spec)
        );
        return this;
    }

    /**
     * Define a geter/setter pain on an object
     * @param obj {object} object to add the property to
     * @param name {string} name of the property
     * @param get {function} optional, function to use for getter
     * @param set {function} optional, if not supplied and 'get' is, use
     *      'get' argument for both getter and setter
     * @param spec {object} optional, object specifier for property
     */
    function _getset (/*obj, name, get, set, spec*/) {
        var len     = arguments.length,
            obj = arguments[0],
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
    
        O.defineProperty(obj, name, spec);
        
        return this;
    }
    
    /**
     * 
     * @param obj {object} object to wrap
     * @param parent {object} 'super' to obj
     * @returns {object} the wrapper
     */
    function wrap (obj, parent) {
        var wrapper = {
            
            get _super () {
                return parent;
            },
            
            extend:   _extend.bind(wrapper, obj),
        
            property: _property.bind(wrapper, obj),
            
            method:   _method.bind(wrapper, obj),
                      
            getter:   _getter.bind(wrapper, obj),
                      
            setter:   _setter.bind(wrapper, obj),
                      
            getset:   _getset.bind(wrapper, obj)
        };
        
        return wrapper;
    }
    
    /**
     * 
     * @param proto {object} optional, object to use as the prototype,
     *      defaults to Object.prototype
     * @param fn {function} function to use to extend the new object
     * @returns {object} the new object
     */
    function _createObject (proto, fn) {
        var obj, wrapper;
        
        if (!fn) {
            fn = proto;
            proto = OP;
        }
        
        obj = O.create(proto);
        wrapper = wrap(obj, proto);
        fn.call(wrapper, wrapper, proto);
        
        return obj;
    }
    
    /**
     * Utility to return a new constructor function
     * @returns {function} the constructor function
     */
    function _constructor () {
        var Ctor = function Proteus () {
            var initialize = arguments[0] !== _doNotInit;
                
            if (initialize) {
                if (Ctor.initialize) {
                    Ctor.initialize(this, arguments);
                }
                
                if (this.init) {
                    this.init.apply(this, arguments);
                }
            }
        };
        
        return Ctor;
    }
    
    /**
     * Extend an existing class with additional functionality
     * @param baseKlass {function} class to extend
     * @param fn {function} function used to extend the class
     * @returns {function} the new constructor function
     */
    function _extendClass (baseKlass, fn) {
        var klass   = _constructor(),
            obj     = new baseKlass(_doNotInit),
            meta    = wrap(klass),
            wrapper = wrap(obj, baseKlass.prototype)
        ;
        
        klass.prototype     = obj;
        klass.constructor   = klass;
        klass.extend        = _extendClass.bind(klass, klass);
        
        wrapper.__defineGetter__("meta", function () {
            return meta;
        });
        
        fn.call(wrapper, wrapper, meta, baseKlass.prototype);
        
        if (baseKlass.extended) {
            baseKlass.extended(klass);
        }
        
        return klass;
    }
    
    /**
     * Create a constructor function with the optional prototype
     * @param proto {object} optional, prototype for the class, defaults to
     *      Object.prototype
     * @param fn {function} function used to extend the class
     * @returns {function} the new constructor function
     */
    function _createClass (proto, fn) {
        var klass   = _constructor(),
            meta    = wrap(klass),
            wrapper
        ;
        
        if (!fn) {
            fn = proto;
            proto = OP;
        }
        
        klass.prototype     = proto;
        klass.constructor   = klass;
        klass.extend        = _extendClass.bind(klass, klass);
        
        wrapper = wrap(proto, null);
        wrapper.__defineGetter__("meta", function () {
            return meta;
        });

        fn.call(wrapper, wrapper, meta, proto);
        
        return klass;
    }
    
    /**
     * Export our Proteus library
     */
    merge(exports, {
        // Create a new object
        create: _createObject,
        // Create a new class
        define: _createClass,
        // Extend an existing class
        extend: _extendClass,

        // Provide utility methods for defining properties on objects
        defineProperty:     O.defineProperty.bind(O),
        defineProperties:   O.defineProperties.bind(O),
        augment:            _extend,
        property:           _property,
        methpd:             _method,
        getter:             _getter,
        setter:             _setter,
        getset:             _getset
        
    });
}(
    exports ? exports : (window.Proteus = {})
));
