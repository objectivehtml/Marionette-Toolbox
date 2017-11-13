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

    Toolbox.TableViewRow = Toolbox.View.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-view-row'),

        defaultOptions: {
            // (array) Array of array of column
            columns: false,

            // (mixed) The edit form view class. Defaults to false if not edit form.
            editFormView: false,

            // (mixed) The JSON object of options for the instantiated view. Defaults to false if no options.
            editFormViewOptions: false,

            // (mixed) The delete form view class. Defaults to false if not delete form.
            deleteFormView: false,

            // (mixed) The JSON object of options for the instantiated view. Defaults to false if no options.
            deleteFormViewOptions: false,
        },

        triggers: {
            'click .edit': 'click:edit',
            'click .delete': 'click:delete'
        },

       templateContext: function() {
            return this.options;
        },

        onClickEdit: function() {
            var View = this.getOption('editFormView');

            if(View) {
                var view = new View(_.extend({
                    model: this.model
                }, this.getOption('editFormViewOptions')));

                view.on('submit:success', function() {
                    this.render();
                }, this);

                this.showViewInModal(view);
            }
        },

        onClickDelete: function() {
            var View = this.getOption('deleteFormView');

            if(View) {
                var view = new View(_.extend({
                    model: this.model
                }, this.getOption('deleteFormViewOptions')));

                this.showViewInModal(view);
            }
        },

        showViewInModal: function(view) {
            var modal = new Toolbox.Modal({
                content: view
            });

            view.on('submit:success', function() {
                modal.hide();
            });

            modal.show();

            return modal;
        }

    });

    Toolbox.TableViewBody = Toolbox.CollectionView.extend({

        tagName: 'tbody',

        childView: Toolbox.TableViewRow,

        emptyView: function() {
            return Toolbox.EmptyView.extend({

                template: Toolbox.Template('no-table-items'),

                tagName: 'tr',

                options: {
                    message: 'No records found'
                }

            });
        },

        onChildviewBeforeRender: function(child) {
            child.options.columns = this.getOption('columns');
        }

    });

    Toolbox.TableView = Toolbox.View.extend({

		className: 'table-view',

        regions: {
            body: {
                el: 'tbody',
                replaceElement: true
            },
            header: '.table-view-header',
            footer: '.table-view-footer'
        },

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
            fetchOnRender: true,

            // (array) An array of headers appended to the request
            requestHeaders: [],

            // (array) The default options used to generate the query string
            defaultRequestDataOptions: [
                'page',
                'limit',
                'order',
                'sort'
            ],

            // (object) An option to pass an object with request data
            requestData: {},

            // (array) Additional options used to generate the query string
            requestDataOptions: [],

            // (object) The body view class
            bodyView: Toolbox.TableViewBody,

            // (object) The body view options object
            bodyViewOptions: false,

            // (object) The pagination view class
            footerView: Toolbox.Pagination,

            // (object) The pagination view options object
            footerViewOptions: false,

            // (string) The table footer class name
            footerClassName: 'table-header',

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
            'click .buttons-wrapper a': function(e) {
                var buttons = this.getOption('buttons');
                var i = $(e.target).index();

                if(_.isArray(buttons) && buttons[i].onClick) {
                    buttons[i].onClick.call(this, $(e.target));
                    e.preventDefault();
                }
            }
        },

        triggers: {
            'click .sort': 'click:sort'
        },

        templateContext: function() {
            return this.options;
        },

        getCurrentPage: function(response) {
            return response.current_page || response.currentPage;
        },

        getLastPage: function(response) {
            return response.last_page || response.lastPage;
        },

        getRequestData: function() {
            var data = {}, options = _.result(this.options, 'requestDataOptions');
            var defaultOptions = _.result(this.options, 'defaultRequestDataOptions');

            _.each(([]).concat(defaultOptions, options), function(name) {
                data[name] = _.result(this.options, name);
            }, this);

            data = _.pick(data, function(value, key) {
                return !(_.isUndefined(value) || _.isNull(value))
            });

            return _.extend(data, _.result(this.options, 'requestData'));
        },

        getCurrentPage: function(response) {
            return response.current_page || response.currentPage;
        },

        getLastPage: function(response) {
            return response.last_page || response.lastPage;
        },

        fetch: function(reset) {
            var self = this;

            this.collection.fetch({
                data: this.getRequestData(),
                beforeSend: function(xhr) {
                    if(self.getOption('requestHeaders')) {
                        _.each(self.getOption('requestHeaders'), function(value, name) {
                            xhr.setRequestHeader(name, value);
                        });
                    }
                },
                success: function(collection, response) {
                    self.triggerMethod('fetch:complete', true, collection, response);
                    self.triggerMethod('fetch:success', collection, response);
                },
                error: function(collection, response) {
                    self.triggerMethod('fetch:complete', false, collection, response);
                    self.triggerMethod('fetch:error', collection, response)
                }
            });

            this.triggerMethod('fetch');
        },

        showHeaderView: function(View) {
            if(this.getRegion('header')) {
                View = View || this.getOption('headerView');

                if(View) {
                    this.showChildView('header', new View(_.extend({}, this.options)));
                }
            }
        },

        showBodyView: function(View) {
            if(this.getRegion('body')) {
                View = View || this.getOption('bodyView');

                if(View) {
                    var view = new View(_.extend({
                        collection: this.collection,
                        columns: this.getOption('columns')
                    }, this.getOption('bodyViewOptions')));

                    this.showChildView('body', view);
                }
            }
        },

        showFooterView: function(View) {
            if(this.getRegion('footer')) {
                View = View || this.getOption('footerView');

                var view = new View(_.extend({
                    page: this.getOption('page'),
                    totalPages: this.getOption('totalPages')
                }, this.getOption('footerViewOptions')));

                view.on('paginate', function(child, event) {
                    this.options.page = child.model.get('page');
                    this.fetch();
                }, this);

                this.showChildView('footer', view);
            }
        },

        showActivityIndicator: function() {
            var self = this;

            if(this.getRegion('body')) {
                this.getRegion('body').currentView.collection.reset();

                this.$el.find('table').addClass(this.getOption('loadingClassName'));

                var ActivityRow = Toolbox.ActivityIndicator.extend({
                    template: Toolbox.Template('table-activity-indicator-row'),
                    tagName: 'tr',
                    templateContext: function() {
                        return this.options;
                    },
                    initialize: function() {
                        Toolbox.ActivityIndicator.prototype.initialize.apply(this, arguments);

                        // Set the activity indicator options
                        _.extend(this.options, self.getOption('indicatorOptions'));

                        this.options.columns = self.getOption('columns');

                        // Set the activity indicator instance to be removed later
                        self._activityIndicator = this;
                    }
                });

                this.getRegion('body').currentView.children.each(function(view) {
                    this.removeChildView(view);
                }, this.getRegion('body').currentView);

                this.getRegion('body').currentView.addChildView(new ActivityRow({
                    model: this.model
                }));
            }
        },

        hideActivityIndicator: function() {
            this.$el.find('table').removeClass(this.getOption('loadingClassName'));

            if((this.getRegion('body') && this.getRegion('body').currentView) && this._activityIndicator) {
                this.getRegion('body').currentView.removeChildView(this._activityIndicator);
                this._activityIndicator = false;
            }
        },

        onFetch: function(collection, response) {
            this.showActivityIndicator();
        },

        onRender: function() {
            this.showHeaderView();
            this.showBodyView();

            if(this.getOption('fetchOnRender')) {
                this.fetch();
            }
        },

        onClickSort: function(child, e) {
            var defaultSort = 'asc',
                order = $(e.target).data('id'),
                currentSort = this.getOption('sort'),
                currentOrder = this.getOption('order');

            if(currentOrder == order) {
                if(!currentSort) {
                    this.options.sort = defaultSort;
                }
                else if(this.getOption('sort') === 'asc') {
                    this.options.sort = 'desc';
                }
                else {
                    this.options.order = undefined;
                    this.options.sort = undefined;
                }
            }
            else {
                this.options.order = order;
                this.options.sort = defaultSort;
            }

            this.$el.find('.sort').parent()
                .removeClass('sort-asc')
                .removeClass('sort-desc');

            if(this.getOption('sort')) {
                $(e.target).parent().addClass('sort-'+this.getOption('sort'));
            }

            this.fetch();
        },

        onFetchSuccess: function(collection, response) {
            if(collection.length === 0) {
                //this.getRegion('body').currentView._renderChildren();
                collection.reset();
            }

            this.options.page = this.getCurrentPage(response);
            this.options.totalPages = this.getLastPage(response);

            this.showFooterView();
        },

        onFetchComplete: function(status, collection, response) {
            this.hideActivityIndicator();
        }

    });

    return Toolbox;

}));
