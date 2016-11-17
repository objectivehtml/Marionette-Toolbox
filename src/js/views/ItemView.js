(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone.marionette'], function(_, Marionette) {
            return factory(root.Toolbox, _, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), quire('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Marionette);
    }
}(this, function (Toolbox, _, Marionette) {

    'use strict';

    Toolbox.Views.ItemView = Marionette.ItemView.extend({

        defaultOptions: {

        },

        initialize: function() {
            Marionette.ItemView.prototype.initialize.apply(this, arguments);

            this.options = _.extend({}, this.defaultOptions, this.options);
        }

	});


    return Toolbox;

}));
