/**
Adds a `Y.batch()` method to wrap any number of callbacks or promises in a
single promise that will be resolved when all callbacks and/or promises have completed.

@module promise
@submodule promise-batch
**/

var slice = [].slice,
    isFunction = Y.Lang.isFunction;

/**
Wraps any number of callbacks in a Y.Deferred, and returns the associated
promise that will resolve when all callbacks have completed.  Each callback is
passed a Y.Deferred that it must `resolve()` when that callback completes.

@for YUI
@method batch
@param {Function|Promise} operation* Any number of functions or Y.Promise
            objects
@return {Promise}
**/
Y.batch = function () {
    var funcs     = slice.call(arguments),
        remaining = funcs.length,
        results   = [];

    return new Y.Promise(function (fulfill, reject) {
        var resolver = this;

        function oneDone(i) {
            return function (value) {
                results[i] = value;

                remaining--;

                if (!remaining && resolver.getStatus() !== 'rejected') {
                    fulfill(results);
                }
            };
        }

        Y.Array.each(funcs, function (fn, i) {
            Y.when((isFunction(fn) ? new Y.Promise(fn) : fn), oneDone(i), reject);
        });
    });
};
