(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone.marionette'], function(_, Marionette) {
            return factory(root.Toolbox, _, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Marionette);
    }
}(this, function (Toolbox, _, Marionette) {

    'use strict';

    Toolbox.CollectionView = Marionette.CollectionView.extend({

        defaultOptions: {

        },

        initialize: function() {
            Marionette.CollectionView.prototype.initialize.apply(this, arguments);

            this.options = Toolbox.Options(this.defaultOptions, this.options, this);
        }

	});


    return Toolbox;

}));
