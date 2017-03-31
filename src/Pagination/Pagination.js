(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'backbone'], function($, Backbone) {
            return factory(root.Toolbox, root.$, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root.Backbone);
    }
}(this, function (Toolbox, $, Backbone) {

    'use strict';

    Toolbox.PaginationItem = Toolbox.View.extend({

        tagName: 'li',

        template: Toolbox.Template('pagination-item'),

        defaultOptions: {
            // (string) The active page class name
            disabledClassName: 'disabled'
        },

        triggers: {
            'click a:not(.next-page, .prev-page)': 'click',
            'click .next-page': 'page:next',
            'click .prev-page': 'page:prev'
        },

        onDomRefresh: function() {
            if(this.model.get('divider') === true) {
                this.$el.addClass(this.getOption('disabledClassName'));
            }
        },

        attributes: function() {
            if(this.model.get('page')) {
                return {
                    'data-page': this.model.get('page')
                }
            }
        }

    });

    Toolbox.PaginationList = Toolbox.CollectionView.extend({

        tagName: 'ul',

        childView: Toolbox.PaginationItem,

        className: 'pagination',

        childViewEvents: {
            'click': function(view) {
                this.triggerMethod('paginate', view);
            },
            'page:next': function(view) {
                this.triggerMethod('page:next', view);
            },
            'page:prev': function(view) {
                this.triggerMethod('page:prev', view);
            }
        }

    });

    Toolbox.Pagination = Toolbox.View.extend({

        template: Toolbox.Template('pagination'),

		tagName: 'nav',

		regions: {
            list: {
                el: 'ul',
                replaceElement: true
            }
        },

        defaultOptions: {
            paginationClassName: 'pagination',
            activeClassName: 'active',
            disabledClassName: 'disabled',
            totalPages: 1,
            showPages: 6,
            page: 1
        },

		childViewEvents: {
			'page:next': function() {
				this.nextPage();
			},
			'page:prev': function() {
				this.prevPage();
			},
			'paginate': function(view) {
                this.setActivePage(view.model.get('page'));
			}
		},

       templateContext: function() {
            return this.options;
        },

		initialize: function() {
			Toolbox.View.prototype.initialize.apply(this, arguments);

            if(!this.collection) {
                this.collection = new Backbone.Collection();
            }
		},

		onBeforeRender: function() {
			this.collection.reset();
            this.collection.add({
                label: '&laquo;',
                class: 'prev-page'
            });

			var currentPage = this.getOption('page');
			var totalPages = this.getOption('totalPages');
			var showPages = this.getOption('showPages');

			if(showPages % 2) {
				showPages++; // must be an even number
			}

			var startPage = (currentPage < showPages) ? 1 : currentPage - (showPages / 2);

			var endPage = showPages + startPage;

			endPage = (totalPages < endPage) ? totalPages : endPage;

			var diff = startPage - endPage + showPages;

			startPage -= (startPage - diff > 0) ? diff : 0;

			if (startPage > 1) {
				this.collection.add({page: 1});

				if(startPage > 2) {
					this.collection.add({divider: true});
				}
			}

			for(var i = startPage; i <= endPage; i++) {
				this.collection.add({page: i});
			}

			if (endPage < totalPages) {
				if(totalPages - 1 > endPage) {
					this.collection.add({divider: true});
				}
				this.collection.add({page: totalPages});
			}

            this.collection.add({
                label: '&raquo;',
                class: 'next-page'
            });
		},

        onDomRefresh: function() {
			this.$el.find('.'+this.getOption('activeClassName')).removeClass(this.getOption('activeClassName'));
            this.$el.find('[data-page="'+this.getOption('page')+'"]').addClass(this.getOption('activeClassName'));
			this.$el.find('.prev-page').parent().removeClass(this.getOption('disabledClassName'));
			this.$el.find('.next-page').parent().removeClass(this.getOption('disabledClassName'));

			if(this.getOption('page') == 1) {
				this.$el.find('.prev-page').parent().addClass(this.getOption('disabledClassName'));
			}

			if(this.getOption('page') == this.getTotalPages()) {
				this.$el.find('.next-page').parent().addClass(this.getOption('disabledClassName'));
			}
		},

        onRender: function() {
            this.showChildView('list', new Toolbox.PaginationList({
                collection: this.collection
            }));
        },

        getTotalPages: function() {
            return this.getOption('totalPages');
        },

        nextPage: function() {
			var page = this.getOption('page');
			var total = this.getTotalPages();

			if(page < total) {
				page++;
			}

			this.setActivePage(page);
		},

		onNextPageClick: function() {
			this.nextPage();
		},

		prevPage: function() {
			var page = this.getOption('page');

			if(page > 1) {
				page--;
			}

			this.setActivePage(page);
		},

		onPrevPageClick: function() {
			this.prevPage();
		},

        setShowPages: function(showPages) {
			this.options.showPages = showPages;
		},

		getShowPages: function() {
			return this.getOption('showPages');
		},

		setTotalPages: function(totalPages) {
			this.options.totalPages = totalPages;
		},

		getTotalPages: function() {
			return this.getOption('totalPages');
		},

		setPage: function(page) {
			this.options.page = page;
		},

		getPage: function() {
			return this.getOption('page');
		},

		setPaginationLinks: function(page, totalPages) {
			this.setPage(page);
			this.setTotalPages(totalPages);
			this.render();
		},

		setActivePage: function(page) {
			if(this.options.page != page) {
				this.options.page = page;
				this.render();

				var query = this.collection.where({page: page});

				if(query.length) {
                    var child = this.getRegion('list').currentView.children.findByModel(query[0]);

					this.triggerMethod('paginate', page, child);
				}
			}
		},

		getActivePage: function() {
			return this.getOption('page');
		}

    });

    /*
    */

    /*
    */

    /*
	Toolbox.Pagination = Toolbox.View.extend({

		template: Toolbox.Template('pagination'),

		tagName: 'nav',

		regions: {
            list: {
                el: 'ul',
                replaceElement: true
            }
        },

        defaultOptions: {
            paginationClassName: 'pagination',
            activeClassName: 'active',
            disabledClassName: 'disabled',
            totalPages: 1,
            showPages: 6,
            page: 1
        },

		childViewEvents: {
			'page:next': function() {
				this.nextPage();
			},
			'page:prev': function() {
				this.prevPage();
			},
			'click': function(view) {
				if(!view.$el.hasClass(this.getOption('disabledClassName'))) {
					this.setActivePage(view.model.get('page'));
				}
			}
		},

		events: {
			'click .next-page': function() {
				this.nextPage();
			},
			'click .prev-page': function() {
				this.prevPage();
			}
		},

       templateContext: function() {
            return this.options;
        },

		initialize: function() {
			Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

            if(!this.collection) {
                this.collection = new Backbone.Collection();
            }
		},

		onBeforeRender: function() {
			this.collection.reset();

			var currentPage = this.getOption('page');
			var totalPages = this.getTotalPages();
			var showPages = this.getOption('showPages');

			if(showPages % 2) {
				showPages++; // must be an even number
			}

			var startPage = (currentPage < showPages) ? 1 : currentPage - (showPages / 2);

			var endPage = showPages + startPage;

			endPage = (totalPages < endPage) ? totalPages : endPage;

			var diff = startPage - endPage + showPages;

			startPage -= (startPage - diff > 0) ? diff : 0;

			if (startPage > 1) {
				this.collection.add({page: 1});

				if(startPage > 2) {
					this.collection.add({divider: true});
				}
			}

			for(var i = startPage; i <= endPage; i++) {
				this.collection.add({page: i});
			}

			if (endPage < totalPages) {
				if(totalPages - 1 > endPage) {
					this.collection.add({divider: true});
				}
				this.collection.add({page: totalPages});
			}
		},

		nextPage: function() {
			var page = this.getOption('page');
			var total = this.getTotalPages();

			if(page < total) {
				page++;
			}

			this.setActivePage(page);
		},

		onNextPageClick: function() {
			this.nextPage();
		},

		prevPage: function() {
			var page = this.getOption('page');

			if(page > 1) {
				page--;
			}

			this.setActivePage(page);
		},

		onPrevPageClick: function() {
			this.prevPage();
		},

		onDomRefresh: function() {
			this.$el.find('.'+this.getOption('activeClassName')).removeClass(this.getOption('activeClassName'));
			this.$el.find('[data-page="'+this.getOption('page')+'"]').parent().addClass(this.getOption('activeClassName'));

			this.$el.find('.prev-page').parent().removeClass(this.getOption('disabledClassName'));
			this.$el.find('.next-page').parent().removeClass(this.getOption('disabledClassName'));

			if(this.getOption('page') == 1) {
				this.$el.find('.prev-page').parent().addClass(this.getOption('disabledClassName'));
			}

			if(this.getOption('page') == this.getTotalPages()) {
				this.$el.find('.next-page').parent().addClass(this.getOption('disabledClassName'));
			}

            this.showChildView('list', new Toolbox.PaginationList({
                collection: this.collection
            }));
		},

		setShowPages: function(showPages) {
			this.options.showPages = showPages;
		},

		getShowPages: function() {
			return this.getOption('showPages');
		},

		setTotalPages: function(totalPages) {
			this.options.totalPages = totalPages;
		},

		getTotalPages: function() {
			return this.getOption('totalPages');
		},

		setPage: function(page) {
			this.options.page = page;
		},

		getPage: function() {
			return this.getOption('page');
		},

		setPaginationLinks: function(page, totalPages) {
			this.setPage(page);
			this.setTotalPages(totalPages);
			this.render();
		},

		setActivePage: function(page) {
			if(this.options.page != page) {
				this.options.page = page;
				this.render();

				var query = this.collection.where({page: page});

				if(query.length) {
					this.triggerMethod('paginate', page, this.children.findByModel(query[0]));
				}
			}
		},

		getActivePage: function() {
			return this.getOption('page');
		}

	});
    */

    return Toolbox;

}));
