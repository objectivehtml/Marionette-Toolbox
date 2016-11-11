(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['marionette.toolbox'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('marionette.toolbox'));
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.Views.ActivityIndicator = Toolbox.Views.ItemView.extend({

        template: Toolbox.Template('activity-indicator'),

        spinning: false,

        options: {
            dimmedBgColor: false,
            dimmed: false,
            autoStart: true,
            position: false,
            minHeight: '0px',
            indicator: {},
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
                },
                'small': {
                    lines: 12, // The number of lines to draw
                    length: 7, // The length of each line
                    width: 1, // The line thickness
                    radius: 7, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                },
                'medium': {
                    lines: 12, // The number of lines to draw
                    length: 14, // The length of each line
                    width: 1, // The line thickness
                    radius: 11, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                },
                'large': {
                    lines: 12, // The number of lines to draw
                    length: 28, // The length of each line
                    width: 1, // The line thickness
                    radius: 20, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                }
            };
        },

        getSpinnerOptions: function() {
            var defaultOptions = this.getOption('defaultIndicator');
            var options = this.getOption('indicator');
            var presets = this.getPresetOptions();

            if(_.isString(options) && presets[options]) {
                options = presets[options];
            }
            else {
                options = {};
            }

            return _.extend({}, defaultOptions, options);
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

        onRender: function() {
            // create the spinner object
            this.spinner = new Spinner(this.getSpinnerOptions());

            // start if options.autoStart is true
            if(this.getOption('autoStart')) {
                this.start();
            }
        }

    });

    return Toolbox;

}));
