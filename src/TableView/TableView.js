(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore', 'backbone', 'backbone.marionette'], function($, _, Backbone, Marionette) {
            return factory(root.Toolbox, $, _, Backbone, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('underscore'), require('backbone'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._, Backbone, Marionette);
    }
}(this, function (Toolbox, $, _, Backbone, Marionette) {

    'use strict';

    Toolbox.TableNoItemsRow = Toolbox.ItemView.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-no-items'),

        className: 'no-results',

        defaultOptions: {
            // (array) Array of array of column
            columns: false,

            // (string) The message to display if there are no table rows
            message: 'No rows found'
        },

        templateHelpers: function() {
            return this.options;
        }

    });

    Toolbox.TableViewRow = Toolbox.LayoutView.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-view-row'),

        defaultOptions: {
            // (array) Array of array of column
            columns: false,

            // (mixed) If not false, pass a valid View prototype
            editFormClass: false,

            // (mixed) If not false, pass a valid View prototype
            deleteFormClass: false
        },

        triggers: {
            'click .edit': 'click:edit',
            'click .delete': 'click:delete'
        },

        templateHelpers: function() {
            return this.options;
        },

        onClickEdit: function() {
            var View = this.getOption('editFormClass');

            if(View) {
                var view = new View({
                    model: this.model
                });

                view.on('submit:success', function() {
                    this.render();
                }, this);

                this.showViewInModal(view);
            }
        },

        onClickDelete: function() {
            var View = this.getOption('deleteFormClass');

            if(View) {
                var view = new View({
                    model: this.model
                });

                this.showViewInModal(view);
            }
        },

        showViewInModal: function(view) {
            var modal = new Toolbox.Modal({
                contentView: view
            });

            view.on('submit:success', function() {
                modal.hide();
            });

            modal.show();

            return modal;
        }

    });

    Toolbox.TableViewFooter = Toolbox.LayoutView.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-view-footer'),

        modelEvents: {
            'change': 'render'
        },

        regions: {
            content: 'td'
        },

        defaultOptions: {
            // (array) Array of array of column
            columns: false
        },

        templateHelpers: function() {
            return this.options;
        }

    });

    Toolbox.TableView = Toolbox.CompositeView.extend({

		className: 'table-view',

        childView: Toolbox.TableViewRow,

        childViewContainer: 'tbody',

        template: Toolbox.Template('table-view-group'),

        defaultOptions: {
            // (int) The starting page
            page: 1,

            // (string) The order of the date being returned
            order: null,

            // (string) Either asc or desc sorting order
            sort: null,

            // (int) The numbers of rows per page
            limit: 20,

            // (bool) Should show the pagination for this table
            paginate: true,

            // (array) Array of array of column
            columns: false,

            // (bool) Fetch the data when table is shown
            fetchOnShow: true,

            // (array) An array of headers appended to the request
            requestHeaders: [],

            // (array) The default options used to generate the query string
            defaultRequestDataOptions: [
                'page',
                'limit',
                'order',
                'sort'
            ],

            // (array) Additional options used to generate the query string
            requestDataOptions: [],

            // (object) The pagination view class
            paginationView: false,

            // (object) The pagination view options object
            paginationViewOptions: false,

            // (string) The table header
            header: false,

            // (string) The table header tag name
            headerTagName: 'h3',

            // (string) The table header class name
            headerClassName: 'table-header',

            // (object) The header view class
            headerView: false,

            // (object) The header view options object
            headerViewOptions: false,

            // (string) The table description
            description: false,

            // (string) The table description tag
            descriptionTag: 'p',

            // (string) The table description tag
            descriptionClassName: 'description row col-sm-6',

            // (string) The table class name
            tableClassName: 'table',

            // (string) The loading class name
            loadingClassName: 'loading',

            // (string) The name of the property in the model storing the columns
            childViewColumnsProperty: 'columns',

            // (object) The activity indicator options
            indicatorOptions: {
                indicator: 'small'
            },

            // (string) The message to display if there are no table rows
            emptyMessage: 'No rows found',

            // (string) The name of the class appended to the buttons
            buttonClassName: 'btn btn-default',

            // (array) An array of button objects
            // {href: 'test-123', label: 'Test 123'}
            buttons: []
        },

        events: {
            'click .sort': function(e) {
                this.triggerMethod('sort:click', e);

                e.preventDefault();
            },
            'click .buttons-wrapper a': function(e) {
                var buttons = this.getOption('buttons');
                var i = $(e.target).index();

                if(_.isArray(buttons) && buttons[i].onClick) {
                    buttons[i].onClick.call(this, $(e.target));
                    e.preventDefault();
                }
            }
        },

        templateHelpers: function() {
            return this.options;
        },

        getCurrentPage: function(response) {
            return response.current_page || response.currentPage;
        },

        getLastPage: function(response) {
            return response.last_page || response.lastPage;
        },

        getEmptyView: function() {
            var View = Toolbox.TableNoItemsRow.extend({
                options: {
                    message: this.getOption('emptyMessage'),
                    columns: this.getOption('columns')
                }
            });

            return View;
        },

        getRequestData: function() {
            var options = this.getOption('requestDataOptions');
            var data = _.extend({}, this.getOption('requestData') || {});
            var defaultOptions = this.getOption('defaultRequestDataOptions');

            _.each(([]).concat(defaultOptions, options), function(name) {
                if(!_.isNull(this.getOption(name)) && !_.isUndefined(this.getOption(name))) {
                    data[name] = this.getOption(name);
                }
            }, this);

            return data;
        },

        fetch: function(reset) {
            var t = this;

            if(reset) {
                this.collection.reset();
            }

            this.collection.fetch({
                data: this.getRequestData(),
                beforeSend: function(xhr) {
                    if(t.getOption('requestHeaders')) {
                        _.each(t.getOption('requestHeaders'), function(value, name) {
                            xhr.setRequestHeader(name, value);
                        });
                    }
                },
                success: function(collection, response) {
                    t.triggerMethod('fetch:complete', true, collection, response);
                    t.triggerMethod('fetch:success', collection, response);
                },
                error: function(collection, response) {
                    t.triggerMethod('fetch:complete', false, collection, response);
                    t.triggerMethod('fetch:error', collection, response)
                }
            });

            this.triggerMethod('fetch');
        },

        showHeader: function(HeaderView) {
            if(HeaderView) {
                this.header = new Marionette.Region({
                    el: this.$el.find('.table-header-view').get(0)
                });

                this.header.show(new HeaderView(this.getOption('headerViewOptions')))
            }
        },

        showPagination: function(page, totalPages) {
            var t = this, View = this.getOption('paginationView');

            if(!View) {
                View = Toolbox.Pager;
            }

            var paginationViewOptions = this.getOption('paginationViewOptions');

            if(!_.isObject(paginationViewOptions)) {
                paginationViewOptions = {};
            }

            var view = new View(_.extend({
                page: page,
                totalPages: totalPages,
            }, paginationViewOptions));

            view.on('paginate', function(page, view) {
                if(page != t.getOption('page')) {
                    t.options.page = page;
                    t.fetch(true);
                }
            });

            this.tfoot = new Marionette.Region({
                el: this.$el.find('tfoot').get(0)
            });

            var footerView = new Toolbox.TableViewFooter({
                columns: this.getOption('columns')
            });

            footerView.on('dom:refresh', function() {
                this.content.show(view);
            });

            this.tfoot.show(footerView);
        },

        showActivityIndicator: function() {
            var t = this;

            this.destroyChildren();
            this.destroyEmptyView();

            this.$el.find('table').addClass(this.getOption('loadingClassName'));

            this.addChild(this.model, Toolbox.ActivityIndicator.extend({
                template: Toolbox.Template('table-activity-indicator-row'),
                tagName: 'tr',
                templateHelpers: function() {
                    return this.options;
                },
                initialize: function() {
                    Toolbox.ActivityIndicator.prototype.initialize.apply(this, arguments);

                    // Set the activity indicator options
                    _.extend(this.options, t.getOption('indicatorOptions'));

                    this.options.columns = t.getOption('columns');

                    // Set the activity indicator instance to be removed later
                    t._activityIndicator = this;
                }
            }));
        },

        hideActivityIndicator: function() {
           this.$el.find('table').removeClass(this.getOption('loadingClassName'));

            if(this._activityIndicator) {
                this.removeChildView(this._activityIndicator);
                this._activityIndicator = false;
            }
        },

        onFetch: function(collection, response) {
            this.destroyEmptyView();
            this.showActivityIndicator();
        },

        onShow: function() {
        },

        onSortClick: function(e) {
            var t = this, orderBy = $(e.target).data('id');

            if(t.getOption('order') === orderBy) {
                if(!t.getOption('sort')) {
                    t.options.sort = 'asc';
                }
                else if(t.getOption('sort') === 'asc') {
                    t.options.sort = 'desc';
                }
                else {
                    t.options.orderBy = false;
                    t.options.sort = false;
                }
            }
            else {
                t.options.order = orderBy;
                t.options.sort = 'asc';
            }

            t.$el.find('.sort').parent().removeClass('sort-asc').removeClass('sort-desc');

            if(t.getOption('sort')) {
                $(e.target).parent().addClass('sort-'+t.getOption('sort'));
            }

            t.fetch(true);
        },

        onDomRefresh: function() {
            if(this.getOption('fetchOnShow')) {
                this.fetch();
            }

            this.showHeader(this.getOption('headerView'));
        },

        onFetchSuccess: function(collection, response) {
            var page = this.getCurrentPage(response);
            var totalPages = this.getLastPage(response);

            if(collection.length === 0) {
                this.showEmptyView();
            }

            this.options.page = page;
            this.options.totalPages = totalPages;

            if(this.getOption('paginate')) {
                this.showPagination(page, totalPages);
            }
        },

        onFetchComplete: function(status, collection, response) {
            this.hideActivityIndicator();
        },

        onChildviewBeforeRender: function(child) {
            child.options.columns = this.getOption('columns');
        }

    });

    return Toolbox;

}));
