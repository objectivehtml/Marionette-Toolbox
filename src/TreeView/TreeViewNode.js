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

    Toolbox.TreeViewNode = Toolbox.View.extend({

        getTemplate: function() {
            if(!this.getOption('template')) {
                return Toolbox.Template('tree-view-node');
            }

            return this.getOption('template');
        },

        tagName: 'li',

        className: 'tree-view-node',

        defaultOptions:  {
            idAttribute: 'id',
            parentAttribute: 'parent_id',
            //childViewContainer: '.children'
        },

        regions: {
            nodes: '.children'
        },

        attributes: function() {
            return {
                'data-id': this.model.get(this.getOption('idAttribute')) || this.model.cid,
                'data-parent-id': this.model.get(this.getOption('parentAttribute'))
            };
        },

        initialize: function() {
            Toolbox.View.prototype.initialize.apply(this, arguments);

            this.collection = this.model.children;

            var options = _.extend({}, this.options);

            delete options.model;

            this.childViewOptions = _.extend({}, options, this.getOption('childViewOptions') || {});
        },

       templateContext: function() {
            return {
                hasChildren:  this.collection ? this.collection.length > 0 : false
            };
        },

        getNodesFromModel: function(model) {
            return model.children;
        },

        showNodes: function() {
            var nodes = this.getNodesFromModel(this.model);

            if(nodes && nodes.length) {
                this.showChildView('nodes', new Toolbox.TreeView({
                    template: this.getOption('template'),
                    collection: nodes,
                    childViewOptions: this.childViewOptions
                }));
            }
        },

        onRender: function() {
            this.showNodes();
        }

    });

    return Toolbox;

}));
