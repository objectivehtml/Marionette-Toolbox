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

	Toolbox.Breadcrumb = Toolbox.View.extend({

		template: Toolbox.Template('breadcrumb'),

		tagName: 'li'

	});

	Toolbox.Breadcrumbs = Toolbox.CollectionView.extend({

		childView: Toolbox.Breadcrumb,

		emptyView: false,

		className: 'breadcrumb',

		tagName: 'ol',

		defaultOptions: {
			activeClassName: 'active'
		},

		collectionEvents: {
			'change add remove reset': function() {
				var t = this;

				setTimeout(function() {
					t.onDomRefresh();
				});
			}
		},

		initialize: function() {
			Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

			if(!this.collection) {
				this.collection = new Backbone.Collection();
			}
		},

		getBreadcrumbs: function() {
		    return this.collection.length > 0 ? this.collection.toJSON() : [];
		},

        setBreadcrumbs: function(breadcrumbs, options) {
            this.collection.set(breadcrumbs, options);
        },

        addBreadcrumbs: function(breadcrumbs, options) {
            this.collection.add(breadcrumbs, options);
        },

        addBreadcrumb: function(breadcrumb, options) {
            this.addBreadcrumbs([breadcrumb], options);
        },

        insertBreadcrumb: function(breadcrumb, index, options) {
            this.insertBreadcrumbs([breadcrumb], index, options);
        },

        insertBreadcrumbs: function(breadcrumb, index, options) {
            this.collection.add(breadcrumb, _.extend({
                at: (index || 0)
            }, options));
        },

		removeBreadcrumb: function(breadcrumb, options) {
			this.collection.remove(breadcrumb, options);
		},

		removeBreadcrumbs: function() {
			this.collection.reset();
		},

		onDomRefresh: function() {
			if(!this.$el.find('.no-breadcrumbs').length) {
				this.$el.parent().show();
				this.$el.find('.active').removeClass(this.getOption('activeClassName'));
				this.$el.find('li:last-child').addClass(this.getOption('activeClassName'));
			}
			else {
				this.$el.parent().hide();
			}
		}

	});

    return Toolbox;

}));
