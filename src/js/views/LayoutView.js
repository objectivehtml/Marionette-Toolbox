(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone.marionette'], function(Marionette) {
            return factory(root.Toolbox, Marionette)
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.Marionette);
    }
}(this, function (Toolbox, Marionette) {

    'use strict';

    Toolbox.Views.LayoutView = Marionette.LayoutView.extend({

        defaultOptions: {

        },

        initialize: function() {
            Marionette.LayoutView.prototype.initialize.apply(this, arguments);

            this.options = _.extend({}, this.defaultOptions, this.options);
        }

	});


    return Toolbox;

}));
