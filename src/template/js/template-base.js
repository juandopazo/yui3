/**
Virtual rollup of the `template-base` and `template-micro` modules.

@module template
@main template
@since 3.8.0
**/

/**
Provides a generic API for using template engines such as Handlebars and
`Y.Template.Micro`.

@module template
@submodule template-base
@since 3.8.0
**/

/**
Provides a generic API for using template engines such as Handlebars and
`Y.Template.Micro`.

### Examples

Using with `Y.Template.Micro` (the default template engine):

    YUI().use('template', function (Y) {
        var micro = new Y.Template(),
            html  = micro.render('<%= data.message %>', {message: 'hello!'});

        // ...
    });

Using with Handlebars:

    YUI().use('template-base', 'handlebars', function (Y) {
        var handlebars = new Y.Template(Y.Handlebars),
            html       = handlebars.render('{{message}}', {message: 'hello!'});

        // ...
    });

@class Template
@param {Mixed} [engine=Y.Template.Micro] Template engine to use, such as
    `Y.Template.Micro` or `Y.Handlebars`. Defaults to `Y.Template.Micro` if not
    specified.
@param {Object} [defaults] Default options to use when instance methods are
    invoked.
@constructor
@since 3.8.0
**/

function Template(engine, defaults) {
    /**
    Default options.

    @property {Object} defaults
    @since 3.8.1
    **/
    this.defaults = defaults;

    /**
    Template engine class.

    @property {Mixed} engine
    @since 3.8.0
    **/
    this.engine = engine || Y.Template.Micro;

    if (!this.engine) {
        Y.error('No template engine loaded.');
    }
}

/**
Registry that maps template names to revived template functions.

@property _registry
@type Object
@static
@protected
@since 3.12.0
**/
Template._registry = {};

/**
Registers a pre-compiled template into the central template registry with a
given template string, allowing that template to be called and rendered by
that name using the `Y.Template.render()` static method.

For example, given the following simple Handlebars template, in `foo.hbs`:
@example
    <p>{{tagline}}</p>

It can be precompiled using the Handlebars CLI, and added into a YUI module
in the following way. Alternatively, `locator` can be used to automate this
process for you:
@example
    YUI.add('templates-foo', function (Y) {

        var engine = new Y.Template(Y.Handlebars),
            precompiled;

        precompiled = // Long precompiled template function here //

        Y.Template.register('foo', engine.revive(precompiled));

    }, '0.0.1', {requires: ['template-base', 'handlebars-base']});

See the `Y.Template#render` method to see how a registered template is used.

@method register
@param {String} templateName The template name.
@param {Function} template The function that returns the rendered string. The
    function should take the following parameters. If a pre-compiled template
    does not accept these parameters, it is up to the developer to normalize it.
  @param {Object} [template.data] Data object to provide when rendering the
    template.
  @param {Object} [template.options] Options to pass along to the template
    engine. See template engine docs for options supported by each engine.
@return {Function} revivedTemplate This is the same function as in `template`,
    and is done to maintain compatibility with the `Y.Template#revive()` method.
@static
@since 3.12.0
**/
/**
@method registerAsync
@param {String} templateName The template name.
@param {Function} template The function that returns the rendered string. The
    function should take the following parameters. If a pre-compiled template
    does not accept these parameters, it is up to the developer to normalize it.
  @param {Object} [template.data] Data object to provide when rendering the
    template.
  @param {Function} [template.callback] A callback
@static
@since @SINCE@
**/
/**
@method registerPromise
@param {String} templateName The template name.
@param {Function} template The function that returns a promise for the rendered
    string. The function should take the following parameter.
  @param {Object} [template.data] Data object to provide when rendering the
    template.
@static
@since @SINCE@
**/
/**
@method registerBound
@param {String} templateName The template name.
@param {Function} template The function that returns the rendered string. The
    function should take the following parameters. If a pre-compiled template
    does not accept these parameters, it is up to the developer to normalize it.
  @param {Object} [template.data] Data object to provide when rendering the
    template.
  @param {Object} [template.options] Options to pass along to the template
    engine. See template engine docs for options supported by each engine.
@param {Object} [config] Optional configuration.
  @param {String} [config.type='sync'] The type of the template. May be one of:
    * **`sync`**: A function that takes `data` and `options` parameters and
        returns a string with the result of rendering the template. This is the
        default template type.
    * **`async`**: A function that takes a `data` parameter and a callback. The
        callback follows Node.js' style and takes an optional errors as a first
        parameter. The second parameter is the result of rendering the template.
    * **`promise`**: A function that takes a `data` parameter and returns a
        promise for the result of rendering the template.
    * **`live`**: A function that takes `data` and `node` parameters. The node
        is a DOM node that will be updated live with the result of rendering the
        template.
@static
@since @SINCE@
**/
Template.register = function (templateName, template, options) {
    options = options || {};
    Template._registry[templateName] = {
        template: template,
        type: options.type
    };
};

