(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('toolbox'));
    } else if (typeof define === 'function' && define.amd) {
        define(['toolbox'], factory);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.Views.NoUnorderedListItem = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('no-unordered-list-item'),

		tagName: 'li'

	});

	Toolbox.Views.UnorderedListItem = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('unordered-list-item'),

		className: 'unordered-list-item',

		tagName: 'li',

		triggers: {
			'click': 'click'
		}

	});

	Toolbox.Views.UnorderedList = Toolbox.Views.CollectionView.extend({

		childView: Toolbox.Views.UnorderedListItem,

		className: 'unordered-list',

		tagName: 'ul',

		initialize: function() {
			Toolbox.Views.CollectionView.prototype.initialize.apply(this, arguments);

			if(!this.collection) {
				this.collection = new Backbone.Collection();
			}
		},

		childEvents: {
			'click': function(view) {
				this.triggerMethod('item:click', view);
			}
		}

	});

    return Toolbox;

}));