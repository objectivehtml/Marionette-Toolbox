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

	Toolbox.Wizard = Toolbox.View.extend({

        className: 'wizard',

    	template: Toolbox.Template('wizard'),

        regions: {
            progress: '.wizard-progress',
            content: '.wizard-content',
            buttons: '.wizard-buttons'
        },

        events: {
            'keyup': function(event) {
                if(this.getOption('submitFormOnEnter') && event.keyCode === 13) {
                    this.$el.find('form').submit();
                }
            }
        },

        defaultOptions: function() {
            return {
                // (mixed) The wizard's header text. Use `false` for no header.
                header: false,

                // (string) The wizard header HTML element.
                headerTagName: 'h2',

                // (string) The wizard header HTML element's class name
                headerClassName: 'wizard-header',

                // (string) The class name to be appended to the Wizard on completion
                finishedClassName: 'wizard-finished',

                // (string) The class name to be appended to the Wizard on completion
                fixedHeightClassName: 'fixed-height',

                // (string) The class name to be appended to the Wizard if it's displayed as panel
                hasPanelClassName: 'wizard-panel',

                // (string) The class name to be appended to panel
                panelClassName: 'panel panel-default',

                // (mixed) A view class to override the default ButtonView
                buttonView: Toolbox.WizardButtons,

                // (object) An object of options to be passed to the ButtonView
                buttonViewOptions: {},

                // (mixed) A view class to override the default ProgressView
                progressView: Toolbox.WizardProgress,

                // (object) An object of options to be passed to the ProgressView
                progressViewOptions: {},

                // (int) The highest step number the user as gone within the wizard
                highestStep: 1,

                // (int) The current step number of  the wizard
                step: 1,

                // (array) An array of View instances
                steps: [],

                // (bool) Has the wizard completed
                finished: false,

                // (mixed) A view class to override the default SuccessView
                successView: Toolbox.WizardSuccess,

                // (object) An object of options to be passed to the SuccessView
                successViewOptions: {},

                // (mixed) A view class to override the default ErrorView
                errorView: Toolbox.WizardError,

                // (object) An object of options to be passed to the ErrorView
                errorViewOptions: {},

                // (bool) Should show the button bar?
                showButtons: true,

                // (bool) Show the wizard as a panel
                panel: false,

                // (bool) The wizard's content height
                contentHeight: false,

                // (bool) Provide support to trigger a submit event on the current step's form
                submitFormOnEnter: false
            };
        },

        templateContext: function() {
            return this.options;
        },

        setContentHeight: function(height) {
            height || (height = 400);

            this.$el.find('.wizard-content')
                .addClass(this.getOption('fixedHeightClassName'))
                .css('height', height);
        },

        setStep: function(step) {
            var view = false, prevStepView = this.getStepView();

            if(step instanceof Backbone.View) {
                this.options.step = step.getOption('step');
            }
            else {
                this.options.step = parseInt(step);
            }

            if(!this.options.step || this.options.step < 1) {
                this.options.step = 1;
            }

            if(this.getOption('step') > this.getOption('highestStep')) {
                this.options.highestStep = this.getOption('step');
            }

            if(this.getRegion('buttons').currentView) {
                this.getRegion('buttons').currentView.render();
            }

            if(view = this.getStepView()) {
                this.showContent(view);
                view.triggerMethod('wizard:show:step', this.getStepView(), prevStepView, view);
                this.triggerMethod('show:step', this.getStepView(), prevStepView, this);
            }
        },

        showView: function(View, options) {
            var view;

            if(View && (view = new View(options))) {
                this.showContent(view);
            }
        },

        showActivityIndicator: function(options, region) {
            region || (region = this.getRegion('content'));

            var view = new Toolbox.ActivityIndicator(_.extend({
                indicator: 'medium',
                minHeight: '400px'
            }, options));

            region.detachView();
            region.show(view);
        },

        showProgress: function() {
            var ProgressView = this.getOption('progressView');

            if(ProgressView) {
                var view = new ProgressView(_.extend({}, this.getOption('progressViewOptions'), {
                    wizard: this
                }));

                this.showChildView('progress', view);
            }
            else {
                throw new Error('The button view is not a valid class.');
            }
        },

        showButtons: function() {
            var ButtonView = this.getOption('buttonView');

            if(ButtonView) {
                var view = new ButtonView(_.extend({}, this.getOption('buttonViewOptions'), {
                    wizard: this
                }));

                this.showChildView('buttons', view);
            }
            else {
                throw new Error('The button view is not a valid class.');
            }
        },

        showContent: function(view) {
            view.options.wizard = this;

            this.getRegion('content').detachView();
            this.showChildView('content', view);

            view.once('attach', function() {
                view.triggerMethod('wizard:attach');
            }, this);
        },

        getStep: function() {
            return this.getOption('step');
        },

        getStepView: function(step) {
            return this.getOption('steps')[(step || this.getOption('step')) - 1];
        },

        getTotalSteps: function() {
            return this.getOption('steps').length;
        },

        next: function() {
            this.triggerMethod('complete:step', this.getStepView());
            this.setStep(this.getOption('step') + 1);
        },

        back: function() {
            this.setStep(this.getOption('step') - 1);
        },

        finish: function(success, options, View) {
            if(_.isUndefined(success) || success) {
                this.triggerMethod('complete:step', this.getStepView());
                this.triggerMethod('wizard:success', options, View);
            }
            else {
                this.triggerMethod('wizard:error', options, View);
            }
        },

        disableButtons: function() {
            this.getRegion('buttons').currentView.disableButtons();
        },

        disableNextButton: function() {
            this.getRegion('buttons').currentView.disableNextButton();
        },

        disableBackButton: function() {
            this.getRegion('buttons').currentView.disableBackButton();
        },

        disableFinishButton: function() {
            this.getRegion('buttons').currentView.disableFinishButton();
        },

        enableButtons: function() {
            this.getRegion('buttons').currentView.enableButtons();
        },

        enableNextButton: function() {
            this.getRegion('buttons').currentView.enableNextButton();
        },

        enableBackButton: function() {
            this.getRegion('buttons').currentView.enableBackButton();
        },

        enableFinishButton: function() {
            this.getRegion('buttons').currentView.enableFinishButton();
        },

        onShowStep: function(step) {
            this.getRegion('progress').currentView.setActive(step.getOption('step'));
        },

        onCompleteStep: function(step) {
            this.getRegion('progress').currentView.setComplete(step.getOption('step'));
            this.getRegion('progress').currentView.render();
        },

        onWizardError: function(options, ErrorView) {
            options = _.extend({
                wizard: this
            }, this.getOption('errorViewOptions'), options);

            this.showView(ErrorView || this.getOption('errorView'), options);
        },

        onWizardSuccess: function(options, SuccessView) {
            options = _.extend({
                wizard: this
            }, this.getOption('successViewOptions'), options);

            this.getRegion('buttons').empty();
            this.options.step++;
            this.options.finished = true;
            this.$el.addClass(this.getOption('finishedClassName'));
            this.getRegion('progress').currentView.setActive(this.getOption('step'));
            this.showView(SuccessView || this.getOption('successView'), options);
        },

        onDomRefresh: function() {
            if(this.getOption('contentHeight')) {
                this.setContentHeight(this.getOption('contentHeight'));
            }

            if(this.getOption('showProgress')) {
                this.showProgress();
            }

            if(this.getOption('showButtons')) {
                this.showButtons();
            }

            if(this.getOption('panel')) {
                this.$el.addClass(this.getOption('hasPanelClassName'));
            }

            this.setStep(this.getOption('step'));
        }

	});

    return Toolbox;

}));
