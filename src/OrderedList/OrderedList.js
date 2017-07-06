(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.OrderedListItem = Toolbox.View.extend({

		template: Toolbox.Template('ordered-list-item'),

		className: 'ordered-list-item',

		tagName: 'li',

    	triggers: {
            'click': 'click'
        },

		templateContext: function() {
			return this.options
		}

	});

	Toolbox.OrderedList = Toolbox.CollectionView.extend({

		childView: Toolbox.OrderedListItem,

        emptyView: Toolbox.EmptyView,

		className: 'ordered-list',

		tagName: 'ol',

		childViewTriggers: {
			'click': 'item:click'
		}

	});

    return Toolbox;

}));
