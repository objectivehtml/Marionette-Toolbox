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
