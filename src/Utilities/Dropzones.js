(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        return define(['jquery'], function($) {
            return factory(root.Toolbox, $)
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$);
    }
}(this, function (Toolbox, $) {

    'use strict';

    Toolbox.Dropzones = function(event, callbacks, context) {
        var element = event.dropzone.element();
        var $element = $(element);
        var offset = Toolbox.ViewOffset(element);
        var top = offset.y;
        var left = offset.x;
        var height = element.offsetHeight;
        var heightThreshold = height * .25;
        var widthThreshold = 40;
        var bottom = top + height;

        if(heightThreshold > 20) {
            heightThreshold = 20;
        }

        if(event.pageY < top + heightThreshold) {
            callbacks.before ? callbacks.before.call(context, $element) : null;
        }
        else if(event.pageY > bottom - heightThreshold || event.pageX < left + widthThreshold) {
            callbacks.after ? callbacks.after.call(context, $element) : null;
        }
        else {
            callbacks.children ? callbacks.children.call(context, $element) : null;
        }
    };

    return Toolbox;

}));
