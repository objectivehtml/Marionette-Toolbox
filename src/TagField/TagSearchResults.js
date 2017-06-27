(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'backbone.marionette'], function(Backbone, Marionette) {
            return factory(root.Toolbox, Backbone, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('backbone'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.Backbone, root.Marionette);
    }
}(this, function (Toolbox, Backbone, Marionette) {

    'use strict';

    Toolbox.TagSearchResults = Toolbox.UnorderedList.extend({

        tagName: 'ul',

        className: 'tag-field-search-results',

        childView: function(model) {
            var label = model.get(
                this.getOption('labelProperty') ||
                this.getOption('valueProperty') ||
                this.getOption('searchProperty')
            );

            return Toolbox.UnorderedListItem.extend({

                tagName: 'li',

                className: 'tag-field-search-result',

                template: Toolbox.Template('form-tag-result-item'),

                templateContext: {
                    __label__: label
                },

                events: {
                    'keypress a': function(e) {
                        if(e.keyCode == 32) {
                            this.triggerMethod('click', this, e);
                            e.preventDefault();
                        }
                    }
                },

                triggers: {
                    'mouseenter': 'mouseenter',
                    'mouseleave': 'mouseleave',
                    'mousedown': 'mousedown',
                    'mouseup': 'mouseup',
                    'touchstart': 'touchstart',
                    'touchend': 'touchend',
                    'click': 'click'
                },

                activate: function() {
                    if(!this.$el.hasClass('active')) {
                        this.$el.addClass('active');
                    }
                },

                deactivate: function() {
                    if(this.$el.hasClass('active')) {
                        this.$el.removeClass('active');
                    }
                }

            });
        },

        childViewTriggers: {
            'mouseenter': 'result:mouseenter',
            'mouseleave': 'result:mouseleave',
            'mousedown': 'result:mousedown',
            'mouseup': 'result:mouseup',
            'touchstart': 'result:touchstart',
            'touchend': 'result:touchend',
            'click': 'result:click'
        },

        collectionEvents: {
            'add remove update': function() {
                if(this.children.first()) {
                    this.children.first().activate();
                }
            }
        },

        getActiveElement: function() {
            return this.$el.find('.active');
        },

        getActiveView: function() {
            var active = this.children.filter(function(view) {
                return view.$el.hasClass('active');
            });


            return active ? active[0] : null;
        },

        activate: function(view) {
            var child = this.children.findByModel(view.model);

            if(child) {
                this.deactivate();
                child.activate();
                this.triggerMethod('activate', child);
            }
        },

        deactivate: function(view) {
            if(view) {
                var child = this.children.findByModel(view.model);

                child.deactivate();

                this.triggerMethod('deactivate', child);
            }
            else {
                this.children.each(function(child) {
                    child.deactivate();
                });

                this.triggerMethod('deactivate');
            }
        }

    });

    return Toolbox;

}));
