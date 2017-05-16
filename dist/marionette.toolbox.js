(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
                'jquery',
                'backbone',
                'backbone.radio',
                'backbone.marionette',
                'handlebars',
                'underscore'
            ], function($, Backbone, Radio, Marionette, Handlebars, _) {
                return factory(root, $, Backbone, Radio, Marionette, Handlebars, _);
            });
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(
            root,
            require('jquery'),
            require('backbone'),
            require('backbone.radio'),
            require('backbone.marionette'),
            require('handlebars'),
            require('underscore')
        );
    } else {
        factory(root, root.$, root.Backbone, root.Backbone.Radio, root.Marionette, root.Handlebars, root._);
    }
}(this, function(root, $, Backbone, Radio, Marionette, Handlebars, _) {

    'use strict';

    var Toolbox = {};

    Toolbox.handlebars = {};

    Toolbox.Views = {};

    Toolbox.VERSION = '0.8.0';

    // Toolbox.Template
    // -------------------
    // Get an existing rendered handlebars template

    Toolbox.Template = function(name) {
        if(Toolbox.templates[name]) {
            return Toolbox.templates[name];
        }
        else {
            throw 'Cannot locate the Handlebars template with the name of "'+name+'".';
        }
    };

    // Toolbox.Options
    // -------------------
    // Get the default options and options and merge the,

    Toolbox.Options = function(defaultOptions, options, context) {
        if(_.isFunction(defaultOptions)) {
            defaultOptions = defaultOptions.call(context);
        }

        if(_.isFunction(options)) {
            options = options.call(context);
        }

        return _.extend({}, defaultOptions, options);
    };

    return root.Toolbox = Toolbox;
}));

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

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        return factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.TypingDetection = function($element, typingStoppedThreshold, radioChannel) {
        typingStoppedThreshold || (typingStoppedThreshold = 500);

        var self = this;
        var typingTimer, lastValue;
        var hasTypingStarted = false;

        this.getValue = function() {
            return $element.val();
        };

        this.hasTypingStarted = function() {
            return this;
        };

        this.getLastValue = function() {
            return lastValue;
        };

        this.clearTimer = function() {
            if(typingTimer) {
                clearTimeout(typingTimer);
                typingTimer = undefined;
            }
        };

        $element.keyup(function () {
            if(!typingTimer) {
                typingTimer = setTimeout(function() {
                    if(radioChannel) {
                        radioChannel.trigger('detection:typing:stopped', self.getValue());
                    }
                    lastValue = self.getValue();
                    hasTypingStarted = false;
                }, typingStoppedThreshold);
            }
        });

        $element.keydown(function () {
            setTimeout(function() {
                if(!hasTypingStarted && self.getValue() != lastValue) {
                    if(radioChannel) {
                        radioChannel.trigger('detection:typing:started');
                    }
                    hasTypingStarted = true;
                }
            });

            self.clearTimer();
        });

        return this;
    };

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        return factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.ViewOffset = function(node, singleFrame) {
        function addOffset(node, coords, view) {
            var p = node.offsetParent;

            coords.x += node.offsetLeft - (p ? p.scrollLeft : 0);
            coords.y += node.offsetTop - (p ? p.scrollTop : 0);

            if (p) {
                if (p.nodeType == 1) {
                    var parentStyle = view.getComputedStyle(p, '');

                    if (parentStyle.position != 'static') {
                        coords.x += parseInt(parentStyle.borderLeftWidth);
                        coords.y += parseInt(parentStyle.borderTopWidth);

                        if (p.localName == 'TABLE') {
                            coords.x += parseInt(parentStyle.paddingLeft);
                            coords.y += parseInt(parentStyle.paddingTop);
                        }
                        else if (p.localName == 'BODY') {
                            var style = view.getComputedStyle(node, '');
                            coords.x += parseInt(style.marginLeft);
                            coords.y += parseInt(style.marginTop);
                        }
                    }
                    else if (p.localName == 'BODY') {
                        coords.x += parseInt(parentStyle.borderLeftWidth);
                        coords.y += parseInt(parentStyle.borderTopWidth);
                    }

                    var parent = node.parentNode;

                    while (p != parent) {
                        coords.x -= parent.scrollLeft;
                        coords.y -= parent.scrollTop;
                        parent = parent.parentNode;
                    }

                    addOffset(p, coords, view);
                }
            }
            else {
                if (node.localName == 'BODY') {
                    var style = view.getComputedStyle(node, '');
                    coords.x += parseInt(style.borderLeftWidth);
                    coords.y += parseInt(style.borderTopWidth);

                    var htmlStyle = view.getComputedStyle(node.parentNode, '');
                    coords.x -= parseInt(htmlStyle.paddingLeft);
                    coords.y -= parseInt(htmlStyle.paddingTop);
                }

                if (node.scrollLeft) {
                    coords.x += node.scrollLeft;
                }

                if (node.scrollTop) {
                    coords.y += node.scrollTop;
                }

                var win = node.ownerDocument.defaultView;

                if (win && (!singleFrame && win.frameElement)) {
                    addOffset(win.frameElement, coords, win);
                }
            }
        }

        var coords = {
            x: 0,
            y: 0
        };

        if (node) {
            addOffset(node, coords, node.ownerDocument.defaultView);
        }

        return coords;
    };

    return Toolbox;

}));

this["Toolbox"] = this["Toolbox"] || {};
this["Toolbox"]["templates"] = this["Toolbox"]["templates"] || {};
this["Toolbox"]["templates"]["activity-indicator"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "dimmed";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "min-height:"
    + container.escapeExpression(((helper = (helper = helpers.minHeight || (depth0 != null ? depth0.minHeight : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"minHeight","hash":{},"data":data}) : helper)))
    + ";";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return "position:"
    + container.escapeExpression(((helper = (helper = helpers.position || (depth0 != null ? depth0.position : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"position","hash":{},"data":data}) : helper)))
    + ";";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "background-color: "
    + container.escapeExpression(((helper = (helper = helpers.dimmedBgColor || (depth0 != null ? depth0.dimmedBgColor : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"dimmedBgColor","hash":{},"data":data}) : helper)))
    + ";";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<span class=\"activity-indicator-label\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.labelFontSize : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"><span class=\"activity-indicator-label-text\">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span></span>";
},"10":function(container,depth0,helpers,partials,data) {
    var helper;

  return "font-size:"
    + container.escapeExpression(((helper = (helper = helpers.labelFontSize || (depth0 != null ? depth0.labelFontSize : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"labelFontSize","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"activity-indicator-dimmer "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.dimmed : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.minHeight : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.position : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.dimmedBgColor : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n\n	<span class=\"activity-indicator\">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</span>\n\n</div>\n";
},"useData":true});
this["Toolbox"]["templates"]["form-error"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "    <span>"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</span>"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].newline : depths[1]),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "<br>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.errors : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["breadcrumb"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<a href=\""
    + container.escapeExpression(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"href","hash":{},"data":data}) : helper)))
    + "\">";
},"3":function(container,depth0,helpers,partials,data) {
    return "</a>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.href : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.href : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["no-breadcrumbs"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
this["Toolbox"]["templates"]["button-dropdown-menu"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "dropup";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "		<button type=\"button\" class=\""
    + alias4(((helper = (helper = helpers.buttonClassName || (depth0 != null ? depth0.buttonClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"buttonClassName","hash":{},"data":data}) : helper)))
    + "\">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.buttonIcon : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + alias4(((helper = (helper = helpers.buttonLabel || (depth0 != null ? depth0.buttonLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"buttonLabel","hash":{},"data":data}) : helper)))
    + "</button>\n		<button type=\"button\" class=\""
    + alias4(((helper = (helper = helpers.buttonClassName || (depth0 != null ? depth0.buttonClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"buttonClassName","hash":{},"data":data}) : helper)))
    + " "
    + alias4(((helper = (helper = helpers.buttonToggleClassName || (depth0 != null ? depth0.buttonToggleClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"buttonToggleClassName","hash":{},"data":data}) : helper)))
    + "\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n			<span class=\"caret\"></span>\n			<span class=\"sr-only\">Toggle Dropdown</span>\n		</button>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<i class=\""
    + container.escapeExpression(((helper = (helper = helpers.buttonIcon || (depth0 != null ? depth0.buttonIcon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"buttonIcon","hash":{},"data":data}) : helper)))
    + "\"></i>";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "		<button type=\"button\" class=\""
    + alias4(((helper = (helper = helpers.buttonClassName || (depth0 != null ? depth0.buttonClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"buttonClassName","hash":{},"data":data}) : helper)))
    + " "
    + alias4(((helper = (helper = helpers.buttonToggleClassName || (depth0 != null ? depth0.buttonToggleClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"buttonToggleClassName","hash":{},"data":data}) : helper)))
    + "\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n			"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.buttonIcon : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n			"
    + alias4(((helper = (helper = helpers.buttonLabel || (depth0 != null ? depth0.buttonLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"buttonLabel","hash":{},"data":data}) : helper)))
    + "\n			<span class=\"caret\"></span>\n			<span class=\"sr-only\">Toggle Dropdown</span>\n		</button>\n";
},"8":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.menuClassName || (depth0 != null ? depth0.menuClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"menuClassName","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"btn-group "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.dropUp : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.splitButton : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(6, data, 0),"data":data})) != null ? stack1 : "")
    + "\n	<ul class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.menuClassName : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></ul>\n</div>\n";
},"useData":true});
this["Toolbox"]["templates"]["button-group-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i> ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "\n";
},"useData":true});
this["Toolbox"]["templates"]["no-button-group-item"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
this["Toolbox"]["templates"]["calendar-monthly-day-view"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "	<span class=\"calendar-has-events\"><i class=\"fa fa-circle\"></i></span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "<span class=\"calendar-date\">"
    + container.escapeExpression(((helper = (helper = helpers.day || (depth0 != null ? depth0.day : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"day","hash":{},"data":data}) : helper)))
    + "</span>\n\n"
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || alias2).call(alias1,((stack1 = (depth0 != null ? depth0.events : depth0)) != null ? stack1.length : stack1),">","0",{"name":"is","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["calendar-monthly-view"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"calendar-masthead\">\n	<nav class=\"calendar-navigation\">\n		<a href=\"#\" class=\"calendar-navigation-prev\"><i class=\"fa fa-angle-left\"></i></a>\n		<a href=\"#\" class=\"calendar-navigation-next\"><i class=\"fa fa-angle-right\"></i></a>\n	</nav>\n\n	<div class=\"calendar-header\"></div>\n	<div class=\"calendar-sub-header\"></div>\n</div>\n\n<div class=\"calendar-view\">\n	<div class=\"indicator\"></div>\n\n	<table class=\"calendar-monthly-view\">\n		<thead>\n			<tr>\n				<th>Sun</th>\n				<th>Mon</th>\n				<th>Tue</th>\n				<th>Wed</th>\n				<th>Thur</th>\n				<th>Fri</th>\n				<th>Sat</th>\n			</tr>\n		</thead>\n		<tbody></tbody>\n	</table>\n</div>\n";
},"useData":true});
this["Toolbox"]["templates"]["form-checkbox-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<p "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.descriptionClassName : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.descriptionClassName || (depth0 != null ? depth0.descriptionClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"descriptionClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.options || (depth0 != null ? depth0.options : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"options","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.options) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing, alias5="function";

  return "	<div class=\""
    + alias2(alias1((depths[1] != null ? depths[1].inputClassName : depths[1]), depth0))
    + "\">\n		<label "
    + ((stack1 = helpers["if"].call(alias3,(depths[1] != null ? depths[1].labelClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><input type=\""
    + alias2(alias1((depths[1] != null ? depths[1].type : depths[1]), depth0))
    + "\" name=\""
    + alias2(alias1((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "[]\" value=\""
    + alias2(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"value","hash":{},"data":data}) : helper)))
    + "\"> "
    + alias2(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n	</div>\n";
},"8":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].labelClassName : depths[1]), depth0))
    + "\"";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\""
    + alias4(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + "\">\n		<label "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.labelClassName : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><input type=\""
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\"> "
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n	</div>\n";
},"11":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.labelClassName || (depth0 != null ? depth0.labelClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"labelClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.options : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.program(10, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["inline-editor"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"inline-editor-label\"></div>\n\n<i class=\"fa fa-pencil inline-editor-edit-icon\"></i>\n\n<div class=\"inline-editor-field\"></div>\n\n<div class=\"inline-editor-activity-indicator\"></div>";
},"useData":true});
this["Toolbox"]["templates"]["form-input-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<label "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.labelClassName : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.labelClassName || (depth0 != null ? depth0.labelClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"labelClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<p "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.descriptionClassName : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"9":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.descriptionClassName || (depth0 != null ? depth0.descriptionClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"descriptionClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"11":function(container,depth0,helpers,partials,data) {
    var helper;

  return "name=\""
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"name","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<input type=\""
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\""
    + alias4(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + "\" />\n";
},"useData":true});
this["Toolbox"]["templates"]["dropdown-menu-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<a href=\""
    + container.escapeExpression(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"href","hash":{},"data":data}) : helper)))
    + "\">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.value : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</a>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i> ";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)));
},"8":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.divider : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["dropdown-menu-no-items"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"useData":true});
this["Toolbox"]["templates"]["dropdown-menu"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.menuClassName || (depth0 != null ? depth0.menuClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"menuClassName","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\"#\" class=\""
    + alias4(((helper = (helper = helpers.toggleClassName || (depth0 != null ? depth0.toggleClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"toggleClassName","hash":{},"data":data}) : helper)))
    + "\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">"
    + alias4(((helper = (helper = helpers.toggleLabel || (depth0 != null ? depth0.toggleLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"toggleLabel","hash":{},"data":data}) : helper)))
    + " <i class=\""
    + alias4(((helper = (helper = helpers.toggleIconClassName || (depth0 != null ? depth0.toggleIconClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"toggleIconClassName","hash":{},"data":data}) : helper)))
    + "\"></i></a>\n\n<ul class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.menuClassName : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></ul>\n";
},"useData":true});
this["Toolbox"]["templates"]["list-group-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "	<span class=\"badge\">"
    + container.escapeExpression(((helper = (helper = helpers.badge || (depth0 != null ? depth0.badge : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"badge","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.badge : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"useData":true});
this["Toolbox"]["templates"]["no-list-group-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "    "
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "    No items found.\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.message : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["form-light-switch-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<label for=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\""
    + alias4(((helper = (helper = helpers.labelClassName || (depth0 != null ? depth0.labelClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"labelClassName","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<p "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.descriptionClassName : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.descriptionClassName || (depth0 != null ? depth0.descriptionClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"descriptionClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"8":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.activeClassName || (depth0 != null ? depth0.activeClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"activeClassName","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<div class=\""
    + alias4(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || alias2).call(alias1,(depth0 != null ? depth0.value : depth0),1,{"name":"is","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" tabindex=\"0\">\n	<div class=\"light-switch-container\">\n		<div class=\"light-switch-label on\"></div>\n		<div class=\"light-switch-handle\"></div>\n		<div class=\"light-switch-label off\"></div>\n	</div>\n</div>\n\n<input type=\"hidden\" name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\" id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n";
},"useData":true});
this["Toolbox"]["templates"]["modal-window"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "	<h3 class=\"modal-header\">"
    + container.escapeExpression(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"header","hash":{},"data":data}) : helper)))
    + "</h3>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "		<div class=\"modal-buttons\">\n";
  stack1 = ((helper = (helper = helpers.buttons || (depth0 != null ? depth0.buttons : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"buttons","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.buttons) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "		</div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "			<a href=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.href : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" class=\""
    + alias4(((helper = (helper = helpers.className || (depth0 != null ? depth0.className : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"className","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"href","hash":{},"data":data}) : helper)));
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"";
},"9":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<span class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></span> ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"modal-window\">\n	<a href=\"#\" class=\"modal-close\"><i class=\"fa fa-times-circle\"></i></a>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n	<div class=\"modal-content clearfix\"></div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.buttons : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
this["Toolbox"]["templates"]["notification"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "		<div class=\"col-sm-2\">\n			<i class=\"fa fa-"
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + " icon\"></i>\n		</div>\n		<div class=\"col-lg-10\">\n			"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.title : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n			"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.message : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n		</div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<h3>"
    + container.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title","hash":{},"data":data}) : helper)))
    + "</h3>";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<p>"
    + container.escapeExpression(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper)))
    + "</p>";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "		<div class=\"col-lg-12\">\n			"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.title : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n			"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.message : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n		</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<a href=\"#\" class=\"close\"><i class=\"fa fa-times-circle\"></i></a>\n\n<div class=\"row\">\n\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(6, data, 0),"data":data})) != null ? stack1 : "")
    + "\n</div>\n";
},"useData":true});
this["Toolbox"]["templates"]["no-ordered-list-item"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["ordered-list-item"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["pager"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.prevClassName || (depth0 != null ? depth0.prevClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"prevClassName","hash":{},"data":data}) : helper)));
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "		<li class=\"page-totals\">Page "
    + container.escapeExpression(((helper = (helper = helpers.page || (depth0 != null ? depth0.page : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"page","hash":{},"data":data}) : helper)))
    + " of "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.totalPages : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</li>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.totalPages || (depth0 != null ? depth0.totalPages : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"totalPages","hash":{},"data":data}) : helper)));
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.nextClassName || (depth0 != null ? depth0.nextClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"nextClassName","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<ul class=\""
    + alias4(((helper = (helper = helpers.pagerClassName || (depth0 != null ? depth0.pagerClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pagerClassName","hash":{},"data":data}) : helper)))
    + "\">\n	<li class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.snapToEdges : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"><a href=\"#\" class=\"prev-page\"><i class=\"fa fa-long-arrow-left\" aria-hidden=\"true\"></i> "
    + alias4(((helper = (helper = helpers.prevLabel || (depth0 != null ? depth0.prevLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"prevLabel","hash":{},"data":data}) : helper)))
    + "</a></li>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.includePageTotals : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	<li class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.snapToEdges : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"><a href=\"#\" class=\"next-page\">"
    + alias4(((helper = (helper = helpers.nextLabel || (depth0 != null ? depth0.nextLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nextLabel","hash":{},"data":data}) : helper)))
    + " <i class=\"fa fa-long-arrow-right\" aria-hidden=\"true\"></i></a></li>\n</ul>\n";
},"useData":true});
this["Toolbox"]["templates"]["pagination-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "	<a>&hellip;</a>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "	<a href=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.href : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data})) != null ? stack1 : "")
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["class"] : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n		"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.page : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n	</a>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"href","hash":{},"data":data}) : helper)));
},"6":function(container,depth0,helpers,partials,data) {
    return "#";
},"8":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers["class"] || (depth0 != null ? depth0["class"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"class","hash":{},"data":data}) : helper)))
    + "\"";
},"10":function(container,depth0,helpers,partials,data) {
    var helper;

  return "data-label=\""
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper)))
    + "\"";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<span aria-hidden=\"true\">"
    + ((stack1 = ((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</span>";
},"14":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.page || (depth0 != null ? depth0.page : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"page","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.divider : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["pagination"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<ul class=\"pagination "
    + container.escapeExpression(((helper = (helper = helpers.paginationClassName || (depth0 != null ? depth0.paginationClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"paginationClassName","hash":{},"data":data}) : helper)))
    + "\">\n	<li>\n		<a href=\"#\" class=\"prev-page\" aria-label=\"Previous\">\n			<span aria-hidden=\"true\">&laquo;</span>\n		</a>\n	</li>\n    <li>\n		<a href=\"#\" class=\"next-page\" aria-label=\"Next\">\n			<span aria-hidden=\"true\">&raquo;</span>\n		</a>\n    </li>\n</ul>\n";
},"useData":true});
this["Toolbox"]["templates"]["progress-bar"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\""
    + alias4(((helper = (helper = helpers.progressBarClassName || (depth0 != null ? depth0.progressBarClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"progressBarClassName","hash":{},"data":data}) : helper)))
    + "\" role=\"progressbar\" aria-valuenow=\""
    + alias4(((helper = (helper = helpers.progress || (depth0 != null ? depth0.progress : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"progress","hash":{},"data":data}) : helper)))
    + "\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "
    + alias4(((helper = (helper = helpers.progress || (depth0 != null ? depth0.progress : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"progress","hash":{},"data":data}) : helper)))
    + "%;\">\n	<span class=\"sr-only\">"
    + alias4(((helper = (helper = helpers.progress || (depth0 != null ? depth0.progress : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"progress","hash":{},"data":data}) : helper)))
    + "% Complete</span>\n</div>\n";
},"useData":true});
this["Toolbox"]["templates"]["form-radio-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<p "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.descriptionClassName : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.descriptionClassName || (depth0 != null ? depth0.descriptionClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"descriptionClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.options || (depth0 != null ? depth0.options : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"options","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.options) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing, alias5="function";

  return "	<div class=\""
    + alias2(alias1((depths[1] != null ? depths[1].inputClassName : depths[1]), depth0))
    + "\">\n		<label "
    + ((stack1 = helpers["if"].call(alias3,(depths[1] != null ? depths[1].labelClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><input type=\""
    + alias2(alias1((depths[1] != null ? depths[1].type : depths[1]), depth0))
    + "\" name=\""
    + alias2(alias1((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "[]\" value=\""
    + alias2(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"value","hash":{},"data":data}) : helper)))
    + "\"> "
    + alias2(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n	</div>\n";
},"8":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].labelClassName : depths[1]), depth0))
    + "\"";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\""
    + alias4(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + "\">\n		<label "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.labelClassName : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><input type=\""
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\"></label>\n	</div>\n";
},"11":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.labelClassName || (depth0 != null ? depth0.labelClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"labelClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.options : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.program(10, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["range-slider"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"slider\"></div>";
},"useData":true});
this["Toolbox"]["templates"]["form-select-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<label "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.labelClassName : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.labelClassName || (depth0 != null ? depth0.labelClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"labelClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"8":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "	<p "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].descriptionClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].description : depths[1]), depth0))
    + "</p>\n";
},"9":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].descriptionClassName : depths[2]), depth0))
    + "\"";
},"11":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "name=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "\"";
},"13":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "id=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].id : depths[1]), depth0))
    + "\"";
},"15":function(container,depth0,helpers,partials,data) {
    return "multiple";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "	<option "
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.value : depth0),"!==",undefined,{"name":"is","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.selected : depth0),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.program(24, data, 0),"data":data})) != null ? stack1 : "")
    + "</option>\n";
},"18":function(container,depth0,helpers,partials,data) {
    var helper;

  return "value=\""
    + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)))
    + "\"";
},"20":function(container,depth0,helpers,partials,data) {
    return "selected=\"selected\"";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer = 
  ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<select "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\""
    + container.escapeExpression(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.multiple : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n";
  stack1 = ((helper = (helper = helpers.options || (depth0 != null ? depth0.options : depth0)) != null ? helper : alias2),(options={"name":"options","hash":{},"fn":container.program(17, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.options) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</select>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["selection-pool-tree-node"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <ul class=\"children\"></ul>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<i class=\"fa fa-bars drag-handle\"></i> <span class=\"node-name\">"
    + container.escapeExpression(((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper)))
    + "</span>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasChildren : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["selection-pool"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "height:"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].height : depths[1]), depth0))
    + ";";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"row selection-pool-search\">\n    <div class=\"col-sm-12\">\n        <div class=\"selection-pool-search-field\">\n            <a href=\"#\" class=\"selection-pool-search-clear\"><i class=\"fa fa-times-circle\"></i></a>\n            <input type=\"text\" value=\"\" placeholder=\"Enter keywords to search the list\" class=\"search form-control\">\n        </div>\n    </div>\n</div>\n\n<div class=\"row selection-pool-lists\">\n    <div class=\"col-sm-6\">\n        <div class=\"available-pool droppable-pool\" data-accept=\".selected-pool .draggable-tree-node\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.height : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></div>\n    </div>\n    <div class=\"col-sm-6\">\n        <div class=\"selected-pool droppable-pool\" data-accept=\".available-pool .draggable-tree-node\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.height : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></div>\n    </div>\n</div>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["table-activity-indicator-row"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "style=\"height:"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].height : depths[1]), depth0))
    + "px\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "<td class=\"activity-indicator-row\" colspan=\""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.columns : depth0)) != null ? stack1.length : stack1), depth0))
    + "\" "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.height : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n\n	<div class=\"activity-indicator-dimmer\">\n		\n		<span class=\"activity-indicator\"></span>\n\n	</div>\n\n</td>";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["table-no-items"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression;

  return "<td colspan=\""
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.columns : depth0)) != null ? stack1.length : stack1), depth0))
    + "\">\n	"
    + alias1(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper)))
    + "\n</td>";
},"useData":true});
this["Toolbox"]["templates"]["table-view-footer"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.totalPages || (depth0 != null ? depth0.totalPages : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"totalPages","hash":{},"data":data}) : helper)));
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.page || (depth0 != null ? depth0.page : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"page","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : {};

  return "<td colspan=\""
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.columns : depth0)) != null ? stack1.length : stack1), depth0))
    + "\" class=\"page-totals\">\n    Page "
    + alias1(((helper = (helper = helpers.page || (depth0 != null ? depth0.page : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias2,{"name":"page","hash":{},"data":data}) : helper)))
    + " of "
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.totalPages : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\n</td>\n";
},"useData":true});
this["Toolbox"]["templates"]["table-view-group"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, buffer = 
  "<div class=\"buttons-wrapper pull-right\">\n";
  stack1 = ((helper = (helper = helpers.buttons || (depth0 != null ? depth0.buttons : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"buttons","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.buttons) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "		<a href=\""
    + alias4(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"href","hash":{},"data":data}) : helper)))
    + "\" class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.className : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.program(5, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "\">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.className || (depth0 != null ? depth0.className : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"className","hash":{},"data":data}) : helper)));
},"5":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].buttonClassName : depths[1]), depth0));
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>";
},"9":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + " class=\""
    + alias4(((helper = (helper = helpers.headerClassName || (depth0 != null ? depth0.headerClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerClassName","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"11":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<"
    + alias4(((helper = (helper = helpers.descriptionTag || (depth0 != null ? depth0.descriptionTag : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"descriptionTag","hash":{},"data":data}) : helper)))
    + " class=\""
    + alias4(((helper = (helper = helpers.descriptionClassName || (depth0 != null ? depth0.descriptionClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"descriptionClassName","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.descriptionTag || (depth0 != null ? depth0.descriptionTag : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"descriptionTag","hash":{},"data":data}) : helper)))
    + ">\n";
},"13":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "			<th scope=\"col\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.width : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.className : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.id : depth0),(depths[1] != null ? depths[1].order : depths[1]),{"name":"is","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(18, data, 0, blockParams, depths),"inverse":container.program(20, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "			</th>\n";
},"14":function(container,depth0,helpers,partials,data) {
    var helper;

  return "width=\""
    + container.escapeExpression(((helper = (helper = helpers.width || (depth0 != null ? depth0.width : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"width","hash":{},"data":data}) : helper)))
    + "\"";
},"16":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "sort-"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].sort : depths[1]), depth0));
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function";

  return "					<a href=\"#\" data-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"sort\">"
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</a>\n					<i class=\"sort-icon asc fa fa-sort-asc\"></i>\n					<i class=\"sort-icon desc fa fa-sort-desc\"></i>\n";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "					"
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"22":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.totalPages || (depth0 != null ? depth0.totalPages : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"totalPages","hash":{},"data":data}) : helper)));
},"24":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.page || (depth0 != null ? depth0.page : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"page","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, buffer = 
  "<div class=\"table-header\"></div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.buttons : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<table class=\""
    + alias4(((helper = (helper = helpers.tableClassName || (depth0 != null ? depth0.tableClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tableClassName","hash":{},"data":data}) : helper)))
    + "\">\n	<thead>\n		<tr>\n";
  stack1 = ((helper = (helper = helpers.columns || (depth0 != null ? depth0.columns : depth0)) != null ? helper : alias2),(options={"name":"columns","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.columns) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "		</tr>\n	</thead>\n	<tbody></tbody>\n	<tfoot>\n		<td colspan=\""
    + alias4(container.lambda(((stack1 = (depth0 != null ? depth0.columns : depth0)) != null ? stack1.length : stack1), depth0))
    + "\" class=\"page-totals\">\n		    <!-- Page "
    + alias4(((helper = (helper = helpers.page || (depth0 != null ? depth0.page : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"page","hash":{},"data":data}) : helper)))
    + " of "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.totalPages : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0, blockParams, depths),"inverse":container.program(24, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + " -->\n		</td>\n	</tfoot>\n</table>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["table-view-pagination"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div></div>";
},"useData":true});
this["Toolbox"]["templates"]["table-view-row"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return "	<td data-id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3((helpers.propertyOf || (depth0 && depth0.propertyOf) || alias2).call(alias1,depths[1],(depth0 != null ? depth0.id : depth0),{"name":"propertyOf","hash":{},"data":data}))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer = 
  container.escapeExpression(((helper = (helper = helpers.columns || (depth0 != null ? depth0.columns : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"columns","hash":{},"data":data}) : helper)))
    + "\n";
  stack1 = ((helper = (helper = helpers.columns || (depth0 != null ? depth0.columns : depth0)) != null ? helper : alias2),(options={"name":"columns","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.columns) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["tab-content"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["tabs"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<!-- Nav tabs -->\n<ul class=\""
    + container.escapeExpression(((helper = (helper = helpers.tabClassName || (depth0 != null ? depth0.tabClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"tabClassName","hash":{},"data":data}) : helper)))
    + "\" role=\"tablist\"></ul>\n\n<!-- Tab panes -->\n<div class=\"tab-content\"></div>\n";
},"useData":true});
this["Toolbox"]["templates"]["form-textarea-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<label "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.labelClassName : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.labelClassName || (depth0 != null ? depth0.labelClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"labelClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<p "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.descriptionClassName : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"9":function(container,depth0,helpers,partials,data) {
    var helper;

  return "class=\""
    + container.escapeExpression(((helper = (helper = helpers.descriptionClassName || (depth0 != null ? depth0.descriptionClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"descriptionClassName","hash":{},"data":data}) : helper)))
    + "\"";
},"11":function(container,depth0,helpers,partials,data) {
    var helper;

  return "name=\""
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"name","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<textarea "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\""
    + container.escapeExpression(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + "\"></textarea>\n";
},"useData":true});
this["Toolbox"]["templates"]["draggable-tree-view-node"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <ul class=\"children\"></ul>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<i class=\"fa fa-bars drag-handle\"></i>\n\n<div class=\"node-name\">\n    <span>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>\n</div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasChildren : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["no-tree-view-nodes"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<p>This tree has no nodes.</p>\n";
},"useData":true});
this["Toolbox"]["templates"]["tree-view-node"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <ul class=\"children\"></ul>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasChildren : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["no-unordered-list-item"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["unordered-list-item"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["wizard-buttons"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <button type=\"button\" class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.disabled : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + alias4(((helper = (helper = helpers.className || (depth0 != null ? depth0.className : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"className","hash":{},"data":data}) : helper)))
    + "\">\n            "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "\n        </button>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].disabledClassName : depths[1]), depth0));
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i> ";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <button type=\"button\" class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.disabled : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + alias4(((helper = (helper = helpers.className || (depth0 != null ? depth0.className : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"className","hash":{},"data":data}) : helper)))
    + "\">\n            "
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        </button>\n";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return " <i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "<div class=\"wizard-left-buttons pull-left\">\n";
  stack1 = ((helper = (helper = helpers.leftButtons || (depth0 != null ? depth0.leftButtons : depth0)) != null ? helper : alias2),(options={"name":"leftButtons","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.leftButtons) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</div>\n\n<div class=\"wizard-right-buttons pull-right\">\n";
  stack1 = ((helper = (helper = helpers.rightButtons || (depth0 != null ? depth0.rightButtons : depth0)) != null ? helper : alias2),(options={"name":"rightButtons","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.rightButtons) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["wizard-error"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"wizard-error-icon\"><i class=\""
    + container.escapeExpression(((helper = (helper = helpers.errorIcon || (depth0 != null ? depth0.errorIcon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"errorIcon","hash":{},"data":data}) : helper)))
    + "\"></i></div>";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<p>"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</p>";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    <ul class=\"wizard-error-list\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.errors : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </ul>\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "        <li>"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</li>\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <button type=\"button\" class=\""
    + alias4(((helper = (helper = helpers.backButtonClassName || (depth0 != null ? depth0.backButtonClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"backButtonClassName","hash":{},"data":data}) : helper)))
    + "\">\n        "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.backButtonIcon : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        "
    + alias4(((helper = (helper = helpers.backButtonLabel || (depth0 != null ? depth0.backButtonLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"backButtonLabel","hash":{},"data":data}) : helper)))
    + "\n    </button>\n";
},"11":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<i class=\""
    + container.escapeExpression(((helper = (helper = helpers.backButtonIcon || (depth0 != null ? depth0.backButtonIcon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"backButtonIcon","hash":{},"data":data}) : helper)))
    + "\"></i> ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.errorIcon : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.message : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.errors : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.showBackButton : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["wizard-progress"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "    <a class=\"wizard-step "
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.complete : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.program(4, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "\" data-step=\""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.step : stack1), depth0))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.title : stack1),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.label : stack1),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.program(10, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "    </a>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].completeClassName : depths[1]), depth0));
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].disabledClassName : depths[1]), depth0));
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "title=\""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.title : stack1), depth0))
    + "\"";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "            <span class=\"wizard-step-label\">"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.label : stack1), depth0))
    + "</span>\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.title : stack1),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <span class=\"wizard-step-label\">"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.title : stack1), depth0))
    + "</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, buffer = 
  "<div class=\"wizard-progress-bar\">\n";
  stack1 = ((helper = (helper = helpers.steps || (depth0 != null ? depth0.steps : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"steps","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.steps) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["wizard-success"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"wizard-success-icon\"><i class=\""
    + container.escapeExpression(((helper = (helper = helpers.successIcon || (depth0 != null ? depth0.successIcon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"successIcon","hash":{},"data":data}) : helper)))
    + "\"></i></div>";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<p>"
    + container.escapeExpression(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper)))
    + "</p>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.successIcon : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.message : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"useData":true});
this["Toolbox"]["templates"]["wizard"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\""
    + container.escapeExpression(((helper = (helper = helpers.panelClassName || (depth0 != null ? depth0.panelClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"panelClassName","hash":{},"data":data}) : helper)))
    + "\">\n    <div class=\"panel-body\">\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + " class=\""
    + alias4(((helper = (helper = helpers.headerClassName || (depth0 != null ? depth0.headerClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerClassName","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return "            <p>"
    + container.escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "    </div>\n    <div class=\"wizard-buttons\"></div>\n</div>\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "<div class=\"wizard-buttons\"></div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.panel : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        <div class=\"wizard-progress\"></div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        <div class=\"wizard-content\"></div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.panel : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('handlebars'));
    } else if (typeof define === 'function' && define.amd) {
        define(['handlebars'], factory);
    } else {
        root.HandlebarsHelpersRegistry = factory(root.Handlebars);
    }
}(this, function (Handlebars) {

    var isArray = function(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    };

    var ExpressionRegistry = function() {
        this.expressions = [];
    };

    ExpressionRegistry.prototype.add = function (operator, method) {
        this.expressions[operator] = method;
    };

    ExpressionRegistry.prototype.call = function (operator, left, right) {
        if ( ! this.expressions.hasOwnProperty(operator)) {
            throw new Error('Unknown operator "'+operator+'"');
        }

        return this.expressions[operator](left, right);
    };

    var eR = new ExpressionRegistry();
    eR.add('not', function(left, right) {
        return left != right;
    });
    eR.add('>', function(left, right) {
        return left > right;
    });
    eR.add('<', function(left, right) {
        return left < right;
    });
    eR.add('>=', function(left, right) {
        return left >= right;
    });
    eR.add('<=', function(left, right) {
        return left <= right;
    });
    eR.add('==', function(left, right) {
        return left == right;
    });
    eR.add('===', function(left, right) {
        return left === right;
    });
    eR.add('!==', function(left, right) {
        return left !== right;
    });
    eR.add('in', function(left, right) {
        if ( ! isArray(right)) {
            right = right.split(',');
        }
        return right.indexOf(left) !== -1;
    });

    var isHelper = function() {
        var args = arguments,
            left = args[0],
            operator = args[1],
            right = args[2],
            options = args[3];

        if (args.length == 2) {
            options = args[1];
            if (left) return options.fn(this);
            return options.inverse(this);
        }

        if (args.length == 3) {
            right = args[1];
            options = args[2];
            if (left == right) return options.fn(this);
            return options.inverse(this);
        }

        if (eR.call(operator, left, right)) {
            return options.fn(this);
        }
        return options.inverse(this);
    };

    Handlebars.registerHelper('is', isHelper);

    return eR;

}));

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('handlebars'), require('underscore'));
    } else if (typeof define === 'function' && define.amd) {
        define(['handlebars', 'underscore'], factory);
    } else {
        root.HandlebarsHelpersRegistry = factory(root.Handlebars, root._);
    }
}(this, function (Handlebars, _) {

    Handlebars.registerHelper('not', function(value, options) {
    	return !value || value == 0 ? options.fn(value) : false;
    });
    
}));

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('handlebars'));
    } else if (typeof define === 'function' && define.amd) {
        define(['handlebars'], factory);
    } else {
        root.HandlebarsHelpersRegistry = factory(root.Handlebars);
    }
}(this, function (Handlebars) {

    Handlebars.registerHelper('propertyOf', function(object, prop) {
        if(object.hasOwnProperty(prop)) {
            return new Handlebars.SafeString(object[prop]);
        }

        return null;
    });

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone', 'backbone.marionette'], function(_, Backbone, Marionette) {
            return factory(root.Toolbox, _, Backbone, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone, root.Marionette);
    }
}(this, function (Toolbox, _, Backbone, Marionette) {

    'use strict';


    Toolbox.Tree = Backbone.Collection.extend({

        hasResetOnce: false,

        defaultOptions: function() {
            return {
                comparator: false,
                childViewOptions: false,
                collectionClass: Backbone.Collection,
                originalCollection: false,
                idAttribute: 'id',
                parentAttribute: 'parent_id'
            };
        },

        initialize: function(collection, options) {
            Backbone.Collection.prototype.initialize.call(this, [], this.options = options);

            this.options = Toolbox.Options(this.defaultOptions, this.options, this);

            if(!this.getOption('originalCollection')) {
                this.options.originalCollection = collection;
            }

            if(this.template && !this.getOption('childViewOptions')) {
                this.options.childViewOptions = {
                    template: this.template
                };
            }

            this.on('after:initialize', function() {
                this.buildTree(collection);
            }, this);
        },

        reset: function() {
            // Hack to override the default Collection functionality
            // inherited by the prototype.
            if(!this.hasResetOnce) {
                this.hasResetOnce = true;
                this.trigger('after:initialize');
                return;
            }

            Backbone.Collection.prototype.reset.apply(this, arguments);
        },

        buildTree: function(data) {
            this.reset();

            if(data.toJSON) {
                data = data.toJSON();
            }

            data = this._createCollection(data);

            var count = 0, totalAttempts = data.length;

            while (data.length > 0) {
                var items = data.toArray();

                for(var i in items) {
                    if(items[i]) {
                        var parentId = this.getParentId(items[i]);
                        var parent = this.findNodeById(parentId);

                        if(_.isNull(parentId)) {
                            data.remove(this.appendNode(items[i]));
                        }
                        else if (parent = this.findNodeById(parentId)) {
                            data.remove(this.appendNode(items[i], parent));
                        }
                    }
                }

                if(count > totalAttempts) {
                    throw new Error('The tree could not be generated. Infinite loop detected with the remaining models: "'+data.pluck('id')+'"');
                }

                count++;
            }
        },

        getOption: function(name) {
            if(!_.isUndefined(this.options[name])) {
                return this.options[name];
            }

            return null;
        },

        getParentId: function(model) {
            if(!model) {
                return null;
            }

            return model.get(this.getOption('parentAttribute')) || null;
        },

        getId: function(model) {
            return model.get(this.getOption('idAttribute'));
        },

        reorder: function(collection) {
            collection = collection || this;

            collection.each(function(model, i) {
                model.set(this.comparator, i + 1);

                if(model.children && model.children.length) {
                    this.reorder(model.children);
                }
            }, this);
        },

        appendNodes: function(children, parent) {
            _.each(children, function(child) {
                this.appendNode(child, parent);
            }, this);
        },

        appendNode: function(child, parent, options) {
            options || (options = {});
            child.children || (child.children = this._createCollection());

            this.removeNode(child);

            if(parent) {
                child.set(this.getOption('parentAttribute'), parent.get(this.getOption('idAttribute')));
                parent.children.add(child, options);
            }
            else {
                child.set(this.getOption('parentAttribute'), null);
                this.add(child, options);
            }

            return child;
        },

        appendNodeBefore: function(child, sibling) {
            var parentId = this.getParentId(sibling);
            var parent = parentId ? this.find({id: parentId}) : null;
            var index = parent ? parent.children.indexOf(sibling) : this.indexOf(sibling);

            this.appendNode(child, parent, {
                at: index
            });

            return child;
        },

        appendNodeAfter: function(child, sibling) {
            var parentId = this.getParentId(sibling);
            var parent = this.find({id: parentId});

            if(parentId && parent) {
                this.appendNode(child, parent, {
                    at: parent.children.indexOf(sibling) + 1
                });
            }
            else {
                this.appendNode(child, null, {
                    at: this.indexOf(sibling) + 1
                });
            }

            return child;
        },

        removeNode: function(node) {
            var parentId = this.getParentId(node);

            if(parentId) {
                var parent = this.find({id: parentId});

                parent.children.remove(node);
            }
            else {
                this.remove(node);
            }
        },

        filter: function(iteratee, context) {
            function filter(collection) {
                var model = _.filter(collection.models, iteratee, context);

                if(model) {
                    return model;
                }

                for(var i in collection.models) {
                    var model = collection.models[i];

                    if(model.children && model.children.length) {
                        var found = filter(model.children);

                        if(found) {
                            return found;
                        }
                    }
                }
            }

            return filter(this);
        },

        find: function(iteratee, context) {
            function find(collection) {
                var model = _.find(collection.models, iteratee, context);

                if(model) {
                    return model;
                }

                for(var i in collection.models) {
                    var row = collection.models[i];

                    if(row.children && row.children.length) {
                        var found = find(row.children);

                        if(found) {
                            return found;
                        }
                    }
                }

                return null;
            }

            return find(this);
        },

        where: function(attributes, context) {
            return this.find.call(this, attributes, context);
        },

        findParentNode: function(child, collection) {
            return this.findNodeById(this.getParentId(child), collection);
        },

        findNode: function(child, collection) {
            return this.findNodeById(this.getId(child), collection);
        },

        findNodeById: function(id, collection) {
            collection || (collection = this);
            var models = collection.toArray();

            for(var i in models) {
                var model = models[i];

                if(id == this.getId(model)) {
                    return model;
                }
                else if(model.children) {
                    var node = this.findNodeById(id, model.children);

                    if(!_.isNull(node)) {
                        return node;
                    }
                }
            }

            return null;
        },

        toJSON: function() {
            function parse(collection) {
                var row = [];

                collection.each(function(model) {
                    var child = model.toJSON();

                    if(model.children) {
                        child.children = parse(model.children);
                    }

                    row.push(child);
                });

                return row;
            }

            return parse(this);
        },

        toString: function() {
            return JSON.stringify(this.toJSON());
        },

        _createCollection: function(data) {
            var Collection = this.getOption('collectionClass') || Backbone.Collection;

            data = new Collection(data || []);

            data.comparator = false;

            if(this.getOption('comparator')) {
                data.comparator = this.getOption('comparator');
            }

            return data;
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone', 'backbone.radio', 'backbone.marionette'], function(_, Backbone, Radio, Marionette) {
            return factory(root.Toolbox, _, Backbone, Radio, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'), require('backbone.radio'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone, root.Backbone.Radio, root.Marionette);
    }
}(this, function (Toolbox, _, Backbone, Radio, Marionette) {

    'use strict';

    Toolbox.View = Marionette.View.extend({

        defaultOptions: {

        },

        initialize: function() {
            Marionette.View.prototype.initialize.apply(this, arguments);

            this.options = Toolbox.Options(this.defaultOptions, this.options, this);

            this.channelName = _.result(this, 'channelName') || _.result(this.options, 'channelName') || 'toolbox';
            this.channel = _.result(this, 'channel') || _.result(this.options, 'channel') || Radio.channel(this.channelName);
        }

	});


    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone', 'backbone.radio', 'backbone.marionette'], function(_, Backbone, Radio, Marionette) {
            return factory(root.Toolbox, _, Backbone, Radio, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'), require('backbone.radio'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone, root.Backbone.Radio, root.Marionette);
    }
}(this, function (Toolbox, _, Backbone, Radio, Marionette) {

    'use strict';

    Toolbox.CollectionView = Marionette.CollectionView.extend({

        defaultOptions: {

        },

        initialize: function() {
            Marionette.CollectionView.prototype.initialize.apply(this, arguments);

            this.options = Toolbox.Options(this.defaultOptions, this.options, this);
            this.channelName = _.result(this, 'channelName') || _.result(this.options, 'channelName') || 'global';
            this.channel = _.result(this, 'channel') || _.result(this.options, 'channel') || Radio.channel(this.channelName);
        }

	});


    return Toolbox;

}));

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
                event: 'key:up',
                preventDefault: false
            },
            'keydown {{triggerSelector}}': {
                event: 'key:down',
                preventDefault: false
            },
            'keypress {{triggerSelector}}': {
                event: 'key:press',
                preventDefault: false
            }
        },

        triggers: {},

        defaultOptions: {
            id: false,
            label: false,
            description: false,
            name: false,
            value: false,
            header: false,
            labelClassName: 'control-label',
            inputClassName: 'form-control',
            descriptionClassName: 'description',
            headerTagName: 'h4',
            triggerSelector: 'input',
            updateModel: true
        },

        templateContext: function() {
            return this.options;
        },

        initialize: function() {
            Toolbox.View.prototype.initialize.apply(this, arguments);

            this.triggers = _.extend({}, this.getDefaultTriggers(), this.triggers);
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

        blur: function() {
            this.getInputField().blur();
        },

        focus: function() {
            this.getInputField().focus();
        },

        onRender: function() {
            this.setInputValue(this.getOption('value'));
        },

        onBlur: function() {
            this.save();
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

        setInputValue: function(value) {
            this.getInputField().val(value);
        },

        getInputValue: function() {
           return this.getInputField().val();
        },

        getInputField: function() {
            return this.$el.find('input');
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore', 'backbone', 'backbone.marionette'], function($, _, Backbone, Marionette) {
            return factory(root.Toolbox, $, _, Backbone, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('jquery'),
            require('underscore'),
            require('backbone'),
            require('backbone.marionette')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._, root.Backbone, root.Marionette);
    }
}(this, function (Toolbox, $, _, Backbone, Marionette) {

    'use strict';

    Toolbox.BlockFormError = Toolbox.View.extend({

        template: Toolbox.Template('form-error'),

        tagName: 'span',

        className: 'help-block',

        options: {
            // (string) The input field name
            field: false,

            // (array) The input field errors
            errors: [],

            // (bool) If true errors will have <br> tags to break error into newlines
            newline: true
        },

       templateContext: function() {
            var options = _.extend({}, this.options);

            if(!_.isArray(options.errors)) {
                options.errors = [options.errors];
            }

            return options;
        }

    });

    Toolbox.InlineFormError = Toolbox.BlockFormError.extend({

        className: 'help-inline'

    });

    Toolbox.BaseForm = Toolbox.View.extend({

        tagName: 'form',

        triggers: {
            'submit': 'submit'
        },

        isSubmitting: false,

        defaultOptions: {

            // (object) An object of activity indicator options
            activityIndicatorOptions: {
                indicator: 'small'
            },

            // (object) The error view object
            errorView: Toolbox.BlockFormError,

            // (object) The error view options object
            errorViewOptions: false,

            // (object) The global error view object
            globalErrorsView: false,

            // (object) The global error view options object
            globalErrorsOptions: {
                showEmptyMessage: false
            },

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
                title: 'Error!',
                message: 'The form could not be submitted.'
            }
        },

        _serializedForm: false,

        _errorViews: false,

        getFormData: function() {
            var formData = {};

            function isArray(key) {
                return key && key.match(/\[(\d+)?\]/) ? true : false;
            }

            _.each(this.$el.serializeArray(), function(field, x) {
                var subject = formData, lastKey, matches = field.name.match(/^\w+|\[(\w+)?\]/g);

                _.each(matches, function(match, i) {
                    var key = match.replace(/[\[\]]/g, '');
                    var nextKey = matches[i + 1];
                    var isLastMatch = matches.length - 1 == i;

                    if(isArray(match)) {
                        if(!key) {
                            subject.push(field.value);
                        }
                        else {
                            subject.splice(key, 0, field.value);
                        }
                    }
                    else {
                        if(!subject[key]) {
                            subject[key] = nextKey && isArray(nextKey) ? [] : {};
                        }

                        if(isLastMatch) {
                            subject[key] = field.value;
                        }

                        subject = subject[key];
                    }

                    lastKey = key;
                });
            });

            return formData;
        },

        /*
        getFormData: function() {
            var data = {};

            function stripBrackets(component) {
                var matches = component.match(/[^\[\]]+/);

                return matches ? matches[0] : false;
            }

            function addComponent(subject, component, value) {
                if(!subject[component]) {
                    subject[component] = value;
                }

                return subject[component];
            }

            function addComponents(subject, components, value) {
                _.each(components, function(component, i) {
                    var variable = stripBrackets(component);

                    if(variable) {
                        subject = addComponent(subject, variable, components.length > i + 1 ? {} : value);
                    }
                    else {
                        // this is an array like []
                    }
                });
            }

            function createObjects(root, components, value) {
                if(!data[root]) {
                    data[root] = {};
                }

                addComponents(data[root], components, value);
            }

            this.$el.find('input, select, textarea').each(function() {
                var name = $(this).attr('name');

                if(($(this).is(':radio') || $(this).is(':checkbox'))) {
                    if($(this).is(':checked')) {
                        var value = $(this).val();
                    }
                }
                else {
                    var value = $(this).val();
                }

                if(name && (!_.isNull(value) && !_.isUndefined(value))) {
                    var matches = name.match(/(^\w+)?(\[.*!?\])/);

                    if(matches) {
                        var root = matches[1];
                        var components = matches[2].match(/\[.*?\]/g);

                        createObjects(root, components, value);
                    }
                    else {
                        data[name] = value;
                    }
                }
            });

                    console.log('data', this.$el.serializeArray());

            return data;
        },
        */

        showActivityIndicator: function() {
            this.$indicator = this.$el.find('.form-indicator');

            if(this.$indicator.length === 0) {
                this.$indicator = $('<div class="form-indicator"></div>');

                if(this.$el.find('footer').length) {
                    this.$el.find('footer').append(this.$indicator);
                }
                else {
                    this.$el.append(this.$indicator);
                }
            }

            this.indicator = new Backbone.Marionette.Region({
                el: this.$indicator.get(0)
            });

            var indicator = new Toolbox.ActivityIndicator(this.getOption('activityIndicatorOptions'));

            this.indicator.show(indicator);
        },

        removeErrors: function() {
            if(this.$errors) {
                _.each(this.$errors, function($error) {
                    $error.parents('.'+this.getOption('hasErrorClassName'))
                        .removeClass(this.getOption('hasErrorClassName'))
                        .remove();
                }, this);
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
                View = Toolbox.UnorderedList;
            }

            this.$globalErrors = $('<div class="global-errors"></div>');

            this.appendGlobalErrorRegionToDom(this.$globalErrors);

            this.globalErrors = new Marionette.Region({
                el: this.$globalErrors.get(0)
            });

            var errorsView = new View(_.extend(this.getOption('globalErrorsOptions')));

            this.globalErrors.show(errorsView);
        },

        appendGlobalErrorRegionToDom: function($globalErrors) {
            this.$el.prepend($globalErrors);
        },

        createNotification: function(notice) {
            var View = this.getOption('notificationView');

            if(!View) {
                View = Toolbox.Notification;
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

            var model = new Backbone.Model();

            var view = new View(_.extend({}, this.getOption('errorViewOptions'), {
                field: field,
                errors: error
            }));

            return view;
        },

        getInputFieldParent: function(field) {
            return this.getInputField(field).parents('.' + this.getOption('formGroupClassName'));
        },

        getInputField: function(field) {
            field = field.replace('.', '_');

            var $field = this.$el.find('[name="'+field+'"]');

            if($field.length) {
                return $field;
            }
            else {
                return this.$el.find('#'+field);
            }
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
            this.globalErrors.currentView.collection.add({
                content: errorView.getOption('errors')
            });
        },

        appendErrorViewToField: function(errorView) {
            errorView.render();

            this.getInputFieldParent(errorView.getOption('field'))
                .append(errorView.$el);
        },

        hideErrors: function() {
            if(this.getOption('showGlobalErrors') === true) {
                this.removeGlobalErrors();
            }

            if(_.isArray(this._errorViews)) {
                _.each(this._errorViews, function(view) {
                    if(this.getOption('addHasErrorClass') === true) {
                        this.removeHasErrorClassFromField(view.getOption('field'));
                    }

                    if(this.getOption('showInlineErrors') === true) {
                        view.$el.remove();
                    }
                }, this);
            }
        },

        showError: function(field, error) {
            if(!this._errorViews) {
                this._errorViews = [];
            }

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
            if(this.indicator) {
                this.indicator.empty();
            }
        },

        getErrorsFromResponse: function(response) {
            return response.responseJSON.errors;
        },

        getRedirect: function() {
            return this.getOption('redirect');
        },

        redirect: function() {
            var redirect = this.getRedirect();

            if(redirect) {
                window.location = redirect;
            }
        },

        showSuccessNotification: function() {
            var notification = this.createNotification(_.extend(
                this.getOption('defaultSuccessMessage'),
                this.getOption('successMessage')
            ));

            notification.show();
        },

        showErrorNotification: function() {
            var notification = this.createNotification(_.extend(
                this.getOption('defaultErrorMessage'),
                this.getOption('errorMessage')
            ));

            notification.show();
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
                this.showSuccessNotification();
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
                this.showErrorNotification();
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

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone'], function(Backbone) {
            return factory(root.Toolbox, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.Backbone);
    }
}(this, function (Toolbox, Backbone) {

    'use strict';

	Toolbox.NoUnorderedListItem = Toolbox.View.extend({

		template: Toolbox.Template('no-unordered-list-item'),

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateContext: function() {
			return this.options;
		}

	});

	Toolbox.UnorderedListItem = Toolbox.View.extend({

		className: 'unordered-list-item',

		tagName: 'li',

		events: {
			'click': function(e, obj) {
				this.triggerMethod('click', obj);
			}
		},

		templateContext: function() {
			return this.options
		},

        getTemplate: function() {
            if(!this.getOption('template')) {
                return Toolbox.Template('unordered-list-item');
            }

            return this.getOption('template');
        }

	});

	Toolbox.UnorderedList = Toolbox.CollectionView.extend({

		childView: Toolbox.UnorderedListItem,

		className: 'unordered-list',

		tagName: 'ul',

		defaultOptions: {
			// (object) The view object to use for the empty message
			emptyMessageView: Toolbox.NoUnorderedListItem,

			// (string) The message to display if there are no list items
			emptyMessage: 'There are no items in the list.',

			// (bool) Show the empty message view
			showEmptyMessage: true
		},

		childViewEvents: {
			'click': function(view) {
				this.triggerMethod('item:click', view);
			}
		},

		initialize: function() {
			Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

			if(!this.collection) {
				this.collection = new Backbone.Collection();
			}
		},

        getEmptyView: function() {
        	if(this.getOption('showEmptyMessage')) {
	            var View = this.getOption('emptyMessageView');

	            View = View.extend({
	                options: {
	                    message: this.getOption('emptyMessage')
	                }
	            });

	            return View;
	        }

	        return;
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone'], function(Backbone) {
            return factory(root.Toolbox, root._, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, _, root.Backbone);
    }
}(this, function (Toolbox, _, Backbone) {

    'use strict';

    Toolbox.DropdownMenuNoItems = Toolbox.View.extend({

		tagName: 'li',

		template: Toolbox.Template('dropdown-menu-no-items'),

		className: 'no-results',

        defaultOptions: {
            message: 'There are no items in the dropdown menu',
        },

        templateContext: function() {
            return this.options;
        }

	});

	Toolbox.DropdownMenuItem = Toolbox.View.extend({

		tagName: 'li',

        className: 'dropdown-menu-item',

		template: Toolbox.Template('dropdown-menu-item'),

		defaultOptions: {
			dividerClassName: 'divider'
		},

		triggers: {
			'click': {
				event: 'click',
				preventDefault: false,
				stopPropagation: false
		    }
		},

        events: {
            'click a': function(event) {
                if(_.isFunction(this.model.get('onClick'))) {
                    this.model.get('onClick').call(this, event);
                    event.preventDefault();
                }
                else if(!this.model.get('href')) {
                    event.preventDefault();
                }
            }
        },

		onDomRefresh: function() {
			if(this.model.get('divider') === true) {
				this.$el.addClass(this.getOption('dividerClassName'));
			}
		}

	});

    Toolbox.DropdownMenuList = Toolbox.CollectionView.extend({

		childView: Toolbox.DropdownMenuItem,

		emptyView: Toolbox.DropdownMenuNoItems,

        className: 'dropdown-menu',

		tagName: 'ul',

		childViewEvents: {
			'click': function(view, event) {

				this.triggerMethod('click', view, event);
			}
		}

	});

	Toolbox.DropdownMenu = Toolbox.View.extend({

		template: Toolbox.Template('dropdown-menu'),

		className: 'dropdown',

		tagName: 'li',

        regions: {
            menu: {
                el: 'ul.dropdown-menu',
                replaceElement: true
            }
        },

		childViewEvents: {
			'click': function(view) {
                console.log('asd', arguments);

				if(this.getOption('closeOnClick') === true) {
					this.hideMenu()
				}

				this.triggerMethod('item:click', view);
			}
		},

		triggers: {
			'click .dropdown-toggle': 'toggle:click'
		},

		defaultOptions: {
            // (array) An array of menu items to be converted to a collection.
            items: [],

			// (string) The dropdown toggle text
			toggleLabel: false,

			// (string) The dropdown toggle class name
			toggleClassName: 'dropdown-toggle',

			// (string) The dropdown toggle icon class name
			toggleIconClassName: 'fa fa-caret-down',

			// (string) The dropdown menu class name
			menuClassName: 'dropdown-menu',

			// (string) The open class name
            openClassName: 'open',

            // (object) The view used to generate the menu items lsit
            menuViewClass: Toolbox.DropdownMenuList,

			// (int|bool) The collection limit
			limit: false,

			// (string) The order of the collection items
			order: 'name',

			// (string) Either asc or desc
			sort: 'asc',

			// (bool) Close the menu after an item has been clicked
			closeOnClick: true,

			// (bool) Fetch the collection when the dropdown menu is shown
			fetchOnShow: false,

			// (bool) Show an activity indicator when fetching the collection
			showIndicator: true,

			// (string) The dropdown toggle class name
			openClassName: 'open'
		},

        templateContext: function() {
            return this.options;
        },

		initialize: function() {
			Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

			this.on('fetch', function() {
				if(this.getOption('showIndicator')) {
					this.showIndicator();
				}
			});

			this.on('fetch:success fetch:error', function() {
				if(this.getOption('showIndicator')) {
					this.hideIndicator();
				}
			});

            if(!this.collection) {
                this.collection = new Backbone.Collection(this.getOption('items'));
            }
		},

		showIndicator: function() {
			var ActivityViewItem = Toolbox.ActivityIndicator.extend({
				tagName: 'li',
				className: 'activity-indicator-item',
				initialize: function() {
					Toolbox.ActivityIndicator.prototype.initialize.apply(this, arguments);

					this.options.indicator = 'small';
				}
			});

			this.addChild(new Backbone.Model(), ActivityViewItem);
		},

		hideIndicator: function() {
			var view = this.children.findByIndex(0);

			if(view && view instanceof Toolbox.ActivityIndicator) {
				this.children.remove(this.children.findByIndex(0));
			}
		},

		showMenu: function() {
			this.$el.find('.'+this.getOption('toggleClassName')).parent().addClass(this.getOption('openClassName'));
			this.$el.find('.'+this.getOption('toggleClassName')).attr('aria-expanded', 'true');
		},

		hideMenu: function() {
			this.$el.find('.'+this.getOption('toggleClassName')).parent().removeClass(this.getOption('openClassName'));
			this.$el.find('.'+this.getOption('toggleClassName')).attr('aria-expanded', 'false');
		},

		isMenuVisible: function() {
			return this.$el.find('.'+this.getOption('toggleClassName')).parent().hasClass(this.getOption('openClassName'));
		},

		onToggleClick: function() {
			if(!this.isMenuVisible()) {
				this.showMenu();
			}
			else {
				this.hideMenu();
			}
		},

		onRender: function() {
            var MenuView = this.getOption('menuViewClass') || Toolbox.DropdownMenuList;

            this.showChildView('menu', new MenuView({
                collection: this.collection
            }));

            if(this.getOption('fetchOnShow')) {
				this.fetch();
			}
		},

		fetch: function() {
			var self = this;

			this.triggerMethod('fetch');

			this.collection.fetch({
				data: {
					limit: this.getOption('limit'),
					order: this.getOption('order'),
					sort: this.getOption('sort'),
				},
				success: function(collection, response) {
					if(self.getOption('showIndicator')) {
						self.hideIndicator();
					}

					self.render();
					self.triggerMethod('fetch:success', collection, response);
				},
				error: function(collection, response) {
					self.triggerMethod('fetch:error', collection, response);
				}
			});
		}

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], function(_, Backbone) {
            return factory(root.Toolbox, _, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone);
    }
}(this, function (Toolbox, _, Backbone) {

    'use strict';

    Toolbox.TreeViewNode = Toolbox.View.extend({

        getTemplate: function() {
            if(!this.getOption('template')) {
                return Toolbox.Template('tree-view-node');
            }

            return this.getOption('template');
        },

        tagName: 'li',

        className: 'tree-view-node',

        defaultOptions:  {
            idAttribute: 'id',
            parentAttribute: 'parent_id',
            childView: false,
            childViewOptions: false
        },

        regions: {
            nodes: '.children'
        },

        attributes: function() {
            return {
                'data-id': this.model.get(this.getOption('idAttribute')) || this.model.cid,
                'data-parent-id': this.model.get(this.getOption('parentAttribute'))
            };
        },

        initialize: function() {
            Toolbox.View.prototype.initialize.apply(this, arguments);

            var options = _.extend({}, this.options);

            delete options.model;

            this.childViewOptions = _.extend({}, options, this.getOption('childViewOptions') || {});

            if(this.collection = this.getNodesFromModel(this.model)) {
                if(!this.$el.find('.children').html()) {
                    this.collection.once('add', function() {
                        this.showNodes();
                    }, this);
                }
            }
        },

       templateContext: function() {
            return {
                hasChildren:  this.collection ? this.collection.length > 0 : false
            };
        },

        getNodesFromModel: function(model) {
            return model.children;
        },

        showNodes: function() {
            var nodes = this.getNodesFromModel(this.model);

            if(nodes && nodes.length) {
                if(!this.$el.find('.children').length) {
                    this.$el.append('<div class="children"/>');
                }

                if(!this.hasRegion('nodes')) {
                    this.addRegion('nodes', '.children');
                }

                var ChildView = this.getOption('childView') || Toolbox.TreeView;

                this.showChildView('nodes', new ChildView({
                    collection: nodes,
                    template: this.getOption('template'),
                    childViewOptions: this.childViewOptions
                }));
            }
        },

        onDomRefresh: function() {
            this.showNodes();
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], function(_, Backbone) {
            return factory(root.Toolbox, _, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone);
    }
}(this, function (Toolbox, _, Backbone) {

    'use strict';

    Toolbox.TreeView = Toolbox.CollectionView.extend({

        childView: Toolbox.TreeViewNode,

        tagName: 'ul',

        className: 'tree-view',

        defaultOptions: {
            nestable: true
        },

        emptyView: Toolbox.ItemView,

        emptyViewOptions: {
            template: Toolbox.Template('no-tree-view-nodes')
        },
        
        initialize: function() {
            Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

            if(this.getOption('tree')) {
                this.collection = this.getOption('tree');
            }

            this.childViewOptions = _.extend({}, {
                treeRoot: this,
            }, this.getOption('childViewOptions') || {});
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jquery', 'backbone.marionette', 'interact.js'], function(_, $, Marionette, interact) {
            return factory(root.Toolbox, _, $, Marionette, interact);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore'),
            require('jquery'),
            require('backbone.marionette'),
            require('interact.js')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.$, root.Marionette, root.interact);
    }
}(this, function (Toolbox, _, $, Marionette, interact) {

    function getIdAttribute(value) {
        return _.isNull(new String(value).match(/^c\d+$/)) ? 'id' : 'cid';
    }

    Toolbox.DraggableTreeNode = Toolbox.TreeViewNode.extend({

        className: 'draggable-tree-node',

        defaultOptions: function() {
            return _.extend({}, Toolbox.TreeViewNode.prototype.defaultOptions, {
                draggingClassName: 'dragging',
                menuClassName: 'menu',
                menuView: Toolbox.DropdownMenu,
                menuViewOptions: {
                    tagName: 'div'
                },
                menuItems: [],
                nestable: true
            });
        },

        root: function() {
            return this.getOption('treeRoot');
        },

        getMenuContainer: function() {
            return this.$el.find('.' + this.getOption('menuClassName'));
        },

        showMenu: function() {
            var View = this.getOption('menuView'), container = this.getMenuContainer();

            if(View && container.length) {
        		var view = new View(_.extend({}, this.getOption('menuViewOptions'), {
        			items: this.getOption('menuItems')
        		}));

                this.menu = new Marionette.Region({
                    el: container.get(0)
                });

                this.menu.show(view);
            }
        },

        onDrop: function(event) {
            var self = this, $target = $(event.target);

            if($target.hasClass('drop-before')) {
                this.root().triggerMethod('drop:before', event, self);
            }
            else if($target.hasClass('drop-after')) {
                this.root().triggerMethod('drop:after', event, self);
            }
            else if($target.hasClass('drop-children')) {
                if(this.getOption('nestable')) {
                    this.root().triggerMethod('drop:children', event, self);
                }
                else {
                    this.root().triggerMethod('drop:after', event, self);
                }
            }

            self.root().triggerMethod('drop', event, this);
        },

        onDropMove: function(event) {
            Toolbox.Dropzones(event, {
                before: function($element) {
                    $element.addClass('drop-before')
                        .removeClass('drop-after drop-children');
                },
                after: function($element) {
                    $(event.dropzone.element())
                        .addClass('drop-after')
                        .removeClass('drop-before drop-children');
                },
                children: function($element) {
                    if(this.getOption('nestable')) {
                        $(event.dropzone.element())
                            .addClass('drop-children')
                            .removeClass('drop-after drop-before')
                    }
                }
            }, this);

            this.root().triggerMethod('drop:move', event, this);
        },

        onDragMove: function(event) {
            var target = this._ghostElement.get(0);

            var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);

            this.root().triggerMethod('drag:move', event, this);
        },

        onDragStart: function(event) {
            var $target = $(event.target);

            this._ghostElement = $('<ul class="draggable-tree" />')
                .append($target.clone())
                .addClass(this.getOption('draggingClassName'))
                .css({
                    left: event.interaction.curCoords.client.x - ($target.find('.drag-handle').outerWidth() / 2),
                    top: event.interaction.curCoords.client.y - ($target.find('.drag-handle').outerHeight() / 2)
                });

            $target.css('opacity', 0);
            $('body').append(this._ghostElement);

            this.root().triggerMethod('drag:start', event, this);
        },

        onDragEnd: function(event) {
            $(event.target).css('opacity', 100);

            this._ghostElement.remove();
            this.root().triggerMethod('drag:end', event, this);
        },

        onDragEnter: function(event) {
            this.root().triggerMethod('drag:enter', event, this);
        },

        onDragLeave: function(event) {
            $(event.target).removeClass('drop-before drop-after drop-children');

            this.root().triggerMethod('drag:leave', event, this);
        },

        onDropDeactivate: function(event) {
            $(event.target).removeClass('drop-before drop-after drop-children');

            this.root().triggerMethod('drop:deactivate', event, this);
        },

        onDomRefresh: function() {
            Toolbox.TreeViewNode.prototype.onDomRefresh.call(this);

            var self = this, $el = this.$el;

            interact(this.$el.get(0), {
                    // allowFrom: '.drag-handle'
                })
                .draggable({
                    autoScroll: true,
                    onmove: function(event) {
                        self.triggerMethod('drag:move', event);
                    },
                    onend: function (event) {
                        self.triggerMethod('drag:end', event);
                    },
                    onstart: function(event) {
                        self.triggerMethod('drag:start', event);
                    }
                })
                .dropzone({
                    accept: '.' + this.className,
                    overlap: 'pointer',
                    ondragenter: function (event) {
                        self.triggerMethod('drag:enter', event);
                    },
                    ondragleave: function (event) {
                        self.triggerMethod('drag:leave', event);
                    },
                    ondrop: function (event) {
                        self.triggerMethod('drop', event);
                    },
                    ondropdeactivate: function (event) {
                        self.triggerMethod('drop:deactivate', event);
                    }
                })
                .on('dragmove', function(event) {
                    if(event.dropzone) {
                        self.triggerMethod('drop:move', event);
                    }
                });

            this.showMenu();
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jquery', 'backbone.marionette', 'interact.js'], function(_, $, Marionette, interact) {
            return factory(root.Toolbox, _, $, Marionette, interact);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore'),
            require('jquery'),
            require('backbone.marionette'),
            require('interact.js')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.$, root.Marionette, root.interact);
    }
}(this, function (Toolbox, _, $, Marionette, interact) {

    Toolbox.DraggableTreeView = Toolbox.TreeView.extend({

        childView: Toolbox.DraggableTreeNode,

        className: 'draggable-tree',

        childViewOptions: {
            idAttribute: 'id',
            parentAttribute: 'parent_id',
            childView: Toolbox.DraggableTreeView
        },

        onDropAfter: function(event, parent) {
            var node = this.collection.findNodeById($(event.dragEvent.target).data('id'));

            this.collection.appendNodeAfter(node, parent.model);
        },

        onDropBefore: function(event, parent) {
            var node = this.collection.findNodeById($(event.dragEvent.target).data('id'));

            this.collection.appendNodeBefore(node, parent.model);
        },

        onDropChildren: function(event, parent) {
            var node = this.collection.findNodeById($(event.dragEvent.target).data('id'));

            this.collection.appendNode(node, parent.model, {
                at: 0
            });
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jquery', 'spin.js'], function(_, $, Spinner) {
            return factory(root.Toolbox, _, $, Spinner);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('jquery'), require('spin.js'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.$, root.Spinner);
    }
}(this, function (Toolbox, _, $, Spinner) {

    'use strict';

    Toolbox.ActivityIndicator = Toolbox.View.extend({

        template: Toolbox.Template('activity-indicator'),

        spinning: false,

        defaultOptions: {
            label: false,
            labelFontSize: false,
            dimmedBgColor: false,
            dimmed: false,
            autoStart: true,
            position: false,
            minHeight: '0px',
            indicator: {},
            labelOffset: 0,
            defaultIndicator: {
                lines: 11, // The number of lines to draw
                length: 15, // The length of each line
                width: 3, // The line thickness
                radius: 13, // The radius of the inner circle
                corners: 4, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                color: '#000', // #rgb or #rrggbb or array of colors
                speed: 1, // Rounds per second
                trail: 40, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: true, // Whether to use hardware acceleration
                className: 'activity-indicator-spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: '50%', // Top position relative to parent
                left: '50%' // Left position relative to parent
            }
        },

        templateContext: function() {
            return this.options;
        },

        getPresetOptions: function() {
            return {
                'tiny': {
                    lines: 12, // The number of lines to draw
                    length: 4, // The length of each line
                    width: 1, // The line thickness
                    radius: 4, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 15,
                },
                'small': {
                    lines: 12, // The number of lines to draw
                    length: 7, // The length of each line
                    width: 1, // The line thickness
                    radius: 7, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 20,
                },
                'medium': {
                    lines: 12, // The number of lines to draw
                    length: 14, // The length of each line
                    width: 1, // The line thickness
                    radius: 11, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 30,
                },
                'large': {
                    lines: 12, // The number of lines to draw
                    length: 28, // The length of each line
                    width: 1, // The line thickness
                    radius: 20, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 60
                }
            };
        },

        initialize: function() {
            Toolbox.View.prototype.initialize.apply(this, arguments);

            var resizeTimer, self = this;

            $(window).resize(function() {
                self.$el.find('.activity-indicator-label').css({top: ''});
                self.positionLabel();
            });
        },

        positionLabel: function() {
            if(this.spinner && this.getOption('label')) {
                var $label = this.$el.find('.activity-indicator-label');
                var height = $label.outerHeight();
                var offset = Toolbox.ViewOffset($label.get(0));

                $label.children().css({
                    top: this.spinner.opts.labelOffset || 0
                });
            }
        },

        setLabel: function(value) {
            this.$el.find('.activity-indicator-label').html(this.options.label = value);
        },

        getSpinnerOptions: function() {
            var defaultIndicator = this.getOption('defaultIndicator');
            var indicator = this.getOption('indicator');
            var presets = this.getPresetOptions();

            if(_.isString(indicator) && presets[indicator]) {
                indicator = presets[indicator];
            }
            else if(typeof indicator !== "object"){
                indicator = {};
            }

            return _.extend({}, defaultIndicator, indicator);
        },

        getSpinnerDom: function() {
            return this.$el.find('.activity-indicator').get(0);
        },

        start: function() {
            this.spinning = true;
            this.spinner.spin(this.getSpinnerDom());
            this.triggerMethod('start');
        },

        stop: function() {
            this.spinning = false;
            this.spinner.stop();
            this.triggerMethod('stop');
        },

        onDomRefresh: function() {
            var self = this;

            // create the spinner object
            this.spinner = new Spinner(this.getSpinnerOptions());

            // start if options.autoStart is true
            if(this.getOption('autoStart')) {
                this.start();
            }

            setTimeout(function() {
                self.positionLabel();
            });
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.ButtonDropdownMenu = Toolbox.DropdownMenu.extend({

		template: Toolbox.Template('button-dropdown-menu'),

		childViewContainer: 'ul',

		tagName: 'div',

		triggers: {
			'click .btn:not(.dropdown-toggle)': 'button:click',
			'click .dropdown-toggle': 'toggle:click'
		},

		defaultOptions: {
            // (array) An array of menu items to be converted to a collection.
            items: [],

			// (string) The dropdown button text
			buttonLabel: false,

			// (string) The dropdown button class name
			buttonClassName: 'btn btn-default',

			// (string) The dropdown toggle class name
			buttonToggleClassName: 'dropdown-toggle',

			// (string) The dropdown menu class name
			menuClassName: 'dropdown-menu',

			// (int|bool) The collection limit
			limit: false,

			// (string) The order of the collection items
			order: 'name',

			// (string) Either asc or desc
			sort: 'asc',

			// (bool) Close the menu after an item has been clicked
			closeOnClick: true,

			// (bool) Menu appear as a "dropup" instead of a "dropdown"
			dropUp: false,

			// (bool) Fetch the collection when the dropdown menu is shown
			fetchOnShow: false,

			// (bool) Show an activity indicator when fetching the collection
			showIndicator: true,

			// (bool) Show the button as split with two actions instead of one
			splitButton: false,

			// (string) The dropdown toggle class name
			toggleClassName: 'open'
		},

		showMenu: function() {
			this.$el.find('.dropdown-toggle').parent().addClass(this.getOption('toggleClassName'));
			this.$el.find('.dropdown-toggle').attr('aria-expanded', 'true');
		},

		hideMenu: function() {
			this.$el.find('.dropdown-toggle').parent().removeClass(this.getOption('toggleClassName'));
			this.$el.find('.dropdown-toggle').attr('aria-expanded', 'false');
		},

		isMenuVisible: function() {
			return this.$el.find('.'+this.getOption('toggleClassName')).length > 0;
		}

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], function(_, Backbone) {
            return factory(root.Toolbox, _, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone);
    }
}(this, function (Toolbox, _, Backbone) {

	'use strict';

	Toolbox.NoBreadcrumbs = Toolbox.View.extend({

		template: Toolbox.Template('no-breadcrumbs'),

		tagName: 'li',

		className: 'no-breadcrumbs'

	});

	Toolbox.Breadcrumb = Toolbox.View.extend({

		template: Toolbox.Template('breadcrumb'),

		tagName: 'li'

	});

	Toolbox.Breadcrumbs = Toolbox.CollectionView.extend({

		childView: Toolbox.Breadcrumb,

		emptyView: Toolbox.NoBreadcrumbs,

		className: 'breadcrumb',

		tagName: 'ol',

		defaultOptions: {
			activeClassName: 'active'
		},

		collectionEvents: {
			'change add remove reset': function() {
				var t = this;

				setTimeout(function() {
					t.onDomRefresh();
				});
			}
		},

		initialize: function() {
			Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

			if(!this.collection) {
				this.collection = new Backbone.Collection();
			}
		},

		getBreadcrumbs: function() {
			var breadcrumbs = this.collection ? this.collection.toJSON() : [];

			if(!_.isArray(breadcrumbs)) {
				breadcrumbs = [];
			}

			return breadcrumbs;
		},

		addBreadcrumbs: function(breadcrumbs) {
			if(_.isArray(breadcrumbs)) {
				_.each(breadcrumbs, function(breadcrumb) {
					this.addBreadcrumb(breadcrumb);
				}, this);
			}
			else {
				throw Error('Adding multiple breadcrumbs must done by passing an array');
			}

			return this;
		},

		addBreadcrumb: function(breadcrumb) {
			if(_.isObject(breadcrumb)) {
				this.collection.add(breadcrumb);
			}
			else {
				throw Error('A breadcrumb must be passed as an object');
			}

			return this;
		},

		setBreadcrumbs: function(breadcrumbs) {
			if(_.isArray(breadcrumbs)) {
				this.collection.set(breadcrumbs);
			}
			else {
				throw Error('You must pass an array to set the breadcrumbs');
			}

			return this;
		},

		insertBreadcrumb: function(breadcrumb) {
			if(_.isObject(breadcrumb)) {
				this.collection.unshift(breadcrumb);
			}
			else {
				throw Error('A breadcrumb must be passed as an object');
			}

			return this;
		},

		insertBreadcrumbs: function(breadcrumbs) {
			var t = this;

			if(_.isArray(breadcrumbs)) {
				_.each(breadcrumbs, function(breadcrumb) {
					t.insertBreadcrumb(breadcrumb);
				});
			}
			else {
				throw Error('Inserting multiple breadcrumbs must done by passing an array');
			}

			return this;
		},

		removeBreadcrumbs: function() {
			this.collection.reset();
		},

		onDomRefresh: function() {
			if(!this.$el.find('.no-breadcrumbs').length) {
				this.$el.parent().show();
				this.$el.find('.active').removeClass(this.getOption('activeClassName'));
				this.$el.find('li:last-child').addClass(this.getOption('activeClassName'));

				if(this.$el.find('li:last-child a').length) {
					this.$el.find('li:last-child').html(this.$el.find('li:last-child a').html());
				}
			}
			else {
				this.$el.parent().hide();
			}
		}

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone'], function(Backbone) {
            return factory(root.Toolbox, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.Backbone);
    }
}(this, function (Toolbox, Backbone) {

    'use strict';

    Toolbox.ButtonGroupItem = Toolbox.View.extend({

		template: Toolbox.Template('button-group-item'),

		tagName: 'a',

		className: 'btn btn-default',

		triggers: {
			'click': 'click'
		},

        options: {
			// (string) The disabled class name
			disabledClassName: 'disabled'
        },

		onDomRefresh: function() {
			if(this.model.get(this.getOption('disabledClassName'))) {
				this.$el.addClass(this.getOption('disabledClassName'));
			}

            if(this.model.get('className')) {
                this.$el.addClass(this.model.get('className'));
            }
            
			if(this.model.get('active')) {
				this.$el.click();
			}
		}

	});

	Toolbox.NoButtonGroupItems = Toolbox.View.extend({

		template: Toolbox.Template('no-button-group-item')

	});

	Toolbox.ButtonGroup = Toolbox.CollectionView.extend({

		childView: Toolbox.ButtonGroupItem,

		emptyView: Toolbox.NoButtonGroupItems,

		className: 'btn-group',

		tagName: 'div',

		childViewEvents: {
			'click': 'onChildClick'
		},

		defaultOptions: {
			// (string) The active class name
			activeClassName: 'active',

			// (string) The disabled class name
			disabledClassName: 'disabled',

			// (bool) Activate the button on click
			activateOnClick: true,

			// (mixed) Pass an array of buttons instead of passing a collection object.
			buttons: false
		},

        initialize: function(options) {
            Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

            if(this.getOption('buttons') && !options.collection) {
                this.collection = new Backbone.Collection(this.getOption('buttons'));
            }
        },

        setActiveIndex: function(index) {
            if(this.children.findByIndex(index)) {
                this.children.findByIndex(index).$el.click();
            }
        },

		onDomRefresh: function() {
			this.$el.find('.'+this.getOption('activeClassName')).click();
		},

		onChildClick: function(child) {
            if(!child.$el.hasClass(this.getOption('disabledClassName'))) {
    			this.trigger('click', child);

    			if(this.getOption('activateOnClick') && !child.$el.hasClass(this.getOption('activeClassName'))) {
    				this.$el.find('.'+this.getOption('activeClassName'))
    					.removeClass(this.getOption('activeClassName'));

    				child.$el.addClass(this.getOption('activeClassName'));

    				this.triggerMethod('activate', child);
    			}
            }
		}

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore'], function($, _) {
            return factory(root.Toolbox, $, _)
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('underscore'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._);
    }
}(this, function (Toolbox, $, _) {

    'use strict';

    Toolbox.CheckboxField = Toolbox.BaseField.extend({

        template: Toolbox.Template('form-checkbox-field'),

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
            if(!_.isArray(values)) {
                values = [values];
            }

            this.$el.find(':checked').attr('checked', false);

            _.each(values, function(value) {
                this.$el.find('[value="'+value+'"]').attr('checked', true);
            }, this);
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'underscore',
            'backbone',
            'backbone.marionette',
            'moment'
        ], function(_, Backbone, Marionette, moment) {
            return factory(root.Toolbox, _, Backbone, Marionette, moment)
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore'),
            require('backbone'),
            require('backbone.marionette'),
            require('moment')
        );
    } else {
        root.Toolbox = factory(
            root.Toolbox,
            root._,
            root.Backbone,
            root.Marionette,
            root.moment
        );
    }
}(this, function (Toolbox, _, Backbone, Marionette, moment) {

    'use strict';

    Toolbox.MonthlyCalendarDay = Toolbox.View.extend({

        template: Toolbox.Template('calendar-monthly-day-view'),

        tagName: 'td',

        className: 'calendar-day',

        triggers: {
            'click': 'click'
        },

        modelEvents:  {
            'change': 'modelChanged'
        },

        modelChanged: function() {
            this.render();
        },

       templateContext: function() {
            return {
                hasEvents: this.hasEvents()
            }
        },

        setCellHeight: function(width) {
            this.$el.css('height', width || this.$el.width());
        },

        getDate: function() {
            var date = this.model.get('date');

            if(!date instanceof moment) {
                date = moment(date);
            }

            return date;
        },

        hasEvents: function() {
            return this.model.get('events') && this.model.get('events').length > 0 ? true : false;
        },

        onRender: function() {
            if(this.getDate().isSame(new Date(), 'day')) {
                this.$el.addClass('calendar-today');
            }

            if(this.getDate().isSame(this.getOption('currentDate'), 'day')) {
                this.$el.addClass('calendar-current-day');
            }

            if(this.getDate().isSame(this.getOption('currentDate'), 'month')) {
                this.$el.addClass('calendar-month');
            }
        },

        getEvents: function() {
            return this.model.get('events') || [];
        },

        setEvents: function(events) {
            this.model.set('events', events);
        },

        addEvent: function(event) {
            var existing = _.clone(this.getEvents());

            existing.push(event);

            this.setEvents(existing);
        },

        addEvents: function(events) {
            var existing = _.clone(this.getEvents());

            this.setEvents(_.merge(existing, events));
        },

        removeEvent: function(index) {
            var events = this.getEvents();

            delete events[index];

            this.setEvents(events);
        },

        removeEvents: function() {
            this.setEvents([]);
        }

    });

    Toolbox.MonthlyCalendarWeek = Toolbox.CollectionView.extend({

        childView: Toolbox.MonthlyCalendarDay,

        tagName: 'tr',

        childViewEvents: {
            click: function(view, event) {
                this.triggerMethod('day:click', view, this, event);
            }
        },

        defaultOptions: {
            days: false,
            events: false
        },

        initialize: function() {
            Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

            if(!this.collection) {
                this.collection = new Backbone.Collection(this.model.get('days'));
            }
        },

        childViewOptions: function(child, index) {
            return this.getDay(index);
        },

        getDays: function() {
            return this.getOption('days');
        },

        getDay: function(index) {
            var days = this.getDays();

            if(days[index]) {
                return days[index];
            }
        },

        getFirstDate: function() {
            return this.children.first().getDate();
        },

        getLastDate: function() {
            return this.children.last().getDate();
        }

    });

    Toolbox.MonthlyCalendar = Toolbox.View.extend({

        template: Toolbox.Template('calendar-monthly-view'),

        className: 'calendar',

        defaultOptions: {
            collection: false,
            alwaysShowSixWeeks: true,
            fetchOnRender: true,
            bodyView: Toolbox.CollectionView.extend({
                tagName: 'tbody',
                childView: Toolbox.MonthlyCalendarWeek,
                childViewEvents: {
                    'click': function(view, event) {
                        this.triggerMethod('week:click', view, event);
                    },
                    'day:click': function(view, week, event) {
                        this.getOption('calendar').triggerMethod('day:click', view, week, event);
                    }
                }
            }),
            indicatorOptions: {
                indicator: 'small',
                dimmed: true,
                dimmedBgColor: 'rgba(255, 255, 255, .6)'
            }
        },

        triggers: {
            'click .calendar-navigation-prev': 'prev:click',
            'click .calendar-navigation-next': 'next:click'
        },

        regions: {
            body: {
                el: 'tbody',
                replaceElement: true
            }
        },

        childViewOptions: function(child, index) {
            return {
                days: this.getCalendarWeek(index)
            };
        },

        getQueryVariables: function() {
            return {
                start: this.getFirstDate().format('YYYY-MM-DD HH-mm-ss'),
                end: this.getLastDate().format('YYYY-MM-DD HH-mm-ss')
            };
        },

        fetch: function() {
            var self = this, params = this.getQueryVariables();

            if(this.getCacheResponse(params)) {
                this.restoreCacheResponse(params);
            }
            else {
                this.triggerMethod('fetch', params);
                this.collection.reset();
                this.collection.fetch({
                    data: params,
                    success: function(collection, response) {
                        self.setCacheResponse(params, collection);
                        self.triggerMethod('fetch:complete', true, collection, response);
                        self.triggerMethod('fetch:success', collection, response);
                    },
                    error: function(model, response) {
                        self.triggerMethod('fetch:complete', false, collection, response);
                        self.triggerMethod('fetch:error', collection, response);
                    }
                });
            }
        },

        onFetch: function() {
            this.showActivityIndicator();
        },

        onFetchComplete: function() {
            this.hideActivityIndicator();
        },

        createEvent: function(model) {
            var event = {
                start: model.get('start') || null,
                end: model.get('end') || null,
                model: model
            };

            this.triggerMethod('create:event', event);

            return event;
        },

        showBodyView: function() {
            var BodyView = this.getOption('bodyView');
            var bodyView = new BodyView(_.extend({}, {
                calendar: this
            }, this.getOption('bodyViewOptions')));

            this.showChildView('body', bodyView);

            _.each(this.getCalendarWeeks(), function(week, i) {
                bodyView.addChildView(bodyView.buildChildView(new Backbone.Model({
                    days: week
                }), bodyView.childView), i);
            }, this);
        },

        onDayClick: function(day, week, event) {
            this.setDate(day.getDate());
        },

        onRender: function() {
            this.showBodyView();

            this.$el.find('.calendar-header').html(this.getCalendarHeader());
            this.$el.find('.calendar-sub-header').html(this.getCalendarSubHeader());

            if(this.getOption('fetchOnRender')) {
                //this.fetch();
            }
        },

        restoreCacheResponse: function(params) {
            this.collection = this.getCacheResponse(params);
            this.triggerMethod('restore:cache:response');
        },

        setCacheResponse: function(params, collection) {
            var string = JSON.stringify(params);

            if(!collection._cachedResponses) {
                collection._cachedResponses = {};
            }

            collection._cachedResponses[string] = _.clone(collection);

            this.triggerMethod('set:cache:response', collection._cachedResponses[string]);
        },

        getCacheResponse: function(params) {
            var string = JSON.stringify(params);

            if(!this.collection._cachedResponses) {
                this.collection._cachedResponses = {};
            }

            if(this.collection._cachedResponses.hasOwnProperty(string)) {
                return this.collection._cachedResponses[string];
            }

            return null;
        },

        showActivityIndicator: function() {
            this.indicator = new Marionette.Region({
                el: this.$el.find('.indicator')
            });

            var view = new Toolbox.ActivityIndicator(this.getOption('indicatorOptions'));

            this.indicator.show(view);
            this.triggerMethod('indicator:show');
        },

        hideActivityIndicator: function() {
            this.indicator.empty();
            this.triggerMethod('indicator:hide');
        },

        renderCollection: function(collection) {
            this.triggerMethod('before:render:collection', collection);
            collection.each(function(model, i) {
                var event = this.createEvent(model);
                var view = this.getViewByDate(event.start);
                if(view) {
                    view.addEvent(event);
                }
            }, this);
            this.triggerMethod('after:render:collection', collection);
        },

        getViewByDate: function(date) {
            if(!date instanceof moment) {
                date = moment(date);
            }

            var view = null;

            this.getRegion('body').currentView.children.each(function(week, x) {
                week.children.each(function(day, y) {
                    if(day.getDate().isSame(date, 'day')) {
                        if(_.isNull(view)) {
                            view = day;
                        }
                    }
                }, this);
            }, this);

            return view;
        },

        getWeekModel: function() {
            return new Backbone.Model();
        },

        getCalendarHeader: function() {
            return this.getDate().format('MMMM');
        },

        getCalendarSubHeader: function() {
            return this.getDate().year();
        },

        getCalendarWeek: function(index) {
            var weeks = this.getCalendarWeeks();

            if(weeks[index]) {
                return weeks[index];
            }
        },

        getCalendarWeeks: function(date) {
            var date = date || this.getDate();
            var startOfThisMonth = date.clone().startOf('month');
            var endOfThisMonth = date.clone().endOf('month');

            if(this.getOption('alwaysShowSixWeeks') === true) {
                if(startOfThisMonth.day() === 0) {
                    startOfThisMonth.subtract(1, 'week');
                }

                if(endOfThisMonth.day() === 6) {
                    endOfThisMonth.add(1, 'week');
                }
            }

            var endOfThisMonthWeek = endOfThisMonth.clone();

            if(!endOfThisMonth.clone().endOf('week').isSame(startOfThisMonth, 'month')) {
                endOfThisMonthWeek.endOf('week');
            }

            var totalDaysInMonth = date.daysInMonth();
            var totalDaysInCalendar = endOfThisMonthWeek.diff(startOfThisMonth, 'days');
            var totalWeeksInCalendar = Math.ceil(totalDaysInCalendar / 7);

            if(this.getOption('alwaysShowSixWeeks') === true) {
                if(totalWeeksInCalendar < 6) {
                    endOfThisMonthWeek.add(6 - totalWeeksInCalendar, 'week');
                    totalWeeksInCalendar += 6 - totalWeeksInCalendar;
                }
            }

            var weeks = [];

            for(var x = 0; x < totalWeeksInCalendar; x++) {
                var days = [];

                for(var y = 0; y < 7; y++) {
                    var start = startOfThisMonth
                        .clone()
                        .add(x, 'week')
                        .startOf('week')
                        .add(y, 'day');

                    days.push({
                        date: start,
                        day: start.date(),
                        month: start.month(),
                        year: start.year(),
                        currentDate: date
                    });
                }

                weeks.push(days);
            }

            return weeks;
        },

        getWeeksInMonth: function() {
            return Math.ceil(this.getDate().daysInMonth() / 7);
        },

        getFirstDate: function() {
            return this.children.first().getFirstDate();
        },

        getLastDate: function() {
            return this.children.last().getLastDate();
        },

        getDate: function() {
            return this.getOption('date') || moment();
        },

        setDate: function(date) {
            if(!date instanceof moment) {
                date = moment(date);
            }

            var prevDate = this.getDate();

            this.options.date = date;
            this.triggerMethod('date:set', date, prevDate);
        },

        onDateSet: function(newDate, prevDate) {
            if(!newDate.isSame(prevDate, 'month')) {
                this.render();
            }
            else {
                this.getViewByDate(prevDate).$el.removeClass('calendar-current-day');
                this.getViewByDate(newDate).$el.addClass('calendar-current-day');
            }

            var view = this.getViewByDate(newDate);
            var events = view.model.get('events');

            this.triggerMethod('show:events', view, events);
        },

        getPrevDate: function() {
            return this.getDate().clone().subtract(1, 'month');
        },

        getNextDate: function() {
            return this.getDate().clone().add(1, 'month');
        },

        prev: function() {
            this.setDate(this.getPrevDate());
        },

        next: function() {
            this.setDate(this.getNextDate());
        },

        onPrevClick: function() {
            this.prev();
        },

        onNextClick: function() {
            this.next();
        },

        showCollection: function() {
            _.each(this.getCalendarWeeks(), function(week, i) {
                this.addChildView(this.buildChildView(this.getWeekModel(), this.childView), i);
            }, this);
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        return factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

  function forEach( array, fn ) { var i, length
    i = -1
    length = array.length
    while ( ++i < length )
      fn( array[ i ], i, array )
  }

  function map( array, fn ) { var result
    result = Array( array.length )
    forEach( array, function ( val, i, array ) {
      result[i] = fn( val, i, array )
    })
    return result
  }

  function reduce( array, fn, accumulator ) {
    forEach( array, function( val, i, array ) {
      accumulator = fn( val, i, array )
    })
    return accumulator
  }

  // Levenshtein distance
  function Levenshtein( str_m, str_n ) { var previous, current, matrix
    // Constructor
    matrix = this._matrix = []

    // Sanity checks
    if ( str_m == str_n )
      return this.distance = 0
    else if ( str_m == '' )
      return this.distance = str_n.length
    else if ( str_n == '' )
      return this.distance = str_m.length
    else {
      // Danger Will Robinson
      previous = [ 0 ]
      forEach( str_m, function( v, i ) { i++, previous[ i ] = i } )

      matrix[0] = previous
      forEach( str_n, function( n_val, n_idx ) {
        current = [ ++n_idx ]
        forEach( str_m, function( m_val, m_idx ) {
          m_idx++
          if ( str_m.charAt( m_idx - 1 ) == str_n.charAt( n_idx - 1 ) )
            current[ m_idx ] = previous[ m_idx - 1 ]
          else
            current[ m_idx ] = Math.min
              ( previous[ m_idx ]     + 1   // Deletion
              , current[  m_idx - 1 ] + 1   // Insertion
              , previous[ m_idx - 1 ] + 1   // Subtraction
              )
        })
        previous = current
        matrix[ matrix.length ] = previous
      })

      return this.distance = current[ current.length - 1 ]
    }
  }

  Levenshtein.prototype.toString = Levenshtein.prototype.inspect = function inspect ( no_print ) {
      var matrix, max, buff, sep, rows, matrix = this.getMatrix();

      max = reduce( matrix,function( m, o ) {
          return Math.max( m, reduce( o, Math.max, 0 ) )
      }, 0 );

      buff = Array(( max + '' ).length).join(' ');

      sep = [];

      while ( sep.length < (matrix[0] && matrix[0].length || 0) ) {
          sep[ sep.length ] = Array( buff.length + 1 ).join( '-' );
      }

      sep = sep.join( '-+' ) + '-';

      rows = map( matrix, function(row) {
          var cells;

          cells = map(row, function(cell) {
              return (buff + cell).slice( - buff.length )
          });

          return cells.join( ' |' ) + ' ';
      });

      return rows.join( "\n" + sep + "\n" );
  }

  Levenshtein.prototype.getMatrix = function () {
      return this._matrix.slice()
  }

  Levenshtein.prototype.valueOf = function() {
      return this.distance
  }

  Toolbox.Levenshtein = Levenshtein;

  return Toolbox;

}));

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
}(this, function (Toolbox, _) {

    'use strict';

    Toolbox.InlineEditor = Toolbox.View.extend({

        template: Toolbox.Template('inline-editor'),

        className: 'inline-editor-wrapper',

        defaultOptions: {
            // (string) The attribute in the model to edit
            attribute: false,

            // (object) The form input view object
            formInputView: false,

            // (object) The form input view object options
            formInputViewOptions: false,

            // (srting) The class name to add to the field while it is being editted.
            edittingClassName: 'inline-editor-editting',

            // (bool) Allow the field to have a null value
            allowNull: false,

            // (int) The keycode to save the field data
            saveKeycode: 13,

            // (int) The keycode to cancel the field data
            cancelKeycode: 27,
        },

        regions: {
            input: '.inline-editor-field',
            indicator: '.inline-editor-activity-indicator'
        },

        triggers: {
            'click .inline-editor-label': 'label:click'
        },

        createFormInputView: function() {
            var t = this, View = this.getOption('formInputView');

            if(!View) {
                View = Toolbox.InputField;
            }

            var options = _.extend({
                value: this.model.get(this.getOption('attribute')),
                model: this.model
            }, this.getOption('formInputViewOptions'));

            var view = new View(options);

            view.on('blur', function() {
                t.blur();
            });

            view.$el.on('keypress', function(e) {
                if(e.keyCode === t.getOption('saveKeycode')) {
                    if(t.getOption('allowNull') || !t.getOption('allowNull') && !t.isNull()) {
                        t.blur();
                    }

                    e.preventDefault();
                }
            });

            view.$el.on('keyup', function(e) {
                if (e.keyCode === t.getOption('cancelKeycode')) {
                    t.cancel();
                    e.preventDefault();
                };
            });

            return view;
        },

        showActivityIndicator: function() {
            var view = new Toolbox.ActivityIndicator({
                indicator: 'tiny'
            });

            this.showChildView('indicator', view);
        },

        hideActivityIndicator: function() {
            this.indicator.empty();
        },

        isNull: function() {
            return this.getInputValue() === '' ? true : false;
        },

        setLabelHtml: function(html) {
            this.$el.find('.inline-editor-label').html(html);
        },

        hasChanged: function() {
            return this.getModelValue() !== this.getInputValue();
        },

        cancel: function() {
            this.blur();
            this.triggerMethod('cancel');
        },

        blur: function() {
            if(this.hasChanged()) {
                this.save();
            }
            else {
                this.$el.removeClass(this.getOption('edittingClassName'));
            }

            this.triggerMethod('blur');
        },

        focus: function() {
            this.$el.addClass(this.getOption('edittingClassName'));
            this.getChildView('input').focus();
            this.triggerMethod('focus');
        },

        getModelValue: function() {
            return this.model.get(this.getOption('attribute'));
        },

        getInputValue: function() {
            return this.getChildView('input').getInputValue();
        },

        getFormData: function() {
            var data = {};
            var name = this.getOption('attribute');

            data[name] = this.getInputValue();

            return data;
        },

        onChange: function(value) {
            this.setLabelHtml(value);
        },

        onBeforeSave: function() {
            this.showActivityIndicator();
        },

        onAfterSave: function() {
            this.hideActivityIndicator();

            if(this.getOption('allowNull') || !this.getOption('allowNull') && !this.isNull()) {
                this.blur();
            }
        },

        save: function() {
            var t = this;

            if(this.model) {
                this.triggerMethod('before:save');

                this.model.save(this.getFormData(), {
                    success: function(model, response) {
                        t.triggerMethod('save:success', model, response);
                        t.triggerMethod('after:save', model, response);
                        t.triggerMethod('change', t.getInputValue());
                    },
                    error: function(model, response) {
                        t.triggerMethod('save:error', model, response);
                        t.triggerMethod('after:save', model, response);
                    }
                });
            }
            else {
                this.trigger('change', this.getInputValue());
            }
        },

        onLabelClick: function() {
            this.focus();
        },

        onRender: function() {
            this.setLabelHtml(this.getModelValue());
            this.showChildView('input', this.createFormInputView());
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.InputField = Toolbox.BaseField.extend({

        template: Toolbox.Template('form-input-field'),

        options: {
            type: 'text'
        }

    });

    return Toolbox;

}));

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
}(this, function (Toolbox, _) {

    'use strict';

    Toolbox.LightSwitchField = Toolbox.BaseField.extend({

        template: Toolbox.Template('form-light-switch-field'),

        options: {
            value: 0,

            activeClassName: 'on',

            onValue: 1,

            offValue: 0,

            triggerSelector: '.light-switch',

            inputClassName: 'light-switch'
        },

        triggers: {
            'click .light-switch-container': 'click'
        },

        events: {
            'keyup': function(e) {
                switch(e.keyCode) {
                    case 32:
                        this.toggle();
                        break;
                    case 37:
                        this.setValue(this.getOption('offValue'));
                        break;
                    case 39:
                        this.setValue(this.getOption('onValue'));
                        break;
                }
            }
        },

        initialize: function() {
            Toolbox.BaseField.prototype.initialize.apply(this, arguments);

            if(this.options.value === false || _.isNaN(this.options.value)) {
                this.options.value = 0;
            }
        },

        isActive: function() {
            return parseInt(this.getOption('value')) === 1;
        },

        setValue: function(value) {
            this.options.value = value;
            this.getInputField().val(value);

            if(this.isActive()) {
                this.setActiveClass();
            }
            else {
                this.removeActiveClass();
            }

            this.triggerMethod('change', value);
        },

        getLightSwitch: function() {
            return this.$el.find('.light-switch');
        },

        getInputField: function() {
            return this.$el.find('input');
        },

        setActiveClass: function() {
            var t = this;

            this.getLightSwitch().addClass(this.getOption('draggingClassName'));

            this.$el.find('.light-switch-container').animate({
                'margin-left': 0
            }, 100, function() {
                t.getLightSwitch()
                    .addClass(t.getOption('activeClassName'))
                    .removeClass(t.getOption('draggingClassName'));
            });
        },

        removeActiveClass: function() {
            var t = this;

            this.getLightSwitch().addClass(this.getOption('draggingClassName'));

            this.$el.find('.light-switch-container').animate({
                'margin-left': -11
            }, 100, function() {
                t.getLightSwitch()
                    .removeClass(t.getOption('activeClassName'))
                    .removeClass(t.getOption('draggingClassName'));
            });
        },

        toggle: function() {
            if(!this.isActive()) {
                this.setValue(this.getOption('onValue'));
            }
            else {
                this.setValue(this.getOption('offValue'));
            }
        },

        onClick: function() {
            this.toggle();
        },

        onChange: function() {
            this.save();
        },

        onFocus: function() {
            this
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], function(_, Backbone) {
            return factory(root.Toolbox, _, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('underscore'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone);
    }
}(this, function (Toolbox, _, Backbone) {

    'use strict';

	Toolbox.NoListGroupItem = Toolbox.View.extend({

		template: Toolbox.Template('no-list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateContext: function() {
			return this.options;
		}

	});

	Toolbox.ListGroupItem = Toolbox.View.extend({

		template: Toolbox.Template('list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

        defaultOptions: {
            badgeAttribute: false,
            contentAttribute: false,
            editFormClass: false,
            deleteFormClass: false,
            editButton: {
                className: 'btn btn-warning btn-xs',
                label: 'Edit',
                icon: 'fa fa-edit',
            },
            deleteButton: {
                className: 'btn btn-danger btn-xs',
                label: 'Delete',
                icon: 'fa fa-trash-o',
            }
        },

		events: {
			'click': function(e) {
                if(e.target == this.$el.get(0)) {
    				this.triggerMethod('click', this, e);
                }
			},
            'click .edit-item': function(e) {
                this.triggerMethod('click:edit', this, e);
            },
            'click .delete-item': function(e) {
                this.triggerMethod('click:delete', this, e);
            }
		},

        getBadge: function() {
            return this.getOption('badgeAttribute') ?
                this.model.get(this.getOption('badgeAttribute')) :
                false;
        },

        getContent: function() {
            return this.getOption('contentAttribute') ?
                this.model.get(this.getOption('contentAttribute')) :
                false;
        },

		templateContext: function() {
            var badge, content, helper = _.extend({
                hasEditForm: this.getOption('editFormClass') ? true : false,
                hasDeleteForm: this.getOption('deleteFormClass') ? true : false
            }, this.options);

            if(badge = this.getBadge()) {
                helper.badge = badge;
            }

            if(content = this.getContent()) {
                helper.content = content;
            }

            return helper;
		},

        onClickEdit: function(e) {
            var View = this.getOption('editFormClass');

            if(View) {
                var view = new View({
                    model: this.model
                });

                view.on('submit:success', function() {
                    modal.hide();
                }, this);

                var modal = new Toolbox.Modal({
                    contentView: view
                });

                modal.show();

                this.triggerMethod('show:edit', modal);
            }

            e.preventDefault();
        },

        onClickDelete: function(e) {
            var View = this.getOption('deleteFormClass');

            if(View) {
                var view = new View({
                    model: this.model
                });

                view.on('submit:success', function() {
                    modal.hide();
                });

                var modal = new Toolbox.Modal({
                    contentView: view
                });

                modal.show();

                this.triggerMethod('show:delete', modal);
            }

            e.preventDefault();
        }

	});

	Toolbox.ListGroup = Toolbox.CollectionView.extend({

		childView: Toolbox.ListGroupItem,

		className: 'list-group',

		tagName: 'ul',

		defaultOptions: {
			// (bool) Activate list item on click
			activateOnClick: false,

			// (bool) Activate only a single item in the list item at once
			activateSingleItem: false,

			// (string) Active class name
			activeClassName: 'active',

			// (string) The message to display if there are no list items
			emptyMessage: 'There are no items in the list.',

			// (object) The view object to use for the empty message
			emptyMessageView: Toolbox.NoListGroupItem,

			// (bool) Show the empty message view
			showEmptyMessage: true,
		},

		childViewEvents: {
			'click': function(child, e) {
                if(this.getOption('activateOnClick')) {
                    if(child.$el.hasClass(this.getOption('activeClassName'))) {
                        child.$el.removeClass(this.getOption('activeClassName'));
                    }
                    else {
                        if(this.getOption('activateSingleItem')) {
                            this.$el.find('.'+this.getOption('activeClassName'))
                                .removeClass(this.getOption('activeClassName'));
                        }

                        child.$el.addClass(this.getOption('activeClassName'));

                        this.triggerMethod('activate', e);
                    }
                }

				this.triggerMethod('item:click', child, e);
			}
		},

        emptyView: function() {
        	if(this.getOption('showEmptyMessage')) {
	            var View = this.getOption('emptyMessageView');

	            View = View.extend({
	                options: {
	                    message: this.getOption('emptyMessage')
	                }
	            });

	            return View;
	        }

	        return;
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore'], function($, _) {
            return factory(root.Toolbox, $, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('underscore'))
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._);
    }
}(this, function (Toolbox, $, _) {

    'use strict';

    Toolbox.Modal = Toolbox.View.extend({

        template: Toolbox.Template('modal-window'),

        className: 'modal-window-wrapper',

        regions: {
            content: '.modal-content'
        },

        triggers: {
            'click .modal-close': 'close:click'
        },

        defaultOptions: {
            // (array) An array of button objects to add to the modal window
            buttons: [],

            // (string) The modal window header text
            header: false,

            // (int) The number of milliseconds used for the modal animation
            closeAnimationRate: 500
        },

        events: {
            'click .modal-buttons a': function(e) {
                var buttons = this.getOption('buttons');
                var i = $(e.target).index();

                if(_.isArray(buttons) && buttons[i].onClick) {
                    buttons[i].onClick.call(this, $(e.target));
                    e.preventDefault();
                }
            }
        },

        templateContext: function() {
            return this.options;
        },

        showContentView: function(view) {
            this.setContentView(view);
        },

        setContentView: function(view) {
            this.showChildView('content', view);
        },

        getContentView: function() {
            return this.getRegion('content').currentView;
        },

        show: function() {
            var self = this, view = this.getOption('contentView');

            this.render();

            view.on('before:detach', function() {
                $('body').off('keyup', keyupHandler);
            });

            view.on('cancel:click', function() {
                this.hide();
            }, this);

            var keyupHandler = function(e) {
                if(e.keyCode == 27) {
                    self.hide();
                }
            }

            $('body').append(this.$el).on('keyup', keyupHandler);

            this.showChildView('content', view);

            setTimeout(function() {
                self.$el.addClass('show');
            });
        },

        hide: function() {
            var self = this;

            this.$el.removeClass('show');

            setTimeout(function() {
                self.getRegion('content').empty();
                self.$el.remove();
            }, this.getOption('closeAnimationRate'));
        },

        onCloseClick: function() {
            this.hide();
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function($) {
            return factory(root.Toolbox, $);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$);
    }
}(this, function (Toolbox, $) {

	'use strict';

	Toolbox.Notification = Toolbox.View.extend({

		className: 'notification clearfix',

		defaultOptions: {
			// (int) The fly-out animation rate in milliseconds
			animation: 500,

			// (string) The close class name
			closeClassName: 'close',

			// (int) Close after a delay in milleconds. Pass false to not close
			closeOnDelay: 4000,

			// (bool) Close the notification when clicked anywhere
			closeOnClick: true,

			// (bool) The icon class used in the alert
			icon: false,

			// (string|false) The notification message
			message: false,

			// (string|false) The notification title
			title: false,

			// (string) Type of notification (alert|warning|success)
			type: 'alert',

			// (string) The class name that makes the notification visible
			visibleClassName: 'visible',

			// (string) The class name that is used in the wrapper to which
			// notification are appended
			wrapperClassName: 'notifications'
		},

		template: Toolbox.Template('notification'),

		model: false,

		triggers: {
			'click': 'click',
			'click .close': 'close:click'
		},

       templateContext: function() {
            return this.options;
        },

		onClick: function() {
			if(this.getOption('closeOnClick')) {
				this.hide();
			}
		},

		onCloseClick: function() {
			this.hide();
		},

		isVisible: function() {
			return this.$el.hasClass(this.getOption('visibleClassName'));
		},

		hide: function() {
			var t = this;

			this.$el.removeClass(this.getOption('visibleClassName'));

			setTimeout(function() {
				t.$el.remove();
			}, this.getOption('animation'));

			this.triggerMethod('hide');
		},

		createNotificationsDomWrapper: function() {
			var $wrapper = $('<div class="'+this.getOption('wrapperClassName')+'" />');

			$('body').append($wrapper);

			return $wrapper;
		},

		show: function() {
			var t = this, $wrapper = $('body').find('.' + this.getOption('wrapperClassName'));

			this.render();

			if(!$wrapper.length) {
				$wrapper = this.createNotificationsDomWrapper();
			}

			$wrapper.append(this.$el);

			this.$el.addClass(this.getOption('type'));

			setTimeout(function() {
				t.$el.addClass(t.getOption('visibleClassName'));
			});

			if(this.getOption('closeOnDelay') !== false) {
				setTimeout(function() {
					if(t.isVisible()) {
						t.hide();
					}
				}, this.getOption('closeOnDelay'));
			}

			this.triggerMethod('show');
		}

	});

	return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.NoOrderedListItem = Toolbox.View.extend({

		template: Toolbox.Template('no-ordered-list-item'),

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateContext: function() {
			return this.options;
		}

	});

	Toolbox.OrderedListItem = Toolbox.View.extend({

		template: Toolbox.Template('ordered-list-item'),

		className: 'ordered-list-item',

		tagName: 'li',

		events: {
			'click': function(e, obj) {
				this.triggerMethod('click', obj);
			}
		},

		templateContext: function() {
			return this.options
		}

	});

	Toolbox.OrderedList = Toolbox.CollectionView.extend({

		childView: Toolbox.OrderedListItem,

    	emptyView: Toolbox.NoUnorderedListItem,

		className: 'ordered-list',

		tagName: 'ol',

		defaultOptions: {
			// (object) The view object to use for the empty message
			emptyMessageView: Toolbox.NoOrderedListItem,

			// (string) The message to display if there are no list items
			emptyMessage: 'There are no items in the list.',

			// (bool) Show the empty message view
			showEmptyMessage: true
		},

		childViewEvents: {
			'click': function(view) {
				this.triggerMethod('item:click', view);
			}
		},

        getEmptyView: function() {
        	if(this.getOption('showEmptyMessage')) {
	            var View = this.getOption('emptyMessageView');

	            View = View.extend({
	                options: {
	                    message: this.getOption('emptyMessage')
	                }
	            });

	            return View;
	        }

	        return;
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.Pager = Toolbox.View.extend({

		template: Toolbox.Template('pager'),

		tagName: 'nav',

		triggers: {
			'click .next-page': 'next:page:click',
			'click .prev-page': 'prev:page:click'
		},

		defaultOptions: {
			// (string) The pager class name
			pagerClassName: 'pager',

			// (string) The active class name
			activeClassName: 'active',

			// (string) The disabled class name
			disabledClassName: 'disabled',

			// (string) The previous button class name
			prevClassName: 'previous',

			// (string) The next button class name
			nextClassName: 'next',

			// (bool) Include the page totals between the pager buttons
			includePageTotals: true,

			// (bool) Align pager buttson to left and right edge
			snapToEdges: true,

			// (int) The current page number
			page: 1,

			// (int) The total number of pages
			totalPages: 1,

			// (string) Next button label
			nextLabel: 'Next',

			// (string) Previous button label
			prevLabel: 'Previous'
		},

       templateContext: function() {
            return this.options;
        },

		nextPage: function() {
			var page = this.getOption('page');
			var total = this.getOption('totalPages');

			if(page < total) {
				page++;
			}

			this.setActivePage(page);
		},

		onNextPageClick: function() {
			this.nextPage();
		},

		prevPage: function() {
			var page = this.getOption('page');

			if(page > 1) {
				page--;
			}

			this.setActivePage(page);
		},

		onDomRefresh: function() {
			this.$el.find('.prev-page').parent().removeClass(this.getOption('disabledClassName'));
			this.$el.find('.next-page').parent().removeClass(this.getOption('disabledClassName'));

			if(this.getOption('page') == 1) {
				this.$el.find('.prev-page').parent().addClass(this.getOption('disabledClassName'));
			}

			if(this.getOption('page') == this.getOption('totalPages')) {
				this.$el.find('.next-page').parent().addClass(this.getOption('disabledClassName'));
			}
		},

		onPrevPageClick: function() {
			this.prevPage();
		},

		setActivePage: function(page) {
			this.options.page = page;
			this.render();
			this.triggerMethod('paginate', page);
		},

		getActivePage: function() {
			return this.getOption('page');
		}

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'backbone'], function($, Backbone) {
            return factory(root.Toolbox, root.$, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('backbone'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root.Backbone);
    }
}(this, function (Toolbox, $, Backbone) {

    'use strict';

    Toolbox.PaginationItem = Toolbox.View.extend({

        tagName: 'li',

        template: Toolbox.Template('pagination-item'),

        defaultOptions: {
            // (string) The active page class name
            disabledClassName: 'disabled'
        },

        triggers: {
            'click a:not(.next-page, .prev-page)': 'click',
            'click .next-page': 'page:next',
            'click .prev-page': 'page:prev'
        },

        onDomRefresh: function() {
            if(this.model.get('divider') === true) {
                this.$el.addClass(this.getOption('disabledClassName'));
            }
        },

        attributes: function() {
            if(this.model.get('page')) {
                return {
                    'data-page': this.model.get('page')
                }
            }
        }

    });

    Toolbox.PaginationList = Toolbox.CollectionView.extend({

        tagName: 'ul',

        childView: Toolbox.PaginationItem,

        className: 'pagination',

        childViewEvents: {
            'click': function(view) {
                this.triggerMethod('paginate', view);
            },
            'page:next': function(view) {
                this.triggerMethod('page:next', view);
            },
            'page:prev': function(view) {
                this.triggerMethod('page:prev', view);
            }
        }

    });

    Toolbox.Pagination = Toolbox.View.extend({

        template: Toolbox.Template('pagination'),

		tagName: 'nav',

		regions: {
            list: {
                el: 'ul',
                replaceElement: true
            }
        },

        defaultOptions: {
            paginationClassName: 'pagination',
            activeClassName: 'active',
            disabledClassName: 'disabled',
            totalPages: 1,
            showPages: 6,
            page: 1
        },

		childViewEvents: {
			'page:next': function() {
				this.nextPage();
			},
			'page:prev': function() {
				this.prevPage();
			},
			'paginate': function(view) {
                this.setActivePage(view.model.get('page'));
			}
		},

       templateContext: function() {
            return this.options;
        },

		initialize: function() {
			Toolbox.View.prototype.initialize.apply(this, arguments);

            if(!this.collection) {
                this.collection = new Backbone.Collection();
            }
		},

		onBeforeRender: function() {
			this.collection.reset();
            this.collection.add({
                label: '&laquo;',
                class: 'prev-page'
            });

			var currentPage = this.getOption('page');
			var totalPages = this.getOption('totalPages');
			var showPages = this.getOption('showPages');

			if(showPages % 2) {
				showPages++; // must be an even number
			}

			var startPage = (currentPage < showPages) ? 1 : currentPage - (showPages / 2);

			var endPage = showPages + startPage;

			endPage = (totalPages < endPage) ? totalPages : endPage;

			var diff = startPage - endPage + showPages;

			startPage -= (startPage - diff > 0) ? diff : 0;

			if (startPage > 1) {
				this.collection.add({page: 1});

				if(startPage > 2) {
					this.collection.add({divider: true});
				}
			}

			for(var i = startPage; i <= endPage; i++) {
				this.collection.add({page: i});
			}

			if (endPage < totalPages) {
				if(totalPages - 1 > endPage) {
					this.collection.add({divider: true});
				}
				this.collection.add({page: totalPages});
			}

            this.collection.add({
                label: '&raquo;',
                class: 'next-page'
            });
		},

        onDomRefresh: function() {
			this.$el.find('.'+this.getOption('activeClassName')).removeClass(this.getOption('activeClassName'));
            this.$el.find('[data-page="'+this.getOption('page')+'"]').addClass(this.getOption('activeClassName'));
			this.$el.find('.prev-page').parent().removeClass(this.getOption('disabledClassName'));
			this.$el.find('.next-page').parent().removeClass(this.getOption('disabledClassName'));

			if(this.getOption('page') == 1) {
				this.$el.find('.prev-page').parent().addClass(this.getOption('disabledClassName'));
			}

			if(this.getOption('page') == this.getTotalPages()) {
				this.$el.find('.next-page').parent().addClass(this.getOption('disabledClassName'));
			}
		},

        onRender: function() {
            this.showChildView('list', new Toolbox.PaginationList({
                collection: this.collection
            }));
        },

        getTotalPages: function() {
            return this.getOption('totalPages');
        },

        nextPage: function() {
			var page = this.getOption('page');
			var total = this.getTotalPages();

			if(page < total) {
				page++;
			}

			this.setActivePage(page);
		},

		onNextPageClick: function() {
			this.nextPage();
		},

		prevPage: function() {
			var page = this.getOption('page');

			if(page > 1) {
				page--;
			}

			this.setActivePage(page);
		},

		onPrevPageClick: function() {
			this.prevPage();
		},

        setShowPages: function(showPages) {
			this.options.showPages = showPages;
		},

		getShowPages: function() {
			return this.getOption('showPages');
		},

		setTotalPages: function(totalPages) {
			this.options.totalPages = totalPages;
		},

		getTotalPages: function() {
			return this.getOption('totalPages');
		},

		setPage: function(page) {
			this.options.page = page;
		},

		getPage: function() {
			return this.getOption('page');
		},

		setPaginationLinks: function(page, totalPages) {
			this.setPage(page);
			this.setTotalPages(totalPages);
			this.render();
		},

		setActivePage: function(page) {
			if(this.options.page != page) {
				this.options.page = page;
				this.render();

				var query = this.collection.where({page: page});

				if(query.length) {
                    var child = this.getRegion('list').currentView.children.findByModel(query[0]);

					this.triggerMethod('paginate', page, child);
				}
			}
		},

		getActivePage: function() {
			return this.getOption('page');
		}

    });

    /*
    */

    /*
    */

    /*
	Toolbox.Pagination = Toolbox.View.extend({

		template: Toolbox.Template('pagination'),

		tagName: 'nav',

		regions: {
            list: {
                el: 'ul',
                replaceElement: true
            }
        },

        defaultOptions: {
            paginationClassName: 'pagination',
            activeClassName: 'active',
            disabledClassName: 'disabled',
            totalPages: 1,
            showPages: 6,
            page: 1
        },

		childViewEvents: {
			'page:next': function() {
				this.nextPage();
			},
			'page:prev': function() {
				this.prevPage();
			},
			'click': function(view) {
				if(!view.$el.hasClass(this.getOption('disabledClassName'))) {
					this.setActivePage(view.model.get('page'));
				}
			}
		},

		triggers: {
			'click .next-page': 'next:page:click',
			'click .prev-page': 'prev:page:click'
		},

       templateContext: function() {
            return this.options;
        },

		initialize: function() {
			Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

            if(!this.collection) {
                this.collection = new Backbone.Collection();
            }
		},

		onBeforeRender: function() {
			this.collection.reset();

			var currentPage = this.getOption('page');
			var totalPages = this.getTotalPages();
			var showPages = this.getOption('showPages');

			if(showPages % 2) {
				showPages++; // must be an even number
			}

			var startPage = (currentPage < showPages) ? 1 : currentPage - (showPages / 2);

			var endPage = showPages + startPage;

			endPage = (totalPages < endPage) ? totalPages : endPage;

			var diff = startPage - endPage + showPages;

			startPage -= (startPage - diff > 0) ? diff : 0;

			if (startPage > 1) {
				this.collection.add({page: 1});

				if(startPage > 2) {
					this.collection.add({divider: true});
				}
			}

			for(var i = startPage; i <= endPage; i++) {
				this.collection.add({page: i});
			}

			if (endPage < totalPages) {
				if(totalPages - 1 > endPage) {
					this.collection.add({divider: true});
				}
				this.collection.add({page: totalPages});
			}
		},

		nextPage: function() {
			var page = this.getOption('page');
			var total = this.getTotalPages();

			if(page < total) {
				page++;
			}

			this.setActivePage(page);
		},

		onNextPageClick: function() {
			this.nextPage();
		},

		prevPage: function() {
			var page = this.getOption('page');

			if(page > 1) {
				page--;
			}

			this.setActivePage(page);
		},

		onPrevPageClick: function() {
			this.prevPage();
		},

		onDomRefresh: function() {
			this.$el.find('.'+this.getOption('activeClassName')).removeClass(this.getOption('activeClassName'));
			this.$el.find('[data-page="'+this.getOption('page')+'"]').parent().addClass(this.getOption('activeClassName'));

			this.$el.find('.prev-page').parent().removeClass(this.getOption('disabledClassName'));
			this.$el.find('.next-page').parent().removeClass(this.getOption('disabledClassName'));

			if(this.getOption('page') == 1) {
				this.$el.find('.prev-page').parent().addClass(this.getOption('disabledClassName'));
			}

			if(this.getOption('page') == this.getTotalPages()) {
				this.$el.find('.next-page').parent().addClass(this.getOption('disabledClassName'));
			}

            this.showChildView('list', new Toolbox.PaginationList({
                collection: this.collection
            }));
		},

		setShowPages: function(showPages) {
			this.options.showPages = showPages;
		},

		getShowPages: function() {
			return this.getOption('showPages');
		},

		setTotalPages: function(totalPages) {
			this.options.totalPages = totalPages;
		},

		getTotalPages: function() {
			return this.getOption('totalPages');
		},

		setPage: function(page) {
			this.options.page = page;
		},

		getPage: function() {
			return this.getOption('page');
		},

		setPaginationLinks: function(page, totalPages) {
			this.setPage(page);
			this.setTotalPages(totalPages);
			this.render();
		},

		setActivePage: function(page) {
			if(this.options.page != page) {
				this.options.page = page;
				this.render();

				var query = this.collection.where({page: page});

				if(query.length) {
					this.triggerMethod('paginate', page, this.children.findByModel(query[0]));
				}
			}
		},

		getActivePage: function() {
			return this.getOption('page');
		}

	});
    */

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.ProgressBar = Toolbox.View.extend({

		template: Toolbox.Template('progress-bar'),

		className: 'progress',

		defaultOptions: {
			// (string) The progress bar class name
			progressBarClassName: 'progress-bar',

			// (int) The progress percentage
			progress: 0
		},

       templateContext: function() {
            return this.options;
        },

		setProgress: function(progress) {
			if(progress < 0) {
				progress = 0;
			}

			if(progress > 100) {
				progress = 100;
			}

			this.options.progress = progress;
			this.triggerMethod('progress', progress);

			if(progress === 100) {
				this.triggerMethod('complete');
			}
		},

		getProgress: function() {
			return this.getOption('progress');
		},

		onProgress: function() {
			this.render();
		}

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.RadioField = Toolbox.BaseField.extend({

        template: Toolbox.Template('form-radio-field'),

        options: {
            options: false,
            type: 'radio',
            inputClassName: 'radio',
            checkboxClassName: 'radio'
        },

        getInputValue: function() {
            return this.$el.find(':checked').val();
        },

        setInputValue: function(value) {
            return this.$el.find('[value="'+value+'"]').attr('checked', true);
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.SelectField = Toolbox.BaseField.extend({

        template: Toolbox.Template('form-select-field'),

        options: {
            triggerSelector: 'select',
            multiple: false,
            options: []
        },

        triggers: {
            'change .form-control': 'change'
        },

        onChange: function() {
            this.save();
        },

        getInputField: function() {
            return this.$el.find('select');
        },

        getInputValue: function() {
            return this.getInputField().val();
        },

        onDomRefresh: function() {
            if(this.getOption('value')) {
                this.getInputField().val(this.getOption('value'));
            }
            else {
                this.getInputField().val(this.getInputField().find('option:first').val());
            }
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['nouislider'], function(noUiSlider) {
            return factory(root.Toolbox, noUiSlider);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('nouislider'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.noUiSlider);
    }
}(this, function (Toolbox, noUiSlider) {

    'use strict';

    Toolbox.RangeSlider = Toolbox.View.extend({

        template: Toolbox.Template('range-slider'),

        defaultOptions: {
            // (bool) Should the slider be animate
            animate: true,

            // (string) Click effects for manipulating the slider.
            // Possible values: "drag", "tap", "fixed", "snap" or "none"
            behavior: 'tap',

            // (mixed) Should the handles be connected.
            // Possible values: true, false, "upper", or "lower"
            connect: false,

            // (string) The direction of the slider. "ltr" or "rtl"
            direction: 'ltr',

            // (int) The maximum distance the handles can be from each other
            // false disables this option.
            limit: false,

            // (int) The minimum distance the handles can be from each other
            // false disabled this option
            margin: false,

            // (string) The orientation of the slider. "horizontal" or "vertical"
            orientation: 'horizontal',

            // (array) starting possition of the slider handles
            start: [0],

            // (int) The step integer
            step: 0,

            // (object) the range object defined the min/max values
            range: {
                min: [0],
                max: [100]
            }
        },

        onDomRefresh: function() {
            var t = this, options = {
                animate: this.getOption('animate'),
                behavior: this.getOption('behavior'),
                connect: this.getOption('connect'),
                direction: this.getOption('direction'),
                orientation: this.getOption('orientation'),
                range: this.getOption('range'),
                start: this.getOption('start'),
                step: this.getOption('step')
            };

            if(this.getOption('margin') !== false) {
                options.margin = this.getOption('margin');
            }

            if(this.getOption('limit') !== false) {
                options.limit = this.getOption('limit');
            }

            var slider = this.$el.find('.slider').get(0);

            slider = noUiSlider.create(slider, options);

            slider.on('slide', function() {
                t.triggerMethod('slide', t.getValue());
            });

            slider.on('set', function() {
                t.triggerMethod('set', t.getValue());
            });

            slider.on('change', function() {
                t.triggerMethod('change', t.getValue());
            });
        },

        getSliderElement: function() {
            return this.$el.find('.slider');
        },

        getValue: function() {
            return this.getSliderElement().val();
        },

        setValue: function(value) {
            this.getSliderElement().val(value);
        },

        disable: function() {
            this.getSliderElement().attr('disabled', true);
        },

        enable: function() {
            this.getSliderElement().attr('disabled', false);
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'backbone.marionette', 'underscore'], function(Backbone, Marionette, _) {
            return factory(root.Toolbox, Backbone, Marionette, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('backbone'), require('backbone.marionette'), require('underscore'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.Backbone, root.Marionette, root._);
    }
}(this, function (Toolbox, Backbone, Marionette, _) {

    'use strict';

    Toolbox.Storage = Marionette.Object.extend({

        defaultOptions: {
            table: false,
            storageEngine: localStorage,
            dataClass: false,
            data: false
        },

        initialize: function(options) {
            Marionette.Object.prototype.initialize.call(this, options);

            this.options = Toolbox.Options(this.defaultOptions, this.options, this);

            if(!this.tableName()) {
                throw new Error('A \'table\' option must be set with a valid table name.');
            }

            this.createTable();

            if(this.getOption('data')) {
                this.getOption('data').on('change', function() {
                    this.save();
                }, this);
            }
        },

        engine: function() {
            return this.getOption('storageEngine');
        },

        tableName: function() {
            return this.getOption('table')
        },

        doesTableExist: function() {
            return !_.isNull(this.engine().getItem(this.tableName()));
        },

        createTable: function() {
            if(!this.doesTableExist()) {
                this.save();
            }
        },

        destroyTable: function() {
            this.engine().removeItem(this.tableName());
        },

        load: function() {
            var data = JSON.parse(this.engine().getItem(this.tableName()));
            var DataClass = _.isArray(data) ? Backbone.Collection : Backbone.Model;

            if(this.getOption('dataClass')) {
                DataClass  = this.getOption('dataClass');
            }

            return this.options.data = new DataClass(data);
        },

        save: function() {
            if(this.getOption('data')) {
                this.engine().setItem(this.tableName(), JSON.stringify(this.getOption('data').toJSON()));
            }
        }

    });

    // TODO: Add KeyStore
    /*
    Toolbox.KeyStore = Toolbox.Storage.extend({

    });
    */

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore', 'interact.js'], function($, _, interact) {
            return factory(root.Toolbox, $, _, interact);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('jquery'),
            require('underscore'),
            require('interact.js')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._, root.interact);
    }
}(this, function (Toolbox, $, _, interact) {

    'use strict';

    function find(id, collection) {
        var where = getWhere(id);

        return collection.find(where);
    }

    function getWhere(id) {
        var where = {};

        where[getIdAttribute(id)] = id;

        return where;
    }

    function getIdAttribute(value) {
        return _.isNull(new String(value).match(/^c\d+$/)) ? 'id' : 'cid';
    }

    function getSelectionPoolFromElement(element, view) {
        var $parent = $(element);

        if(!$parent.hasClass('droppable-pool')) {
            $parent = $parent.parents('.droppable-pool');
        }

        return $parent.hasClass('available-pool') ?
            view.getRegion('available').currentView :
            view.getRegion('selected').currentView;
    }

    function transferNodeAfter(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = getSelectionPoolFromElement(event.relatedTarget, view);
        var to = getSelectionPoolFromElement(event.target, view);

        fromWhere[getIdAttribute($(event.relatedTarget).data('id'))] = $(event.relatedTarget).data('id');
        toWhere[getIdAttribute($(event.target).data('id'))] = $(event.target).data('id');

        var fromModel = from.collection.findWhere(fromWhere);
        var toModel = to.collection.findWhere(toWhere);

        from.collection.removeNode(fromModel);
        to.collection.appendNodeAfter(fromModel, toModel);
    }

    function transferNodeBefore(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = getSelectionPoolFromElement(event.relatedTarget, view);
        var to = getSelectionPoolFromElement(event.target, view);


        fromWhere[getIdAttribute($(event.relatedTarget).data('id'))] = $(event.relatedTarget).data('id');
        toWhere[getIdAttribute($(event.target).data('id'))] = $(event.target).data('id');

        var fromModel = from.collection.findWhere(fromWhere);
        var toModel = to.collection.findWhere(toWhere);

        from.collection.removeNode(fromModel);
        to.collection.appendNodeBefore(fromModel, toModel);
    }

    function transferNodeChildren(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = getSelectionPoolFromElement(event.relatedTarget, view);
        var to = getSelectionPoolFromElement(event.target, view);

        if($(event.target).find('.children').length == 0) {
            $(event.target).append('<div class="children" />');
        }

        fromWhere[getIdAttribute($(event.relatedTarget).data('id'))] = $(event.relatedTarget).data('id');
        toWhere[getIdAttribute($(event.target).data('id'))] = $(event.target).data('id');

        var fromModel = from.collection.findWhere(fromWhere);
        var toModel = to.collection.findWhere(toWhere);

        from.collection.removeNode(fromModel);
        to.collection.appendNode(fromModel, toModel, {
            at: 0
        });
    }

    Toolbox.SelectionPool = Toolbox.View.extend({

        template: Toolbox.Template('selection-pool'),

        className: 'selection-pool',

        regions: {
            available: '.available-pool',
            selected: '.selected-pool',
            //activity: '.selection-pool-search-activity'
        },

        defaultOptions: function() {
            return {
                nestable: true,
                availableTree: [],
                availableTreeView: Toolbox.SelectionPoolTreeView,
                availableTreeViewOptions: {},
                availableTreeViewTemplate: Toolbox.Template('selection-pool-tree-node'),
                selectedTree: [],
                selectedTreeView: Toolbox.SelectionPoolTreeView,
                selectedTreeViewOptions: {},
                selectedTreeViewTemplate: Toolbox.Template('selection-pool-tree-node'),
                height: false,
                typingStoppedThreshold: 500,
                likenessThreshold: 75,
                scrollBottomThreshold: 10,
                searchIndicatorOptions: {
                    indicator: 'tiny'
                }
            };
        },

        events: {
            'click .selection-pool-search-clear': function(event) {
                this.clearSearch();
                event.preventDefault();
            }
        },

       templateContext: function() {
            return this.options;
        },

        onDestroy: function() {
            this.channel.off('detection:typing:started', false, this);
            this.channel.off('detection:typing:stopped', false, this);
        },

        initialize: function() {
            Toolbox.View.prototype.initialize.apply(this, arguments);

            this.channel.on('detection:typing:started', function() {
                this.triggerMethod('typing:started');
            }, this);

            this.channel.on('detection:typing:stopped', function(value) {
                this.triggerMethod('typing:stopped', value);
            }, this);
        },

        showSearchActivity: function(message) {
            var self = this;

            this.$el.find('.selection-pool-search-activity').remove();
            this.$el.find('.selection-pool-search').append([
                '<div class="selection-pool-search-activity">',
                    '<div class="selection-pool-search-activity-label">',
                        (message || 'Loading...'),
                    '</div>',
                '</div>'
            ].join(''));

            setTimeout(function() {
                self.$el.addClass('show-activity');
            }, 50);
        },

        hideSearchActivity: function() {
            var self = this;

            this.$el.removeClass('show-activity');

            setTimeout(function() {
                self.$el.find('.selection-pool-search-activity').remove();
            }, 250);
        },

        showAvailablePool: function() {
            var self = this, View = this.getOption('availableTreeView');

            if(View) {
        		var view = new View(_.extend({
                    collection: this.getOption('availableTree'),
                    childViewOptions: _.extend({}, View.prototype.childViewOptions, {
                        nestable: this.getOption('nestable'),
                        template: this.getOption('availableTreeViewTemplate')
                    })
        		}, this.getOption('availableTreeViewOptions')));

                view.collection.on('add remove', function() {
                    setTimeout(function() {
                        self.resetScrollBottom.call(self);
                    });
                });

                this.showSelectionPoolView(this.getRegion('available'), view);
            }
        },

        showSelectedPool: function() {
            var View = this.getOption('selectedTreeView');

            if(View) {
        		var view = new View(_.extend({
                    collection: this.getOption('selectedTree'),
                    childViewOptions: _.extend({}, View.prototype.childViewOptions, {
                        nestable: this.getOption('nestable'),
                        template: this.getOption('selectedTreeViewTemplate')
                    })
        		}, this.getOption('selectedTreeViewOptions')));

                this.showSelectionPoolView(this.getRegion('selected'), view);
            }
        },

        showSelectionPoolView: function(region, view) {
            view.on('drop:before', function(event, view) {
                transferNodeBefore(event, this);
                this.triggerMethod('drop:before', event, view);
            }, this);

            view.on('drop:after', function(event, view) {
                transferNodeAfter(event, this);
                this.triggerMethod('drop:after', event, view);
            }, this);

            view.on('drop:children', function(event, view) {
                transferNodeChildren(event, this);
                this.triggerMethod('drop:children', event, view);
            }, this);

            view.on('drop', function(event, view) {
                this.triggerMethod('drop', event, view);
            }, this);

            region.show(view);
        },

        modelContains: function(model, query) {
            var found = false;

            for(var i in model = model.toJSON()) {
                var value = model[i];

                if(this.contains.call(this, value, query)) {
                    return true;
                }
            }

            return false;
        },

        contains: function(subject, query) {
            if(!_.isString(subject)) {
                return false;
            }

            for(var i in query = query.split(' ')) {
                var value = query[i];

                if(subject.toUpperCase().includes(value.toUpperCase())) {
                    return true;
                }

                var comparison = new Toolbox.Levenshtein(value.toUpperCase(), subject.toUpperCase());
                var percent = comparison.distance / subject.length * 100 - 100;

                if(percent > this.getOption('likenessThreshold')) {
                    return true;
                }
            }

            return false;
        },

        search: function(collection, query) {
            collection.filter(function(model) {
                if(this.modelContains(model, query)) {
                    model.set('hidden', false);
                }
                else {
                    model.set('hidden', true);
                }

                return true;
            }, this);

            this.available.currentView.render();
        },

        clearSearch: function() {
            this.$el.find('.selection-pool-search-field input').val('').focus();
            this.hideClearSearchButton();
            this.triggerMethod('typing:stopped', '');
        },

        showClearSearchButton: function() {
            this.$el.find('.selection-pool-search-clear').addClass('show');
        },

        hideClearSearchButton: function() {
            this.$el.find('.selection-pool-search-clear').removeClass('show');
        },

        onTypingStarted: function() {
        },

        onTypingStopped: function(value) {
            if(value) {
                this.showClearSearchButton();
            }
            else {
                this.hideClearSearchButton();
            }

            if(this.available) {
                this.search(this.getRegion('available').currentView.collection, value);
            }
        },

        resetScrollBottom: function() {
            this._scrollAtBottom = false;
            this._scrollHeight = this.getRegion('available').currentView.$el.parent().prop('scrollHeight');
        },

        onDomRefresh: function() {
            var self = this, detection = new Toolbox.TypingDetection(
                this.$el.find('.selection-pool-search input'),
                this.getOption('typingStoppedThreshold'),
                this.channel
            );

            var $availablePool = this.getRegion('available').currentView.$el.parent();

            this._lastScrollTop = 0;
            this._scrollAtBottom = false;
            self._scrollHeight = $availablePool.prop('scrollHeight');

            $availablePool.scroll(function() {
                var scrollTop = $(this).scrollTop();
                var threshold = self.getOption('scrollBottomThreshold');

                self._isScrollingDown = scrollTop > self._lastScrollTop;
                self._isPastThreshold = scrollTop + $(this).height() >= self._scrollHeight - threshold;

                if(self._isScrollingDown && self._isPastThreshold && !self._scrollAtBottom) {
                    self._scrollAtBottom = true;
                    self.triggerMethod('scroll:bottom', scrollTop);
                }
                else if (!self._isScrollingDown && !self._isPastThreshold){
                    self._scrollAtBottom = false;
                }

                self._lastScrollTop = scrollTop;
            });

            this.$el.find('.droppable-pool').each(function() {
                var $pool = $(this);

                interact(this)
                    .dropzone({
                        accept: $(this).data('accept'),
                        ondrop: function(event) {
                            var where = {};
                            var from = getSelectionPoolFromElement(event.relatedTarget, self);
                            var to = getSelectionPoolFromElement(event.target, self);

                            where[getIdAttribute($(event.relatedTarget).data('id'))] = $(event.relatedTarget).data('id');

                            var model = from.collection.findWhere(where);

                            from.collection.removeNode(model);
                            to.collection.appendNode(model, null, {at: $(event.relatedTarget).index()});

                            self.$el.removeClass('dropping');
                            $pool.parent().removeClass('droppable');
                            self.triggerMethod('pool:drop', event, model, from, to);
                        },
                        ondragenter: function (event) {
                            self.$el.addClass('dropping');
                            $pool.parent().addClass('droppable');
                            self.triggerMethod('pool:drag:enter', event);
                        },
                        ondragleave: function (event) {
                            self.$el.removeClass('dropping');
                            $pool.parent().removeClass('droppable');
                            self.triggerMethod('pool:drag:leave', event);
                        }
                    });
            });
        },

        onRender: function() {
            this.showAvailablePool();
            this.showSelectedPool();
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jquery'], function(_, $) {
            return factory(root.Toolbox, _, $);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore'),
            require('jquery')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.$);
    }
}(this, function (Toolbox, _, $) {

    Toolbox.SelectionPoolTreeNode = Toolbox.DraggableTreeNode.extend({

        onDrop: function(event) {
            var self = this, $target = $(event.target);

            if($target.hasClass('drop-before')) {
                this.root().triggerMethod('drop:before', event, self);
            }
            else if($target.hasClass('drop-after')) {
                this.root().triggerMethod('drop:after', event, self);
            }
            else if($target.hasClass('drop-children')) {
                if(this.getOption('nestable')) {
                    this.root().triggerMethod('drop:children', event, self);
                }
                else {
                    this.root().triggerMethod('drop:after', event, self);
                }
            }

            this.root().triggerMethod('drop', event, this);
        },

        onDomRefresh: function() {
            Toolbox.DraggableTreeNode.prototype.onDomRefresh.call(this);

            if(this.model.get('hidden') === true) {
                this.$el.hide();
            }
            else {
                this.$el.show();
            }
        }

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore'], function(_) {
            return factory(root.Toolbox, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root._);
    }
}(this, function (Toolbox, _) {

    Toolbox.SelectionPoolTreeView = Toolbox.DraggableTreeView.extend({

        childView: Toolbox.SelectionPoolTreeNode

    });

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore'], function(_) {
            return factory(root.Toolbox, $, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('underscore'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._);
    }
}(this, function (Toolbox, $, _) {

    'use strict';

    Toolbox.TabContent = Toolbox.View.extend({

		template: Toolbox.Template('tab-content'),

		defaultOptions: {
			name: false,

			id: false,

			content: false
		},

       templateContext: function() {
            return this.options;
        }
    });

	Toolbox.Tabs = Toolbox.View.extend({

		template: Toolbox.Template('tabs'),

		events: {
			'click [data-toggle="tab"]': function(e) {
				this.triggerMethod('tab:click', $(e.target).attr('href'));

				e.preventDefault();
			}
		},

		defaultOptions: {
			contentView: Toolbox.TabContent,

			activeClassName: 'active',

            tabClassName: 'nav nav-tabs',

			tabPaneClassName: 'tab-pane',

			content: []
		},

		tabViews: [],

       templateContext: function() {
            return this.options;
        },

        getViewName: function(view) {
            return view.getOption('tabName') ? view.getOption('tabName') : (
                view.getOption('name') ? view.getOption('name') : null
            );
        },

        getViewLabel: function(view) {
            return view.getOption('tabLabel') ? view.getOption('tabLabel') : (
                view.getOption('label') ? view.getOption('label') : null
            );
        },

        removeTab: function(view) {
            var name = this.getViewName(view);

        	this.$el.find('.nav-tabs').find('[href="#'+name+'"]').parent().remove();

        	this.regionManager.removeRegion(name);

        	this.$el.find('#'+name).remove();
        },

        addTab: function(view, setActive) {
            var name = this.getViewName(view);
        	var tab = '<li role="presentation"><a href="#'+name+'" aria-controls="'+name+'" role="tab" data-toggle="tab">'+this.getViewLabel(view)+'</a></li>';

        	var html = '<div role="tabpanel" class="'+this.getOption('tabPaneClassName')+'" id="'+name+'" />';

        	this.$el.find('.nav-tabs').append(tab);
        	this.$el.find('.tab-content').append(html);
			this.addRegion(name, '#'+name);
            this.showChildView(name, view);

			if(setActive) {
				this.setActiveTab(view);
			}
        },

        onRender: function() {
        	_.each(this.getOption('content'), function(obj, i) {
        		if(obj.cid) {
        			this.addTab(obj);
        		}
        		else {
        			var contentView = this.getOption('contentView');

					if(_.isObject(obj.view)) {
						contentView = obj.view;

						delete obj.view;
					}

	        		this.addTab(new contentView(obj));
        		}
        	}, this);
        },

        setActiveTab: function(id) {
        	if(_.isObject(id)) {
        		id = id.getOption('name');
        	}

            this.$el.find('.'+this.getOption('activeClassName'))
                .removeClass(this.getOption('activeClassName'));

            this.$el.find('[href="'+id+'"]')
                .parent()
                .addClass(this.getOption('activeClassName'));

            this.$el.find(id).addClass(this.getOption('activeClassName'));

            this.triggerMethod('set:active:tab', id);
        },

        getContentView: function(id) {
        	if(this[id] && this[id].currentView) {
        		return this[id].currentView;
        	}

        	return null;
        },

        onDomRefresh: function() {
        	if(!this.getOption('activeTab')) {
	        	this.$el.find('[data-toggle="tab"]:first').click();
	        }
	        else {
	        	this.setActiveTab(this.getOption('activeTab'));
	        }
        },

        onTabClick: function(id) {
        	this.setActiveTab(id);
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

    Toolbox.TextAreaField = Toolbox.BaseField.extend({

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

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore', 'backbone', 'backbone.marionette'], function($, _, Backbone, Marionette) {
            return factory(root.Toolbox, $, _, Backbone, Marionette);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('underscore'), require('backbone'), require('backbone.marionette'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._, Backbone, Marionette);
    }
}(this, function (Toolbox, $, _, Backbone, Marionette) {

    'use strict';

    Toolbox.TableNoItemsRow = Toolbox.View.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-no-items'),

        className: 'no-results',

        defaultOptions: {
            // (array) Array of array of column
            columns: false,

            // (string) The message to display if there are no table rows
            message: 'No rows found'
        },

       templateContext: function() {
            return this.options;
        }

    });

    Toolbox.TableViewRow = Toolbox.View.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-view-row'),

        defaultOptions: {
            // (array) Array of array of column
            columns: false,

            // (mixed) If not false, pass a valid View prototype
            editFormClass: false,

            // (mixed) If not false, pass a valid View prototype
            deleteFormClass: false
        },

        triggers: {
            'click .edit': 'click:edit',
            'click .delete': 'click:delete'
        },

       templateContext: function() {
            return this.options;
        },

        onClickEdit: function() {
            var View = this.getOption('editFormClass');

            if(View) {
                var view = new View({
                    model: this.model
                });

                view.on('submit:success', function() {
                    this.render();
                }, this);

                this.showViewInModal(view);
            }
        },

        onClickDelete: function() {
            var View = this.getOption('deleteFormClass');

            if(View) {
                var view = new View({
                    model: this.model
                });

                this.showViewInModal(view);
            }
        },

        showViewInModal: function(view) {
            var modal = new Toolbox.Modal({
                contentView: view
            });

            view.on('submit:success', function() {
                modal.hide();
            });

            modal.show();

            return modal;
        }

    });

    Toolbox.TableViewBody = Toolbox.CollectionView.extend({

        tagName: 'tbody',

        childView: Toolbox.TableViewRow,

        onChildviewBeforeRender: function(child) {
            child.options.columns = this.getOption('columns');
        }

    });

    Toolbox.TableView = Toolbox.View.extend({

		className: 'table-view',

        regions: {
            body: {
                el: 'tbody',
                replaceElement: true
            },
            header: 'thead',
            footer: 'tfoot td'
        },

        template: Toolbox.Template('table-view-group'),

        defaultOptions: {
            // (int) The starting page
            page: 1,

            // (string) The order of the date being returned
            order: null,

            // (string) Either asc or desc sorting order
            sort: null,

            // (int) The numbers of rows per page
            limit: 20,

            // (bool) Should show the pagination for this table
            paginate: true,

            // (array) Array of array of column
            columns: false,

            // (bool) Fetch the data when table is shown
            fetchOnShow: true,

            // (array) An array of headers appended to the request
            requestHeaders: [],

            // (array) The default options used to generate the query string
            defaultRequestDataOptions: [
                'page',
                'limit',
                'order',
                'sort'
            ],

            // (array) Additional options used to generate the query string
            requestDataOptions: [],

            // (object) The body view class
            bodyView: Toolbox.TableViewBody,

            // (object) The body view options object
            bodyViewOptions: false,

            // (object) The pagination view class
            footerView: Toolbox.Pagination,

            // (object) The pagination view options object
            footerViewOptions: false,

            // (string) The table header
            header: false,

            // (string) The table header tag name
            headerTagName: 'h3',

            // (string) The table header class name
            headerClassName: 'table-header',

            // (object) The header view class
            headerView: false,

            // (object) The header view options object
            headerViewOptions: false,

            // (string) The table description
            description: false,

            // (string) The table description tag
            descriptionTag: 'p',

            // (string) The table description tag
            descriptionClassName: 'description row col-sm-6',

            // (string) The table class name
            tableClassName: 'table',

            // (string) The loading class name
            loadingClassName: 'loading',

            // (string) The name of the property in the model storing the columns
            childViewColumnsProperty: 'columns',

            // (object) The activity indicator options
            indicatorOptions: {
                indicator: 'small'
            },

            // (string) The message to display if there are no table rows
            emptyMessage: 'No rows found',

            // (string) The name of the class appended to the buttons
            buttonClassName: 'btn btn-default',

            // (array) An array of button objects
            // {href: 'test-123', label: 'Test 123'}
            buttons: []
        },

        events: {
            'click .sort': function(e) {
                this.triggerMethod('sort:click', e);

                e.preventDefault();
            },
            'click .buttons-wrapper a': function(e) {
                var buttons = this.getOption('buttons');
                var i = $(e.target).index();

                if(_.isArray(buttons) && buttons[i].onClick) {
                    buttons[i].onClick.call(this, $(e.target));
                    e.preventDefault();
                }
            }
        },

       templateContext: function() {
            return this.options;
        },

        getCurrentPage: function(response) {
            return response.current_page || response.currentPage;
        },

        getLastPage: function(response) {
            return response.last_page || response.lastPage;
        },

        getEmptyView: function() {
            var View = Toolbox.TableNoItemsRow.extend({
                options: {
                    message: this.getOption('emptyMessage'),
                    columns: this.getOption('columns')
                }
            });

            return View;
        },

        onRender: function() {
            this.showHeaderView();
            this.showBodyView();

            if(this.getOption('fetchOnShow')) {
                this.fetch();
            }
        },

        onSortClick: function(e) {
            var defaultSort = 'asc',
                currentOrder = this.getOption('order'),
                currentSort = this.getOption('sort'),
                order = $(e.target).data('id');

            if(currentOrder == order) {
                if(!currentSort) {
                    this.options.sort = defaultSort;
                }
                else if(this.getOption('sort') === 'asc') {
                    this.options.sort = 'desc';
                }
                else {
                    this.options.order = false;
                    this.options.sort = false;
                }
            }
            else {
                this.options.order = order;
                this.options.sort = defaultSort;
            }

            this.$el.find('.sort').parent()
                .removeClass('sort-asc')
                .removeClass('sort-desc');

            if(this.getOption('sort')) {
                $(e.target).parent().addClass('sort-'+this.getOption('sort'));
            }

            this.fetch(true);
        },

        showHeaderView: function(View) {
            View = View || this.getOption('headerView');

            if(View) {
                this.showChildView('header', new View(_.extend({}, this.options)));
            }
        },

        showBodyView: function(View) {
            View = View || this.getOption('bodyView');

            if(View) {
                var view = new View(_.extend({
                    collection: this.collection,
                    columns: this.getOption('columns')
                }, this.getOption('bodyViewOptions')));

                this.showChildView('body', view);
            }
        },

        showFooterView: function(View) {
            View = View || this.getOption('footerView');

            var view = new View(_.extend({
                page: this.getOption('page'),
                totalPages: this.getOption('totalPages')
            }, this.getOption('footerViewOptions')));

            view.on('paginate', function(page, view) {
                this.options.page = page;
                this.fetch(true);
            }, this);

            this.showChildView('footer', view);
        },

        showActivityIndicator: function() {
            var self = this;

            this.getRegion('body').currentView.collection.reset();

            this.$el.find('table').addClass(this.getOption('loadingClassName'));

            var ActivityRow = Toolbox.ActivityIndicator.extend({
                template: Toolbox.Template('table-activity-indicator-row'),
                tagName: 'tr',
                templateContext: function() {
                    return this.options;
                },
                initialize: function() {
                    Toolbox.ActivityIndicator.prototype.initialize.apply(this, arguments);

                    // Set the activity indicator options
                    _.extend(this.options, self.getOption('indicatorOptions'));

                    this.options.columns = self.getOption('columns');

                    // Set the activity indicator instance to be removed later
                    self._activityIndicator = this;
                }
            });

            this.getRegion('body').currentView.addChildView(new ActivityRow({
                model: this.model
            }));
        },

        hideActivityIndicator: function() {
           this.$el.find('table').removeClass(this.getOption('loadingClassName'));

            if(this._activityIndicator) {
                this.getRegion('body').currentView.removeChildView(this._activityIndicator);
                this._activityIndicator = false;
            }
        },

        getRequestData: function() {
            var data = {}, options = this.getOption('requestDataOptions');
            var defaultOptions = this.getOption('defaultRequestDataOptions');

            _.each(([]).concat(defaultOptions, options), function(name) {
                if(!_.isNull(this.getOption(name)) && !_.isUndefined(this.getOption(name))) {
                    data[name] = this.getOption(name);
                }
            }, this);

            return _.extend(data, this.getOption('requestData'));
        },

        onSortClick: function(e) {
            var self = this, orderBy = $(e.target).data('id');

            _.each(([]).concat(defaultOptions, options), function(name) {
                if(!_.isNull(this.getOption(name)) && !_.isUndefined(this.getOption(name))) {
                    if(this.getOption(name)) {
                        data[name] = this.getOption(name);
                    }
                }
                else if(self.getOption('sort') === 'asc') {
                    self.options.sort = 'desc';
                }
                else {
                    self.options.orderBy = false;
                    self.options.sort = false;
                }
            });

            this.$el.find('.sort').parent().removeClass('sort-asc').removeClass('sort-desc');

            if(self.getOption('sort')) {
                $(e.target).parent().addClass('sort-'+self.getOption('sort'));
            }

            self.fetch(true);
        },

        onFetch: function(collection, response) {
            this.showActivityIndicator();
        },

        onFetchSuccess: function(collection, response) {
            var page = this.getCurrentPage(response);
            var totalPages = this.getLastPage(response);

            if(collection.length === 0) {
                this.showEmptyView();
            }

            this.options.page = page;
            this.options.totalPages = totalPages;

            this.showFooterView();
        },

        onFetchComplete: function(status, collection, response) {
            this.hideActivityIndicator();
        },

        getCurrentPage: function(response) {
            return response.current_page || response.currentPage;
        },

        getLastPage: function(response) {
            return response.last_page || response.lastPage;
        },

        fetch: function(reset) {
            var self = this;

            if(reset) {
                this.collection.reset();
            }

            this.collection.fetch({
                data: this.getRequestData(),
                beforeSend: function(xhr) {
                    if(self.getOption('requestHeaders')) {
                        _.each(self.getOption('requestHeaders'), function(value, name) {
                            xhr.setRequestHeader(name, value);
                        });
                    }
                },
                success: function(collection, response) {
                    self.triggerMethod('fetch:complete', true, collection, response);
                    self.triggerMethod('fetch:success', collection, response);
                },
                error: function(collection, response) {
                    self.triggerMethod('fetch:complete', false, collection, response);
                    self.triggerMethod('fetch:error', collection, response)
                }
            });

            this.triggerMethod('fetch');
        }

    });

    return Toolbox;

}));

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
}(this, function (Toolbox, _) {

    'use strict';

	Toolbox.Wizard = Toolbox.View.extend({

        className: 'wizard',

    	template: Toolbox.Template('wizard'),

        regions: {
            progress: '.wizard-progress',
            content: '.wizard-content',
            buttons: '.wizard-buttons'
        },

        events: {
            'keyup': function(event) {
                if(this.getOption('submitFormOnEnter') && event.keyCode === 13) {
                    this.$el.find('form').submit();
                }
            }
        },

        defaultOptions: function() {
            return {
                header: false,
                headerTagName: 'h2',
                headerClassName: 'wizard-header',
                finishedClassName: 'wizard-finished',
                fixedHeightClassName: 'fixed-height',
                hasPanelClassName: 'wizard-panel',
                panelClassName: 'panel panel-default',
                buttonView: Toolbox.WizardButtons,
                buttonViewOptions: {},
                progressView: Toolbox.WizardProgress,
                progressViewOptions: {},
                highestStep: 1,
                step: 1,
                steps: [],
                finished: false,
                successView: Toolbox.WizardSuccess,
                successViewOptions: {},
                errorView: Toolbox.WizardError,
                errorViewOptions: {},
                showButtons: true,
                panel: false,
                contentHeight: false,
                submitFormOnEnter: false
            };
        },

       templateContext: function() {
            return this.options;
        },

        resetRegions: function(view) {
            if(view.regions && view.regionManager) {
                view.regionManager.emptyRegions();
                view.regionManager.addRegions(view.regions);
            }
        },

        setContentHeight: function(height) {
            height || (height = 400);

            this.$el.find('.wizard-content')
                .addClass(this.getOption('fixedHeightClassName'))
                .css('height', height);
        },

        setStep: function(step) {
            var view = false, prevStep = this.getStep();

            this.options.step = parseInt(step);

            if(this.options.step < 1) {
                this.options.step = 1;
            }

            if(this.getOption('step') > this.getOption('highestStep')) {
                this.options.highestStep = this.getOption('step')
            }

            if(this.getRegion('buttons').currentView) {
                this.getRegion('buttons').currentView.render();
            }

            if(view = this.getStep()) {
                this.showContent(view);
                view.triggerMethod('wizard:show:step', this.getStep(), prevStep, view);
                this.triggerMethod('show:step', this.getStep(), prevStep, this);
            }
        },

        showView: function(View, options) {
            if(View) {
                this.showContent(new View(options));
            }
        },

        showActivityIndicator: function(options, region) {
            region || (region = this.getRegion('content'));

            var view = new Toolbox.ActivityIndicator(_.extend({
                indicator: 'medium',
                minHeight: '400px'
            }, options));

            region.show(view, {
                preventDestroy: true
            });
        },

        showProgress: function() {
            var View = this.getOption('progressView');

            if(View) {
                var view = new View(_.extend({}, this.getOption('progressViewOptions'), {
                    wizard: this
                }));

                this.showChildView('progress', view);
            }
            else {
                throw new Error('The button view is not a valid class.');
            }
        },

        showButtons: function() {
            var View = this.getOption('buttonView');

            if(View) {
                var view = new View(_.extend({}, this.getOption('buttonViewOptions'), {
                    wizard: this
                }));

                this.showChildView('buttons', view);
            }
            else {
                throw new Error('The button view is not a valid class.');
            }
        },

        showContent: function(view) {
            if(view) {
                view.options.wizard = this;

                this.showChildView('content', view, {
                    preventDestroy: true
                });

                view.once('attach', function() {
                    this.resetRegions(view);
                    view.triggerMethod('wizard:attach');
                }, this);
            }
        },

        getStep: function(step) {
            return this.getOption('steps')[(step || this.getOption('step')) - 1];
        },

        getTotalSteps: function() {
            return this.getOption('steps').length;
        },

        next: function() {
            this.triggerMethod('complete:step', this.getStep());
            this.setStep(this.getOption('step') + 1);
        },

        back: function() {
            this.setStep(this.getOption('step') - 1);
        },

        onShowStep: function(step) {
            this.getRegion('progress').currentView.setActive(step.getOption('step'));
        },

        onCompleteStep: function(step) {
            this.getRegion('progress').currentView.setComplete(step.getOption('step'));
            this.getRegion('progress').currentView.render();
        },

        onWizardError: function(options, ErrorView) {
            options = _.extend({
                wizard: this
            }, this.getOption('errorViewOptions'), options);

            this.showView(ErrorView || this.getOption('errorView'), options);
        },

        onWizardSuccess: function(options, SuccessView) {
            options = _.extend({
                wizard: this
            }, this.getOption('successViewOptions'), options);

            this.getRegion('buttons').empty();
            this.options.step++;
            this.options.finished = true;
            this.$el.addClass(this.getOption('finishedClassName'));
            this.getRegion('progress').currentView.setActive(this.getOption('step'));
            this.showView(SuccessView || this.getOption('successView'), options);
        },

        finish: function(success, options, View) {
            if(_.isUndefined(success) || success) {
                this.triggerMethod('complete:step', this.getStep());
                this.triggerMethod('wizard:success', options, View);
            }
            else {
                this.triggerMethod('wizard:error', options, View);
            }
        },

        onDomRefresh: function() {
            if(this.getOption('contentHeight')) {
                this.setContentHeight(this.getOption('contentHeight'));
            }

            if(this.getOption('showProgress')) {
                this.showProgress();
            }

            if(this.getOption('showButtons')) {
                this.showButtons();
            }

            if(this.getOption('panel')) {
                this.$el.addClass(this.getOption('hasPanelClassName'));
            }

            this.setStep(this.getOption('step'));
        },

        disableButtons: function() {
            this.getRegion('buttons').currentView.disableButtons();
        },

        disableNextButton: function() {
            this.getRegion('buttons').currentView.disableNextButton();
        },

        disableBackButton: function() {
            this.getRegion('buttons').currentView.disableBackButton();
        },

        disableFinishButton: function() {
            this.getRegion('buttons').currentView.disableFinishButton();
        },

        enableButtons: function() {
            this.getRegion('buttons').currentView.enableButtons();
        },

        enableNextButton: function() {
            this.getRegion('buttons').currentView.enableNextButton();
        },

        enableBackButton: function() {
            this.getRegion('buttons').currentView.enableBackButton();
        },

        enableFinishButton: function() {
            this.getRegion('buttons').currentView.enableFinishButton();
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore'], function($, _) {
            return factory(root.Toolbox, $, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox, require('jquery'), require('underscore'));
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._);
    }
}(this, function (Toolbox, $, _) {

    'use strict';

	Toolbox.WizardButtons = Toolbox.View.extend({

        template: Toolbox.Template('wizard-buttons'),

        className: 'wizard-buttons-wrapper clearfix',

        channelName: 'toolbox.wizard',

        defaultOptions: {
            step: false,
            totalSteps: false,
            wizard: false,
            buttonSizeClassName: 'btn-md',
            defaultButtonClassName: 'btn btn-default',
            primaryButtonClassName: 'btn btn-primary',
            disabledClassName: 'disabled',
            leftButtons: [{
                icon: 'fa fa-long-arrow-left',
                label: 'Back',
                className: function() {
                    return (
                        this.parent.getCurrentStep() == 1 ? 'disabled ' : ''
                    ) + this.parent.getDefaultButtonClasses('back');
                },
                onClick: function(e) {
                    this.triggerMethod('click:back');
                }
            }],
            rightButtons: [{
                label: 'Finish',
                className: function() {
                    if(this.parent.getCurrentStep() != this.parent.getTotalSteps()) {
                        return 'hide';
                    }

                    return this.parent.getPrimaryButtonClasses('finish');
                },
                onClick: function(e) {
                    this.triggerMethod('click:finish');
                }
            },{
                icon: 'fa fa-long-arrow-right',
                label: 'Next',
                className: function() {
                    if(this.parent.getCurrentStep() == this.parent.getTotalSteps()) {
                        return 'hide';
                    }

                    return this.parent.getDefaultButtonClasses('next');
                },
                onClick: function(e) {
                    this.triggerMethod('click:next');
                }
            }]
        },

        events: {
            'click .wizard-left-buttons button': function(e) {
                var $button = $(e.currentTarget);
                var index = $button.index();

                if($button.hasClass(this.getOption('disabledClassName'))) {
                    return;
                }

                if( this.getOption('leftButtons')[index] &&
                    this.getOption('leftButtons')[index].onClick) {
                    this.getOption('leftButtons')[index].onClick.call(this, e);
                }
            },
            'click .wizard-right-buttons button': function(e) {
                var $button = $(e.currentTarget);
                var index = $button.index();

                if($button.hasClass(this.getOption('disabledClassName'))) {
                    return;
                }

                if( this.getOption('rightButtons')[index] &&
                    this.getOption('rightButtons')[index].onClick) {
                    this.getOption('rightButtons')[index].onClick.call(this, e);
                }
            }
        },

        initialize: function() {
            Toolbox.View.prototype.initialize.apply(this, arguments);

            _.each(this.options.rightButtons, function(item) {
                item.parent = this;
            }, this);

            _.each(this.options.leftButtons, function(item) {
                item.parent = this;
            }, this);
        },

        removeRightButton: function(index) {
            if(_.isObject(index)) {
                _.each(this.options.rightButtons, function(button, i) {
                    if(button == index) {
                        this.removeRightButton(i);
                    }
                }, this)
            }
            else if(_.isNumber(index)) {
                this.options.rightButtons.splice(index, 1);
                this.render();
            }
        },

        addRightButton: function(button, at) {
			var buttons = _.clone(this.options.rightButtons);

            if(_.isUndefined(at)) {
                at = buttons.length;
            }

            button.parent = this;
            buttons.splice(at, 0, button);

			this.options.rightButtons = buttons;
			this.render();
        },

        removeLeftButton: function(index) {
            if(_.isObject(index)) {
                _.each(this.options.leftButtons, function(button, i) {
                    if(button == index) {
                        this.removeLeftButton(i);
                    }
                }, this)
            }
            else if(_.isNumber(index)) {
                this.options.leftButtons.splice(index, 1);
                this.render();
            }
        },

        addLeftButton: function(button, at) {
			var buttons = _.clone(this.options.leftButtons);

            if(_.isUndefined(at)) {
                at = buttons.length;
            }

            button.parent = this;
            buttons.splice(at, 0, button);

			this.options.leftButtons = buttons;
			this.render();
        },

        disableButton: function(button) {
            this.$el.find('.'+button).addClass(this.getOption('disabledClassName'));
        },

        getSteps: function() {
            return this.getOption('steps') ? this.getOption('steps') : (
                this.getOption('wizard') ? this.getOption('wizard').getOption('steps') : []
            );
        },

        getCurrentStep: function() {
            return this.getOption('step') ? this.getOption('step') : (
                this.getOption('wizard') ? this.getOption('wizard').getOption('step') : 1
            );
        },

        getTotalSteps: function() {
            return this.getOption('totalSteps') ? this.getOption('totalSteps') : (
                this.getOption('wizard') ? this.getOption('wizard').getOption('steps').length : 1
            );
        },

       templateContext: function() {
            var step = this.getCurrentStep();
            var total = this.getTotalSteps();

            return _.extend({}, this.options, {
                isFirstStep: step == 1,
                isLastStep: step == total,
                totalSteps: total
            }, this.getOption('wizard').options);
        },

        onClickBack: function() {
            var step = this.getCurrentStep();
            var steps = this.getSteps();

            if(this.getOption('wizard')) {
                var response = this.getOption('wizard').getStep().triggerMethod('wizard:click:back', steps[step - 1]);

                if(_.isUndefined(response) || response === true) {
                    this.getOption('wizard').back();
                }
            }
            else {
                this.options.step--;
                this.render();
            }
        },

        onClickNext: function() {
            var step = this.getCurrentStep();
            var steps = this.getSteps();

            if(this.getOption('wizard')) {
                var response = this.getOption('wizard').getStep().triggerMethod('wizard:click:next', steps[step + 1]);

                if(_.isUndefined(response) || response === true) {
                    this.getOption('wizard').next();
                }
            }
            else {
                this.options.step++;
                this.render();
            }
        },

        onClickFinish: function() {
            if(this.getOption('wizard')) {
                var step = this.getOption('wizard').getStep();
                var response = step.triggerMethod('wizard:click:finish', step);

                if(_.isUndefined(response) || response === true) {
                    this.getOption('wizard').finish();
                }
            }
            else {
                this.options.step = this.getTotalSteps();
                this.render();
            }
        },

        getDefaultButtonClasses: function(append) {
            return this.getOption('defaultButtonClassName') + ' ' + this.getOption('buttonSizeClassName') + ' ' + (append || '');
        },

        getPrimaryButtonClasses: function(append) {
            return this.getOption('primaryButtonClassName') + ' ' + this.getOption('buttonSizeClassName') + ' ' + (append || '');
        },

        disableButtons: function() {
            this.$el.find('button').addClass(this.getOption('disabledClassName'));
        },

        disableNextButton: function() {
            this.$el.find('.next').addClass(this.getOption('disabledClassName'));
        },

        disableBackButton: function() {
            this.$el.find('.back').addClass(this.getOption('disabledClassName'));
        },

        disableFinishButton: function() {
            this.$el.find('.finish').addClass(this.getOption('disabledClassName'));
        },

        enableButtons: function() {
            this.$el.find('button').removeClass(this.getOption('disabledClassName'));
        },

        enableNextButton: function() {
            this.$el.find('.next').removeClass(this.getOption('disabledClassName'));
        },

        enableBackButton: function() {
            this.$el.find('.back').removeClass(this.getOption('disabledClassName'));
        },

        enableFinishButton: function() {
            this.$el.find('.finish').removeClass(this.getOption('disabledClassName'));
        }

    });

    return Toolbox;

}));

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
}(this, function (Toolbox, _) {

    'use strict';

	Toolbox.WizardError = Toolbox.View.extend({

		template: Toolbox.Template('wizard-error'),

        className: 'wizard-error',

        defaultOptions: {
            errors: [],
            headerTagName: 'h3',
            header: 'Error!',
            errorIcon: 'fa fa-times',
            message: false,
            showBackButton: true,
            backButtonClassName: 'btn btn-lg btn-primary',
            backButtonLabel: 'Go Back',
            backButtonIcon: 'fa fa-long-arrow-left',
            onClickBack: false
        },

        triggers: {
            'click button': 'click:back'
        },

       templateContext: function() {
            return this.options;
        },

        onClickBack: function() {
            if( this.getOption('onClickBack') && _.isFunction(this.getOption('onClickBack'))) {
                this.getOption('onClickBack').call(this);
            }
            else {
                this.getOption('wizard').showButtons();
                this.getOption('wizard').setStep(this.getOption('wizard').getOption('step') - 1);
            }
        }

	});

    return Toolbox;

}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore'], function($, _) {
            return factory(root.Toolbox, $, _);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('jquery'),
            require('underscore')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root.$, root._);
    }
}(this, function (Toolbox, $, _) {

    'use strict';

	Toolbox.WizardProgress = Toolbox.View.extend({

		template: Toolbox.Template('wizard-progress'),

        className: 'wizard-progress-wrapper',

        channelName: 'toolbox.wizard',

        defaultOptions: {
            wizard: false,
            content: {},
            activeClassName: 'active',
            completeClassName: 'complete',
            disabledClassName: 'disabled'
        },

        events: {
            'click .wizard-step': function(event) {
                var $step = $(event.currentTarget);
                var step = $step.data('step');

                if( !$step.hasClass(this.getOption('disabledClassName')) &&
                    !this.getOption('wizard').getOption('finished')) {
                    this.getOption('wizard').setStep(step);
                }

                event.preventDefault();
            }
        },

       templateContext: function() {
            _.each(this.getOption('wizard').getOption('steps'), function(step, i) {
                step.options.label = step.getOption('label') || step.label;
                step.options.title = step.getOption('title') || step.title;
                step.options.step = i + 1;
            }, this);

            return _.extend({}, this.options, this.getOption('wizard').options);
        },

        setDisabled: function(step) {
            this.$el.find('.wizard-step:lt('+step+')').removeClass(this.getOption('disabledClassName'));
        },

        setComplete: function(step) {
            var view = this.getOption('wizard').getStep(step);

            view.options.complete = true;

            this.$el.find('.wizard-step:lt('+(step - 1)+')').addClass(this.getOption('completeClassName'));
        },

        setActive: function(step) {
            this.$el.find('.'+this.getOption('activeClassName')).removeClass(this.getOption('activeClassName'));
            this.$el.find('.wizard-step:nth-child('+step+')')
                .addClass(this.getOption('activeClassName'))
                .removeClass(this.getOption('disabledClassName'));
        },

        setWidth: function() {
            this.$el.find('.wizard-step').css('width', (100 / this.getOption('wizard').getOption('steps').length) + '%');
        },

        onDomRefresh: function() {
            this.setWidth();
            this.setDisabled(this.getOption('wizard').getOption('highestStep'));
            this.setActive(this.getOption('wizard').getOption('step'));
        }

	});

    return Toolbox;

}));

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
}(this, function (Toolbox, _) {

    'use strict';

	Toolbox.WizardSuccess = Toolbox.View.extend({

		template: Toolbox.Template('wizard-success'),

        className: 'wizard-success',

        defaultOptions: {
            headerTagName: 'h3',
            header: 'Success!',
            successIcon: 'fa fa-check',
            message: false
        },

       templateContext: function() {
            return this.options;
        }

	});

    return Toolbox;

}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvb2xib3guanMiLCJEcm9wem9uZXMuanMiLCJUeXBpbmdEZXRlY3Rpb24uanMiLCJWaWV3T2Zmc2V0LmpzIiwidGVtcGxhdGVzLmpzIiwiaXMuanMiLCJub3QuanMiLCJwcm9wZXJ0eU9mLmpzIiwiVHJlZS5qcyIsIlZpZXcuanMiLCJDb2xsZWN0aW9uVmlldy5qcyIsIkJhc2VGaWVsZC5qcyIsIkJhc2VGb3JtLmpzIiwiVW5vcmRlcmVkTGlzdC5qcyIsIkRyb3Bkb3duTWVudS5qcyIsIlRyZWVWaWV3Tm9kZS5qcyIsIlRyZWVWaWV3LmpzIiwiRHJhZ2dhYmxlVHJlZU5vZGUuanMiLCJEcmFnZ2FibGVUcmVlVmlldy5qcyIsIkFjdGl2aXR5SW5kaWNhdG9yL0FjdGl2aXR5SW5kaWNhdG9yLmpzIiwiQnV0dG9uRHJvcGRvd25NZW51L0J1dHRvbkRyb3Bkb3duTWVudS5qcyIsIkJyZWFkY3J1bWJzL0JyZWFkY3VtYnMuanMiLCJCdXR0b25Hcm91cC9CdXR0b25Hcm91cC5qcyIsIkNoZWNrYm94RmllbGQvQ2hlY2tib3hGaWVsZC5qcyIsIkNhbGVuZGFyL0NhbGVuZGFyLmpzIiwiQ29yZS9MZW52ZW5zaHRlaW4uanMiLCJJbmxpbmVFZGl0b3IvSW5saW5lRWRpdG9yLmpzIiwiSW5wdXRGaWVsZC9JbnB1dEZpZWxkLmpzIiwiTGlnaHRTd2l0Y2hGaWVsZC9MaWdodFN3aXRjaEZpZWxkLmpzIiwiTGlzdEdyb3VwL0xpc3RHcm91cC5qcyIsIk1vZGFsL01vZGFsLmpzIiwiTm90aWZpY2F0aW9uL05vdGlmaWNhdGlvbi5qcyIsIk9yZGVyZWRMaXN0L09yZGVyZWRMaXN0LmpzIiwiUGFnZXIvUGFnZXIuanMiLCJQYWdpbmF0aW9uL1BhZ2luYXRpb24uanMiLCJQcm9ncmVzc0Jhci9Qcm9ncmVzc0Jhci5qcyIsIlJhZGlvRmllbGQvUmFkaW9GaWVsZC5qcyIsIlNlbGVjdEZpZWxkL1NlbGVjdEZpZWxkLmpzIiwiUmFuZ2VTbGlkZXIvUmFuZ2VTbGlkZXIuanMiLCJTdG9yYWdlL1N0b3JhZ2UuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2wuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2xUcmVlTm9kZS5qcyIsIlNlbGVjdGlvblBvb2wvU2VsZWN0aW9uUG9vbFRyZWVWaWV3LmpzIiwiVGFicy9UYWJzLmpzIiwiVGV4dGFyZWFGaWVsZC9UZXh0QXJlYUZpZWxkLmpzIiwiVGFibGVWaWV3L1RhYmxlVmlldy5qcyIsIldpemFyZC9XaXphcmQuanMiLCJXaXphcmQvV2l6YXJkQnV0dG9ucy5qcyIsIldpemFyZC9XaXphcmRFcnJvci5qcyIsIldpemFyZC9XaXphcmRQcm9ncmVzcy5qcyIsIldpemFyZC9XaXphcmRTdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3YyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25qQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzllQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFyaW9uZXR0ZS50b29sYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXG4gICAgICAgICAgICAgICAgJ2pxdWVyeScsXG4gICAgICAgICAgICAgICAgJ2JhY2tib25lJyxcbiAgICAgICAgICAgICAgICAnYmFja2JvbmUucmFkaW8nLFxuICAgICAgICAgICAgICAgICdiYWNrYm9uZS5tYXJpb25ldHRlJyxcbiAgICAgICAgICAgICAgICAnaGFuZGxlYmFycycsXG4gICAgICAgICAgICAgICAgJ3VuZGVyc2NvcmUnXG4gICAgICAgICAgICBdLCBmdW5jdGlvbigkLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUsIEhhbmRsZWJhcnMsIF8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LCAkLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUsIEhhbmRsZWJhcnMsIF8pO1xuICAgICAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLnJhZGlvJyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdoYW5kbGViYXJzJyksXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KHJvb3QsIHJvb3QuJCwgcm9vdC5CYWNrYm9uZSwgcm9vdC5CYWNrYm9uZS5SYWRpbywgcm9vdC5NYXJpb25ldHRlLCByb290LkhhbmRsZWJhcnMsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbihyb290LCAkLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUsIEhhbmRsZWJhcnMsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBUb29sYm94ID0ge307XG5cbiAgICBUb29sYm94LmhhbmRsZWJhcnMgPSB7fTtcblxuICAgIFRvb2xib3guVmlld3MgPSB7fTtcblxuICAgIFRvb2xib3guVkVSU0lPTiA9ICclJUdVTFBfSU5KRUNUX1ZFUlNJT04lJSc7XG5cbiAgICAvLyBUb29sYm94LlRlbXBsYXRlXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEdldCBhbiBleGlzdGluZyByZW5kZXJlZCBoYW5kbGViYXJzIHRlbXBsYXRlXG5cbiAgICBUb29sYm94LlRlbXBsYXRlID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBpZihUb29sYm94LnRlbXBsYXRlc1tuYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIFRvb2xib3gudGVtcGxhdGVzW25hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCBsb2NhdGUgdGhlIEhhbmRsZWJhcnMgdGVtcGxhdGUgd2l0aCB0aGUgbmFtZSBvZiBcIicrbmFtZSsnXCIuJztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUb29sYm94Lk9wdGlvbnNcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gR2V0IHRoZSBkZWZhdWx0IG9wdGlvbnMgYW5kIG9wdGlvbnMgYW5kIG1lcmdlIHRoZSxcblxuICAgIFRvb2xib3guT3B0aW9ucyA9IGZ1bmN0aW9uKGRlZmF1bHRPcHRpb25zLCBvcHRpb25zLCBjb250ZXh0KSB7XG4gICAgICAgIGlmKF8uaXNGdW5jdGlvbihkZWZhdWx0T3B0aW9ucykpIHtcbiAgICAgICAgICAgIGRlZmF1bHRPcHRpb25zID0gZGVmYXVsdE9wdGlvbnMuY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKF8uaXNGdW5jdGlvbihvcHRpb25zKSkge1xuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMuY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcm9vdC5Ub29sYm94ID0gVG9vbGJveDtcbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGRlZmluZShbJ2pxdWVyeSddLCBmdW5jdGlvbigkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkRyb3B6b25lcyA9IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFja3MsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBldmVudC5kcm9wem9uZS5lbGVtZW50KCk7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciBvZmZzZXQgPSBUb29sYm94LlZpZXdPZmZzZXQoZWxlbWVudCk7XG4gICAgICAgIHZhciB0b3AgPSBvZmZzZXQueTtcbiAgICAgICAgdmFyIGxlZnQgPSBvZmZzZXQueDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB2YXIgaGVpZ2h0VGhyZXNob2xkID0gaGVpZ2h0ICogLjI1O1xuICAgICAgICB2YXIgd2lkdGhUaHJlc2hvbGQgPSA0MDtcbiAgICAgICAgdmFyIGJvdHRvbSA9IHRvcCArIGhlaWdodDtcblxuICAgICAgICBpZihoZWlnaHRUaHJlc2hvbGQgPiAyMCkge1xuICAgICAgICAgICAgaGVpZ2h0VGhyZXNob2xkID0gMjA7XG4gICAgICAgIH1cblxuICAgICAgICBpZihldmVudC5wYWdlWSA8IHRvcCArIGhlaWdodFRocmVzaG9sZCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmJlZm9yZSA/IGNhbGxiYWNrcy5iZWZvcmUuY2FsbChjb250ZXh0LCAkZWxlbWVudCkgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoZXZlbnQucGFnZVkgPiBib3R0b20gLSBoZWlnaHRUaHJlc2hvbGQgfHwgZXZlbnQucGFnZVggPCBsZWZ0ICsgd2lkdGhUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5hZnRlciA/IGNhbGxiYWNrcy5hZnRlci5jYWxsKGNvbnRleHQsICRlbGVtZW50KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFja3MuY2hpbGRyZW4gPyBjYWxsYmFja3MuY2hpbGRyZW4uY2FsbChjb250ZXh0LCAkZWxlbWVudCkgOiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVHlwaW5nRGV0ZWN0aW9uID0gZnVuY3Rpb24oJGVsZW1lbnQsIHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQsIHJhZGlvQ2hhbm5lbCkge1xuICAgICAgICB0eXBpbmdTdG9wcGVkVGhyZXNob2xkIHx8ICh0eXBpbmdTdG9wcGVkVGhyZXNob2xkID0gNTAwKTtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB0eXBpbmdUaW1lciwgbGFzdFZhbHVlO1xuICAgICAgICB2YXIgaGFzVHlwaW5nU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZ2V0VmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkZWxlbWVudC52YWwoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhhc1R5cGluZ1N0YXJ0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TGFzdFZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFzdFZhbHVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2xlYXJUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodHlwaW5nVGltZXIpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodHlwaW5nVGltZXIpO1xuICAgICAgICAgICAgICAgIHR5cGluZ1RpbWVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRlbGVtZW50LmtleXVwKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmKCF0eXBpbmdUaW1lcikge1xuICAgICAgICAgICAgICAgIHR5cGluZ1RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYocmFkaW9DaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb0NoYW5uZWwudHJpZ2dlcignZGV0ZWN0aW9uOnR5cGluZzpzdG9wcGVkJywgc2VsZi5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0VmFsdWUgPSBzZWxmLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGhhc1R5cGluZ1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LCB0eXBpbmdTdG9wcGVkVGhyZXNob2xkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGVsZW1lbnQua2V5ZG93bihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmKCFoYXNUeXBpbmdTdGFydGVkICYmIHNlbGYuZ2V0VmFsdWUoKSAhPSBsYXN0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYocmFkaW9DaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb0NoYW5uZWwudHJpZ2dlcignZGV0ZWN0aW9uOnR5cGluZzpzdGFydGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaGFzVHlwaW5nU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlbGYuY2xlYXJUaW1lcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5WaWV3T2Zmc2V0ID0gZnVuY3Rpb24obm9kZSwgc2luZ2xlRnJhbWUpIHtcbiAgICAgICAgZnVuY3Rpb24gYWRkT2Zmc2V0KG5vZGUsIGNvb3Jkcywgdmlldykge1xuICAgICAgICAgICAgdmFyIHAgPSBub2RlLm9mZnNldFBhcmVudDtcblxuICAgICAgICAgICAgY29vcmRzLnggKz0gbm9kZS5vZmZzZXRMZWZ0IC0gKHAgPyBwLnNjcm9sbExlZnQgOiAwKTtcbiAgICAgICAgICAgIGNvb3Jkcy55ICs9IG5vZGUub2Zmc2V0VG9wIC0gKHAgPyBwLnNjcm9sbFRvcCA6IDApO1xuXG4gICAgICAgICAgICBpZiAocCkge1xuICAgICAgICAgICAgICAgIGlmIChwLm5vZGVUeXBlID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFN0eWxlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKHAsICcnKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50U3R5bGUucG9zaXRpb24gIT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLmJvcmRlckxlZnRXaWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBwYXJzZUludChwYXJlbnRTdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwLmxvY2FsTmFtZSA9PSAnVEFCTEUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQocGFyZW50U3R5bGUucGFkZGluZ0xlZnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLnBhZGRpbmdUb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocC5sb2NhbE5hbWUgPT0gJ0JPRFknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKG5vZGUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHAubG9jYWxOYW1lID09ICdCT0RZJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQocGFyZW50U3R5bGUuYm9yZGVyTGVmdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLmJvcmRlclRvcFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHAgIT0gcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCAtPSBwYXJlbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55IC09IHBhcmVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGFkZE9mZnNldChwLCBjb29yZHMsIHZpZXcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmxvY2FsTmFtZSA9PSAnQk9EWScpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKG5vZGUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQoc3R5bGUuYm9yZGVyTGVmdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gcGFyc2VJbnQoc3R5bGUuYm9yZGVyVG9wV2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBodG1sU3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUobm9kZS5wYXJlbnROb2RlLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54IC09IHBhcnNlSW50KGh0bWxTdHlsZS5wYWRkaW5nTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55IC09IHBhcnNlSW50KGh0bWxTdHlsZS5wYWRkaW5nVG9wKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5zY3JvbGxMZWZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54ICs9IG5vZGUuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5zY3JvbGxUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gbm9kZS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHdpbiA9IG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldztcblxuICAgICAgICAgICAgICAgIGlmICh3aW4gJiYgKCFzaW5nbGVGcmFtZSAmJiB3aW4uZnJhbWVFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBhZGRPZmZzZXQod2luLmZyYW1lRWxlbWVudCwgY29vcmRzLCB3aW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb29yZHMgPSB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBhZGRPZmZzZXQobm9kZSwgY29vcmRzLCBub2RlLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvb3JkcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsInRoaXNbXCJUb29sYm94XCJdID0gdGhpc1tcIlRvb2xib3hcIl0gfHwge307XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXSA9IHRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJhY3Rpdml0eS1pbmRpY2F0b3JcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcImRpbW1lZFwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwibWluLWhlaWdodDpcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5taW5IZWlnaHQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pbkhlaWdodCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1pbkhlaWdodFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI7XCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJwb3NpdGlvbjpcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wb3NpdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucG9zaXRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJwb3NpdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI7XCI7XG59LFwiN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJiYWNrZ3JvdW5kLWNvbG9yOiBcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kaW1tZWRCZ0NvbG9yIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kaW1tZWRCZ0NvbG9yIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiZGltbWVkQmdDb2xvclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI7XCI7XG59LFwiOVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCI8c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsXFxcIiBzdHlsZT1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbEZvbnRTaXplIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIj48c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsLXRleHRcXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9zcGFuPjwvc3Bhbj5cIjtcbn0sXCIxMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJmb250LXNpemU6XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWxGb250U2l6ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxGb250U2l6ZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImxhYmVsRm9udFNpemVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWRpbW1lciBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRpbW1lZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIiBzdHlsZT1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taW5IZWlnaHQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBvc2l0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kaW1tZWRCZ0NvbG9yIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPlxcblxcblx0PHNwYW4gY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvclxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9zcGFuPlxcblxcbjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImZvcm0tZXJyb3JcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIiAgICA8c3Bhbj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYShkZXB0aDAsIGRlcHRoMCkpXG4gICAgKyBcIjwvc3Bhbj5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5uZXdsaW5lIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8YnI+XCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZXJyb3JzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJicmVhZGNydW1iXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhyZWYgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJocmVmXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPC9hPlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ocmVmIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaHJlZiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibm8tYnJlYWRjcnVtYnNcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImJ1dHRvbi1kcm9wZG93bi1tZW51XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJkcm9wdXBcIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJ1dHRvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9uQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJidXR0b25DbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvbkljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9uTGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvbkxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJidXR0b25MYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2J1dHRvbj5cXG5cdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9uQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImJ1dHRvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJ1dHRvblRvZ2dsZUNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9uVG9nZ2xlQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJidXR0b25Ub2dnbGVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBkYXRhLXRvZ2dsZT1cXFwiZHJvcGRvd25cXFwiIGFyaWEtZXhwYW5kZWQ9XFxcImZhbHNlXFxcIj5cXG5cdFx0XHQ8c3BhbiBjbGFzcz1cXFwiY2FyZXRcXFwiPjwvc3Bhbj5cXG5cdFx0XHQ8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+VG9nZ2xlIERyb3Bkb3duPC9zcGFuPlxcblx0XHQ8L2J1dHRvbj5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5idXR0b25JY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25JY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiYnV0dG9uSWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJ1dHRvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9uQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJidXR0b25DbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5idXR0b25Ub2dnbGVDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvblRvZ2dsZUNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiYnV0dG9uVG9nZ2xlQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgZGF0YS10b2dnbGU9XFxcImRyb3Bkb3duXFxcIiBhcmlhLWV4cGFuZGVkPVxcXCJmYWxzZVxcXCI+XFxuXHRcdFx0XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25JY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdFx0XHRcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9uTGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvbkxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJidXR0b25MYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXG5cdFx0XHQ8c3BhbiBjbGFzcz1cXFwiY2FyZXRcXFwiPjwvc3Bhbj5cXG5cdFx0XHQ8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+VG9nZ2xlIERyb3Bkb3duPC9zcGFuPlxcblx0XHQ8L2J1dHRvbj5cXG5cIjtcbn0sXCI4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lbnVDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lbnVDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJtZW51Q2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcImJ0bi1ncm91cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRyb3BVcCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIj5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnNwbGl0QnV0dG9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdDx1bCBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZW51Q2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg4LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjwvdWw+XFxuPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiYnV0dG9uLWdyb3VwLWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPGkgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJpY29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC9pPiBcIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJuby1idXR0b24tZ3JvdXAtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiY2FsZW5kYXItbW9udGhseS1kYXktdmlld1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXHQ8c3BhbiBjbGFzcz1cXFwiY2FsZW5kYXItaGFzLWV2ZW50c1xcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNpcmNsZVxcXCI+PC9pPjwvc3Bhbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPVxcXCJjYWxlbmRhci1kYXRlXFxcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kYXkgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRheSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiZGF5XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvc3Bhbj5cXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5pcyB8fCAoZGVwdGgwICYmIGRlcHRoMC5pcykgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ldmVudHMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxlbmd0aCA6IHN0YWNrMSksXCI+XCIsXCIwXCIse1wibmFtZVwiOlwiaXNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiY2FsZW5kYXItbW9udGhseS12aWV3XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJjYWxlbmRhci1tYXN0aGVhZFxcXCI+XFxuXHQ8bmF2IGNsYXNzPVxcXCJjYWxlbmRhci1uYXZpZ2F0aW9uXFxcIj5cXG5cdFx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcImNhbGVuZGFyLW5hdmlnYXRpb24tcHJldlxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWFuZ2xlLWxlZnRcXFwiPjwvaT48L2E+XFxuXHRcdDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJjYWxlbmRhci1uYXZpZ2F0aW9uLW5leHRcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1hbmdsZS1yaWdodFxcXCI+PC9pPjwvYT5cXG5cdDwvbmF2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwiY2FsZW5kYXItaGVhZGVyXFxcIj48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImNhbGVuZGFyLXN1Yi1oZWFkZXJcXFwiPjwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XFxcImNhbGVuZGFyLXZpZXdcXFwiPlxcblx0PGRpdiBjbGFzcz1cXFwiaW5kaWNhdG9yXFxcIj48L2Rpdj5cXG5cXG5cdDx0YWJsZSBjbGFzcz1cXFwiY2FsZW5kYXItbW9udGhseS12aWV3XFxcIj5cXG5cdFx0PHRoZWFkPlxcblx0XHRcdDx0cj5cXG5cdFx0XHRcdDx0aD5TdW48L3RoPlxcblx0XHRcdFx0PHRoPk1vbjwvdGg+XFxuXHRcdFx0XHQ8dGg+VHVlPC90aD5cXG5cdFx0XHRcdDx0aD5XZWQ8L3RoPlxcblx0XHRcdFx0PHRoPlRodXI8L3RoPlxcblx0XHRcdFx0PHRoPkZyaTwvdGg+XFxuXHRcdFx0XHQ8dGg+U2F0PC90aD5cXG5cdFx0XHQ8L3RyPlxcblx0XHQ8L3RoZWFkPlxcblx0XHQ8dGJvZHk+PC90Ym9keT5cXG5cdDwvdGFibGU+XFxuPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZm9ybS1jaGVja2JveC1maWVsZFwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlciB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXCJcIjtcblxuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm9wdGlvbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJvcHRpb25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDcsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMub3B0aW9ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG59LFwiN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXMzPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzND1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzNT1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiXHQ8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaW5wdXRDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcblx0XHQ8bGFiZWwgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMzLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPjxpbnB1dCB0eXBlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0udHlwZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm5hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJbXVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52YWx1ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXM0KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM1ID8gaGVscGVyLmNhbGwoYWxpYXMzLHtcIm5hbWVcIjpcInZhbHVlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+IFwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXM0KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM1ID8gaGVscGVyLmNhbGwoYWxpYXMzLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXHQ8L2Rpdj5cXG5cIjtcbn0sXCI4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlucHV0Q2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbnB1dENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaW5wdXRDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDExLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+PGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50eXBlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50eXBlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ0eXBlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm5hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcIm5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnZhbHVlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52YWx1ZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidmFsdWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj4gXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9sYWJlbD5cXG5cdDwvZGl2PlxcblwiO1xufSxcIjExXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDEwLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiaW5saW5lLWVkaXRvclwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiaW5saW5lLWVkaXRvci1sYWJlbFxcXCI+PC9kaXY+XFxuXFxuPGkgY2xhc3M9XFxcImZhIGZhLXBlbmNpbCBpbmxpbmUtZWRpdG9yLWVkaXQtaWNvblxcXCI+PC9pPlxcblxcbjxkaXYgY2xhc3M9XFxcImlubGluZS1lZGl0b3ItZmllbGRcXFwiPjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XFxcImlubGluZS1lZGl0b3ItYWN0aXZpdHktaW5kaWNhdG9yXFxcIj48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJmb3JtLWlucHV0LWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDksIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwibmFtZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50eXBlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50eXBlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ0eXBlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlucHV0Q2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbnB1dENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaW5wdXRDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiAvPlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImRyb3Bkb3duLW1lbnUtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxhIGhyZWY9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhyZWYgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhyZWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvYT5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52YWx1ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJ2YWx1ZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCI4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGl2aWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZHJvcGRvd24tbWVudS1uby1pdGVtc1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lc3NhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImRyb3Bkb3duLW1lbnVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVudUNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVudUNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lbnVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudG9nZ2xlQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50b2dnbGVDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInRvZ2dsZUNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGRhdGEtdG9nZ2xlPVxcXCJkcm9wZG93blxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIiBhcmlhLWhhc3BvcHVwPVxcXCJ0cnVlXFxcIiBhcmlhLWV4cGFuZGVkPVxcXCJmYWxzZVxcXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRvZ2dsZUxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50b2dnbGVMYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidG9nZ2xlTGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIDxpIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudG9nZ2xlSWNvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG9nZ2xlSWNvbkNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidG9nZ2xlSWNvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT48L2E+XFxuXFxuPHVsIGNsYXNzPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lbnVDbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+PC91bD5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJsaXN0LWdyb3VwLWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiXHQ8c3BhbiBjbGFzcz1cXFwiYmFkZ2VcXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJhZGdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5iYWRnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImJhZGdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvc3Bhbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYmFkZ2UgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29udGVudCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibm8tbGlzdC1ncm91cC1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiICAgIFwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lc3NhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICBObyBpdGVtcyBmb3VuZC5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImZvcm0tbGlnaHQtc3dpdGNoLWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PGxhYmVsIGZvcj1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaWRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xufSxcIjVcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3A+XFxuXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb25DbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiZGVzY3JpcHRpb25DbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjhcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYWN0aXZlQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3RpdmVDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJhY3RpdmVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG48ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaW5wdXRDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlucHV0Q2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJpbnB1dENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZhbHVlIDogZGVwdGgwKSwxLHtcIm5hbWVcIjpcImlzXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiPlxcblx0PGRpdiBjbGFzcz1cXFwibGlnaHQtc3dpdGNoLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxpZ2h0LXN3aXRjaC1sYWJlbCBvblxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxpZ2h0LXN3aXRjaC1oYW5kbGVcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsaWdodC1zd2l0Y2gtbGFiZWwgb2ZmXFxcIj48L2Rpdj5cXG5cdDwvZGl2PlxcbjwvZGl2PlxcblxcbjxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJuYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52YWx1ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInZhbHVlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgaWQ9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibW9kYWwtd2luZG93XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIlx0PGgzIGNsYXNzPVxcXCJtb2RhbC1oZWFkZXJcXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlciB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaGVhZGVyXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvaDM+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcbiAgXCJcdFx0PGRpdiBjbGFzcz1cXFwibW9kYWwtYnV0dG9uc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9ucyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLChvcHRpb25zPXtcIm5hbWVcIjpcImJ1dHRvbnNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5idXR0b25zKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiXHRcdDwvZGl2PlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHQ8YSBocmVmPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDUsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRleHQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRleHQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInRleHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9hPlxcblwiO1xufSxcIjVcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaHJlZiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaHJlZiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImhyZWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJpZD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaWRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjlcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJpY29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC9zcGFuPiBcIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJtb2RhbC13aW5kb3dcXFwiPlxcblx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIm1vZGFsLWNsb3NlXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtdGltZXMtY2lyY2xlXFxcIj48L2k+PC9hPlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdDxkaXYgY2xhc3M9XFxcIm1vZGFsLWNvbnRlbnQgY2xlYXJmaXhcXFwiPjwvZGl2PlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9ucyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibm90aWZpY2F0aW9uXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0XHQ8ZGl2IGNsYXNzPVxcXCJjb2wtc20tMlxcXCI+XFxuXHRcdFx0PGkgY2xhc3M9XFxcImZhIGZhLVwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIGljb25cXFwiPjwvaT5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImNvbC1sZy0xMFxcXCI+XFxuXHRcdFx0XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50aXRsZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXFxuXHRcdFx0XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdFx0PC9kaXY+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8aDM+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGl0bGUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRpdGxlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwidGl0bGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9oMz5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxwPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJtZXNzYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdFx0PGRpdiBjbGFzcz1cXFwiY29sLWxnLTEyXFxcIj5cXG5cdFx0XHRcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRpdGxlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cdFx0XHRcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0XHQ8L2Rpdj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzLWNpcmNsZVxcXCI+PC9pPjwvYT5cXG5cXG48ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDApLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIm5vLW9yZGVyZWQtbGlzdC1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZXNzYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibWVzc2FnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wib3JkZXJlZC1saXN0LWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbnRlbnQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJwYWdlclwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wcmV2Q2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wcmV2Q2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwicHJldkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0XHQ8bGkgY2xhc3M9XFxcInBhZ2UtdG90YWxzXFxcIj5QYWdlIFwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIG9mIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG90YWxQYWdlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9saT5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRvdGFsUGFnZXMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRvdGFsUGFnZXMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJ0b3RhbFBhZ2VzXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmV4dENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmV4dENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm5leHRDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx1bCBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBhZ2VyQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYWdlckNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicGFnZXJDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdDxsaSBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zbmFwVG9FZGdlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIj48YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwicHJldi1wYWdlXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtbG9uZy1hcnJvdy1sZWZ0XFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9pPiBcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucHJldkxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wcmV2TGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInByZXZMYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2E+PC9saT5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluY2x1ZGVQYWdlVG90YWxzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdDxsaSBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zbmFwVG9FZGdlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIj48YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwibmV4dC1wYWdlXFxcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmV4dExhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uZXh0TGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcIm5leHRMYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgPGkgY2xhc3M9XFxcImZhIGZhLWxvbmctYXJyb3ctcmlnaHRcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L2k+PC9hPjwvbGk+XFxuPC91bD5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJwYWdpbmF0aW9uLWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0PGE+JmhlbGxpcDs8L2E+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8YSBocmVmPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDApLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFtcImNsYXNzXCJdIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg4LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTAsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cXG5cdFx0XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFnZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0PC9hPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaHJlZiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaHJlZiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImhyZWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiI1wiO1xufSxcIjhcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzW1wiY2xhc3NcIl0gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwW1wiY2xhc3NcIl0gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJjbGFzc1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTBcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiZGF0YS1sYWJlbD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjEyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvc3Bhbj5cIjtcbn0sXCIxNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwicGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRpdmlkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInBhZ2luYXRpb25cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPHVsIGNsYXNzPVxcXCJwYWdpbmF0aW9uIFwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBhZ2luYXRpb25DbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBhZ2luYXRpb25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJwYWdpbmF0aW9uQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHQ8bGk+XFxuXHRcdDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJwcmV2LXBhZ2VcXFwiIGFyaWEtbGFiZWw9XFxcIlByZXZpb3VzXFxcIj5cXG5cdFx0XHQ8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+JmxhcXVvOzwvc3Bhbj5cXG5cdFx0PC9hPlxcblx0PC9saT5cXG4gICAgPGxpPlxcblx0XHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwibmV4dC1wYWdlXFxcIiBhcmlhLWxhYmVsPVxcXCJOZXh0XFxcIj5cXG5cdFx0XHQ8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+JnJhcXVvOzwvc3Bhbj5cXG5cdFx0PC9hPlxcbiAgICA8L2xpPlxcbjwvdWw+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wicHJvZ3Jlc3MtYmFyXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wcm9ncmVzc0JhckNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucHJvZ3Jlc3NCYXJDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInByb2dyZXNzQmFyQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgcm9sZT1cXFwicHJvZ3Jlc3NiYXJcXFwiIGFyaWEtdmFsdWVub3c9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wcm9ncmVzcyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucHJvZ3Jlc3MgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInByb2dyZXNzXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgYXJpYS12YWx1ZW1pbj1cXFwiMFxcXCIgYXJpYS12YWx1ZW1heD1cXFwiMTAwXFxcIiBzdHlsZT1cXFwid2lkdGg6IFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wcm9ncmVzcyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucHJvZ3Jlc3MgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInByb2dyZXNzXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiU7XFxcIj5cXG5cdDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucHJvZ3Jlc3MgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnByb2dyZXNzIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJwcm9ncmVzc1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIlIENvbXBsZXRlPC9zcGFuPlxcbjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImZvcm0tcmFkaW8tZmllbGRcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHQ8XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlclRhZ05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlclRhZ05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclRhZ05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXIgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlclRhZ05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlclRhZ05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclRhZ05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3A+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb25DbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiZGVzY3JpcHRpb25DbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5vcHRpb25zIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5vcHRpb25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwib3B0aW9uc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLm9wdGlvbnMpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcIjdcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1jb250YWluZXIubGFtYmRhLCBhbGlhczI9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzMz1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczQ9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczU9XCJmdW5jdGlvblwiO1xuXG4gIHJldHVybiBcIlx0PGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmlucHV0Q2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMywoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubGFiZWxDbGFzc05hbWUgOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj48aW5wdXQgdHlwZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLnR5cGUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIG5hbWU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5uYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiW11cXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmFsdWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZhbHVlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzNCksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNSA/IGhlbHBlci5jYWxsKGFsaWFzMyx7XCJuYW1lXCI6XCJ2YWx1ZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPiBcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzNCksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNSA/IGhlbHBlci5jYWxsKGFsaWFzMyx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblx0PC9kaXY+XFxuXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubGFiZWxDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTBcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5wdXRDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlucHV0Q2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdDxsYWJlbCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPjxpbnB1dCB0eXBlPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudHlwZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudHlwZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidHlwZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIG5hbWU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJuYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52YWx1ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInZhbHVlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC9sYWJlbD5cXG5cdDwvZGl2PlxcblwiO1xufSxcIjExXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDEwLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wicmFuZ2Utc2xpZGVyXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJzbGlkZXJcXFwiPjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImZvcm0tc2VsZWN0LWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHQ8cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIm5hbWU9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5uYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjEzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pZCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwibXVsdGlwbGVcIjtcbn0sXCIxN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8b3B0aW9uIFwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmlzIHx8IChkZXB0aDAgJiYgZGVwdGgwLmlzKSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52YWx1ZSA6IGRlcHRoMCksXCIhPT1cIix1bmRlZmluZWQse1wibmFtZVwiOlwiaXNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnNlbGVjdGVkIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyMCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIyLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSgyNCwgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9vcHRpb24+XFxuXCI7XG59LFwiMThcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwidmFsdWU9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnZhbHVlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52YWx1ZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInZhbHVlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIyMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwic2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIlwiO1xufSxcIjIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwiMjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnZhbHVlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52YWx1ZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInZhbHVlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYnVmZmVyID0gXG4gICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjxzZWxlY3QgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlucHV0Q2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbnB1dENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaW5wdXRDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm11bHRpcGxlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxNSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm9wdGlvbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwob3B0aW9ucz17XCJuYW1lXCI6XCJvcHRpb25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDE3LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMub3B0aW9ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIjwvc2VsZWN0PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJzZWxlY3Rpb24tcG9vbC10cmVlLW5vZGVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8dWwgY2xhc3M9XFxcImNoaWxkcmVuXFxcIj48L3VsPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGkgY2xhc3M9XFxcImZhIGZhLWJhcnMgZHJhZy1oYW5kbGVcXFwiPjwvaT4gPHNwYW4gY2xhc3M9XFxcIm5vZGUtbmFtZVxcXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29udGVudCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3NwYW4+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oYXNDaGlsZHJlbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wic2VsZWN0aW9uLXBvb2xcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJoZWlnaHQ6XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlaWdodCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjtcIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwicm93IHNlbGVjdGlvbi1wb29sLXNlYXJjaFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS0xMlxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWxlY3Rpb24tcG9vbC1zZWFyY2gtZmllbGRcXFwiPlxcbiAgICAgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJzZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lcy1jaXJjbGVcXFwiPjwvaT48L2E+XFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIHZhbHVlPVxcXCJcXFwiIHBsYWNlaG9sZGVyPVxcXCJFbnRlciBrZXl3b3JkcyB0byBzZWFyY2ggdGhlIGxpc3RcXFwiIGNsYXNzPVxcXCJzZWFyY2ggZm9ybS1jb250cm9sXFxcIj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPVxcXCJyb3cgc2VsZWN0aW9uLXBvb2wtbGlzdHNcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtc20tNlxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhdmFpbGFibGUtcG9vbCBkcm9wcGFibGUtcG9vbFxcXCIgZGF0YS1hY2NlcHQ9XFxcIi5zZWxlY3RlZC1wb29sIC5kcmFnZ2FibGUtdHJlZS1ub2RlXFxcIiBzdHlsZT1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWlnaHQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+PC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtc20tNlxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWxlY3RlZC1wb29sIGRyb3BwYWJsZS1wb29sXFxcIiBkYXRhLWFjY2VwdD1cXFwiLmF2YWlsYWJsZS1wb29sIC5kcmFnZ2FibGUtdHJlZS1ub2RlXFxcIiBzdHlsZT1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWlnaHQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+PC9kaXY+XFxuICAgIDwvZGl2PlxcbjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ0YWJsZS1hY3Rpdml0eS1pbmRpY2F0b3Itcm93XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwic3R5bGU9XFxcImhlaWdodDpcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVpZ2h0IDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwicHhcXFwiXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiPHRkIGNsYXNzPVxcXCJhY3Rpdml0eS1pbmRpY2F0b3Itcm93XFxcIiBjb2xzcGFuPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb2x1bW5zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sZW5ndGggOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlaWdodCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlxcblxcblx0PGRpdiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWRpbW1lclxcXCI+XFxuXHRcdFxcblx0XHQ8c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yXFxcIj48L3NwYW4+XFxuXFxuXHQ8L2Rpdj5cXG5cXG48L3RkPlwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ0YWJsZS1uby1pdGVtc1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPHRkIGNvbHNwYW49XFxcIlwiXG4gICAgKyBhbGlhczEoY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb2x1bW5zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sZW5ndGggOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcblx0XCJcbiAgICArIGFsaWFzMSgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJtZXNzYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcbjwvdGQ+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFibGUtdmlldy1mb290ZXJcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudG90YWxQYWdlcyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG90YWxQYWdlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInRvdGFsUGFnZXNcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwicGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXMyPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPHRkIGNvbHNwYW49XFxcIlwiXG4gICAgKyBhbGlhczEoY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb2x1bW5zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sZW5ndGggOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIGNsYXNzPVxcXCJwYWdlLXRvdGFsc1xcXCI+XFxuICAgIFBhZ2UgXCJcbiAgICArIGFsaWFzMSgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMyLHtcIm5hbWVcIjpcInBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIG9mIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMiwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG90YWxQYWdlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPC90ZD5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ0YWJsZS12aWV3LWdyb3VwXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPVxcXCJidXR0b25zLXdyYXBwZXIgcHVsbC1yaWdodFxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9ucyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLChvcHRpb25zPXtcIm5hbWVcIjpcImJ1dHRvbnNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5idXR0b25zKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiPC9kaXY+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0PGEgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhyZWYgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhyZWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDUsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9hPlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJjbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5idXR0b25DbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKTtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlckNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIxMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb25UYWcgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uVGFnIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvblRhZ1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRlc2NyaXB0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiZGVzY3JpcHRpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb25UYWcgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uVGFnIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvblRhZ1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XFxuXCI7XG59LFwiMTNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdFx0XHQ8dGggc2NvcGU9XFxcImNvbFxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC53aWR0aCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5pcyB8fCAoZGVwdGgwICYmIGRlcHRoMC5pcykgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5vcmRlciA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaXNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+XFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTgsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDIwLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdFx0XHQ8L3RoPlxcblwiO1xufSxcIjE0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIndpZHRoPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy53aWR0aCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAud2lkdGggOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJ3aWR0aFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJzb3J0LVwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5zb3J0IDogZGVwdGhzWzFdKSwgZGVwdGgwKSk7XG59LFwiMThcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaWRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwic29ydFxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJuYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2E+XFxuXHRcdFx0XHRcdDxpIGNsYXNzPVxcXCJzb3J0LWljb24gYXNjIGZhIGZhLXNvcnQtYXNjXFxcIj48L2k+XFxuXHRcdFx0XHRcdDxpIGNsYXNzPVxcXCJzb3J0LWljb24gZGVzYyBmYSBmYS1zb3J0LWRlc2NcXFwiPjwvaT5cXG5cIjtcbn0sXCIyMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiBcIlx0XHRcdFx0XHRcIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm5hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJuYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIyMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50b3RhbFBhZ2VzIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50b3RhbFBhZ2VzIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwidG90YWxQYWdlc1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCIyNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwicGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPVxcXCJ0YWJsZS1oZWFkZXJcXFwiPjwvZGl2PlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sZW5ndGggOiBzdGFjazEpLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg5LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPHRhYmxlIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGFibGVDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRhYmxlQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ0YWJsZUNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0PHRoZWFkPlxcblx0XHQ8dHI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29sdW1ucyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29sdW1ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLChvcHRpb25zPXtcIm5hbWVcIjpcImNvbHVtbnNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5jb2x1bW5zKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiXHRcdDwvdHI+XFxuXHQ8L3RoZWFkPlxcblx0PHRib2R5PjwvdGJvZHk+XFxuXHQ8dGZvb3Q+XFxuXHRcdDx0ZCBjb2xzcGFuPVxcXCJcIlxuICAgICsgYWxpYXM0KGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29sdW1ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGVuZ3RoIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwicGFnZS10b3RhbHNcXFwiPlxcblx0XHQgICAgPCEtLSBQYWdlIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJwYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBvZiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRvdGFsUGFnZXMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIyLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSgyNCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIC0tPlxcblx0XHQ8L3RkPlxcblx0PC90Zm9vdD5cXG48L3RhYmxlPlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ0YWJsZS12aWV3LXBhZ2luYXRpb25cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXY+PC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFibGUtdmlldy1yb3dcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PHRkIGRhdGEtaWQ9XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzMygoaGVscGVycy5wcm9wZXJ0eU9mIHx8IChkZXB0aDAgJiYgZGVwdGgwLnByb3BlcnR5T2YpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsZGVwdGhzWzFdLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwicHJvcGVydHlPZlwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSlcbiAgICArIFwiPC90ZD5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYnVmZmVyID0gXG4gIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29sdW1ucyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29sdW1ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY29sdW1uc1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jb2x1bW5zIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb2x1bW5zIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKG9wdGlvbnM9e1wibmFtZVwiOlwiY29sdW1uc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInRhYi1jb250ZW50XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb250ZW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFic1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8IS0tIE5hdiB0YWJzIC0tPlxcbjx1bCBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGFiQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50YWJDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJ0YWJDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiByb2xlPVxcXCJ0YWJsaXN0XFxcIj48L3VsPlxcblxcbjwhLS0gVGFiIHBhbmVzIC0tPlxcbjxkaXYgY2xhc3M9XFxcInRhYi1jb250ZW50XFxcIj48L2Rpdj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJmb3JtLXRleHRhcmVhLWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDksIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwibmFtZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjx0ZXh0YXJlYSBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDExLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5wdXRDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlucHV0Q2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC90ZXh0YXJlYT5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJkcmFnZ2FibGUtdHJlZS12aWV3LW5vZGVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8dWwgY2xhc3M9XFxcImNoaWxkcmVuXFxcIj48L3VsPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGkgY2xhc3M9XFxcImZhIGZhLWJhcnMgZHJhZy1oYW5kbGVcXFwiPjwvaT5cXG5cXG48ZGl2IGNsYXNzPVxcXCJub2RlLW5hbWVcXFwiPlxcbiAgICA8c3Bhbj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJuYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvc3Bhbj5cXG48L2Rpdj5cXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhhc0NoaWxkcmVuIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJuby10cmVlLXZpZXctbm9kZXNcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxwPlRoaXMgdHJlZSBoYXMgbm8gbm9kZXMuPC9wPlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInRyZWUtdmlldy1ub2RlXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPHVsIGNsYXNzPVxcXCJjaGlsZHJlblxcXCI+PC91bD5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm5hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcIm5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oYXNDaGlsZHJlbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibm8tdW5vcmRlcmVkLWxpc3QtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lc3NhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInVub3JkZXJlZC1saXN0LWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbnRlbnQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ3aXphcmQtYnV0dG9uc1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kaXNhYmxlZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuICAgICAgICAgICAgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXG4gICAgICAgIDwvYnV0dG9uPlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uZGlzYWJsZWRDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKTtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kaXNhYmxlZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuICAgICAgICAgICAgXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG4gICAgICAgIDwvYnV0dG9uPlxcblwiO1xufSxcIjdcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiIDxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtbGVmdC1idXR0b25zIHB1bGwtbGVmdFxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGVmdEJ1dHRvbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxlZnRCdXR0b25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKG9wdGlvbnM9e1wibmFtZVwiOlwibGVmdEJ1dHRvbnNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmxlZnRCdXR0b25zKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XFxcIndpemFyZC1yaWdodC1idXR0b25zIHB1bGwtcmlnaHRcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnJpZ2h0QnV0dG9ucyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucmlnaHRCdXR0b25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKG9wdGlvbnM9e1wibmFtZVwiOlwicmlnaHRCdXR0b25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5yaWdodEJ1dHRvbnMpIHsgc3RhY2sxID0gYWxpYXM0LmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIndpemFyZC1lcnJvclwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlclRhZ05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlclRhZ05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclRhZ05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXIgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlclRhZ05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlclRhZ05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclRhZ05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLWVycm9yLWljb25cXFwiPjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5lcnJvckljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmVycm9ySWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImVycm9ySWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT48L2Rpdj5cIjtcbn0sXCI1XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPHA+XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZXNzYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibWVzc2FnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9wPlwiO1xufSxcIjdcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiICAgIDx1bCBjbGFzcz1cXFwid2l6YXJkLWVycm9yLWxpc3RcXFwiPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmVycm9ycyA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg4LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgICAgPC91bD5cXG5cIjtcbn0sXCI4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgICAgIDxsaT5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYShkZXB0aDAsIGRlcHRoMCkpXG4gICAgKyBcIjwvbGk+XFxuXCI7XG59LFwiMTBcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYmFja0J1dHRvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYmFja0J1dHRvbkNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiYmFja0J1dHRvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcbiAgICAgICAgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5iYWNrQnV0dG9uSWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbiAgICAgICAgXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJhY2tCdXR0b25MYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYmFja0J1dHRvbkxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJiYWNrQnV0dG9uTGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxuICAgIDwvYnV0dG9uPlxcblwiO1xufSxcIjExXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5iYWNrQnV0dG9uSWNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYmFja0J1dHRvbkljb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJiYWNrQnV0dG9uSWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZXJyb3JJY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDUsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZXJyb3JzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnNob3dCYWNrQnV0dG9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wid2l6YXJkLXByb2dyZXNzXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiICAgIDxhIGNsYXNzPVxcXCJ3aXphcmQtc3RlcCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuY29tcGxldGUgOiBzdGFjazEpLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCIgZGF0YS1zdGVwPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5vcHRpb25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zdGVwIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEudGl0bGUgOiBzdGFjazEpLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGFiZWwgOiBzdGFjazEpLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDEwLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgICAgPC9hPlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uY29tcGxldGVDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKTtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmRpc2FibGVkQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSk7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJ0aXRsZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEudGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwid2l6YXJkLXN0ZXAtbGFiZWxcXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxhYmVsIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9zcGFuPlxcblwiO1xufSxcIjEwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEudGl0bGUgOiBzdGFjazEpLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDExLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCIxMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIndpemFyZC1zdGVwLWxhYmVsXFxcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5vcHRpb25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS50aXRsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvc3Bhbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtcHJvZ3Jlc3MtYmFyXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5zdGVwcyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc3RlcHMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJzdGVwc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLnN0ZXBzKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIndpemFyZC1zdWNjZXNzXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjxcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlciB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtc3VjY2Vzcy1pY29uXFxcIj48aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuc3VjY2Vzc0ljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnN1Y2Nlc3NJY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwic3VjY2Vzc0ljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L2k+PC9kaXY+XCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8cD5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZXNzYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibWVzc2FnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3A+XCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc3VjY2Vzc0ljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wid2l6YXJkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBhbmVsQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYW5lbENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInBhbmVsQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcInBhbmVsLWJvZHlcXFwiPlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICAgICAgPFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlckNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCI1XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIiAgICAgICAgICAgIDxwPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRlc2NyaXB0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcIndpemFyZC1idXR0b25zXFxcIj48L2Rpdj5cXG48L2Rpdj5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtYnV0dG9uc1xcXCI+PC9kaXY+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYW5lbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwid2l6YXJkLXByb2dyZXNzXFxcIj48L2Rpdj5cXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIndpemFyZC1jb250ZW50XFxcIj48L2Rpdj5cXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBhbmVsIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSg5LCBkYXRhLCAwKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pOyIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LkhhbmRsZWJhcnNIZWxwZXJzUmVnaXN0cnkgPSBmYWN0b3J5KHJvb3QuSGFuZGxlYmFycyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoSGFuZGxlYmFycykge1xuXG4gICAgdmFyIGlzQXJyYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgdmFyIEV4cHJlc3Npb25SZWdpc3RyeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV4cHJlc3Npb25zID0gW107XG4gICAgfTtcblxuICAgIEV4cHJlc3Npb25SZWdpc3RyeS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKG9wZXJhdG9yLCBtZXRob2QpIHtcbiAgICAgICAgdGhpcy5leHByZXNzaW9uc1tvcGVyYXRvcl0gPSBtZXRob2Q7XG4gICAgfTtcblxuICAgIEV4cHJlc3Npb25SZWdpc3RyeS5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uIChvcGVyYXRvciwgbGVmdCwgcmlnaHQpIHtcbiAgICAgICAgaWYgKCAhIHRoaXMuZXhwcmVzc2lvbnMuaGFzT3duUHJvcGVydHkob3BlcmF0b3IpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gb3BlcmF0b3IgXCInK29wZXJhdG9yKydcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvbnNbb3BlcmF0b3JdKGxlZnQsIHJpZ2h0KTtcbiAgICB9O1xuXG4gICAgdmFyIGVSID0gbmV3IEV4cHJlc3Npb25SZWdpc3RyeSgpO1xuICAgIGVSLmFkZCgnbm90JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgIT0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc+JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPiByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJzwnLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA8IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPj0nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA+PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJzw9JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPD0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc9PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ID09IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPT09JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnIT09JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgIT09IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnaW4nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICBpZiAoICEgaXNBcnJheShyaWdodCkpIHtcbiAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmlnaHQuaW5kZXhPZihsZWZ0KSAhPT0gLTE7XG4gICAgfSk7XG5cbiAgICB2YXIgaXNIZWxwZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICBsZWZ0ID0gYXJnc1swXSxcbiAgICAgICAgICAgIG9wZXJhdG9yID0gYXJnc1sxXSxcbiAgICAgICAgICAgIHJpZ2h0ID0gYXJnc1syXSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmdzWzNdO1xuXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYXJnc1sxXTtcbiAgICAgICAgICAgIGlmIChsZWZ0KSByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT0gMykge1xuICAgICAgICAgICAgcmlnaHQgPSBhcmdzWzFdO1xuICAgICAgICAgICAgb3B0aW9ucyA9IGFyZ3NbMl07XG4gICAgICAgICAgICBpZiAobGVmdCA9PSByaWdodCkgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVSLmNhbGwob3BlcmF0b3IsIGxlZnQsIHJpZ2h0KSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9O1xuXG4gICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaXMnLCBpc0hlbHBlcik7XG5cbiAgICByZXR1cm4gZVI7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydoYW5kbGViYXJzJywgJ3VuZGVyc2NvcmUnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5IYW5kbGViYXJzSGVscGVyc1JlZ2lzdHJ5ID0gZmFjdG9yeShyb290LkhhbmRsZWJhcnMsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoSGFuZGxlYmFycywgXykge1xuXG4gICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbm90JywgZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcbiAgICBcdHJldHVybiAhdmFsdWUgfHwgdmFsdWUgPT0gMCA/IG9wdGlvbnMuZm4odmFsdWUpIDogZmFsc2U7XG4gICAgfSk7XG4gICAgXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdoYW5kbGViYXJzJykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2hhbmRsZWJhcnMnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5IYW5kbGViYXJzSGVscGVyc1JlZ2lzdHJ5ID0gZmFjdG9yeShyb290LkhhbmRsZWJhcnMpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKEhhbmRsZWJhcnMpIHtcblxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3Byb3BlcnR5T2YnLCBmdW5jdGlvbihvYmplY3QsIHByb3ApIHtcbiAgICAgICAgaWYob2JqZWN0Lmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhvYmplY3RbcHJvcF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZScsICdiYWNrYm9uZS5tYXJpb25ldHRlJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lLCBNYXJpb25ldHRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXG4gICAgVG9vbGJveC5UcmVlID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG4gICAgICAgIGhhc1Jlc2V0T25jZTogZmFsc2UsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wYXJhdG9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uQ2xhc3M6IEJhY2tib25lLkNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDb2xsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpZEF0dHJpYnV0ZTogJ2lkJyxcbiAgICAgICAgICAgICAgICBwYXJlbnRBdHRyaWJ1dGU6ICdwYXJlbnRfaWQnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIEJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBbXSwgdGhpcy5vcHRpb25zID0gb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFRvb2xib3guT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMpO1xuXG4gICAgICAgICAgICBpZighdGhpcy5nZXRPcHRpb24oJ29yaWdpbmFsQ29sbGVjdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9yaWdpbmFsQ29sbGVjdGlvbiA9IGNvbGxlY3Rpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMudGVtcGxhdGUgJiYgIXRoaXMuZ2V0T3B0aW9uKCdjaGlsZFZpZXdPcHRpb25zJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuY2hpbGRWaWV3T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uKCdhZnRlcjppbml0aWFsaXplJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idWlsZFRyZWUoY29sbGVjdGlvbik7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBIYWNrIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IENvbGxlY3Rpb24gZnVuY3Rpb25hbGl0eVxuICAgICAgICAgICAgLy8gaW5oZXJpdGVkIGJ5IHRoZSBwcm90b3R5cGUuXG4gICAgICAgICAgICBpZighdGhpcy5oYXNSZXNldE9uY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1Jlc2V0T25jZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdhZnRlcjppbml0aWFsaXplJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBCYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5yZXNldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkVHJlZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuXG4gICAgICAgICAgICBpZihkYXRhLnRvSlNPTikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvSlNPTigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fY3JlYXRlQ29sbGVjdGlvbihkYXRhKTtcblxuICAgICAgICAgICAgdmFyIGNvdW50ID0gMCwgdG90YWxBdHRlbXB0cyA9IGRhdGEubGVuZ3RoO1xuXG4gICAgICAgICAgICB3aGlsZSAoZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gZGF0YS50b0FycmF5KCk7XG5cbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoaXRlbXNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHRoaXMuZ2V0UGFyZW50SWQoaXRlbXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZmluZE5vZGVCeUlkKHBhcmVudElkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoXy5pc051bGwocGFyZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5yZW1vdmUodGhpcy5hcHBlbmROb2RlKGl0ZW1zW2ldKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYXJlbnQgPSB0aGlzLmZpbmROb2RlQnlJZChwYXJlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnJlbW92ZSh0aGlzLmFwcGVuZE5vZGUoaXRlbXNbaV0sIHBhcmVudCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoY291bnQgPiB0b3RhbEF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHRyZWUgY291bGQgbm90IGJlIGdlbmVyYXRlZC4gSW5maW5pdGUgbG9vcCBkZXRlY3RlZCB3aXRoIHRoZSByZW1haW5pbmcgbW9kZWxzOiBcIicrZGF0YS5wbHVjaygnaWQnKSsnXCInKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldE9wdGlvbjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgaWYoIV8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zW25hbWVdKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbbmFtZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFBhcmVudElkOiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgaWYoIW1vZGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ3BhcmVudEF0dHJpYnV0ZScpKSB8fCBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElkOiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignaWRBdHRyaWJ1dGUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVvcmRlcjogZnVuY3Rpb24oY29sbGVjdGlvbikge1xuICAgICAgICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb24gfHwgdGhpcztcblxuICAgICAgICAgICAgY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsLCBpKSB7XG4gICAgICAgICAgICAgICAgbW9kZWwuc2V0KHRoaXMuY29tcGFyYXRvciwgaSArIDEpO1xuXG4gICAgICAgICAgICAgICAgaWYobW9kZWwuY2hpbGRyZW4gJiYgbW9kZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVvcmRlcihtb2RlbC5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kTm9kZXM6IGZ1bmN0aW9uKGNoaWxkcmVuLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIF8uZWFjaChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZE5vZGUoY2hpbGQsIHBhcmVudCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmROb2RlOiBmdW5jdGlvbihjaGlsZCwgcGFyZW50LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgICAgICAgICAgY2hpbGQuY2hpbGRyZW4gfHwgKGNoaWxkLmNoaWxkcmVuID0gdGhpcy5fY3JlYXRlQ29sbGVjdGlvbigpKTtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVOb2RlKGNoaWxkKTtcblxuICAgICAgICAgICAgaWYocGFyZW50KSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuc2V0KHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnRBdHRyaWJ1dGUnKSwgcGFyZW50LmdldCh0aGlzLmdldE9wdGlvbignaWRBdHRyaWJ1dGUnKSkpO1xuICAgICAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbi5hZGQoY2hpbGQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuc2V0KHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnRBdHRyaWJ1dGUnKSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQoY2hpbGQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kTm9kZUJlZm9yZTogZnVuY3Rpb24oY2hpbGQsIHNpYmxpbmcpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHRoaXMuZ2V0UGFyZW50SWQoc2libGluZyk7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gcGFyZW50SWQgPyB0aGlzLmZpbmQoe2lkOiBwYXJlbnRJZH0pIDogbnVsbDtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHBhcmVudCA/IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHNpYmxpbmcpIDogdGhpcy5pbmRleE9mKHNpYmxpbmcpO1xuXG4gICAgICAgICAgICB0aGlzLmFwcGVuZE5vZGUoY2hpbGQsIHBhcmVudCwge1xuICAgICAgICAgICAgICAgIGF0OiBpbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmROb2RlQWZ0ZXI6IGZ1bmN0aW9uKGNoaWxkLCBzaWJsaW5nKSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB0aGlzLmdldFBhcmVudElkKHNpYmxpbmcpO1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZmluZCh7aWQ6IHBhcmVudElkfSk7XG5cbiAgICAgICAgICAgIGlmKHBhcmVudElkICYmIHBhcmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kTm9kZShjaGlsZCwgcGFyZW50LCB7XG4gICAgICAgICAgICAgICAgICAgIGF0OiBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihzaWJsaW5nKSArIDFcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kTm9kZShjaGlsZCwgbnVsbCwge1xuICAgICAgICAgICAgICAgICAgICBhdDogdGhpcy5pbmRleE9mKHNpYmxpbmcpICsgMVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTm9kZTogZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gdGhpcy5nZXRQYXJlbnRJZChub2RlKTtcblxuICAgICAgICAgICAgaWYocGFyZW50SWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5maW5kKHtpZDogcGFyZW50SWR9KTtcblxuICAgICAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbi5yZW1vdmUobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uKGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBmaWx0ZXIoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IF8uZmlsdGVyKGNvbGxlY3Rpb24ubW9kZWxzLCBpdGVyYXRlZSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBpZihtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGNvbGxlY3Rpb24ubW9kZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IGNvbGxlY3Rpb24ubW9kZWxzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKG1vZGVsLmNoaWxkcmVuICYmIG1vZGVsLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gZmlsdGVyKG1vZGVsLmNoaWxkcmVuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXIodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZDogZnVuY3Rpb24oaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmQoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IF8uZmluZChjb2xsZWN0aW9uLm1vZGVscywgaXRlcmF0ZWUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgICAgICAgaWYobW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBjb2xsZWN0aW9uLm1vZGVscykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm93ID0gY29sbGVjdGlvbi5tb2RlbHNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYocm93LmNoaWxkcmVuICYmIHJvdy5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9IGZpbmQocm93LmNoaWxkcmVuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZpbmQodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2hlcmU6IGZ1bmN0aW9uKGF0dHJpYnV0ZXMsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmQuY2FsbCh0aGlzLCBhdHRyaWJ1dGVzLCBjb250ZXh0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kUGFyZW50Tm9kZTogZnVuY3Rpb24oY2hpbGQsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmROb2RlQnlJZCh0aGlzLmdldFBhcmVudElkKGNoaWxkKSwgY29sbGVjdGlvbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZE5vZGU6IGZ1bmN0aW9uKGNoaWxkLCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kTm9kZUJ5SWQodGhpcy5nZXRJZChjaGlsZCksIGNvbGxlY3Rpb24pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmROb2RlQnlJZDogZnVuY3Rpb24oaWQsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24gfHwgKGNvbGxlY3Rpb24gPSB0aGlzKTtcbiAgICAgICAgICAgIHZhciBtb2RlbHMgPSBjb2xsZWN0aW9uLnRvQXJyYXkoKTtcblxuICAgICAgICAgICAgZm9yKHZhciBpIGluIG1vZGVscykge1xuICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IG1vZGVsc1tpXTtcblxuICAgICAgICAgICAgICAgIGlmKGlkID09IHRoaXMuZ2V0SWQobW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihtb2RlbC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuZmluZE5vZGVCeUlkKGlkLCBtb2RlbC5jaGlsZHJlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIV8uaXNOdWxsKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9KU09OOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHBhcnNlKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gW107XG5cbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gbW9kZWwudG9KU09OKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYobW9kZWwuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmNoaWxkcmVuID0gcGFyc2UobW9kZWwuY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcm93LnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlKHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnRvSlNPTigpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY3JlYXRlQ29sbGVjdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIENvbGxlY3Rpb24gPSB0aGlzLmdldE9wdGlvbignY29sbGVjdGlvbkNsYXNzJykgfHwgQmFja2JvbmUuQ29sbGVjdGlvbjtcblxuICAgICAgICAgICAgZGF0YSA9IG5ldyBDb2xsZWN0aW9uKGRhdGEgfHwgW10pO1xuXG4gICAgICAgICAgICBkYXRhLmNvbXBhcmF0b3IgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2NvbXBhcmF0b3InKSkge1xuICAgICAgICAgICAgICAgIGRhdGEuY29tcGFyYXRvciA9IHRoaXMuZ2V0T3B0aW9uKCdjb21wYXJhdG9yJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUucmFkaW8nLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5yYWRpbycpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuQmFja2JvbmUuUmFkaW8sIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlZpZXcgPSBNYXJpb25ldHRlLlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYXJpb25ldHRlLlZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gVG9vbGJveC5PcHRpb25zKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucywgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbE5hbWUnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsTmFtZScpIHx8ICd0b29sYm94JztcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbCcpIHx8IFJhZGlvLmNoYW5uZWwodGhpcy5jaGFubmVsTmFtZSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZScsICdiYWNrYm9uZS5yYWRpbycsICdiYWNrYm9uZS5tYXJpb25ldHRlJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLnJhZGlvJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSwgcm9vdC5CYWNrYm9uZS5SYWRpbywgcm9vdC5NYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQ29sbGVjdGlvblZpZXcgPSBNYXJpb25ldHRlLkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFyaW9uZXR0ZS5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBUb29sYm94Lk9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbE5hbWUnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsTmFtZScpIHx8ICdnbG9iYWwnO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gXy5yZXN1bHQodGhpcywgJ2NoYW5uZWwnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsJykgfHwgUmFkaW8uY2hhbm5lbCh0aGlzLmNoYW5uZWxOYW1lKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQmFzZUZpZWxkID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZm9ybU1vZGVsOiBmYWxzZSxcblxuICAgICAgICBjbGFzc05hbWU6ICdmb3JtLWdyb3VwJyxcblxuICAgICAgICBkZWZhdWx0VHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdmb2N1cyB7e3RyaWdnZXJTZWxlY3Rvcn19Jzoge1xuICAgICAgICAgICAgICAgIGV2ZW50OiAnZm9jdXMnLFxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdibHVyIHt7dHJpZ2dlclNlbGVjdG9yfX0nOiB7XG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdibHVyJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY2xpY2sge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAna2V5dXAge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTp1cCcsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2tleWRvd24ge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTpkb3duJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAna2V5cHJlc3Mge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTpwcmVzcycsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHt9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBpZDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBuYW1lOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbENsYXNzTmFtZTogJ2NvbnRyb2wtbGFiZWwnLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb25DbGFzc05hbWU6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJUYWdOYW1lOiAnaDQnLFxuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAnaW5wdXQnLFxuICAgICAgICAgICAgdXBkYXRlTW9kZWw6IHRydWVcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJzID0gXy5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdFRyaWdnZXJzKCksIHRoaXMudHJpZ2dlcnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERlZmF1bHRUcmlnZ2VyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIGRlZmF1bHRUcmlnZ2VycyA9IHt9O1xuXG4gICAgICAgICAgICBfLmVhY2godGhpcy5kZWZhdWx0VHJpZ2dlcnMsIGZ1bmN0aW9uKHRyaWdnZXIsIGtleSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0Lm9wdGlvbnMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgPSBrZXkucmVwbGFjZSgne3snK25hbWUrJ319JywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0VHJpZ2dlcnNba2V5LnRyaW0oKV0gPSB0cmlnZ2VyO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VHJpZ2dlcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGQoKS5ibHVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkuZm9jdXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldElucHV0VmFsdWUodGhpcy5nZXRPcHRpb24oJ3ZhbHVlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzYXZlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZ2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3VwZGF0ZU1vZGVsJykgPT09IHRydWUgJiYgdGhpcy5tb2RlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KHRoaXMuZ2V0T3B0aW9uKCduYW1lJyksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRJbnB1dFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbigkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpLFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSwgcm9vdC5NYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5CbG9ja0Zvcm1FcnJvciA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLWVycm9yJyksXG5cbiAgICAgICAgdGFnTmFtZTogJ3NwYW4nLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2hlbHAtYmxvY2snLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBpbnB1dCBmaWVsZCBuYW1lXG4gICAgICAgICAgICBmaWVsZDogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgVGhlIGlucHV0IGZpZWxkIGVycm9yc1xuICAgICAgICAgICAgZXJyb3JzOiBbXSxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIElmIHRydWUgZXJyb3JzIHdpbGwgaGF2ZSA8YnI+IHRhZ3MgdG8gYnJlYWsgZXJyb3IgaW50byBuZXdsaW5lc1xuICAgICAgICAgICAgbmV3bGluZTogdHJ1ZVxuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmKCFfLmlzQXJyYXkob3B0aW9ucy5lcnJvcnMpKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcnMgPSBbb3B0aW9ucy5lcnJvcnNdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBUb29sYm94LklubGluZUZvcm1FcnJvciA9IFRvb2xib3guQmxvY2tGb3JtRXJyb3IuZXh0ZW5kKHtcblxuICAgICAgICBjbGFzc05hbWU6ICdoZWxwLWlubGluZSdcblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5CYXNlRm9ybSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRhZ05hbWU6ICdmb3JtJyxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ3N1Ym1pdCc6ICdzdWJtaXQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNTdWJtaXR0aW5nOiBmYWxzZSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBBbiBvYmplY3Qgb2YgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgIGFjdGl2aXR5SW5kaWNhdG9yT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3NtYWxsJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGVycm9yIHZpZXcgb2JqZWN0XG4gICAgICAgICAgICBlcnJvclZpZXc6IFRvb2xib3guQmxvY2tGb3JtRXJyb3IsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBlcnJvciB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBlcnJvclZpZXdPcHRpb25zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGdsb2JhbCBlcnJvciB2aWV3IG9iamVjdFxuICAgICAgICAgICAgZ2xvYmFsRXJyb3JzVmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBnbG9iYWwgZXJyb3IgdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgZ2xvYmFsRXJyb3JzT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIHNob3dFbXB0eU1lc3NhZ2U6IGZhbHNlXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgU2hvdyBnbG9iYWwgZXJyb3JzIGFmdGVyIGZvcm0gc3VibWl0c1xuICAgICAgICAgICAgc2hvd0dsb2JhbEVycm9yczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBTaG93IG5vdGlmaWNhdGlvbnMgYWZ0ZXIgZm9ybSBzdWJtaXRzXG4gICAgICAgICAgICBzaG93Tm90aWZpY2F0aW9uczogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIG5vdGlmaWNhdGlvbiB2aWV3IG9iamVjdFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uVmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBub3RpZmljYXRpb24gdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uVmlld09wdGlvbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgZm9ybSBncm91cCBjbGFzcyBuYW1lXG4gICAgICAgICAgICBmb3JtR3JvdXBDbGFzc05hbWU6ICdmb3JtLWdyb3VwJyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGhhcyBlcnJvciBjbGFzcyBuYW1lXG4gICAgICAgICAgICBoYXNFcnJvckNsYXNzTmFtZTogJ2hhcy1lcnJvcicsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBBZGQgdGhlIGhhcyBlcnJvciBjbGFzc2VzIHRvIGZpZWxkc1xuICAgICAgICAgICAgYWRkSGFzRXJyb3JDbGFzczogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIEFkZCB0aGUgaW5saW5lIGZvcm0gZXJyb3JzXG4gICAgICAgICAgICBzaG93SW5saW5lRXJyb3JzOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgcmVkaXJlY3QgdXJsLiBGYWxzZSBpZiBubyByZWRpcmVjdFxuICAgICAgICAgICAgcmVkaXJlY3Q6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgc3VjY2VzcyBtZXNzYWdlIG9iamVjdFxuICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZGVmYXVsdCBzdWNjZXNzIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBkZWZhdWx0U3VjY2Vzc01lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtY2hlY2snLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1N1Y2Nlc3MhJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGZvcm0gd2FzIHN1Y2Nlc3NmdWxseSBzdWJtaXR0ZWQuJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGVycnByIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZGVmYXVsdCBzdWNjZXNzIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBkZWZhdWx0RXJyb3JNZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgaWNvbjogJ2ZhIGZhLXdhcm5pbmcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdhbGVydCcsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdFcnJvciEnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgZm9ybSBjb3VsZCBub3QgYmUgc3VibWl0dGVkLidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfc2VyaWFsaXplZEZvcm06IGZhbHNlLFxuXG4gICAgICAgIF9lcnJvclZpZXdzOiBmYWxzZSxcblxuICAgICAgICBnZXRGb3JtRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZm9ybURhdGEgPSB7fTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaXNBcnJheShrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5ICYmIGtleS5tYXRjaCgvXFxbKFxcZCspP1xcXS8pID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmVhY2godGhpcy4kZWwuc2VyaWFsaXplQXJyYXkoKSwgZnVuY3Rpb24oZmllbGQsIHgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViamVjdCA9IGZvcm1EYXRhLCBsYXN0S2V5LCBtYXRjaGVzID0gZmllbGQubmFtZS5tYXRjaCgvXlxcdyt8XFxbKFxcdyspP1xcXS9nKTtcblxuICAgICAgICAgICAgICAgIF8uZWFjaChtYXRjaGVzLCBmdW5jdGlvbihtYXRjaCwgaSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbWF0Y2gucmVwbGFjZSgvW1xcW1xcXV0vZywgJycpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dEtleSA9IG1hdGNoZXNbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNMYXN0TWF0Y2ggPSBtYXRjaGVzLmxlbmd0aCAtIDEgPT0gaTtcblxuICAgICAgICAgICAgICAgICAgICBpZihpc0FycmF5KG1hdGNoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3QucHVzaChmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0LnNwbGljZShrZXksIDAsIGZpZWxkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFzdWJqZWN0W2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0W2tleV0gPSBuZXh0S2V5ICYmIGlzQXJyYXkobmV4dEtleSkgPyBbXSA6IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc0xhc3RNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3Rba2V5XSA9IGZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0ID0gc3ViamVjdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFzdEtleSA9IGtleTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZm9ybURhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLypcbiAgICAgICAgZ2V0Rm9ybURhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gc3RyaXBCcmFja2V0cyhjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IGNvbXBvbmVudC5tYXRjaCgvW15cXFtcXF1dKy8pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXMgPyBtYXRjaGVzWzBdIDogZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGFkZENvbXBvbmVudChzdWJqZWN0LCBjb21wb25lbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYoIXN1YmplY3RbY29tcG9uZW50XSkge1xuICAgICAgICAgICAgICAgICAgICBzdWJqZWN0W2NvbXBvbmVudF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3ViamVjdFtjb21wb25lbnRdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRDb21wb25lbnRzKHN1YmplY3QsIGNvbXBvbmVudHMsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKGNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCwgaSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFyaWFibGUgPSBzdHJpcEJyYWNrZXRzKGNvbXBvbmVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYodmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3QgPSBhZGRDb21wb25lbnQoc3ViamVjdCwgdmFyaWFibGUsIGNvbXBvbmVudHMubGVuZ3RoID4gaSArIDEgPyB7fSA6IHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gYXJyYXkgbGlrZSBbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU9iamVjdHMocm9vdCwgY29tcG9uZW50cywgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZighZGF0YVtyb290XSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhW3Jvb3RdID0ge307XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYWRkQ29tcG9uZW50cyhkYXRhW3Jvb3RdLCBjb21wb25lbnRzLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0LCBzZWxlY3QsIHRleHRhcmVhJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9ICQodGhpcykuYXR0cignbmFtZScpO1xuXG4gICAgICAgICAgICAgICAgaWYoKCQodGhpcykuaXMoJzpyYWRpbycpIHx8ICQodGhpcykuaXMoJzpjaGVja2JveCcpKSkge1xuICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKG5hbWUgJiYgKCFfLmlzTnVsbCh2YWx1ZSkgJiYgIV8uaXNVbmRlZmluZWQodmFsdWUpKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IG5hbWUubWF0Y2goLyheXFx3Kyk/KFxcWy4qIT9cXF0pLyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJvb3QgPSBtYXRjaGVzWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBtYXRjaGVzWzJdLm1hdGNoKC9cXFsuKj9cXF0vZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU9iamVjdHMocm9vdCwgY29tcG9uZW50cywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2RhdGEnLCB0aGlzLiRlbC5zZXJpYWxpemVBcnJheSgpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG4gICAgICAgICovXG5cbiAgICAgICAgc2hvd0FjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGluZGljYXRvciA9IHRoaXMuJGVsLmZpbmQoJy5mb3JtLWluZGljYXRvcicpO1xuXG4gICAgICAgICAgICBpZih0aGlzLiRpbmRpY2F0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kaW5kaWNhdG9yID0gJCgnPGRpdiBjbGFzcz1cImZvcm0taW5kaWNhdG9yXCI+PC9kaXY+Jyk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLiRlbC5maW5kKCdmb290ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnZm9vdGVyJykuYXBwZW5kKHRoaXMuJGluZGljYXRvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy4kaW5kaWNhdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yID0gbmV3IEJhY2tib25lLk1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kaW5kaWNhdG9yLmdldCgwKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBpbmRpY2F0b3IgPSBuZXcgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvcih0aGlzLmdldE9wdGlvbignYWN0aXZpdHlJbmRpY2F0b3JPcHRpb25zJykpO1xuXG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5zaG93KGluZGljYXRvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuJGVycm9ycykge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0aGlzLiRlcnJvcnMsIGZ1bmN0aW9uKCRlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAkZXJyb3IucGFyZW50cygnLicrdGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmdldEZvcm1EYXRhKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0Zvcm1DaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9zZXJpYWxpemVkRm9ybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlcmlhbGl6ZWRGb3JtICE9PSB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUdsb2JhbEVycm9yc1JlZ2lvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdnbG9iYWxFcnJvcnNWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guVW5vcmRlcmVkTGlzdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kZ2xvYmFsRXJyb3JzID0gJCgnPGRpdiBjbGFzcz1cImdsb2JhbC1lcnJvcnNcIj48L2Rpdj4nKTtcblxuICAgICAgICAgICAgdGhpcy5hcHBlbmRHbG9iYWxFcnJvclJlZ2lvblRvRG9tKHRoaXMuJGdsb2JhbEVycm9ycyk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsRXJyb3JzID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kZ2xvYmFsRXJyb3JzLmdldCgwKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBlcnJvcnNWaWV3ID0gbmV3IFZpZXcoXy5leHRlbmQodGhpcy5nZXRPcHRpb24oJ2dsb2JhbEVycm9yc09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICB0aGlzLmdsb2JhbEVycm9ycy5zaG93KGVycm9yc1ZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZEdsb2JhbEVycm9yUmVnaW9uVG9Eb206IGZ1bmN0aW9uKCRnbG9iYWxFcnJvcnMpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnByZXBlbmQoJGdsb2JhbEVycm9ycyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uOiBmdW5jdGlvbihub3RpY2UpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ25vdGlmaWNhdGlvblZpZXcnKTtcblxuICAgICAgICAgICAgaWYoIVZpZXcpIHtcbiAgICAgICAgICAgICAgICBWaWV3ID0gVG9vbGJveC5Ob3RpZmljYXRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHR5cGU6IG5vdGljZS50eXBlID8gbm90aWNlLnR5cGUgOiAnYWxlcnQnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBub3RpY2UudGl0bGUgPyBub3RpY2UudGl0bGUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSA/IG5vdGljZS5tZXNzYWdlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaWNvbjogbm90aWNlLmljb24gPyBub3RpY2UuaWNvbiA6IGZhbHNlXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignbm90aWZpY2F0aW9uVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVFcnJvcjogZnVuY3Rpb24oZmllbGQsIGVycm9yKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXcnKTtcblxuICAgICAgICAgICAgdmFyIG1vZGVsID0gbmV3IEJhY2tib25lLk1vZGVsKCk7XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe30sIHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXdPcHRpb25zJyksIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICAgICAgZXJyb3JzOiBlcnJvclxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkUGFyZW50OiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWVsZChmaWVsZCkucGFyZW50cygnLicgKyB0aGlzLmdldE9wdGlvbignZm9ybUdyb3VwQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICBmaWVsZCA9IGZpZWxkLnJlcGxhY2UoJy4nLCAnXycpO1xuXG4gICAgICAgICAgICB2YXIgJGZpZWxkID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInK2ZpZWxkKydcIl0nKTtcblxuICAgICAgICAgICAgaWYoJGZpZWxkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkZmllbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnIycrZmllbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldElucHV0RmllbGQ6IGZ1bmN0aW9uKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKGZpZWxkKS52YWwodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZEhhc0Vycm9yQ2xhc3NUb0ZpZWxkOiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGRQYXJlbnQoZmllbGQpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVIYXNFcnJvckNsYXNzRnJvbUZpZWxkOiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGRQYXJlbnQoZmllbGQpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVHbG9iYWxFcnJvcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nbG9iYWxFcnJvcnMgJiYgdGhpcy5nbG9iYWxFcnJvcnMuY3VycmVudFZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbEVycm9ycy5jdXJyZW50Vmlldy5jb2xsZWN0aW9uLnJlc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9jdXNPbkZpcnN0RXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gJ2Rpdi4nK3RoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKyc6Zmlyc3QnO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5maW5kKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpXG4gICAgICAgICAgICAgICAgLmZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kRXJyb3JWaWV3VG9HbG9iYWw6IGZ1bmN0aW9uKGVycm9yVmlldykge1xuICAgICAgICAgICAgdGhpcy5nbG9iYWxFcnJvcnMuY3VycmVudFZpZXcuY29sbGVjdGlvbi5hZGQoe1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGVycm9yVmlldy5nZXRPcHRpb24oJ2Vycm9ycycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmRFcnJvclZpZXdUb0ZpZWxkOiBmdW5jdGlvbihlcnJvclZpZXcpIHtcbiAgICAgICAgICAgIGVycm9yVmlldy5yZW5kZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkUGFyZW50KGVycm9yVmlldy5nZXRPcHRpb24oJ2ZpZWxkJykpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChlcnJvclZpZXcuJGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93R2xvYmFsRXJyb3JzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdsb2JhbEVycm9ycygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihfLmlzQXJyYXkodGhpcy5fZXJyb3JWaWV3cykpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2godGhpcy5fZXJyb3JWaWV3cywgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWRkSGFzRXJyb3JDbGFzcycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUhhc0Vycm9yQ2xhc3NGcm9tRmllbGQodmlldy5nZXRPcHRpb24oJ2ZpZWxkJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmxpbmVFcnJvcnMnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlldy4kZWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93RXJyb3I6IGZ1bmN0aW9uKGZpZWxkLCBlcnJvcikge1xuICAgICAgICAgICAgaWYoIXRoaXMuX2Vycm9yVmlld3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lcnJvclZpZXdzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlcnJvclZpZXcgPSB0aGlzLmNyZWF0ZUVycm9yKGZpZWxkLCBlcnJvcik7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93R2xvYmFsRXJyb3JzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZEVycm9yVmlld1RvR2xvYmFsKGVycm9yVmlldyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhZGRIYXNFcnJvckNsYXNzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEhhc0Vycm9yQ2xhc3NUb0ZpZWxkKGZpZWxkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmxpbmVFcnJvcnMnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kRXJyb3JWaWV3VG9GaWVsZChlcnJvclZpZXcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9lcnJvclZpZXdzLnB1c2goZXJyb3JWaWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93RXJyb3JzOiBmdW5jdGlvbihlcnJvcnMpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgXy5lYWNoKGVycm9ycywgZnVuY3Rpb24oZXJyb3IsIGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgdC5zaG93RXJyb3IoZmllbGQsIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzT25GaXJzdEVycm9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZUFjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuaW5kaWNhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IuZW1wdHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFcnJvcnNGcm9tUmVzcG9uc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucmVzcG9uc2VKU09OLmVycm9ycztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZWRpcmVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3JlZGlyZWN0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVkaXJlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHJlZGlyZWN0ID0gdGhpcy5nZXRSZWRpcmVjdCgpO1xuXG4gICAgICAgICAgICBpZihyZWRpcmVjdCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHJlZGlyZWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTdWNjZXNzTm90aWZpY2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSB0aGlzLmNyZWF0ZU5vdGlmaWNhdGlvbihfLmV4dGVuZChcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZGVmYXVsdFN1Y2Nlc3NNZXNzYWdlJyksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3N1Y2Nlc3NNZXNzYWdlJylcbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICBub3RpZmljYXRpb24uc2hvdygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dFcnJvck5vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gdGhpcy5jcmVhdGVOb3RpZmljYXRpb24oXy5leHRlbmQoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ2RlZmF1bHRFcnJvck1lc3NhZ2UnKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZXJyb3JNZXNzYWdlJylcbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICBub3RpZmljYXRpb24uc2hvdygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlcmlhbGl6ZWRGb3JtID0gdGhpcy5zZXJpYWxpemUoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dHbG9iYWxFcnJvcnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlR2xvYmFsRXJyb3JzUmVnaW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRTdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuaGFzRm9ybUNoYW5nZWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZm9ybTpjaGFuZ2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2VyaWFsaXplZEZvcm0gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd05vdGlmaWNhdGlvbnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1N1Y2Nlc3NOb3RpZmljYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3JlZGlyZWN0JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZGlyZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRDb21wbGV0ZTogZnVuY3Rpb24oc3RhdHVzLCBtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTdWJtaXR0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmhpZGVFcnJvcnMoKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZUFjdGl2aXR5SW5kaWNhdG9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRFcnJvcjogZnVuY3Rpb24obW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd05vdGlmaWNhdGlvbnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yTm90aWZpY2F0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9ycyh0aGlzLmdldEVycm9yc0Zyb21SZXNwb25zZShyZXNwb25zZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYoIXRoaXMuaXNTdWJtaXR0aW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1N1Ym1pdHRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FjdGl2aXR5SW5kaWNhdG9yKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmUodGhpcy5nZXRGb3JtRGF0YSgpLCB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzdWJtaXQ6Y29tcGxldGUnLCB0cnVlLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzdWJtaXQ6c3VjY2VzcycsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc3VibWl0OmNvbXBsZXRlJywgZmFsc2UsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3N1Ym1pdDplcnJvcicsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydiYWNrYm9uZSddLCBmdW5jdGlvbihCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm9Vbm9yZGVyZWRMaXN0SXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLXVub3JkZXJlZC1saXN0LWl0ZW0nKSxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0bWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zO1xuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94LlVub3JkZXJlZExpc3RJdGVtID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHRjbGFzc05hbWU6ICd1bm9yZGVyZWQtbGlzdC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKGUsIG9iaikge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrJywgb2JqKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNcblx0XHR9LFxuXG4gICAgICAgIGdldFRlbXBsYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmdldE9wdGlvbigndGVtcGxhdGUnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb29sYm94LlRlbXBsYXRlKCd1bm9yZGVyZWQtbGlzdC1pdGVtJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndGVtcGxhdGUnKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cdFRvb2xib3guVW5vcmRlcmVkTGlzdCA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuXHRcdGNoaWxkVmlldzogVG9vbGJveC5Vbm9yZGVyZWRMaXN0SXRlbSxcblxuXHRcdGNsYXNzTmFtZTogJ3Vub3JkZXJlZC1saXN0JyxcblxuXHRcdHRhZ05hbWU6ICd1bCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKG9iamVjdCkgVGhlIHZpZXcgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGVtcHR5IG1lc3NhZ2Vcblx0XHRcdGVtcHR5TWVzc2FnZVZpZXc6IFRvb2xib3guTm9Vbm9yZGVyZWRMaXN0SXRlbSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGVyZSBhcmUgbm8gbGlzdCBpdGVtc1xuXHRcdFx0ZW1wdHlNZXNzYWdlOiAnVGhlcmUgYXJlIG5vIGl0ZW1zIGluIHRoZSBsaXN0LicsXG5cblx0XHRcdC8vIChib29sKSBTaG93IHRoZSBlbXB0eSBtZXNzYWdlIHZpZXdcblx0XHRcdHNob3dFbXB0eU1lc3NhZ2U6IHRydWVcblx0XHR9LFxuXG5cdFx0Y2hpbGRWaWV3RXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0aWYoIXRoaXMuY29sbGVjdGlvbikge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgZ2V0RW1wdHlWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZih0aGlzLmdldE9wdGlvbignc2hvd0VtcHR5TWVzc2FnZScpKSB7XG5cdCAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZVZpZXcnKTtcblxuXHQgICAgICAgICAgICBWaWV3ID0gVmlldy5leHRlbmQoe1xuXHQgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuXHQgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2UnKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICByZXR1cm4gVmlldztcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2JhY2tib25lJ10sIGZ1bmN0aW9uKEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5Ecm9wZG93bk1lbnVOb0l0ZW1zID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Ryb3Bkb3duLW1lbnUtbm8taXRlbXMnKSxcblxuXHRcdGNsYXNzTmFtZTogJ25vLXJlc3VsdHMnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlcmUgYXJlIG5vIGl0ZW1zIGluIHRoZSBkcm9wZG93biBtZW51JyxcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cdFRvb2xib3guRHJvcGRvd25NZW51SXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuICAgICAgICBjbGFzc05hbWU6ICdkcm9wZG93bi1tZW51LWl0ZW0nLFxuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Ryb3Bkb3duLW1lbnUtaXRlbScpLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdGRpdmlkZXJDbGFzc05hbWU6ICdkaXZpZGVyJ1xuXHRcdH0sXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrJzoge1xuXHRcdFx0XHRldmVudDogJ2NsaWNrJyxcblx0XHRcdFx0cHJldmVudERlZmF1bHQ6IGZhbHNlLFxuXHRcdFx0XHRzdG9wUHJvcGFnYXRpb246IGZhbHNlXG5cdFx0ICAgIH1cblx0XHR9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIGEnOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmKF8uaXNGdW5jdGlvbih0aGlzLm1vZGVsLmdldCgnb25DbGljaycpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmdldCgnb25DbGljaycpLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKCF0aGlzLm1vZGVsLmdldCgnaHJlZicpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdkaXZpZGVyJykgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RpdmlkZXJDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgVG9vbGJveC5Ecm9wZG93bk1lbnVMaXN0ID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94LkRyb3Bkb3duTWVudUl0ZW0sXG5cblx0XHRlbXB0eVZpZXc6IFRvb2xib3guRHJvcGRvd25NZW51Tm9JdGVtcyxcblxuICAgICAgICBjbGFzc05hbWU6ICdkcm9wZG93bi1tZW51JyxcblxuXHRcdHRhZ05hbWU6ICd1bCcsXG5cblx0XHRjaGlsZFZpZXdFdmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKHZpZXcsIGV2ZW50KSB7XG5cblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljaycsIHZpZXcsIGV2ZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5Ecm9wZG93bk1lbnUgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdkcm9wZG93bi1tZW51JyksXG5cblx0XHRjbGFzc05hbWU6ICdkcm9wZG93bicsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG4gICAgICAgIHJlZ2lvbnM6IHtcbiAgICAgICAgICAgIG1lbnU6IHtcbiAgICAgICAgICAgICAgICBlbDogJ3VsLmRyb3Bkb3duLW1lbnUnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2VFbGVtZW50OiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblx0XHRjaGlsZFZpZXdFdmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXNkJywgYXJndW1lbnRzKTtcblxuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignY2xvc2VPbkNsaWNrJykgPT09IHRydWUpIHtcblx0XHRcdFx0XHR0aGlzLmhpZGVNZW51KClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrIC5kcm9wZG93bi10b2dnbGUnOiAndG9nZ2xlOmNsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBbiBhcnJheSBvZiBtZW51IGl0ZW1zIHRvIGJlIGNvbnZlcnRlZCB0byBhIGNvbGxlY3Rpb24uXG4gICAgICAgICAgICBpdGVtczogW10sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgdGV4dFxuXHRcdFx0dG9nZ2xlTGFiZWw6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGNsYXNzIG5hbWVcblx0XHRcdHRvZ2dsZUNsYXNzTmFtZTogJ2Ryb3Bkb3duLXRvZ2dsZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgaWNvbiBjbGFzcyBuYW1lXG5cdFx0XHR0b2dnbGVJY29uQ2xhc3NOYW1lOiAnZmEgZmEtY2FyZXQtZG93bicsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biBtZW51IGNsYXNzIG5hbWVcblx0XHRcdG1lbnVDbGFzc05hbWU6ICdkcm9wZG93bi1tZW51JyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIG9wZW4gY2xhc3MgbmFtZVxuICAgICAgICAgICAgb3BlbkNsYXNzTmFtZTogJ29wZW4nLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgdmlldyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBtZW51IGl0ZW1zIGxzaXRcbiAgICAgICAgICAgIG1lbnVWaWV3Q2xhc3M6IFRvb2xib3guRHJvcGRvd25NZW51TGlzdCxcblxuXHRcdFx0Ly8gKGludHxib29sKSBUaGUgY29sbGVjdGlvbiBsaW1pdFxuXHRcdFx0bGltaXQ6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgb3JkZXIgb2YgdGhlIGNvbGxlY3Rpb24gaXRlbXNcblx0XHRcdG9yZGVyOiAnbmFtZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIEVpdGhlciBhc2Mgb3IgZGVzY1xuXHRcdFx0c29ydDogJ2FzYycsXG5cblx0XHRcdC8vIChib29sKSBDbG9zZSB0aGUgbWVudSBhZnRlciBhbiBpdGVtIGhhcyBiZWVuIGNsaWNrZWRcblx0XHRcdGNsb3NlT25DbGljazogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIEZldGNoIHRoZSBjb2xsZWN0aW9uIHdoZW4gdGhlIGRyb3Bkb3duIG1lbnUgaXMgc2hvd25cblx0XHRcdGZldGNoT25TaG93OiBmYWxzZSxcblxuXHRcdFx0Ly8gKGJvb2wpIFNob3cgYW4gYWN0aXZpdHkgaW5kaWNhdG9yIHdoZW4gZmV0Y2hpbmcgdGhlIGNvbGxlY3Rpb25cblx0XHRcdHNob3dJbmRpY2F0b3I6IHRydWUsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgY2xhc3MgbmFtZVxuXHRcdFx0b3BlbkNsYXNzTmFtZTogJ29wZW4nXG5cdFx0fSxcblxuICAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0VG9vbGJveC5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG5cdFx0XHR0aGlzLm9uKCdmZXRjaCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignc2hvd0luZGljYXRvcicpKSB7XG5cdFx0XHRcdFx0dGhpcy5zaG93SW5kaWNhdG9yKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm9uKCdmZXRjaDpzdWNjZXNzIGZldGNoOmVycm9yJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93SW5kaWNhdG9yJykpIHtcblx0XHRcdFx0XHR0aGlzLmhpZGVJbmRpY2F0b3IoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbih0aGlzLmdldE9wdGlvbignaXRlbXMnKSk7XG4gICAgICAgICAgICB9XG5cdFx0fSxcblxuXHRcdHNob3dJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIEFjdGl2aXR5Vmlld0l0ZW0gPSBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yLmV4dGVuZCh7XG5cdFx0XHRcdHRhZ05hbWU6ICdsaScsXG5cdFx0XHRcdGNsYXNzTmFtZTogJ2FjdGl2aXR5LWluZGljYXRvci1pdGVtJyxcblx0XHRcdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0VG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG5cdFx0XHRcdFx0dGhpcy5vcHRpb25zLmluZGljYXRvciA9ICdzbWFsbCc7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLmFkZENoaWxkKG5ldyBCYWNrYm9uZS5Nb2RlbCgpLCBBY3Rpdml0eVZpZXdJdGVtKTtcblx0XHR9LFxuXG5cdFx0aGlkZUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdmlldyA9IHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoMCk7XG5cblx0XHRcdGlmKHZpZXcgJiYgdmlldyBpbnN0YW5jZW9mIFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IpIHtcblx0XHRcdFx0dGhpcy5jaGlsZHJlbi5yZW1vdmUodGhpcy5jaGlsZHJlbi5maW5kQnlJbmRleCgwKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHNob3dNZW51OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSkucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ29wZW5DbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuXHRcdH0sXG5cblx0XHRoaWRlTWVudTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdvcGVuQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cdFx0fSxcblxuXHRcdGlzTWVudVZpc2libGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSkucGFyZW50KCkuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ29wZW5DbGFzc05hbWUnKSk7XG5cdFx0fSxcblxuXHRcdG9uVG9nZ2xlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoIXRoaXMuaXNNZW51VmlzaWJsZSgpKSB7XG5cdFx0XHRcdHRoaXMuc2hvd01lbnUoKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLmhpZGVNZW51KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBNZW51VmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdtZW51Vmlld0NsYXNzJykgfHwgVG9vbGJveC5Ecm9wZG93bk1lbnVMaXN0O1xuXG4gICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ21lbnUnLCBuZXcgTWVudVZpZXcoe1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvblxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZmV0Y2hPblNob3cnKSkge1xuXHRcdFx0XHR0aGlzLmZldGNoKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGZldGNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdmZXRjaCcpO1xuXG5cdFx0XHR0aGlzLmNvbGxlY3Rpb24uZmV0Y2goe1xuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0bGltaXQ6IHRoaXMuZ2V0T3B0aW9uKCdsaW1pdCcpLFxuXHRcdFx0XHRcdG9yZGVyOiB0aGlzLmdldE9wdGlvbignb3JkZXInKSxcblx0XHRcdFx0XHRzb3J0OiB0aGlzLmdldE9wdGlvbignc29ydCcpLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuXHRcdFx0XHRcdGlmKHNlbGYuZ2V0T3B0aW9uKCdzaG93SW5kaWNhdG9yJykpIHtcblx0XHRcdFx0XHRcdHNlbGYuaGlkZUluZGljYXRvcigpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHNlbGYucmVuZGVyKCk7XG5cdFx0XHRcdFx0c2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDpzdWNjZXNzJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHRzZWxmLnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UcmVlVmlld05vZGUgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBnZXRUZW1wbGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZighdGhpcy5nZXRPcHRpb24oJ3RlbXBsYXRlJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9vbGJveC5UZW1wbGF0ZSgndHJlZS12aWV3LW5vZGUnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCd0ZW1wbGF0ZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRhZ05hbWU6ICdsaScsXG5cbiAgICAgICAgY2xhc3NOYW1lOiAndHJlZS12aWV3LW5vZGUnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiAge1xuICAgICAgICAgICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG4gICAgICAgICAgICBwYXJlbnRBdHRyaWJ1dGU6ICdwYXJlbnRfaWQnLFxuICAgICAgICAgICAgY2hpbGRWaWV3OiBmYWxzZSxcbiAgICAgICAgICAgIGNoaWxkVmlld09wdGlvbnM6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgbm9kZXM6ICcuY2hpbGRyZW4nXG4gICAgICAgIH0sXG5cbiAgICAgICAgYXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdkYXRhLWlkJzogdGhpcy5tb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2lkQXR0cmlidXRlJykpIHx8IHRoaXMubW9kZWwuY2lkLFxuICAgICAgICAgICAgICAgICdkYXRhLXBhcmVudC1pZCc6IHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnRBdHRyaWJ1dGUnKSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LlZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zKTtcblxuICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMubW9kZWw7XG5cbiAgICAgICAgICAgIHRoaXMuY2hpbGRWaWV3T3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB0aGlzLmdldE9wdGlvbignY2hpbGRWaWV3T3B0aW9ucycpIHx8IHt9KTtcblxuICAgICAgICAgICAgaWYodGhpcy5jb2xsZWN0aW9uID0gdGhpcy5nZXROb2Rlc0Zyb21Nb2RlbCh0aGlzLm1vZGVsKSkge1xuICAgICAgICAgICAgICAgIGlmKCF0aGlzLiRlbC5maW5kKCcuY2hpbGRyZW4nKS5odG1sKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLm9uY2UoJ2FkZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93Tm9kZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaGFzQ2hpbGRyZW46ICB0aGlzLmNvbGxlY3Rpb24gPyB0aGlzLmNvbGxlY3Rpb24ubGVuZ3RoID4gMCA6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldE5vZGVzRnJvbU1vZGVsOiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmNoaWxkcmVuO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dOb2RlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbm9kZXMgPSB0aGlzLmdldE5vZGVzRnJvbU1vZGVsKHRoaXMubW9kZWwpO1xuXG4gICAgICAgICAgICBpZihub2RlcyAmJiBub2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZighdGhpcy4kZWwuZmluZCgnLmNoaWxkcmVuJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZCgnPGRpdiBjbGFzcz1cImNoaWxkcmVuXCIvPicpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmhhc1JlZ2lvbignbm9kZXMnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFJlZ2lvbignbm9kZXMnLCAnLmNoaWxkcmVuJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIENoaWxkVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdjaGlsZFZpZXcnKSB8fCBUb29sYm94LlRyZWVWaWV3O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdub2RlcycsIG5ldyBDaGlsZFZpZXcoe1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBub2RlcyxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZ2V0T3B0aW9uKCd0ZW1wbGF0ZScpLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiB0aGlzLmNoaWxkVmlld09wdGlvbnNcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd05vZGVzKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVHJlZVZpZXcgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94LlRyZWVWaWV3Tm9kZSxcblxuICAgICAgICB0YWdOYW1lOiAndWwnLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3RyZWUtdmlldycsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIG5lc3RhYmxlOiB0cnVlXG4gICAgICAgIH0sXG5cbiAgICAgICAgZW1wdHlWaWV3OiBUb29sYm94Lkl0ZW1WaWV3LFxuXG4gICAgICAgIGVtcHR5Vmlld09wdGlvbnM6IHtcbiAgICAgICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCduby10cmVlLXZpZXctbm9kZXMnKVxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkNvbGxlY3Rpb25WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd0cmVlJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSB0aGlzLmdldE9wdGlvbigndHJlZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmNoaWxkVmlld09wdGlvbnMgPSBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgIHRyZWVSb290OiB0aGlzLFxuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2NoaWxkVmlld09wdGlvbnMnKSB8fCB7fSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnanF1ZXJ5JywgJ2JhY2tib25lLm1hcmlvbmV0dGUnLCAnaW50ZXJhY3QuanMnXSwgZnVuY3Rpb24oXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2ludGVyYWN0LmpzJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LiQsIHJvb3QuTWFyaW9uZXR0ZSwgcm9vdC5pbnRlcmFjdCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpIHtcblxuICAgIGZ1bmN0aW9uIGdldElkQXR0cmlidXRlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBfLmlzTnVsbChuZXcgU3RyaW5nKHZhbHVlKS5tYXRjaCgvXmNcXGQrJC8pKSA/ICdpZCcgOiAnY2lkJztcbiAgICB9XG5cbiAgICBUb29sYm94LkRyYWdnYWJsZVRyZWVOb2RlID0gVG9vbGJveC5UcmVlVmlld05vZGUuZXh0ZW5kKHtcblxuICAgICAgICBjbGFzc05hbWU6ICdkcmFnZ2FibGUtdHJlZS1ub2RlJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIFRvb2xib3guVHJlZVZpZXdOb2RlLnByb3RvdHlwZS5kZWZhdWx0T3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGRyYWdnaW5nQ2xhc3NOYW1lOiAnZHJhZ2dpbmcnLFxuICAgICAgICAgICAgICAgIG1lbnVDbGFzc05hbWU6ICdtZW51JyxcbiAgICAgICAgICAgICAgICBtZW51VmlldzogVG9vbGJveC5Ecm9wZG93bk1lbnUsXG4gICAgICAgICAgICAgICAgbWVudVZpZXdPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6ICdkaXYnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZW51SXRlbXM6IFtdLFxuICAgICAgICAgICAgICAgIG5lc3RhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByb290OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndHJlZVJvb3QnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRNZW51Q29udGFpbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcuJyArIHRoaXMuZ2V0T3B0aW9uKCdtZW51Q2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ21lbnVWaWV3JyksIGNvbnRhaW5lciA9IHRoaXMuZ2V0TWVudUNvbnRhaW5lcigpO1xuXG4gICAgICAgICAgICBpZihWaWV3ICYmIGNvbnRhaW5lci5sZW5ndGgpIHtcbiAgICAgICAgXHRcdHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe30sIHRoaXMuZ2V0T3B0aW9uKCdtZW51Vmlld09wdGlvbnMnKSwge1xuICAgICAgICBcdFx0XHRpdGVtczogdGhpcy5nZXRPcHRpb24oJ21lbnVJdGVtcycpXG4gICAgICAgIFx0XHR9KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUgPSBuZXcgTWFyaW9uZXR0ZS5SZWdpb24oe1xuICAgICAgICAgICAgICAgICAgICBlbDogY29udGFpbmVyLmdldCgwKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51LnNob3codmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuXG4gICAgICAgICAgICBpZigkdGFyZ2V0Lmhhc0NsYXNzKCdkcm9wLWJlZm9yZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpiZWZvcmUnLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCR0YXJnZXQuaGFzQ2xhc3MoJ2Ryb3AtYWZ0ZXInKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCR0YXJnZXQuaGFzQ2xhc3MoJ2Ryb3AtY2hpbGRyZW4nKSkge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcCcsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3BNb3ZlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgVG9vbGJveC5Ecm9wem9uZXMoZXZlbnQsIHtcbiAgICAgICAgICAgICAgICBiZWZvcmU6IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdkcm9wLWJlZm9yZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2Ryb3AtYWZ0ZXIgZHJvcC1jaGlsZHJlbicpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWZ0ZXI6IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICQoZXZlbnQuZHJvcHpvbmUuZWxlbWVudCgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdkcm9wLWFmdGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnZHJvcC1iZWZvcmUgZHJvcC1jaGlsZHJlbicpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LmRyb3B6b25lLmVsZW1lbnQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2Ryb3AtY2hpbGRyZW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnZHJvcC1hZnRlciBkcm9wLWJlZm9yZScpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDptb3ZlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ01vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fZ2hvc3RFbGVtZW50LmdldCgwKTtcblxuICAgICAgICAgICAgdmFyIHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCkgKyBldmVudC5keDtcbiAgICAgICAgICAgIHZhciB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApICsgZXZlbnQuZHk7XG5cbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgeCArICdweCwgJyArIHkgKyAncHgpJztcblxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuICAgICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6bW92ZScsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuXG4gICAgICAgICAgICB0aGlzLl9naG9zdEVsZW1lbnQgPSAkKCc8dWwgY2xhc3M9XCJkcmFnZ2FibGUtdHJlZVwiIC8+JylcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCR0YXJnZXQuY2xvbmUoKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGV2ZW50LmludGVyYWN0aW9uLmN1ckNvb3Jkcy5jbGllbnQueCAtICgkdGFyZ2V0LmZpbmQoJy5kcmFnLWhhbmRsZScpLm91dGVyV2lkdGgoKSAvIDIpLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IGV2ZW50LmludGVyYWN0aW9uLmN1ckNvb3Jkcy5jbGllbnQueSAtICgkdGFyZ2V0LmZpbmQoJy5kcmFnLWhhbmRsZScpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkdGFyZ2V0LmNzcygnb3BhY2l0eScsIDApO1xuICAgICAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLl9naG9zdEVsZW1lbnQpO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcmFnOnN0YXJ0JywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ0VuZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5jc3MoJ29wYWNpdHknLCAxMDApO1xuXG4gICAgICAgICAgICB0aGlzLl9naG9zdEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcmFnOmVuZCcsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyYWdFbnRlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW50ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EcmFnTGVhdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkucmVtb3ZlQ2xhc3MoJ2Ryb3AtYmVmb3JlIGRyb3AtYWZ0ZXIgZHJvcC1jaGlsZHJlbicpO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcmFnOmxlYXZlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcERlYWN0aXZhdGU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkucmVtb3ZlQ2xhc3MoJ2Ryb3AtYmVmb3JlIGRyb3AtYWZ0ZXIgZHJvcC1jaGlsZHJlbicpO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmRlYWN0aXZhdGUnLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVHJlZVZpZXdOb2RlLnByb3RvdHlwZS5vbkRvbVJlZnJlc2guY2FsbCh0aGlzKTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCAkZWwgPSB0aGlzLiRlbDtcblxuICAgICAgICAgICAgaW50ZXJhY3QodGhpcy4kZWwuZ2V0KDApLCB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFsbG93RnJvbTogJy5kcmFnLWhhbmRsZSdcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kcmFnZ2FibGUoe1xuICAgICAgICAgICAgICAgICAgICBhdXRvU2Nyb2xsOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvbm1vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6bW92ZScsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25lbmQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOmVuZCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25zdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJhZzpzdGFydCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRyb3B6b25lKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjZXB0OiAnLicgKyB0aGlzLmNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxhcDogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBvbmRyYWdlbnRlcjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW50ZXInLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uZHJhZ2xlYXZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJhZzpsZWF2ZScsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25kcm9wOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJvcCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2Ryb3A6ZGVhY3RpdmF0ZScsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uKCdkcmFnbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGV2ZW50LmRyb3B6b25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2Ryb3A6bW92ZScsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNob3dNZW51KCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdqcXVlcnknLCAnYmFja2JvbmUubWFyaW9uZXR0ZScsICdpbnRlcmFjdC5qcyddLCBmdW5jdGlvbihfLCAkLCBNYXJpb25ldHRlLCBpbnRlcmFjdCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCAkLCBNYXJpb25ldHRlLCBpbnRlcmFjdCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnaW50ZXJhY3QuanMnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuJCwgcm9vdC5NYXJpb25ldHRlLCByb290LmludGVyYWN0KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCAkLCBNYXJpb25ldHRlLCBpbnRlcmFjdCkge1xuXG4gICAgVG9vbGJveC5EcmFnZ2FibGVUcmVlVmlldyA9IFRvb2xib3guVHJlZVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guRHJhZ2dhYmxlVHJlZU5vZGUsXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnZHJhZ2dhYmxlLXRyZWUnLFxuXG4gICAgICAgIGNoaWxkVmlld09wdGlvbnM6IHtcbiAgICAgICAgICAgIGlkQXR0cmlidXRlOiAnaWQnLFxuICAgICAgICAgICAgcGFyZW50QXR0cmlidXRlOiAncGFyZW50X2lkJyxcbiAgICAgICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5EcmFnZ2FibGVUcmVlVmlld1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcEFmdGVyOiBmdW5jdGlvbihldmVudCwgcGFyZW50KSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuY29sbGVjdGlvbi5maW5kTm9kZUJ5SWQoJChldmVudC5kcmFnRXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpKTtcblxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihub2RlLCBwYXJlbnQubW9kZWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcEJlZm9yZTogZnVuY3Rpb24oZXZlbnQsIHBhcmVudCkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmNvbGxlY3Rpb24uZmluZE5vZGVCeUlkKCQoZXZlbnQuZHJhZ0V2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5hcHBlbmROb2RlQmVmb3JlKG5vZGUsIHBhcmVudC5tb2RlbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wQ2hpbGRyZW46IGZ1bmN0aW9uKGV2ZW50LCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5jb2xsZWN0aW9uLmZpbmROb2RlQnlJZCgkKGV2ZW50LmRyYWdFdmVudC50YXJnZXQpLmRhdGEoJ2lkJykpO1xuXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uYXBwZW5kTm9kZShub2RlLCBwYXJlbnQubW9kZWwsIHtcbiAgICAgICAgICAgICAgICBhdDogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdqcXVlcnknLCAnc3Bpbi5qcyddLCBmdW5jdGlvbihfLCAkLCBTcGlubmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sICQsIFNwaW5uZXIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCdzcGluLmpzJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuJCwgcm9vdC5TcGlubmVyKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCAkLCBTcGlubmVyKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2FjdGl2aXR5LWluZGljYXRvcicpLFxuXG4gICAgICAgIHNwaW5uaW5nOiBmYWxzZSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWxGb250U2l6ZTogZmFsc2UsXG4gICAgICAgICAgICBkaW1tZWRCZ0NvbG9yOiBmYWxzZSxcbiAgICAgICAgICAgIGRpbW1lZDogZmFsc2UsXG4gICAgICAgICAgICBhdXRvU3RhcnQ6IHRydWUsXG4gICAgICAgICAgICBwb3NpdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBtaW5IZWlnaHQ6ICcwcHgnLFxuICAgICAgICAgICAgaW5kaWNhdG9yOiB7fSxcbiAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAwLFxuICAgICAgICAgICAgZGVmYXVsdEluZGljYXRvcjoge1xuICAgICAgICAgICAgICAgIGxpbmVzOiAxMSwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgbGVuZ3RoOiAxNSwgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICB3aWR0aDogMywgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxMywgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgY29ybmVyczogNCwgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICAgICAgICAgICAgICByb3RhdGU6IDAsIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDEsIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMwMDAnLCAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXG4gICAgICAgICAgICAgICAgc3BlZWQ6IDEsIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgICAgICAgICAgICAgdHJhaWw6IDQwLCAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIHNoYWRvdzogZmFsc2UsIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XG4gICAgICAgICAgICAgICAgaHdhY2NlbDogdHJ1ZSwgLy8gV2hldGhlciB0byB1c2UgaGFyZHdhcmUgYWNjZWxlcmF0aW9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYWN0aXZpdHktaW5kaWNhdG9yLXNwaW5uZXInLCAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxuICAgICAgICAgICAgICAgIHpJbmRleDogMmU5LCAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcbiAgICAgICAgICAgICAgICB0b3A6ICc1MCUnLCAvLyBUb3AgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XG4gICAgICAgICAgICAgICAgbGVmdDogJzUwJScgLy8gTGVmdCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRQcmVzZXRPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ3RpbnknOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogNCwgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEsIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDQsIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgICAgICAgICAgICAgICAgICBjb3JuZXJzOiAxLCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgICAgICBsYWJlbE9mZnNldDogMTUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnc21hbGwnOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogNywgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEsIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDcsIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgICAgICAgICAgICAgICAgICBjb3JuZXJzOiAxLCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgICAgICBsYWJlbE9mZnNldDogMjAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnbWVkaXVtJzoge1xuICAgICAgICAgICAgICAgICAgICBsaW5lczogMTIsIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IDE0LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMTEsIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgICAgICAgICAgICAgICAgICBjb3JuZXJzOiAxLCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgICAgICBsYWJlbE9mZnNldDogMzAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnbGFyZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogMjgsIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAyMCwgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEsIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiA2MFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LlZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdmFyIHJlc2l6ZVRpbWVyLCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLiRlbC5maW5kKCcuYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsJykuY3NzKHt0b3A6ICcnfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5wb3NpdGlvbkxhYmVsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3NpdGlvbkxhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuc3Bpbm5lciAmJiB0aGlzLmdldE9wdGlvbignbGFiZWwnKSkge1xuICAgICAgICAgICAgICAgIHZhciAkbGFiZWwgPSB0aGlzLiRlbC5maW5kKCcuYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsJyk7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9ICRsYWJlbC5vdXRlckhlaWdodCgpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBUb29sYm94LlZpZXdPZmZzZXQoJGxhYmVsLmdldCgwKSk7XG5cbiAgICAgICAgICAgICAgICAkbGFiZWwuY2hpbGRyZW4oKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRoaXMuc3Bpbm5lci5vcHRzLmxhYmVsT2Zmc2V0IHx8IDBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRMYWJlbDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5hY3Rpdml0eS1pbmRpY2F0b3ItbGFiZWwnKS5odG1sKHRoaXMub3B0aW9ucy5sYWJlbCA9IHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTcGlubmVyT3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdEluZGljYXRvciA9IHRoaXMuZ2V0T3B0aW9uKCdkZWZhdWx0SW5kaWNhdG9yJyk7XG4gICAgICAgICAgICB2YXIgaW5kaWNhdG9yID0gdGhpcy5nZXRPcHRpb24oJ2luZGljYXRvcicpO1xuICAgICAgICAgICAgdmFyIHByZXNldHMgPSB0aGlzLmdldFByZXNldE9wdGlvbnMoKTtcblxuICAgICAgICAgICAgaWYoXy5pc1N0cmluZyhpbmRpY2F0b3IpICYmIHByZXNldHNbaW5kaWNhdG9yXSkge1xuICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHByZXNldHNbaW5kaWNhdG9yXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYodHlwZW9mIGluZGljYXRvciAhPT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgZGVmYXVsdEluZGljYXRvciwgaW5kaWNhdG9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTcGlubmVyRG9tOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcuYWN0aXZpdHktaW5kaWNhdG9yJykuZ2V0KDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyLnNwaW4odGhpcy5nZXRTcGlubmVyRG9tKCkpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzdGFydCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zcGlubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc3RvcCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgc3Bpbm5lciBvYmplY3RcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKHRoaXMuZ2V0U3Bpbm5lck9wdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIC8vIHN0YXJ0IGlmIG9wdGlvbnMuYXV0b1N0YXJ0IGlzIHRydWVcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhdXRvU3RhcnQnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uTGFiZWwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guQnV0dG9uRHJvcGRvd25NZW51ID0gVG9vbGJveC5Ecm9wZG93bk1lbnUuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdidXR0b24tZHJvcGRvd24tbWVudScpLFxuXG5cdFx0Y2hpbGRWaWV3Q29udGFpbmVyOiAndWwnLFxuXG5cdFx0dGFnTmFtZTogJ2RpdicsXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrIC5idG46bm90KC5kcm9wZG93bi10b2dnbGUpJzogJ2J1dHRvbjpjbGljaycsXG5cdFx0XHQnY2xpY2sgLmRyb3Bkb3duLXRvZ2dsZSc6ICd0b2dnbGU6Y2xpY2snXG5cdFx0fSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoYXJyYXkpIEFuIGFycmF5IG9mIG1lbnUgaXRlbXMgdG8gYmUgY29udmVydGVkIHRvIGEgY29sbGVjdGlvbi5cbiAgICAgICAgICAgIGl0ZW1zOiBbXSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIGJ1dHRvbiB0ZXh0XG5cdFx0XHRidXR0b25MYWJlbDogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biBidXR0b24gY2xhc3MgbmFtZVxuXHRcdFx0YnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIHRvZ2dsZSBjbGFzcyBuYW1lXG5cdFx0XHRidXR0b25Ub2dnbGVDbGFzc05hbWU6ICdkcm9wZG93bi10b2dnbGUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gbWVudSBjbGFzcyBuYW1lXG5cdFx0XHRtZW51Q2xhc3NOYW1lOiAnZHJvcGRvd24tbWVudScsXG5cblx0XHRcdC8vIChpbnR8Ym9vbCkgVGhlIGNvbGxlY3Rpb24gbGltaXRcblx0XHRcdGxpbWl0OiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIG9yZGVyIG9mIHRoZSBjb2xsZWN0aW9uIGl0ZW1zXG5cdFx0XHRvcmRlcjogJ25hbWUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBFaXRoZXIgYXNjIG9yIGRlc2Ncblx0XHRcdHNvcnQ6ICdhc2MnLFxuXG5cdFx0XHQvLyAoYm9vbCkgQ2xvc2UgdGhlIG1lbnUgYWZ0ZXIgYW4gaXRlbSBoYXMgYmVlbiBjbGlja2VkXG5cdFx0XHRjbG9zZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBNZW51IGFwcGVhciBhcyBhIFwiZHJvcHVwXCIgaW5zdGVhZCBvZiBhIFwiZHJvcGRvd25cIlxuXHRcdFx0ZHJvcFVwOiBmYWxzZSxcblxuXHRcdFx0Ly8gKGJvb2wpIEZldGNoIHRoZSBjb2xsZWN0aW9uIHdoZW4gdGhlIGRyb3Bkb3duIG1lbnUgaXMgc2hvd25cblx0XHRcdGZldGNoT25TaG93OiBmYWxzZSxcblxuXHRcdFx0Ly8gKGJvb2wpIFNob3cgYW4gYWN0aXZpdHkgaW5kaWNhdG9yIHdoZW4gZmV0Y2hpbmcgdGhlIGNvbGxlY3Rpb25cblx0XHRcdHNob3dJbmRpY2F0b3I6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBTaG93IHRoZSBidXR0b24gYXMgc3BsaXQgd2l0aCB0d28gYWN0aW9ucyBpbnN0ZWFkIG9mIG9uZVxuXHRcdFx0c3BsaXRCdXR0b246IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGNsYXNzIG5hbWVcblx0XHRcdHRvZ2dsZUNsYXNzTmFtZTogJ29wZW4nXG5cdFx0fSxcblxuXHRcdHNob3dNZW51OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5kcm9wZG93bi10b2dnbGUnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuXHRcdH0sXG5cblx0XHRoaWRlTWVudTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5kcm9wZG93bi10b2dnbGUnKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cdFx0fSxcblxuXHRcdGlzTWVudVZpc2libGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSkubGVuZ3RoID4gMDtcblx0XHR9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vQnJlYWRjcnVtYnMgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCduby1icmVhZGNydW1icycpLFxuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdGNsYXNzTmFtZTogJ25vLWJyZWFkY3J1bWJzJ1xuXG5cdH0pO1xuXG5cdFRvb2xib3guQnJlYWRjcnVtYiA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2JyZWFkY3J1bWInKSxcblxuXHRcdHRhZ05hbWU6ICdsaSdcblxuXHR9KTtcblxuXHRUb29sYm94LkJyZWFkY3J1bWJzID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94LkJyZWFkY3J1bWIsXG5cblx0XHRlbXB0eVZpZXc6IFRvb2xib3guTm9CcmVhZGNydW1icyxcblxuXHRcdGNsYXNzTmFtZTogJ2JyZWFkY3J1bWInLFxuXG5cdFx0dGFnTmFtZTogJ29sJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnXG5cdFx0fSxcblxuXHRcdGNvbGxlY3Rpb25FdmVudHM6IHtcblx0XHRcdCdjaGFuZ2UgYWRkIHJlbW92ZSByZXNldCc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgdCA9IHRoaXM7XG5cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0Lm9uRG9tUmVmcmVzaCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRUb29sYm94LkNvbGxlY3Rpb25WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cblx0XHRcdGlmKCF0aGlzLmNvbGxlY3Rpb24pIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0QnJlYWRjcnVtYnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGJyZWFkY3J1bWJzID0gdGhpcy5jb2xsZWN0aW9uID8gdGhpcy5jb2xsZWN0aW9uLnRvSlNPTigpIDogW107XG5cblx0XHRcdGlmKCFfLmlzQXJyYXkoYnJlYWRjcnVtYnMpKSB7XG5cdFx0XHRcdGJyZWFkY3J1bWJzID0gW107XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBicmVhZGNydW1icztcblx0XHR9LFxuXG5cdFx0YWRkQnJlYWRjcnVtYnM6IGZ1bmN0aW9uKGJyZWFkY3J1bWJzKSB7XG5cdFx0XHRpZihfLmlzQXJyYXkoYnJlYWRjcnVtYnMpKSB7XG5cdFx0XHRcdF8uZWFjaChicmVhZGNydW1icywgZnVuY3Rpb24oYnJlYWRjcnVtYikge1xuXHRcdFx0XHRcdHRoaXMuYWRkQnJlYWRjcnVtYihicmVhZGNydW1iKTtcblx0XHRcdFx0fSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0FkZGluZyBtdWx0aXBsZSBicmVhZGNydW1icyBtdXN0IGRvbmUgYnkgcGFzc2luZyBhbiBhcnJheScpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0YWRkQnJlYWRjcnVtYjogZnVuY3Rpb24oYnJlYWRjcnVtYikge1xuXHRcdFx0aWYoXy5pc09iamVjdChicmVhZGNydW1iKSkge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKGJyZWFkY3J1bWIpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdBIGJyZWFkY3J1bWIgbXVzdCBiZSBwYXNzZWQgYXMgYW4gb2JqZWN0Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRzZXRCcmVhZGNydW1iczogZnVuY3Rpb24oYnJlYWRjcnVtYnMpIHtcblx0XHRcdGlmKF8uaXNBcnJheShicmVhZGNydW1icykpIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLnNldChicmVhZGNydW1icyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gc2V0IHRoZSBicmVhZGNydW1icycpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0aW5zZXJ0QnJlYWRjcnVtYjogZnVuY3Rpb24oYnJlYWRjcnVtYikge1xuXHRcdFx0aWYoXy5pc09iamVjdChicmVhZGNydW1iKSkge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24udW5zaGlmdChicmVhZGNydW1iKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignQSBicmVhZGNydW1iIG11c3QgYmUgcGFzc2VkIGFzIGFuIG9iamVjdCcpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0aW5zZXJ0QnJlYWRjcnVtYnM6IGZ1bmN0aW9uKGJyZWFkY3J1bWJzKSB7XG5cdFx0XHR2YXIgdCA9IHRoaXM7XG5cblx0XHRcdGlmKF8uaXNBcnJheShicmVhZGNydW1icykpIHtcblx0XHRcdFx0Xy5lYWNoKGJyZWFkY3J1bWJzLCBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRcdFx0dC5pbnNlcnRCcmVhZGNydW1iKGJyZWFkY3J1bWIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignSW5zZXJ0aW5nIG11bHRpcGxlIGJyZWFkY3J1bWJzIG11c3QgZG9uZSBieSBwYXNzaW5nIGFuIGFycmF5Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRyZW1vdmVCcmVhZGNydW1iczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmNvbGxlY3Rpb24ucmVzZXQoKTtcblx0XHR9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKCF0aGlzLiRlbC5maW5kKCcubm8tYnJlYWRjcnVtYnMnKS5sZW5ndGgpIHtcblx0XHRcdFx0dGhpcy4kZWwucGFyZW50KCkuc2hvdygpO1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnbGk6bGFzdC1jaGlsZCcpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cblx0XHRcdFx0aWYodGhpcy4kZWwuZmluZCgnbGk6bGFzdC1jaGlsZCBhJykubGVuZ3RoKSB7XG5cdFx0XHRcdFx0dGhpcy4kZWwuZmluZCgnbGk6bGFzdC1jaGlsZCcpLmh0bWwodGhpcy4kZWwuZmluZCgnbGk6bGFzdC1jaGlsZCBhJykuaHRtbCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuJGVsLnBhcmVudCgpLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydiYWNrYm9uZSddLCBmdW5jdGlvbihCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5CdXR0b25Hcm91cEl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdidXR0b24tZ3JvdXAtaXRlbScpLFxuXG5cdFx0dGFnTmFtZTogJ2EnLFxuXG5cdFx0Y2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2snOiAnY2xpY2snXG5cdFx0fSxcblxuICAgICAgICBvcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZGlzYWJsZWQgY2xhc3MgbmFtZVxuXHRcdFx0ZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCdcbiAgICAgICAgfSxcblxuXHRcdG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSkpIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsLmdldCgnY2xhc3NOYW1lJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLm1vZGVsLmdldCgnY2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCgnYWN0aXZlJykpIHtcblx0XHRcdFx0dGhpcy4kZWwuY2xpY2soKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5Ob0J1dHRvbkdyb3VwSXRlbXMgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCduby1idXR0b24tZ3JvdXAtaXRlbScpXG5cblx0fSk7XG5cblx0VG9vbGJveC5CdXR0b25Hcm91cCA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuXHRcdGNoaWxkVmlldzogVG9vbGJveC5CdXR0b25Hcm91cEl0ZW0sXG5cblx0XHRlbXB0eVZpZXc6IFRvb2xib3guTm9CdXR0b25Hcm91cEl0ZW1zLFxuXG5cdFx0Y2xhc3NOYW1lOiAnYnRuLWdyb3VwJyxcblxuXHRcdHRhZ05hbWU6ICdkaXYnLFxuXG5cdFx0Y2hpbGRWaWV3RXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiAnb25DaGlsZENsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGFjdGl2ZSBjbGFzcyBuYW1lXG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZGlzYWJsZWQgY2xhc3MgbmFtZVxuXHRcdFx0ZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG5cblx0XHRcdC8vIChib29sKSBBY3RpdmF0ZSB0aGUgYnV0dG9uIG9uIGNsaWNrXG5cdFx0XHRhY3RpdmF0ZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChtaXhlZCkgUGFzcyBhbiBhcnJheSBvZiBidXR0b25zIGluc3RlYWQgb2YgcGFzc2luZyBhIGNvbGxlY3Rpb24gb2JqZWN0LlxuXHRcdFx0YnV0dG9uczogZmFsc2Vcblx0XHR9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKSAmJiAhb3B0aW9ucy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24odGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlSW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZih0aGlzLmNoaWxkcmVuLmZpbmRCeUluZGV4KGluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoaW5kZXgpLiRlbC5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSkuY2xpY2soKTtcblx0XHR9LFxuXG5cdFx0b25DaGlsZENsaWNrOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYoIWNoaWxkLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSkpIHtcbiAgICBcdFx0XHR0aGlzLnRyaWdnZXIoJ2NsaWNrJywgY2hpbGQpO1xuXG4gICAgXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ2FjdGl2YXRlT25DbGljaycpICYmICFjaGlsZC4kZWwuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKSkge1xuICAgIFx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgIFx0XHRcdFx0XHQucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuICAgIFx0XHRcdFx0Y2hpbGQuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICBcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnYWN0aXZhdGUnLCBjaGlsZCk7XG4gICAgXHRcdFx0fVxuICAgICAgICAgICAgfVxuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKCQsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXylcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkNoZWNrYm94RmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLWNoZWNrYm94LWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgb3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdjaGVja2JveCdcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnOmNoZWNrZWQnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKCQodGhpcykudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPiAxID8gdmFsdWVzIDogdmFsdWVzWzBdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldElucHV0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgaWYoIV8uaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gW3ZhbHVlc107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJzpjaGVja2VkJykuYXR0cignY2hlY2tlZCcsIGZhbHNlKTtcblxuICAgICAgICAgICAgXy5lYWNoKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdbdmFsdWU9XCInK3ZhbHVlKydcIl0nKS5hdHRyKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1xuICAgICAgICAgICAgJ3VuZGVyc2NvcmUnLFxuICAgICAgICAgICAgJ2JhY2tib25lJyxcbiAgICAgICAgICAgICdiYWNrYm9uZS5tYXJpb25ldHRlJyxcbiAgICAgICAgICAgICdtb21lbnQnXG4gICAgICAgIF0sIGZ1bmN0aW9uKF8sIEJhY2tib25lLCBNYXJpb25ldHRlLCBtb21lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUsIG1vbWVudClcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ21vbWVudCcpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJvb3QuXyxcbiAgICAgICAgICAgIHJvb3QuQmFja2JvbmUsXG4gICAgICAgICAgICByb290Lk1hcmlvbmV0dGUsXG4gICAgICAgICAgICByb290Lm1vbWVudFxuICAgICAgICApO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlLCBtb21lbnQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guTW9udGhseUNhbGVuZGFyRGF5ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2NhbGVuZGFyLW1vbnRobHktZGF5LXZpZXcnKSxcblxuICAgICAgICB0YWdOYW1lOiAndGQnLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2NhbGVuZGFyLWRheScsXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayc6ICdjbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBtb2RlbEV2ZW50czogIHtcbiAgICAgICAgICAgICdjaGFuZ2UnOiAnbW9kZWxDaGFuZ2VkJ1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vZGVsQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaGFzRXZlbnRzOiB0aGlzLmhhc0V2ZW50cygpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q2VsbEhlaWdodDogZnVuY3Rpb24od2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmNzcygnaGVpZ2h0Jywgd2lkdGggfHwgdGhpcy4kZWwud2lkdGgoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMubW9kZWwuZ2V0KCdkYXRlJyk7XG5cbiAgICAgICAgICAgIGlmKCFkYXRlIGluc3RhbmNlb2YgbW9tZW50KSB7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IG1vbWVudChkYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCgnZXZlbnRzJykgJiYgdGhpcy5tb2RlbC5nZXQoJ2V2ZW50cycpLmxlbmd0aCA+IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nZXREYXRlKCkuaXNTYW1lKG5ldyBEYXRlKCksICdkYXknKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdjYWxlbmRhci10b2RheScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldERhdGUoKS5pc1NhbWUodGhpcy5nZXRPcHRpb24oJ2N1cnJlbnREYXRlJyksICdkYXknKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdjYWxlbmRhci1jdXJyZW50LWRheScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldERhdGUoKS5pc1NhbWUodGhpcy5nZXRPcHRpb24oJ2N1cnJlbnREYXRlJyksICdtb250aCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2NhbGVuZGFyLW1vbnRoJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCgnZXZlbnRzJykgfHwgW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RXZlbnRzOiBmdW5jdGlvbihldmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KCdldmVudHMnLCBldmVudHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZEV2ZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGV4aXN0aW5nID0gXy5jbG9uZSh0aGlzLmdldEV2ZW50cygpKTtcblxuICAgICAgICAgICAgZXhpc3RpbmcucHVzaChldmVudCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0RXZlbnRzKGV4aXN0aW5nKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRFdmVudHM6IGZ1bmN0aW9uKGV2ZW50cykge1xuICAgICAgICAgICAgdmFyIGV4aXN0aW5nID0gXy5jbG9uZSh0aGlzLmdldEV2ZW50cygpKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRFdmVudHMoXy5tZXJnZShleGlzdGluZywgZXZlbnRzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlRXZlbnQ6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKTtcblxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1tpbmRleF07XG5cbiAgICAgICAgICAgIHRoaXMuc2V0RXZlbnRzKGV2ZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RXZlbnRzKFtdKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBUb29sYm94Lk1vbnRobHlDYWxlbmRhcldlZWsgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94Lk1vbnRobHlDYWxlbmRhckRheSxcblxuICAgICAgICB0YWdOYW1lOiAndHInLFxuXG4gICAgICAgIGNoaWxkVmlld0V2ZW50czoge1xuICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKHZpZXcsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkYXk6Y2xpY2snLCB2aWV3LCB0aGlzLCBldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGRheXM6IGZhbHNlLFxuICAgICAgICAgICAgZXZlbnRzOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZighdGhpcy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24odGhpcy5tb2RlbC5nZXQoJ2RheXMnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogZnVuY3Rpb24oY2hpbGQsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXkoaW5kZXgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERheXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdkYXlzJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF5OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIGRheXMgPSB0aGlzLmdldERheXMoKTtcblxuICAgICAgICAgICAgaWYoZGF5c1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF5c1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Rmlyc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmZpcnN0KCkuZ2V0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExhc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmxhc3QoKS5nZXREYXRlKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5Nb250aGx5Q2FsZW5kYXIgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnY2FsZW5kYXItbW9udGhseS12aWV3JyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnY2FsZW5kYXInLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGFsd2F5c1Nob3dTaXhXZWVrczogdHJ1ZSxcbiAgICAgICAgICAgIGZldGNoT25SZW5kZXI6IHRydWUsXG4gICAgICAgICAgICBib2R5VmlldzogVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHRhZ05hbWU6ICd0Ym9keScsXG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94Lk1vbnRobHlDYWxlbmRhcldlZWssXG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3RXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgICdjbGljayc6IGZ1bmN0aW9uKHZpZXcsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3dlZWs6Y2xpY2snLCB2aWV3LCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdkYXk6Y2xpY2snOiBmdW5jdGlvbih2aWV3LCB3ZWVrLCBldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ2NhbGVuZGFyJykudHJpZ2dlck1ldGhvZCgnZGF5OmNsaWNrJywgdmlldywgd2VlaywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBpbmRpY2F0b3JPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAnc21hbGwnLFxuICAgICAgICAgICAgICAgIGRpbW1lZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkaW1tZWRCZ0NvbG9yOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAuNiknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayAuY2FsZW5kYXItbmF2aWdhdGlvbi1wcmV2JzogJ3ByZXY6Y2xpY2snLFxuICAgICAgICAgICAgJ2NsaWNrIC5jYWxlbmRhci1uYXZpZ2F0aW9uLW5leHQnOiAnbmV4dDpjbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgZWw6ICd0Ym9keScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiBmdW5jdGlvbihjaGlsZCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF5czogdGhpcy5nZXRDYWxlbmRhcldlZWsoaW5kZXgpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFF1ZXJ5VmFyaWFibGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuZ2V0Rmlyc3REYXRlKCkuZm9ybWF0KCdZWVlZLU1NLUREIEhILW1tLXNzJyksXG4gICAgICAgICAgICAgICAgZW5kOiB0aGlzLmdldExhc3REYXRlKCkuZm9ybWF0KCdZWVlZLU1NLUREIEhILW1tLXNzJylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmV0Y2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCBwYXJhbXMgPSB0aGlzLmdldFF1ZXJ5VmFyaWFibGVzKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0Q2FjaGVSZXNwb25zZShwYXJhbXMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlQ2FjaGVSZXNwb25zZShwYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdmZXRjaCcsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmZldGNoKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRDYWNoZVJlc3BvbnNlKHBhcmFtcywgY29sbGVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2ZldGNoOmNvbXBsZXRlJywgdHJ1ZSwgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDpzdWNjZXNzJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24obW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2ZldGNoOmNvbXBsZXRlJywgZmFsc2UsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZmV0Y2g6ZXJyb3InLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkZldGNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0FjdGl2aXR5SW5kaWNhdG9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25GZXRjaENvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZUFjdGl2aXR5SW5kaWNhdG9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRXZlbnQ6IGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IG1vZGVsLmdldCgnc3RhcnQnKSB8fCBudWxsLFxuICAgICAgICAgICAgICAgIGVuZDogbW9kZWwuZ2V0KCdlbmQnKSB8fCBudWxsLFxuICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjcmVhdGU6ZXZlbnQnLCBldmVudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Qm9keVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIEJvZHlWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2JvZHlWaWV3Jyk7XG4gICAgICAgICAgICB2YXIgYm9keVZpZXcgPSBuZXcgQm9keVZpZXcoXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICBjYWxlbmRhcjogdGhpc1xuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2JvZHlWaWV3T3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygnYm9keScsIGJvZHlWaWV3KTtcblxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZ2V0Q2FsZW5kYXJXZWVrcygpLCBmdW5jdGlvbih3ZWVrLCBpKSB7XG4gICAgICAgICAgICAgICAgYm9keVZpZXcuYWRkQ2hpbGRWaWV3KGJvZHlWaWV3LmJ1aWxkQ2hpbGRWaWV3KG5ldyBCYWNrYm9uZS5Nb2RlbCh7XG4gICAgICAgICAgICAgICAgICAgIGRheXM6IHdlZWtcbiAgICAgICAgICAgICAgICB9KSwgYm9keVZpZXcuY2hpbGRWaWV3KSwgaSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRheUNsaWNrOiBmdW5jdGlvbihkYXksIHdlZWssIGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoZGF5LmdldERhdGUoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93Qm9keVZpZXcoKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmNhbGVuZGFyLWhlYWRlcicpLmh0bWwodGhpcy5nZXRDYWxlbmRhckhlYWRlcigpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5jYWxlbmRhci1zdWItaGVhZGVyJykuaHRtbCh0aGlzLmdldENhbGVuZGFyU3ViSGVhZGVyKCkpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZmV0Y2hPblJlbmRlcicpKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzLmZldGNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzdG9yZUNhY2hlUmVzcG9uc2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gdGhpcy5nZXRDYWNoZVJlc3BvbnNlKHBhcmFtcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3Jlc3RvcmU6Y2FjaGU6cmVzcG9uc2UnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDYWNoZVJlc3BvbnNlOiBmdW5jdGlvbihwYXJhbXMsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShwYXJhbXMpO1xuXG4gICAgICAgICAgICBpZighY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlc1tzdHJpbmddID0gXy5jbG9uZShjb2xsZWN0aW9uKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzZXQ6Y2FjaGU6cmVzcG9uc2UnLCBjb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXNbc3RyaW5nXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FjaGVSZXNwb25zZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXMgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5jb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXMuaGFzT3duUHJvcGVydHkoc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlc1tzdHJpbmddO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBuZXcgTWFyaW9uZXR0ZS5SZWdpb24oe1xuICAgICAgICAgICAgICAgIGVsOiB0aGlzLiRlbC5maW5kKCcuaW5kaWNhdG9yJylcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKHRoaXMuZ2V0T3B0aW9uKCdpbmRpY2F0b3JPcHRpb25zJykpO1xuXG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5zaG93KHZpZXcpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdpbmRpY2F0b3I6c2hvdycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5lbXB0eSgpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdpbmRpY2F0b3I6aGlkZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlckNvbGxlY3Rpb246IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnYmVmb3JlOnJlbmRlcjpjb2xsZWN0aW9uJywgY29sbGVjdGlvbik7XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwsIGkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSB0aGlzLmNyZWF0ZUV2ZW50KG1vZGVsKTtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IHRoaXMuZ2V0Vmlld0J5RGF0ZShldmVudC5zdGFydCk7XG4gICAgICAgICAgICAgICAgaWYodmlldykge1xuICAgICAgICAgICAgICAgICAgICB2aWV3LmFkZEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnYWZ0ZXI6cmVuZGVyOmNvbGxlY3Rpb24nLCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWaWV3QnlEYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgICBpZighZGF0ZSBpbnN0YW5jZW9mIG1vbWVudCkge1xuICAgICAgICAgICAgICAgIGRhdGUgPSBtb21lbnQoZGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ2JvZHknKS5jdXJyZW50Vmlldy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKHdlZWssIHgpIHtcbiAgICAgICAgICAgICAgICB3ZWVrLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oZGF5LCB5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRheS5nZXREYXRlKCkuaXNTYW1lKGRhdGUsICdkYXknKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoXy5pc051bGwodmlldykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gZGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0V2Vla01vZGVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmFja2JvbmUuTW9kZWwoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDYWxlbmRhckhlYWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRlKCkuZm9ybWF0KCdNTU1NJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJTdWJIZWFkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLnllYXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDYWxlbmRhcldlZWs6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgd2Vla3MgPSB0aGlzLmdldENhbGVuZGFyV2Vla3MoKTtcblxuICAgICAgICAgICAgaWYod2Vla3NbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlZWtzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDYWxlbmRhcldlZWtzOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGRhdGUgfHwgdGhpcy5nZXREYXRlKCk7XG4gICAgICAgICAgICB2YXIgc3RhcnRPZlRoaXNNb250aCA9IGRhdGUuY2xvbmUoKS5zdGFydE9mKCdtb250aCcpO1xuICAgICAgICAgICAgdmFyIGVuZE9mVGhpc01vbnRoID0gZGF0ZS5jbG9uZSgpLmVuZE9mKCdtb250aCcpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWx3YXlzU2hvd1NpeFdlZWtzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZihzdGFydE9mVGhpc01vbnRoLmRheSgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0T2ZUaGlzTW9udGguc3VidHJhY3QoMSwgJ3dlZWsnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZihlbmRPZlRoaXNNb250aC5kYXkoKSA9PT0gNikge1xuICAgICAgICAgICAgICAgICAgICBlbmRPZlRoaXNNb250aC5hZGQoMSwgJ3dlZWsnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlbmRPZlRoaXNNb250aFdlZWsgPSBlbmRPZlRoaXNNb250aC5jbG9uZSgpO1xuXG4gICAgICAgICAgICBpZighZW5kT2ZUaGlzTW9udGguY2xvbmUoKS5lbmRPZignd2VlaycpLmlzU2FtZShzdGFydE9mVGhpc01vbnRoLCAnbW9udGgnKSkge1xuICAgICAgICAgICAgICAgIGVuZE9mVGhpc01vbnRoV2Vlay5lbmRPZignd2VlaycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdG90YWxEYXlzSW5Nb250aCA9IGRhdGUuZGF5c0luTW9udGgoKTtcbiAgICAgICAgICAgIHZhciB0b3RhbERheXNJbkNhbGVuZGFyID0gZW5kT2ZUaGlzTW9udGhXZWVrLmRpZmYoc3RhcnRPZlRoaXNNb250aCwgJ2RheXMnKTtcbiAgICAgICAgICAgIHZhciB0b3RhbFdlZWtzSW5DYWxlbmRhciA9IE1hdGguY2VpbCh0b3RhbERheXNJbkNhbGVuZGFyIC8gNyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhbHdheXNTaG93U2l4V2Vla3MnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmKHRvdGFsV2Vla3NJbkNhbGVuZGFyIDwgNikge1xuICAgICAgICAgICAgICAgICAgICBlbmRPZlRoaXNNb250aFdlZWsuYWRkKDYgLSB0b3RhbFdlZWtzSW5DYWxlbmRhciwgJ3dlZWsnKTtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxXZWVrc0luQ2FsZW5kYXIgKz0gNiAtIHRvdGFsV2Vla3NJbkNhbGVuZGFyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHdlZWtzID0gW107XG5cbiAgICAgICAgICAgIGZvcih2YXIgeCA9IDA7IHggPCB0b3RhbFdlZWtzSW5DYWxlbmRhcjsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRheXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvcih2YXIgeSA9IDA7IHkgPCA3OyB5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gc3RhcnRPZlRoaXNNb250aFxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsb25lKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGQoeCwgJ3dlZWsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0YXJ0T2YoJ3dlZWsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZCh5LCAnZGF5Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF5cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IHN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF5OiBzdGFydC5kYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtb250aDogc3RhcnQubW9udGgoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHllYXI6IHN0YXJ0LnllYXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnREYXRlOiBkYXRlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdlZWtzLnB1c2goZGF5cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB3ZWVrcztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRXZWVrc0luTW9udGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmdldERhdGUoKS5kYXlzSW5Nb250aCgpIC8gNyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Rmlyc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmZpcnN0KCkuZ2V0Rmlyc3REYXRlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGFzdERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4ubGFzdCgpLmdldExhc3REYXRlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2RhdGUnKSB8fCBtb21lbnQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXREYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgICBpZighZGF0ZSBpbnN0YW5jZW9mIG1vbWVudCkge1xuICAgICAgICAgICAgICAgIGRhdGUgPSBtb21lbnQoZGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwcmV2RGF0ZSA9IHRoaXMuZ2V0RGF0ZSgpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGF0ZSA9IGRhdGU7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2RhdGU6c2V0JywgZGF0ZSwgcHJldkRhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRGF0ZVNldDogZnVuY3Rpb24obmV3RGF0ZSwgcHJldkRhdGUpIHtcbiAgICAgICAgICAgIGlmKCFuZXdEYXRlLmlzU2FtZShwcmV2RGF0ZSwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRWaWV3QnlEYXRlKHByZXZEYXRlKS4kZWwucmVtb3ZlQ2xhc3MoJ2NhbGVuZGFyLWN1cnJlbnQtZGF5Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRWaWV3QnlEYXRlKG5ld0RhdGUpLiRlbC5hZGRDbGFzcygnY2FsZW5kYXItY3VycmVudC1kYXknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZpZXcgPSB0aGlzLmdldFZpZXdCeURhdGUobmV3RGF0ZSk7XG4gICAgICAgICAgICB2YXIgZXZlbnRzID0gdmlldy5tb2RlbC5nZXQoJ2V2ZW50cycpO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3Nob3c6ZXZlbnRzJywgdmlldywgZXZlbnRzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRQcmV2RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRlKCkuY2xvbmUoKS5zdWJ0cmFjdCgxLCAnbW9udGgnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXROZXh0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRlKCkuY2xvbmUoKS5hZGQoMSwgJ21vbnRoJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJldjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUodGhpcy5nZXRQcmV2RGF0ZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0ZSh0aGlzLmdldE5leHREYXRlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUHJldkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucHJldigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uTmV4dENsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDb2xsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLmdldENhbGVuZGFyV2Vla3MoKSwgZnVuY3Rpb24od2VlaywgaSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGRWaWV3KHRoaXMuYnVpbGRDaGlsZFZpZXcodGhpcy5nZXRXZWVrTW9kZWwoKSwgdGhpcy5jaGlsZFZpZXcpLCBpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICBmdW5jdGlvbiBmb3JFYWNoKCBhcnJheSwgZm4gKSB7IHZhciBpLCBsZW5ndGhcbiAgICBpID0gLTFcbiAgICBsZW5ndGggPSBhcnJheS5sZW5ndGhcbiAgICB3aGlsZSAoICsraSA8IGxlbmd0aCApXG4gICAgICBmbiggYXJyYXlbIGkgXSwgaSwgYXJyYXkgKVxuICB9XG5cbiAgZnVuY3Rpb24gbWFwKCBhcnJheSwgZm4gKSB7IHZhciByZXN1bHRcbiAgICByZXN1bHQgPSBBcnJheSggYXJyYXkubGVuZ3RoIClcbiAgICBmb3JFYWNoKCBhcnJheSwgZnVuY3Rpb24gKCB2YWwsIGksIGFycmF5ICkge1xuICAgICAgcmVzdWx0W2ldID0gZm4oIHZhbCwgaSwgYXJyYXkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZnVuY3Rpb24gcmVkdWNlKCBhcnJheSwgZm4sIGFjY3VtdWxhdG9yICkge1xuICAgIGZvckVhY2goIGFycmF5LCBmdW5jdGlvbiggdmFsLCBpLCBhcnJheSApIHtcbiAgICAgIGFjY3VtdWxhdG9yID0gZm4oIHZhbCwgaSwgYXJyYXkgKVxuICAgIH0pXG4gICAgcmV0dXJuIGFjY3VtdWxhdG9yXG4gIH1cblxuICAvLyBMZXZlbnNodGVpbiBkaXN0YW5jZVxuICBmdW5jdGlvbiBMZXZlbnNodGVpbiggc3RyX20sIHN0cl9uICkgeyB2YXIgcHJldmlvdXMsIGN1cnJlbnQsIG1hdHJpeFxuICAgIC8vIENvbnN0cnVjdG9yXG4gICAgbWF0cml4ID0gdGhpcy5fbWF0cml4ID0gW11cblxuICAgIC8vIFNhbml0eSBjaGVja3NcbiAgICBpZiAoIHN0cl9tID09IHN0cl9uIClcbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlID0gMFxuICAgIGVsc2UgaWYgKCBzdHJfbSA9PSAnJyApXG4gICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZSA9IHN0cl9uLmxlbmd0aFxuICAgIGVsc2UgaWYgKCBzdHJfbiA9PSAnJyApXG4gICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZSA9IHN0cl9tLmxlbmd0aFxuICAgIGVsc2Uge1xuICAgICAgLy8gRGFuZ2VyIFdpbGwgUm9iaW5zb25cbiAgICAgIHByZXZpb3VzID0gWyAwIF1cbiAgICAgIGZvckVhY2goIHN0cl9tLCBmdW5jdGlvbiggdiwgaSApIHsgaSsrLCBwcmV2aW91c1sgaSBdID0gaSB9IClcblxuICAgICAgbWF0cml4WzBdID0gcHJldmlvdXNcbiAgICAgIGZvckVhY2goIHN0cl9uLCBmdW5jdGlvbiggbl92YWwsIG5faWR4ICkge1xuICAgICAgICBjdXJyZW50ID0gWyArK25faWR4IF1cbiAgICAgICAgZm9yRWFjaCggc3RyX20sIGZ1bmN0aW9uKCBtX3ZhbCwgbV9pZHggKSB7XG4gICAgICAgICAgbV9pZHgrK1xuICAgICAgICAgIGlmICggc3RyX20uY2hhckF0KCBtX2lkeCAtIDEgKSA9PSBzdHJfbi5jaGFyQXQoIG5faWR4IC0gMSApIClcbiAgICAgICAgICAgIGN1cnJlbnRbIG1faWR4IF0gPSBwcmV2aW91c1sgbV9pZHggLSAxIF1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjdXJyZW50WyBtX2lkeCBdID0gTWF0aC5taW5cbiAgICAgICAgICAgICAgKCBwcmV2aW91c1sgbV9pZHggXSAgICAgKyAxICAgLy8gRGVsZXRpb25cbiAgICAgICAgICAgICAgLCBjdXJyZW50WyAgbV9pZHggLSAxIF0gKyAxICAgLy8gSW5zZXJ0aW9uXG4gICAgICAgICAgICAgICwgcHJldmlvdXNbIG1faWR4IC0gMSBdICsgMSAgIC8vIFN1YnRyYWN0aW9uXG4gICAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgICAgcHJldmlvdXMgPSBjdXJyZW50XG4gICAgICAgIG1hdHJpeFsgbWF0cml4Lmxlbmd0aCBdID0gcHJldmlvdXNcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlID0gY3VycmVudFsgY3VycmVudC5sZW5ndGggLSAxIF1cbiAgICB9XG4gIH1cblxuICBMZXZlbnNodGVpbi5wcm90b3R5cGUudG9TdHJpbmcgPSBMZXZlbnNodGVpbi5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCBub19wcmludCApIHtcbiAgICAgIHZhciBtYXRyaXgsIG1heCwgYnVmZiwgc2VwLCByb3dzLCBtYXRyaXggPSB0aGlzLmdldE1hdHJpeCgpO1xuXG4gICAgICBtYXggPSByZWR1Y2UoIG1hdHJpeCxmdW5jdGlvbiggbSwgbyApIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoIG0sIHJlZHVjZSggbywgTWF0aC5tYXgsIDAgKSApXG4gICAgICB9LCAwICk7XG5cbiAgICAgIGJ1ZmYgPSBBcnJheSgoIG1heCArICcnICkubGVuZ3RoKS5qb2luKCcgJyk7XG5cbiAgICAgIHNlcCA9IFtdO1xuXG4gICAgICB3aGlsZSAoIHNlcC5sZW5ndGggPCAobWF0cml4WzBdICYmIG1hdHJpeFswXS5sZW5ndGggfHwgMCkgKSB7XG4gICAgICAgICAgc2VwWyBzZXAubGVuZ3RoIF0gPSBBcnJheSggYnVmZi5sZW5ndGggKyAxICkuam9pbiggJy0nICk7XG4gICAgICB9XG5cbiAgICAgIHNlcCA9IHNlcC5qb2luKCAnLSsnICkgKyAnLSc7XG5cbiAgICAgIHJvd3MgPSBtYXAoIG1hdHJpeCwgZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgdmFyIGNlbGxzO1xuXG4gICAgICAgICAgY2VsbHMgPSBtYXAocm93LCBmdW5jdGlvbihjZWxsKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoYnVmZiArIGNlbGwpLnNsaWNlKCAtIGJ1ZmYubGVuZ3RoIClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBjZWxscy5qb2luKCAnIHwnICkgKyAnICc7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJvd3Muam9pbiggXCJcXG5cIiArIHNlcCArIFwiXFxuXCIgKTtcbiAgfVxuXG4gIExldmVuc2h0ZWluLnByb3RvdHlwZS5nZXRNYXRyaXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWF0cml4LnNsaWNlKClcbiAgfVxuXG4gIExldmVuc2h0ZWluLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZVxuICB9XG5cbiAgVG9vbGJveC5MZXZlbnNodGVpbiA9IExldmVuc2h0ZWluO1xuXG4gIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LklubGluZUVkaXRvciA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdpbmxpbmUtZWRpdG9yJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnaW5saW5lLWVkaXRvci13cmFwcGVyJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGF0dHJpYnV0ZSBpbiB0aGUgbW9kZWwgdG8gZWRpdFxuICAgICAgICAgICAgYXR0cmlidXRlOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGZvcm0gaW5wdXQgdmlldyBvYmplY3RcbiAgICAgICAgICAgIGZvcm1JbnB1dFZpZXc6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZm9ybSBpbnB1dCB2aWV3IG9iamVjdCBvcHRpb25zXG4gICAgICAgICAgICBmb3JtSW5wdXRWaWV3T3B0aW9uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzcnRpbmcpIFRoZSBjbGFzcyBuYW1lIHRvIGFkZCB0byB0aGUgZmllbGQgd2hpbGUgaXQgaXMgYmVpbmcgZWRpdHRlZC5cbiAgICAgICAgICAgIGVkaXR0aW5nQ2xhc3NOYW1lOiAnaW5saW5lLWVkaXRvci1lZGl0dGluZycsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBBbGxvdyB0aGUgZmllbGQgdG8gaGF2ZSBhIG51bGwgdmFsdWVcbiAgICAgICAgICAgIGFsbG93TnVsbDogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBrZXljb2RlIHRvIHNhdmUgdGhlIGZpZWxkIGRhdGFcbiAgICAgICAgICAgIHNhdmVLZXljb2RlOiAxMyxcblxuICAgICAgICAgICAgLy8gKGludCkgVGhlIGtleWNvZGUgdG8gY2FuY2VsIHRoZSBmaWVsZCBkYXRhXG4gICAgICAgICAgICBjYW5jZWxLZXljb2RlOiAyNyxcbiAgICAgICAgfSxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBpbnB1dDogJy5pbmxpbmUtZWRpdG9yLWZpZWxkJyxcbiAgICAgICAgICAgIGluZGljYXRvcjogJy5pbmxpbmUtZWRpdG9yLWFjdGl2aXR5LWluZGljYXRvcidcbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2NsaWNrIC5pbmxpbmUtZWRpdG9yLWxhYmVsJzogJ2xhYmVsOmNsaWNrJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUZvcm1JbnB1dFZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2Zvcm1JbnB1dFZpZXcnKTtcblxuICAgICAgICAgICAgaWYoIVZpZXcpIHtcbiAgICAgICAgICAgICAgICBWaWV3ID0gVG9vbGJveC5JbnB1dEZpZWxkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5tb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2F0dHJpYnV0ZScpKSxcbiAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbFxuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2Zvcm1JbnB1dFZpZXdPcHRpb25zJykpO1xuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KG9wdGlvbnMpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdibHVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC5ibHVyKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmlldy4kZWwub24oJ2tleXByZXNzJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmKGUua2V5Q29kZSA9PT0gdC5nZXRPcHRpb24oJ3NhdmVLZXljb2RlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodC5nZXRPcHRpb24oJ2FsbG93TnVsbCcpIHx8ICF0LmdldE9wdGlvbignYWxsb3dOdWxsJykgJiYgIXQuaXNOdWxsKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuYmx1cigpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2aWV3LiRlbC5vbigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gdC5nZXRPcHRpb24oJ2NhbmNlbEtleWNvZGUnKSkge1xuICAgICAgICAgICAgICAgICAgICB0LmNhbmNlbCgpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvcih7XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAndGlueSdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2luZGljYXRvcicsIHZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5lbXB0eSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzTnVsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbnB1dFZhbHVlKCkgPT09ICcnID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldExhYmVsSHRtbDogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmlubGluZS1lZGl0b3ItbGFiZWwnKS5odG1sKGh0bWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0NoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxWYWx1ZSgpICE9PSB0aGlzLmdldElucHV0VmFsdWUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYW5jZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ibHVyKCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NhbmNlbCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5oYXNDaGFuZ2VkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdlZGl0dGluZ0NsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdibHVyJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2VkaXR0aW5nQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgdGhpcy5nZXRDaGlsZFZpZXcoJ2lucHV0JykuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZm9jdXMnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRNb2RlbFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignYXR0cmlidXRlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2hpbGRWaWV3KCdpbnB1dCcpLmdldElucHV0VmFsdWUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRGb3JtRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldE9wdGlvbignYXR0cmlidXRlJyk7XG5cbiAgICAgICAgICAgIGRhdGFbbmFtZV0gPSB0aGlzLmdldElucHV0VmFsdWUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldExhYmVsSHRtbCh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25CZWZvcmVTYXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0FjdGl2aXR5SW5kaWNhdG9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25BZnRlclNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZpdHlJbmRpY2F0b3IoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2FsbG93TnVsbCcpIHx8ICF0aGlzLmdldE9wdGlvbignYWxsb3dOdWxsJykgJiYgIXRoaXMuaXNOdWxsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJsdXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzYXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYodGhpcy5tb2RlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnYmVmb3JlOnNhdmUnKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2F2ZSh0aGlzLmdldEZvcm1EYXRhKCksIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24obW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3NhdmU6c3VjY2VzcycsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2FmdGVyOnNhdmUnLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdjaGFuZ2UnLCB0LmdldElucHV0VmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc2F2ZTplcnJvcicsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2FmdGVyOnNhdmUnLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScsIHRoaXMuZ2V0SW5wdXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkxhYmVsQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TGFiZWxIdG1sKHRoaXMuZ2V0TW9kZWxWYWx1ZSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygnaW5wdXQnLCB0aGlzLmNyZWF0ZUZvcm1JbnB1dFZpZXcoKSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5JbnB1dEZpZWxkID0gVG9vbGJveC5CYXNlRmllbGQuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS1pbnB1dC1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0J1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkxpZ2h0U3dpdGNoRmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLWxpZ2h0LXN3aXRjaC1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuXG4gICAgICAgICAgICBhY3RpdmVDbGFzc05hbWU6ICdvbicsXG5cbiAgICAgICAgICAgIG9uVmFsdWU6IDEsXG5cbiAgICAgICAgICAgIG9mZlZhbHVlOiAwLFxuXG4gICAgICAgICAgICB0cmlnZ2VyU2VsZWN0b3I6ICcubGlnaHQtc3dpdGNoJyxcblxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdsaWdodC1zd2l0Y2gnXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayAubGlnaHQtc3dpdGNoLWNvbnRhaW5lcic6ICdjbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdrZXl1cCc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFZhbHVlKHRoaXMuZ2V0T3B0aW9uKCdvZmZWYWx1ZScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmdldE9wdGlvbignb25WYWx1ZScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guQmFzZUZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy52YWx1ZSA9PT0gZmFsc2UgfHwgXy5pc05hTih0aGlzLm9wdGlvbnMudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnZhbHVlID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy5nZXRPcHRpb24oJ3ZhbHVlJykpID09PSAxO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGQoKS52YWwodmFsdWUpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmlzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUNsYXNzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUFjdGl2ZUNsYXNzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY2hhbmdlJywgdmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExpZ2h0U3dpdGNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcubGlnaHQtc3dpdGNoJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRBY3RpdmVDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0TGlnaHRTd2l0Y2goKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZHJhZ2dpbmdDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5saWdodC1zd2l0Y2gtY29udGFpbmVyJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgJ21hcmdpbi1sZWZ0JzogMFxuICAgICAgICAgICAgfSwgMTAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LmdldExpZ2h0U3dpdGNoKClcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKHQuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHQuZ2V0T3B0aW9uKCdkcmFnZ2luZ0NsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUFjdGl2ZUNsYXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXRMaWdodFN3aXRjaCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkcmFnZ2luZ0NsYXNzTmFtZScpKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmxpZ2h0LXN3aXRjaC1jb250YWluZXInKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAnbWFyZ2luLWxlZnQnOiAtMTFcbiAgICAgICAgICAgIH0sIDEwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC5nZXRMaWdodFN3aXRjaCgpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0LmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0LmdldE9wdGlvbignZHJhZ2dpbmdDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuaXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5nZXRPcHRpb24oJ29uVmFsdWUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFZhbHVlKHRoaXMuZ2V0T3B0aW9uKCdvZmZWYWx1ZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzXG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vTGlzdEdyb3VwSXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLWxpc3QtZ3JvdXAtaXRlbScpLFxuXG5cdFx0Y2xhc3NOYW1lOiAnbGlzdC1ncm91cC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0bWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zO1xuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94Lkxpc3RHcm91cEl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdsaXN0LWdyb3VwLWl0ZW0nKSxcblxuXHRcdGNsYXNzTmFtZTogJ2xpc3QtZ3JvdXAtaXRlbScsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBiYWRnZUF0dHJpYnV0ZTogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50QXR0cmlidXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGVkaXRGb3JtQ2xhc3M6IGZhbHNlLFxuICAgICAgICAgICAgZGVsZXRlRm9ybUNsYXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVkaXRCdXR0b246IHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4gYnRuLXdhcm5pbmcgYnRuLXhzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxuICAgICAgICAgICAgICAgIGljb246ICdmYSBmYS1lZGl0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWxldGVCdXR0b246IHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4gYnRuLWRhbmdlciBidG4teHMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtdHJhc2gtbycsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZihlLnRhcmdldCA9PSB0aGlzLiRlbC5nZXQoMCkpIHtcbiAgICBcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2snLCB0aGlzLCBlKTtcbiAgICAgICAgICAgICAgICB9XG5cdFx0XHR9LFxuICAgICAgICAgICAgJ2NsaWNrIC5lZGl0LWl0ZW0nOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljazplZGl0JywgdGhpcywgZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NsaWNrIC5kZWxldGUtaXRlbSc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmRlbGV0ZScsIHRoaXMsIGUpO1xuICAgICAgICAgICAgfVxuXHRcdH0sXG5cbiAgICAgICAgZ2V0QmFkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdiYWRnZUF0dHJpYnV0ZScpID9cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignYmFkZ2VBdHRyaWJ1dGUnKSkgOlxuICAgICAgICAgICAgICAgIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50QXR0cmlidXRlJykgP1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50QXR0cmlidXRlJykpIDpcbiAgICAgICAgICAgICAgICBmYWxzZTtcbiAgICAgICAgfSxcblxuXHRcdHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYmFkZ2UsIGNvbnRlbnQsIGhlbHBlciA9IF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBoYXNFZGl0Rm9ybTogdGhpcy5nZXRPcHRpb24oJ2VkaXRGb3JtQ2xhc3MnKSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBoYXNEZWxldGVGb3JtOiB0aGlzLmdldE9wdGlvbignZGVsZXRlRm9ybUNsYXNzJykgPyB0cnVlIDogZmFsc2VcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmKGJhZGdlID0gdGhpcy5nZXRCYWRnZSgpKSB7XG4gICAgICAgICAgICAgICAgaGVscGVyLmJhZGdlID0gYmFkZ2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKSkge1xuICAgICAgICAgICAgICAgIGhlbHBlci5jb250ZW50ID0gY29udGVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGhlbHBlcjtcblx0XHR9LFxuXG4gICAgICAgIG9uQ2xpY2tFZGl0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlZGl0Rm9ybUNsYXNzJyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZpZXcub24oJ3N1Ym1pdDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgICAgIHZhciBtb2RhbCA9IG5ldyBUb29sYm94Lk1vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFZpZXc6IHZpZXdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIG1vZGFsLnNob3coKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2hvdzplZGl0JywgbW9kYWwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGlja0RlbGV0ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZGVsZXRlRm9ybUNsYXNzJyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZpZXcub24oJ3N1Ym1pdDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBtb2RhbCA9IG5ldyBUb29sYm94Lk1vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFZpZXc6IHZpZXdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIG1vZGFsLnNob3coKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2hvdzpkZWxldGUnLCBtb2RhbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cdFRvb2xib3guTGlzdEdyb3VwID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94Lkxpc3RHcm91cEl0ZW0sXG5cblx0XHRjbGFzc05hbWU6ICdsaXN0LWdyb3VwJyxcblxuXHRcdHRhZ05hbWU6ICd1bCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKGJvb2wpIEFjdGl2YXRlIGxpc3QgaXRlbSBvbiBjbGlja1xuXHRcdFx0YWN0aXZhdGVPbkNsaWNrOiBmYWxzZSxcblxuXHRcdFx0Ly8gKGJvb2wpIEFjdGl2YXRlIG9ubHkgYSBzaW5nbGUgaXRlbSBpbiB0aGUgbGlzdCBpdGVtIGF0IG9uY2Vcblx0XHRcdGFjdGl2YXRlU2luZ2xlSXRlbTogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIEFjdGl2ZSBjbGFzcyBuYW1lXG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZXJlIGFyZSBubyBsaXN0IGl0ZW1zXG5cdFx0XHRlbXB0eU1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJyxcblxuXHRcdFx0Ly8gKG9iamVjdCkgVGhlIHZpZXcgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGVtcHR5IG1lc3NhZ2Vcblx0XHRcdGVtcHR5TWVzc2FnZVZpZXc6IFRvb2xib3guTm9MaXN0R3JvdXBJdGVtLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgZW1wdHkgbWVzc2FnZSB2aWV3XG5cdFx0XHRzaG93RW1wdHlNZXNzYWdlOiB0cnVlLFxuXHRcdH0sXG5cblx0XHRjaGlsZFZpZXdFdmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKGNoaWxkLCBlKSB7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2FjdGl2YXRlT25DbGljaycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNoaWxkLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC4kZWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmF0ZVNpbmdsZUl0ZW0nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLiRlbC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2FjdGl2YXRlJywgZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdpdGVtOmNsaWNrJywgY2hpbGQsIGUpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgZW1wdHlWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZih0aGlzLmdldE9wdGlvbignc2hvd0VtcHR5TWVzc2FnZScpKSB7XG5cdCAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZVZpZXcnKTtcblxuXHQgICAgICAgICAgICBWaWV3ID0gVmlldy5leHRlbmQoe1xuXHQgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuXHQgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2UnKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICByZXR1cm4gVmlldztcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKCQsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94Lk1vZGFsID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ21vZGFsLXdpbmRvdycpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ21vZGFsLXdpbmRvdy13cmFwcGVyJyxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBjb250ZW50OiAnLm1vZGFsLWNvbnRlbnQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayAubW9kYWwtY2xvc2UnOiAnY2xvc2U6Y2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgYnV0dG9uIG9iamVjdHMgdG8gYWRkIHRvIHRoZSBtb2RhbCB3aW5kb3dcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbW9kYWwgd2luZG93IGhlYWRlciB0ZXh0XG4gICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB1c2VkIGZvciB0aGUgbW9kYWwgYW5pbWF0aW9uXG4gICAgICAgICAgICBjbG9zZUFuaW1hdGlvblJhdGU6IDUwMFxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5tb2RhbC1idXR0b25zIGEnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ1dHRvbnMgPSB0aGlzLmdldE9wdGlvbignYnV0dG9ucycpO1xuICAgICAgICAgICAgICAgIHZhciBpID0gJChlLnRhcmdldCkuaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKF8uaXNBcnJheShidXR0b25zKSAmJiBidXR0b25zW2ldLm9uQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5vbkNsaWNrLmNhbGwodGhpcywgJChlLnRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDb250ZW50VmlldzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdGhpcy5zZXRDb250ZW50Vmlldyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb250ZW50VmlldzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdjb250ZW50Jywgdmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGVudFZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVnaW9uKCdjb250ZW50JykuY3VycmVudFZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIHZpZXcgPSB0aGlzLmdldE9wdGlvbignY29udGVudFZpZXcnKTtcblxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcblxuICAgICAgICAgICAgdmlldy5vbignYmVmb3JlOmRldGFjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5vZmYoJ2tleXVwJywga2V5dXBIYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdjYW5jZWw6Y2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB2YXIga2V5dXBIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmKGUua2V5Q29kZSA9PSAyNykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQoJ2JvZHknKS5hcHBlbmQodGhpcy4kZWwpLm9uKCdrZXl1cCcsIGtleXVwSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygnY29udGVudCcsIHZpZXcpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuJGVsLmFkZENsYXNzKCdzaG93Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmdldFJlZ2lvbignY29udGVudCcpLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgc2VsZi4kZWwucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignY2xvc2VBbmltYXRpb25SYXRlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xvc2VDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZnVuY3Rpb24oJCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5Ob3RpZmljYXRpb24gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdGNsYXNzTmFtZTogJ25vdGlmaWNhdGlvbiBjbGVhcmZpeCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKGludCkgVGhlIGZseS1vdXQgYW5pbWF0aW9uIHJhdGUgaW4gbWlsbGlzZWNvbmRzXG5cdFx0XHRhbmltYXRpb246IDUwMCxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGNsb3NlIGNsYXNzIG5hbWVcblx0XHRcdGNsb3NlQ2xhc3NOYW1lOiAnY2xvc2UnLFxuXG5cdFx0XHQvLyAoaW50KSBDbG9zZSBhZnRlciBhIGRlbGF5IGluIG1pbGxlY29uZHMuIFBhc3MgZmFsc2UgdG8gbm90IGNsb3NlXG5cdFx0XHRjbG9zZU9uRGVsYXk6IDQwMDAsXG5cblx0XHRcdC8vIChib29sKSBDbG9zZSB0aGUgbm90aWZpY2F0aW9uIHdoZW4gY2xpY2tlZCBhbnl3aGVyZVxuXHRcdFx0Y2xvc2VPbkNsaWNrOiB0cnVlLFxuXG5cdFx0XHQvLyAoYm9vbCkgVGhlIGljb24gY2xhc3MgdXNlZCBpbiB0aGUgYWxlcnRcblx0XHRcdGljb246IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nfGZhbHNlKSBUaGUgbm90aWZpY2F0aW9uIG1lc3NhZ2Vcblx0XHRcdG1lc3NhZ2U6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nfGZhbHNlKSBUaGUgbm90aWZpY2F0aW9uIHRpdGxlXG5cdFx0XHR0aXRsZTogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIFR5cGUgb2Ygbm90aWZpY2F0aW9uIChhbGVydHx3YXJuaW5nfHN1Y2Nlc3MpXG5cdFx0XHR0eXBlOiAnYWxlcnQnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgY2xhc3MgbmFtZSB0aGF0IG1ha2VzIHRoZSBub3RpZmljYXRpb24gdmlzaWJsZVxuXHRcdFx0dmlzaWJsZUNsYXNzTmFtZTogJ3Zpc2libGUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgY2xhc3MgbmFtZSB0aGF0IGlzIHVzZWQgaW4gdGhlIHdyYXBwZXIgdG8gd2hpY2hcblx0XHRcdC8vIG5vdGlmaWNhdGlvbiBhcmUgYXBwZW5kZWRcblx0XHRcdHdyYXBwZXJDbGFzc05hbWU6ICdub3RpZmljYXRpb25zJ1xuXHRcdH0sXG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm90aWZpY2F0aW9uJyksXG5cblx0XHRtb2RlbDogZmFsc2UsXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrJzogJ2NsaWNrJyxcblx0XHRcdCdjbGljayAuY2xvc2UnOiAnY2xvc2U6Y2xpY2snXG5cdFx0fSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0b25DbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbignY2xvc2VPbkNsaWNrJykpIHtcblx0XHRcdFx0dGhpcy5oaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uQ2xvc2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmhpZGUoKTtcblx0XHR9LFxuXG5cdFx0aXNWaXNpYmxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbigndmlzaWJsZUNsYXNzTmFtZScpKTtcblx0XHR9LFxuXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdCA9IHRoaXM7XG5cblx0XHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCd2aXNpYmxlQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0LiRlbC5yZW1vdmUoKTtcblx0XHRcdH0sIHRoaXMuZ2V0T3B0aW9uKCdhbmltYXRpb24nKSk7XG5cblx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaGlkZScpO1xuXHRcdH0sXG5cblx0XHRjcmVhdGVOb3RpZmljYXRpb25zRG9tV3JhcHBlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgJHdyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwiJyt0aGlzLmdldE9wdGlvbignd3JhcHBlckNsYXNzTmFtZScpKydcIiAvPicpO1xuXG5cdFx0XHQkKCdib2R5JykuYXBwZW5kKCR3cmFwcGVyKTtcblxuXHRcdFx0cmV0dXJuICR3cmFwcGVyO1xuXHRcdH0sXG5cblx0XHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciB0ID0gdGhpcywgJHdyYXBwZXIgPSAkKCdib2R5JykuZmluZCgnLicgKyB0aGlzLmdldE9wdGlvbignd3JhcHBlckNsYXNzTmFtZScpKTtcblxuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblxuXHRcdFx0aWYoISR3cmFwcGVyLmxlbmd0aCkge1xuXHRcdFx0XHQkd3JhcHBlciA9IHRoaXMuY3JlYXRlTm90aWZpY2F0aW9uc0RvbVdyYXBwZXIoKTtcblx0XHRcdH1cblxuXHRcdFx0JHdyYXBwZXIuYXBwZW5kKHRoaXMuJGVsKTtcblxuXHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3R5cGUnKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHQuJGVsLmFkZENsYXNzKHQuZ2V0T3B0aW9uKCd2aXNpYmxlQ2xhc3NOYW1lJykpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdjbG9zZU9uRGVsYXknKSAhPT0gZmFsc2UpIHtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZih0LmlzVmlzaWJsZSgpKSB7XG5cdFx0XHRcdFx0XHR0LmhpZGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHRoaXMuZ2V0T3B0aW9uKCdjbG9zZU9uRGVsYXknKSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnc2hvdycpO1xuXHRcdH1cblxuXHR9KTtcblxuXHRyZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vT3JkZXJlZExpc3RJdGVtID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tb3JkZXJlZC1saXN0LWl0ZW0nKSxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0bWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zO1xuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94Lk9yZGVyZWRMaXN0SXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ29yZGVyZWQtbGlzdC1pdGVtJyksXG5cblx0XHRjbGFzc05hbWU6ICdvcmRlcmVkLWxpc3QtaXRlbScsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbihlLCBvYmopIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljaycsIG9iaik7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zXG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guT3JkZXJlZExpc3QgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guT3JkZXJlZExpc3RJdGVtLFxuXG4gICAgXHRlbXB0eVZpZXc6IFRvb2xib3guTm9Vbm9yZGVyZWRMaXN0SXRlbSxcblxuXHRcdGNsYXNzTmFtZTogJ29yZGVyZWQtbGlzdCcsXG5cblx0XHR0YWdOYW1lOiAnb2wnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdC8vIChvYmplY3QpIFRoZSB2aWV3IG9iamVjdCB0byB1c2UgZm9yIHRoZSBlbXB0eSBtZXNzYWdlXG5cdFx0XHRlbXB0eU1lc3NhZ2VWaWV3OiBUb29sYm94Lk5vT3JkZXJlZExpc3RJdGVtLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZXJlIGFyZSBubyBsaXN0IGl0ZW1zXG5cdFx0XHRlbXB0eU1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJyxcblxuXHRcdFx0Ly8gKGJvb2wpIFNob3cgdGhlIGVtcHR5IG1lc3NhZ2Ugdmlld1xuXHRcdFx0c2hvd0VtcHR5TWVzc2FnZTogdHJ1ZVxuXHRcdH0sXG5cblx0XHRjaGlsZFZpZXdFdmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdpdGVtOmNsaWNrJywgdmlldyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuICAgICAgICBnZXRFbXB0eVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcdGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93RW1wdHlNZXNzYWdlJykpIHtcblx0ICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlVmlldycpO1xuXG5cdCAgICAgICAgICAgIFZpZXcgPSBWaWV3LmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG5cdCAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZScpXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBWaWV3O1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5QYWdlciA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3BhZ2VyJyksXG5cblx0XHR0YWdOYW1lOiAnbmF2JyxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2sgLm5leHQtcGFnZSc6ICduZXh0OnBhZ2U6Y2xpY2snLFxuXHRcdFx0J2NsaWNrIC5wcmV2LXBhZ2UnOiAncHJldjpwYWdlOmNsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKHN0cmluZykgVGhlIHBhZ2VyIGNsYXNzIG5hbWVcblx0XHRcdHBhZ2VyQ2xhc3NOYW1lOiAncGFnZXInLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgYWN0aXZlIGNsYXNzIG5hbWVcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkaXNhYmxlZCBjbGFzcyBuYW1lXG5cdFx0XHRkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIHByZXZpb3VzIGJ1dHRvbiBjbGFzcyBuYW1lXG5cdFx0XHRwcmV2Q2xhc3NOYW1lOiAncHJldmlvdXMnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgbmV4dCBidXR0b24gY2xhc3MgbmFtZVxuXHRcdFx0bmV4dENsYXNzTmFtZTogJ25leHQnLFxuXG5cdFx0XHQvLyAoYm9vbCkgSW5jbHVkZSB0aGUgcGFnZSB0b3RhbHMgYmV0d2VlbiB0aGUgcGFnZXIgYnV0dG9uc1xuXHRcdFx0aW5jbHVkZVBhZ2VUb3RhbHM6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBBbGlnbiBwYWdlciBidXR0c29uIHRvIGxlZnQgYW5kIHJpZ2h0IGVkZ2Vcblx0XHRcdHNuYXBUb0VkZ2VzOiB0cnVlLFxuXG5cdFx0XHQvLyAoaW50KSBUaGUgY3VycmVudCBwYWdlIG51bWJlclxuXHRcdFx0cGFnZTogMSxcblxuXHRcdFx0Ly8gKGludCkgVGhlIHRvdGFsIG51bWJlciBvZiBwYWdlc1xuXHRcdFx0dG90YWxQYWdlczogMSxcblxuXHRcdFx0Ly8gKHN0cmluZykgTmV4dCBidXR0b24gbGFiZWxcblx0XHRcdG5leHRMYWJlbDogJ05leHQnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBQcmV2aW91cyBidXR0b24gbGFiZWxcblx0XHRcdHByZXZMYWJlbDogJ1ByZXZpb3VzJ1xuXHRcdH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdG5leHRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHRcdHZhciB0b3RhbCA9IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cblx0XHRcdGlmKHBhZ2UgPCB0b3RhbCkge1xuXHRcdFx0XHRwYWdlKys7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25OZXh0UGFnZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubmV4dFBhZ2UoKTtcblx0XHR9LFxuXG5cdFx0cHJldlBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXG5cdFx0XHRpZihwYWdlID4gMSkge1xuXHRcdFx0XHRwYWdlLS07XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IDEpIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uUHJldlBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0fSxcblxuXHRcdHNldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3BhZ2luYXRlJywgcGFnZSk7XG5cdFx0fSxcblxuXHRcdGdldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKCQsIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guUGFnaW5hdGlvbkl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAnbGknLFxuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdwYWdpbmF0aW9uLWl0ZW0nKSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGFjdGl2ZSBwYWdlIGNsYXNzIG5hbWVcbiAgICAgICAgICAgIGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayBhOm5vdCgubmV4dC1wYWdlLCAucHJldi1wYWdlKSc6ICdjbGljaycsXG4gICAgICAgICAgICAnY2xpY2sgLm5leHQtcGFnZSc6ICdwYWdlOm5leHQnLFxuICAgICAgICAgICAgJ2NsaWNrIC5wcmV2LXBhZ2UnOiAncGFnZTpwcmV2J1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsLmdldCgnZGl2aWRlcicpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5tb2RlbC5nZXQoJ3BhZ2UnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICdkYXRhLXBhZ2UnOiB0aGlzLm1vZGVsLmdldCgncGFnZScpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guUGFnaW5hdGlvbkxpc3QgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGFnTmFtZTogJ3VsJyxcblxuICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guUGFnaW5hdGlvbkl0ZW0sXG5cbiAgICAgICAgY2xhc3NOYW1lOiAncGFnaW5hdGlvbicsXG5cbiAgICAgICAgY2hpbGRWaWV3RXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2snOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdwYWdpbmF0ZScsIHZpZXcpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdwYWdlOm5leHQnOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdwYWdlOm5leHQnLCB2aWV3KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAncGFnZTpwcmV2JzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgncGFnZTpwcmV2Jywgdmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5QYWdpbmF0aW9uID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3BhZ2luYXRpb24nKSxcblxuXHRcdHRhZ05hbWU6ICduYXYnLFxuXG5cdFx0cmVnaW9uczoge1xuICAgICAgICAgICAgbGlzdDoge1xuICAgICAgICAgICAgICAgIGVsOiAndWwnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2VFbGVtZW50OiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHBhZ2luYXRpb25DbGFzc05hbWU6ICdwYWdpbmF0aW9uJyxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG4gICAgICAgICAgICBkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJyxcbiAgICAgICAgICAgIHRvdGFsUGFnZXM6IDEsXG4gICAgICAgICAgICBzaG93UGFnZXM6IDYsXG4gICAgICAgICAgICBwYWdlOiAxXG4gICAgICAgIH0sXG5cblx0XHRjaGlsZFZpZXdFdmVudHM6IHtcblx0XHRcdCdwYWdlOm5leHQnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5uZXh0UGFnZSgpO1xuXHRcdFx0fSxcblx0XHRcdCdwYWdlOnByZXYnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5wcmV2UGFnZSgpO1xuXHRcdFx0fSxcblx0XHRcdCdwYWdpbmF0ZSc6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVBhZ2Uodmlldy5tb2RlbC5nZXQoJ3BhZ2UnKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRUb29sYm94LlZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XG4gICAgICAgICAgICB9XG5cdFx0fSxcblxuXHRcdG9uQmVmb3JlUmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICcmbGFxdW87JyxcbiAgICAgICAgICAgICAgICBjbGFzczogJ3ByZXYtcGFnZSdcbiAgICAgICAgICAgIH0pO1xuXG5cdFx0XHR2YXIgY3VycmVudFBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdFx0dmFyIHRvdGFsUGFnZXMgPSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpO1xuXHRcdFx0dmFyIHNob3dQYWdlcyA9IHRoaXMuZ2V0T3B0aW9uKCdzaG93UGFnZXMnKTtcblxuXHRcdFx0aWYoc2hvd1BhZ2VzICUgMikge1xuXHRcdFx0XHRzaG93UGFnZXMrKzsgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlclxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3RhcnRQYWdlID0gKGN1cnJlbnRQYWdlIDwgc2hvd1BhZ2VzKSA/IDEgOiBjdXJyZW50UGFnZSAtIChzaG93UGFnZXMgLyAyKTtcblxuXHRcdFx0dmFyIGVuZFBhZ2UgPSBzaG93UGFnZXMgKyBzdGFydFBhZ2U7XG5cblx0XHRcdGVuZFBhZ2UgPSAodG90YWxQYWdlcyA8IGVuZFBhZ2UpID8gdG90YWxQYWdlcyA6IGVuZFBhZ2U7XG5cblx0XHRcdHZhciBkaWZmID0gc3RhcnRQYWdlIC0gZW5kUGFnZSArIHNob3dQYWdlcztcblxuXHRcdFx0c3RhcnRQYWdlIC09IChzdGFydFBhZ2UgLSBkaWZmID4gMCkgPyBkaWZmIDogMDtcblxuXHRcdFx0aWYgKHN0YXJ0UGFnZSA+IDEpIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZCh7cGFnZTogMX0pO1xuXG5cdFx0XHRcdGlmKHN0YXJ0UGFnZSA+IDIpIHtcblx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtkaXZpZGVyOiB0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Zm9yKHZhciBpID0gc3RhcnRQYWdlOyBpIDw9IGVuZFBhZ2U7IGkrKykge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiBpfSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xuXHRcdFx0XHRpZih0b3RhbFBhZ2VzIC0gMSA+IGVuZFBhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtkaXZpZGVyOiB0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZCh7cGFnZTogdG90YWxQYWdlc30pO1xuXHRcdFx0fVxuXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uYWRkKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJyZyYXF1bzsnLFxuICAgICAgICAgICAgICAgIGNsYXNzOiAnbmV4dC1wYWdlJ1xuICAgICAgICAgICAgfSk7XG5cdFx0fSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnW2RhdGEtcGFnZT1cIicrdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSsnXCJdJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IDEpIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSB0aGlzLmdldFRvdGFsUGFnZXMoKSkge1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdsaXN0JywgbmV3IFRvb2xib3guUGFnaW5hdGlvbkxpc3Qoe1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvblxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFRvdGFsUGFnZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dFBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdFx0dmFyIHRvdGFsID0gdGhpcy5nZXRUb3RhbFBhZ2VzKCk7XG5cblx0XHRcdGlmKHBhZ2UgPCB0b3RhbCkge1xuXHRcdFx0XHRwYWdlKys7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25OZXh0UGFnZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubmV4dFBhZ2UoKTtcblx0XHR9LFxuXG5cdFx0cHJldlBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXG5cdFx0XHRpZihwYWdlID4gMSkge1xuXHRcdFx0XHRwYWdlLS07XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25QcmV2UGFnZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMucHJldlBhZ2UoKTtcblx0XHR9LFxuXG4gICAgICAgIHNldFNob3dQYWdlczogZnVuY3Rpb24oc2hvd1BhZ2VzKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMuc2hvd1BhZ2VzID0gc2hvd1BhZ2VzO1xuXHRcdH0sXG5cblx0XHRnZXRTaG93UGFnZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdzaG93UGFnZXMnKTtcblx0XHR9LFxuXG5cdFx0c2V0VG90YWxQYWdlczogZnVuY3Rpb24odG90YWxQYWdlcykge1xuXHRcdFx0dGhpcy5vcHRpb25zLnRvdGFsUGFnZXMgPSB0b3RhbFBhZ2VzO1xuXHRcdH0sXG5cblx0XHRnZXRUb3RhbFBhZ2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpO1xuXHRcdH0sXG5cblx0XHRzZXRQYWdlOiBmdW5jdGlvbihwYWdlKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMucGFnZSA9IHBhZ2U7XG5cdFx0fSxcblxuXHRcdGdldFBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0fSxcblxuXHRcdHNldFBhZ2luYXRpb25MaW5rczogZnVuY3Rpb24ocGFnZSwgdG90YWxQYWdlcykge1xuXHRcdFx0dGhpcy5zZXRQYWdlKHBhZ2UpO1xuXHRcdFx0dGhpcy5zZXRUb3RhbFBhZ2VzKHRvdGFsUGFnZXMpO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9LFxuXG5cdFx0c2V0QWN0aXZlUGFnZTogZnVuY3Rpb24ocGFnZSkge1xuXHRcdFx0aWYodGhpcy5vcHRpb25zLnBhZ2UgIT0gcGFnZSkge1xuXHRcdFx0XHR0aGlzLm9wdGlvbnMucGFnZSA9IHBhZ2U7XG5cdFx0XHRcdHRoaXMucmVuZGVyKCk7XG5cblx0XHRcdFx0dmFyIHF1ZXJ5ID0gdGhpcy5jb2xsZWN0aW9uLndoZXJlKHtwYWdlOiBwYWdlfSk7XG5cblx0XHRcdFx0aWYocXVlcnkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IHRoaXMuZ2V0UmVnaW9uKCdsaXN0JykuY3VycmVudFZpZXcuY2hpbGRyZW4uZmluZEJ5TW9kZWwocXVlcnlbMF0pO1xuXG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdwYWdpbmF0ZScsIHBhZ2UsIGNoaWxkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRnZXRBY3RpdmVQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdH1cblxuICAgIH0pO1xuXG4gICAgLypcbiAgICAqL1xuXG4gICAgLypcbiAgICAqL1xuXG4gICAgLypcblx0VG9vbGJveC5QYWdpbmF0aW9uID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncGFnaW5hdGlvbicpLFxuXG5cdFx0dGFnTmFtZTogJ25hdicsXG5cblx0XHRyZWdpb25zOiB7XG4gICAgICAgICAgICBsaXN0OiB7XG4gICAgICAgICAgICAgICAgZWw6ICd1bCcsXG4gICAgICAgICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgcGFnaW5hdGlvbkNsYXNzTmFtZTogJ3BhZ2luYXRpb24nLFxuICAgICAgICAgICAgYWN0aXZlQ2xhc3NOYW1lOiAnYWN0aXZlJyxcbiAgICAgICAgICAgIGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnLFxuICAgICAgICAgICAgdG90YWxQYWdlczogMSxcbiAgICAgICAgICAgIHNob3dQYWdlczogNixcbiAgICAgICAgICAgIHBhZ2U6IDFcbiAgICAgICAgfSxcblxuXHRcdGNoaWxkVmlld0V2ZW50czoge1xuXHRcdFx0J3BhZ2U6bmV4dCc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLm5leHRQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J3BhZ2U6cHJldic6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHRpZighdmlldy4kZWwuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHZpZXcubW9kZWwuZ2V0KCdwYWdlJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2sgLm5leHQtcGFnZSc6ICduZXh0OnBhZ2U6Y2xpY2snLFxuXHRcdFx0J2NsaWNrIC5wcmV2LXBhZ2UnOiAncHJldjpwYWdlOmNsaWNrJ1xuXHRcdH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0VG9vbGJveC5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZighdGhpcy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKTtcbiAgICAgICAgICAgIH1cblx0XHR9LFxuXG5cdFx0b25CZWZvcmVSZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jb2xsZWN0aW9uLnJlc2V0KCk7XG5cblx0XHRcdHZhciBjdXJyZW50UGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0XHR2YXIgdG90YWxQYWdlcyA9IHRoaXMuZ2V0VG90YWxQYWdlcygpO1xuXHRcdFx0dmFyIHNob3dQYWdlcyA9IHRoaXMuZ2V0T3B0aW9uKCdzaG93UGFnZXMnKTtcblxuXHRcdFx0aWYoc2hvd1BhZ2VzICUgMikge1xuXHRcdFx0XHRzaG93UGFnZXMrKzsgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlclxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3RhcnRQYWdlID0gKGN1cnJlbnRQYWdlIDwgc2hvd1BhZ2VzKSA/IDEgOiBjdXJyZW50UGFnZSAtIChzaG93UGFnZXMgLyAyKTtcblxuXHRcdFx0dmFyIGVuZFBhZ2UgPSBzaG93UGFnZXMgKyBzdGFydFBhZ2U7XG5cblx0XHRcdGVuZFBhZ2UgPSAodG90YWxQYWdlcyA8IGVuZFBhZ2UpID8gdG90YWxQYWdlcyA6IGVuZFBhZ2U7XG5cblx0XHRcdHZhciBkaWZmID0gc3RhcnRQYWdlIC0gZW5kUGFnZSArIHNob3dQYWdlcztcblxuXHRcdFx0c3RhcnRQYWdlIC09IChzdGFydFBhZ2UgLSBkaWZmID4gMCkgPyBkaWZmIDogMDtcblxuXHRcdFx0aWYgKHN0YXJ0UGFnZSA+IDEpIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZCh7cGFnZTogMX0pO1xuXG5cdFx0XHRcdGlmKHN0YXJ0UGFnZSA+IDIpIHtcblx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtkaXZpZGVyOiB0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Zm9yKHZhciBpID0gc3RhcnRQYWdlOyBpIDw9IGVuZFBhZ2U7IGkrKykge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiBpfSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xuXHRcdFx0XHRpZih0b3RhbFBhZ2VzIC0gMSA+IGVuZFBhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtkaXZpZGVyOiB0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZCh7cGFnZTogdG90YWxQYWdlc30pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRuZXh0UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0XHR2YXIgdG90YWwgPSB0aGlzLmdldFRvdGFsUGFnZXMoKTtcblxuXHRcdFx0aWYocGFnZSA8IHRvdGFsKSB7XG5cdFx0XHRcdHBhZ2UrKztcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHBhZ2UpO1xuXHRcdH0sXG5cblx0XHRvbk5leHRQYWdlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5uZXh0UGFnZSgpO1xuXHRcdH0sXG5cblx0XHRwcmV2UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cblx0XHRcdGlmKHBhZ2UgPiAxKSB7XG5cdFx0XHRcdHBhZ2UtLTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHBhZ2UpO1xuXHRcdH0sXG5cblx0XHRvblByZXZQYWdlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5wcmV2UGFnZSgpO1xuXHRcdH0sXG5cblx0XHRvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnW2RhdGEtcGFnZT1cIicrdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSsnXCJdJykucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdwYWdlJykgPT0gMSkge1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCcucHJldi1wYWdlJykucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IHRoaXMuZ2V0VG90YWxQYWdlcygpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygnbGlzdCcsIG5ldyBUb29sYm94LlBhZ2luYXRpb25MaXN0KHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb25cbiAgICAgICAgICAgIH0pKTtcblx0XHR9LFxuXG5cdFx0c2V0U2hvd1BhZ2VzOiBmdW5jdGlvbihzaG93UGFnZXMpIHtcblx0XHRcdHRoaXMub3B0aW9ucy5zaG93UGFnZXMgPSBzaG93UGFnZXM7XG5cdFx0fSxcblxuXHRcdGdldFNob3dQYWdlczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3Nob3dQYWdlcycpO1xuXHRcdH0sXG5cblx0XHRzZXRUb3RhbFBhZ2VzOiBmdW5jdGlvbih0b3RhbFBhZ2VzKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMudG90YWxQYWdlcyA9IHRvdGFsUGFnZXM7XG5cdFx0fSxcblxuXHRcdGdldFRvdGFsUGFnZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cdFx0fSxcblxuXHRcdHNldFBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcblx0XHR9LFxuXG5cdFx0Z2V0UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHR9LFxuXG5cdFx0c2V0UGFnaW5hdGlvbkxpbmtzOiBmdW5jdGlvbihwYWdlLCB0b3RhbFBhZ2VzKSB7XG5cdFx0XHR0aGlzLnNldFBhZ2UocGFnZSk7XG5cdFx0XHR0aGlzLnNldFRvdGFsUGFnZXModG90YWxQYWdlcyk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0sXG5cblx0XHRzZXRBY3RpdmVQYWdlOiBmdW5jdGlvbihwYWdlKSB7XG5cdFx0XHRpZih0aGlzLm9wdGlvbnMucGFnZSAhPSBwYWdlKSB7XG5cdFx0XHRcdHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcblx0XHRcdFx0dGhpcy5yZW5kZXIoKTtcblxuXHRcdFx0XHR2YXIgcXVlcnkgPSB0aGlzLmNvbGxlY3Rpb24ud2hlcmUoe3BhZ2U6IHBhZ2V9KTtcblxuXHRcdFx0XHRpZihxdWVyeS5sZW5ndGgpIHtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3BhZ2luYXRlJywgcGFnZSwgdGhpcy5jaGlsZHJlbi5maW5kQnlNb2RlbChxdWVyeVswXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGdldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0fVxuXG5cdH0pO1xuICAgICovXG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LlByb2dyZXNzQmFyID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncHJvZ3Jlc3MtYmFyJyksXG5cblx0XHRjbGFzc05hbWU6ICdwcm9ncmVzcycsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKHN0cmluZykgVGhlIHByb2dyZXNzIGJhciBjbGFzcyBuYW1lXG5cdFx0XHRwcm9ncmVzc0JhckNsYXNzTmFtZTogJ3Byb2dyZXNzLWJhcicsXG5cblx0XHRcdC8vIChpbnQpIFRoZSBwcm9ncmVzcyBwZXJjZW50YWdlXG5cdFx0XHRwcm9ncmVzczogMFxuXHRcdH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdHNldFByb2dyZXNzOiBmdW5jdGlvbihwcm9ncmVzcykge1xuXHRcdFx0aWYocHJvZ3Jlc3MgPCAwKSB7XG5cdFx0XHRcdHByb2dyZXNzID0gMDtcblx0XHRcdH1cblxuXHRcdFx0aWYocHJvZ3Jlc3MgPiAxMDApIHtcblx0XHRcdFx0cHJvZ3Jlc3MgPSAxMDA7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub3B0aW9ucy5wcm9ncmVzcyA9IHByb2dyZXNzO1xuXHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdwcm9ncmVzcycsIHByb2dyZXNzKTtcblxuXHRcdFx0aWYocHJvZ3Jlc3MgPT09IDEwMCkge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2NvbXBsZXRlJyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGdldFByb2dyZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbigncHJvZ3Jlc3MnKTtcblx0XHR9LFxuXG5cdFx0b25Qcm9ncmVzczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5SYWRpb0ZpZWxkID0gVG9vbGJveC5CYXNlRmllbGQuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS1yYWRpby1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIG9wdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogJ3JhZGlvJyxcbiAgICAgICAgICAgIGlucHV0Q2xhc3NOYW1lOiAncmFkaW8nLFxuICAgICAgICAgICAgY2hlY2tib3hDbGFzc05hbWU6ICdyYWRpbydcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCc6Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldElucHV0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnW3ZhbHVlPVwiJyt2YWx1ZSsnXCJdJykuYXR0cignY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5TZWxlY3RGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tc2VsZWN0LWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAnc2VsZWN0JyxcbiAgICAgICAgICAgIG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IFtdXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjaGFuZ2UgLmZvcm0tY29udHJvbCc6ICdjaGFuZ2UnXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnc2VsZWN0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh0aGlzLmdldElucHV0RmllbGQoKS5maW5kKCdvcHRpb246Zmlyc3QnKS52YWwoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnbm91aXNsaWRlciddLCBmdW5jdGlvbihub1VpU2xpZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIG5vVWlTbGlkZXIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdub3Vpc2xpZGVyJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Lm5vVWlTbGlkZXIpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIG5vVWlTbGlkZXIpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guUmFuZ2VTbGlkZXIgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncmFuZ2Utc2xpZGVyJyksXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChib29sKSBTaG91bGQgdGhlIHNsaWRlciBiZSBhbmltYXRlXG4gICAgICAgICAgICBhbmltYXRlOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBDbGljayBlZmZlY3RzIGZvciBtYW5pcHVsYXRpbmcgdGhlIHNsaWRlci5cbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIHZhbHVlczogXCJkcmFnXCIsIFwidGFwXCIsIFwiZml4ZWRcIiwgXCJzbmFwXCIgb3IgXCJub25lXCJcbiAgICAgICAgICAgIGJlaGF2aW9yOiAndGFwJyxcblxuICAgICAgICAgICAgLy8gKG1peGVkKSBTaG91bGQgdGhlIGhhbmRsZXMgYmUgY29ubmVjdGVkLlxuICAgICAgICAgICAgLy8gUG9zc2libGUgdmFsdWVzOiB0cnVlLCBmYWxzZSwgXCJ1cHBlclwiLCBvciBcImxvd2VyXCJcbiAgICAgICAgICAgIGNvbm5lY3Q6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgZGlyZWN0aW9uIG9mIHRoZSBzbGlkZXIuIFwibHRyXCIgb3IgXCJydGxcIlxuICAgICAgICAgICAgZGlyZWN0aW9uOiAnbHRyJyxcblxuICAgICAgICAgICAgLy8gKGludCkgVGhlIG1heGltdW0gZGlzdGFuY2UgdGhlIGhhbmRsZXMgY2FuIGJlIGZyb20gZWFjaCBvdGhlclxuICAgICAgICAgICAgLy8gZmFsc2UgZGlzYWJsZXMgdGhpcyBvcHRpb24uXG4gICAgICAgICAgICBsaW1pdDogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBtaW5pbXVtIGRpc3RhbmNlIHRoZSBoYW5kbGVzIGNhbiBiZSBmcm9tIGVhY2ggb3RoZXJcbiAgICAgICAgICAgIC8vIGZhbHNlIGRpc2FibGVkIHRoaXMgb3B0aW9uXG4gICAgICAgICAgICBtYXJnaW46IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgb3JpZW50YXRpb24gb2YgdGhlIHNsaWRlci4gXCJob3Jpem9udGFsXCIgb3IgXCJ2ZXJ0aWNhbFwiXG4gICAgICAgICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIHN0YXJ0aW5nIHBvc3NpdGlvbiBvZiB0aGUgc2xpZGVyIGhhbmRsZXNcbiAgICAgICAgICAgIHN0YXJ0OiBbMF0sXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBzdGVwIGludGVnZXJcbiAgICAgICAgICAgIHN0ZXA6IDAsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIHRoZSByYW5nZSBvYmplY3QgZGVmaW5lZCB0aGUgbWluL21heCB2YWx1ZXNcbiAgICAgICAgICAgIHJhbmdlOiB7XG4gICAgICAgICAgICAgICAgbWluOiBbMF0sXG4gICAgICAgICAgICAgICAgbWF4OiBbMTAwXVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZTogdGhpcy5nZXRPcHRpb24oJ2FuaW1hdGUnKSxcbiAgICAgICAgICAgICAgICBiZWhhdmlvcjogdGhpcy5nZXRPcHRpb24oJ2JlaGF2aW9yJyksXG4gICAgICAgICAgICAgICAgY29ubmVjdDogdGhpcy5nZXRPcHRpb24oJ2Nvbm5lY3QnKSxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IHRoaXMuZ2V0T3B0aW9uKCdkaXJlY3Rpb24nKSxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogdGhpcy5nZXRPcHRpb24oJ29yaWVudGF0aW9uJyksXG4gICAgICAgICAgICAgICAgcmFuZ2U6IHRoaXMuZ2V0T3B0aW9uKCdyYW5nZScpLFxuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldE9wdGlvbignc3RhcnQnKSxcbiAgICAgICAgICAgICAgICBzdGVwOiB0aGlzLmdldE9wdGlvbignc3RlcCcpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbWFyZ2luJykgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5tYXJnaW4gPSB0aGlzLmdldE9wdGlvbignbWFyZ2luJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdsaW1pdCcpICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubGltaXQgPSB0aGlzLmdldE9wdGlvbignbGltaXQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNsaWRlciA9IHRoaXMuJGVsLmZpbmQoJy5zbGlkZXInKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHNsaWRlciA9IG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHNsaWRlci5vbignc2xpZGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3NsaWRlJywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXIub24oJ3NldCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc2V0JywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnY2hhbmdlJywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNsaWRlckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJy5zbGlkZXInKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmdldFNsaWRlckVsZW1lbnQoKS52YWwodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkuYXR0cignZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2JhY2tib25lJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbihCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5CYWNrYm9uZSwgcm9vdC5NYXJpb25ldHRlLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEJhY2tib25lLCBNYXJpb25ldHRlLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlN0b3JhZ2UgPSBNYXJpb25ldHRlLk9iamVjdC5leHRlbmQoe1xuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICB0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBzdG9yYWdlRW5naW5lOiBsb2NhbFN0b3JhZ2UsXG4gICAgICAgICAgICBkYXRhQ2xhc3M6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YTogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgICAgICBNYXJpb25ldHRlLk9iamVjdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBUb29sYm94Lk9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMudGFibGVOYW1lKCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgXFwndGFibGVcXCcgb3B0aW9uIG11c3QgYmUgc2V0IHdpdGggYSB2YWxpZCB0YWJsZSBuYW1lLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdkYXRhJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZGF0YScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5naW5lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignc3RvcmFnZUVuZ2luZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRhYmxlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RhYmxlJylcbiAgICAgICAgfSxcblxuICAgICAgICBkb2VzVGFibGVFeGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIV8uaXNOdWxsKHRoaXMuZW5naW5lKCkuZ2V0SXRlbSh0aGlzLnRhYmxlTmFtZSgpKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlVGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuZG9lc1RhYmxlRXhpc3QoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3lUYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVuZ2luZSgpLnJlbW92ZUl0ZW0odGhpcy50YWJsZU5hbWUoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UodGhpcy5lbmdpbmUoKS5nZXRJdGVtKHRoaXMudGFibGVOYW1lKCkpKTtcbiAgICAgICAgICAgIHZhciBEYXRhQ2xhc3MgPSBfLmlzQXJyYXkoZGF0YSkgPyBCYWNrYm9uZS5Db2xsZWN0aW9uIDogQmFja2JvbmUuTW9kZWw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdkYXRhQ2xhc3MnKSkge1xuICAgICAgICAgICAgICAgIERhdGFDbGFzcyAgPSB0aGlzLmdldE9wdGlvbignZGF0YUNsYXNzJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZGF0YSA9IG5ldyBEYXRhQ2xhc3MoZGF0YSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZGF0YScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmdpbmUoKS5zZXRJdGVtKHRoaXMudGFibGVOYW1lKCksIEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0T3B0aW9uKCdkYXRhJykudG9KU09OKCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICAvLyBUT0RPOiBBZGQgS2V5U3RvcmVcbiAgICAvKlxuICAgIFRvb2xib3guS2V5U3RvcmUgPSBUb29sYm94LlN0b3JhZ2UuZXh0ZW5kKHtcblxuICAgIH0pO1xuICAgICovXG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZScsICdpbnRlcmFjdC5qcyddLCBmdW5jdGlvbigkLCBfLCBpbnRlcmFjdCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfLCBpbnRlcmFjdCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpLFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnaW50ZXJhY3QuanMnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXywgcm9vdC5pbnRlcmFjdCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXywgaW50ZXJhY3QpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGZ1bmN0aW9uIGZpbmQoaWQsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHdoZXJlID0gZ2V0V2hlcmUoaWQpO1xuXG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbmQod2hlcmUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFdoZXJlKGlkKSB7XG4gICAgICAgIHZhciB3aGVyZSA9IHt9O1xuXG4gICAgICAgIHdoZXJlW2dldElkQXR0cmlidXRlKGlkKV0gPSBpZDtcblxuICAgICAgICByZXR1cm4gd2hlcmU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SWRBdHRyaWJ1dGUodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIF8uaXNOdWxsKG5ldyBTdHJpbmcodmFsdWUpLm1hdGNoKC9eY1xcZCskLykpID8gJ2lkJyA6ICdjaWQnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChlbGVtZW50LCB2aWV3KSB7XG4gICAgICAgIHZhciAkcGFyZW50ID0gJChlbGVtZW50KTtcblxuICAgICAgICBpZighJHBhcmVudC5oYXNDbGFzcygnZHJvcHBhYmxlLXBvb2wnKSkge1xuICAgICAgICAgICAgJHBhcmVudCA9ICRwYXJlbnQucGFyZW50cygnLmRyb3BwYWJsZS1wb29sJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJHBhcmVudC5oYXNDbGFzcygnYXZhaWxhYmxlLXBvb2wnKSA/XG4gICAgICAgICAgICB2aWV3LmdldFJlZ2lvbignYXZhaWxhYmxlJykuY3VycmVudFZpZXcgOlxuICAgICAgICAgICAgdmlldy5nZXRSZWdpb24oJ3NlbGVjdGVkJykuY3VycmVudFZpZXc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNmZXJOb2RlQWZ0ZXIoZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgdmFyIGZyb21XaGVyZSA9IHt9LCB0b1doZXJlID0ge307XG4gICAgICAgIHZhciBmcm9tID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnJlbGF0ZWRUYXJnZXQsIHZpZXcpO1xuICAgICAgICB2YXIgdG8gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0LCB2aWV3KTtcblxuICAgICAgICBmcm9tV2hlcmVbZ2V0SWRBdHRyaWJ1dGUoJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gICAgICAgIHRvV2hlcmVbZ2V0SWRBdHRyaWJ1dGUoJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpO1xuXG4gICAgICAgIHZhciBmcm9tTW9kZWwgPSBmcm9tLmNvbGxlY3Rpb24uZmluZFdoZXJlKGZyb21XaGVyZSk7XG4gICAgICAgIHZhciB0b01vZGVsID0gdG8uY29sbGVjdGlvbi5maW5kV2hlcmUodG9XaGVyZSk7XG5cbiAgICAgICAgZnJvbS5jb2xsZWN0aW9uLnJlbW92ZU5vZGUoZnJvbU1vZGVsKTtcbiAgICAgICAgdG8uY29sbGVjdGlvbi5hcHBlbmROb2RlQWZ0ZXIoZnJvbU1vZGVsLCB0b01vZGVsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zlck5vZGVCZWZvcmUoZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgdmFyIGZyb21XaGVyZSA9IHt9LCB0b1doZXJlID0ge307XG4gICAgICAgIHZhciBmcm9tID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnJlbGF0ZWRUYXJnZXQsIHZpZXcpO1xuICAgICAgICB2YXIgdG8gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0LCB2aWV3KTtcblxuXG4gICAgICAgIGZyb21XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICAgICAgdG9XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgdmFyIGZyb21Nb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUoZnJvbVdoZXJlKTtcbiAgICAgICAgdmFyIHRvTW9kZWwgPSB0by5jb2xsZWN0aW9uLmZpbmRXaGVyZSh0b1doZXJlKTtcblxuICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShmcm9tTW9kZWwpO1xuICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGVCZWZvcmUoZnJvbU1vZGVsLCB0b01vZGVsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zlck5vZGVDaGlsZHJlbihldmVudCwgdmlldykge1xuICAgICAgICB2YXIgZnJvbVdoZXJlID0ge30sIHRvV2hlcmUgPSB7fTtcbiAgICAgICAgdmFyIGZyb20gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCwgdmlldyk7XG4gICAgICAgIHZhciB0byA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC50YXJnZXQsIHZpZXcpO1xuXG4gICAgICAgIGlmKCQoZXZlbnQudGFyZ2V0KS5maW5kKCcuY2hpbGRyZW4nKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImNoaWxkcmVuXCIgLz4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyb21XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICAgICAgdG9XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgdmFyIGZyb21Nb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUoZnJvbVdoZXJlKTtcbiAgICAgICAgdmFyIHRvTW9kZWwgPSB0by5jb2xsZWN0aW9uLmZpbmRXaGVyZSh0b1doZXJlKTtcblxuICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShmcm9tTW9kZWwpO1xuICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGUoZnJvbU1vZGVsLCB0b01vZGVsLCB7XG4gICAgICAgICAgICBhdDogMFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBUb29sYm94LlNlbGVjdGlvblBvb2wgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnc2VsZWN0aW9uLXBvb2wnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICdzZWxlY3Rpb24tcG9vbCcsXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgYXZhaWxhYmxlOiAnLmF2YWlsYWJsZS1wb29sJyxcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnLnNlbGVjdGVkLXBvb2wnLFxuICAgICAgICAgICAgLy9hY3Rpdml0eTogJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtYWN0aXZpdHknXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuZXN0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlOiBbXSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlldzogVG9vbGJveC5TZWxlY3Rpb25Qb29sVHJlZVZpZXcsXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlld1RlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdzZWxlY3Rpb24tcG9vbC10cmVlLW5vZGUnKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWU6IFtdLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXc6IFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVWaWV3LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWVWaWV3VGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3NlbGVjdGlvbi1wb29sLXRyZWUtbm9kZScpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwaW5nU3RvcHBlZFRocmVzaG9sZDogNTAwLFxuICAgICAgICAgICAgICAgIGxpa2VuZXNzVGhyZXNob2xkOiA3NSxcbiAgICAgICAgICAgICAgICBzY3JvbGxCb3R0b21UaHJlc2hvbGQ6IDEwLFxuICAgICAgICAgICAgICAgIHNlYXJjaEluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAndGlueSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXInOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJTZWFyY2goKTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vZmYoJ2RldGVjdGlvbjp0eXBpbmc6c3RhcnRlZCcsIGZhbHNlLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vZmYoJ2RldGVjdGlvbjp0eXBpbmc6c3RvcHBlZCcsIGZhbHNlLCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwub24oJ2RldGVjdGlvbjp0eXBpbmc6c3RhcnRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgndHlwaW5nOnN0YXJ0ZWQnKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwub24oJ2RldGVjdGlvbjp0eXBpbmc6c3RvcHBlZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd0eXBpbmc6c3RvcHBlZCcsIHZhbHVlKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTZWFyY2hBY3Rpdml0eTogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoLWFjdGl2aXR5JykucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoJykuYXBwZW5kKFtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInNlbGVjdGlvbi1wb29sLXNlYXJjaC1hY3Rpdml0eVwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2VsZWN0aW9uLXBvb2wtc2VhcmNoLWFjdGl2aXR5LWxhYmVsXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIChtZXNzYWdlIHx8ICdMb2FkaW5nLi4uJyksXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nLFxuICAgICAgICAgICAgICAgICc8L2Rpdj4nXG4gICAgICAgICAgICBdLmpvaW4oJycpKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLiRlbC5hZGRDbGFzcygnc2hvdy1hY3Rpdml0eScpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVTZWFyY2hBY3Rpdml0eTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzaG93LWFjdGl2aXR5Jyk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi4kZWwuZmluZCgnLnNlbGVjdGlvbi1wb29sLXNlYXJjaC1hY3Rpdml0eScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSwgMjUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QXZhaWxhYmxlUG9vbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIFZpZXcgPSB0aGlzLmdldE9wdGlvbignYXZhaWxhYmxlVHJlZVZpZXcnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICBcdFx0dmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuZ2V0T3B0aW9uKCdhdmFpbGFibGVUcmVlJyksXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld09wdGlvbnM6IF8uZXh0ZW5kKHt9LCBWaWV3LnByb3RvdHlwZS5jaGlsZFZpZXdPcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0YWJsZTogdGhpcy5nZXRPcHRpb24oJ25lc3RhYmxlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3VGVtcGxhdGUnKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICBcdFx0fSwgdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3T3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgICAgICB2aWV3LmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVzZXRTY3JvbGxCb3R0b20uY2FsbChzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dTZWxlY3Rpb25Qb29sVmlldyh0aGlzLmdldFJlZ2lvbignYXZhaWxhYmxlJyksIHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTZWxlY3RlZFBvb2w6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlVmlldycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgIFx0XHR2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5nZXRPcHRpb24oJ3NlbGVjdGVkVHJlZScpLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiBfLmV4dGVuZCh7fSwgVmlldy5wcm90b3R5cGUuY2hpbGRWaWV3T3B0aW9ucywge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGFibGU6IHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZ2V0T3B0aW9uKCdzZWxlY3RlZFRyZWVWaWV3VGVtcGxhdGUnKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICBcdFx0fSwgdGhpcy5nZXRPcHRpb24oJ3NlbGVjdGVkVHJlZVZpZXdPcHRpb25zJykpKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1NlbGVjdGlvblBvb2xWaWV3KHRoaXMuZ2V0UmVnaW9uKCdzZWxlY3RlZCcpLCB2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93U2VsZWN0aW9uUG9vbFZpZXc6IGZ1bmN0aW9uKHJlZ2lvbiwgdmlldykge1xuICAgICAgICAgICAgdmlldy5vbignZHJvcDpiZWZvcmUnLCBmdW5jdGlvbihldmVudCwgdmlldykge1xuICAgICAgICAgICAgICAgIHRyYW5zZmVyTm9kZUJlZm9yZShldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkcm9wOmJlZm9yZScsIGV2ZW50LCB2aWV3KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdkcm9wOmFmdGVyJywgZnVuY3Rpb24oZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zlck5vZGVBZnRlcihldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHZpZXcpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ2Ryb3A6Y2hpbGRyZW4nLCBmdW5jdGlvbihldmVudCwgdmlldykge1xuICAgICAgICAgICAgICAgIHRyYW5zZmVyTm9kZUNoaWxkcmVuKGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgdmlldyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgdmlldy5vbignZHJvcCcsIGZ1bmN0aW9uKGV2ZW50LCB2aWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkcm9wJywgZXZlbnQsIHZpZXcpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJlZ2lvbi5zaG93KHZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vZGVsQ29udGFpbnM6IGZ1bmN0aW9uKG1vZGVsLCBxdWVyeSkge1xuICAgICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiBtb2RlbCA9IG1vZGVsLnRvSlNPTigpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbW9kZWxbaV07XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLmNvbnRhaW5zLmNhbGwodGhpcywgdmFsdWUsIHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjb250YWluczogZnVuY3Rpb24oc3ViamVjdCwgcXVlcnkpIHtcbiAgICAgICAgICAgIGlmKCFfLmlzU3RyaW5nKHN1YmplY3QpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gcXVlcnkgPSBxdWVyeS5zcGxpdCgnICcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcXVlcnlbaV07XG5cbiAgICAgICAgICAgICAgICBpZihzdWJqZWN0LnRvVXBwZXJDYXNlKCkuaW5jbHVkZXModmFsdWUudG9VcHBlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGNvbXBhcmlzb24gPSBuZXcgVG9vbGJveC5MZXZlbnNodGVpbih2YWx1ZS50b1VwcGVyQ2FzZSgpLCBzdWJqZWN0LnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICAgICAgICAgIHZhciBwZXJjZW50ID0gY29tcGFyaXNvbi5kaXN0YW5jZSAvIHN1YmplY3QubGVuZ3RoICogMTAwIC0gMTAwO1xuXG4gICAgICAgICAgICAgICAgaWYocGVyY2VudCA+IHRoaXMuZ2V0T3B0aW9uKCdsaWtlbmVzc1RocmVzaG9sZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlYXJjaDogZnVuY3Rpb24oY29sbGVjdGlvbiwgcXVlcnkpIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5tb2RlbENvbnRhaW5zKG1vZGVsLCBxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ2hpZGRlbicsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuYXZhaWxhYmxlLmN1cnJlbnRWaWV3LnJlbmRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyU2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtZmllbGQgaW5wdXQnKS52YWwoJycpLmZvY3VzKCk7XG4gICAgICAgICAgICB0aGlzLmhpZGVDbGVhclNlYXJjaEJ1dHRvbigpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd0eXBpbmc6c3RvcHBlZCcsICcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q2xlYXJTZWFyY2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNlbGVjdGlvbi1wb29sLXNlYXJjaC1jbGVhcicpLmFkZENsYXNzKCdzaG93Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZUNsZWFyU2VhcmNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXInKS5yZW1vdmVDbGFzcygnc2hvdycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uVHlwaW5nU3RhcnRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25UeXBpbmdTdG9wcGVkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDbGVhclNlYXJjaEJ1dHRvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlQ2xlYXJTZWFyY2hCdXR0b24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5hdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaCh0aGlzLmdldFJlZ2lvbignYXZhaWxhYmxlJykuY3VycmVudFZpZXcuY29sbGVjdGlvbiwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlc2V0U2Nyb2xsQm90dG9tOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbEF0Qm90dG9tID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxIZWlnaHQgPSB0aGlzLmdldFJlZ2lvbignYXZhaWxhYmxlJykuY3VycmVudFZpZXcuJGVsLnBhcmVudCgpLnByb3AoJ3Njcm9sbEhlaWdodCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIGRldGVjdGlvbiA9IG5ldyBUb29sYm94LlR5cGluZ0RldGVjdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoIGlucHV0JyksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3R5cGluZ1N0b3BwZWRUaHJlc2hvbGQnKSxcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHZhciAkYXZhaWxhYmxlUG9vbCA9IHRoaXMuZ2V0UmVnaW9uKCdhdmFpbGFibGUnKS5jdXJyZW50Vmlldy4kZWwucGFyZW50KCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2xhc3RTY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsQXRCb3R0b20gPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYuX3Njcm9sbEhlaWdodCA9ICRhdmFpbGFibGVQb29sLnByb3AoJ3Njcm9sbEhlaWdodCcpO1xuXG4gICAgICAgICAgICAkYXZhaWxhYmxlUG9vbC5zY3JvbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNjcm9sbFRvcCA9ICQodGhpcykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVzaG9sZCA9IHNlbGYuZ2V0T3B0aW9uKCdzY3JvbGxCb3R0b21UaHJlc2hvbGQnKTtcblxuICAgICAgICAgICAgICAgIHNlbGYuX2lzU2Nyb2xsaW5nRG93biA9IHNjcm9sbFRvcCA+IHNlbGYuX2xhc3RTY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNQYXN0VGhyZXNob2xkID0gc2Nyb2xsVG9wICsgJCh0aGlzKS5oZWlnaHQoKSA+PSBzZWxmLl9zY3JvbGxIZWlnaHQgLSB0aHJlc2hvbGQ7XG5cbiAgICAgICAgICAgICAgICBpZihzZWxmLl9pc1Njcm9sbGluZ0Rvd24gJiYgc2VsZi5faXNQYXN0VGhyZXNob2xkICYmICFzZWxmLl9zY3JvbGxBdEJvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zY3JvbGxBdEJvdHRvbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnc2Nyb2xsOmJvdHRvbScsIHNjcm9sbFRvcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFzZWxmLl9pc1Njcm9sbGluZ0Rvd24gJiYgIXNlbGYuX2lzUGFzdFRocmVzaG9sZCl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Njcm9sbEF0Qm90dG9tID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fbGFzdFNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuZHJvcHBhYmxlLXBvb2wnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciAkcG9vbCA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpbnRlcmFjdCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAuZHJvcHpvbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXB0OiAkKHRoaXMpLmRhdGEoJ2FjY2VwdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25kcm9wOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aGVyZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcm9tID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnJlbGF0ZWRUYXJnZXQsIHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0byA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC50YXJnZXQsIHNlbGYpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmVbZ2V0SWRBdHRyaWJ1dGUoJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBmcm9tLmNvbGxlY3Rpb24uZmluZFdoZXJlKHdoZXJlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20uY29sbGVjdGlvbi5yZW1vdmVOb2RlKG1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGUobW9kZWwsIG51bGwsIHthdDogJChldmVudC5yZWxhdGVkVGFyZ2V0KS5pbmRleCgpfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLiRlbC5yZW1vdmVDbGFzcygnZHJvcHBpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcG9vbC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdwb29sOmRyb3AnLCBldmVudCwgbW9kZWwsIGZyb20sIHRvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmRyYWdlbnRlcjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi4kZWwuYWRkQ2xhc3MoJ2Ryb3BwaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHBvb2wucGFyZW50KCkuYWRkQ2xhc3MoJ2Ryb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgncG9vbDpkcmFnOmVudGVyJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZHJhZ2xlYXZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLiRlbC5yZW1vdmVDbGFzcygnZHJvcHBpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcG9vbC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdwb29sOmRyYWc6bGVhdmUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93QXZhaWxhYmxlUG9vbCgpO1xuICAgICAgICAgICAgdGhpcy5zaG93U2VsZWN0ZWRQb29sKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdqcXVlcnknXSwgZnVuY3Rpb24oXywgJCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCAkKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LiQpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQpIHtcblxuICAgIFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVOb2RlID0gVG9vbGJveC5EcmFnZ2FibGVUcmVlTm9kZS5leHRlbmQoe1xuXG4gICAgICAgIG9uRHJvcDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcywgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICAgICAgaWYoJHRhcmdldC5oYXNDbGFzcygnZHJvcC1iZWZvcmUnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YmVmb3JlJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZigkdGFyZ2V0Lmhhc0NsYXNzKCdkcm9wLWFmdGVyJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZigkdGFyZ2V0Lmhhc0NsYXNzKCdkcm9wLWNoaWxkcmVuJykpIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbmVzdGFibGUnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmNoaWxkcmVuJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3AnLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guRHJhZ2dhYmxlVHJlZU5vZGUucHJvdG90eXBlLm9uRG9tUmVmcmVzaC5jYWxsKHRoaXMpO1xuXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsLmdldCgnaGlkZGVuJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICBUb29sYm94LlNlbGVjdGlvblBvb2xUcmVlVmlldyA9IFRvb2xib3guRHJhZ2dhYmxlVHJlZVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVOb2RlXG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UYWJDb250ZW50ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFiLWNvbnRlbnQnKSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRuYW1lOiBmYWxzZSxcblxuXHRcdFx0aWQ6IGZhbHNlLFxuXG5cdFx0XHRjb250ZW50OiBmYWxzZVxuXHRcdH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cdFRvb2xib3guVGFicyA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYnMnKSxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIFtkYXRhLXRvZ2dsZT1cInRhYlwiXSc6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCd0YWI6Y2xpY2snLCAkKGUudGFyZ2V0KS5hdHRyKCdocmVmJykpO1xuXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdGNvbnRlbnRWaWV3OiBUb29sYm94LlRhYkNvbnRlbnQsXG5cblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cbiAgICAgICAgICAgIHRhYkNsYXNzTmFtZTogJ25hdiBuYXYtdGFicycsXG5cblx0XHRcdHRhYlBhbmVDbGFzc05hbWU6ICd0YWItcGFuZScsXG5cblx0XHRcdGNvbnRlbnQ6IFtdXG5cdFx0fSxcblxuXHRcdHRhYlZpZXdzOiBbXSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZpZXdOYW1lOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICByZXR1cm4gdmlldy5nZXRPcHRpb24oJ3RhYk5hbWUnKSA/IHZpZXcuZ2V0T3B0aW9uKCd0YWJOYW1lJykgOiAoXG4gICAgICAgICAgICAgICAgdmlldy5nZXRPcHRpb24oJ25hbWUnKSA/IHZpZXcuZ2V0T3B0aW9uKCduYW1lJykgOiBudWxsXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZpZXdMYWJlbDogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcuZ2V0T3B0aW9uKCd0YWJMYWJlbCcpID8gdmlldy5nZXRPcHRpb24oJ3RhYkxhYmVsJykgOiAoXG4gICAgICAgICAgICAgICAgdmlldy5nZXRPcHRpb24oJ2xhYmVsJykgPyB2aWV3LmdldE9wdGlvbignbGFiZWwnKSA6IG51bGxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlVGFiOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0Vmlld05hbWUodmlldyk7XG5cbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcubmF2LXRhYnMnKS5maW5kKCdbaHJlZj1cIiMnK25hbWUrJ1wiXScpLnBhcmVudCgpLnJlbW92ZSgpO1xuXG4gICAgICAgIFx0dGhpcy5yZWdpb25NYW5hZ2VyLnJlbW92ZVJlZ2lvbihuYW1lKTtcblxuICAgICAgICBcdHRoaXMuJGVsLmZpbmQoJyMnK25hbWUpLnJlbW92ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZFRhYjogZnVuY3Rpb24odmlldywgc2V0QWN0aXZlKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0Vmlld05hbWUodmlldyk7XG4gICAgICAgIFx0dmFyIHRhYiA9ICc8bGkgcm9sZT1cInByZXNlbnRhdGlvblwiPjxhIGhyZWY9XCIjJytuYW1lKydcIiBhcmlhLWNvbnRyb2xzPVwiJytuYW1lKydcIiByb2xlPVwidGFiXCIgZGF0YS10b2dnbGU9XCJ0YWJcIj4nK3RoaXMuZ2V0Vmlld0xhYmVsKHZpZXcpKyc8L2E+PC9saT4nO1xuXG4gICAgICAgIFx0dmFyIGh0bWwgPSAnPGRpdiByb2xlPVwidGFicGFuZWxcIiBjbGFzcz1cIicrdGhpcy5nZXRPcHRpb24oJ3RhYlBhbmVDbGFzc05hbWUnKSsnXCIgaWQ9XCInK25hbWUrJ1wiIC8+JztcblxuICAgICAgICBcdHRoaXMuJGVsLmZpbmQoJy5uYXYtdGFicycpLmFwcGVuZCh0YWIpO1xuICAgICAgICBcdHRoaXMuJGVsLmZpbmQoJy50YWItY29udGVudCcpLmFwcGVuZChodG1sKTtcblx0XHRcdHRoaXMuYWRkUmVnaW9uKG5hbWUsICcjJytuYW1lKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldyhuYW1lLCB2aWV3KTtcblxuXHRcdFx0aWYoc2V0QWN0aXZlKSB7XG5cdFx0XHRcdHRoaXMuc2V0QWN0aXZlVGFiKHZpZXcpO1xuXHRcdFx0fVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRfLmVhY2godGhpcy5nZXRPcHRpb24oJ2NvbnRlbnQnKSwgZnVuY3Rpb24ob2JqLCBpKSB7XG4gICAgICAgIFx0XHRpZihvYmouY2lkKSB7XG4gICAgICAgIFx0XHRcdHRoaXMuYWRkVGFiKG9iaik7XG4gICAgICAgIFx0XHR9XG4gICAgICAgIFx0XHRlbHNlIHtcbiAgICAgICAgXHRcdFx0dmFyIGNvbnRlbnRWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2NvbnRlbnRWaWV3Jyk7XG5cblx0XHRcdFx0XHRpZihfLmlzT2JqZWN0KG9iai52aWV3KSkge1xuXHRcdFx0XHRcdFx0Y29udGVudFZpZXcgPSBvYmoudmlldztcblxuXHRcdFx0XHRcdFx0ZGVsZXRlIG9iai52aWV3O1xuXHRcdFx0XHRcdH1cblxuXHQgICAgICAgIFx0XHR0aGlzLmFkZFRhYihuZXcgY29udGVudFZpZXcob2JqKSk7XG4gICAgICAgIFx0XHR9XG4gICAgICAgIFx0fSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlVGFiOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBcdGlmKF8uaXNPYmplY3QoaWQpKSB7XG4gICAgICAgIFx0XHRpZCA9IGlkLmdldE9wdGlvbignbmFtZScpO1xuICAgICAgICBcdH1cblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdbaHJlZj1cIicraWQrJ1wiXScpXG4gICAgICAgICAgICAgICAgLnBhcmVudCgpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoaWQpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2V0OmFjdGl2ZTp0YWInLCBpZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGVudFZpZXc6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIFx0aWYodGhpc1tpZF0gJiYgdGhpc1tpZF0uY3VycmVudFZpZXcpIHtcbiAgICAgICAgXHRcdHJldHVybiB0aGlzW2lkXS5jdXJyZW50VmlldztcbiAgICAgICAgXHR9XG5cbiAgICAgICAgXHRyZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcdGlmKCF0aGlzLmdldE9wdGlvbignYWN0aXZlVGFiJykpIHtcblx0ICAgICAgICBcdHRoaXMuJGVsLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXTpmaXJzdCcpLmNsaWNrKCk7XG5cdCAgICAgICAgfVxuXHQgICAgICAgIGVsc2Uge1xuXHQgICAgICAgIFx0dGhpcy5zZXRBY3RpdmVUYWIodGhpcy5nZXRPcHRpb24oJ2FjdGl2ZVRhYicpKTtcblx0ICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25UYWJDbGljazogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgXHR0aGlzLnNldEFjdGl2ZVRhYihpZCk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UZXh0QXJlYUZpZWxkID0gVG9vbGJveC5CYXNlRmllbGQuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS10ZXh0YXJlYS1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RvcjogJ3RleHRhcmVhJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ3RleHRhcmVhJyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbigkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVGFibGVOb0l0ZW1zUm93ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGFnTmFtZTogJ3RyJyxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtbm8taXRlbXMnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICduby1yZXN1bHRzJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZXJlIGFyZSBubyB0YWJsZSByb3dzXG4gICAgICAgICAgICBtZXNzYWdlOiAnTm8gcm93cyBmb3VuZCdcbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guVGFibGVWaWV3Um93ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGFnTmFtZTogJ3RyJyxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtdmlldy1yb3cnKSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAobWl4ZWQpIElmIG5vdCBmYWxzZSwgcGFzcyBhIHZhbGlkIFZpZXcgcHJvdG90eXBlXG4gICAgICAgICAgICBlZGl0Rm9ybUNsYXNzOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG1peGVkKSBJZiBub3QgZmFsc2UsIHBhc3MgYSB2YWxpZCBWaWV3IHByb3RvdHlwZVxuICAgICAgICAgICAgZGVsZXRlRm9ybUNsYXNzOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmVkaXQnOiAnY2xpY2s6ZWRpdCcsXG4gICAgICAgICAgICAnY2xpY2sgLmRlbGV0ZSc6ICdjbGljazpkZWxldGUnXG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrRWRpdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlZGl0Rm9ybUNsYXNzJyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZpZXcub24oJ3N1Ym1pdDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dWaWV3SW5Nb2RhbCh2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrRGVsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2RlbGV0ZUZvcm1DbGFzcycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyh7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dWaWV3SW5Nb2RhbCh2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Vmlld0luTW9kYWw6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgIHZhciBtb2RhbCA9IG5ldyBUb29sYm94Lk1vZGFsKHtcbiAgICAgICAgICAgICAgICBjb250ZW50Vmlldzogdmlld1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ3N1Ym1pdDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbW9kYWwuaGlkZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1vZGFsLnNob3coKTtcblxuICAgICAgICAgICAgcmV0dXJuIG1vZGFsO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guVGFibGVWaWV3Qm9keSA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAndGJvZHknLFxuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5UYWJsZVZpZXdSb3csXG5cbiAgICAgICAgb25DaGlsZHZpZXdCZWZvcmVSZW5kZXI6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICBjaGlsZC5vcHRpb25zLmNvbHVtbnMgPSB0aGlzLmdldE9wdGlvbignY29sdW1ucycpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guVGFibGVWaWV3ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHRjbGFzc05hbWU6ICd0YWJsZS12aWV3JyxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgZWw6ICd0Ym9keScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoZWFkZXI6ICd0aGVhZCcsXG4gICAgICAgICAgICBmb290ZXI6ICd0Zm9vdCB0ZCdcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtdmlldy1ncm91cCcpLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgc3RhcnRpbmcgcGFnZVxuICAgICAgICAgICAgcGFnZTogMSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG9yZGVyIG9mIHRoZSBkYXRlIGJlaW5nIHJldHVybmVkXG4gICAgICAgICAgICBvcmRlcjogbnVsbCxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgRWl0aGVyIGFzYyBvciBkZXNjIHNvcnRpbmcgb3JkZXJcbiAgICAgICAgICAgIHNvcnQ6IG51bGwsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBudW1iZXJzIG9mIHJvd3MgcGVyIHBhZ2VcbiAgICAgICAgICAgIGxpbWl0OiAyMCxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIFNob3VsZCBzaG93IHRoZSBwYWdpbmF0aW9uIGZvciB0aGlzIHRhYmxlXG4gICAgICAgICAgICBwYWdpbmF0ZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgRmV0Y2ggdGhlIGRhdGEgd2hlbiB0YWJsZSBpcyBzaG93blxuICAgICAgICAgICAgZmV0Y2hPblNob3c6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgaGVhZGVycyBhcHBlbmRlZCB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgcmVxdWVzdEhlYWRlcnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIFRoZSBkZWZhdWx0IG9wdGlvbnMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgICAgICBkZWZhdWx0UmVxdWVzdERhdGFPcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgJ3BhZ2UnLFxuICAgICAgICAgICAgICAgICdsaW1pdCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnc29ydCdcbiAgICAgICAgICAgIF0sXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQWRkaXRpb25hbCBvcHRpb25zIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIHF1ZXJ5IHN0cmluZ1xuICAgICAgICAgICAgcmVxdWVzdERhdGFPcHRpb25zOiBbXSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGJvZHkgdmlldyBjbGFzc1xuICAgICAgICAgICAgYm9keVZpZXc6IFRvb2xib3guVGFibGVWaWV3Qm9keSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGJvZHkgdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgYm9keVZpZXdPcHRpb25zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIHBhZ2luYXRpb24gdmlldyBjbGFzc1xuICAgICAgICAgICAgZm9vdGVyVmlldzogVG9vbGJveC5QYWdpbmF0aW9uLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgcGFnaW5hdGlvbiB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBmb290ZXJWaWV3T3B0aW9uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXJcbiAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXIgdGFnIG5hbWVcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMycsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXIgY2xhc3MgbmFtZVxuICAgICAgICAgICAgaGVhZGVyQ2xhc3NOYW1lOiAndGFibGUtaGVhZGVyJyxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGhlYWRlciB2aWV3IGNsYXNzXG4gICAgICAgICAgICBoZWFkZXJWaWV3OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGhlYWRlciB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBoZWFkZXJWaWV3T3B0aW9uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBkZXNjcmlwdGlvblxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgZGVzY3JpcHRpb24gdGFnXG4gICAgICAgICAgICBkZXNjcmlwdGlvblRhZzogJ3AnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgZGVzY3JpcHRpb24gdGFnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbkNsYXNzTmFtZTogJ2Rlc2NyaXB0aW9uIHJvdyBjb2wtc20tNicsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBjbGFzcyBuYW1lXG4gICAgICAgICAgICB0YWJsZUNsYXNzTmFtZTogJ3RhYmxlJyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGxvYWRpbmcgY2xhc3MgbmFtZVxuICAgICAgICAgICAgbG9hZGluZ0NsYXNzTmFtZTogJ2xvYWRpbmcnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1vZGVsIHN0b3JpbmcgdGhlIGNvbHVtbnNcbiAgICAgICAgICAgIGNoaWxkVmlld0NvbHVtbnNQcm9wZXJ0eTogJ2NvbHVtbnMnLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgIGluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdzbWFsbCdcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIHRhYmxlIHJvd3NcbiAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogJ05vIHJvd3MgZm91bmQnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbmFtZSBvZiB0aGUgY2xhc3MgYXBwZW5kZWQgdG8gdGhlIGJ1dHRvbnNcbiAgICAgICAgICAgIGJ1dHRvbkNsYXNzTmFtZTogJ2J0biBidG4tZGVmYXVsdCcsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgYnV0dG9uIG9iamVjdHNcbiAgICAgICAgICAgIC8vIHtocmVmOiAndGVzdC0xMjMnLCBsYWJlbDogJ1Rlc3QgMTIzJ31cbiAgICAgICAgICAgIGJ1dHRvbnM6IFtdXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLnNvcnQnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzb3J0OmNsaWNrJywgZSk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NsaWNrIC5idXR0b25zLXdyYXBwZXIgYSc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnV0dG9ucyA9IHRoaXMuZ2V0T3B0aW9uKCdidXR0b25zJyk7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAkKGUudGFyZ2V0KS5pbmRleCgpO1xuXG4gICAgICAgICAgICAgICAgaWYoXy5pc0FycmF5KGJ1dHRvbnMpICYmIGJ1dHRvbnNbaV0ub25DbGljaykge1xuICAgICAgICAgICAgICAgICAgICBidXR0b25zW2ldLm9uQ2xpY2suY2FsbCh0aGlzLCAkKGUudGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXJyZW50UGFnZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5jdXJyZW50X3BhZ2UgfHwgcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGFzdFBhZ2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UubGFzdF9wYWdlIHx8IHJlc3BvbnNlLmxhc3RQYWdlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEVtcHR5VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IFRvb2xib3guVGFibGVOb0l0ZW1zUm93LmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnM6IHRoaXMuZ2V0T3B0aW9uKCdjb2x1bW5zJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93SGVhZGVyVmlldygpO1xuICAgICAgICAgICAgdGhpcy5zaG93Qm9keVZpZXcoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2ZldGNoT25TaG93JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZldGNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Tb3J0Q2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0U29ydCA9ICdhc2MnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRPcmRlciA9IHRoaXMuZ2V0T3B0aW9uKCdvcmRlcicpLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTb3J0ID0gdGhpcy5nZXRPcHRpb24oJ3NvcnQnKSxcbiAgICAgICAgICAgICAgICBvcmRlciA9ICQoZS50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgICAgIGlmKGN1cnJlbnRPcmRlciA9PSBvcmRlcikge1xuICAgICAgICAgICAgICAgIGlmKCFjdXJyZW50U29ydCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc29ydCA9IGRlZmF1bHRTb3J0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHRoaXMuZ2V0T3B0aW9uKCdzb3J0JykgPT09ICdhc2MnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zb3J0ID0gJ2Rlc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9yZGVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zb3J0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9yZGVyID0gb3JkZXI7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNvcnQgPSBkZWZhdWx0U29ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNvcnQnKS5wYXJlbnQoKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc29ydC1hc2MnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc29ydC1kZXNjJyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzb3J0JykpIHtcbiAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnQoKS5hZGRDbGFzcygnc29ydC0nK3RoaXMuZ2V0T3B0aW9uKCdzb3J0JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmZldGNoKHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dIZWFkZXJWaWV3OiBmdW5jdGlvbihWaWV3KSB7XG4gICAgICAgICAgICBWaWV3ID0gVmlldyB8fCB0aGlzLmdldE9wdGlvbignaGVhZGVyVmlldycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdoZWFkZXInLCBuZXcgVmlldyhfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dCb2R5VmlldzogZnVuY3Rpb24oVmlldykge1xuICAgICAgICAgICAgVmlldyA9IFZpZXcgfHwgdGhpcy5nZXRPcHRpb24oJ2JvZHlWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldE9wdGlvbignY29sdW1ucycpXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2JvZHlWaWV3T3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2JvZHknLCB2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Rm9vdGVyVmlldzogZnVuY3Rpb24oVmlldykge1xuICAgICAgICAgICAgVmlldyA9IFZpZXcgfHwgdGhpcy5nZXRPcHRpb24oJ2Zvb3RlclZpZXcnKTtcblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFnZTogdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSxcbiAgICAgICAgICAgICAgICB0b3RhbFBhZ2VzOiB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignZm9vdGVyVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdwYWdpbmF0ZScsIGZ1bmN0aW9uKHBhZ2UsIHZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucGFnZSA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaCh0cnVlKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2Zvb3RlcicsIHZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdib2R5JykuY3VycmVudFZpZXcuY29sbGVjdGlvbi5yZXNldCgpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCd0YWJsZScpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdsb2FkaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB2YXIgQWN0aXZpdHlSb3cgPSBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYmxlLWFjdGl2aXR5LWluZGljYXRvci1yb3cnKSxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAndHInLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgXy5leHRlbmQodGhpcy5vcHRpb25zLCBzZWxmLmdldE9wdGlvbignaW5kaWNhdG9yT3B0aW9ucycpKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuY29sdW1ucyA9IHNlbGYuZ2V0T3B0aW9uKCdjb2x1bW5zJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRoZSBhY3Rpdml0eSBpbmRpY2F0b3IgaW5zdGFuY2UgdG8gYmUgcmVtb3ZlZCBsYXRlclxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9hY3Rpdml0eUluZGljYXRvciA9IHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdib2R5JykuY3VycmVudFZpZXcuYWRkQ2hpbGRWaWV3KG5ldyBBY3Rpdml0eVJvdyh7XG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICB0aGlzLiRlbC5maW5kKCd0YWJsZScpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdsb2FkaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9hY3Rpdml0eUluZGljYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdib2R5JykuY3VycmVudFZpZXcucmVtb3ZlQ2hpbGRWaWV3KHRoaXMuX2FjdGl2aXR5SW5kaWNhdG9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpdml0eUluZGljYXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJlcXVlc3REYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge30sIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbigncmVxdWVzdERhdGFPcHRpb25zJyk7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbignZGVmYXVsdFJlcXVlc3REYXRhT3B0aW9ucycpO1xuXG4gICAgICAgICAgICBfLmVhY2goKFtdKS5jb25jYXQoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYoIV8uaXNOdWxsKHRoaXMuZ2V0T3B0aW9uKG5hbWUpKSAmJiAhXy5pc1VuZGVmaW5lZCh0aGlzLmdldE9wdGlvbihuYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHRoaXMuZ2V0T3B0aW9uKG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoZGF0YSwgdGhpcy5nZXRPcHRpb24oJ3JlcXVlc3REYXRhJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU29ydENsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIG9yZGVyQnkgPSAkKGUudGFyZ2V0KS5kYXRhKCdpZCcpO1xuXG4gICAgICAgICAgICBfLmVhY2goKFtdKS5jb25jYXQoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYoIV8uaXNOdWxsKHRoaXMuZ2V0T3B0aW9uKG5hbWUpKSAmJiAhXy5pc1VuZGVmaW5lZCh0aGlzLmdldE9wdGlvbihuYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24obmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbbmFtZV0gPSB0aGlzLmdldE9wdGlvbihuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHNlbGYuZ2V0T3B0aW9uKCdzb3J0JykgPT09ICdhc2MnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub3B0aW9ucy5zb3J0ID0gJ2Rlc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vcHRpb25zLm9yZGVyQnkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vcHRpb25zLnNvcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNvcnQnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnc29ydC1hc2MnKS5yZW1vdmVDbGFzcygnc29ydC1kZXNjJyk7XG5cbiAgICAgICAgICAgIGlmKHNlbGYuZ2V0T3B0aW9uKCdzb3J0JykpIHtcbiAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnQoKS5hZGRDbGFzcygnc29ydC0nK3NlbGYuZ2V0T3B0aW9uKCdzb3J0JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLmZldGNoKHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2g6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hTdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLmdldEN1cnJlbnRQYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHZhciB0b3RhbFBhZ2VzID0gdGhpcy5nZXRMYXN0UGFnZShyZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmKGNvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RW1wdHlWaWV3KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50b3RhbFBhZ2VzID0gdG90YWxQYWdlcztcblxuICAgICAgICAgICAgdGhpcy5zaG93Rm9vdGVyVmlldygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hDb21wbGV0ZTogZnVuY3Rpb24oc3RhdHVzLCBjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXJyZW50UGFnZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5jdXJyZW50X3BhZ2UgfHwgcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGFzdFBhZ2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UubGFzdF9wYWdlIHx8IHJlc3BvbnNlLmxhc3RQYWdlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZldGNoOiBmdW5jdGlvbihyZXNldCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZihyZXNldCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goe1xuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZ2V0UmVxdWVzdERhdGEoKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbih4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi5nZXRPcHRpb24oJ3JlcXVlc3RIZWFkZXJzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZWFjaChzZWxmLmdldE9wdGlvbigncmVxdWVzdEhlYWRlcnMnKSwgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIHRydWUsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDpzdWNjZXNzJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZmV0Y2g6Y29tcGxldGUnLCBmYWxzZSwgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZmV0Y2gnKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guV2l6YXJkID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkJyxcblxuICAgIFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3dpemFyZCcpLFxuXG4gICAgICAgIHJlZ2lvbnM6IHtcbiAgICAgICAgICAgIHByb2dyZXNzOiAnLndpemFyZC1wcm9ncmVzcycsXG4gICAgICAgICAgICBjb250ZW50OiAnLndpemFyZC1jb250ZW50JyxcbiAgICAgICAgICAgIGJ1dHRvbnM6ICcud2l6YXJkLWJ1dHRvbnMnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAna2V5dXAnOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzdWJtaXRGb3JtT25FbnRlcicpICYmIGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2Zvcm0nKS5zdWJtaXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMicsXG4gICAgICAgICAgICAgICAgaGVhZGVyQ2xhc3NOYW1lOiAnd2l6YXJkLWhlYWRlcicsXG4gICAgICAgICAgICAgICAgZmluaXNoZWRDbGFzc05hbWU6ICd3aXphcmQtZmluaXNoZWQnLFxuICAgICAgICAgICAgICAgIGZpeGVkSGVpZ2h0Q2xhc3NOYW1lOiAnZml4ZWQtaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICBoYXNQYW5lbENsYXNzTmFtZTogJ3dpemFyZC1wYW5lbCcsXG4gICAgICAgICAgICAgICAgcGFuZWxDbGFzc05hbWU6ICdwYW5lbCBwYW5lbC1kZWZhdWx0JyxcbiAgICAgICAgICAgICAgICBidXR0b25WaWV3OiBUb29sYm94LldpemFyZEJ1dHRvbnMsXG4gICAgICAgICAgICAgICAgYnV0dG9uVmlld09wdGlvbnM6IHt9LFxuICAgICAgICAgICAgICAgIHByb2dyZXNzVmlldzogVG9vbGJveC5XaXphcmRQcm9ncmVzcyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1ZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBoaWdoZXN0U3RlcDogMSxcbiAgICAgICAgICAgICAgICBzdGVwOiAxLFxuICAgICAgICAgICAgICAgIHN0ZXBzOiBbXSxcbiAgICAgICAgICAgICAgICBmaW5pc2hlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc1ZpZXc6IFRvb2xib3guV2l6YXJkU3VjY2VzcyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzVmlld09wdGlvbnM6IHt9LFxuICAgICAgICAgICAgICAgIGVycm9yVmlldzogVG9vbGJveC5XaXphcmRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvclZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBzaG93QnV0dG9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYW5lbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGVudEhlaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3VibWl0Rm9ybU9uRW50ZXI6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXRSZWdpb25zOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICBpZih2aWV3LnJlZ2lvbnMgJiYgdmlldy5yZWdpb25NYW5hZ2VyKSB7XG4gICAgICAgICAgICAgICAgdmlldy5yZWdpb25NYW5hZ2VyLmVtcHR5UmVnaW9ucygpO1xuICAgICAgICAgICAgICAgIHZpZXcucmVnaW9uTWFuYWdlci5hZGRSZWdpb25zKHZpZXcucmVnaW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q29udGVudEhlaWdodDogZnVuY3Rpb24oaGVpZ2h0KSB7XG4gICAgICAgICAgICBoZWlnaHQgfHwgKGhlaWdodCA9IDQwMCk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtY29udGVudCcpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdmaXhlZEhlaWdodENsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgIC5jc3MoJ2hlaWdodCcsIGhlaWdodCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0U3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgdmFyIHZpZXcgPSBmYWxzZSwgcHJldlN0ZXAgPSB0aGlzLmdldFN0ZXAoKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN0ZXAgPSBwYXJzZUludChzdGVwKTtcblxuICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLnN0ZXAgPCAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN0ZXAgPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc3RlcCcpID4gdGhpcy5nZXRPcHRpb24oJ2hpZ2hlc3RTdGVwJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGlnaGVzdFN0ZXAgPSB0aGlzLmdldE9wdGlvbignc3RlcCcpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0UmVnaW9uKCdidXR0b25zJykuY3VycmVudFZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlZ2lvbignYnV0dG9ucycpLmN1cnJlbnRWaWV3LnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih2aWV3ID0gdGhpcy5nZXRTdGVwKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDb250ZW50KHZpZXcpO1xuICAgICAgICAgICAgICAgIHZpZXcudHJpZ2dlck1ldGhvZCgnd2l6YXJkOnNob3c6c3RlcCcsIHRoaXMuZ2V0U3RlcCgpLCBwcmV2U3RlcCwgdmlldyk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93OnN0ZXAnLCB0aGlzLmdldFN0ZXAoKSwgcHJldlN0ZXAsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dWaWV3OiBmdW5jdGlvbihWaWV3LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q29udGVudChuZXcgVmlldyhvcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0FjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbihvcHRpb25zLCByZWdpb24pIHtcbiAgICAgICAgICAgIHJlZ2lvbiB8fCAocmVnaW9uID0gdGhpcy5nZXRSZWdpb24oJ2NvbnRlbnQnKSk7XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IoXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ21lZGl1bScsXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0OiAnNDAwcHgnXG4gICAgICAgICAgICB9LCBvcHRpb25zKSk7XG5cbiAgICAgICAgICAgIHJlZ2lvbi5zaG93KHZpZXcsIHtcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVzdHJveTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1Byb2dyZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ3Byb2dyZXNzVmlldycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7fSwgdGhpcy5nZXRPcHRpb24oJ3Byb2dyZXNzVmlld09wdGlvbnMnKSwge1xuICAgICAgICAgICAgICAgICAgICB3aXphcmQ6IHRoaXNcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ3Byb2dyZXNzJywgdmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBidXR0b24gdmlldyBpcyBub3QgYSB2YWxpZCBjbGFzcy4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdidXR0b25WaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbignYnV0dG9uVmlld09wdGlvbnMnKSwge1xuICAgICAgICAgICAgICAgICAgICB3aXphcmQ6IHRoaXNcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2J1dHRvbnMnLCB2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGJ1dHRvbiB2aWV3IGlzIG5vdCBhIHZhbGlkIGNsYXNzLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDb250ZW50OiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICBpZih2aWV3KSB7XG4gICAgICAgICAgICAgICAgdmlldy5vcHRpb25zLndpemFyZCA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2NvbnRlbnQnLCB2aWV3LCB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZXN0cm95OiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2aWV3Lm9uY2UoJ2F0dGFjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0UmVnaW9ucyh2aWV3KTtcbiAgICAgICAgICAgICAgICAgICAgdmlldy50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6YXR0YWNoJyk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdzdGVwcycpWyhzdGVwIHx8IHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykpIC0gMV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VG90YWxTdGVwczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0ZXBzJykubGVuZ3RoO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjb21wbGV0ZTpzdGVwJywgdGhpcy5nZXRTdGVwKCkpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RlcCh0aGlzLmdldE9wdGlvbignc3RlcCcpIC0gMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TaG93U3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ3Byb2dyZXNzJykuY3VycmVudFZpZXcuc2V0QWN0aXZlKHN0ZXAuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ29tcGxldGVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmdldFJlZ2lvbigncHJvZ3Jlc3MnKS5jdXJyZW50Vmlldy5zZXRDb21wbGV0ZShzdGVwLmdldE9wdGlvbignc3RlcCcpKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdwcm9ncmVzcycpLmN1cnJlbnRWaWV3LnJlbmRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uV2l6YXJkRXJyb3I6IGZ1bmN0aW9uKG9wdGlvbnMsIEVycm9yVmlldykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICB3aXphcmQ6IHRoaXNcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXdPcHRpb25zJyksIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KEVycm9yVmlldyB8fCB0aGlzLmdldE9wdGlvbignZXJyb3JWaWV3JyksIG9wdGlvbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uV2l6YXJkU3VjY2VzczogZnVuY3Rpb24ob3B0aW9ucywgU3VjY2Vzc1ZpZXcpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgd2l6YXJkOiB0aGlzXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignc3VjY2Vzc1ZpZXdPcHRpb25zJyksIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLmdldFJlZ2lvbignYnV0dG9ucycpLmVtcHR5KCk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcCsrO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdmaW5pc2hlZENsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdwcm9ncmVzcycpLmN1cnJlbnRWaWV3LnNldEFjdGl2ZSh0aGlzLmdldE9wdGlvbignc3RlcCcpKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoU3VjY2Vzc1ZpZXcgfHwgdGhpcy5nZXRPcHRpb24oJ3N1Y2Nlc3NWaWV3JyksIG9wdGlvbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmlzaDogZnVuY3Rpb24oc3VjY2Vzcywgb3B0aW9ucywgVmlldykge1xuICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZChzdWNjZXNzKSB8fCBzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjb21wbGV0ZTpzdGVwJywgdGhpcy5nZXRTdGVwKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnd2l6YXJkOnN1Y2Nlc3MnLCBvcHRpb25zLCBWaWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnd2l6YXJkOmVycm9yJywgb3B0aW9ucywgVmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50SGVpZ2h0JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldENvbnRlbnRIZWlnaHQodGhpcy5nZXRPcHRpb24oJ2NvbnRlbnRIZWlnaHQnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93UHJvZ3Jlc3MnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1Byb2dyZXNzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93QnV0dG9ucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93QnV0dG9ucygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbigncGFuZWwnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNQYW5lbENsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdidXR0b25zJykuY3VycmVudFZpZXcuZGlzYWJsZUJ1dHRvbnMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlTmV4dEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdldFJlZ2lvbignYnV0dG9ucycpLmN1cnJlbnRWaWV3LmRpc2FibGVOZXh0QnV0dG9uKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUJhY2tCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ2J1dHRvbnMnKS5jdXJyZW50Vmlldy5kaXNhYmxlQmFja0J1dHRvbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVGaW5pc2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ2J1dHRvbnMnKS5jdXJyZW50Vmlldy5kaXNhYmxlRmluaXNoQnV0dG9uKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdldFJlZ2lvbignYnV0dG9ucycpLmN1cnJlbnRWaWV3LmVuYWJsZUJ1dHRvbnMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVOZXh0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdidXR0b25zJykuY3VycmVudFZpZXcuZW5hYmxlTmV4dEJ1dHRvbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUJhY2tCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ2J1dHRvbnMnKS5jdXJyZW50Vmlldy5lbmFibGVCYWNrQnV0dG9uKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlRmluaXNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdidXR0b25zJykuY3VycmVudFZpZXcuZW5hYmxlRmluaXNoQnV0dG9uKCk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKCQsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guV2l6YXJkQnV0dG9ucyA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd3aXphcmQtYnV0dG9ucycpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3dpemFyZC1idXR0b25zLXdyYXBwZXIgY2xlYXJmaXgnLFxuXG4gICAgICAgIGNoYW5uZWxOYW1lOiAndG9vbGJveC53aXphcmQnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBzdGVwOiBmYWxzZSxcbiAgICAgICAgICAgIHRvdGFsU3RlcHM6IGZhbHNlLFxuICAgICAgICAgICAgd2l6YXJkOiBmYWxzZSxcbiAgICAgICAgICAgIGJ1dHRvblNpemVDbGFzc05hbWU6ICdidG4tbWQnLFxuICAgICAgICAgICAgZGVmYXVsdEJ1dHRvbkNsYXNzTmFtZTogJ2J0biBidG4tZGVmYXVsdCcsXG4gICAgICAgICAgICBwcmltYXJ5QnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1wcmltYXJ5JyxcbiAgICAgICAgICAgIGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnLFxuICAgICAgICAgICAgbGVmdEJ1dHRvbnM6IFt7XG4gICAgICAgICAgICAgICAgaWNvbjogJ2ZhIGZhLWxvbmctYXJyb3ctbGVmdCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdCYWNrJyxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZ2V0Q3VycmVudFN0ZXAoKSA9PSAxID8gJ2Rpc2FibGVkICcgOiAnJ1xuICAgICAgICAgICAgICAgICAgICApICsgdGhpcy5wYXJlbnQuZ2V0RGVmYXVsdEJ1dHRvbkNsYXNzZXMoJ2JhY2snKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljazpiYWNrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICByaWdodEJ1dHRvbnM6IFt7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdGaW5pc2gnLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMucGFyZW50LmdldEN1cnJlbnRTdGVwKCkgIT0gdGhpcy5wYXJlbnQuZ2V0VG90YWxTdGVwcygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2hpZGUnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldFByaW1hcnlCdXR0b25DbGFzc2VzKCdmaW5pc2gnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljazpmaW5pc2gnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtbG9uZy1hcnJvdy1yaWdodCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdOZXh0JyxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnBhcmVudC5nZXRDdXJyZW50U3RlcCgpID09IHRoaXMucGFyZW50LmdldFRvdGFsU3RlcHMoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdoaWRlJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXREZWZhdWx0QnV0dG9uQ2xhc3NlcygnbmV4dCcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOm5leHQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XVxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC53aXphcmQtbGVmdC1idXR0b25zIGJ1dHRvbic6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJGJ1dHRvbiA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkYnV0dG9uLmluZGV4KCk7XG5cbiAgICAgICAgICAgICAgICBpZigkYnV0dG9uLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuZ2V0T3B0aW9uKCdsZWZ0QnV0dG9ucycpW2luZGV4XSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignbGVmdEJ1dHRvbnMnKVtpbmRleF0ub25DbGljaykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignbGVmdEJ1dHRvbnMnKVtpbmRleF0ub25DbGljay5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY2xpY2sgLndpemFyZC1yaWdodC1idXR0b25zIGJ1dHRvbic6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJGJ1dHRvbiA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkYnV0dG9uLmluZGV4KCk7XG5cbiAgICAgICAgICAgICAgICBpZigkYnV0dG9uLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuZ2V0T3B0aW9uKCdyaWdodEJ1dHRvbnMnKVtpbmRleF0gJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3JpZ2h0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdyaWdodEJ1dHRvbnMnKVtpbmRleF0ub25DbGljay5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBfLmVhY2godGhpcy5vcHRpb25zLnJpZ2h0QnV0dG9ucywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIGl0ZW0ucGFyZW50ID0gdGhpcztcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICBfLmVhY2godGhpcy5vcHRpb25zLmxlZnRCdXR0b25zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlUmlnaHRCdXR0b246IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZihfLmlzT2JqZWN0KGluZGV4KSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0aGlzLm9wdGlvbnMucmlnaHRCdXR0b25zLCBmdW5jdGlvbihidXR0b24sIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoYnV0dG9uID09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVJpZ2h0QnV0dG9uKGkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoXy5pc051bWJlcihpbmRleCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucmlnaHRCdXR0b25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhZGRSaWdodEJ1dHRvbjogZnVuY3Rpb24oYnV0dG9uLCBhdCkge1xuXHRcdFx0dmFyIGJ1dHRvbnMgPSBfLmNsb25lKHRoaXMub3B0aW9ucy5yaWdodEJ1dHRvbnMpO1xuXG4gICAgICAgICAgICBpZihfLmlzVW5kZWZpbmVkKGF0KSkge1xuICAgICAgICAgICAgICAgIGF0ID0gYnV0dG9ucy5sZW5ndGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJ1dHRvbi5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgYnV0dG9ucy5zcGxpY2UoYXQsIDAsIGJ1dHRvbik7XG5cblx0XHRcdHRoaXMub3B0aW9ucy5yaWdodEJ1dHRvbnMgPSBidXR0b25zO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVMZWZ0QnV0dG9uOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgaWYoXy5pc09iamVjdChpbmRleCkpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2godGhpcy5vcHRpb25zLmxlZnRCdXR0b25zLCBmdW5jdGlvbihidXR0b24sIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoYnV0dG9uID09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxlZnRCdXR0b24oaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5sZWZ0QnV0dG9ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkTGVmdEJ1dHRvbjogZnVuY3Rpb24oYnV0dG9uLCBhdCkge1xuXHRcdFx0dmFyIGJ1dHRvbnMgPSBfLmNsb25lKHRoaXMub3B0aW9ucy5sZWZ0QnV0dG9ucyk7XG5cbiAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQoYXQpKSB7XG4gICAgICAgICAgICAgICAgYXQgPSBidXR0b25zLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnV0dG9uLnBhcmVudCA9IHRoaXM7XG4gICAgICAgICAgICBidXR0b25zLnNwbGljZShhdCwgMCwgYnV0dG9uKTtcblxuXHRcdFx0dGhpcy5vcHRpb25zLmxlZnRCdXR0b25zID0gYnV0dG9ucztcblx0XHRcdHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUJ1dHRvbjogZnVuY3Rpb24oYnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuJytidXR0b24pLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdGVwczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0ZXBzJykgPyB0aGlzLmdldE9wdGlvbignc3RlcHMnKSA6IChcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykgPyB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdzdGVwcycpIDogW11cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q3VycmVudFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgPyB0aGlzLmdldE9wdGlvbignc3RlcCcpIDogKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKSA/IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKSA6IDFcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VG90YWxTdGVwczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RvdGFsU3RlcHMnKSA/IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFN0ZXBzJykgOiAoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpID8gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGggOiAxXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzdGVwID0gdGhpcy5nZXRDdXJyZW50U3RlcCgpO1xuICAgICAgICAgICAgdmFyIHRvdGFsID0gdGhpcy5nZXRUb3RhbFN0ZXBzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgaXNGaXJzdFN0ZXA6IHN0ZXAgPT0gMSxcbiAgICAgICAgICAgICAgICBpc0xhc3RTdGVwOiBzdGVwID09IHRvdGFsLFxuICAgICAgICAgICAgICAgIHRvdGFsU3RlcHM6IHRvdGFsXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignd2l6YXJkJykub3B0aW9ucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGlja0JhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0ZXAgPSB0aGlzLmdldEN1cnJlbnRTdGVwKCk7XG4gICAgICAgICAgICB2YXIgc3RlcHMgPSB0aGlzLmdldFN0ZXBzKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKSkge1xuICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRTdGVwKCkudHJpZ2dlck1ldGhvZCgnd2l6YXJkOmNsaWNrOmJhY2snLCBzdGVwc1tzdGVwIC0gMV0pO1xuXG4gICAgICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZChyZXNwb25zZSkgfHwgcmVzcG9uc2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcC0tO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGlja05leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0ZXAgPSB0aGlzLmdldEN1cnJlbnRTdGVwKCk7XG4gICAgICAgICAgICB2YXIgc3RlcHMgPSB0aGlzLmdldFN0ZXBzKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKSkge1xuICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRTdGVwKCkudHJpZ2dlck1ldGhvZCgnd2l6YXJkOmNsaWNrOm5leHQnLCBzdGVwc1tzdGVwICsgMV0pO1xuXG4gICAgICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZChyZXNwb25zZSkgfHwgcmVzcG9uc2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLm5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcCsrO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGlja0ZpbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignd2l6YXJkJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RlcCA9IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRTdGVwKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gc3RlcC50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6Y2xpY2s6ZmluaXNoJywgc3RlcCk7XG5cbiAgICAgICAgICAgICAgICBpZihfLmlzVW5kZWZpbmVkKHJlc3BvbnNlKSB8fCByZXNwb25zZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZmluaXNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN0ZXAgPSB0aGlzLmdldFRvdGFsU3RlcHMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldERlZmF1bHRCdXR0b25DbGFzc2VzOiBmdW5jdGlvbihhcHBlbmQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignZGVmYXVsdEJ1dHRvbkNsYXNzTmFtZScpICsgJyAnICsgdGhpcy5nZXRPcHRpb24oJ2J1dHRvblNpemVDbGFzc05hbWUnKSArICcgJyArIChhcHBlbmQgfHwgJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFByaW1hcnlCdXR0b25DbGFzc2VzOiBmdW5jdGlvbihhcHBlbmQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigncHJpbWFyeUJ1dHRvbkNsYXNzTmFtZScpICsgJyAnICsgdGhpcy5nZXRPcHRpb24oJ2J1dHRvblNpemVDbGFzc05hbWUnKSArICcgJyArIChhcHBlbmQgfHwgJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2J1dHRvbicpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlTmV4dEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcubmV4dCcpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlQmFja0J1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuYmFjaycpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlRmluaXNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5maW5pc2gnKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdidXR0b24nKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlTmV4dEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcubmV4dCcpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVCYWNrQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5iYWNrJykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUZpbmlzaEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuZmluaXNoJykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmRFcnJvciA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3dpemFyZC1lcnJvcicpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3dpemFyZC1lcnJvcicsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGVycm9yczogW10sXG4gICAgICAgICAgICBoZWFkZXJUYWdOYW1lOiAnaDMnLFxuICAgICAgICAgICAgaGVhZGVyOiAnRXJyb3IhJyxcbiAgICAgICAgICAgIGVycm9ySWNvbjogJ2ZhIGZhLXRpbWVzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGZhbHNlLFxuICAgICAgICAgICAgc2hvd0JhY2tCdXR0b246IHRydWUsXG4gICAgICAgICAgICBiYWNrQnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1sZyBidG4tcHJpbWFyeScsXG4gICAgICAgICAgICBiYWNrQnV0dG9uTGFiZWw6ICdHbyBCYWNrJyxcbiAgICAgICAgICAgIGJhY2tCdXR0b25JY29uOiAnZmEgZmEtbG9uZy1hcnJvdy1sZWZ0JyxcbiAgICAgICAgICAgIG9uQ2xpY2tCYWNrOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgYnV0dG9uJzogJ2NsaWNrOmJhY2snXG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrQmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiggdGhpcy5nZXRPcHRpb24oJ29uQ2xpY2tCYWNrJykgJiYgXy5pc0Z1bmN0aW9uKHRoaXMuZ2V0T3B0aW9uKCdvbkNsaWNrQmFjaycpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdvbkNsaWNrQmFjaycpLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuc2hvd0J1dHRvbnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuc2V0U3RlcCh0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdzdGVwJykgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oJCwgXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LldpemFyZFByb2dyZXNzID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLXByb2dyZXNzJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLXByb2dyZXNzLXdyYXBwZXInLFxuXG4gICAgICAgIGNoYW5uZWxOYW1lOiAndG9vbGJveC53aXphcmQnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICB3aXphcmQ6IGZhbHNlLFxuICAgICAgICAgICAgY29udGVudDoge30sXG4gICAgICAgICAgICBhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuICAgICAgICAgICAgY29tcGxldGVDbGFzc05hbWU6ICdjb21wbGV0ZScsXG4gICAgICAgICAgICBkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC53aXphcmQtc3RlcCc6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyICRzdGVwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB2YXIgc3RlcCA9ICRzdGVwLmRhdGEoJ3N0ZXAnKTtcblxuICAgICAgICAgICAgICAgIGlmKCAhJHN0ZXAuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdmaW5pc2hlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5zZXRTdGVwKHN0ZXApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXBzJyksIGZ1bmN0aW9uKHN0ZXAsIGkpIHtcbiAgICAgICAgICAgICAgICBzdGVwLm9wdGlvbnMubGFiZWwgPSBzdGVwLmdldE9wdGlvbignbGFiZWwnKSB8fCBzdGVwLmxhYmVsO1xuICAgICAgICAgICAgICAgIHN0ZXAub3B0aW9ucy50aXRsZSA9IHN0ZXAuZ2V0T3B0aW9uKCd0aXRsZScpIHx8IHN0ZXAudGl0bGU7XG4gICAgICAgICAgICAgICAgc3RlcC5vcHRpb25zLnN0ZXAgPSBpICsgMTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLm9wdGlvbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldERpc2FibGVkOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcud2l6YXJkLXN0ZXA6bHQoJytzdGVwKycpJykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldENvbXBsZXRlOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB2YXIgdmlldyA9IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRTdGVwKHN0ZXApO1xuXG4gICAgICAgICAgICB2aWV3Lm9wdGlvbnMuY29tcGxldGUgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcud2l6YXJkLXN0ZXA6bHQoJysoc3RlcCAtIDEpKycpJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2NvbXBsZXRlQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEFjdGl2ZTogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLndpemFyZC1zdGVwOm50aC1jaGlsZCgnK3N0ZXArJyknKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcud2l6YXJkLXN0ZXAnKS5jc3MoJ3dpZHRoJywgKDEwMCAvIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXBzJykubGVuZ3RoKSArICclJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0V2lkdGgoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RGlzYWJsZWQodGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignaGlnaGVzdFN0ZXAnKSk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZSh0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guV2l6YXJkU3VjY2VzcyA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3dpemFyZC1zdWNjZXNzJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLXN1Y2Nlc3MnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBoZWFkZXJUYWdOYW1lOiAnaDMnLFxuICAgICAgICAgICAgaGVhZGVyOiAnU3VjY2VzcyEnLFxuICAgICAgICAgICAgc3VjY2Vzc0ljb246ICdmYSBmYS1jaGVjaycsXG4gICAgICAgICAgICBtZXNzYWdlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iXX0=
