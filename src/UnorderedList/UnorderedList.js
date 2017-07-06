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

	Toolbox.UnorderedListItem = Toolbox.View.extend({

        template: Toolbox.Template('unordered-list-item'),

        className: 'unordered-list-item',

        tagName: 'li',

		triggers: {
            'click': 'click'
        },

		templateContext: function() {
			return this.options
		}

	});

	Toolbox.UnorderedList = Toolbox.CollectionView.extend({

		childView: Toolbox.UnorderedListItem,

        emptyView: Toolbox.EmptyView,

		className: 'unordered-list',

		tagName: 'ul',

		childViewTriggers: {
			'click': 'item:click'
		}

	});

    return Toolbox;

}));
