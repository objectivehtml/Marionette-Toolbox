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

	Toolbox.Views.NoOrderedListItem = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('no-ordered-list-item'),

		tagName: 'li'

	});

	Toolbox.Views.OrderedListItem = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('ordered-list-item'),

		className: 'ordered-list-item',

		tagName: 'li',

		triggers: {
			'click': 'click'
		}

	});

	Toolbox.Views.OrderedList = Toolbox.Views.CollectionView.extend({

		childView: Toolbox.Views.OrderedListItem,

		className: 'ordered-list',

		tagName: 'ol',

		childEvents: {
			'click': function(view) {
				this.triggerMethod('item:click', view);
			}
		}

	});

    return Toolbox;

}));