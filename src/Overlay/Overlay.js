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

    Toolbox.Overlay = Toolbox.View.extend({

        className: 'overlay',

        template: Toolbox.Template('overlay'),

        defaultOptions: {
            content: false,
            animationDelay: 500,
            visibleClassName: 'visible'
        },

        regions: {
            content: '.overlay-content'
        },

        triggers: {
            'click .overlay-close': 'click:close'
        },

        getContent: function() {
            return this.getOption('content');
        },

        setContent: function(view) {
            this.options.content = view;
            this.showContent(view);
        },

        showContent: function(view) {
            this.showChildView('content', view);
        },

        show: function() {
            var self = this, view = this.getContent();

            var keyupHandler = function(e) {
                if(e.keyCode == 27) {
                    self.hide();
                }
            }

            this.render();

            view.on('before:detach', function() {
                Backbone.$('body').off('keyup', keyupHandler);
            });

            view.on('cancel:click', function() {
                this.hide();
            }, this);

            Backbone.$('body').append(this.$el)
                .on('keyup', keyupHandler)
                .css('overflow', 'hidden');

            this.showContent(view);

            setTimeout(function() {
                self.$el.addClass(self.getOption('visibleClassName'));
            });
        },

        hide: function(callback) {
            var self = this;

            this.$el.removeClass(this.getOption('visibleClassName'));

            setTimeout(function() {
                Backbone.$('body').css('overflow', 'inherit');

                self.getRegion('content').detachView();
                self.$el.remove();

                if(_.isFunction(callback)) {
                    callback.call(self);
                }
            }, this.getOption('animationDelay'));
        },

        onClickClose: function() {
            this.hide();
        },

        onBeforeDestroy: function() {
            Backbone.$('body').css('overflow', 'inherit');
        }

    });

    return Toolbox;

}));
