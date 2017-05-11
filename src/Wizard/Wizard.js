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

	Toolbox.Wizard = Toolbox.LayoutView.extend({

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
                header: false,
                headerTagName: 'h2',
                headerClassName: 'wizard-header',
                finishedClassName: 'wizard-finished',
                fixedHeightClassName: 'fixed-height',
                hasPanelClassName: 'wizard-panel',
                panelClassName: 'panel panel-default',
                buttonView: Toolbox.WizardButtons,
                buttonViewOptions: {},
                progressView: Toolbox.WizardProgress,
                progressViewOptions: {},
                highestStep: 1,
                step: 1,
                steps: [],
                finished: false,
                successView: Toolbox.WizardSuccess,
                successViewOptions: {},
                errorView: Toolbox.WizardError,
                errorViewOptions: {},
                showButtons: true,
                panel: false,
                contentHeight: false,
                submitFormOnEnter: false
            };
        },

        templateHelpers: function() {
            return this.options;
        },

        resetRegions: function(view) {
            if(view.regions && view.regionManager) {
                view.regionManager.emptyRegions();
                view.regionManager.addRegions(view.regions);
            }
        },

        setContentHeight: function(height) {
            height || (height = 400);

            this.$el.find('.wizard-content')
                .addClass(this.getOption('fixedHeightClassName'))
                .css('height', height);
        },

        setStep: function(step) {
            var view = false;

            this.options.step = parseInt(step);

            if(this.options.step < 1) {
                this.options.step = 1;
            }

            this.progress.currentView.setActive(this.getOption('step'));

            if(this.getOption('step') > this.getOption('highestStep')) {
                this.options.highestStep = this.getOption('step')
            }

            if(this.buttons.currentView) {
                this.buttons.currentView.render();
            }

            if(view = this.getStep()) {
                this.showContent(view);
            }
        },

        showView: function(View, options) {
            if(View) {
                this.showContent(new View(options));
            }
        },

        showActivityIndicator: function(options, region) {
            region || (region = this.content);

            var view = new Toolbox.ActivityIndicator(_.extend({
                indicator: 'medium',
                minHeight: '400px'
            }, options));

            region.show(view, {
                preventDestroy: true
            });
        },

        showProgress: function() {
            var View = this.getOption('progressView');

            if(View) {
                var view = new View(_.extend({}, this.getOption('progressViewOptions'), {
                    wizard: this
                }));

                this.progress.show(view);
            }
            else {
                throw new Error('The button view is not a valid class.');
            }
        },

        showButtons: function() {
            var View = this.getOption('buttonView');

            if(View) {
                var view = new View(_.extend({}, this.getOption('buttonViewOptions'), {
                    wizard: this
                }));

                this.buttons.show(view);
            }
            else {
                throw new Error('The button view is not a valid class.');
            }
        },

        showContent: function(view) {
            if(view) {
                view.options.wizard = this;

                this.content.show(view, {
                    preventDestroy: true
                });

                view.once('attach', function() {
                    this.resetRegions(view);
                    view.triggerMethod('wizard:attach');
                }, this);

                view.triggerMethod('wizard:show:step', this.getOption('step'), view);
                this.triggerMethod('show:step', this.getOption('step'), this);
            }
        },

        getStep: function(step) {
            return this.getOption('steps')[(step || this.getOption('step')) - 1];
        },

        getTotalSteps: function() {
            return this.getOption('steps').length;
        },

        next: function() {
            this.triggerMethod('complete:step', this.getOption('step'));
            this.setStep(this.getOption('step') + 1);
        },

        back: function() {
            this.setStep(this.getOption('step') - 1);
        },

        onShowStep: function(step) {
            this.progress.currentView.setActive(step);
            this.progress.currentView.render();
        },

        onCompleteStep: function(step) {
            this.progress.currentView.setComplete(step);
            this.progress.currentView.render();
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

            this.buttons.empty();
            this.options.step++;
            this.options.finished = true;
            this.$el.addClass(this.getOption('finishedClassName'));
            this.showView(SuccessView || this.getOption('successView'), options);
        },

        finish: function(success, options, View) {
            if(_.isUndefined(success) || success) {
                this.triggerMethod('complete:step', this.getTotalSteps());
                this.triggerMethod('wizard:success', options, View);
            }
            else {
                this.triggerMethod('wizard:error', options, View);
            }
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
        },

        disableButtons: function() {
            this.buttons.currentView.disableButtons();
        },

        disableNextButton: function() {
            this.buttons.currentView.disableNextButton();
        },

        disableBackButton: function() {
            this.buttons.currentView.disableBackButton();
        },

        disableFinishButton: function() {
            this.buttons.currentView.disableFinishButton();
        },

        enableButtons: function() {
            this.buttons.currentView.enableButtons();
        },

        enableNextButton: function() {
            this.buttons.currentView.enableNextButton();
        },

        enableBackButton: function() {
            this.buttons.currentView.enableBackButton();
        },

        enableFinishButton: function() {
            this.buttons.currentView.enableFinishButton();
        }

	});

    return Toolbox;

}));
