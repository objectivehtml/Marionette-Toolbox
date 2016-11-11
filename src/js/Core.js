(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'marionette', 'handlebars', 'underscore'], function(Backbone, Marionette, Handlebars, _) {
      return (root.Toolbox = factory(root, Backbone, Marionette, Handlebars, _));
    });
  } else if (typeof exports !== 'undefined') {
    var Backbone = require('backbone');
    var _ = require('underscore');
    var Marionette = require('backbone.marionette');
    var Handlebars = require('handlebars');
    module.exports = factory(root, Backbone, Marionette, Handlebars, _);
  } else {
    root.Toolbox = factory(root, root.Backbone, root.Marionette, root.Handlebars, root._);
  }

}(this, function(root, Backbone, Marionette, Handlebars, _) {

    'use strict';

    var previousToolbox = root.Toolbox;

    var Toolbox = Backbone.Toolbox = {};

    Toolbox.Views = {};

    Toolbox.VERSION = '0.0.1';

    Toolbox.noConflict = function() {
        root.Toolbox = previousToolbox;
        return this;
    };

    // Toolbox.Template
    // -------------------
    // Get an existing rendered handlebars template

    Toolbox.Template = function(name) {
        if(Handlebars.templates[name]) {
            return Handlebars.templates[name];
        }
        else {
            throw 'Cannot locate the Handlebars template with the name of "'+name+'".';
        }
    };

    return Toolbox;
}));
