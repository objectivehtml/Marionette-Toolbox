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

    Toolbox.Views.TableNoItemsRow = Marionette.ItemView.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-no-items'),

        className: 'no-results'

    });

    Toolbox.Views.TableViewRow = Marionette.ItemView.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-view-row')

    });

    Toolbox.Views.TableView = Marionette.CompositeView.extend({

        childView: Toolbox.Views.TableViewRow,

        childViewContainer: 'tbody',

        template: Toolbox.Template('table-view-group'),

        options: {
            page: 1,
            order: false,
            sort: false,
            limit: 20,
            paginate: true,
            search: false,
            columns: false
        },

        initialize: function(options) {
            Marionette.CompositeView.prototype.initialize.apply(this, arguments);

            if(!this.model) {
                this.model = new Backbone.Model();
            }

            if(this.getOption('columns')) {
                this.model.set('columns', this.getOption('columns'));
            }
        },

        getEmptyView: function() {
            var model = new Backbone.Model({
                columns: this.getOption('columns'),
                message: 'There are no records found.'
            });

            var View = Toolbox.Views.TableNoItemsRow.extend({
                initialize: function() {
                    this.model = model;
                }
            });

            return View;
        }

    });

    return Toolbox;

}));