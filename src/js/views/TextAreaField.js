(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('toolbox'));
    } else if (typeof define === 'function' && define.amd) {
        define(['toolbox'], factory);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.Views.TextAreaField = Toolbox.Views.BaseField.extend({

        template: Toolbox.Template('form-textarea-field'),

        options: {
            triggerSelector: 'textarea'
        },

        getInputField: function() {
            return this.$el.find('textarea');
        }

    });

    return Toolbox;

}));