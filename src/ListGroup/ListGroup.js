(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore'], function(_) {
            return factory(root.Toolbox, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._);
    }
}(this, function (Toolbox, _) {

    'use strict';

	Toolbox.NoListGroupItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('no-list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateHelpers: function() {
			return this.options;
		}

	});

	Toolbox.ListGroupItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

        defaultOptions: {
            badgeAttribute: false,
            contentAttribute: false,
            editFormClass: false,
            deleteFormClass: false,
            editButton: {
                className: 'btn btn-warning btn-xs',
                label: 'Edit',
                icon: 'fa fa-edit',
            },
            deleteButton: {
                className: 'btn btn-danger btn-xs',
                label: 'Delete',
                icon: 'fa fa-trash-o',
            }
        },

		events: {
			'click': function(e) {
                if(e.target == this.$el.get(0)) {
    				this.triggerMethod('click', e);
                }
			},
            'click .edit-item': function(e) {
                this.triggerMethod('click:edit', e);
            },
            'click .delete-item': function(e) {
                this.triggerMethod('click:delete', e);
            }
		},

        getBadge: function() {
            return this.getOption('badgeAttribute') ?
                this.model.get(this.getOption('badgeAttribute')) :
                false;
        },

        getContent: function() {
            return this.getOption('contentAttribute') ?
                this.model.get(this.getOption('contentAttribute')) :
                false;
        },

		templateHelpers: function() {
            var badge, content, helper = _.extend({
                hasEditForm: this.getOption('editFormClass') ? true : false,
                hasDeleteForm: this.getOption('deleteFormClass') ? true : false
            }, this.options);

            if(badge = this.getBadge()) {
                helper.badge = badge;
            }

            if(content = this.getContent()) {
                helper.content = content;
            }

            return helper;
		},

        onClickEdit: function(e) {
            var View = this.getOption('editFormClass');

            if(View) {
                var view = new View({
                    model: this.model
                });

                view.on('submit:success', function() {
                    modal.hide();
                }, this);

                var modal = new Toolbox.Modal({
                    contentView: view
                });

                modal.show();

                this.triggerMethod('show:edit', modal);
            }

            e.preventDefault();
        },

        onClickDelete: function(e) {
            var View = this.getOption('deleteFormClass');

            if(View) {
                var view = new View({
                    model: this.model
                });

                view.on('submit:success', function() {
                    modal.hide();
                });

                var modal = new Toolbox.Modal({
                    contentView: view
                });

                modal.show();

                this.triggerMethod('show:delete', modal);
            }

            e.preventDefault();
        }

	});

	Toolbox.ListGroup = Toolbox.CollectionView.extend({

		childView: Toolbox.ListGroupItem,

		className: 'list-group',

		tagName: 'ul',

		defaultOptions: {
			// (bool) Activate list item on click
			activateOnClick: false,

			// (string) Active class name
			activeClassName: 'active',

			// (string) The message to display if there are no list items
			emptyMessage: 'There are no items in the list.',

			// (object) The view object to use for the empty message
			emptyMessageView: Toolbox.NoListGroupItem,

			// (bool) Show the empty message view
			showEmptyMessage: true,
		},

		childEvents: {
			'click': function(view, e) {
				if(this.getOption('activateOnClick')) {
					if(view.$el.hasClass(this.getOption('activeClassName'))) {
						view.$el.removeClass(this.getOption('activeClassName'));
					}
					else {
						view.$el.addClass(this.getOption('activeClassName'));

						this.triggerMethod('activate', view);
					}
				}

				this.triggerMethod('item:click', view, e);
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
