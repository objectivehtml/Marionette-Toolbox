(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox)
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.InlineEditor = Toolbox.LayoutView.extend({

        template: Toolbox.Template('inline-editor'),

        className: 'inline-editor-wrapper',

        defaultOptions: {
            // (string) The attribute in the model to edit
            attribute: false,

            // (object) The form input view object
            formInputView: false,

            // (object) The form input view object options
            formInputViewOptions: false,

            // (srting) The class name to add to the field while it is being editted.
            edittingClassName: 'inline-editor-editting',

            // (bool) Allow the field to have a null value
            allowNull: false,

            // (int) The keycode to save the field data
            saveKeycode: 13,

            // (int) The keycode to cancel the field data
            cancelKeycode: 27,
        },

        regions: {
            input: '.inline-editor-field',
            indicator: '.inline-editor-activity-indicator'
        },

        triggers: {
            'click .inline-editor-label': 'label:click'
        },

        createFormInputView: function() {
            var t = this, View = this.getOption('formInputView');

            if(!View) {
                View = Toolbox.InputField;
            }

            var options = _.extend({
                value: this.model.get(this.getOption('attribute')),
                model: this.model
            }, this.getOption('formInputViewOptions'));

            var view = new View(options);

            view.on('blur', function() {
                t.blur();
            });

            view.$el.on('keypress', function(e) {
                if(e.keyCode === t.getOption('saveKeycode')) {
                    if(t.getOption('allowNull') || !t.getOption('allowNull') && !t.isNull()) {
                        t.blur();
                    }

                    e.preventDefault();
                }
            });

            view.$el.on('keyup', function(e) {
                if (e.keyCode === t.getOption('cancelKeycode')) {
                    t.cancel();
                    e.preventDefault();
                };
            });

            return view;
        },

        showActivityIndicator: function() {
            var view = new Toolbox.ActivityIndicator({
                indicator: 'tiny'
            });

            this.indicator.show(view);
        },

        hideActivityIndicator: function() {
            this.indicator.empty();
        },

        isNull: function() {
            return this.getInputValue() === '' ? true : false;
        },

        setLabelHtml: function(html) {
            this.$el.find('.inline-editor-label').html(html);
        },

        hasChanged: function() {
            return this.getModelValue() !== this.getInputValue();
        },

        cancel: function() {
            this.blur();
            this.triggerMethod('cancel');
        },

        blur: function() {
            if(this.hasChanged()) {
                this.save();
            }
            else {
                this.$el.removeClass(this.getOption('edittingClassName'));
            }

            this.triggerMethod('blur');
        },

        focus: function() {
            this.$el.addClass(this.getOption('edittingClassName'));
            this.input.currentView.focus();
            this.triggerMethod('focus');
        },

        getModelValue: function() {
            return this.model.get(this.getOption('attribute'));
        },

        getInputValue: function() {
            return this.input.currentView.getInputValue();
        },

        getFormData: function() {
            var data = {};
            var name = this.getOption('attribute');

            data[name] = this.getInputValue();

            return data;
        },

        onChange: function(value) {
            this.setLabelHtml(value);
        },

        onBeforeSave: function() {
            this.showActivityIndicator();
        },

        onAfterSave: function() {
            this.hideActivityIndicator();

            if(this.getOption('allowNull') || !this.getOption('allowNull') && !this.isNull()) {
                this.blur();
            }
        },

        save: function() {
            var t = this;

            if(this.model) {
                this.triggerMethod('before:save');

                this.model.save(this.getFormData(), {
                    success: function(model, response) {
                        t.triggerMethod('save:success', model, response);
                        t.triggerMethod('after:save', model, response);
                        t.triggerMethod('change', t.getInputValue());
                    },
                    error: function(model, response) {
                        t.triggerMethod('save:error', model, response);
                        t.triggerMethod('after:save', model, response);
                    }
                });
            }
            else {
                this.trigger('change', this.getInputValue());
            }
        },

        onLabelClick: function() {
            this.focus();
        },

        onRender: function() {
            this.setLabelHtml(this.getModelValue());
        },

        onShow: function() {
            this.input.show(this.createFormInputView());
        }

	});

    return Toolbox;

}));
