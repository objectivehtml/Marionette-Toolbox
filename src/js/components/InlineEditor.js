(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jQuery', 'backbone.marionette'], function($, Marionette) {
            return factory(root.Toolbox, $, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jQuery'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root.Marionette);
    }
}(this, function (Toolbox, $, Marionette) {

    'use strict';

    Toolbox.InlineEditor = Marionette.Object.extend({

  		$el: false,

  		defaultOptions: {
  			fieldName: 'value',
  			editIcon: 'fa fa-pencil',
  			saveKeycode: 13,
  			cancelKeycode: 27,
  			allowNull: false,
  			model: false,
  			classes: {
  				wrapper: 'inline-editor-wrapper',
  				field: 'inline-editor-field',
  				editting: 'inline-editor-editting',
  				label: 'inline-editor-label',
  				icon: 'inline-editor-edit-icon',
  				activityIndicator: 'inline-editor-activity-indicator'
  			}
  		},

  		constructor: function($el, options) {
  			Marionette.Object.prototype.constructor.call(this, options);

  			this.$el = $el;

  			this.build();

  			this.trigger('initialize', options);
  		},

  		build: function() {
  			var t = this;

  			if(!this.$el.hasClass(this.getClass('wrapper'))) {
  				this.value = this.$el.html();

  				this.$field = $('<input type="text" name="'+this.getOption('fieldName')+'" class="'+this.getClass('field')+'" />').val(this.value);

  				this.$el.addClass(this.getClass('wrapper'));
  				this.$el.wrapInner('<div class="'+this.getClass('label')+'" />');
  				this.$el.append(this.$field);
  				this.$el.append('<i class="'+this.getOption('editIcon')+' '+this.getClass('icon')+'" />');

  				this.$indicator = $('<div class="'+this.getClass('activityIndicator')+'" />');

  				this.$el.append(this.$indicator);

  				this.indicator = new Backbone.Marionette.Region({
  					el: this.$indicator
  				});

  				this.$label = this.$el.find('.'+this.getClass('label'));

  				this.$label.on('click', function(e) {
  					t.onClick(e);
  					t.trigger('click');
  				});

  				this.$field.on('focus', function(e) {
  					t.onFocus(e);
  					t.trigger('focus');
  				});

  				this.$field.on('blur', function(e) {
  					t.onBlur(e);
  					t.trigger('blur');
  				});

  				this.$field.on('keypress', function(e) {
  					if(e.keyCode === t.getOption('saveKeycode')) {
  						if(t.getOption('allowNull') || !t.getOption('allowNull') && !t.isNull()) {
  							t.blur();
  						}

  						e.preventDefault();
  					}
  				});

  				this.$field.on('keyup', function(e) {
  					if (e.keyCode === t.getOption('cancelKeycode')) {
  		                t.cancel();
  		                e.preventDefault();
  		            };
  				});

  				this.trigger('bluid');
  			}
  		},

  		destroy: function() {
  			var t = this;

  			if(this.$el.hasClass(t.getClass('wrapper'))) {
  				this.$el.removeClass(t.getClass('wrapper'));
  				this.$el.html(this.value);
  				this.$el.off('click');
  				this.trigger('destroy');
  			}
  		},

  		isNull: function() {
  			return this.$field.val() === '' ? true : false;
  		},

  		isEditing: function() {
  			return this.$el.hasClass(this.getClass('editting'));
  		},

  		save: function() {
  			var t = this, model = this.getOption('model');

  			var save = function() {
  				if(this.getOption('allowNull') || !this.getOption('allowNull') && !this.isNull()) {
  					this.setValue(this.$field.val());
  					this.$el.removeClass(this.getClass('editting'));
  				}
  			};

  			if(model) {
  				this.trigger('onBeforeSave');
  				this.onBeforeSave();

  				var data = {};

  				data[this.getOption('fieldName')] = this.$field.val();

  				model.save(data, {
  					success: function() {
  						save.call(t);
  						t.onAfterSave();
  						t.trigger('onAfterSave');
  						t.trigger('change', t.getValue());
  					},
  					error: function() {
  						t.onError();
  						t.trigger('error');
  					}
  				});
  			}
  			else {
  				this.onBeforeSave();
  				this.trigger('onBeforeSave');
  				save.call(this);
  				this.onAfterSave();
  				this.trigger('onAfterSave');
  				this.trigger('change', this.getValue());
  			}
  		},

  		cancel: function() {
  			this.setValue(this.value);
  			this.blur();
  			this.onCancel();
  			this.trigger('cancel');
  		},

  		focus: function() {
  			this.$el.addClass(this.getClass('editting'));
  			this.$field.focus();
  			this.$field.select();
  			this.trigger('focus');
  		},

  		blur: function() {
  			this.$field.blur();
  			this.trigger('blur');
  		},

  		setClass: function(name, value) {
  			this.options.classes[name] = value;
  		},

  		getClass: function(name) {
  			var classes = this.getOption('classes');

  			return classes[name] ? classes[name] : '';
  		},

  		getValue: function() {
  			return this.value;
  		},

  		setValue: function(value) {
  			this.value = value;
  			this.$label.html(value);
  			this.$field.val(value);
  		},

  		showActivityIndicator: function() {
  			var view = new App.Views.ActivityIndicator({
  				indicator: 'tiny'
  			});

  			this.indicator.show(view);
  		},

  		hideActivityIndicator: function() {
  			this.indicator.empty();
  		},

  		onBeforeSave: function() {
  			this.showActivityIndicator();
  		},

  		onAfterSave: function() {
  			this.hideActivityIndicator();
  		},

  		onError: function() {
  			this.hideActivityIndicator();
  		},

  		onCancel: function() {},

  		onClick: function(e) {
  			this.focus();
  		},

  		onFocus: function(e) {
  			this.$el.addClass(this.getClass('editting'));
  		},

  		onBlur: function(e) {
  			if(this.value !== this.$field.val()) {
  				this.save();
  			}
  			else {
  				this.$el.removeClass(this.getClass('editting'));
  			}
  		}

  	});

    return Toolbox;

}));
