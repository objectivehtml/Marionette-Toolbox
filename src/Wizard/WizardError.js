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

	Toolbox.WizardError = Toolbox.View.extend({

		template: Toolbox.Template('wizard-error'),

        className: 'wizard-error',

        defaultOptions: {
            errors: [],
            headerTagName: 'h3',
            header: 'Error!',
            errorIcon: 'fa fa-times',
            message: false,
            showBackButton: true,
            backButtonClassName: 'btn btn-lg btn-primary',
            backButtonLabel: 'Go Back',
            backButtonIcon: 'fa fa-long-arrow-left'
        },

        triggers: {
            'click button': 'click:back'
        },

        templateContext: function() {
            return this.options;
        },

        onClickBack: function() {
            this.getOption('wizard').showButtons();
            this.getOption('wizard').setStep(this.getOption('wizard').getOption('step'));
        }

	});

    return Toolbox;

}));
