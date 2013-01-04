/**
Wraps the execution of synchronous or asynchronous operations, providing a
promise object that can be used to subscribe to the various ways the operation
may terminate.

When the operation completes successfully, call the Resolver's `resolve()`
method, passing any relevant response data for subscribers.  If the operation
encounters an error or is unsuccessful in some way, call `reject()`, again
passing any relevant data for subscribers.

The Resolver object should be shared only with the code resposible for
resolving or rejecting it. Public access for the Resolver is through its
_promise_, which is returned from the Resolver's `promise()` method. While both
Resolver and promise allow subscriptions to the Resolver's state changes, the
promise may be exposed to non-controlling code. It is the preferable interface
for adding subscriptions.

Subscribe to state changes in the Resolver with the promise's
`then(callback, errback)` method.  `then()` wraps the passed callbacks in a
new Resolver and returns the corresponding promise, allowing chaining of
asynchronous or synchronous operations. E.g.
`promise.then(someAsyncFunc).then(anotherAsyncFunc)`

@module promise
@since 3.9.0
**/
var isFunction = Y.Lang.isFunction;

/**
The public API for a Resolver.  Used to subscribe to the notification events for
resolution or progress of the operation represented by the Resolver.

@class Promise
@constructor
@param {Function} fn A function where to insert the logic that resolves this promise.
		Receives `resolve` and `reject` functions as parameters
**/
Y.Promise = function Promise(fn) {
	if (!(this instanceof Promise)) {
		return new Promise(fn);
	}

	var resolver = new Promise.Resolver(this);
	this._resolver = resolver;

	fn.call(resolver, Y.bind('resolve', resolver), Y.bind('reject', resolver));
};

/**
Schedule execution of a callback to either or both of "resolve" and
"reject" resolutions for the associated Deferred.  The callbacks
are wrapped in a new Deferred and that Deferred's corresponding promise
is returned.  This allows operation chaining ala
`functionA().then(functionB).then(functionC)` where `functionA` returns
a promise, and `functionB` and `functionC` _may_ return promises.

@method then
@param {Function} [callback] function to execute if the Deferred
            resolves successfully
@param {Function} [errback] function to execute if the Deferred
            resolves unsuccessfully
@return {Promise} The promise of a new Deferred wrapping the resolution
            of either "resolve" or "reject" callback
**/

/**
Returns the current status of the Deferred. Possible results are
"in progress", "resolved", and "rejected".

@method getStatus
@return {String}
**/

/**
Returns the result of the Deferred.  Use `getStatus()` to test that the
promise is resolved before calling this.

@method getResult
@return {Any[]} Array of values passed to `resolve()` or `reject()`
**/
Y.Array.each(['then', 'getStatus', 'getResult'], function (method) {
	Y.Promise.prototype[method] = function () {
		return this._resolver[method].apply(this._resolver, arguments);
	};
});
