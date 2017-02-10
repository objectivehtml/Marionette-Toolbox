(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jquery', 'spin.js'], function(_, $, Spinner) {
            return factory(root.Toolbox, _, $, Spinner);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('jquery'), require('spin.js'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.$, root.Spinner);
    }
}(this, function (Toolbox, _, $, Spinner) {

    'use strict';

    Toolbox.ActivityIndicator = Toolbox.ItemView.extend({

        template: Toolbox.Template('activity-indicator'),

        spinning: false,

        defaultOptions: {
            label: false,
            labelFontSize: false,
            dimmedBgColor: false,
            dimmed: false,
            autoStart: true,
            position: false,
            minHeight: '0px',
            indicator: {},
            labelOffset: 0,
            defaultIndicator: {
                lines: 11, // The number of lines to draw
                length: 15, // The length of each line
                width: 3, // The line thickness
                radius: 13, // The radius of the inner circle
                corners: 4, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                color: '#000', // #rgb or #rrggbb or array of colors
                speed: 1, // Rounds per second
                trail: 40, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: true, // Whether to use hardware acceleration
                className: 'activity-indicator-spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: '50%', // Top position relative to parent
                left: '50%' // Left position relative to parent
            }
        },

        templateHelpers: function() {
            return this.options;
        },

        getPresetOptions: function() {
            return {
                'tiny': {
                    lines: 12, // The number of lines to draw
                    length: 4, // The length of each line
                    width: 1, // The line thickness
                    radius: 4, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 15,
                },
                'small': {
                    lines: 12, // The number of lines to draw
                    length: 7, // The length of each line
                    width: 1, // The line thickness
                    radius: 7, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 20,
                },
                'medium': {
                    lines: 12, // The number of lines to draw
                    length: 14, // The length of each line
                    width: 1, // The line thickness
                    radius: 11, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 30,
                },
                'large': {
                    lines: 12, // The number of lines to draw
                    length: 28, // The length of each line
                    width: 1, // The line thickness
                    radius: 20, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 60
                }
            };
        },

        initialize: function() {
            Toolbox.ItemView.prototype.initialize.apply(this, arguments);

            var resizeTimer, self = this;

            $(window).resize(function() {
                self.$el.find('.activity-indicator-label').css({top: ''});
                self.positionLabel();
            });
        },

        positionLabel: function() {
            if(this.spinner && this.getOption('label')) {
                var $label = this.$el.find('.activity-indicator-label');
                var height = $label.outerHeight();
                var offset = Toolbox.ViewOffset($label.get(0));

                $label.children().css({
                    top: this.spinner.opts.labelOffset || 0
                });
            }
        },

        setLabel: function(value) {
            this.$el.find('.activity-indicator-label').html(this.options.label = value);
        },

        getSpinnerOptions: function() {
            var defaultIndicator = this.getOption('defaultIndicator');
            var indicator = this.getOption('indicator');
            var presets = this.getPresetOptions();

            if(_.isString(indicator) && presets[indicator]) {
                indicator = presets[indicator];
            }
            else if(typeof indicator !== "object"){
                indicator = {};
            }

            return _.extend({}, defaultIndicator, indicator);
        },

        getSpinnerDom: function() {
            return this.$el.find('.activity-indicator').get(0);
        },

        start: function() {
            this.spinning = true;
            this.spinner.spin(this.getSpinnerDom());
            this.triggerMethod('start');
        },

        stop: function() {
            this.spinning = false;
            this.spinner.stop();
            this.triggerMethod('stop');
        },

        onDomRefresh: function() {
            var self = this;

            // create the spinner object
            this.spinner = new Spinner(this.getSpinnerOptions());

            // start if options.autoStart is true
            if(this.getOption('autoStart')) {
                this.start();
            }

            setTimeout(function() {
                self.positionLabel();
            });
        }

    });

    return Toolbox;

}));
