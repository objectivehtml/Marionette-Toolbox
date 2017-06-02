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

	Toolbox.NoUnorderedListItem = Toolbox.View.extend({

		template: Toolbox.Template('no-unordered-list-item'),

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateContext: function() {
			return this.options;
		}

	});

	Toolbox.UnorderedListItem = Toolbox.View.extend({

		className: 'unordered-list-item',

		tagName: 'li',

		triggers: {
            'click': 'click'
        },

		templateContext: function() {
			return this.options
		},

        getTemplate: function() {
            if(!this.getOption('template')) {
                return Toolbox.Template('unordered-list-item');
            }

            return this.getOption('template');
        }

	});

	Toolbox.UnorderedList = Toolbox.CollectionView.extend({

		childView: Toolbox.UnorderedListItem,

		className: 'unordered-list',

		tagName: 'ul',

		defaultOptions: {
			// (object) The view object to use for the empty message
			emptyMessageView: Toolbox.NoUnorderedListItem,

			// (string) The message to display if there are no list items
			emptyMessage: 'There are no items in the list.',

			// (bool) Show the empty message view
			showEmptyMessage: true
		},

		childViewTriggers: {
			'click': 'item:click'
		},

		initialize: function() {
			Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

			if(!this.collection) {
				this.collection = new Backbone.Collection();
			}
		},

        getEmptyView: function() {
        	if(this.getOption('showEmptyMessage')) {
	            var View = this.getOption('emptyMessageView');

	            View = View.extend({
	                options: {
	                    message: this.getOption('emptyMessage')
	                }
	            });

	            return View;
	        }

	        return;
        }

	});

    return Toolbox;

}));