/**
Returns the registered template function, given the template name. If an
unregistered template is accessed, this will return `undefined`.

@method get
@param {String} templateName The template name.
@return {Function} revivedTemplate The revived template function, or `undefined`
    if it has not been registered.
@static
@since 3.12.0
**/

Template.get = function (templateName) {
    var record = Template._registry[templateName];
    return record && record.template;
};

/**
Returns a function that updates the given node with the content of rendering
the template with the provided data. THe return function is normalized for
different kinds of templates.

The suggested use is to bind a template to a certain node, store the returned
function and call it repeatedly with different data.

```
var MyView = Y.Base.create('myView', Y.View, [], {
    initializer: function () {
        this.template = Template.bindTo('someTemplate', this.get('container'));
    },
    render: function () {
        this.template(this.get('model').toJSON());
        return this;
    }
});
```

@method bindTo
@param {String} templateName The template name.
@param {Node|String} node A reference to the node to bind the template to or a
                            CSS selector for it.
@return {Function} A function that takes two parameters:
  * **`[data]`**: An object with the data for the template.
  * **`[callback]`**: An optional callback that will be called after the rendering is
    complete. If an error ocurred, the callback gets an error object as the
    first parameter.
@static
@since @SINCE@
**/
Template.bindTo = function (templateNamek, node) {
    var record = Template._registry[templateName],
        template = record && record.template;

    node = Y.one(node);

    if (template) {
        switch (record.type) {
            case 'async':
                return function (data, callback) {
                    template(data, function (err, output) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        node.setHTML(output);
                        callback();
                    });
                };
            case 'promise':
                return function (data, callback) {
                    template(data).then(function (output) {
                        node.setHTML(output);
                        Y.soon(callback);
                    }, function (err) {
                        Y.soon(function () {
                            callback(err);
                        });
                    });
                };
            case 'live':
                return function (data, callback) {
                    template(data, node.getDOMNode(), callback);
                };
            default:
                return function (data, callback) {
                    var output;

                    try {
                        output = template(data);
                    } catch (err) {
                        callback(err);
                        return;
                    }

                    node.setHTML(output);
                    callback();
                };
        }
    } else {
        Y.error('Unregistered template: "' + templateName + '"');
    }
};

