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
Y.Object.each({
    'sync'   : '',
    'async'  : 'Async',
    'promise': 'Promise',
    'node'   : 'Node'
}, function (suffix, type) {
    Template['register' + suffix] = function (templateName, template) {
        Template._registry[templateName] = {
            template: template,
            type: type
        };
        return template;
    };
});

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

Template.bindTo = function (templateNamek, node) {
    var record = Template._registry[templateName],
        template = record && record.template;

    if (template) {
        switch (record.type) {
            case 'sync':
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
            case 'node':
                return function (data, callback) {
                    template(data, node, callback);
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
Template.render = function (templateName, data, options, callback) {
    var record = Template._registry[templateName],
        template = record && record.template,
        result   = '';

    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    if (template) {
        switch (record.type) {
            case 'sync':
                return template(data, options);
            case 'async':
                template(data, callback);
                break;
            case 'promise':
                return template(data, options);
            case 'node':
                Y.error('To render node-based templates, use Template.renderTo()');
                break;
        }
    } else if (typeof callback === 'function') {
        Y.soon(function () {
            callback(new Error('Unregistered template: "' + templateName + '"'), '');
        });
    } else {
        Y.error('Unregistered template: "' + templateName + '"');
    }

    return result;
};

/**
Renders a template into a node, given the registered template name and data
to be interpolated.The template name must have been registered previously with
`register()`, `registerAsync()` or `registerPromise()`.

This function also normalizes behavior across different types of templates so
it will always notify the completion of the rendering asynchronosly, even when
rendering synchronous templates.

@param {String} templateName The abstracted name to reference the template.
@param {Node|String} node The DOM node into which to render the template or a
                            CSS selector pointing to the node.
@param {Object} [data] The data to be interpolated into the template.
@param {Function} [callback] A callback to call once the template is rendered
                            or if an error ocurred. If there was an exception
                            the first parameter will be an error.
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
