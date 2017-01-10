(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.WizardButtons = Toolbox.ItemView.extend({

        template: Toolbox.Template('wizard-buttons'),

        channelName: 'toolbox.wizard',

        options: {
            wizard: false
        },

        triggers: {
            'click .back': 'click:back',
            'click .next': 'click:next',
            'click .finish': 'click:finish'
        },

        templateHelpers: function() {
            var step = this.getOption('wizard').getOption('step');
            var total =  this.getOption('wizard').getOption('steps').length

            return _.extend({}, {
                isFirstStep: step == 1,
                isLastStep: step == total,
                totalSteps: total
            }, this.getOption('wizard').options);
        },

        initialize: function() {
            Toolbox.ItemView.prototype.initialize.apply(this, arguments);

            /*
            this.channel.reply('set:step', function(step) {
                console.log('render');
                this.render();
            }, this);
            */
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
