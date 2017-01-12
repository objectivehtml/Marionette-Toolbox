(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore'], function(_) {
            return factory(root.Toolbox, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._);
    }
}(this, function (Toolbox, _) {

    'use strict';

	Toolbox.WizardButtons = Toolbox.ItemView.extend({

        template: Toolbox.Template('wizard-buttons'),

        className: 'wizard-buttons-wrapper',

        channelName: 'toolbox.wizard',

        options: {
            wizard: false,
            buttonSizeClassName: 'btn-md',
            defaultButtonClassName: 'btn btn-default',
            primaryButtonClassName: 'btn btn-primary',
            disabledClassName: 'disabled',
            finishLabel: 'Finish',
            nextLabel: 'Next',
            nextIcon: 'fa fa-long-arrow-right',
            backLabel: 'Back',
            backIcon: 'fa fa-long-arrow-left'
        },

        triggers: {
            'click .back:not(.disabled)': 'click:back',
            'click .next:not(.disabled)': 'click:next',
            'click .finish:not(.disabled)': 'click:finish'
        },

        disableButton: function(button) {
            this.$el.find('.'+button).addClass(this.getOption('disabledClassName'));
        },

        templateHelpers: function() {
            var step = this.getOption('wizard').getOption('step');
            var total =  this.getOption('wizard').getOption('steps').length

            return _.extend({}, this.options, {
                isFirstStep: step == 1,
                isLastStep: step == total,
                totalSteps: total
            }, this.getOption('wizard').options);
        },

        onClickBack: function() {
            var response = this.getOption('wizard').getStep().triggerMethod('click:back');

            if(typeof response === "undefined" || response === true) {
                this.getOption('wizard').back();
            }
        },

        onClickNext: function() {
            var response = this.getOption('wizard').getStep().triggerMethod('click:next');

            if(typeof response === "undefined" || response === true) {
                this.getOption('wizard').next();
            }
        },

        onClickFinish: function() {
            this.channel.request('wizard:success');
        }

    });

    return Toolbox;

}));
