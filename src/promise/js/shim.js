var Promise = Y.config.global.Promise,
    slice = [].slice;

Promise._log = Y.log;

Promise.async = Y.soon;

/**
Returns the current status of the operation. Possible results are
"pending", "fulfilled", and "rejected".

@method getStatus
@return {String}
@deprecated
@for Promise
**/
Promise.prototype.getStatus = function () {
    Y.log('promise.getStatus() will be removed in the future', 'warn', NAME);
    return this._resolver.getStatus();
};

/**
Returns the current status of the Resolver as a string "pending",
"fulfilled", or "rejected".

@method getStatus
@return {String}
@deprecated
@for Promise.Resolver
**/
Promise.Resolver.prototype.getStatus = function () {
    Y.log('resolver.getStatus() will be removed in the future', 'warn', NAME);
    return this._status;
};

/**
Checks if an object or value is a promise. This is cross-implementation
compatible, so promises returned from other libraries or native components
that are compatible with the Promises A+ spec should be recognized by this
method.

@method isPromise
@param {Any} obj The object to test
@return {Boolean} Whether the object is a promise or not
@deprecated
@static
**/
Promise.isPromise = function (obj) {
    var then;
    // We test promises by structure to be able to identify other
    // implementations' promises. This is important for cross compatibility and
    // In particular Y.when which should recognize any kind of promise
    // Use try...catch when retrieving obj.then. Return false if it throws
    // See Promises/A+ 1.1
    try {
        then = obj.then;
    } catch (_) {}
    return typeof then === 'function';
};

Y.Promise = Promise;
