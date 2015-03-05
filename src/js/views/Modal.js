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

    Toolbox.Views.Modal = Toolbox.Views.LayoutView.extend({

        template: Toolbox.Template('modal-window')

    });

    return Toolbox;

}));