/**
Renders a template into a string, given the registered template name and data
to be interpolated. The template name must have been registered previously with
`register()`.

Once the template has been registered and built into a YUI module, it can be
listed as a dependency for any other YUI module. Continuing from the above
example, the registered template can be used in the following way:

@example
    YUI.add('bar', function (Y) {

        var html = Y.Template.render('foo', {
            tagline: '"bar" is now template language agnostic'
        });

    }, '0.0.1', {requires: ['template-base', 'templates-foo']});

The template can now be used without having to know which specific rendering
engine generated it.

@method render
@param {String} templateName The abstracted name to reference the template.
@param {Object} [data] The data to be interpolated into the template.
@param {Object} [options] Any additional options to be passed into the template.
@return {String} output The rendered result.
@static
@since 3.12.0
**/
Template.render = function (templateName, data, options) {
    var record = Template._registry[templateName],
        template = record && record.template;

    if (template && record.type === 'sync') {
        return template(data, options);
    }

    if (!template) {
        Y.error('Unregistered template: "' + templateName + '"');
    } else {
        Y.error('For non synchronous templates use renderTo()');
    }
    return '';
};

/**
Renders a template into a node, given the registered template name and data
to be interpolated.The template name must have been registered previously with
`register()`, `registerAsync()` or `registerPromise()`.

This function also normalizes behavior across different types of templates so
it will always notify the completion of the rendering asynchronosly, even when
rendering synchronous templates.

@method renderTo
@param {String} templateName The abstracted name to reference the template.
@param {Node|String} node The DOM node into which to render the template or a
                            CSS selector pointing to the node.
@param {Object} [data] The data to be interpolated into the template.
@param {Function} [callback] A callback to call once the template is rendered
                            or if an error ocurred. If there was an exception
                            the first parameter will be an error.
@static
@since @SINCE@
**/
Template.renderTo = function (templateName, node, data, callback) {
    Template.bindTo(templateName, node)(data, callback);
};

Template.prototype = {
    /**
    Compiles a template with the current template engine and returns a compiled
    template function.

    @method compile
    @param {String} text Template text to compile.
    @param {Object} [options] Options to pass along to the template engine. See
        template engine docs for options supported by each engine.
    @return {Function} Compiled template function.
    @since 3.8.0
    **/
    compile: function (text, options) {
        options = options ? Y.merge(this.defaults, options) : this.defaults;
        return this.engine.compile(text, options);
    },

    /**
    Precompiles a template with the current template engine and returns a string
    containing JavaScript source code for the precompiled template.

    @method precompile
    @param {String} text Template text to compile.
    @param {Object} [options] Options to pass along to the template engine. See
        template engine docs for options supported by each engine.
    @return {String} Source code for the precompiled template.
    @since 3.8.0
    **/
    precompile: function (text, options) {
        options = options ? Y.merge(this.defaults, options) : this.defaults;
        return this.engine.precompile(text, options);
    },

    /**
    Compiles and renders a template with the current template engine in a single
    step, and returns the rendered result.

    @method render
    @param {String} text Template text to render.
    @param {Object} data Data object to provide when rendering the template.
    @param {Object} [options] Options to pass along to the template engine. See
        template engine docs for options supported by each engine.
    @return {String} Rendered result.
    @since 3.8.0
    **/
    render: function (text, data, options) {
        options = options ? Y.merge(this.defaults, options) : this.defaults;

        if (this.engine.render) {
            return this.engine.render(text, data, options);
        }

        return this.engine.compile(text, options)(data, options);
    },

    /**
    Revives a precompiled template function into an executable template function
    using the current template engine. The precompiled code must already have
    been evaluated; this method won't evaluate it for you.

    @method revive
    @param {Function} precompiled Precompiled template function.
    @param {Object} [options] Options to pass along to the template engine. See
        template engine docs for options supported by each engine.
    @return {Function} Compiled template function.
    @since 3.8.0
    **/
    revive: function (precompiled, options) {
        options = options ? Y.merge(this.defaults, options) : this.defaults;

        return this.engine.revive ? this.engine.revive(precompiled, options) :
                precompiled;
    }
};

// Copy existing namespaced properties from Y.Template to the Template function
// if Y.Template already exists, then make the function the new Y.Template.
// This ensures that other modules can safely add stuff to the Y.Template
// namespace even if they're loaded before this one.
Y.Template = Y.Template ? Y.mix(Template, Y.Template) : Template;
