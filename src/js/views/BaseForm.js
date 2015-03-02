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

    Toolbox.Views.BlockFormError = Toolbox.Views.ItemView.extend({

        template: Toolbox.Template('form-error'),

        tagName: 'span',

        className: 'help-block'

    });

    Toolbox.Views.InlineFormError = Toolbox.Views.BlockFormError.extend({

        className: 'help-inline'

    });

    Toolbox.Views.BaseForm = Toolbox.Views.LayoutView.extend({
        
        tagName: 'form',

        triggers: {
            'submit': 'submit',
            'click .cancel': 'cancel'
        },

        isSubmitting: false,

        options: {
            // (object) The error view object
            errorView: false,

            // (object) The error view options object
            errorViewOptions: false,

            // (object) The global error view object
            globalErrorsView: false,

            // (object) The global error view options object
            globalErrorsOptions: false,

            // (bool) Show global errors after form submits
            showGlobalErrors: false,

            // (bool) Show notifications after form submits
            showNotifications: true,

            // (object) The notification view object
            notificationView: false,

            // (object) The notification view options object
            notificationViewOptions: false,

            // (string) The form group class name
            formGroupClassName: 'form-group',

            // (string) The has error class name
            hasErrorClassName: 'has-error',

            // (bool) Add the has error classes to fields
            addHasErrorClass: true,

            // (bool) Add the inline form errors
            showInlineErrors: true,

            // (string) The redirect url. False if no redirect
            redirect: false,

            // (object) The success message object
            successMessage: false,

            // (object) The default success message object
            defaultSuccessMessage: {
                icon: 'fa fa-check',
                type: 'success',
                title: 'Success!',
                message: 'The form was successfully submitted.'
            },

            // (object) The errpr message object
            errorMessage: false,

            // (object) The default success message object
            defaultErrorMessage: {
                icon: 'fa fa-warning',
                type: 'alert',
                title: 'Success!',
                message: 'The form could not be submitted.'
            }
        },
        
        _serializedForm: false,

        _errorViews: [],

        getFormData: function() {            
            var data = {};

            this.$el.find('input, select, textarea').each(function() {
                var name = $(this).attr('name');

                if(name) {
                    if($(this).is(':radio') || $(this).is(':checkbox')) {
                        if($(this).is(':checked')) {
                            data[name] = $(this).val();
                        }
                        else {
                            data[name] = 0;
                        }
                    }
                    else {
                        data[name] = $(this).val();
                    }
                }
            });

            return data;
        },

        showActivityIndicator: function() {
            this.$indicator = $('<div class="form-indicator"></div>');

            if(this.$el.find('footer').length) {
                this.$el.find('footer').append(this.$indicator);
            }
            else {
                this.$el.append(this.$indicator);
            }

            this.indicator = new Backbone.Marionette.Region({
                el: this.$indicator
            });         

            var indicator = new Toolbox.Views.ActivityIndicator({
                indicator: 'small'
            });

            this.indicator.show(indicator);
        },
        
        removeErrors: function() {
            if(this.$errors) {
                _.each(this.$errors, function($error) {
                    $error.parents('.has-error').removeClass('has-error').find('.error').remove();
                });
            }
        },

        serialize: function() {
            return JSON.stringify(this.getFormData());
        },

        hasFormChanged: function() {
            if(!this._serializedForm) {
                return false;
            }

            return this._serializedForm !== this.serialize();
        },

        createGlobalErrorsRegion: function() {
            var View = this.getOption('globalErrorsView');

            if(!View) {
                View = Toolbox.Views.UnorderedList;
            }

            this.$globalErrors = $('<div class="global-errors"></div>');

            this.$el.prepend(this.$globalErrors);

            this.globalErrors = new Backbone.Marionette.Region({
                el: this.$globalErrors
            });

            var errorsView = new View(_.extend(this.getOption('globalErrorsOptions')));

            this.globalErrors.show(errorsView);
        },

        createNotification: function(notice) {
            var View = this.getOption('notificationView');

            if(!View) {
                View = Toolbox.Views.Notification;
            }

            var view = new View(_.extend({
                type: notice.type ? notice.type : 'alert',
                title: notice.title ? notice.title : false,
                message: notice.message ? notice.message : false,
                icon: notice.icon ? notice.icon : false
            }, this.getOption('notificationViewOptions')));

            return view;
        },

        createError: function(field, error) {
            var View = this.getOption('errorView');

            if(!View) {
                View = Toolbox.Views.BlockFormError;
            }

            var model = new Backbone.Model({
                field: field,
                error: error
            });

            var view = new View(_.extend({
                model: model
            }, this.getOption('errorViewOptions')));

            return view;
        },

        getInputFieldParent: function(field) {
            return this.getInputField(field).parents('.' + this.getOption('formGroupClassName'));
        },

        getInputField: function(field) {
            return this.$el.find('[name="'+field+'"]');
        },

        setInputField: function(field, value) {
            this.getInputField(field).val(value);
        },

        addHasErrorClassToField: function(field) {
           this.getInputFieldParent(field).addClass(this.getOption('hasErrorClassName'));
        },

        removeHasErrorClassFromField: function(field) {
           this.getInputFieldParent(field).removeClass(this.getOption('hasErrorClassName'));
        },

        removeGlobalErrors: function() {
            if(this.globalErrors && this.globalErrors.currentView) {
                this.globalErrors.currentView.collection.reset();
            }
        },

        focusOnFirstError: function() {
            var selector = 'div.'+this.getOption('hasErrorClassName')+':first';

            this.$el.find(selector)
                .find('input, select, textarea')
                .focus();
        },

        appendErrorViewToGlobal: function(errorView) {
            var error = errorView.model.get('error');

            this.globalErrors.currentView.collection.add({
                content: error
            });
        },

        appendErrorViewToField: function(errorView) {
            errorView.render();

            this.getInputFieldParent(errorView.model.get('field'))
                .append(errorView.$el);
        },

        hideErrors: function() {
            var t = this;

            if(this.getOption('showGlobalErrors') === true) {
                this.removeGlobalErrors();
            }

            _.each(this._errorViews, function(view) {
                var field = view.model.get('field');

                if(t.getOption('addHasErrorClass') === true) {
                    t.removeHasErrorClassFromField(field);
                }

                if(t.getOption('showInlineErrors') === true) {
                    view.$el.remove();
                }
            });
        },

        showError: function(field, error) {
            var errorView = this.createError(field, error);

            if(this.getOption('showGlobalErrors') === true) {
                this.appendErrorViewToGlobal(errorView);
            }

            if(this.getOption('addHasErrorClass') === true) {
                this.addHasErrorClassToField(field);
            }   

            if(this.getOption('showInlineErrors') === true) {
                this.appendErrorViewToField(errorView);
            }

            this._errorViews.push(errorView);
        },

        showErrors: function(errors) {
            var t = this;

            _.each(errors, function(error, field) {
                t.showError(field, error);
            });

            this.focusOnFirstError();
        },

        hideActivityIndicator: function() {
            this.indicator.empty();
        },

        getErrorsFromResponse: function(response) {
            return response.responseJSON.errors;
        },

        redirect: function() {
            window.location = this.getOption('redirect');
        },

        onRender: function() {
            this._serializedForm = this.serialize();

            if(this.getOption('showGlobalErrors')) {
                this.createGlobalErrorsRegion();        
            }
        },

        onSubmitSuccess: function() {
            if(this.hasFormChanged()) {
                this.triggerMethod('form:changed');
                this._serializedForm = this.serialize();
            }

            if(this.getOption('showNotifications')) {
                var notification = this.createNotification(_.extend(
                    this.getOption('defaultSuccessMessage'),
                    this.getOption('successMessage')
                ));

                notification.show();
            }

            if(this.getOption('redirect')) {
                this.redirect();
            }
        },

        onSubmitComplete: function(status, model, response) {
            this.isSubmitting = false;
            this.hideErrors();
            this.hideActivityIndicator();
        },

        onSubmitError: function(model, response) {
            if(this.getOption('showNotifications')) {
                var notification = this.createNotification(_.extend(
                    this.getOption('defaultErrorMessage'),
                    this.getOption('errorMessage')
                ));

                notification.show();
            }

            this.showErrors(this.getErrorsFromResponse(response));
        },

        onSubmit: function() {
            var t = this;

            if(!this.isSubmitting) {
                this.isSubmitting = true;
                this.showActivityIndicator();

                this.model.save(this.getFormData(), {
                    success: function(model, response) {
                        t.triggerMethod('submit:complete', true, model, response);
                        t.triggerMethod('submit:success', model, response);
                    },
                    error: function(model, response) {
                        t.triggerMethod('submit:complete', false, model, response);
                        t.triggerMethod('submit:error', model, response);
                    }
                });
            }
        }

    });

    return Toolbox;

}));