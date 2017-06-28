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

    Toolbox.TagPredictions = Toolbox.UnorderedList.extend({

        tagName: 'ul',

        className: 'tag-field-cursor-predictions',

        options: {
            searchProperty: false
        },

        events: {
            'click .tag-clear-prediction': function(e) {
                this.triggerMethod('clear:prediction');
                e.preventDefault();
            }
        },

        childView: function(model) {
            var searchProperty = this.getOption('searchProperty');

            return Toolbox.UnorderedListItem.extend({

                tagName: 'li',

                className: 'tag-field-cursor-prediction',

                template: Toolbox.Template('form-tag-prediction-item'),

                templateContext: function() {
                    return {
                        label: this.model.get(searchProperty)
                    };
                },

                activate: function() {
                    this.$el.addClass('active');
                },

                deactivate: function() {
                    this.$el.removeClass('active');
                }

            });
        },

        activate: function(view) {            
            var child = this.children.findByModel(view.model);

            this.deactivate(this.getActiveView());

            child.activate();

            this.triggerMethod('activate', child);
        },

        deactivate: function(view) {
            if(view) {
                var child = this.children.findByModel(view.model);

                this.children.find(view).deactivate();

                this.triggerMethod('deactivate', child);
            }
            else {
                this.children.each(function(item) {
                    item.deactivate();
                });

                this.triggerMethod('deactivate');
            }
        },

        changePredictionUp: function(text) {
            var active = this.getActiveView();
            var index = active.$el.index() - 1;

            if(index < 0) {
                index = this.children.length - 1;
            }

            var next = this.children.findByIndex(index);

            this.activate(next);
            this.hideTextInPrediction(text);
            this.triggerMethod('change:prediction:up', text, next);
        },

        changePredictionDown: function(text) {
            var active = this.getActiveView();
            var index = active.$el.index() + 1;

            if(index > this.children.length - 1) {
                index = 0;
            }

            var next = this.children.findByIndex(index);

            this.activate(next);
            this.hideTextInPrediction(text);
            this.triggerMethod('change:prediction:down', text, next);
        },

        getActiveElement: function() {
            return this.$el.find('.active');
        },

        getActiveText: function() {
            return this.getActiveElement().text().trim();
        },

        getActiveView: function() {
            var active = this.children.filter(function(view) {
                return view.$el.hasClass('active');
            });

            return active ? active[0] : null;
        },

        hideTextInPrediction: function(text) {
            var $active = this.$el.find('.active');

            if($active.length) {
                var regex = new RegExp('^(' + text + ')', 'i');

                if(!text || !this.getActiveText().match(regex)) {
                    $active.removeClass('active');
                }
                else {
                    $active.find('.tag-prediction-label').html(function(index, html) {
                        return $active.find('.tag-prediction-label').text()
                            .replace(regex, '<span class="tag-input-value">$1</span>')
                            .replace(/(\>)\s/g, '$1&nbsp;');
                    });
                }
            }
        },

        onReset: function() {
            this.$el.removeClass('hide');
        }

    });

    return Toolbox;

}));
