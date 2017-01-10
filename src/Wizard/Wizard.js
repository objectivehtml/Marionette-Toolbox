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

        defaultOptions: {
            header: false,
            headerTag: 'h2',
            headerTagClassName: 'wizard-header',
            finishedClassName: 'wizard-finished',
            step: 1,
            steps: [],
            finished: false,
            successView: false,
            errorView: false,
            showButtons: true,
            showProgress: true
        },

        regions: {
            progress: '#wizard-progress',
            content: '#wizard-content',
            buttons: '#wizard-buttons'
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
                this.showView(view);
            }
        },

        showView: function(view) {
            if(view) {
                this.content.show(view, {
                    preventDestroy: true
                });
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

        onDomRefresh: function() {
            if(this.getOption('showProgress')) {
                this.showProgress();
            }

            if(this.getOption('showButtons')) {
                this.showButtons();
            }

            this.setStep(this.getOption('step'));
        }
	});

    return Toolbox;

}));
