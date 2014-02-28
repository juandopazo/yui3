/**
Wraps the execution of asynchronous operations, providing a promise object that
can be used to subscribe to the various ways the operation may terminate.

When the operation completes successfully, call the Resolver's `resolve()`
method, passing any relevant response data for subscribers.  If the operation
encounters an error or is unsuccessful in some way, call `reject()`, again
passing any relevant data for subscribers.

The Resolver object should be shared only with the code resposible for
resolving or rejecting it. Public access for the Resolver is through its
_promise_, which is returned from the Resolver's `promise` property. While both
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
