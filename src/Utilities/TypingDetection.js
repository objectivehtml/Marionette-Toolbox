(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'backbone.marionette'], function(Backbone, Marionette) {
            return factory(root.Toolbox, Backbone, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('backbone'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.Backbone, root.Marionette);
    }
}(this, function (Toolbox, Backbone, Marionette) {

    'use strict';

    Toolbox.TypingDetection = Marionette.Object.extend({

        $el: false,

        _lastValue: false,

        _typingTimer: false,

        _typingStarted: false,

        _typingStoppedThreshold: false,

        initialize: function(el, typingStoppedThreshold, channel) {
            var self = this;

            self.$el = Backbone.$(el);

            self.$el.keyup(function () {
                if(!self._typingTimer) {
                    self._typingTimer = setTimeout(function() {
                        self.triggerMethod('typing:stopped', self.getValue(), self._lastValue);

                        if(channel) {
                            channel.trigger('typing:stopped', self.getValue(), self._lastValue);
                        }

                        self._lastValue = self.getValue();
                        self._typingStarted = false;
                    }, self._typingStoppedThreshold = (typingStoppedThreshold || 500));
                }
            });

            self.$el.keydown(function () {
                setTimeout(function() {
                    if(!self._typingStarted && self.getValue() != self._lastValue) {
                        self._typingStarted = true;
                        self.triggerMethod('typing:started');

                        if(channel) {
                            channel.trigger('typing:started');
                        }
                    }
                });

                self.clearTimer();
            });
        },

        getValue: function() {
            return this.$el.val();
        },

        getLastValue: function() {
            return this._lastValue;
        },

        hasTypingStarted: function() {
            return this._typingStarted;
        },

        clearTimer: function() {
            if(this._typingTimer) {
                clearTimeout(this._typingTimer);
                this._typingTimer = false;
            }
        },

        clearLastValue: function() {
            this._lastValue = false;
        }

    });

    return Toolbox;

}));
