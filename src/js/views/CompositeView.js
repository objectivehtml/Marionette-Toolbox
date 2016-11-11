(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['marionette.toolbox', 'backbone.marionette'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('marionette.toolbox'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.Marionette);
    }
}(this, function (Toolbox, Marionette) {

    'use strict';

    Toolbox.Views.CompositeView = Marionette.CompositeView.extend({

	});


    return Toolbox;

}));
