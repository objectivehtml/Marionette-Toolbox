(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore'], function($, _) {
            return factory(root.Toolbox, $, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('underscore'))
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._);
    }
}(this, function (Toolbox, $, _) {

    'use strict';

    Toolbox.Modal = Toolbox.View.extend({

        template: Toolbox.Template('modal-window'),

        className: 'modal-window-wrapper',

        regions: {
            content: '.modal-content'
        },

        triggers: {
            'click .modal-close': 'close:click'
        },

        defaultOptions: {
            // (array) An array of button objects to add to the modal window
            buttons: [],

            // (object) The content view class
            content: false,

            // (string) The modal window header text
            header: false,

            // (int) The number of milliseconds used for the modal animation
            closeAnimationRate: 500
        },

        events: {
            'click .modal-buttons a': function(e) {
                var buttons = this.getOption('buttons');
                var i = $(e.target).index();

                if(_.isArray(buttons) && buttons[i].onClick) {
                    buttons[i].onClick.call(this, $(e.target));
                    e.preventDefault();
                }
            }
        },

        templateContext: function() {
            return this.options;
        },

        showContentView: function(view) {
            this.showChildView('content', view);
        },

        setContentView: function(view) {
            this.options.content = view;
            this.showContentView(view);
        },

        getContentView: function() {
            return this.getRegion('content').currentView || this.getOption('content');
        },

        show: function() {
            var self = this, view = this.getOption('content');

            this.render();

            view.on('before:detach', function() {
                $('body').off('keyup', keyupHandler);
            });

            view.on('cancel:click', function() {
                this.hide();
            }, this);

            var keyupHandler = function(e) {
                if(e.keyCode == 27) {
                    self.hide();
                }
            }

            $('body').append(this.$el).on('keyup', keyupHandler);

            this.showChildView('content', view);

            setTimeout(function() {
                self.$el.addClass('show');
            });
        },

        hide: function() {
            var self = this;

            this.$el.removeClass('show');

            setTimeout(function() {
                self.getRegion('content').empty();
                self.$el.remove();
            }, this.getOption('closeAnimationRate'));
        },

        onCloseClick: function() {
            this.hide();
        }

    });

    return Toolbox;

}));
