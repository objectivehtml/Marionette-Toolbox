(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'backbone', 'marionette', 'handlebars', 'underscore'], function($, Backbone, Marionette, Handlebars, _) {
            return factory(root, $, Backbone, Marionette, Handlebars, _);
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(
            root,
            require('jquery'),
            require('backbone'),
            require('backbone.marionette'),
            require('handlebars'),
            require('underscore')
        );
    } else {
        factory(root, root.$, root.Backbone, root.Marionette, root.Handlebars, root._);
    }
}(this, function(root, $, Backbone, Marionette, Handlebars, _) {

    'use strict';

    var Toolbox = {};

    Toolbox.handlebars = {};

    Toolbox.Views = {};

    Toolbox.VERSION = '%%GULP_INJECT_VERSION%%';

    // Toolbox.Template
    // -------------------
    // Get an existing rendered handlebars template

    Toolbox.Template = function(name) {
        if(Toolbox.templates[name]) {
            return Toolbox.templates[name];
        }
        else {
            throw 'Cannot locate the Handlebars template with the name of "'+name+'".';
        }
    };

    // Toolbox.Options
    // -------------------
    // Get the default options and options and merge the,

    Toolbox.Options = function(defaultOptions, options, context) {
        return _.extend({}, Marionette._getValue(defaultOptions, context), Marionette._getValue(options, context));
    };

    return root.Toolbox = Toolbox;
}));
