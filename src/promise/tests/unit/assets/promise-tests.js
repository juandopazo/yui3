YUI.add('promise-tests', function (Y) {

    var Assert = Y.Assert,
        ArrayAssert = Y.Test.ArrayAssert,
        Promise = Y.Promise,
        isPromise = Promise.isPromise;

    // -- Suite --------------------------------------------------------------------
    var suite = new Y.Test.Suite({
        name: 'Promise tests'
    });

    // -- Lifecycle ----------------------------------------------------------------
    suite.add(new Y.Test.Case({
        name: 'Basic promise behavior',

        'calling Y.Promise as a function should return an instance of Y.Promise': function () {
            Assert.isInstanceOf(Y.Promise, Y.Promise(function () {}), 'Y.Promise as a function should return a promise');
        },

        'promise state should change only once': function () {
            var fulfilled = new Promise(function (fulfill, reject) {
                    Assert.areEqual('pending', this.getStatus(), 'before fulfillment the resolver status should be "pending"');

                    fulfill(5);

                    Assert.areEqual('fulfilled', this.getStatus(), 'once fulfilled the resolver status should be "fulfilled"');

                    reject(new Error('reject'));

                    Assert.areEqual('fulfilled', this.getStatus(), 'rejecting a fulfilled promise should not change its status');
                }),

                rejected = new Promise(function (fulfill, reject) {
                    Assert.areEqual('pending', this.getStatus(), 'before rejection the resolver status should be "pending"');

                    reject(new Error('reject'));

                    Assert.areEqual('rejected', this.getStatus(), 'once rejected the resolver status should be "rejected"');

                    fulfill(5);

                    Assert.areEqual('rejected', this.getStatus(), 'fulfilling a rejected promise should not change its status');
                });

            Assert.areEqual('fulfilled', fulfilled.getStatus(), 'status of a fulfilled promise should be "fulfilled"');
            Assert.areEqual('rejected', rejected.getStatus(), 'status of a rejected promise should be "rejected"');
        },



        'callbacks passed to then should be called asynchronously': function () {
            var test = this;

            var foo = false;

            Y.Promise(function (fulfill) {
                fulfill();
            }).then(function () {
                foo = true;
                test.resume();
            });

            Assert.areEqual(false, foo, 'callback should not modify local variable in this turn of the event loop');

            test.wait();
        }

    }));

    suite.add(new Y.Test.Case({
        name: 'Promise detection with Promise.isPromise',

        'detecting YUI promises': function () {
            Assert.isTrue(isPromise(new Promise(function () {})), 'a YUI promise should be identified as a promise');
        },

        'detecting pseudo promises': function () {
            Assert.isTrue(isPromise({
                then: function () {
                    return 5;
                }
            }), 'a pseudo promise should be identified as a promise');
        },

        'failing for values and almost promises': function () {
            // truthy values
            Assert.isFalse(isPromise(5), 'numbers should not be identified as promises');
            Assert.isFalse(isPromise('foo'), 'strings should not be identified as promises');
            Assert.isFalse(isPromise(true), 'true booleans should not be identified as promises');
            Assert.isFalse(isPromise({}), 'objects should not be identified as promises');

            // false values
            Assert.isFalse(isPromise(0), 'zero should not be identified as a promise');
            Assert.isFalse(isPromise(''), 'empty strings should not be identified as promises');
            Assert.isFalse(isPromise(false), 'false booleans should not be identified as promises');
            Assert.isFalse(isPromise(null), 'null should not be identified as a promise');
            Assert.isFalse(isPromise(undefined), 'undefined should not be identified as a promise');

            // almost promises
            Assert.isFalse(isPromise({
                then: 5
            }), 'almost promises should not be identified as promises');
        }
    }));

    Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: [
        'promise',
        'test'
    ]
});