(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone'], function(Backbone) {
            return factory(root.Toolbox, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.Backbone);
    }
}(this, function (Toolbox, Backbone) {

    'use strict';

	Toolbox.EmptyView = Toolbox.View.extend({

        tagName: 'li',

        className: 'empty-view',

        template: Toolbox.Template('generic-empty-view'),

        defaultOptions: {
            // (mixed) The message that appear if the CollectionView is empty.
            // Use `false` if no message should be displayed.
            message: 'There are no items in the list.',

            // (mixed) The HTML tag element for the message content. Use `false`
            // if there is no wrapping tag.
            messageTagName: 'p'
        },

        templateContext: function() {
            return this.options;
        }

    });

    return Toolbox;

}));
