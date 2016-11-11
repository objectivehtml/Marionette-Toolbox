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

    Toolbox.Views.CheckboxField = Toolbox.Views.BaseField.extend({

        template: Toolbox.Template('form-checkbox-radio-field'),

        options: {
            options: false,
            type: 'checkbox',
            inputClassName: 'checkbox'
        },

        getInputValue: function() {
            var values = [];

            this.$el.find(':checked').each(function() {
                values.push($(this).val());
            });

            if(values.length === 0) {
                return null;
            }

            return values.length > 1 ? values : values[0];
        },

        setInputValue: function(values) {
            var t = this;

            if(!_.isArray(values)) {
                values = [values];
            }

            t.$el.find(':checked').attr('checked', false);

            _.each(values, function(value) {
                t.$el.find('[value="'+value+'"]').attr('checked', true);
            });
        }

    });

    return Toolbox;

}));
