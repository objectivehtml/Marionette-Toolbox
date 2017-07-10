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
}(this, function (Toolbox,  _) {

    'use strict';

    Toolbox.BaseField = Toolbox.View.extend({

        formModel: false,

        className: 'form-group',

        defaultTriggers: {
            'change {{triggerSelector}}': {
                event: 'change',
                preventDefault: false
            },
            'focus {{triggerSelector}}': {
                event: 'focus',
                preventDefault: false
            },
            'blur {{triggerSelector}}': {
                event: 'blur',
                preventDefault: false
            },
            'click {{triggerSelector}}': {
                event: 'click',
                preventDefault: false
            },
            'keyup {{triggerSelector}}': {
                event: 'keyup',
                preventDefault: false
            },
            'keydown {{triggerSelector}}': {
                event: 'keydown',
                preventDefault: false
            },
            'keypress {{triggerSelector}}': {
                event: 'keypress',
                preventDefault: false
            }
        },

        defaultOptions: {
            id: false,
            label: false,
            description: false,
            descriptionClassName: 'description',
            name: false,
            value: false,
            header: false,
            labelClassName: 'control-label',
            inputClassName: 'form-control',
            headerTagName: 'h4',
            triggerSelector: '.form-control',
            updateModel: true
        },

        templateContext: function() {
            return this.options;
        },

        initialize: function() {
            Toolbox.View.prototype.initialize.apply(this, arguments);

            this.triggers = _.extend({}, this.getDefaultTriggers(), this.triggers);
            this.delegateEvents();
        },

        blur: function() {
            this.getInputField().blur();
        },

        focus: function() {
            this.getInputField().focus();
        },

        save: function(value) {
            if(_.isUndefined(value)) {
                value = this.getInputValue();
            }

            this.options.value = value;

            if(this.getOption('updateModel') === true && this.model) {
                this.model.set(this.getOption('name'), value);
            }
        },

        getDefaultTriggers: function() {
            var t = this, defaultTriggers = {};

            _.each(this.defaultTriggers, function(trigger, key) {
                _.each(t.options, function(value, name) {
                    if(_.isString(value)) {
                        key = key.replace('{{'+name+'}}', value);
                    }
                });

                defaultTriggers[key.trim()] = trigger;
            });

            return defaultTriggers;
        },

        setInputValue: function(value) {
            this.getInputField().val(value);
        },

        getInputValue: function() {
           return this.getInputField().val();
        },

        getInputField: function() {
            return this.$el.find('input');
        },

        onBlur: function() {
            this.save();
        },

        onDomRefresh: function() {
            if(!_.isUndefined(this.getOption('value'))) {
                this.setInputValue(this.getOption('value'));
            }
        }

    });

    return Toolbox;

}));
