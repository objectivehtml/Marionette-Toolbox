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

	Toolbox.Views.ProgressBar = Toolbox.Views.ItemView.extend({

		template: Toolbox.Template('progress-bar'),

		className: 'progress',

		modelEvents: {
			'change': 'render'
		},

		options: {
			// (string) The progress bar class name
			progressBarClassName: 'progress-bar',

			// (int) The progress percentage
			progress: 0
		},

		initialize: function() {
			Toolbox.Views.CompositeView.prototype.initialize.apply(this, arguments);

            var t = this, options = [
            	'progress', 
            	'progressBarClassName'
            ];

            if(!this.model) {
                this.model = new Backbone.Model();
            }

            _.each(options, function(name) {
                if(t.getOption(name)) {
                    t.model.set(name, t.getOption(name));
                }
            });
		},

		setProgress: function(progress) {
			if(progress < 0) {
				progress = 0;
			}

			if(progress > 100) {
				progress = 100;
			}

			this.options.progress = progress;
			this.model.set('progress', progress);
			this.triggerMethod('progress', progress);

			if(progress === 100) {
				this.triggerMethod('complete');
			}
		},

		getProgress: function() {
			return this.getOption('progress');
		}

	});

    return Toolbox;

}));