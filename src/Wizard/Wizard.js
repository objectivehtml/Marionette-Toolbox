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

	Toolbox.Wizard = Toolbox.LayoutView.extend({

        className: 'wizard',

        channelName: 'toolbox.wizard',

		template: Toolbox.Template('wizard'),

        defaultOptions: function() {
            return {
                header: false,
                headerTag: 'h2',
                headerTagClassName: 'wizard-header',
                finishedClassName: 'wizard-finished',
                fixedHeightClassName: 'fixed-height',
                hasPanelClassName: 'wizard-panel',
                panelClassName: 'panel panel-default',
                step: 1,
                steps: [],
                finished: false,
                successView: Toolbox.WizardSuccess,
                errorView: Toolbox.WizardError,
                showButtons: true,
                showProgress: true,
                panel: false,
                contentHeight: false
            };
        },

        regions: {
            progress: '.wizard-progress',
            content: '.wizard-content',
            buttons: '.wizard-buttons'
        },

        initialize: function() {
            Toolbox.LayoutView.prototype.initialize.apply(this, arguments);

            this.channel.reply('set:step', function(step) {
                this.setStep(step);
            }, this);

            this.channel.reply('wizard:error', function() {
                this.buttons.empty();
                this.showView(this.getOption('errorView'));
            }, this);

            this.channel.reply('wizard:success', function() {
                this.finish();
                this.setStep(this.getTotalSteps() + 1);
                this.showView(this.getOption('successView'));
            }, this);
        },

        templateHelpers: function() {
            return this.options;
        },

        setStep: function(step) {
            var view = false;

            this.options.step = parseInt(step);

            if(this.options.step < 1) {
                this.options.step = 1;
            }

            if(this.buttons.currentView) {
                this.buttons.currentView.render();
            }

            this.progress.currentView.render();

            if(view = this.getStep(this.options.step)) {
                this.showContent(view);
            }
        },

        showView: function(View) {
            if(View) {
                this.showContent(new View());
            }
        },

        showContent: function(view) {
            if(view) {
                this.content.show(view, {
                    preventDestroy: true
                });

                this.triggerMethod('show:content', view);
            }
        },

        getStep: function(step) {
            return this.getOption('steps')[(step || this.getOption('step')) - 1];
        },

        getTotalSteps: function() {
            return this.getOption('steps').length;
        },

        next: function() {
            this.channel.request('set:step', this.getOption('step') + 1);
        },

        back: function() {
            this.channel.request('set:step', this.getOption('step') - 1);
        },

        finish: function() {
            this.buttons.empty();
            this.options.finished = true;
            this.$el.addClass(this.getOption('finishedClassName'));
        },

        showProgress: function() {
            var view = new Toolbox.WizardProgress({
                wizard: this
            });

            this.progress.show(view);
        },

        showButtons: function() {
            var view = new Toolbox.WizardButtons({
                wizard: this,
                channel: this.channel
            });

            this.buttons.show(view);
        },

        setContentHeight: function(height) {
            height || (height = 400);

            this.$el.find('.wizard-content')
                .addClass(this.getOption('fixedHeightClassName'))
                .css('height', height);
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
