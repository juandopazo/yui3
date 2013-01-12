/**
Represents an asynchronous operation. Provides a
standard API for subscribing to the moment that the operation completes either
successfully (`fulfill()`) or unsuccessfully (`reject()`).

@class Promise.Resolver
@constructor
@param {Promise} promise The promise instance this resolver will be handling
**/
function Resolver(promise) {
    this._fulfillSubs = [];
    this._rejectSubs = [];

    /**
    The promise for this Resolver.

    @property promise
    @type Promise
    **/
    this.promise = promise;

    /**
    The status of the operation.

    @property _status
    @type String
    @private
    **/
    this._status = 'pending';
}

Y.mix(Resolver.prototype, {
    /**
    Resolves the promise, signaling successful completion of the
    represented operation. All "onFulfilled" subscriptions are executed and passed
    the value provided to this method. After calling `fulfill()`, `reject()` and
    `notify()` are disabled.

    @method fulfill
    @param {Any} value Value to pass along to the "onFulfilled" subscribers
    @chainable
    **/
    fulfill: function (value) {
        if (this._status === 'pending') {
            this._result = value;
        }

        if (this._status !== 'rejected') {
            this._notify(this._fulfillSubs, this._result);

            this._fulfillSubs = [];
            this._rejectSubs = null;

            this._status = 'fulfilled';
        }

        return this;
    },

    /**
    Resolves the promise, signaling *un*successful completion of the
    represented operation. All "onRejected" subscriptions are executed with
    the value provided to this method. After calling `reject()`, `resolve()`
    and `notify()` are disabled.

    @method reject
    @param {Any} value Value to pass along to the "reject" subscribers
    @chainable
    **/
    reject: function (reason) {
        if (this._status === 'pending') {
            this._result = reason;
        }

        if (this._status !== 'fulfilled') {
            this._notify(this._rejectSubs, this._result);

            this._fulfillSubs = null;
            this._rejectSubs = [];

            this._status = 'rejected';
        }

        return this;
    },

    /**
    Schedule execution of a callback to either or both of "resolve" and
    "reject" resolutions for the Resolver.  The callbacks
    are wrapped in a new Resolver and that Resolver's corresponding promise
    is returned.  This allows operation chaining ala
    `functionA().then(functionB).then(functionC)` where `functionA` returns
    a promise, and `functionB` and `functionC` _may_ return promises.

    @method then
    @param {Function} [callback] function to execute if the Resolver
                resolves successfully
    @param {Function} [errback] function to execute if the Resolver
                resolves unsuccessfully
    @return {Promise} The promise of a new Resolver wrapping the resolution
                of either "resolve" or "reject" callback
    **/
    then: function (callback, errback) {
        // When the current promise is fulfilled or rejected, either the
        // callback or errback will be executed via the function pushed onto
        // this._subs.resolve or this._sub.reject.  However, to allow then()
        // chaining, the execution of either function needs to be represented
        // by a Resolver (the same Resolver can represent both flow paths), and
        // its promise returned.

        var promise = this.promise,
            thenFullfill, thenReject,

            // using promise constructor allows for customized promises to be
            // returned instead of plain ones
            then = new promise.constructor(function (resolver) {
                thenFullfill = Y.bind('fulfill', resolver);
                thenReject = Y.bind('reject', resolver);
            }),

            resolveSubs = this._fulfillSubs || [],
            rejectSubs  = this._rejectSubs  || [];

        // Because the callback and errback are represented by a Resolver, it
        // must be fulfilled or rejected to propagate through the then() chain.
        // The same logic applies to resolve() and reject() for fulfillment.
        function wrap(fn) {
            return function () {
                // The args coming in to the callback/errback from the
                // resolution of the parent promise.
                var args = arguments;

                // Wrapping all callbacks in Y.soon to guarantee
                // asynchronicity. Because setTimeout can cause unnecessary
                // delays that *can* become noticeable in some situations
                // (especially in Node.js)
                Y.soon(function () {
                    // Call the callback/errback with promise as `this` to
                    // preserve the contract that access to the deferred is
                    // only for code that may resolve/reject it.
                    // Another option would be call the function from the
                    // global context, but it seemed less useful.
                    var result;

                    // Promises model exception handling through callbacks
                    // making both synchronous and asynchronous errors behave
                    // the same way
                    try {
                        result = fn.apply(promise, args);
                    } catch (e) {
                        return thenReject(e);
                    }

                    // Returning a promise from a callback makes the current
                    // promise sync up with the returned promise
                    if (result && typeof result.then === 'function') {
                        result.then(thenFullfill, thenReject);
                    } else {
                        // Non-promise return values always trigger resolve()
                        // because callback is affirmative, and errback is
                        // recovery.  To continue on the rejection path, errbacks
                        // must return rejected promises or throw.
                        thenFullfill(result);
                    }
                });
            };
        }

        resolveSubs.push(typeof callback === 'function' ?
            wrap(callback) : thenFullfill);
        rejectSubs.push(typeof errback === 'function' ?
            wrap(errback) : thenReject);

        if (this._status === 'fulfilled') {
            this.fulfill(this._result);
        } else if (this._status === 'rejected') {
            this.reject(this._result);
        }

        return then;
    },

    /**
    Returns the current status of the Resolver as a string "pending",
    "fulfilled", or "rejected".

    @method getStatus
    @return {String}
    **/
    getStatus: function () {
        return this._status;
    },

    /**
    Returns the result of the Resolver.  Use `getStatus()` to test that the
    promise is fulfilled before calling this.

    @method getResult
    @return {Any} Value passed to `resolve()` or `reject()`
    **/
    getResult: function () {
        return this._result;
    },

    /**
    Executes an array of callbacks from a specified context, passing a set of
    arguments.

    @method _notify
    @param {Function[]} subs The array of subscriber callbacks
    @param {Any} result Value to pass the callbacks
    @protected
    **/
    _notify: function (subs, result) {
        var i, len;

        if (subs) {
            for (i = 0, len = subs.length; i < len; ++i) {
                subs[i](result);
            }
        }
    }

}, true);

Y.Promise.Resolver = Resolver;
