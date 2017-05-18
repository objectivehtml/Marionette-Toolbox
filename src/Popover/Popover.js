(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'underscore',
            'backbone',
            'backbone.marionette',
            'tether-browserify'
        ], function(_, Backbone, Marionette, Tether) {
            return factory(root.Toolbox, _, Backbone, Marionette, Tether)
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore'),
            require('backbone'),
            require('backbone.marionette'),
            require('tether-browserify')
        );
    } else {
        root.Toolbox = factory(
            root.Toolbox,
            root._,
            root.Backbone,
            root.Marionette,
            root.Tether
        );
    }
}(this, function (Toolbox, _, Backbone, Marionette, Tether) {

    'use strict';

    Toolbox.Popover = Toolbox.LayoutView.extend({

        template: Toolbox.Template('popover'),

        className: 'popover',

        regions: {
            content: '.popover-content'
        },

        defaultOptions: {

            activityIndicatorView: false,

            activityIndicatorOptions: {
                indicator: 'small'
            },

            // (string) A valid alignment position (top|bottom|left|right)
            alignment: 'top',

            // (object) The content view instance
            contentView: false,

            // (string) The popover header text
            header: false,

            // (string) The popover header HTML tag
            headerTagName: 'h3',

            // (string) The popover header class name
            headerClassName: 'popover-title',

            // (mixed) Define a maxWidth for the popover. If no max width, the
            // width option is used to override the CSS default.
            maxWidth: false,

            // (bool) Should show the close button
            showCloseButton: true,

            // (mixed) Define a set width for the popover
            width: false

        },

        events: {
            'click .popover-close': function(e) {
                this.destroy();
                e.preventDefault();
            }
        },

        templateHelpers: function() {
            return this.options;
        },


        getContentHeight: function() {
            return this.getRegion('content').currentView.$el.outerHeight();
        },

        showActivityIndicator: function(options) {
            var ActivityView = this.getOption('activityIndicatorView') || Toolbox.ActivityIndicator;
            var activityViewOptions = options || this.getOption('activityIndicatorOptions');

            if(!activityViewOptions.minHeight) {
                activityViewOptions.minHeight = this.getContentHeight();
            }

            var view = new ActivityView(activityViewOptions);

            this.showContentView(view);
        },

        hideActivityIndicator: function() {
            this.showContentView();
        },

        showContentView: function(view) {
            this.showChildView('content', view || this.getOption('contentView'));
        },

        setContentView: function(view) {
            this.options.contentView = view;
            this.showContentView();
        },

        onRender: function() {
            this.showContentView();
        },

        onBeforeDetach: function() {
            $('body').off('keyup', this._keyupHandler);
        },

        onBeforeDestroy: function() {
            if(this._tether) {
                this._tether.destroy();
            }

            if(this._parentRegion.el) {
                this._parentRegion.el.remove();
            }
        },

        onDomRefresh: function() {
            var self = this;

            this.$el
                .css({
                    width: this.getOption('width'),
                    maxWidth: this.getOption('maxWidth') || this.getOption('width')
                })
                .addClass(this.getOption('alignment'))
                .show();

            $('body').append(this.$el).on('keyup', function(e) {
                self._keyupHandler(e);
            });
        },

        show: function(el, position) {
            if(!this._parentRegion) {
                var $region = Backbone.$('<div class="popover-region"></div>');

                $region.insertBefore(el);

                this._parentRegion = new Marionette.Region({
                    el: $region.get(0)
                });
            }

            this._parentRegion.show(this);
            this._tether = new Tether({
                target: el,
                element: this.$el.get(0),
                attachment: 'bottom center',
                targetAttachment: 'top center'
            });
        },

        hide: function() {
            this.$el.remove();
        },

        _keyupHandler: function(e) {
            if(e.keyCode == 27) {
                this.hide();
            }
        }

    });

    return Toolbox;

}));
