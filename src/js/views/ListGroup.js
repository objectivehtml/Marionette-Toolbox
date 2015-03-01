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

	Toolbox.Views.NoListGroupItem = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('no-list-group-item'),

		tagName: 'li'

	});

	Toolbox.Views.ListGroupItem = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('list-group-item'),

		className: 'list-group-item',

		triggers: {
			'click': 'click'
		}

	});

	Toolbox.Views.ListGroup = Toolbox.Views.CollectionView.extend({

		childView: Toolbox.Views.ListGroupItem,

		className: 'list-group',

		options: {
			// (bool) Activate list item on click
			activateOnClick: true,

			// (string) Active class name
			activeClassName: 'active'
		},

		childEvents: {
			'click': function(view) {
				if(this.getOption('activateOnClick')) {
					if(view.$el.hasClass(this.getOption('activeClassName'))) {
						view.$el.removeClass(this.getOption('activeClassName'));
					}
					else {
						view.$el.addClass(this.getOption('activeClassName'));
						
						this.triggerMethod('activate', view);
					}
				}

				this.triggerMethod('item:click', view);
			}
		}

	});

    return Toolbox;

}));