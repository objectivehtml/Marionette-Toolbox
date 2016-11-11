(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['marionette.toolbox'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('marionette.toolbox'));
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.Views.NoUnorderedListItem = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('no-unordered-list-item'),

		tagName: 'li',

		options: {
			message: 'There are no items in the list.'
		},

		templateHelpers: function() {
			return this.options;
		}

	});

	Toolbox.Views.UnorderedListItem = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('unordered-list-item'),

		className: 'unordered-list-item',

		tagName: 'li',

		events: {
			'click': function(e, obj) {
				this.triggerMethod('click', obj);
			}
		},

		templateHelpers: function() {
			return this.options
		}

	});

	Toolbox.Views.UnorderedList = Toolbox.Views.CollectionView.extend({

		childView: Toolbox.Views.UnorderedListItem,

		className: 'unordered-list',

		tagName: 'ul',

		options: {
			// (object) The view object to use for the empty message
			emptyMessageView: Toolbox.Views.NoUnorderedListItem,

			// (string) The message to display if there are no list items
			emptyMessage: 'There are no items in the list.',

			// (bool) Show the empty message view
			showEmptyMessage: true
		},

		childEvents: {
			'click': function(view) {
				this.triggerMethod('item:click', view);
			}
		},

		initialize: function() {
			Toolbox.Views.CollectionView.prototype.initialize.apply(this, arguments);

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
