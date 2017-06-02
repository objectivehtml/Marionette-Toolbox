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

    Toolbox.TagList = Toolbox.UnorderedList.extend({

        tagName: 'ul',

        className: 'tags clearfix',

        _focusDirection: false,

        childView: function(model) {
            var name = this.getOption('name');

            if(this.getOption('multiple') && !name.match(/\[\]$/)) {
                name = name + '[]';
            }

            var value = model.get(
                this.getOption('valueProperty') ||
                this.getOption('labelProperty') ||
                this.getOption('searchProperty')
            );

            var label = model.get(
                this.getOption('labelProperty') ||
                this.getOption('valueProperty') ||
                this.getOption('searchProperty')
            );

            return Toolbox.UnorderedListItem.extend({

                tagName: 'li',

                className: 'tag',

                template: Toolbox.Template('form-tag-list-item'),

                triggers: {
                    'click': 'click:tag:clear'
                },

                templateContext: {
                    __name__: name,
                    __value__: value,
                    __label__: label
                },

                events: {
                    'focus .tag-clear': function(event) {
                        this.$el.addClass('has-focus');
                    },
                    'blur .tag-clear': function(event) {
                        this.$el.removeClass('has-focus');
                    }
                }

            });
        },

        events: {
            'focus input': function() {
                Backbone.$(event.target).parent().addClass('has-focus');
            },
            'blur input': function() {
                Backbone.$(event.target).parent().removeClass('has-focus');
            }
        },

        childViewEvents: {
            'click:tag:clear': function(child, event) {
                this.triggerMethod('click:tag:clear', child, event);
                event.preventDefault();
            }
        },

        /*
        collectionEvents: {
            'add remove update': function(event) {
                this._triggerResize();
            }
        },
        */

        setFocusOnElement: function($el) {
            if($el.length) {
                $el.find('.tag-focusable').focus();
            }
            else {
                this.focus();
            }
        },

        getElementWithNextFocus: function() {
            var focused = this.getFocusedTags();
            var $nextFocus = focused.last().$el.next();

            if(this.getFocusDirection() === 'prev') {
                $nextFocus = focused.first().$el.prev();
            }

            return $nextFocus;
        },

        getTotalFocusedTags: function() {
            return this.getFocusedTags().length;
        },

        getFocusDirection: function() {
            return this._focusDirection;
        },

        setFocusDirection: function(direction) {
            this._focusDirection = direction;
        },

        getTags: function() {
            return new this.children.constructor(this.children.filter(function(child) {
                return child.$el.hasClass('tag');
            }));
        },

        getFocusedTags: function() {
            return new this.children.constructor(this.children.filter(function(child) {
                return child.$el.hasClass('tag has-focus');
            }));
        },

        removeFocusedTags: function() {
            this.getFocusedTags().each(function(view) {
                this.collection.remove(view.model);
            }, this);
        },

        getInputField: function() {
            return this.$el.find('.tag-field-input');
        },

        blur: function() {
            this.getInputField().blur();
        },

        focus: function() {
            this.getInputField().focus();
        },

        deselectAll: function() {
            this.$el.find('.tag :focus').blur();
            this.$el.find('.tag').removeClass('has-focus');
            this.focus();
        },

        selectAll: function() {
            if(this.collection.length) {
                this.$el.find('.tag-clear').first().focus();
                this.$el.find('.tag').addClass('has-focus');
            }
        },

        clearSelected: function() {
            this.$el.find('tag.has-focus').click();
        },

        attachHtml: function(collectionView, childView, index) {
            if (collectionView._isBuffering) {
                collectionView._bufferedChildren.splice(index, 0, childView);
            } else {
                if(childView instanceof Toolbox.InputField) {
                    this.appendChildren(this.el, childView.el);
                }
                else {
                    this.beforeEl(this.children.first().el, childView.el);
                }
            }
        },

        shiftFocusLeft: function(multiple) {
            var tags = this.getTags();
            var focused = this.getFocusedTags();
            var $focus = this.children.first().$el;

            if(focused.length) {
                var $prev = focused.first().$el.prev();

                if($prev.length) {
                    $focus = $prev;
                }
            }
            else if(tags.last() && tags.last().$el) {
                $focus = tags.last().$el;
            }

            this._focusTag($focus, focused, multiple);
        },

        shiftFocusRight: function(multiple) {
            var tags = this.getTags();
            var focused = this.getFocusedTags();
            var $focus = tags.first() ? tags.first().$el : this.children.first().$el;

            if(focused.length) {
                var $next = focused.last().$el.next();

                if($next.length) {
                    $focus = $next;
                }
            }

            this._focusTag($focus, focused, multiple);
        },

        onDomRefresh: function() {
            this._triggerResize();
        },

        _focusTag: function($focus, focused, multiple) {
            if(multiple) {
                $focus.addClass('has-focus');

                if(this.$el.find(':focus').is('.tag-field-input')) {
                    $focus.find('.tag-focusable').focus();
                }
            }
            else {
                focused.each(function(view) {
                    view.$el.removeClass('has-focus');
                });

                $focus.find('.tag-focusable').focus();
            }
        },

        _triggerResize: function() {
            var self = this;

            setTimeout(function() {
                self.triggerMethod('resize', self);
            });
        }

    });

    return Toolbox;

}));
