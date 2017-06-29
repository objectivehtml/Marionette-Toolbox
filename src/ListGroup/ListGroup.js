(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], function(_, Backbone) {
            return factory(root.Toolbox, _, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone);
    }
}(this, function (Toolbox, _, Backbone) {

    'use strict';

	Toolbox.NoListGroupItem = Toolbox.View.extend({

		template: Toolbox.Template('no-list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateContext: function() {
			return this.options;
		}

	});

	Toolbox.ListGroupItem = Toolbox.View.extend({

		template: Toolbox.Template('list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

        defaultOptions: {
            // (mixed) The model attribute for the badge value. Defaults to false if no badge attribute.
            badgeAttribute: false,

            // (mixed) The model attribute for the content value. Defaults to false if no content attribute.
            contentAttribute: false,

            // (mixed) The edit form view class. Defaults to false if not edit form.
            editFormView: false,

            // (mixed) The JSON object of options for the instantiated view. Defaults to false if no options.
            editFormViewOptions: false,

            // (mixed) The delete form view class. Defaults to false if not delete form.
            deleteFormView: false,

            // (mixed) The JSON object of options for the instantiated view. Defaults to false if no options.
            deleteFormViewOptions: false,

            // (object) An object of key/values for the edit button
            editButton: {
                className: 'edit btn btn-warning btn-xs',
                label: 'Edit',
                icon: 'fa fa-edit',
            },

            // (object) An object of key/values for the delete button
            deleteButton: {
                className: 'delete btn btn-danger btn-xs',
                label: 'Delete',
                icon: 'fa fa-trash-o',
            }
        },

		events: {
			'click': function(e) {
                if(e.target == this.$el.get(0)) {
    				this.triggerMethod('click', this, e);
                }
			},
        },

        triggers: {
            'click .edit': 'click:edit',
            'click .delete': 'click:delete'
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

		templateContext: function() {
            var badge, content, helper = _.extend({
                hasEditForm: this.getOption('editFormView') ? true : false,
                hasDeleteForm: this.getOption('deleteFormView') ? true : false,
            }, this.options);

            if(badge = this.getBadge()) {
                helper.badge = badge;
            }

            if(content = this.getContent()) {
                helper.content = content;
            }

            if(helper.hasEditForm || helper.hasDeleteForm) {
                helper.showActionButtons = true;
            }

            return helper;
		},

        onClickEdit: function(child, e) {
            var EditFormView = this.getOption('editFormView');

            if(EditFormView) {
                var view = new EditFormView(_.extend({
                    model: this.model
                }, this.getOption('editFormViewOptions')));

                view.on('submit:success', function() {
                    modal.hide();
                }, this);

                var modal = new Toolbox.Modal({
                    content: view
                });

                modal.show();

                this.triggerMethod('show:edit', modal);
            }

            e.preventDefault();
        },

        onClickDelete: function(child, e) {
            var DeleteFormView = this.getOption('deleteFormView');

            if(DeleteFormView) {
                var view = new DeleteFormView(_.extend({
                    model: this.model
                }, this.getOption('deleteFormViewOptions')));

                view.on('submit:success', function() {
                    modal.hide();
                });

                var modal = new Toolbox.Modal({
                    content: view
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

			// (bool) Activate only a single item in the list item at once
			activateSingleItem: false,

			// (string) Active class name
			activeClassName: 'active',

			// (string) The message to display if there are no list items
			emptyMessage: 'There are no items in the list.',

			// (object) The view object to use for the empty message
			emptyMessageView: Toolbox.NoListGroupItem,

			// (bool) Show the empty message view
			showEmptyMessage: true,
		},

		childViewEvents: {
			'click': function(child, e) {
                if(this.getOption('activateOnClick')) {
                    if(child.$el.hasClass(this.getOption('activeClassName'))) {
                        child.$el.removeClass(this.getOption('activeClassName'));
                    }
                    else {
                        if(this.getOption('activateSingleItem')) {
                            this.$el.find('.'+this.getOption('activeClassName'))
                                .removeClass(this.getOption('activeClassName'));
                        }

                        child.$el.addClass(this.getOption('activeClassName'));

                        this.triggerMethod('activate', e);
                    }
                }

				this.triggerMethod('item:click', child, e);
			}
		},

        emptyView: function() {
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
