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

    Toolbox.Tree = Backbone.Collection.extend({

        hasResetOnce: false,

        defaultOptions: {
            childViewOptions: false,
            collectionClass: Backbone.Collection,
            originalCollection: false,
            idAttribute: 'id',
            parentAttribute: 'parent_id'
        },

        initialize: function(collection, options) {
            Backbone.Collection.prototype.initialize.call(this, [], options);

            this.options = _.extend({}, this.defaultOptions, this.options);

            if(!this.options.originalCollection) {
                this.options.originalCollection = collection;
            }

            if(this.template && !this.options.childViewOptions) {
                this.options.childViewOptions = {
                    template: this.template
                };
            }

            this.on('after:initialize', function() {
                this.buildTree(collection);
            }, this);
        },

        reset: function() {
            // Hack to override the default Collection functionality
            // inherited by the prototype.
            if(!this.hasResetOnce) {
                this.hasResetOnce = true;
                this.trigger('after:initialize');
                return;
            }

            Backbone.Collection.prototype.reset.apply(this, arguments);
        },

        buildTree: function(data) {
            this.reset();

            if(data.toJSON) {
                data = data.toJSON();
            }

            data = new Backbone.Collection(data);

            while (data.length > 0) {
                var parent = null, removeModels = [];

                data.each(function(model) {
                    var child = null;
                    var parentId = this.getParentId(model);

                    if(_.isNull(parentId)) {
                        child = this.add(model);
                    }
                    else if (parent = this.findParentNode(model)) {
                        child = this.appendNode(model, parent);
                    }

                    if(child) {
                        data.remove(child);
                    }
                }, this);
            }
        },

        getParentId: function(model) {
            if(!model) {
                return null;
            }

            return model.get(this.options.parentAttribute);
        },

        getId: function(model) {
            return model.get(this.options.idAttribute);
        },

        appendNode(child, parent) {
            if(!parent.children) {
                var Collection = this.options.collectionClass;

                parent.children = new Collection();
            }

            parent.children.add(child);

            return child;
        },

        findParentNode: function(child, collection, debug) {
            var parent = null;

            if(!collection) {
                collection = this;
            }

            collection.each(function(model) {
                if(this.getParentId(child) == this.getId(model)) {
                    parent = model;
                }
                else if(model.children) {
                    parent = this.findParentNode(child, model.children);
                }
            }, this);

            return parent;
        },

        toJSON: function() {
            function parse(collection) {
                var row = [];

                collection.each(function(model) {
                    var child = model.toJSON();

                    if(model.children) {
                        child.children = parse(model.children);
                    }

                    row.push(child);
                });

                return row;
            }

            return parse(this);
        },

        toString: function() {
            return JSON.stringify(this.toJSON());
        }

    });

    Toolbox.TreeViewNode = Toolbox.CompositeView.extend({

        getTemplate: function() {
            if(!this.getOption('template')) {
                throw new Error('A template option must be set.');
            }

            return this.getOption('template');
        },

        tagName: 'li',

        options: {
            childViewContainer: '.children'
        },

        initialize: function() {
            Toolbox.CompositeView.prototype.initialize.apply(this, arguments);

            this.collection = this.model.children;

            if(this.getOption('template')) {
                this.childViewOptions = _.extend({}, {
                    template: this.getOption('template')
                }, this.getOption('childViewOptions') || {});
            }
        },

        templateHelpers: function() {
            return {
                hasChildren:  this.collection ? this.collection.length > 0 : false
            };
        }

	});

    Toolbox.TreeView = Toolbox.CollectionView.extend({

        childView: Toolbox.TreeViewNode,

        tagName: 'ul',

        initialize: function() {
            Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

            if(this.getOption('template')) {
                this.childViewOptions = _.extend({}, {
                    template: this.getOption('template')
                }, this.getOption('childViewOptions') || {});
            }

            console.log('Toolbox', this);
        }

	});

    return Toolbox;

}));
