
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone', 'backbone.marionette'], function($, _, Backbone) {
            return factory(root.Toolbox, $, _, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, Backbone);
    }
}(this, function (Toolbox, _, Backbone) {

    'use strict';

    function transferNodeAfter(event, from, to) {
        var fromModel = from.collection.find({id: $(event.relatedTarget).data('id')});
        var toModel = to.collection.where({id: $(event.target).data('id')});

        from.collection.removeNode(fromModel);
        to.collection.appendNodeAfter(fromModel, toModel);
    }

    function transferNodeBefore(event, from, to) {
        var fromModel = from.collection.find({id: $(event.relatedTarget).data('id')});
        var toModel = to.collection.where({id: $(event.target).data('id')});

        from.collection.removeNode(fromModel);
        to.collection.appendNodeBefore(fromModel, toModel);
    }

    function transferNodeChildren(event, from, to) {
        var fromModel = from.collection.find({id: $(event.relatedTarget).data('id')});
        var toModel = to.collection.where({id: $(event.target).data('id')});

        from.collection.removeNode(fromModel);
        to.collection.appendNode(fromModel, toModel, {
            at: 0
        });
    }

    Toolbox.SelectionPool = Toolbox.LayoutView.extend({

        template: Toolbox.Template('selection-pool'),

        className: 'selection-pool',

        regions: {
            available: '.available-pool',
            selected: '.selected-pool'
        },

        defaultOptions: {
            available: [],
            selected: [],
            height: false,
            // nestable: true,
            doneTypingThreshold: 500,
            likenessThreshold: 75
        },

        templateHelpers: function() {
            return this.options;
        },

        showAvailablePool: function() {
			var view = new Toolbox.SelectionPoolTreeView({
                template: Toolbox.Template('selection-pool-item'),
				collection: this.getOption('available'),
                nestable: false
			});

            view.on('drop:before', function(event) {
                transferNodeBefore(
                    event, this.selected.currentView, this.available.currentView
                );
            }, this);

            view.on('drop:after', function(event) {
                transferNodeAfter(
                    event, this.selected.currentView, this.available.currentView
                );
            }, this);

            view.on('drop:children', function(event) {
                transferNodeChildren(
                    event, this.selected.currentView, this.available.currentView
                );
            }, this);

            view.options.originalAvailableCollection = view.collection.clone();

            this.available.show(view);
        },

        showSelectedPool: function() {
			var view = new Toolbox.SelectionPoolTreeView({
                template: Toolbox.Template('selection-pool-item'),
				collection: this.getOption('selected'),
                nestable: false
                //nestable: this.getOption('nestable'),
			});

            view.on('drop:before', function(event) {
                transferNodeBefore(
                    event, this.available.currentView, this.selected.currentView
                );
            }, this);

            view.on('drop:after', function(event) {
                transferNodeAfter(
                    event, this.available.currentView, this.selected.currentView
                );
            }, this);

            view.on('drop:children', function(event) {
                transferNodeChildren(
                    event, this.available.currentView, this.selected.currentView
                );
            }, this);

            this.selected.show(view);
        },

        contains: function(subject, string) {
            var contains = false;

            _.each(string.split(' '), function(value) {
                if(!contains && subject.toUpperCase().includes(value.toUpperCase())) {
                    contains = true;
                    return false;
                }
            }, this);

            if(!contains) {
                var comparison = new Toolbox.Levenshtein(string.toUpperCase(), subject.toUpperCase());

                if(comparison.distance / subject.length * 100 - 100 > this.getOption('likenessThreshold')) {
                    contains = true;
                }
            }

            return contains;
        },

        search: function(collection, query) {
            return new Backbone.Collection(collection.filter(function(model) {
                var found = false;

                _.each(model.toJSON(), function(value, key) {
                    if(this.contains.call(this, value, query)) {
                        found = model;
                    }
                }, this);

                if(found) {
                    return true;
                }
            }, this));
        },

        onDoneTyping: function(value) {
            this.available.currentView.collection = this.search(this.available.currentView.getOption('originalCollection'), value);
            this.available.currentView.render();
        },

        onDomRefresh: function() {
            var self = this;

            //setup before functions
            var typingTimer;

            this.$el.find('.selection-pool-search input').keyup(function () {
                var value = $(this).val();
                clearTimeout(typingTimer);
                typingTimer = setTimeout(function() {
                    self.triggerMethod('done:typing', value);
                }, self.getOption('doneTypingThreshold'));
            });

            this.$el.find('.selection-pool-search keydown').keyup(function () {
                clearTimeout(typingTimer);
            });

            this.$el.find('.droppable-pool').each(function() {
                var $pool = $(this);

                interact(this)
                    .dropzone({
                        accept: $(this).data('accept'),
                        ondrop: function(event) {
                            var from = self.selected.currentView;
                            var to = self.available.currentView;

                            if($(event.target).hasClass('selected-pool')) {
                                from = self.available.currentView;
                                to = self.selected.currentView;
                            }

                            var model = from.collection.where({
                                id: $(event.relatedTarget).data('id')
                            });

                            from.collection.removeNode(model);
                            to.collection.appendNode(model, null, {at: $(event.relatedTarget).index()});

                            self.$el.removeClass('dropping');
                            $pool.parent().removeClass('droppable');
                        },
                        ondragenter: function (event) {
                            self.$el.addClass('dropping');
                            $pool.parent().addClass('droppable');
                        },
                        ondragleave: function (event) {
                            self.$el.removeClass('dropping');
                            $pool.parent().removeClass('droppable');
                        }
                    });
            });
        },

        onShow: function() {
            this.showAvailablePool();
            this.showSelectedPool();
        }

    });

    return Toolbox;

}));
