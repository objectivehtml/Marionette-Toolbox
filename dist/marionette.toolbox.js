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

  return "<i class=\"fa fa-bars drag-handle\"></i>\n\n<span class=\"node-name\">"
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
            var $target = $(event.target);

            if($target.hasClass('drop-before')) {
                this.root().triggerMethod('drop:before', event, this);
            }
            else if($target.hasClass('drop-after')) {
                this.root().triggerMethod('drop:after', event, this);
            }
            else if($target.hasClass('drop-children')) {
                if(this.getOption('nestable')) {
                    this.root().triggerMethod('drop:children', event, this);
                }
                else {
                    this.root().triggerMethod('drop:after', event, this);
                }
            }

            this.root().triggerMethod('drop', event, this);
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

            console.log('asd');
            
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
            var self = this, AvailableTreeView = this.getOption('availableTreeView');

            if(AvailableTreeView) {
        		var view = new AvailableTreeView(_.extend({
                    parent: this,
                    collection: this.getOption('availableTree'),
                    childViewOptions: _.extend({}, AvailableTreeView.prototype.childViewOptions, {
                        childView: Toolbox.DraggableTreeView,
                        nestable: this.getOption('nestable'),
                        template: this.getOption('availableTreeViewTemplate')
                    })
        		}, this.getOption('availableTreeViewOptions')));

                view.collection.on('add remove', function() {
                    setTimeout(function() {
                        self.resetScrollBottom.call(self);
                    });
                });

                this.showChildView('available', view);
            }
        },

        showSelectedPool: function() {
            var SelectedTreeView = this.getOption('selectedTreeView');

            if(SelectedTreeView) {
        		var view = new SelectedTreeView(_.extend({
                    parent: this,
                    collection: this.getOption('selectedTree'),
                    childViewOptions: _.extend({}, SelectedTreeView.prototype.childViewOptions, {
                        childView: Toolbox.DraggableTreeView,
                        nestable: this.getOption('nestable'),
                        template: this.getOption('selectedTreeViewTemplate')
                    })
        		}, this.getOption('selectedTreeViewOptions')));

                this.showChildView('selected', view);
            }
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
                            var from = self.getSelectionPoolFromElement(event.relatedTarget);
                            var to = self.getSelectionPoolFromElement(event.target);

                            where[self.getIdAttribute($(event.relatedTarget).data('id'))] = $(event.relatedTarget).data('id');

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

        getIdAttribute: function(value) {
            return _.isNull(new String(value).match(/^c\d+$/)) ? 'id' : 'cid';
        },

        getSelectionPoolFromElement: function(element) {
            var $parent = $(element);

            if(!$parent.hasClass('droppable-pool')) {
                $parent = $parent.parents('.droppable-pool');
            }

            return $parent.hasClass('available-pool') ?
                this.getRegion('available').currentView :
                this.getRegion('selected').currentView;
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

    function transferNodeAfter(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = view.getSelectionPoolFromElement(event.relatedTarget);
        var to = view.getSelectionPoolFromElement(event.target);

        fromWhere[view.getIdAttribute($(event.relatedTarget).data('id'))] = $(event.relatedTarget).data('id');
        toWhere[view.getIdAttribute($(event.target).data('id'))] = $(event.target).data('id');

        var fromModel = from.collection.findWhere(fromWhere);
        var toModel = to.collection.findWhere(toWhere);

        from.collection.removeNode(fromModel);
        to.collection.appendNodeAfter(fromModel, toModel);
    }

    function transferNodeBefore(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = view.getSelectionPoolFromElement(event.relatedTarget);
        var to = view.getSelectionPoolFromElement(event.target);


        fromWhere[view.getIdAttribute($(event.relatedTarget).data('id'))] = $(event.relatedTarget).data('id');
        toWhere[view.getIdAttribute($(event.target).data('id'))] = $(event.target).data('id');

        var fromModel = from.collection.findWhere(fromWhere);
        var toModel = to.collection.findWhere(toWhere);

        from.collection.removeNode(fromModel);
        to.collection.appendNodeBefore(fromModel, toModel);
    }

    function transferNodeChildren(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = view.getSelectionPoolFromElement(event.relatedTarget);
        var to = view.getSelectionPoolFromElement(event.target);

        if($(event.target).find('.children').length == 0) {
            $(event.target).append('<div class="children" />');
        }

        fromWhere[view.getIdAttribute($(event.relatedTarget).data('id'))] = $(event.relatedTarget).data('id');
        toWhere[view.getIdAttribute($(event.target).data('id'))] = $(event.target).data('id');

        var fromModel = from.collection.findWhere(fromWhere);
        var toModel = to.collection.findWhere(toWhere);

        from.collection.removeNode(fromModel);
        to.collection.appendNode(fromModel, toModel, {
            at: 0
        });
    }

    Toolbox.SelectionPoolTreeView = Toolbox.DraggableTreeView.extend({

        onDropAfter: function(event, parent) {
            transferNodeAfter(event, this.getOption('parent'));
        },

        onDropBefore: function(event, parent) {
            transferNodeBefore(event,  this.getOption('parent'));
        },

        onDropChildren: function(event, parent) {
            transferNodeChildren(event, this.getOption('parent'));
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvb2xib3guanMiLCJEcm9wem9uZXMuanMiLCJUeXBpbmdEZXRlY3Rpb24uanMiLCJWaWV3T2Zmc2V0LmpzIiwidGVtcGxhdGVzLmpzIiwiaXMuanMiLCJub3QuanMiLCJwcm9wZXJ0eU9mLmpzIiwiVHJlZS5qcyIsIlZpZXcuanMiLCJDb2xsZWN0aW9uVmlldy5qcyIsIkJhc2VGaWVsZC5qcyIsIkJhc2VGb3JtLmpzIiwiVW5vcmRlcmVkTGlzdC5qcyIsIkRyb3Bkb3duTWVudS5qcyIsIlRyZWVWaWV3Tm9kZS5qcyIsIlRyZWVWaWV3LmpzIiwiRHJhZ2dhYmxlVHJlZU5vZGUuanMiLCJEcmFnZ2FibGVUcmVlVmlldy5qcyIsIkFjdGl2aXR5SW5kaWNhdG9yL0FjdGl2aXR5SW5kaWNhdG9yLmpzIiwiQnV0dG9uRHJvcGRvd25NZW51L0J1dHRvbkRyb3Bkb3duTWVudS5qcyIsIkJyZWFkY3J1bWJzL0JyZWFkY3VtYnMuanMiLCJCdXR0b25Hcm91cC9CdXR0b25Hcm91cC5qcyIsIkNhbGVuZGFyL0NhbGVuZGFyLmpzIiwiQ2hlY2tib3hGaWVsZC9DaGVja2JveEZpZWxkLmpzIiwiQ29yZS9MZW52ZW5zaHRlaW4uanMiLCJJbmxpbmVFZGl0b3IvSW5saW5lRWRpdG9yLmpzIiwiSW5wdXRGaWVsZC9JbnB1dEZpZWxkLmpzIiwiTGlnaHRTd2l0Y2hGaWVsZC9MaWdodFN3aXRjaEZpZWxkLmpzIiwiTGlzdEdyb3VwL0xpc3RHcm91cC5qcyIsIk1vZGFsL01vZGFsLmpzIiwiTm90aWZpY2F0aW9uL05vdGlmaWNhdGlvbi5qcyIsIk9yZGVyZWRMaXN0L09yZGVyZWRMaXN0LmpzIiwiUGFnZXIvUGFnZXIuanMiLCJQYWdpbmF0aW9uL1BhZ2luYXRpb24uanMiLCJQcm9ncmVzc0Jhci9Qcm9ncmVzc0Jhci5qcyIsIlJhZGlvRmllbGQvUmFkaW9GaWVsZC5qcyIsIlJhbmdlU2xpZGVyL1JhbmdlU2xpZGVyLmpzIiwiU2VsZWN0RmllbGQvU2VsZWN0RmllbGQuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2wuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2xUcmVlVmlldy5qcyIsIlN0b3JhZ2UvU3RvcmFnZS5qcyIsIlRhYmxlVmlldy9UYWJsZVZpZXcuanMiLCJUYWJzL1RhYnMuanMiLCJUZXh0YXJlYUZpZWxkL1RleHRBcmVhRmllbGQuanMiLCJXaXphcmQvV2l6YXJkLmpzIiwiV2l6YXJkL1dpemFyZEJ1dHRvbnMuanMiLCJXaXphcmQvV2l6YXJkRXJyb3IuanMiLCJXaXphcmQvV2l6YXJkUHJvZ3Jlc3MuanMiLCJXaXphcmQvV2l6YXJkU3VjY2Vzcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2MkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDclJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDemRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzllQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYXJpb25ldHRlLnRvb2xib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcbiAgICAgICAgICAgICAgICAnanF1ZXJ5JyxcbiAgICAgICAgICAgICAgICAnYmFja2JvbmUnLFxuICAgICAgICAgICAgICAgICdiYWNrYm9uZS5yYWRpbycsXG4gICAgICAgICAgICAgICAgJ2JhY2tib25lLm1hcmlvbmV0dGUnLFxuICAgICAgICAgICAgICAgICdoYW5kbGViYXJzJyxcbiAgICAgICAgICAgICAgICAndW5kZXJzY29yZSdcbiAgICAgICAgICAgIF0sIGZ1bmN0aW9uKCQsIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSwgSGFuZGxlYmFycywgXykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QsICQsIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSwgSGFuZGxlYmFycywgXyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUucmFkaW8nKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdCwgcm9vdC4kLCByb290LkJhY2tib25lLCByb290LkJhY2tib25lLlJhZGlvLCByb290Lk1hcmlvbmV0dGUsIHJvb3QuSGFuZGxlYmFycywgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uKHJvb3QsICQsIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSwgSGFuZGxlYmFycywgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIFRvb2xib3ggPSB7fTtcblxuICAgIFRvb2xib3guaGFuZGxlYmFycyA9IHt9O1xuXG4gICAgVG9vbGJveC5WaWV3cyA9IHt9O1xuXG4gICAgVG9vbGJveC5WRVJTSU9OID0gJyUlR1VMUF9JTkpFQ1RfVkVSU0lPTiUlJztcblxuICAgIC8vIFRvb2xib3guVGVtcGxhdGVcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gR2V0IGFuIGV4aXN0aW5nIHJlbmRlcmVkIGhhbmRsZWJhcnMgdGVtcGxhdGVcblxuICAgIFRvb2xib3guVGVtcGxhdGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGlmKFRvb2xib3gudGVtcGxhdGVzW25hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gVG9vbGJveC50ZW1wbGF0ZXNbbmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAnQ2Fubm90IGxvY2F0ZSB0aGUgSGFuZGxlYmFycyB0ZW1wbGF0ZSB3aXRoIHRoZSBuYW1lIG9mIFwiJytuYW1lKydcIi4nO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRvb2xib3guT3B0aW9uc1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBHZXQgdGhlIGRlZmF1bHQgb3B0aW9ucyBhbmQgb3B0aW9ucyBhbmQgbWVyZ2UgdGhlLFxuXG4gICAgVG9vbGJveC5PcHRpb25zID0gZnVuY3Rpb24oZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIGNvbnRleHQpIHtcbiAgICAgICAgaWYoXy5pc0Z1bmN0aW9uKGRlZmF1bHRPcHRpb25zKSkge1xuICAgICAgICAgICAgZGVmYXVsdE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucy5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoXy5pc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIHJldHVybiByb290LlRvb2xib3ggPSBUb29sYm94O1xufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICByZXR1cm4gZGVmaW5lKFsnanF1ZXJ5J10sIGZ1bmN0aW9uKCQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJClcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guRHJvcHpvbmVzID0gZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrcywgY29udGV4dCkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGV2ZW50LmRyb3B6b25lLmVsZW1lbnQoKTtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyIG9mZnNldCA9IFRvb2xib3guVmlld09mZnNldChlbGVtZW50KTtcbiAgICAgICAgdmFyIHRvcCA9IG9mZnNldC55O1xuICAgICAgICB2YXIgbGVmdCA9IG9mZnNldC54O1xuICAgICAgICB2YXIgaGVpZ2h0ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHZhciBoZWlnaHRUaHJlc2hvbGQgPSBoZWlnaHQgKiAuMjU7XG4gICAgICAgIHZhciB3aWR0aFRocmVzaG9sZCA9IDQwO1xuICAgICAgICB2YXIgYm90dG9tID0gdG9wICsgaGVpZ2h0O1xuXG4gICAgICAgIGlmKGhlaWdodFRocmVzaG9sZCA+IDIwKSB7XG4gICAgICAgICAgICBoZWlnaHRUaHJlc2hvbGQgPSAyMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGV2ZW50LnBhZ2VZIDwgdG9wICsgaGVpZ2h0VGhyZXNob2xkKSB7XG4gICAgICAgICAgICBjYWxsYmFja3MuYmVmb3JlID8gY2FsbGJhY2tzLmJlZm9yZS5jYWxsKGNvbnRleHQsICRlbGVtZW50KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihldmVudC5wYWdlWSA+IGJvdHRvbSAtIGhlaWdodFRocmVzaG9sZCB8fCBldmVudC5wYWdlWCA8IGxlZnQgKyB3aWR0aFRocmVzaG9sZCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmFmdGVyID8gY2FsbGJhY2tzLmFmdGVyLmNhbGwoY29udGV4dCwgJGVsZW1lbnQpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5jaGlsZHJlbiA/IGNhbGxiYWNrcy5jaGlsZHJlbi5jYWxsKGNvbnRleHQsICRlbGVtZW50KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UeXBpbmdEZXRlY3Rpb24gPSBmdW5jdGlvbigkZWxlbWVudCwgdHlwaW5nU3RvcHBlZFRocmVzaG9sZCwgcmFkaW9DaGFubmVsKSB7XG4gICAgICAgIHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQgfHwgKHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQgPSA1MDApO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHR5cGluZ1RpbWVyLCBsYXN0VmFsdWU7XG4gICAgICAgIHZhciBoYXNUeXBpbmdTdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5nZXRWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50LnZhbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGFzVHlwaW5nU3RhcnRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMYXN0VmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXN0VmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGVhclRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0eXBpbmdUaW1lcikge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBpbmdUaW1lcik7XG4gICAgICAgICAgICAgICAgdHlwaW5nVGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJGVsZW1lbnQua2V5dXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYoIXR5cGluZ1RpbWVyKSB7XG4gICAgICAgICAgICAgICAgdHlwaW5nVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZihyYWRpb0NoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2hhbm5lbC50cmlnZ2VyKCdkZXRlY3Rpb246dHlwaW5nOnN0b3BwZWQnLCBzZWxmLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxhc3RWYWx1ZSA9IHNlbGYuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgaGFzVHlwaW5nU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sIHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkZWxlbWVudC5rZXlkb3duKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYoIWhhc1R5cGluZ1N0YXJ0ZWQgJiYgc2VsZi5nZXRWYWx1ZSgpICE9IGxhc3RWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihyYWRpb0NoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2hhbm5lbC50cmlnZ2VyKCdkZXRlY3Rpb246dHlwaW5nOnN0YXJ0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoYXNUeXBpbmdTdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5jbGVhclRpbWVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlZpZXdPZmZzZXQgPSBmdW5jdGlvbihub2RlLCBzaW5nbGVGcmFtZSkge1xuICAgICAgICBmdW5jdGlvbiBhZGRPZmZzZXQobm9kZSwgY29vcmRzLCB2aWV3KSB7XG4gICAgICAgICAgICB2YXIgcCA9IG5vZGUub2Zmc2V0UGFyZW50O1xuXG4gICAgICAgICAgICBjb29yZHMueCArPSBub2RlLm9mZnNldExlZnQgLSAocCA/IHAuc2Nyb2xsTGVmdCA6IDApO1xuICAgICAgICAgICAgY29vcmRzLnkgKz0gbm9kZS5vZmZzZXRUb3AgLSAocCA/IHAuc2Nyb2xsVG9wIDogMCk7XG5cbiAgICAgICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHAubm9kZVR5cGUgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50U3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUocCwgJycpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRTdHlsZS5wb3NpdGlvbiAhPSAnc3RhdGljJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQocGFyZW50U3R5bGUuYm9yZGVyTGVmdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLmJvcmRlclRvcFdpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHAubG9jYWxOYW1lID09ICdUQUJMRScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChwYXJlbnRTdHlsZS5wYWRkaW5nTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gcGFyc2VJbnQocGFyZW50U3R5bGUucGFkZGluZ1RvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwLmxvY2FsTmFtZSA9PSAnQk9EWScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUobm9kZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpbkxlZnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocC5sb2NhbE5hbWUgPT0gJ0JPRFknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChwYXJlbnRTdHlsZS5ib3JkZXJMZWZ0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gcGFyc2VJbnQocGFyZW50U3R5bGUuYm9yZGVyVG9wV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocCAhPSBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54IC09IHBhcmVudC5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgLT0gcGFyZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYWRkT2Zmc2V0KHAsIGNvb3Jkcywgdmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubG9jYWxOYW1lID09ICdCT0RZJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUobm9kZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChzdHlsZS5ib3JkZXJMZWZ0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBwYXJzZUludChzdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWxTdHlsZSA9IHZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLnBhcmVudE5vZGUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggLT0gcGFyc2VJbnQoaHRtbFN0eWxlLnBhZGRpbmdMZWZ0KTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgLT0gcGFyc2VJbnQoaHRtbFN0eWxlLnBhZGRpbmdUb3ApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLnNjcm9sbExlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gbm9kZS5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLnNjcm9sbFRvcCkge1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBub2RlLnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgd2luID0gbm9kZS5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4gICAgICAgICAgICAgICAgaWYgKHdpbiAmJiAoIXNpbmdsZUZyYW1lICYmIHdpbi5mcmFtZUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZE9mZnNldCh3aW4uZnJhbWVFbGVtZW50LCBjb29yZHMsIHdpbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvb3JkcyA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgIGFkZE9mZnNldChub2RlLCBjb29yZHMsIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgIH07XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwidGhpc1tcIlRvb2xib3hcIl0gPSB0aGlzW1wiVG9vbGJveFwiXSB8fCB7fTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdID0gdGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl0gfHwge307XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImZvcm0tZXJyb3JcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIiAgICA8c3Bhbj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYShkZXB0aDAsIGRlcHRoMCkpXG4gICAgKyBcIjwvc3Bhbj5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5uZXdsaW5lIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8YnI+XCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZXJyb3JzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJhY3Rpdml0eS1pbmRpY2F0b3JcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcImRpbW1lZFwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwibWluLWhlaWdodDpcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5taW5IZWlnaHQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pbkhlaWdodCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1pbkhlaWdodFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI7XCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJwb3NpdGlvbjpcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wb3NpdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucG9zaXRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJwb3NpdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI7XCI7XG59LFwiN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJiYWNrZ3JvdW5kLWNvbG9yOiBcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kaW1tZWRCZ0NvbG9yIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kaW1tZWRCZ0NvbG9yIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiZGltbWVkQmdDb2xvclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI7XCI7XG59LFwiOVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCI8c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsXFxcIiBzdHlsZT1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbEZvbnRTaXplIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIj48c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsLXRleHRcXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9zcGFuPjwvc3Bhbj5cIjtcbn0sXCIxMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJmb250LXNpemU6XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWxGb250U2l6ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxGb250U2l6ZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImxhYmVsRm9udFNpemVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWRpbW1lciBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRpbW1lZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIiBzdHlsZT1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taW5IZWlnaHQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBvc2l0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kaW1tZWRCZ0NvbG9yIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPlxcblxcblx0PHNwYW4gY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvclxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9zcGFuPlxcblxcbjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImJyZWFkY3J1bWJcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaHJlZiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaHJlZiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImhyZWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8L2E+XCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ocmVmIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJuby1icmVhZGNydW1ic1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiYnV0dG9uLWRyb3Bkb3duLW1lbnVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcImRyb3B1cFwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9uQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImJ1dHRvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9uSWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5idXR0b25MYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9uTGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImJ1dHRvbkxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvYnV0dG9uPlxcblx0XHQ8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5idXR0b25DbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvbkNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiYnV0dG9uQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9uVG9nZ2xlQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25Ub2dnbGVDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImJ1dHRvblRvZ2dsZUNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGRhdGEtdG9nZ2xlPVxcXCJkcm9wZG93blxcXCIgYXJpYS1leHBhbmRlZD1cXFwiZmFsc2VcXFwiPlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJjYXJldFxcXCI+PC9zcGFuPlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5Ub2dnbGUgRHJvcGRvd248L3NwYW4+XFxuXHRcdDwvYnV0dG9uPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPGkgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJ1dHRvbkljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvbkljb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJidXR0b25JY29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC9pPlwiO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9uQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImJ1dHRvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJ1dHRvblRvZ2dsZUNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9uVG9nZ2xlQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJidXR0b25Ub2dnbGVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBkYXRhLXRvZ2dsZT1cXFwiZHJvcGRvd25cXFwiIGFyaWEtZXhwYW5kZWQ9XFxcImZhbHNlXFxcIj5cXG5cdFx0XHRcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvbkljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0XHRcdFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5idXR0b25MYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9uTGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImJ1dHRvbkxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJjYXJldFxcXCI+PC9zcGFuPlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5Ub2dnbGUgRHJvcGRvd248L3NwYW4+XFxuXHRcdDwvYnV0dG9uPlxcblwiO1xufSxcIjhcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVudUNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVudUNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lbnVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiYnRuLWdyb3VwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZHJvcFVwIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc3BsaXRCdXR0b24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDApLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0PHVsIGNsYXNzPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lbnVDbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+PC91bD5cXG48L2Rpdj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJidXR0b24tZ3JvdXAtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L2k+IFwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIm5vLWJ1dHRvbi1ncm91cC1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJjYWxlbmRhci1tb250aGx5LWRheS12aWV3XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcdDxzcGFuIGNsYXNzPVxcXCJjYWxlbmRhci1oYXMtZXZlbnRzXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2lyY2xlXFxcIj48L2k+PC9zcGFuPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbiAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9XFxcImNhbGVuZGFyLWRhdGVcXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRheSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGF5IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJkYXlcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9zcGFuPlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmlzIHx8IChkZXB0aDAgJiYgZGVwdGgwLmlzKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmV2ZW50cyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGVuZ3RoIDogc3RhY2sxKSxcIj5cIixcIjBcIix7XCJuYW1lXCI6XCJpc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJjYWxlbmRhci1tb250aGx5LXZpZXdcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcImNhbGVuZGFyLW1hc3RoZWFkXFxcIj5cXG5cdDxuYXYgY2xhc3M9XFxcImNhbGVuZGFyLW5hdmlnYXRpb25cXFwiPlxcblx0XHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiY2FsZW5kYXItbmF2aWdhdGlvbi1wcmV2XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtYW5nbGUtbGVmdFxcXCI+PC9pPjwvYT5cXG5cdFx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcImNhbGVuZGFyLW5hdmlnYXRpb24tbmV4dFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWFuZ2xlLXJpZ2h0XFxcIj48L2k+PC9hPlxcblx0PC9uYXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJjYWxlbmRhci1oZWFkZXJcXFwiPjwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiY2FsZW5kYXItc3ViLWhlYWRlclxcXCI+PC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cXFwiY2FsZW5kYXItdmlld1xcXCI+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJpbmRpY2F0b3JcXFwiPjwvZGl2Plxcblxcblx0PHRhYmxlIGNsYXNzPVxcXCJjYWxlbmRhci1tb250aGx5LXZpZXdcXFwiPlxcblx0XHQ8dGhlYWQ+XFxuXHRcdFx0PHRyPlxcblx0XHRcdFx0PHRoPlN1bjwvdGg+XFxuXHRcdFx0XHQ8dGg+TW9uPC90aD5cXG5cdFx0XHRcdDx0aD5UdWU8L3RoPlxcblx0XHRcdFx0PHRoPldlZDwvdGg+XFxuXHRcdFx0XHQ8dGg+VGh1cjwvdGg+XFxuXHRcdFx0XHQ8dGg+RnJpPC90aD5cXG5cdFx0XHRcdDx0aD5TYXQ8L3RoPlxcblx0XHRcdDwvdHI+XFxuXHRcdDwvdGhlYWQ+XFxuXHRcdDx0Ym9keT48L3Rib2R5Plxcblx0PC90YWJsZT5cXG48L2Rpdj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJmb3JtLWNoZWNrYm94LWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0PHAgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRlc2NyaXB0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiZGVzY3JpcHRpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9wPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcIlwiO1xuXG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMub3B0aW9ucyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLChvcHRpb25zPXtcIm5hbWVcIjpcIm9wdGlvbnNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5vcHRpb25zKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9Y29udGFpbmVyLmxhbWJkYSwgYWxpYXMyPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczM9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXM0PWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXM1PVwiZnVuY3Rpb25cIjtcblxuICByZXR1cm4gXCJcdDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pbnB1dENsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdDxsYWJlbCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczMsKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg4LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+PGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS50eXBlIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiBuYW1lPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIltdXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnZhbHVlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52YWx1ZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczQpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczUgPyBoZWxwZXIuY2FsbChhbGlhczMse1wibmFtZVwiOlwidmFsdWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj4gXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczQpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczUgPyBoZWxwZXIuY2FsbChhbGlhczMse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9sYWJlbD5cXG5cdDwvZGl2PlxcblwiO1xufSxcIjhcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjEwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHQ8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaW5wdXRDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlucHV0Q2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJpbnB1dENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHQ8bGFiZWwgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbENsYXNzTmFtZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj48aW5wdXQgdHlwZT1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnR5cGUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnR5cGUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInR5cGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBuYW1lPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmFsdWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZhbHVlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ2YWx1ZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPiBcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblx0PC9kaXY+XFxuXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImxhYmVsQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMTAsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJpbmxpbmUtZWRpdG9yXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJpbmxpbmUtZWRpdG9yLWxhYmVsXFxcIj48L2Rpdj5cXG5cXG48aSBjbGFzcz1cXFwiZmEgZmEtcGVuY2lsIGlubGluZS1lZGl0b3ItZWRpdC1pY29uXFxcIj48L2k+XFxuXFxuPGRpdiBjbGFzcz1cXFwiaW5saW5lLWVkaXRvci1maWVsZFxcXCI+PC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cXFwiaW5saW5lLWVkaXRvci1hY3Rpdml0eS1pbmRpY2F0b3JcXFwiPjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImRyb3Bkb3duLW1lbnUtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxhIGhyZWY9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhyZWYgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhyZWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvYT5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52YWx1ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJ2YWx1ZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCI4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGl2aWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZHJvcGRvd24tbWVudS1uby1pdGVtc1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lc3NhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImRyb3Bkb3duLW1lbnVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVudUNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVudUNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lbnVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudG9nZ2xlQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50b2dnbGVDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInRvZ2dsZUNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGRhdGEtdG9nZ2xlPVxcXCJkcm9wZG93blxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIiBhcmlhLWhhc3BvcHVwPVxcXCJ0cnVlXFxcIiBhcmlhLWV4cGFuZGVkPVxcXCJmYWxzZVxcXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRvZ2dsZUxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50b2dnbGVMYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidG9nZ2xlTGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIDxpIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudG9nZ2xlSWNvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG9nZ2xlSWNvbkNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidG9nZ2xlSWNvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvaT48L2E+XFxuXFxuPHVsIGNsYXNzPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lbnVDbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+PC91bD5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJmb3JtLWlucHV0LWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDksIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwibmFtZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50eXBlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50eXBlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ0eXBlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlucHV0Q2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbnB1dENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaW5wdXRDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiAvPlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImZvcm0tbGlnaHQtc3dpdGNoLWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PGxhYmVsIGZvcj1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaWRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xufSxcIjVcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3A+XFxuXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb25DbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiZGVzY3JpcHRpb25DbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjhcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYWN0aXZlQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3RpdmVDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJhY3RpdmVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG48ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaW5wdXRDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlucHV0Q2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJpbnB1dENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZhbHVlIDogZGVwdGgwKSwxLHtcIm5hbWVcIjpcImlzXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiPlxcblx0PGRpdiBjbGFzcz1cXFwibGlnaHQtc3dpdGNoLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxpZ2h0LXN3aXRjaC1sYWJlbCBvblxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxpZ2h0LXN3aXRjaC1oYW5kbGVcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsaWdodC1zd2l0Y2gtbGFiZWwgb2ZmXFxcIj48L2Rpdj5cXG5cdDwvZGl2PlxcbjwvZGl2PlxcblxcbjxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJuYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52YWx1ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInZhbHVlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgaWQ9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibGlzdC1ncm91cC1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIlx0PHNwYW4gY2xhc3M9XFxcImJhZGdlXFxcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5iYWRnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYmFkZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJiYWRnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3NwYW4+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJhZGdlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbnRlbnQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIm5vLWxpc3QtZ3JvdXAtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiBcIiAgICBcIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJtZXNzYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgTm8gaXRlbXMgZm91bmQuXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJtb2RhbC13aW5kb3dcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiXHQ8aDMgY2xhc3M9XFxcIm1vZGFsLWhlYWRlclxcXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJoZWFkZXJcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9oMz5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFxuICBcIlx0XHQ8ZGl2IGNsYXNzPVxcXCJtb2RhbC1idXR0b25zXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5idXR0b25zIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwiYnV0dG9uc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmJ1dHRvbnMpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyICsgXCJcdFx0PC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDxhIGhyZWY9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaHJlZiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJjbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg5LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGV4dCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGV4dCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidGV4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2E+XFxuXCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ocmVmIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ocmVmIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaHJlZlwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImlkPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJpZFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8c3BhbiBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L3NwYW4+IFwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIm1vZGFsLXdpbmRvd1xcXCI+XFxuXHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwibW9kYWwtY2xvc2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lcy1jaXJjbGVcXFwiPjwvaT48L2E+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0PGRpdiBjbGFzcz1cXFwibW9kYWwtY29udGVudCBjbGVhcmZpeFxcXCI+PC9kaXY+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2Rpdj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJub3RpZmljYXRpb25cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHRcdDxkaXYgY2xhc3M9XFxcImNvbC1zbS0yXFxcIj5cXG5cdFx0XHQ8aSBjbGFzcz1cXFwiZmEgZmEtXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgaWNvblxcXCI+PC9pPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiY29sLWxnLTEwXFxcIj5cXG5cdFx0XHRcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRpdGxlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cdFx0XHRcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0XHQ8L2Rpdj5cXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxoMz5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50aXRsZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGl0bGUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJ0aXRsZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2gzPlwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPHA+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lc3NhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9wPlwiO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0XHQ8ZGl2IGNsYXNzPVxcXCJjb2wtbGctMTJcXFwiPlxcblx0XHRcdFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGl0bGUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblxcblx0XHRcdFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXHRcdDwvZGl2PlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcImNsb3NlXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtdGltZXMtY2lyY2xlXFxcIj48L2k+PC9hPlxcblxcbjxkaXYgY2xhc3M9XFxcInJvd1xcXCI+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibm8tb3JkZXJlZC1saXN0LWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJtZXNzYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJvcmRlcmVkLWxpc3QtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29udGVudCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInBhZ2VyXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnByZXZDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnByZXZDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJwcmV2Q2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHRcdDxsaSBjbGFzcz1cXFwicGFnZS10b3RhbHNcXFwiPlBhZ2UgXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGFnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgb2YgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50b3RhbFBhZ2VzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2xpPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudG90YWxQYWdlcyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG90YWxQYWdlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInRvdGFsUGFnZXNcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uZXh0Q2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uZXh0Q2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibmV4dENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPHVsIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGFnZXJDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBhZ2VyQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJwYWdlckNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0PGxpIGNsYXNzPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnNuYXBUb0VkZ2VzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJwcmV2LXBhZ2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1sb25nLWFycm93LWxlZnRcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L2k+IFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wcmV2TGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnByZXZMYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicHJldkxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvYT48L2xpPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5jbHVkZVBhZ2VUb3RhbHMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0PGxpIGNsYXNzPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnNuYXBUb0VkZ2VzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJuZXh0LXBhZ2VcXFwiPlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uZXh0TGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5leHRMYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibmV4dExhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiA8aSBjbGFzcz1cXFwiZmEgZmEtbG9uZy1hcnJvdy1yaWdodFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvaT48L2E+PC9saT5cXG48L3VsPlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInBhZ2luYXRpb24taXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXHQ8YT4maGVsbGlwOzwvYT5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxhIGhyZWY9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaHJlZiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwW1wiY2xhc3NcIl0gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlxcblx0XHRcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYWdlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXHQ8L2E+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ocmVmIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ocmVmIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaHJlZlwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIjXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbXCJjbGFzc1wiXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbXCJjbGFzc1wiXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImNsYXNzXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJkYXRhLWxhYmVsPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gXCI8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9zcGFuPlwiO1xufSxcIjE0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJwYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGl2aWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wicGFnaW5hdGlvblwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8dWwgY2xhc3M9XFxcInBhZ2luYXRpb24gXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGFnaW5hdGlvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFnaW5hdGlvbkNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInBhZ2luYXRpb25DbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdDxsaT5cXG5cdFx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcInByZXYtcGFnZVxcXCIgYXJpYS1sYWJlbD1cXFwiUHJldmlvdXNcXFwiPlxcblx0XHRcdDxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj4mbGFxdW87PC9zcGFuPlxcblx0XHQ8L2E+XFxuXHQ8L2xpPlxcbiAgICA8bGk+XFxuXHRcdDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJuZXh0LXBhZ2VcXFwiIGFyaWEtbGFiZWw9XFxcIk5leHRcXFwiPlxcblx0XHRcdDxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj4mcmFxdW87PC9zcGFuPlxcblx0XHQ8L2E+XFxuICAgIDwvbGk+XFxuPC91bD5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJwcm9ncmVzcy1iYXJcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnByb2dyZXNzQmFyQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wcm9ncmVzc0JhckNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicHJvZ3Jlc3NCYXJDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiByb2xlPVxcXCJwcm9ncmVzc2JhclxcXCIgYXJpYS12YWx1ZW5vdz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnByb2dyZXNzIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wcm9ncmVzcyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicHJvZ3Jlc3NcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBhcmlhLXZhbHVlbWluPVxcXCIwXFxcIiBhcmlhLXZhbHVlbWF4PVxcXCIxMDBcXFwiIHN0eWxlPVxcXCJ3aWR0aDogXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnByb2dyZXNzIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wcm9ncmVzcyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicHJvZ3Jlc3NcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJTtcXFwiPlxcblx0PHNwYW4gY2xhc3M9XFxcInNyLW9ubHlcXFwiPlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wcm9ncmVzcyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucHJvZ3Jlc3MgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInByb2dyZXNzXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiUgQ29tcGxldGU8L3NwYW4+XFxuPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZm9ybS1yYWRpby1maWVsZFwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlciB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXCJcIjtcblxuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm9wdGlvbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJvcHRpb25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDcsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMub3B0aW9ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG59LFwiN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXMzPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzND1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzNT1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiXHQ8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaW5wdXRDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcblx0XHQ8bGFiZWwgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMzLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPjxpbnB1dCB0eXBlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0udHlwZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm5hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJbXVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52YWx1ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXM0KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM1ID8gaGVscGVyLmNhbGwoYWxpYXMzLHtcIm5hbWVcIjpcInZhbHVlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+IFwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXM0KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM1ID8gaGVscGVyLmNhbGwoYWxpYXMzLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXHQ8L2Rpdj5cXG5cIjtcbn0sXCI4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlucHV0Q2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbnB1dENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaW5wdXRDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDExLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+PGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50eXBlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50eXBlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ0eXBlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm5hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcIm5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnZhbHVlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52YWx1ZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidmFsdWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L2xhYmVsPlxcblx0PC9kaXY+XFxuXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImxhYmVsQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMTAsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJyYW5nZS1zbGlkZXJcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInNsaWRlclxcXCI+PC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZm9ybS1zZWxlY3QtZmllbGRcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHQ8XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlclRhZ05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlclRhZ05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclRhZ05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXIgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlclRhZ05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlclRhZ05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclRhZ05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8bGFiZWwgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJpZD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiaWRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImxhYmVsQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJcdDxwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg5LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmRlc2NyaXB0aW9uIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPC9wPlxcblwiO1xufSxcIjlcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGhzWzJdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjExXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwibmFtZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm5hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJpZD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmlkIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjE1XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJtdWx0aXBsZVwiO1xufSxcIjE3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxvcHRpb24gXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZhbHVlIDogZGVwdGgwKSxcIiE9PVwiLHVuZGVmaW5lZCx7XCJuYW1lXCI6XCJpc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxOCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc2VsZWN0ZWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIwLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMjIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDI0LCBkYXRhLCAwKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L29wdGlvbj5cXG5cIjtcbn0sXCIxOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJ2YWx1ZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmFsdWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZhbHVlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwidmFsdWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjIwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiXCI7XG59LFwiMjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCIyNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmFsdWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZhbHVlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwidmFsdWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBidWZmZXIgPSBcbiAgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPHNlbGVjdCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDExLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaW5wdXRDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlucHV0Q2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJpbnB1dENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubXVsdGlwbGUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDE1LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMub3B0aW9ucyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLChvcHRpb25zPXtcIm5hbWVcIjpcIm9wdGlvbnNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTcsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5vcHRpb25zKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiPC9zZWxlY3Q+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInNlbGVjdGlvbi1wb29sLXRyZWUtbm9kZVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDx1bCBjbGFzcz1cXFwiY2hpbGRyZW5cXFwiPjwvdWw+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCI8aSBjbGFzcz1cXFwiZmEgZmEtYmFycyBkcmFnLWhhbmRsZVxcXCI+PC9pPlxcblxcbjxzcGFuIGNsYXNzPVxcXCJub2RlLW5hbWVcXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbnRlbnQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9zcGFuPlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGFzQ2hpbGRyZW4gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInNlbGVjdGlvbi1wb29sXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiaGVpZ2h0OlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWlnaHQgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI7XCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInJvdyBzZWxlY3Rpb24tcG9vbC1zZWFyY2hcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtc20tMTJcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwic2VsZWN0aW9uLXBvb2wtc2VhcmNoLWZpZWxkXFxcIj5cXG4gICAgICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwic2VsZWN0aW9uLXBvb2wtc2VhcmNoLWNsZWFyXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtdGltZXMtY2lyY2xlXFxcIj48L2k+PC9hPlxcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiB2YWx1ZT1cXFwiXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50ZXIga2V5d29yZHMgdG8gc2VhcmNoIHRoZSBsaXN0XFxcIiBjbGFzcz1cXFwic2VhcmNoIGZvcm0tY29udHJvbFxcXCI+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cXFwicm93IHNlbGVjdGlvbi1wb29sLWxpc3RzXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiY29sLXNtLTZcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYXZhaWxhYmxlLXBvb2wgZHJvcHBhYmxlLXBvb2xcXFwiIGRhdGEtYWNjZXB0PVxcXCIuc2VsZWN0ZWQtcG9vbCAuZHJhZ2dhYmxlLXRyZWUtbm9kZVxcXCIgc3R5bGU9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVpZ2h0IDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiY29sLXNtLTZcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwic2VsZWN0ZWQtcG9vbCBkcm9wcGFibGUtcG9vbFxcXCIgZGF0YS1hY2NlcHQ9XFxcIi5hdmFpbGFibGUtcG9vbCAuZHJhZ2dhYmxlLXRyZWUtbm9kZVxcXCIgc3R5bGU9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVpZ2h0IDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFibGUtYWN0aXZpdHktaW5kaWNhdG9yLXJvd1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcInN0eWxlPVxcXCJoZWlnaHQ6XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlaWdodCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcInB4XFxcIlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjx0ZCBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLXJvd1xcXCIgY29sc3Bhbj1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29sdW1ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGVuZ3RoIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWlnaHQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvci1kaW1tZXJcXFwiPlxcblx0XHRcXG5cdFx0PHNwYW4gY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvclxcXCI+PC9zcGFuPlxcblxcblx0PC9kaXY+XFxuXFxuPC90ZD5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFibGUtbm8taXRlbXNcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0ZCBjb2xzcGFuPVxcXCJcIlxuICAgICsgYWxpYXMxKGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29sdW1ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGVuZ3RoIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXG5cdFwiXG4gICAgKyBhbGlhczEoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZXNzYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibWVzc2FnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXG48L3RkPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInRhYmxlLXZpZXctZm9vdGVyXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRvdGFsUGFnZXMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRvdGFsUGFnZXMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJ0b3RhbFBhZ2VzXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGFnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzMj1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIjx0ZCBjb2xzcGFuPVxcXCJcIlxuICAgICsgYWxpYXMxKGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29sdW1ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGVuZ3RoIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwicGFnZS10b3RhbHNcXFwiPlxcbiAgICBQYWdlIFwiXG4gICAgKyBhbGlhczEoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMix7XCJuYW1lXCI6XCJwYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBvZiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczIsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRvdGFsUGFnZXMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjwvdGQ+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFibGUtdmlldy1ncm91cFwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXG4gIFwiPGRpdiBjbGFzcz1cXFwiYnV0dG9ucy13cmFwcGVyIHB1bGwtcmlnaHRcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJ1dHRvbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJidXR0b25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuYnV0dG9ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIjwvZGl2PlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdDxhIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ocmVmIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ocmVmIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJocmVmXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvYT5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpO1xufSxcIjVcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uYnV0dG9uQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSk7XG59LFwiN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L2k+XCI7XG59LFwiOVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlckNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlciB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XFxuXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHQ8XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRlc2NyaXB0aW9uVGFnIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvblRhZyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiZGVzY3JpcHRpb25UYWdcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGVzY3JpcHRpb25DbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRlc2NyaXB0aW9uVGFnIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvblRhZyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiZGVzY3JpcHRpb25UYWdcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlxcblwiO1xufSxcIjEzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHRcdFx0PHRoIHNjb3BlPVxcXCJjb2xcXFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAud2lkdGggOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDE0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSwoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ub3JkZXIgOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlzXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDE2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDE4LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSgyMCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHRcdFx0PC90aD5cXG5cIjtcbn0sXCIxNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJ3aWR0aD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMud2lkdGggfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLndpZHRoIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwid2lkdGhcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjE2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwic29ydC1cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uc29ydCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcIjE4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiO1xuXG4gIHJldHVybiBcIlx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInNvcnRcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9hPlxcblx0XHRcdFx0XHQ8aSBjbGFzcz1cXFwic29ydC1pY29uIGFzYyBmYSBmYS1zb3J0LWFzY1xcXCI+PC9pPlxcblx0XHRcdFx0XHQ8aSBjbGFzcz1cXFwic29ydC1pY29uIGRlc2MgZmEgZmEtc29ydC1kZXNjXFxcIj48L2k+XFxuXCI7XG59LFwiMjBcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gXCJcdFx0XHRcdFx0XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudG90YWxQYWdlcyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG90YWxQYWdlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInRvdGFsUGFnZXNcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiMjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGFnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSk7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbiwgYnVmZmVyID0gXG4gIFwiPGRpdiBjbGFzcz1cXFwidGFibGUtaGVhZGVyXFxcIj48L2Rpdj5cXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGVuZ3RoIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjx0YWJsZSBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRhYmxlQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50YWJsZUNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidGFibGVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdDx0aGVhZD5cXG5cdFx0PHRyPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbHVtbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbHVtbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwob3B0aW9ucz17XCJuYW1lXCI6XCJjb2x1bW5zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIlx0XHQ8L3RyPlxcblx0PC90aGVhZD5cXG5cdDx0Ym9keT48L3Rib2R5Plxcblx0PHRmb290Plxcblx0XHQ8dGQgY29sc3Bhbj1cXFwiXCJcbiAgICArIGFsaWFzNChjb250YWluZXIubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbHVtbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxlbmd0aCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInBhZ2UtdG90YWxzXFxcIj5cXG5cdFx0ICAgIDwhLS0gUGFnZSBcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGFnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgb2YgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50b3RhbFBhZ2VzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyMiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMjQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAtLT5cXG5cdFx0PC90ZD5cXG5cdDwvdGZvb3Q+XFxuPC90YWJsZT5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFibGUtdmlldy1wYWdpbmF0aW9uXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2PjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInRhYmxlLXZpZXctcm93XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDx0ZCBkYXRhLWlkPVxcXCJcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJpZFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczMoKGhlbHBlcnMucHJvcGVydHlPZiB8fCAoZGVwdGgwICYmIGRlcHRoMC5wcm9wZXJ0eU9mKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLGRlcHRoc1sxXSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcInByb3BlcnR5T2ZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkpXG4gICAgKyBcIjwvdGQ+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGJ1ZmZlciA9IFxuICBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbHVtbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbHVtbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImNvbHVtbnNcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29sdW1ucyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29sdW1ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLChvcHRpb25zPXtcIm5hbWVcIjpcImNvbHVtbnNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmNvbHVtbnMpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJmb3JtLXRleHRhcmVhLWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIlx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWxDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJsYWJlbENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDksIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRlc2NyaXB0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwibmFtZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjx0ZXh0YXJlYSBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDExLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5wdXRDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlucHV0Q2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC90ZXh0YXJlYT5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ0YWItY29udGVudFwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29udGVudCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInRhYnNcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPCEtLSBOYXYgdGFicyAtLT5cXG48dWwgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRhYkNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGFiQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwidGFiQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgcm9sZT1cXFwidGFibGlzdFxcXCI+PC91bD5cXG5cXG48IS0tIFRhYiBwYW5lcyAtLT5cXG48ZGl2IGNsYXNzPVxcXCJ0YWItY29udGVudFxcXCI+PC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZHJhZ2dhYmxlLXRyZWUtdmlldy1ub2RlXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPHVsIGNsYXNzPVxcXCJjaGlsZHJlblxcXCI+PC91bD5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIjxpIGNsYXNzPVxcXCJmYSBmYS1iYXJzIGRyYWctaGFuZGxlXFxcIj48L2k+XFxuXFxuPGRpdiBjbGFzcz1cXFwibm9kZS1uYW1lXFxcIj5cXG4gICAgPHNwYW4+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3NwYW4+XFxuPC9kaXY+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oYXNDaGlsZHJlbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibm8tdHJlZS12aWV3LW5vZGVzXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8cD5UaGlzIHRyZWUgaGFzIG5vIG5vZGVzLjwvcD5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ0cmVlLXZpZXctbm9kZVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDx1bCBjbGFzcz1cXFwiY2hpbGRyZW5cXFwiPjwvdWw+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJuYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGFzQ2hpbGRyZW4gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIm5vLXVub3JkZXJlZC1saXN0LWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJtZXNzYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ1bm9yZGVyZWQtbGlzdC1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb250ZW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wid2l6YXJkLWJ1dHRvbnNcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGlzYWJsZWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcbiAgICAgICAgICAgIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxuICAgICAgICA8L2J1dHRvbj5cXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmRpc2FibGVkQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSk7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L2k+IFwiO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGlzYWJsZWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcbiAgICAgICAgICAgIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuICAgICAgICA8L2J1dHRvbj5cXG5cIjtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIiA8aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L2k+XCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZywgYnVmZmVyID0gXG4gIFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLWxlZnQtYnV0dG9ucyBwdWxsLWxlZnRcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxlZnRCdXR0b25zIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sZWZ0QnV0dG9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLChvcHRpb25zPXtcIm5hbWVcIjpcImxlZnRCdXR0b25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5sZWZ0QnV0dG9ucykgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPVxcXCJ3aXphcmQtcmlnaHQtYnV0dG9ucyBwdWxsLXJpZ2h0XFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5yaWdodEJ1dHRvbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJpZ2h0QnV0dG9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLChvcHRpb25zPXtcIm5hbWVcIjpcInJpZ2h0QnV0dG9uc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMucmlnaHRCdXR0b25zKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ3aXphcmQtZXJyb3JcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJUYWdOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXJUYWdOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJUYWdOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIndpemFyZC1lcnJvci1pY29uXFxcIj48aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZXJyb3JJY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5lcnJvckljb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJlcnJvckljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L2k+PC9kaXY+XCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiBcIjxwPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lc3NhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvcD5cIjtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIiAgICA8dWwgY2xhc3M9XFxcIndpemFyZC1lcnJvci1saXN0XFxcIj5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5lcnJvcnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICAgIDwvdWw+XFxuXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgICAgICA8bGk+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoZGVwdGgwLCBkZXB0aDApKVxuICAgICsgXCI8L2xpPlxcblwiO1xufSxcIjEwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJhY2tCdXR0b25DbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJhY2tCdXR0b25DbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImJhY2tCdXR0b25DbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG4gICAgICAgIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYmFja0J1dHRvbkljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDExLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG4gICAgICAgIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5iYWNrQnV0dG9uTGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJhY2tCdXR0b25MYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiYmFja0J1dHRvbkxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcbiAgICA8L2J1dHRvbj5cXG5cIjtcbn0sXCIxMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYmFja0J1dHRvbkljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJhY2tCdXR0b25JY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiYmFja0J1dHRvbkljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj48L2k+IFwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmVycm9ySWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmVycm9ycyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zaG93QmFja0J1dHRvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTAsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIndpemFyZC1wcm9ncmVzc1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIiAgICA8YSBjbGFzcz1cXFwid2l6YXJkLXN0ZXAgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmNvbXBsZXRlIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiIGRhdGEtc3RlcD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc3RlcCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnRpdGxlIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxhYmVsIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg4LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIucHJvZ3JhbSgxMCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICAgIDwvYT5cXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmNvbXBsZXRlQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSk7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kaXNhYmxlZENsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwidGl0bGU9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnRpdGxlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjhcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIndpemFyZC1zdGVwLWxhYmVsXFxcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5vcHRpb25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sYWJlbCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvc3Bhbj5cXG5cIjtcbn0sXCIxMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnRpdGxlIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJ3aXphcmQtc3RlcC1sYWJlbFxcXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEudGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3NwYW4+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXG4gIFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLXByb2dyZXNzLWJhclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuc3RlcHMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnN0ZXBzIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwic3RlcHNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5zdGVwcykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ3aXphcmQtc3VjY2Vzc1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlclRhZ05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlclRhZ05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclRhZ05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXIgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlclRhZ05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlclRhZ05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImhlYWRlclRhZ05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLXN1Y2Nlc3MtaWNvblxcXCI+PGkgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnN1Y2Nlc3NJY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zdWNjZXNzSWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInN1Y2Nlc3NJY29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC9pPjwvZGl2PlwiO1xufSxcIjVcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPHA+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVzc2FnZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcIm1lc3NhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9wPlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnN1Y2Nlc3NJY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDUsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIndpemFyZFwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wYW5lbENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFuZWxDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJwYW5lbENsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJwYW5lbC1ib2R5XFxcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgICAgICAgICAgIDxcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXJDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlckNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlciB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJoZWFkZXJcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyVGFnTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyVGFnTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaGVhZGVyVGFnTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI+XFxuXCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCIgICAgICAgICAgICA8cD5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kZXNjcmlwdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJkZXNjcmlwdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3A+XFxuXCI7XG59LFwiN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtYnV0dG9uc1xcXCI+PC9kaXY+XFxuPC9kaXY+XFxuXCI7XG59LFwiOVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLWJ1dHRvbnNcXFwiPjwvZGl2PlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFuZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIndpemFyZC1wcm9ncmVzc1xcXCI+PC9kaXY+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtY29udGVudFxcXCI+PC9kaXY+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYW5lbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTsiLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdoYW5kbGViYXJzJykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2hhbmRsZWJhcnMnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5IYW5kbGViYXJzSGVscGVyc1JlZ2lzdHJ5ID0gZmFjdG9yeShyb290LkhhbmRsZWJhcnMpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKEhhbmRsZWJhcnMpIHtcblxuICAgIHZhciBpc0FycmF5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIHZhciBFeHByZXNzaW9uUmVnaXN0cnkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5leHByZXNzaW9ucyA9IFtdO1xuICAgIH07XG5cbiAgICBFeHByZXNzaW9uUmVnaXN0cnkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChvcGVyYXRvciwgbWV0aG9kKSB7XG4gICAgICAgIHRoaXMuZXhwcmVzc2lvbnNbb3BlcmF0b3JdID0gbWV0aG9kO1xuICAgIH07XG5cbiAgICBFeHByZXNzaW9uUmVnaXN0cnkucHJvdG90eXBlLmNhbGwgPSBmdW5jdGlvbiAob3BlcmF0b3IsIGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIGlmICggISB0aGlzLmV4cHJlc3Npb25zLmhhc093blByb3BlcnR5KG9wZXJhdG9yKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG9wZXJhdG9yIFwiJytvcGVyYXRvcisnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmV4cHJlc3Npb25zW29wZXJhdG9yXShsZWZ0LCByaWdodCk7XG4gICAgfTtcblxuICAgIHZhciBlUiA9IG5ldyBFeHByZXNzaW9uUmVnaXN0cnkoKTtcbiAgICBlUi5hZGQoJ25vdCcsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ICE9IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPicsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ID4gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc8JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJz49JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPj0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc8PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPT0nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA9PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJz09PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJyE9PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ICE9PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJ2luJywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgaWYgKCAhIGlzQXJyYXkocmlnaHQpKSB7XG4gICAgICAgICAgICByaWdodCA9IHJpZ2h0LnNwbGl0KCcsJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJpZ2h0LmluZGV4T2YobGVmdCkgIT09IC0xO1xuICAgIH0pO1xuXG4gICAgdmFyIGlzSGVscGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgbGVmdCA9IGFyZ3NbMF0sXG4gICAgICAgICAgICBvcGVyYXRvciA9IGFyZ3NbMV0sXG4gICAgICAgICAgICByaWdodCA9IGFyZ3NbMl0sXG4gICAgICAgICAgICBvcHRpb25zID0gYXJnc1szXTtcblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IGFyZ3NbMV07XG4gICAgICAgICAgICBpZiAobGVmdCkgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDMpIHtcbiAgICAgICAgICAgIHJpZ2h0ID0gYXJnc1sxXTtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmdzWzJdO1xuICAgICAgICAgICAgaWYgKGxlZnQgPT0gcmlnaHQpIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlUi5jYWxsKG9wZXJhdG9yLCBsZWZ0LCByaWdodCkpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfTtcblxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lzJywgaXNIZWxwZXIpO1xuXG4gICAgcmV0dXJuIGVSO1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdoYW5kbGViYXJzJyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnaGFuZGxlYmFycycsICd1bmRlcnNjb3JlJ10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuSGFuZGxlYmFyc0hlbHBlcnNSZWdpc3RyeSA9IGZhY3Rvcnkocm9vdC5IYW5kbGViYXJzLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKEhhbmRsZWJhcnMsIF8pIHtcblxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ25vdCcsIGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgXHRyZXR1cm4gIXZhbHVlIHx8IHZhbHVlID09IDAgPyBvcHRpb25zLmZuKHZhbHVlKSA6IGZhbHNlO1xuICAgIH0pO1xuICAgIFxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnaGFuZGxlYmFycycpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuSGFuZGxlYmFyc0hlbHBlcnNSZWdpc3RyeSA9IGZhY3Rvcnkocm9vdC5IYW5kbGViYXJzKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG5cbiAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdwcm9wZXJ0eU9mJywgZnVuY3Rpb24ob2JqZWN0LCBwcm9wKSB7XG4gICAgICAgIGlmKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcob2JqZWN0W3Byb3BdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSwgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lLCByb290Lk1hcmlvbmV0dGUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblxuICAgIFRvb2xib3guVHJlZSA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuICAgICAgICBoYXNSZXNldE9uY2U6IGZhbHNlLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGFyYXRvcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbkNsYXNzOiBCYWNrYm9uZS5Db2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ29sbGVjdGlvbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG4gICAgICAgICAgICAgICAgcGFyZW50QXR0cmlidXRlOiAncGFyZW50X2lkJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbihjb2xsZWN0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBCYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgW10sIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBUb29sYm94Lk9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuZ2V0T3B0aW9uKCdvcmlnaW5hbENvbGxlY3Rpb24nKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vcmlnaW5hbENvbGxlY3Rpb24gPSBjb2xsZWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLnRlbXBsYXRlICYmICF0aGlzLmdldE9wdGlvbignY2hpbGRWaWV3T3B0aW9ucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNoaWxkVmlld09wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbignYWZ0ZXI6aW5pdGlhbGl6ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRUcmVlKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gSGFjayB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBDb2xsZWN0aW9uIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgICAgIC8vIGluaGVyaXRlZCBieSB0aGUgcHJvdG90eXBlLlxuICAgICAgICAgICAgaWYoIXRoaXMuaGFzUmVzZXRPbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNSZXNldE9uY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignYWZ0ZXI6aW5pdGlhbGl6ZScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUucmVzZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZFRyZWU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgICAgICAgICAgaWYoZGF0YS50b0pTT04pIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS50b0pTT04oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX2NyZWF0ZUNvbGxlY3Rpb24oZGF0YSk7XG5cbiAgICAgICAgICAgIHZhciBjb3VudCA9IDAsIHRvdGFsQXR0ZW1wdHMgPSBkYXRhLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IGRhdGEudG9BcnJheSgpO1xuXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB0aGlzLmdldFBhcmVudElkKGl0ZW1zW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmZpbmROb2RlQnlJZChwYXJlbnRJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKF8uaXNOdWxsKHBhcmVudElkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucmVtb3ZlKHRoaXMuYXBwZW5kTm9kZShpdGVtc1tpXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFyZW50ID0gdGhpcy5maW5kTm9kZUJ5SWQocGFyZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5yZW1vdmUodGhpcy5hcHBlbmROb2RlKGl0ZW1zW2ldLCBwYXJlbnQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKGNvdW50ID4gdG90YWxBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSB0cmVlIGNvdWxkIG5vdCBiZSBnZW5lcmF0ZWQuIEluZmluaXRlIGxvb3AgZGV0ZWN0ZWQgd2l0aCB0aGUgcmVtYWluaW5nIG1vZGVsczogXCInK2RhdGEucGx1Y2soJ2lkJykrJ1wiJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRPcHRpb246IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIGlmKCFfLmlzVW5kZWZpbmVkKHRoaXMub3B0aW9uc1tuYW1lXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW25hbWVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRQYXJlbnRJZDogZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgIGlmKCFtb2RlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnRBdHRyaWJ1dGUnKSkgfHwgbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJZDogZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2lkQXR0cmlidXRlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlb3JkZXI6IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uIHx8IHRoaXM7XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCwgaSkge1xuICAgICAgICAgICAgICAgIG1vZGVsLnNldCh0aGlzLmNvbXBhcmF0b3IsIGkgKyAxKTtcblxuICAgICAgICAgICAgICAgIGlmKG1vZGVsLmNoaWxkcmVuICYmIG1vZGVsLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlb3JkZXIobW9kZWwuY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZE5vZGVzOiBmdW5jdGlvbihjaGlsZHJlbiwgcGFyZW50KSB7XG4gICAgICAgICAgICBfLmVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmROb2RlKGNoaWxkLCBwYXJlbnQpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kTm9kZTogZnVuY3Rpb24oY2hpbGQsIHBhcmVudCwgb3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICAgICAgICAgIGNoaWxkLmNoaWxkcmVuIHx8IChjaGlsZC5jaGlsZHJlbiA9IHRoaXMuX2NyZWF0ZUNvbGxlY3Rpb24oKSk7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTm9kZShjaGlsZCk7XG5cbiAgICAgICAgICAgIGlmKHBhcmVudCkge1xuICAgICAgICAgICAgICAgIGNoaWxkLnNldCh0aGlzLmdldE9wdGlvbigncGFyZW50QXR0cmlidXRlJyksIHBhcmVudC5nZXQodGhpcy5nZXRPcHRpb24oJ2lkQXR0cmlidXRlJykpKTtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4uYWRkKGNoaWxkLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoaWxkLnNldCh0aGlzLmdldE9wdGlvbigncGFyZW50QXR0cmlidXRlJyksIG51bGwpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKGNoaWxkLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZE5vZGVCZWZvcmU6IGZ1bmN0aW9uKGNoaWxkLCBzaWJsaW5nKSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB0aGlzLmdldFBhcmVudElkKHNpYmxpbmcpO1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IHBhcmVudElkID8gdGhpcy5maW5kKHtpZDogcGFyZW50SWR9KSA6IG51bGw7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBwYXJlbnQgPyBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihzaWJsaW5nKSA6IHRoaXMuaW5kZXhPZihzaWJsaW5nKTtcblxuICAgICAgICAgICAgdGhpcy5hcHBlbmROb2RlKGNoaWxkLCBwYXJlbnQsIHtcbiAgICAgICAgICAgICAgICBhdDogaW5kZXhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kTm9kZUFmdGVyOiBmdW5jdGlvbihjaGlsZCwgc2libGluZykge1xuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gdGhpcy5nZXRQYXJlbnRJZChzaWJsaW5nKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmZpbmQoe2lkOiBwYXJlbnRJZH0pO1xuXG4gICAgICAgICAgICBpZihwYXJlbnRJZCAmJiBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZE5vZGUoY2hpbGQsIHBhcmVudCwge1xuICAgICAgICAgICAgICAgICAgICBhdDogcGFyZW50LmNoaWxkcmVuLmluZGV4T2Yoc2libGluZykgKyAxXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZE5vZGUoY2hpbGQsIG51bGwsIHtcbiAgICAgICAgICAgICAgICAgICAgYXQ6IHRoaXMuaW5kZXhPZihzaWJsaW5nKSArIDFcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZU5vZGU6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHRoaXMuZ2V0UGFyZW50SWQobm9kZSk7XG5cbiAgICAgICAgICAgIGlmKHBhcmVudElkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZmluZCh7aWQ6IHBhcmVudElkfSk7XG5cbiAgICAgICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4ucmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbihpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZmlsdGVyKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBfLmZpbHRlcihjb2xsZWN0aW9uLm1vZGVscywgaXRlcmF0ZWUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgICAgICAgaWYobW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBjb2xsZWN0aW9uLm1vZGVscykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBjb2xsZWN0aW9uLm1vZGVsc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICBpZihtb2RlbC5jaGlsZHJlbiAmJiBtb2RlbC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9IGZpbHRlcihtb2RlbC5jaGlsZHJlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyKHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmQ6IGZ1bmN0aW9uKGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBmaW5kKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBfLmZpbmQoY29sbGVjdGlvbi5tb2RlbHMsIGl0ZXJhdGVlLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIGlmKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gY29sbGVjdGlvbi5tb2RlbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdyA9IGNvbGxlY3Rpb24ubW9kZWxzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHJvdy5jaGlsZHJlbiAmJiByb3cuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBmaW5kKHJvdy5jaGlsZHJlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaW5kKHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdoZXJlOiBmdW5jdGlvbihhdHRyaWJ1dGVzLCBjb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kLmNhbGwodGhpcywgYXR0cmlidXRlcywgY29udGV4dCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZFBhcmVudE5vZGU6IGZ1bmN0aW9uKGNoaWxkLCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kTm9kZUJ5SWQodGhpcy5nZXRQYXJlbnRJZChjaGlsZCksIGNvbGxlY3Rpb24pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmROb2RlOiBmdW5jdGlvbihjaGlsZCwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZE5vZGVCeUlkKHRoaXMuZ2V0SWQoY2hpbGQpLCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kTm9kZUJ5SWQ6IGZ1bmN0aW9uKGlkLCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uIHx8IChjb2xsZWN0aW9uID0gdGhpcyk7XG4gICAgICAgICAgICB2YXIgbW9kZWxzID0gY29sbGVjdGlvbi50b0FycmF5KCk7XG5cbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiBtb2RlbHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBtb2RlbHNbaV07XG5cbiAgICAgICAgICAgICAgICBpZihpZCA9PSB0aGlzLmdldElkKG1vZGVsKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYobW9kZWwuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmZpbmROb2RlQnlJZChpZCwgbW9kZWwuY2hpbGRyZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCFfLmlzTnVsbChub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBwYXJzZShjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IG1vZGVsLnRvSlNPTigpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKG1vZGVsLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5jaGlsZHJlbiA9IHBhcnNlKG1vZGVsLmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJvdy5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiByb3c7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXJzZSh0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy50b0pTT04oKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NyZWF0ZUNvbGxlY3Rpb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBDb2xsZWN0aW9uID0gdGhpcy5nZXRPcHRpb24oJ2NvbGxlY3Rpb25DbGFzcycpIHx8IEJhY2tib25lLkNvbGxlY3Rpb247XG5cbiAgICAgICAgICAgIGRhdGEgPSBuZXcgQ29sbGVjdGlvbihkYXRhIHx8IFtdKTtcblxuICAgICAgICAgICAgZGF0YS5jb21wYXJhdG9yID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdjb21wYXJhdG9yJykpIHtcbiAgICAgICAgICAgICAgICBkYXRhLmNvbXBhcmF0b3IgPSB0aGlzLmdldE9wdGlvbignY29tcGFyYXRvcicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJywgJ2JhY2tib25lLnJhZGlvJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSwgcmVxdWlyZSgnYmFja2JvbmUucmFkaW8nKSwgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lLCByb290LkJhY2tib25lLlJhZGlvLCByb290Lk1hcmlvbmV0dGUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5WaWV3ID0gTWFyaW9uZXR0ZS5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFyaW9uZXR0ZS5WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFRvb2xib3guT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gXy5yZXN1bHQodGhpcywgJ2NoYW5uZWxOYW1lJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbE5hbWUnKSB8fCAndG9vbGJveCc7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbCcpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWwnKSB8fCBSYWRpby5jaGFubmVsKHRoaXMuY2hhbm5lbE5hbWUpO1xuICAgICAgICB9XG5cblx0fSk7XG5cblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUucmFkaW8nLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5yYWRpbycpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuQmFja2JvbmUuUmFkaW8sIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkNvbGxlY3Rpb25WaWV3ID0gTWFyaW9uZXR0ZS5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG5cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIE1hcmlvbmV0dGUuQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gVG9vbGJveC5PcHRpb25zKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucywgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gXy5yZXN1bHQodGhpcywgJ2NoYW5uZWxOYW1lJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbE5hbWUnKSB8fCAnZ2xvYmFsJztcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbCcpIHx8IFJhZGlvLmNoYW5uZWwodGhpcy5jaGFubmVsTmFtZSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkJhc2VGaWVsZCA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGZvcm1Nb2RlbDogZmFsc2UsXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnZm9ybS1ncm91cCcsXG5cbiAgICAgICAgZGVmYXVsdFRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnZm9jdXMge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2ZvY3VzJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnYmx1ciB7e3RyaWdnZXJTZWxlY3Rvcn19Jzoge1xuICAgICAgICAgICAgICAgIGV2ZW50OiAnYmx1cicsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NsaWNrIHt7dHJpZ2dlclNlbGVjdG9yfX0nOiB7XG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdjbGljaycsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2tleXVwIHt7dHJpZ2dlclNlbGVjdG9yfX0nOiB7XG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdrZXk6dXAnLFxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdrZXlkb3duIHt7dHJpZ2dlclNlbGVjdG9yfX0nOiB7XG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdrZXk6ZG93bicsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2tleXByZXNzIHt7dHJpZ2dlclNlbGVjdG9yfX0nOiB7XG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdrZXk6cHJlc3MnLFxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7fSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgaWQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgbmFtZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWxDbGFzc05hbWU6ICdjb250cm9sLWxhYmVsJyxcbiAgICAgICAgICAgIGlucHV0Q2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uQ2xhc3NOYW1lOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgaGVhZGVyVGFnTmFtZTogJ2g0JyxcbiAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RvcjogJ2lucHV0JyxcbiAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiB0cnVlXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LlZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VycyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmdldERlZmF1bHRUcmlnZ2VycygpLCB0aGlzLnRyaWdnZXJzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREZWZhdWx0VHJpZ2dlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBkZWZhdWx0VHJpZ2dlcnMgPSB7fTtcblxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZGVmYXVsdFRyaWdnZXJzLCBmdW5jdGlvbih0cmlnZ2VyLCBrZXkpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2godC5vcHRpb25zLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5ID0ga2V5LnJlcGxhY2UoJ3t7JytuYW1lKyd9fScsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRyaWdnZXJzW2tleS50cmltKCldID0gdHJpZ2dlcjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFRyaWdnZXJzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkuYmx1cigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLmZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRJbnB1dFZhbHVlKHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2F2ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmdldElucHV0VmFsdWUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd1cGRhdGVNb2RlbCcpID09PSB0cnVlICYmIHRoaXMubW9kZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldCh0aGlzLmdldE9wdGlvbignbmFtZScpLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgIHJldHVybiB0aGlzLmdldElucHV0RmllbGQoKS52YWwoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCdpbnB1dCcpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJywgJ2JhY2tib25lJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnXSwgZnVuY3Rpb24oJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lJyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQmxvY2tGb3JtRXJyb3IgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS1lcnJvcicpLFxuXG4gICAgICAgIHRhZ05hbWU6ICdzcGFuJyxcblxuICAgICAgICBjbGFzc05hbWU6ICdoZWxwLWJsb2NrJyxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgaW5wdXQgZmllbGQgbmFtZVxuICAgICAgICAgICAgZmllbGQ6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIFRoZSBpbnB1dCBmaWVsZCBlcnJvcnNcbiAgICAgICAgICAgIGVycm9yczogW10sXG5cbiAgICAgICAgICAgIC8vIChib29sKSBJZiB0cnVlIGVycm9ycyB3aWxsIGhhdmUgPGJyPiB0YWdzIHRvIGJyZWFrIGVycm9yIGludG8gbmV3bGluZXNcbiAgICAgICAgICAgIG5ld2xpbmU6IHRydWVcbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICBpZighXy5pc0FycmF5KG9wdGlvbnMuZXJyb3JzKSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZXJyb3JzID0gW29wdGlvbnMuZXJyb3JzXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5JbmxpbmVGb3JtRXJyb3IgPSBUb29sYm94LkJsb2NrRm9ybUVycm9yLmV4dGVuZCh7XG5cbiAgICAgICAgY2xhc3NOYW1lOiAnaGVscC1pbmxpbmUnXG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guQmFzZUZvcm0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAnZm9ybScsXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdzdWJtaXQnOiAnc3VibWl0J1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzU3VibWl0dGluZzogZmFsc2UsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgQW4gb2JqZWN0IG9mIGFjdGl2aXR5IGluZGljYXRvciBvcHRpb25zXG4gICAgICAgICAgICBhY3Rpdml0eUluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdzbWFsbCdcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBlcnJvciB2aWV3IG9iamVjdFxuICAgICAgICAgICAgZXJyb3JWaWV3OiBUb29sYm94LkJsb2NrRm9ybUVycm9yLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZXJyb3IgdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgZXJyb3JWaWV3T3B0aW9uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBnbG9iYWwgZXJyb3IgdmlldyBvYmplY3RcbiAgICAgICAgICAgIGdsb2JhbEVycm9yc1ZpZXc6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZ2xvYmFsIGVycm9yIHZpZXcgb3B0aW9ucyBvYmplY3RcbiAgICAgICAgICAgIGdsb2JhbEVycm9yc09wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBzaG93RW1wdHlNZXNzYWdlOiBmYWxzZVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIFNob3cgZ2xvYmFsIGVycm9ycyBhZnRlciBmb3JtIHN1Ym1pdHNcbiAgICAgICAgICAgIHNob3dHbG9iYWxFcnJvcnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgU2hvdyBub3RpZmljYXRpb25zIGFmdGVyIGZvcm0gc3VibWl0c1xuICAgICAgICAgICAgc2hvd05vdGlmaWNhdGlvbnM6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBub3RpZmljYXRpb24gdmlldyBvYmplY3RcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvblZpZXc6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgbm90aWZpY2F0aW9uIHZpZXcgb3B0aW9ucyBvYmplY3RcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvblZpZXdPcHRpb25zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGZvcm0gZ3JvdXAgY2xhc3MgbmFtZVxuICAgICAgICAgICAgZm9ybUdyb3VwQ2xhc3NOYW1lOiAnZm9ybS1ncm91cCcsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBoYXMgZXJyb3IgY2xhc3MgbmFtZVxuICAgICAgICAgICAgaGFzRXJyb3JDbGFzc05hbWU6ICdoYXMtZXJyb3InLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgQWRkIHRoZSBoYXMgZXJyb3IgY2xhc3NlcyB0byBmaWVsZHNcbiAgICAgICAgICAgIGFkZEhhc0Vycm9yQ2xhc3M6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBBZGQgdGhlIGlubGluZSBmb3JtIGVycm9yc1xuICAgICAgICAgICAgc2hvd0lubGluZUVycm9yczogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIHJlZGlyZWN0IHVybC4gRmFsc2UgaWYgbm8gcmVkaXJlY3RcbiAgICAgICAgICAgIHJlZGlyZWN0OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIHN1Y2Nlc3MgbWVzc2FnZSBvYmplY3RcbiAgICAgICAgICAgIHN1Y2Nlc3NNZXNzYWdlOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGRlZmF1bHQgc3VjY2VzcyBtZXNzYWdlIG9iamVjdFxuICAgICAgICAgICAgZGVmYXVsdFN1Y2Nlc3NNZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgaWNvbjogJ2ZhIGZhLWNoZWNrJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdTdWNjZXNzIScsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBmb3JtIHdhcyBzdWNjZXNzZnVsbHkgc3VibWl0dGVkLidcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBlcnJwciBtZXNzYWdlIG9iamVjdFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGRlZmF1bHQgc3VjY2VzcyBtZXNzYWdlIG9iamVjdFxuICAgICAgICAgICAgZGVmYXVsdEVycm9yTWVzc2FnZToge1xuICAgICAgICAgICAgICAgIGljb246ICdmYSBmYS13YXJuaW5nJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYWxlcnQnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnRXJyb3IhJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGZvcm0gY291bGQgbm90IGJlIHN1Ym1pdHRlZC4nXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NlcmlhbGl6ZWRGb3JtOiBmYWxzZSxcblxuICAgICAgICBfZXJyb3JWaWV3czogZmFsc2UsXG5cbiAgICAgICAgZ2V0Rm9ybURhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGZvcm1EYXRhID0ge307XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXJyYXkoa2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleSAmJiBrZXkubWF0Y2goL1xcWyhcXGQrKT9cXF0vKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuJGVsLnNlcmlhbGl6ZUFycmF5KCksIGZ1bmN0aW9uKGZpZWxkLCB4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBmb3JtRGF0YSwgbGFzdEtleSwgbWF0Y2hlcyA9IGZpZWxkLm5hbWUubWF0Y2goL15cXHcrfFxcWyhcXHcrKT9cXF0vZyk7XG5cbiAgICAgICAgICAgICAgICBfLmVhY2gobWF0Y2hlcywgZnVuY3Rpb24obWF0Y2gsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IG1hdGNoLnJlcGxhY2UoL1tcXFtcXF1dL2csICcnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBtYXRjaGVzW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzTGFzdE1hdGNoID0gbWF0Y2hlcy5sZW5ndGggLSAxID09IGk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoaXNBcnJheShtYXRjaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0LnB1c2goZmllbGQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViamVjdC5zcGxpY2Uoa2V5LCAwLCBmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZighc3ViamVjdFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViamVjdFtrZXldID0gbmV4dEtleSAmJiBpc0FycmF5KG5leHRLZXkpID8gW10gOiB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXNMYXN0TWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0W2tleV0gPSBmaWVsZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViamVjdCA9IHN1YmplY3Rba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhc3RLZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvcm1EYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qXG4gICAgICAgIGdldEZvcm1EYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHN0cmlwQnJhY2tldHMoY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSBjb21wb25lbnQubWF0Y2goL1teXFxbXFxdXSsvKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzID8gbWF0Y2hlc1swXSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRDb21wb25lbnQoc3ViamVjdCwgY29tcG9uZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmKCFzdWJqZWN0W2NvbXBvbmVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgc3ViamVjdFtjb21wb25lbnRdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1YmplY3RbY29tcG9uZW50XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gYWRkQ29tcG9uZW50cyhzdWJqZWN0LCBjb21wb25lbnRzLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaChjb21wb25lbnRzLCBmdW5jdGlvbihjb21wb25lbnQsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhcmlhYmxlID0gc3RyaXBCcmFja2V0cyhjb21wb25lbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHZhcmlhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0ID0gYWRkQ29tcG9uZW50KHN1YmplY3QsIHZhcmlhYmxlLCBjb21wb25lbnRzLmxlbmd0aCA+IGkgKyAxID8ge30gOiB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGFycmF5IGxpa2UgW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVPYmplY3RzKHJvb3QsIGNvbXBvbmVudHMsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYoIWRhdGFbcm9vdF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtyb290XSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFkZENvbXBvbmVudHMoZGF0YVtyb290XSwgY29tcG9uZW50cywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSAkKHRoaXMpLmF0dHIoJ25hbWUnKTtcblxuICAgICAgICAgICAgICAgIGlmKCgkKHRoaXMpLmlzKCc6cmFkaW8nKSB8fCAkKHRoaXMpLmlzKCc6Y2hlY2tib3gnKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5pcygnOmNoZWNrZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZihuYW1lICYmICghXy5pc051bGwodmFsdWUpICYmICFfLmlzVW5kZWZpbmVkKHZhbHVlKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSBuYW1lLm1hdGNoKC8oXlxcdyspPyhcXFsuKiE/XFxdKS8pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByb290ID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRzID0gbWF0Y2hlc1syXS5tYXRjaCgvXFxbLio/XFxdL2cpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVPYmplY3RzKHJvb3QsIGNvbXBvbmVudHMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkYXRhJywgdGhpcy4kZWwuc2VyaWFsaXplQXJyYXkoKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuICAgICAgICAqL1xuXG4gICAgICAgIHNob3dBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRpbmRpY2F0b3IgPSB0aGlzLiRlbC5maW5kKCcuZm9ybS1pbmRpY2F0b3InKTtcblxuICAgICAgICAgICAgaWYodGhpcy4kaW5kaWNhdG9yLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGluZGljYXRvciA9ICQoJzxkaXYgY2xhc3M9XCJmb3JtLWluZGljYXRvclwiPjwvZGl2PicpO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy4kZWwuZmluZCgnZm9vdGVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2Zvb3RlcicpLmFwcGVuZCh0aGlzLiRpbmRpY2F0b3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKHRoaXMuJGluZGljYXRvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmluZGljYXRvciA9IG5ldyBCYWNrYm9uZS5NYXJpb25ldHRlLlJlZ2lvbih7XG4gICAgICAgICAgICAgICAgZWw6IHRoaXMuJGluZGljYXRvci5nZXQoMClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgaW5kaWNhdG9yID0gbmV3IFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IodGhpcy5nZXRPcHRpb24oJ2FjdGl2aXR5SW5kaWNhdG9yT3B0aW9ucycpKTtcblxuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3Iuc2hvdyhpbmRpY2F0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUVycm9yczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLiRlcnJvcnMpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2godGhpcy4kZXJyb3JzLCBmdW5jdGlvbigkZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgJGVycm9yLnBhcmVudHMoJy4nK3RoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5nZXRGb3JtRGF0YSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNGb3JtQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZighdGhpcy5fc2VyaWFsaXplZEZvcm0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZXJpYWxpemVkRm9ybSAhPT0gdGhpcy5zZXJpYWxpemUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVHbG9iYWxFcnJvcnNSZWdpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZ2xvYmFsRXJyb3JzVmlldycpO1xuXG4gICAgICAgICAgICBpZighVmlldykge1xuICAgICAgICAgICAgICAgIFZpZXcgPSBUb29sYm94LlVub3JkZXJlZExpc3Q7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGdsb2JhbEVycm9ycyA9ICQoJzxkaXYgY2xhc3M9XCJnbG9iYWwtZXJyb3JzXCI+PC9kaXY+Jyk7XG5cbiAgICAgICAgICAgIHRoaXMuYXBwZW5kR2xvYmFsRXJyb3JSZWdpb25Ub0RvbSh0aGlzLiRnbG9iYWxFcnJvcnMpO1xuXG4gICAgICAgICAgICB0aGlzLmdsb2JhbEVycm9ycyA9IG5ldyBNYXJpb25ldHRlLlJlZ2lvbih7XG4gICAgICAgICAgICAgICAgZWw6IHRoaXMuJGdsb2JhbEVycm9ycy5nZXQoMClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgZXJyb3JzVmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHRoaXMuZ2V0T3B0aW9uKCdnbG9iYWxFcnJvcnNPcHRpb25zJykpKTtcblxuICAgICAgICAgICAgdGhpcy5nbG9iYWxFcnJvcnMuc2hvdyhlcnJvcnNWaWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmRHbG9iYWxFcnJvclJlZ2lvblRvRG9tOiBmdW5jdGlvbigkZ2xvYmFsRXJyb3JzKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5wcmVwZW5kKCRnbG9iYWxFcnJvcnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbjogZnVuY3Rpb24obm90aWNlKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdub3RpZmljYXRpb25WaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guTm90aWZpY2F0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBub3RpY2UudHlwZSA/IG5vdGljZS50eXBlIDogJ2FsZXJ0JyxcbiAgICAgICAgICAgICAgICB0aXRsZTogbm90aWNlLnRpdGxlID8gbm90aWNlLnRpdGxlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgPyBub3RpY2UubWVzc2FnZSA6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGljb246IG5vdGljZS5pY29uID8gbm90aWNlLmljb24gOiBmYWxzZVxuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ25vdGlmaWNhdGlvblZpZXdPcHRpb25zJykpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRXJyb3I6IGZ1bmN0aW9uKGZpZWxkLCBlcnJvcikge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZXJyb3JWaWV3Jyk7XG5cbiAgICAgICAgICAgIHZhciBtb2RlbCA9IG5ldyBCYWNrYm9uZS5Nb2RlbCgpO1xuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbignZXJyb3JWaWV3T3B0aW9ucycpLCB7XG4gICAgICAgICAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICAgICAgICAgIGVycm9yczogZXJyb3JcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgcmV0dXJuIHZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRGaWVsZFBhcmVudDogZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldElucHV0RmllbGQoZmllbGQpLnBhcmVudHMoJy4nICsgdGhpcy5nZXRPcHRpb24oJ2Zvcm1Hcm91cENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkOiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgZmllbGQgPSBmaWVsZC5yZXBsYWNlKCcuJywgJ18nKTtcblxuICAgICAgICAgICAgdmFyICRmaWVsZCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJytmaWVsZCsnXCJdJyk7XG5cbiAgICAgICAgICAgIGlmKCRmaWVsZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGZpZWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJyMnK2ZpZWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRJbnB1dEZpZWxkOiBmdW5jdGlvbihmaWVsZCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZChmaWVsZCkudmFsKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRIYXNFcnJvckNsYXNzVG9GaWVsZDogZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkUGFyZW50KGZpZWxkKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignaGFzRXJyb3JDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlSGFzRXJyb3JDbGFzc0Zyb21GaWVsZDogZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkUGFyZW50KGZpZWxkKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignaGFzRXJyb3JDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlR2xvYmFsRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2xvYmFsRXJyb3JzICYmIHRoaXMuZ2xvYmFsRXJyb3JzLmN1cnJlbnRWaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxFcnJvcnMuY3VycmVudFZpZXcuY29sbGVjdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzT25GaXJzdEVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RvciA9ICdkaXYuJyt0aGlzLmdldE9wdGlvbignaGFzRXJyb3JDbGFzc05hbWUnKSsnOmZpcnN0JztcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZChzZWxlY3RvcilcbiAgICAgICAgICAgICAgICAuZmluZCgnaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEnKVxuICAgICAgICAgICAgICAgIC5mb2N1cygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZEVycm9yVmlld1RvR2xvYmFsOiBmdW5jdGlvbihlcnJvclZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsRXJyb3JzLmN1cnJlbnRWaWV3LmNvbGxlY3Rpb24uYWRkKHtcbiAgICAgICAgICAgICAgICBjb250ZW50OiBlcnJvclZpZXcuZ2V0T3B0aW9uKCdlcnJvcnMnKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kRXJyb3JWaWV3VG9GaWVsZDogZnVuY3Rpb24oZXJyb3JWaWV3KSB7XG4gICAgICAgICAgICBlcnJvclZpZXcucmVuZGVyKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZFBhcmVudChlcnJvclZpZXcuZ2V0T3B0aW9uKCdmaWVsZCcpKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoZXJyb3JWaWV3LiRlbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZUVycm9yczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd0dsb2JhbEVycm9ycycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVHbG9iYWxFcnJvcnMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoXy5pc0FycmF5KHRoaXMuX2Vycm9yVmlld3MpKSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKHRoaXMuX2Vycm9yVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2FkZEhhc0Vycm9yQ2xhc3MnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVIYXNFcnJvckNsYXNzRnJvbUZpZWxkKHZpZXcuZ2V0T3B0aW9uKCdmaWVsZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93SW5saW5lRXJyb3JzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuJGVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0Vycm9yOiBmdW5jdGlvbihmaWVsZCwgZXJyb3IpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9lcnJvclZpZXdzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXJyb3JWaWV3cyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZXJyb3JWaWV3ID0gdGhpcy5jcmVhdGVFcnJvcihmaWVsZCwgZXJyb3IpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd0dsb2JhbEVycm9ycycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRFcnJvclZpZXdUb0dsb2JhbChlcnJvclZpZXcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWRkSGFzRXJyb3JDbGFzcycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRIYXNFcnJvckNsYXNzVG9GaWVsZChmaWVsZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93SW5saW5lRXJyb3JzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZEVycm9yVmlld1RvRmllbGQoZXJyb3JWaWV3KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZXJyb3JWaWV3cy5wdXNoKGVycm9yVmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0Vycm9yczogZnVuY3Rpb24oZXJyb3JzKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIF8uZWFjaChlcnJvcnMsIGZ1bmN0aW9uKGVycm9yLCBmaWVsZCkge1xuICAgICAgICAgICAgICAgIHQuc2hvd0Vycm9yKGZpZWxkLCBlcnJvcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c09uRmlyc3RFcnJvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmluZGljYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLmVtcHR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RXJyb3JzRnJvbVJlc3BvbnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UmVkaXJlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdyZWRpcmVjdCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlZGlyZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciByZWRpcmVjdCA9IHRoaXMuZ2V0UmVkaXJlY3QoKTtcblxuICAgICAgICAgICAgaWYocmVkaXJlY3QpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSByZWRpcmVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93U3VjY2Vzc05vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gdGhpcy5jcmVhdGVOb3RpZmljYXRpb24oXy5leHRlbmQoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ2RlZmF1bHRTdWNjZXNzTWVzc2FnZScpLFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdzdWNjZXNzTWVzc2FnZScpXG4gICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLnNob3coKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93RXJyb3JOb3RpZmljYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IHRoaXMuY3JlYXRlTm90aWZpY2F0aW9uKF8uZXh0ZW5kKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdkZWZhdWx0RXJyb3JNZXNzYWdlJyksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ2Vycm9yTWVzc2FnZScpXG4gICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLnNob3coKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXJpYWxpemVkRm9ybSA9IHRoaXMuc2VyaWFsaXplKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93R2xvYmFsRXJyb3JzJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUdsb2JhbEVycm9yc1JlZ2lvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uU3VibWl0U3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmhhc0Zvcm1DaGFuZ2VkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2Zvcm06Y2hhbmdlZCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlcmlhbGl6ZWRGb3JtID0gdGhpcy5zZXJpYWxpemUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dOb3RpZmljYXRpb25zJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dTdWNjZXNzTm90aWZpY2F0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdyZWRpcmVjdCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWRpcmVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uU3VibWl0Q29tcGxldGU6IGZ1bmN0aW9uKHN0YXR1cywgbW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB0aGlzLmlzU3VibWl0dGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5oaWRlRXJyb3JzKCk7XG4gICAgICAgICAgICB0aGlzLmhpZGVBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU3VibWl0RXJyb3I6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dOb3RpZmljYXRpb25zJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dFcnJvck5vdGlmaWNhdGlvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvcnModGhpcy5nZXRFcnJvcnNGcm9tUmVzcG9uc2UocmVzcG9uc2UpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblN1Ym1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmlzU3VibWl0dGluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTdWJtaXR0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dBY3Rpdml0eUluZGljYXRvcigpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlKHRoaXMuZ2V0Rm9ybURhdGEoKSwge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc3VibWl0OmNvbXBsZXRlJywgdHJ1ZSwgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc3VibWl0OnN1Y2Nlc3MnLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24obW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3N1Ym1pdDpjb21wbGV0ZScsIGZhbHNlLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzdWJtaXQ6ZXJyb3InLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnYmFja2JvbmUnXSwgZnVuY3Rpb24oQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vVW5vcmRlcmVkTGlzdEl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCduby11bm9yZGVyZWQtbGlzdC1pdGVtJyksXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdG1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJ1xuXHRcdH0sXG5cblx0XHR0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9ucztcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5Vbm9yZGVyZWRMaXN0SXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0Y2xhc3NOYW1lOiAndW5vcmRlcmVkLWxpc3QtaXRlbScsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbihlLCBvYmopIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljaycsIG9iaik7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zXG5cdFx0fSxcblxuICAgICAgICBnZXRUZW1wbGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZighdGhpcy5nZXRPcHRpb24oJ3RlbXBsYXRlJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9vbGJveC5UZW1wbGF0ZSgndW5vcmRlcmVkLWxpc3QtaXRlbScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RlbXBsYXRlJyk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuXHRUb29sYm94LlVub3JkZXJlZExpc3QgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guVW5vcmRlcmVkTGlzdEl0ZW0sXG5cblx0XHRjbGFzc05hbWU6ICd1bm9yZGVyZWQtbGlzdCcsXG5cblx0XHR0YWdOYW1lOiAndWwnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdC8vIChvYmplY3QpIFRoZSB2aWV3IG9iamVjdCB0byB1c2UgZm9yIHRoZSBlbXB0eSBtZXNzYWdlXG5cdFx0XHRlbXB0eU1lc3NhZ2VWaWV3OiBUb29sYm94Lk5vVW5vcmRlcmVkTGlzdEl0ZW0sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIGxpc3QgaXRlbXNcblx0XHRcdGVtcHR5TWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgZW1wdHkgbWVzc2FnZSB2aWV3XG5cdFx0XHRzaG93RW1wdHlNZXNzYWdlOiB0cnVlXG5cdFx0fSxcblxuXHRcdGNoaWxkVmlld0V2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2l0ZW06Y2xpY2snLCB2aWV3KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRUb29sYm94LkNvbGxlY3Rpb25WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cblx0XHRcdGlmKCF0aGlzLmNvbGxlY3Rpb24pIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKTtcblx0XHRcdH1cblx0XHR9LFxuXG4gICAgICAgIGdldEVtcHR5VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0aWYodGhpcy5nZXRPcHRpb24oJ3Nob3dFbXB0eU1lc3NhZ2UnKSkge1xuXHQgICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2VWaWV3Jyk7XG5cblx0ICAgICAgICAgICAgVmlldyA9IFZpZXcuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcblx0ICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlJylcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIFZpZXc7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydiYWNrYm9uZSddLCBmdW5jdGlvbihCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guRHJvcGRvd25NZW51Tm9JdGVtcyA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdkcm9wZG93bi1tZW51LW5vLWl0ZW1zJyksXG5cblx0XHRjbGFzc05hbWU6ICduby1yZXN1bHRzJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgZHJvcGRvd24gbWVudScsXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cblxuXHR9KTtcblxuXHRUb29sYm94LkRyb3Bkb3duTWVudUl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnZHJvcGRvd24tbWVudS1pdGVtJyxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdkcm9wZG93bi1tZW51LWl0ZW0nKSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRkaXZpZGVyQ2xhc3NOYW1lOiAnZGl2aWRlcidcblx0XHR9LFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayc6IHtcblx0XHRcdFx0ZXZlbnQ6ICdjbGljaycsXG5cdFx0XHRcdHByZXZlbnREZWZhdWx0OiBmYWxzZSxcblx0XHRcdFx0c3RvcFByb3BhZ2F0aW9uOiBmYWxzZVxuXHRcdCAgICB9XG5cdFx0fSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayBhJzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZihfLmlzRnVuY3Rpb24odGhpcy5tb2RlbC5nZXQoJ29uQ2xpY2snKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXQoJ29uQ2xpY2snKS5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZighdGhpcy5tb2RlbC5nZXQoJ2hyZWYnKSkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXHRcdG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCgnZGl2aWRlcicpID09PSB0cnVlKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXZpZGVyQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9KTtcblxuICAgIFRvb2xib3guRHJvcGRvd25NZW51TGlzdCA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuXHRcdGNoaWxkVmlldzogVG9vbGJveC5Ecm9wZG93bk1lbnVJdGVtLFxuXG5cdFx0ZW1wdHlWaWV3OiBUb29sYm94LkRyb3Bkb3duTWVudU5vSXRlbXMsXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnZHJvcGRvd24tbWVudScsXG5cblx0XHR0YWdOYW1lOiAndWwnLFxuXG5cdFx0Y2hpbGRWaWV3RXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3LCBldmVudCkge1xuXG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2snLCB2aWV3LCBldmVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guRHJvcGRvd25NZW51ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZHJvcGRvd24tbWVudScpLFxuXG5cdFx0Y2xhc3NOYW1lOiAnZHJvcGRvd24nLFxuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBtZW51OiB7XG4gICAgICAgICAgICAgICAgZWw6ICd1bC5kcm9wZG93bi1tZW51JyxcbiAgICAgICAgICAgICAgICByZXBsYWNlRWxlbWVudDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cdFx0Y2hpbGRWaWV3RXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FzZCcsIGFyZ3VtZW50cyk7XG5cblx0XHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ2Nsb3NlT25DbGljaycpID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0dGhpcy5oaWRlTWVudSgpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2l0ZW06Y2xpY2snLCB2aWV3KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayAuZHJvcGRvd24tdG9nZ2xlJzogJ3RvZ2dsZTpjbGljaydcblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgbWVudSBpdGVtcyB0byBiZSBjb252ZXJ0ZWQgdG8gYSBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgaXRlbXM6IFtdLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIHRleHRcblx0XHRcdHRvZ2dsZUxhYmVsOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIHRvZ2dsZSBjbGFzcyBuYW1lXG5cdFx0XHR0b2dnbGVDbGFzc05hbWU6ICdkcm9wZG93bi10b2dnbGUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGljb24gY2xhc3MgbmFtZVxuXHRcdFx0dG9nZ2xlSWNvbkNsYXNzTmFtZTogJ2ZhIGZhLWNhcmV0LWRvd24nLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gbWVudSBjbGFzcyBuYW1lXG5cdFx0XHRtZW51Q2xhc3NOYW1lOiAnZHJvcGRvd24tbWVudScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBvcGVuIGNsYXNzIG5hbWVcbiAgICAgICAgICAgIG9wZW5DbGFzc05hbWU6ICdvcGVuJyxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIHZpZXcgdXNlZCB0byBnZW5lcmF0ZSB0aGUgbWVudSBpdGVtcyBsc2l0XG4gICAgICAgICAgICBtZW51Vmlld0NsYXNzOiBUb29sYm94LkRyb3Bkb3duTWVudUxpc3QsXG5cblx0XHRcdC8vIChpbnR8Ym9vbCkgVGhlIGNvbGxlY3Rpb24gbGltaXRcblx0XHRcdGxpbWl0OiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIG9yZGVyIG9mIHRoZSBjb2xsZWN0aW9uIGl0ZW1zXG5cdFx0XHRvcmRlcjogJ25hbWUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBFaXRoZXIgYXNjIG9yIGRlc2Ncblx0XHRcdHNvcnQ6ICdhc2MnLFxuXG5cdFx0XHQvLyAoYm9vbCkgQ2xvc2UgdGhlIG1lbnUgYWZ0ZXIgYW4gaXRlbSBoYXMgYmVlbiBjbGlja2VkXG5cdFx0XHRjbG9zZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBGZXRjaCB0aGUgY29sbGVjdGlvbiB3aGVuIHRoZSBkcm9wZG93biBtZW51IGlzIHNob3duXG5cdFx0XHRmZXRjaE9uU2hvdzogZmFsc2UsXG5cblx0XHRcdC8vIChib29sKSBTaG93IGFuIGFjdGl2aXR5IGluZGljYXRvciB3aGVuIGZldGNoaW5nIHRoZSBjb2xsZWN0aW9uXG5cdFx0XHRzaG93SW5kaWNhdG9yOiB0cnVlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGNsYXNzIG5hbWVcblx0XHRcdG9wZW5DbGFzc05hbWU6ICdvcGVuJ1xuXHRcdH0sXG5cbiAgICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0dGhpcy5vbignZmV0Y2gnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmRpY2F0b3InKSkge1xuXHRcdFx0XHRcdHRoaXMuc2hvd0luZGljYXRvcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5vbignZmV0Y2g6c3VjY2VzcyBmZXRjaDplcnJvcicsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignc2hvd0luZGljYXRvcicpKSB7XG5cdFx0XHRcdFx0dGhpcy5oaWRlSW5kaWNhdG9yKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG4gICAgICAgICAgICBpZighdGhpcy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24odGhpcy5nZXRPcHRpb24oJ2l0ZW1zJykpO1xuICAgICAgICAgICAgfVxuXHRcdH0sXG5cblx0XHRzaG93SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBBY3Rpdml0eVZpZXdJdGVtID0gVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5leHRlbmQoe1xuXHRcdFx0XHR0YWdOYW1lOiAnbGknLFxuXHRcdFx0XHRjbGFzc05hbWU6ICdhY3Rpdml0eS1pbmRpY2F0b3ItaXRlbScsXG5cdFx0XHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0XHRcdHRoaXMub3B0aW9ucy5pbmRpY2F0b3IgPSAnc21hbGwnO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5hZGRDaGlsZChuZXcgQmFja2JvbmUuTW9kZWwoKSwgQWN0aXZpdHlWaWV3SXRlbSk7XG5cdFx0fSxcblxuXHRcdGhpZGVJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHZpZXcgPSB0aGlzLmNoaWxkcmVuLmZpbmRCeUluZGV4KDApO1xuXG5cdFx0XHRpZih2aWV3ICYmIHZpZXcgaW5zdGFuY2VvZiBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKSB7XG5cdFx0XHRcdHRoaXMuY2hpbGRyZW4ucmVtb3ZlKHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoMCkpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzaG93TWVudTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdvcGVuQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblx0XHR9LFxuXG5cdFx0aGlkZU1lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignb3BlbkNsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSkuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXHRcdH0sXG5cblx0XHRpc01lbnVWaXNpYmxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLnBhcmVudCgpLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdvcGVuQ2xhc3NOYW1lJykpO1xuXHRcdH0sXG5cblx0XHRvblRvZ2dsZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKCF0aGlzLmlzTWVudVZpc2libGUoKSkge1xuXHRcdFx0XHR0aGlzLnNob3dNZW51KCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy5oaWRlTWVudSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvblJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgTWVudVZpZXcgPSB0aGlzLmdldE9wdGlvbignbWVudVZpZXdDbGFzcycpIHx8IFRvb2xib3guRHJvcGRvd25NZW51TGlzdDtcblxuICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdtZW51JywgbmV3IE1lbnVWaWV3KHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb25cbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2ZldGNoT25TaG93JykpIHtcblx0XHRcdFx0dGhpcy5mZXRjaCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRmZXRjaDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnZmV0Y2gnKTtcblxuXHRcdFx0dGhpcy5jb2xsZWN0aW9uLmZldGNoKHtcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGxpbWl0OiB0aGlzLmdldE9wdGlvbignbGltaXQnKSxcblx0XHRcdFx0XHRvcmRlcjogdGhpcy5nZXRPcHRpb24oJ29yZGVyJyksXG5cdFx0XHRcdFx0c29ydDogdGhpcy5nZXRPcHRpb24oJ3NvcnQnKSxcblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHRpZihzZWxmLmdldE9wdGlvbignc2hvd0luZGljYXRvcicpKSB7XG5cdFx0XHRcdFx0XHRzZWxmLmhpZGVJbmRpY2F0b3IoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzZWxmLnJlbmRlcigpO1xuXHRcdFx0XHRcdHNlbGYudHJpZ2dlck1ldGhvZCgnZmV0Y2g6c3VjY2VzcycsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0c2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDplcnJvcicsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVHJlZVZpZXdOb2RlID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZ2V0VGVtcGxhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuZ2V0T3B0aW9uKCd0ZW1wbGF0ZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvb2xib3guVGVtcGxhdGUoJ3RyZWUtdmlldy1ub2RlJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndGVtcGxhdGUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0YWdOYW1lOiAnbGknLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3RyZWUtdmlldy1ub2RlJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczogIHtcbiAgICAgICAgICAgIGlkQXR0cmlidXRlOiAnaWQnLFxuICAgICAgICAgICAgcGFyZW50QXR0cmlidXRlOiAncGFyZW50X2lkJyxcbiAgICAgICAgICAgIGNoaWxkVmlldzogZmFsc2UsXG4gICAgICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlZ2lvbnM6IHtcbiAgICAgICAgICAgIG5vZGVzOiAnLmNoaWxkcmVuJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdpZEF0dHJpYnV0ZScpKSB8fCB0aGlzLm1vZGVsLmNpZCxcbiAgICAgICAgICAgICAgICAnZGF0YS1wYXJlbnQtaWQnOiB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbigncGFyZW50QXR0cmlidXRlJykpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLm1vZGVsO1xuXG4gICAgICAgICAgICB0aGlzLmNoaWxkVmlld09wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucywgdGhpcy5nZXRPcHRpb24oJ2NoaWxkVmlld09wdGlvbnMnKSB8fCB7fSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuZ2V0Tm9kZXNGcm9tTW9kZWwodGhpcy5tb2RlbCkpIHtcbiAgICAgICAgICAgICAgICBpZighdGhpcy4kZWwuZmluZCgnLmNoaWxkcmVuJykuaHRtbCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5vbmNlKCdhZGQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd05vZGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGhhc0NoaWxkcmVuOiAgdGhpcy5jb2xsZWN0aW9uID8gdGhpcy5jb2xsZWN0aW9uLmxlbmd0aCA+IDAgOiBmYWxzZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXROb2Rlc0Zyb21Nb2RlbDogZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5jaGlsZHJlbjtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Tm9kZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG5vZGVzID0gdGhpcy5nZXROb2Rlc0Zyb21Nb2RlbCh0aGlzLm1vZGVsKTtcblxuICAgICAgICAgICAgaWYobm9kZXMgJiYgbm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuJGVsLmZpbmQoJy5jaGlsZHJlbicpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJjaGlsZHJlblwiLz4nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZighdGhpcy5oYXNSZWdpb24oJ25vZGVzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSZWdpb24oJ25vZGVzJywgJy5jaGlsZHJlbicpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBDaGlsZFZpZXcgPSB0aGlzLmdldE9wdGlvbignY2hpbGRWaWV3JykgfHwgVG9vbGJveC5UcmVlVmlldztcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygnbm9kZXMnLCBuZXcgQ2hpbGRWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbm9kZXMsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLmdldE9wdGlvbigndGVtcGxhdGUnKSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogdGhpcy5jaGlsZFZpZXdPcHRpb25zXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dOb2RlcygpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlRyZWVWaWV3ID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5UcmVlVmlld05vZGUsXG5cbiAgICAgICAgdGFnTmFtZTogJ3VsJyxcblxuICAgICAgICBjbGFzc05hbWU6ICd0cmVlLXZpZXcnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBuZXN0YWJsZTogdHJ1ZVxuICAgICAgICB9LFxuXG4gICAgICAgIGVtcHR5VmlldzogVG9vbGJveC5JdGVtVmlldyxcblxuICAgICAgICBlbXB0eVZpZXdPcHRpb25zOiB7XG4gICAgICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tdHJlZS12aWV3LW5vZGVzJylcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbigndHJlZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gdGhpcy5nZXRPcHRpb24oJ3RyZWUnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jaGlsZFZpZXdPcHRpb25zID0gXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICB0cmVlUm9vdDogdGhpcyxcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdjaGlsZFZpZXdPcHRpb25zJykgfHwge30pO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2pxdWVyeScsICdiYWNrYm9uZS5tYXJpb25ldHRlJywgJ2ludGVyYWN0LmpzJ10sIGZ1bmN0aW9uKF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdpbnRlcmFjdC5qcycpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kLCByb290Lk1hcmlvbmV0dGUsIHJvb3QuaW50ZXJhY3QpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG5cbiAgICBmdW5jdGlvbiBnZXRJZEF0dHJpYnV0ZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gXy5pc051bGwobmV3IFN0cmluZyh2YWx1ZSkubWF0Y2goL15jXFxkKyQvKSkgPyAnaWQnIDogJ2NpZCc7XG4gICAgfVxuXG4gICAgVG9vbGJveC5EcmFnZ2FibGVUcmVlTm9kZSA9IFRvb2xib3guVHJlZVZpZXdOb2RlLmV4dGVuZCh7XG5cbiAgICAgICAgY2xhc3NOYW1lOiAnZHJhZ2dhYmxlLXRyZWUtbm9kZScsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBUb29sYm94LlRyZWVWaWV3Tm9kZS5wcm90b3R5cGUuZGVmYXVsdE9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBkcmFnZ2luZ0NsYXNzTmFtZTogJ2RyYWdnaW5nJyxcbiAgICAgICAgICAgICAgICBtZW51Q2xhc3NOYW1lOiAnbWVudScsXG4gICAgICAgICAgICAgICAgbWVudVZpZXc6IFRvb2xib3guRHJvcGRvd25NZW51LFxuICAgICAgICAgICAgICAgIG1lbnVWaWV3T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAnZGl2J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zOiBbXSxcbiAgICAgICAgICAgICAgICBuZXN0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcm9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RyZWVSb290Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TWVudUNvbnRhaW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnLicgKyB0aGlzLmdldE9wdGlvbignbWVudUNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdtZW51VmlldycpLCBjb250YWluZXIgPSB0aGlzLmdldE1lbnVDb250YWluZXIoKTtcblxuICAgICAgICAgICAgaWYoVmlldyAmJiBjb250YWluZXIubGVuZ3RoKSB7XG4gICAgICAgIFx0XHR2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbignbWVudVZpZXdPcHRpb25zJyksIHtcbiAgICAgICAgXHRcdFx0aXRlbXM6IHRoaXMuZ2V0T3B0aW9uKCdtZW51SXRlbXMnKVxuICAgICAgICBcdFx0fSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51ID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZWw6IGNvbnRhaW5lci5nZXQoMClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5zaG93KHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuXG4gICAgICAgICAgICBpZigkdGFyZ2V0Lmhhc0NsYXNzKCdkcm9wLWJlZm9yZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpiZWZvcmUnLCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCR0YXJnZXQuaGFzQ2xhc3MoJ2Ryb3AtYWZ0ZXInKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCR0YXJnZXQuaGFzQ2xhc3MoJ2Ryb3AtY2hpbGRyZW4nKSkge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcCcsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3BNb3ZlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgVG9vbGJveC5Ecm9wem9uZXMoZXZlbnQsIHtcbiAgICAgICAgICAgICAgICBiZWZvcmU6IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdkcm9wLWJlZm9yZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2Ryb3AtYWZ0ZXIgZHJvcC1jaGlsZHJlbicpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWZ0ZXI6IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICQoZXZlbnQuZHJvcHpvbmUuZWxlbWVudCgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdkcm9wLWFmdGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnZHJvcC1iZWZvcmUgZHJvcC1jaGlsZHJlbicpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LmRyb3B6b25lLmVsZW1lbnQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2Ryb3AtY2hpbGRyZW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnZHJvcC1hZnRlciBkcm9wLWJlZm9yZScpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDptb3ZlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ01vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fZ2hvc3RFbGVtZW50LmdldCgwKTtcblxuICAgICAgICAgICAgdmFyIHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCkgKyBldmVudC5keDtcbiAgICAgICAgICAgIHZhciB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApICsgZXZlbnQuZHk7XG5cbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgeCArICdweCwgJyArIHkgKyAncHgpJztcblxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuICAgICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6bW92ZScsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuXG4gICAgICAgICAgICB0aGlzLl9naG9zdEVsZW1lbnQgPSAkKCc8dWwgY2xhc3M9XCJkcmFnZ2FibGUtdHJlZVwiIC8+JylcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCR0YXJnZXQuY2xvbmUoKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGV2ZW50LmludGVyYWN0aW9uLmN1ckNvb3Jkcy5jbGllbnQueCAtICgkdGFyZ2V0LmZpbmQoJy5kcmFnLWhhbmRsZScpLm91dGVyV2lkdGgoKSAvIDIpLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IGV2ZW50LmludGVyYWN0aW9uLmN1ckNvb3Jkcy5jbGllbnQueSAtICgkdGFyZ2V0LmZpbmQoJy5kcmFnLWhhbmRsZScpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkdGFyZ2V0LmNzcygnb3BhY2l0eScsIDApO1xuICAgICAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLl9naG9zdEVsZW1lbnQpO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcmFnOnN0YXJ0JywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ0VuZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5jc3MoJ29wYWNpdHknLCAxMDApO1xuXG4gICAgICAgICAgICB0aGlzLl9naG9zdEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcmFnOmVuZCcsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyYWdFbnRlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW50ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EcmFnTGVhdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkucmVtb3ZlQ2xhc3MoJ2Ryb3AtYmVmb3JlIGRyb3AtYWZ0ZXIgZHJvcC1jaGlsZHJlbicpO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcmFnOmxlYXZlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcERlYWN0aXZhdGU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkucmVtb3ZlQ2xhc3MoJ2Ryb3AtYmVmb3JlIGRyb3AtYWZ0ZXIgZHJvcC1jaGlsZHJlbicpO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmRlYWN0aXZhdGUnLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVHJlZVZpZXdOb2RlLnByb3RvdHlwZS5vbkRvbVJlZnJlc2guY2FsbCh0aGlzKTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCAkZWwgPSB0aGlzLiRlbDtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FzZCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbnRlcmFjdCh0aGlzLiRlbC5nZXQoMCksIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYWxsb3dGcm9tOiAnLmRyYWctaGFuZGxlJ1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRyYWdnYWJsZSh7XG4gICAgICAgICAgICAgICAgICAgIGF1dG9TY3JvbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9ubW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJhZzptb3ZlJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbmVuZDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW5kJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbnN0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOnN0YXJ0JywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZHJvcHpvbmUoe1xuICAgICAgICAgICAgICAgICAgICBhY2NlcHQ6ICcuJyArIHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICBvdmVybGFwOiAncG9pbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIG9uZHJhZ2VudGVyOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJhZzplbnRlcicsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25kcmFnbGVhdmU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOmxlYXZlJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbmRyb3A6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcm9wJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbmRyb3BkZWFjdGl2YXRlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJvcDpkZWFjdGl2YXRlJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub24oJ2RyYWdtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZXZlbnQuZHJvcHpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJvcDptb3ZlJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd01lbnUoKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2pxdWVyeScsICdiYWNrYm9uZS5tYXJpb25ldHRlJywgJ2ludGVyYWN0LmpzJ10sIGZ1bmN0aW9uKF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdpbnRlcmFjdC5qcycpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kLCByb290Lk1hcmlvbmV0dGUsIHJvb3QuaW50ZXJhY3QpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG5cbiAgICBUb29sYm94LkRyYWdnYWJsZVRyZWVWaWV3ID0gVG9vbGJveC5UcmVlVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5EcmFnZ2FibGVUcmVlTm9kZSxcblxuICAgICAgICBjbGFzc05hbWU6ICdkcmFnZ2FibGUtdHJlZScsXG5cbiAgICAgICAgY2hpbGRWaWV3T3B0aW9uczoge1xuICAgICAgICAgICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG4gICAgICAgICAgICBwYXJlbnRBdHRyaWJ1dGU6ICdwYXJlbnRfaWQnLFxuICAgICAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94LkRyYWdnYWJsZVRyZWVWaWV3XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wQWZ0ZXI6IGZ1bmN0aW9uKGV2ZW50LCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5jb2xsZWN0aW9uLmZpbmROb2RlQnlJZCgkKGV2ZW50LmRyYWdFdmVudC50YXJnZXQpLmRhdGEoJ2lkJykpO1xuXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUFmdGVyKG5vZGUsIHBhcmVudC5tb2RlbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wQmVmb3JlOiBmdW5jdGlvbihldmVudCwgcGFyZW50KSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuY29sbGVjdGlvbi5maW5kTm9kZUJ5SWQoJChldmVudC5kcmFnRXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpKTtcblxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmFwcGVuZE5vZGVCZWZvcmUobm9kZSwgcGFyZW50Lm1vZGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3BDaGlsZHJlbjogZnVuY3Rpb24oZXZlbnQsIHBhcmVudCkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmNvbGxlY3Rpb24uZmluZE5vZGVCeUlkKCQoZXZlbnQuZHJhZ0V2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5hcHBlbmROb2RlKG5vZGUsIHBhcmVudC5tb2RlbCwge1xuICAgICAgICAgICAgICAgIGF0OiAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2pxdWVyeScsICdzcGluLmpzJ10sIGZ1bmN0aW9uKF8sICQsIFNwaW5uZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgJCwgU3Bpbm5lcik7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3NwaW4uanMnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kLCByb290LlNwaW5uZXIpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQsIFNwaW5uZXIpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnYWN0aXZpdHktaW5kaWNhdG9yJyksXG5cbiAgICAgICAgc3Bpbm5pbmc6IGZhbHNlLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBsYWJlbDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbEZvbnRTaXplOiBmYWxzZSxcbiAgICAgICAgICAgIGRpbW1lZEJnQ29sb3I6IGZhbHNlLFxuICAgICAgICAgICAgZGltbWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9TdGFydDogdHJ1ZSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIG1pbkhlaWdodDogJzBweCcsXG4gICAgICAgICAgICBpbmRpY2F0b3I6IHt9LFxuICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDAsXG4gICAgICAgICAgICBkZWZhdWx0SW5kaWNhdG9yOiB7XG4gICAgICAgICAgICAgICAgbGluZXM6IDExLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICBsZW5ndGg6IDE1LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgIHdpZHRoOiAzLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEzLCAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICAgICAgICAgICAgICBjb3JuZXJzOiA0LCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgIHJvdGF0ZTogMCwgLy8gVGhlIHJvdGF0aW9uIG9mZnNldFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMSwgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzAwMCcsIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcbiAgICAgICAgICAgICAgICBzcGVlZDogMSwgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgICAgICAgICAgICAgICB0cmFpbDogNDAsIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgc2hhZG93OiBmYWxzZSwgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcbiAgICAgICAgICAgICAgICBod2FjY2VsOiB0cnVlLCAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdhY3Rpdml0eS1pbmRpY2F0b3Itc3Bpbm5lcicsIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXG4gICAgICAgICAgICAgICAgekluZGV4OiAyZTksIC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxuICAgICAgICAgICAgICAgIHRvcDogJzUwJScsIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcbiAgICAgICAgICAgICAgICBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFByZXNldE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAndGlueSc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA0LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNCwgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEsIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAxNSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdzbWFsbCc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA3LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNywgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEsIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAyMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdtZWRpdW0nOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogMTQsIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMSwgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEsIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAzMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdsYXJnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiAyOCwgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEsIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDIwLCAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICAgICAgICAgICAgICAgICAgY29ybmVyczogMSwgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDYwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB2YXIgcmVzaXplVGltZXIsIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuJGVsLmZpbmQoJy5hY3Rpdml0eS1pbmRpY2F0b3ItbGFiZWwnKS5jc3Moe3RvcDogJyd9KTtcbiAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uTGFiZWwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc2l0aW9uTGFiZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5zcGlubmVyICYmIHRoaXMuZ2V0T3B0aW9uKCdsYWJlbCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyICRsYWJlbCA9IHRoaXMuJGVsLmZpbmQoJy5hY3Rpdml0eS1pbmRpY2F0b3ItbGFiZWwnKTtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gJGxhYmVsLm91dGVySGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IFRvb2xib3guVmlld09mZnNldCgkbGFiZWwuZ2V0KDApKTtcblxuICAgICAgICAgICAgICAgICRsYWJlbC5jaGlsZHJlbigpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGhpcy5zcGlubmVyLm9wdHMubGFiZWxPZmZzZXQgfHwgMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldExhYmVsOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmFjdGl2aXR5LWluZGljYXRvci1sYWJlbCcpLmh0bWwodGhpcy5vcHRpb25zLmxhYmVsID0gdmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNwaW5uZXJPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0SW5kaWNhdG9yID0gdGhpcy5nZXRPcHRpb24oJ2RlZmF1bHRJbmRpY2F0b3InKTtcbiAgICAgICAgICAgIHZhciBpbmRpY2F0b3IgPSB0aGlzLmdldE9wdGlvbignaW5kaWNhdG9yJyk7XG4gICAgICAgICAgICB2YXIgcHJlc2V0cyA9IHRoaXMuZ2V0UHJlc2V0T3B0aW9ucygpO1xuXG4gICAgICAgICAgICBpZihfLmlzU3RyaW5nKGluZGljYXRvcikgJiYgcHJlc2V0c1tpbmRpY2F0b3JdKSB7XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gcHJlc2V0c1tpbmRpY2F0b3JdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih0eXBlb2YgaW5kaWNhdG9yICE9PSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBkZWZhdWx0SW5kaWNhdG9yLCBpbmRpY2F0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNwaW5uZXJEb206IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJy5hY3Rpdml0eS1pbmRpY2F0b3InKS5nZXQoMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zcGlubmluZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXIuc3Bpbih0aGlzLmdldFNwaW5uZXJEb20oKSk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3N0YXJ0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzdG9wJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBzcGlubmVyIG9iamVjdFxuICAgICAgICAgICAgdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIodGhpcy5nZXRTcGlubmVyT3B0aW9ucygpKTtcblxuICAgICAgICAgICAgLy8gc3RhcnQgaWYgb3B0aW9ucy5hdXRvU3RhcnQgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2F1dG9TdGFydCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb25MYWJlbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5CdXR0b25Ecm9wZG93bk1lbnUgPSBUb29sYm94LkRyb3Bkb3duTWVudS5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2J1dHRvbi1kcm9wZG93bi1tZW51JyksXG5cblx0XHRjaGlsZFZpZXdDb250YWluZXI6ICd1bCcsXG5cblx0XHR0YWdOYW1lOiAnZGl2JyxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2sgLmJ0bjpub3QoLmRyb3Bkb3duLXRvZ2dsZSknOiAnYnV0dG9uOmNsaWNrJyxcblx0XHRcdCdjbGljayAuZHJvcGRvd24tdG9nZ2xlJzogJ3RvZ2dsZTpjbGljaydcblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgbWVudSBpdGVtcyB0byBiZSBjb252ZXJ0ZWQgdG8gYSBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgaXRlbXM6IFtdLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gYnV0dG9uIHRleHRcblx0XHRcdGJ1dHRvbkxhYmVsOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIGJ1dHRvbiBjbGFzcyBuYW1lXG5cdFx0XHRidXR0b25DbGFzc05hbWU6ICdidG4gYnRuLWRlZmF1bHQnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGNsYXNzIG5hbWVcblx0XHRcdGJ1dHRvblRvZ2dsZUNsYXNzTmFtZTogJ2Ryb3Bkb3duLXRvZ2dsZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biBtZW51IGNsYXNzIG5hbWVcblx0XHRcdG1lbnVDbGFzc05hbWU6ICdkcm9wZG93bi1tZW51JyxcblxuXHRcdFx0Ly8gKGludHxib29sKSBUaGUgY29sbGVjdGlvbiBsaW1pdFxuXHRcdFx0bGltaXQ6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgb3JkZXIgb2YgdGhlIGNvbGxlY3Rpb24gaXRlbXNcblx0XHRcdG9yZGVyOiAnbmFtZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIEVpdGhlciBhc2Mgb3IgZGVzY1xuXHRcdFx0c29ydDogJ2FzYycsXG5cblx0XHRcdC8vIChib29sKSBDbG9zZSB0aGUgbWVudSBhZnRlciBhbiBpdGVtIGhhcyBiZWVuIGNsaWNrZWRcblx0XHRcdGNsb3NlT25DbGljazogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIE1lbnUgYXBwZWFyIGFzIGEgXCJkcm9wdXBcIiBpbnN0ZWFkIG9mIGEgXCJkcm9wZG93blwiXG5cdFx0XHRkcm9wVXA6IGZhbHNlLFxuXG5cdFx0XHQvLyAoYm9vbCkgRmV0Y2ggdGhlIGNvbGxlY3Rpb24gd2hlbiB0aGUgZHJvcGRvd24gbWVudSBpcyBzaG93blxuXHRcdFx0ZmV0Y2hPblNob3c6IGZhbHNlLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyBhbiBhY3Rpdml0eSBpbmRpY2F0b3Igd2hlbiBmZXRjaGluZyB0aGUgY29sbGVjdGlvblxuXHRcdFx0c2hvd0luZGljYXRvcjogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIFNob3cgdGhlIGJ1dHRvbiBhcyBzcGxpdCB3aXRoIHR3byBhY3Rpb25zIGluc3RlYWQgb2Ygb25lXG5cdFx0XHRzcGxpdEJ1dHRvbjogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgY2xhc3MgbmFtZVxuXHRcdFx0dG9nZ2xlQ2xhc3NOYW1lOiAnb3Blbidcblx0XHR9LFxuXG5cdFx0c2hvd01lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG5cdFx0fSxcblxuXHRcdGhpZGVNZW51OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5kcm9wZG93bi10b2dnbGUnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblx0XHR9LFxuXG5cdFx0aXNNZW51VmlzaWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKS5sZW5ndGggPiAwO1xuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm9CcmVhZGNydW1icyA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLWJyZWFkY3J1bWJzJyksXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0Y2xhc3NOYW1lOiAnbm8tYnJlYWRjcnVtYnMnXG5cblx0fSk7XG5cblx0VG9vbGJveC5CcmVhZGNydW1iID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnYnJlYWRjcnVtYicpLFxuXG5cdFx0dGFnTmFtZTogJ2xpJ1xuXG5cdH0pO1xuXG5cdFRvb2xib3guQnJlYWRjcnVtYnMgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guQnJlYWRjcnVtYixcblxuXHRcdGVtcHR5VmlldzogVG9vbGJveC5Ob0JyZWFkY3J1bWJzLFxuXG5cdFx0Y2xhc3NOYW1lOiAnYnJlYWRjcnVtYicsXG5cblx0XHR0YWdOYW1lOiAnb2wnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZSdcblx0XHR9LFxuXG5cdFx0Y29sbGVjdGlvbkV2ZW50czoge1xuXHRcdFx0J2NoYW5nZSBhZGQgcmVtb3ZlIHJlc2V0JzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHQub25Eb21SZWZyZXNoKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0aWYoIXRoaXMuY29sbGVjdGlvbikge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRnZXRCcmVhZGNydW1iczogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYnJlYWRjcnVtYnMgPSB0aGlzLmNvbGxlY3Rpb24gPyB0aGlzLmNvbGxlY3Rpb24udG9KU09OKCkgOiBbXTtcblxuXHRcdFx0aWYoIV8uaXNBcnJheShicmVhZGNydW1icykpIHtcblx0XHRcdFx0YnJlYWRjcnVtYnMgPSBbXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJyZWFkY3J1bWJzO1xuXHRcdH0sXG5cblx0XHRhZGRCcmVhZGNydW1iczogZnVuY3Rpb24oYnJlYWRjcnVtYnMpIHtcblx0XHRcdGlmKF8uaXNBcnJheShicmVhZGNydW1icykpIHtcblx0XHRcdFx0Xy5lYWNoKGJyZWFkY3J1bWJzLCBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRCcmVhZGNydW1iKGJyZWFkY3J1bWIpO1xuXHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignQWRkaW5nIG11bHRpcGxlIGJyZWFkY3J1bWJzIG11c3QgZG9uZSBieSBwYXNzaW5nIGFuIGFycmF5Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRhZGRCcmVhZGNydW1iOiBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KGJyZWFkY3J1bWIpKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoYnJlYWRjcnVtYik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0EgYnJlYWRjcnVtYiBtdXN0IGJlIHBhc3NlZCBhcyBhbiBvYmplY3QnKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdHNldEJyZWFkY3J1bWJzOiBmdW5jdGlvbihicmVhZGNydW1icykge1xuXHRcdFx0aWYoXy5pc0FycmF5KGJyZWFkY3J1bWJzKSkge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uc2V0KGJyZWFkY3J1bWJzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byBzZXQgdGhlIGJyZWFkY3J1bWJzJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRpbnNlcnRCcmVhZGNydW1iOiBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KGJyZWFkY3J1bWIpKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi51bnNoaWZ0KGJyZWFkY3J1bWIpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdBIGJyZWFkY3J1bWIgbXVzdCBiZSBwYXNzZWQgYXMgYW4gb2JqZWN0Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRpbnNlcnRCcmVhZGNydW1iczogZnVuY3Rpb24oYnJlYWRjcnVtYnMpIHtcblx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0aWYoXy5pc0FycmF5KGJyZWFkY3J1bWJzKSkge1xuXHRcdFx0XHRfLmVhY2goYnJlYWRjcnVtYnMsIGZ1bmN0aW9uKGJyZWFkY3J1bWIpIHtcblx0XHRcdFx0XHR0Lmluc2VydEJyZWFkY3J1bWIoYnJlYWRjcnVtYik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdJbnNlcnRpbmcgbXVsdGlwbGUgYnJlYWRjcnVtYnMgbXVzdCBkb25lIGJ5IHBhc3NpbmcgYW4gYXJyYXknKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdHJlbW92ZUJyZWFkY3J1bWJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuXHRcdH0sXG5cblx0XHRvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoIXRoaXMuJGVsLmZpbmQoJy5uby1icmVhZGNydW1icycpLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLiRlbC5wYXJlbnQoKS5zaG93KCk7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0XHRpZih0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkIGEnKS5sZW5ndGgpIHtcblx0XHRcdFx0XHR0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkJykuaHRtbCh0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkIGEnKS5odG1sKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy4kZWwucGFyZW50KCkuaGlkZSgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2JhY2tib25lJ10sIGZ1bmN0aW9uKEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuQmFja2JvbmUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEJhY2tib25lKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkJ1dHRvbkdyb3VwSXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2J1dHRvbi1ncm91cC1pdGVtJyksXG5cblx0XHR0YWdOYW1lOiAnYScsXG5cblx0XHRjbGFzc05hbWU6ICdidG4gYnRuLWRlZmF1bHQnLFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayc6ICdjbGljaydcblx0XHR9LFxuXG4gICAgICAgIG9wdGlvbnM6IHtcblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkaXNhYmxlZCBjbGFzcyBuYW1lXG5cdFx0XHRkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJ1xuICAgICAgICB9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKSkge1xuXHRcdFx0XHR0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cbiAgICAgICAgICAgIGlmKHRoaXMubW9kZWwuZ2V0KCdjbGFzc05hbWUnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMubW9kZWwuZ2V0KCdjbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKSkge1xuXHRcdFx0XHR0aGlzLiRlbC5jbGljaygpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94Lk5vQnV0dG9uR3JvdXBJdGVtcyA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLWJ1dHRvbi1ncm91cC1pdGVtJylcblxuXHR9KTtcblxuXHRUb29sYm94LkJ1dHRvbkdyb3VwID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94LkJ1dHRvbkdyb3VwSXRlbSxcblxuXHRcdGVtcHR5VmlldzogVG9vbGJveC5Ob0J1dHRvbkdyb3VwSXRlbXMsXG5cblx0XHRjbGFzc05hbWU6ICdidG4tZ3JvdXAnLFxuXG5cdFx0dGFnTmFtZTogJ2RpdicsXG5cblx0XHRjaGlsZFZpZXdFdmVudHM6IHtcblx0XHRcdCdjbGljayc6ICdvbkNoaWxkQ2xpY2snXG5cdFx0fSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgYWN0aXZlIGNsYXNzIG5hbWVcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkaXNhYmxlZCBjbGFzcyBuYW1lXG5cdFx0XHRkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJyxcblxuXHRcdFx0Ly8gKGJvb2wpIEFjdGl2YXRlIHRoZSBidXR0b24gb24gY2xpY2tcblx0XHRcdGFjdGl2YXRlT25DbGljazogdHJ1ZSxcblxuXHRcdFx0Ly8gKG1peGVkKSBQYXNzIGFuIGFycmF5IG9mIGJ1dHRvbnMgaW5zdGVhZCBvZiBwYXNzaW5nIGEgY29sbGVjdGlvbiBvYmplY3QuXG5cdFx0XHRidXR0b25zOiBmYWxzZVxuXHRcdH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAgICAgVG9vbGJveC5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYnV0dG9ucycpICYmICFvcHRpb25zLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbih0aGlzLmdldE9wdGlvbignYnV0dG9ucycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRBY3RpdmVJbmRleDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5maW5kQnlJbmRleChpbmRleCkuJGVsLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblx0XHRvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKS5jbGljaygpO1xuXHRcdH0sXG5cblx0XHRvbkNoaWxkQ2xpY2s6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICBpZighY2hpbGQuJGVsLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKSkge1xuICAgIFx0XHRcdHRoaXMudHJpZ2dlcignY2xpY2snLCBjaGlsZCk7XG5cbiAgICBcdFx0XHRpZih0aGlzLmdldE9wdGlvbignYWN0aXZhdGVPbkNsaWNrJykgJiYgIWNoaWxkLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpKSB7XG4gICAgXHRcdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpXG4gICAgXHRcdFx0XHRcdC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG4gICAgXHRcdFx0XHRjaGlsZC4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuICAgIFx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdhY3RpdmF0ZScsIGNoaWxkKTtcbiAgICBcdFx0XHR9XG4gICAgICAgICAgICB9XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcbiAgICAgICAgICAgICd1bmRlcnNjb3JlJyxcbiAgICAgICAgICAgICdiYWNrYm9uZScsXG4gICAgICAgICAgICAnYmFja2JvbmUubWFyaW9uZXR0ZScsXG4gICAgICAgICAgICAnbW9tZW50J1xuICAgICAgICBdLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgbW9tZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlLCBtb21lbnQpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lJyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdtb21lbnQnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByb290Ll8sXG4gICAgICAgICAgICByb290LkJhY2tib25lLFxuICAgICAgICAgICAgcm9vdC5NYXJpb25ldHRlLFxuICAgICAgICAgICAgcm9vdC5tb21lbnRcbiAgICAgICAgKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgbW9tZW50KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94Lk1vbnRobHlDYWxlbmRhckRheSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdjYWxlbmRhci1tb250aGx5LWRheS12aWV3JyksXG5cbiAgICAgICAgdGFnTmFtZTogJ3RkJyxcblxuICAgICAgICBjbGFzc05hbWU6ICdjYWxlbmRhci1kYXknLFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2snOiAnY2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9kZWxFdmVudHM6ICB7XG4gICAgICAgICAgICAnY2hhbmdlJzogJ21vZGVsQ2hhbmdlZCdcbiAgICAgICAgfSxcblxuICAgICAgICBtb2RlbENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGhhc0V2ZW50czogdGhpcy5oYXNFdmVudHMoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldENlbGxIZWlnaHQ6IGZ1bmN0aW9uKHdpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5jc3MoJ2hlaWdodCcsIHdpZHRoIHx8IHRoaXMuJGVsLndpZHRoKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSB0aGlzLm1vZGVsLmdldCgnZGF0ZScpO1xuXG4gICAgICAgICAgICBpZighZGF0ZSBpbnN0YW5jZW9mIG1vbWVudCkge1xuICAgICAgICAgICAgICAgIGRhdGUgPSBtb21lbnQoZGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0V2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoJ2V2ZW50cycpICYmIHRoaXMubW9kZWwuZ2V0KCdldmVudHMnKS5sZW5ndGggPiAwID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0RGF0ZSgpLmlzU2FtZShuZXcgRGF0ZSgpLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnY2FsZW5kYXItdG9kYXknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXREYXRlKCkuaXNTYW1lKHRoaXMuZ2V0T3B0aW9uKCdjdXJyZW50RGF0ZScpLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnY2FsZW5kYXItY3VycmVudC1kYXknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXREYXRlKCkuaXNTYW1lKHRoaXMuZ2V0T3B0aW9uKCdjdXJyZW50RGF0ZScpLCAnbW9udGgnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdjYWxlbmRhci1tb250aCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoJ2V2ZW50cycpIHx8IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEV2ZW50czogZnVuY3Rpb24oZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNldCgnZXZlbnRzJywgZXZlbnRzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRFdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZyA9IF8uY2xvbmUodGhpcy5nZXRFdmVudHMoKSk7XG5cbiAgICAgICAgICAgIGV4aXN0aW5nLnB1c2goZXZlbnQpO1xuXG4gICAgICAgICAgICB0aGlzLnNldEV2ZW50cyhleGlzdGluZyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkRXZlbnRzOiBmdW5jdGlvbihldmVudHMpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZyA9IF8uY2xvbmUodGhpcy5nZXRFdmVudHMoKSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0RXZlbnRzKF8ubWVyZ2UoZXhpc3RpbmcsIGV2ZW50cykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUV2ZW50OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbaW5kZXhdO1xuXG4gICAgICAgICAgICB0aGlzLnNldEV2ZW50cyhldmVudHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldEV2ZW50cyhbXSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5Nb250aGx5Q2FsZW5kYXJXZWVrID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5Nb250aGx5Q2FsZW5kYXJEYXksXG5cbiAgICAgICAgdGFnTmFtZTogJ3RyJyxcblxuICAgICAgICBjaGlsZFZpZXdFdmVudHM6IHtcbiAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbih2aWV3LCBldmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZGF5OmNsaWNrJywgdmlldywgdGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBkYXlzOiBmYWxzZSxcbiAgICAgICAgICAgIGV2ZW50czogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKHRoaXMubW9kZWwuZ2V0KCdkYXlzJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNoaWxkVmlld09wdGlvbnM6IGZ1bmN0aW9uKGNoaWxkLCBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF5KGluZGV4KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREYXlzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignZGF5cycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERheTogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBkYXlzID0gdGhpcy5nZXREYXlzKCk7XG5cbiAgICAgICAgICAgIGlmKGRheXNbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRheXNbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldEZpcnN0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5maXJzdCgpLmdldERhdGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMYXN0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5sYXN0KCkuZ2V0RGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guTW9udGhseUNhbGVuZGFyID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2NhbGVuZGFyLW1vbnRobHktdmlldycpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2NhbGVuZGFyJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgY29sbGVjdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBhbHdheXNTaG93U2l4V2Vla3M6IHRydWUsXG4gICAgICAgICAgICBmZXRjaE9uUmVuZGVyOiB0cnVlLFxuICAgICAgICAgICAgYm9keVZpZXc6IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAndGJvZHknLFxuICAgICAgICAgICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5Nb250aGx5Q2FsZW5kYXJXZWVrLFxuICAgICAgICAgICAgICAgIGNoaWxkVmlld0V2ZW50czoge1xuICAgICAgICAgICAgICAgICAgICAnY2xpY2snOiBmdW5jdGlvbih2aWV3LCBldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd3ZWVrOmNsaWNrJywgdmlldywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnZGF5OmNsaWNrJzogZnVuY3Rpb24odmlldywgd2VlaywgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdjYWxlbmRhcicpLnRyaWdnZXJNZXRob2QoJ2RheTpjbGljaycsIHZpZXcsIHdlZWssIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgaW5kaWNhdG9yT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3NtYWxsJyxcbiAgICAgICAgICAgICAgICBkaW1tZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgZGltbWVkQmdDb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgLjYpJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmNhbGVuZGFyLW5hdmlnYXRpb24tcHJldic6ICdwcmV2OmNsaWNrJyxcbiAgICAgICAgICAgICdjbGljayAuY2FsZW5kYXItbmF2aWdhdGlvbi1uZXh0JzogJ25leHQ6Y2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgIGVsOiAndGJvZHknLFxuICAgICAgICAgICAgICAgIHJlcGxhY2VFbGVtZW50OiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogZnVuY3Rpb24oY2hpbGQsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRheXM6IHRoaXMuZ2V0Q2FsZW5kYXJXZWVrKGluZGV4KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeVZhcmlhYmxlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldEZpcnN0RGF0ZSgpLmZvcm1hdCgnWVlZWS1NTS1ERCBISC1tbS1zcycpLFxuICAgICAgICAgICAgICAgIGVuZDogdGhpcy5nZXRMYXN0RGF0ZSgpLmZvcm1hdCgnWVlZWS1NTS1ERCBISC1tbS1zcycpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGZldGNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcywgcGFyYW1zID0gdGhpcy5nZXRRdWVyeVZhcmlhYmxlcygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldENhY2hlUmVzcG9uc2UocGFyYW1zKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZUNhY2hlUmVzcG9uc2UocGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZmV0Y2gnLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0Q2FjaGVSZXNwb25zZShwYXJhbXMsIGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIHRydWUsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZmV0Y2g6c3VjY2VzcycsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIGZhbHNlLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25GZXRjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUV2ZW50OiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBtb2RlbC5nZXQoJ3N0YXJ0JykgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBlbmQ6IG1vZGVsLmdldCgnZW5kJykgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY3JlYXRlOmV2ZW50JywgZXZlbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0JvZHlWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBCb2R5VmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdib2R5VmlldycpO1xuICAgICAgICAgICAgdmFyIGJvZHlWaWV3ID0gbmV3IEJvZHlWaWV3KF8uZXh0ZW5kKHt9LCB7XG4gICAgICAgICAgICAgICAgY2FsZW5kYXI6IHRoaXNcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdib2R5Vmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2JvZHknLCBib2R5Vmlldyk7XG5cbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLmdldENhbGVuZGFyV2Vla3MoKSwgZnVuY3Rpb24od2VlaywgaSkge1xuICAgICAgICAgICAgICAgIGJvZHlWaWV3LmFkZENoaWxkVmlldyhib2R5Vmlldy5idWlsZENoaWxkVmlldyhuZXcgQmFja2JvbmUuTW9kZWwoe1xuICAgICAgICAgICAgICAgICAgICBkYXlzOiB3ZWVrXG4gICAgICAgICAgICAgICAgfSksIGJvZHlWaWV3LmNoaWxkVmlldyksIGkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EYXlDbGljazogZnVuY3Rpb24oZGF5LCB3ZWVrLCBldmVudCkge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKGRheS5nZXREYXRlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0JvZHlWaWV3KCk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5jYWxlbmRhci1oZWFkZXInKS5odG1sKHRoaXMuZ2V0Q2FsZW5kYXJIZWFkZXIoKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuY2FsZW5kYXItc3ViLWhlYWRlcicpLmh0bWwodGhpcy5nZXRDYWxlbmRhclN1YkhlYWRlcigpKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2ZldGNoT25SZW5kZXInKSkge1xuICAgICAgICAgICAgICAgIC8vdGhpcy5mZXRjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlc3RvcmVDYWNoZVJlc3BvbnNlOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuZ2V0Q2FjaGVSZXNwb25zZShwYXJhbXMpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdyZXN0b3JlOmNhY2hlOnJlc3BvbnNlJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q2FjaGVSZXNwb25zZTogZnVuY3Rpb24ocGFyYW1zLCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcblxuICAgICAgICAgICAgaWYoIWNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlcykge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlcyA9IHt9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXNbc3RyaW5nXSA9IF8uY2xvbmUoY29sbGVjdGlvbik7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2V0OmNhY2hlOnJlc3BvbnNlJywgY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzW3N0cmluZ10pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENhY2hlUmVzcG9uc2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgdmFyIHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHBhcmFtcyk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzLmhhc093blByb3BlcnR5KHN0cmluZykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXNbc3RyaW5nXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0FjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kZWwuZmluZCgnLmluZGljYXRvcicpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvcih0aGlzLmdldE9wdGlvbignaW5kaWNhdG9yT3B0aW9ucycpKTtcblxuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3Iuc2hvdyh2aWV3KTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnaW5kaWNhdG9yOnNob3cnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IuZW1wdHkoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnaW5kaWNhdG9yOmhpZGUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXJDb2xsZWN0aW9uOiBmdW5jdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2JlZm9yZTpyZW5kZXI6Y29sbGVjdGlvbicsIGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsLCBpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudChtb2RlbCk7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSB0aGlzLmdldFZpZXdCeURhdGUoZXZlbnQuc3RhcnQpO1xuICAgICAgICAgICAgICAgIGlmKHZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlldy5hZGRFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2FmdGVyOnJlbmRlcjpjb2xsZWN0aW9uJywgY29sbGVjdGlvbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Vmlld0J5RGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgaWYoIWRhdGUgaW5zdGFuY2VvZiBtb21lbnQpIHtcbiAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdib2R5JykuY3VycmVudFZpZXcuY2hpbGRyZW4uZWFjaChmdW5jdGlvbih3ZWVrLCB4KSB7XG4gICAgICAgICAgICAgICAgd2Vlay5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGRheSwgeSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXkuZ2V0RGF0ZSgpLmlzU2FtZShkYXRlLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKF8uaXNOdWxsKHZpZXcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IGRheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFdlZWtNb2RlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJhY2tib25lLk1vZGVsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJIZWFkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmZvcm1hdCgnTU1NTScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENhbGVuZGFyU3ViSGVhZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERhdGUoKS55ZWFyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJXZWVrOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIHdlZWtzID0gdGhpcy5nZXRDYWxlbmRhcldlZWtzKCk7XG5cbiAgICAgICAgICAgIGlmKHdlZWtzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJXZWVrczogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlIHx8IHRoaXMuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgdmFyIHN0YXJ0T2ZUaGlzTW9udGggPSBkYXRlLmNsb25lKCkuc3RhcnRPZignbW9udGgnKTtcbiAgICAgICAgICAgIHZhciBlbmRPZlRoaXNNb250aCA9IGRhdGUuY2xvbmUoKS5lbmRPZignbW9udGgnKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2Fsd2F5c1Nob3dTaXhXZWVrcycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYoc3RhcnRPZlRoaXNNb250aC5kYXkoKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydE9mVGhpc01vbnRoLnN1YnRyYWN0KDEsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoZW5kT2ZUaGlzTW9udGguZGF5KCkgPT09IDYpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kT2ZUaGlzTW9udGguYWRkKDEsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZW5kT2ZUaGlzTW9udGhXZWVrID0gZW5kT2ZUaGlzTW9udGguY2xvbmUoKTtcblxuICAgICAgICAgICAgaWYoIWVuZE9mVGhpc01vbnRoLmNsb25lKCkuZW5kT2YoJ3dlZWsnKS5pc1NhbWUoc3RhcnRPZlRoaXNNb250aCwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICBlbmRPZlRoaXNNb250aFdlZWsuZW5kT2YoJ3dlZWsnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRvdGFsRGF5c0luTW9udGggPSBkYXRlLmRheXNJbk1vbnRoKCk7XG4gICAgICAgICAgICB2YXIgdG90YWxEYXlzSW5DYWxlbmRhciA9IGVuZE9mVGhpc01vbnRoV2Vlay5kaWZmKHN0YXJ0T2ZUaGlzTW9udGgsICdkYXlzJyk7XG4gICAgICAgICAgICB2YXIgdG90YWxXZWVrc0luQ2FsZW5kYXIgPSBNYXRoLmNlaWwodG90YWxEYXlzSW5DYWxlbmRhciAvIDcpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWx3YXlzU2hvd1NpeFdlZWtzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFdlZWtzSW5DYWxlbmRhciA8IDYpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kT2ZUaGlzTW9udGhXZWVrLmFkZCg2IC0gdG90YWxXZWVrc0luQ2FsZW5kYXIsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsV2Vla3NJbkNhbGVuZGFyICs9IDYgLSB0b3RhbFdlZWtzSW5DYWxlbmRhcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB3ZWVrcyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IodmFyIHggPSAwOyB4IDwgdG90YWxXZWVrc0luQ2FsZW5kYXI7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBkYXlzID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IodmFyIHkgPSAwOyB5IDwgNzsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IHN0YXJ0T2ZUaGlzTW9udGhcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbG9uZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkKHgsICd3ZWVrJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdGFydE9mKCd3ZWVrJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGQoeSwgJ2RheScpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRheXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRheTogc3RhcnQuZGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9udGg6IHN0YXJ0Lm1vbnRoKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyOiBzdGFydC55ZWFyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZTogZGF0ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3ZWVrcy5wdXNoKGRheXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gd2Vla3M7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0V2Vla3NJbk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5nZXREYXRlKCkuZGF5c0luTW9udGgoKSAvIDcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEZpcnN0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5maXJzdCgpLmdldEZpcnN0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExhc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmxhc3QoKS5nZXRMYXN0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdkYXRlJykgfHwgbW9tZW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgaWYoIWRhdGUgaW5zdGFuY2VvZiBtb21lbnQpIHtcbiAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcHJldkRhdGUgPSB0aGlzLmdldERhdGUoKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSBkYXRlO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkYXRlOnNldCcsIGRhdGUsIHByZXZEYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRhdGVTZXQ6IGZ1bmN0aW9uKG5ld0RhdGUsIHByZXZEYXRlKSB7XG4gICAgICAgICAgICBpZighbmV3RGF0ZS5pc1NhbWUocHJldkRhdGUsICdtb250aCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Vmlld0J5RGF0ZShwcmV2RGF0ZSkuJGVsLnJlbW92ZUNsYXNzKCdjYWxlbmRhci1jdXJyZW50LWRheScpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Vmlld0J5RGF0ZShuZXdEYXRlKS4kZWwuYWRkQ2xhc3MoJ2NhbGVuZGFyLWN1cnJlbnQtZGF5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRWaWV3QnlEYXRlKG5ld0RhdGUpO1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHZpZXcubW9kZWwuZ2V0KCdldmVudHMnKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93OmV2ZW50cycsIHZpZXcsIGV2ZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UHJldkRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmNsb25lKCkuc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TmV4dERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmNsb25lKCkuYWRkKDEsICdtb250aCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKHRoaXMuZ2V0UHJldkRhdGUoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUodGhpcy5nZXROZXh0RGF0ZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblByZXZDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnByZXYoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbk5leHRDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q29sbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRDYWxlbmRhcldlZWtzKCksIGZ1bmN0aW9uKHdlZWssIGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkVmlldyh0aGlzLmJ1aWxkQ2hpbGRWaWV3KHRoaXMuZ2V0V2Vla01vZGVsKCksIHRoaXMuY2hpbGRWaWV3KSwgaSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbigkLCBfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5DaGVja2JveEZpZWxkID0gVG9vbGJveC5CYXNlRmllbGQuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS1jaGVja2JveC1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIG9wdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgIGlucHV0Q2xhc3NOYW1lOiAnY2hlY2tib3gnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJzpjaGVja2VkJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaCgkKHRoaXMpLnZhbCgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZih2YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID4gMSA/IHZhbHVlcyA6IHZhbHVlc1swXTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRJbnB1dFZhbHVlOiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIGlmKCFfLmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcyA9IFt2YWx1ZXNdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCc6Y2hlY2tlZCcpLmF0dHIoJ2NoZWNrZWQnLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIF8uZWFjaCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnW3ZhbHVlPVwiJyt2YWx1ZSsnXCJdJykuYXR0cignY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gIGZ1bmN0aW9uIGZvckVhY2goIGFycmF5LCBmbiApIHsgdmFyIGksIGxlbmd0aFxuICAgIGkgPSAtMVxuICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aFxuICAgIHdoaWxlICggKytpIDwgbGVuZ3RoIClcbiAgICAgIGZuKCBhcnJheVsgaSBdLCBpLCBhcnJheSApXG4gIH1cblxuICBmdW5jdGlvbiBtYXAoIGFycmF5LCBmbiApIHsgdmFyIHJlc3VsdFxuICAgIHJlc3VsdCA9IEFycmF5KCBhcnJheS5sZW5ndGggKVxuICAgIGZvckVhY2goIGFycmF5LCBmdW5jdGlvbiAoIHZhbCwgaSwgYXJyYXkgKSB7XG4gICAgICByZXN1bHRbaV0gPSBmbiggdmFsLCBpLCBhcnJheSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBmdW5jdGlvbiByZWR1Y2UoIGFycmF5LCBmbiwgYWNjdW11bGF0b3IgKSB7XG4gICAgZm9yRWFjaCggYXJyYXksIGZ1bmN0aW9uKCB2YWwsIGksIGFycmF5ICkge1xuICAgICAgYWNjdW11bGF0b3IgPSBmbiggdmFsLCBpLCBhcnJheSApXG4gICAgfSlcbiAgICByZXR1cm4gYWNjdW11bGF0b3JcbiAgfVxuXG4gIC8vIExldmVuc2h0ZWluIGRpc3RhbmNlXG4gIGZ1bmN0aW9uIExldmVuc2h0ZWluKCBzdHJfbSwgc3RyX24gKSB7IHZhciBwcmV2aW91cywgY3VycmVudCwgbWF0cml4XG4gICAgLy8gQ29uc3RydWN0b3JcbiAgICBtYXRyaXggPSB0aGlzLl9tYXRyaXggPSBbXVxuXG4gICAgLy8gU2FuaXR5IGNoZWNrc1xuICAgIGlmICggc3RyX20gPT0gc3RyX24gKVxuICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2UgPSAwXG4gICAgZWxzZSBpZiAoIHN0cl9tID09ICcnIClcbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlID0gc3RyX24ubGVuZ3RoXG4gICAgZWxzZSBpZiAoIHN0cl9uID09ICcnIClcbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlID0gc3RyX20ubGVuZ3RoXG4gICAgZWxzZSB7XG4gICAgICAvLyBEYW5nZXIgV2lsbCBSb2JpbnNvblxuICAgICAgcHJldmlvdXMgPSBbIDAgXVxuICAgICAgZm9yRWFjaCggc3RyX20sIGZ1bmN0aW9uKCB2LCBpICkgeyBpKyssIHByZXZpb3VzWyBpIF0gPSBpIH0gKVxuXG4gICAgICBtYXRyaXhbMF0gPSBwcmV2aW91c1xuICAgICAgZm9yRWFjaCggc3RyX24sIGZ1bmN0aW9uKCBuX3ZhbCwgbl9pZHggKSB7XG4gICAgICAgIGN1cnJlbnQgPSBbICsrbl9pZHggXVxuICAgICAgICBmb3JFYWNoKCBzdHJfbSwgZnVuY3Rpb24oIG1fdmFsLCBtX2lkeCApIHtcbiAgICAgICAgICBtX2lkeCsrXG4gICAgICAgICAgaWYgKCBzdHJfbS5jaGFyQXQoIG1faWR4IC0gMSApID09IHN0cl9uLmNoYXJBdCggbl9pZHggLSAxICkgKVxuICAgICAgICAgICAgY3VycmVudFsgbV9pZHggXSA9IHByZXZpb3VzWyBtX2lkeCAtIDEgXVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGN1cnJlbnRbIG1faWR4IF0gPSBNYXRoLm1pblxuICAgICAgICAgICAgICAoIHByZXZpb3VzWyBtX2lkeCBdICAgICArIDEgICAvLyBEZWxldGlvblxuICAgICAgICAgICAgICAsIGN1cnJlbnRbICBtX2lkeCAtIDEgXSArIDEgICAvLyBJbnNlcnRpb25cbiAgICAgICAgICAgICAgLCBwcmV2aW91c1sgbV9pZHggLSAxIF0gKyAxICAgLy8gU3VidHJhY3Rpb25cbiAgICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICBwcmV2aW91cyA9IGN1cnJlbnRcbiAgICAgICAgbWF0cml4WyBtYXRyaXgubGVuZ3RoIF0gPSBwcmV2aW91c1xuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2UgPSBjdXJyZW50WyBjdXJyZW50Lmxlbmd0aCAtIDEgXVxuICAgIH1cbiAgfVxuXG4gIExldmVuc2h0ZWluLnByb3RvdHlwZS50b1N0cmluZyA9IExldmVuc2h0ZWluLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoIG5vX3ByaW50ICkge1xuICAgICAgdmFyIG1hdHJpeCwgbWF4LCBidWZmLCBzZXAsIHJvd3MsIG1hdHJpeCA9IHRoaXMuZ2V0TWF0cml4KCk7XG5cbiAgICAgIG1heCA9IHJlZHVjZSggbWF0cml4LGZ1bmN0aW9uKCBtLCBvICkge1xuICAgICAgICAgIHJldHVybiBNYXRoLm1heCggbSwgcmVkdWNlKCBvLCBNYXRoLm1heCwgMCApIClcbiAgICAgIH0sIDAgKTtcblxuICAgICAgYnVmZiA9IEFycmF5KCggbWF4ICsgJycgKS5sZW5ndGgpLmpvaW4oJyAnKTtcblxuICAgICAgc2VwID0gW107XG5cbiAgICAgIHdoaWxlICggc2VwLmxlbmd0aCA8IChtYXRyaXhbMF0gJiYgbWF0cml4WzBdLmxlbmd0aCB8fCAwKSApIHtcbiAgICAgICAgICBzZXBbIHNlcC5sZW5ndGggXSA9IEFycmF5KCBidWZmLmxlbmd0aCArIDEgKS5qb2luKCAnLScgKTtcbiAgICAgIH1cblxuICAgICAgc2VwID0gc2VwLmpvaW4oICctKycgKSArICctJztcblxuICAgICAgcm93cyA9IG1hcCggbWF0cml4LCBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICB2YXIgY2VsbHM7XG5cbiAgICAgICAgICBjZWxscyA9IG1hcChyb3csIGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChidWZmICsgY2VsbCkuc2xpY2UoIC0gYnVmZi5sZW5ndGggKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIGNlbGxzLmpvaW4oICcgfCcgKSArICcgJztcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcm93cy5qb2luKCBcIlxcblwiICsgc2VwICsgXCJcXG5cIiApO1xuICB9XG5cbiAgTGV2ZW5zaHRlaW4ucHJvdG90eXBlLmdldE1hdHJpeCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tYXRyaXguc2xpY2UoKVxuICB9XG5cbiAgTGV2ZW5zaHRlaW4ucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlXG4gIH1cblxuICBUb29sYm94LkxldmVuc2h0ZWluID0gTGV2ZW5zaHRlaW47XG5cbiAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guSW5saW5lRWRpdG9yID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2lubGluZS1lZGl0b3InKSxcblxuICAgICAgICBjbGFzc05hbWU6ICdpbmxpbmUtZWRpdG9yLXdyYXBwZXInLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgYXR0cmlidXRlIGluIHRoZSBtb2RlbCB0byBlZGl0XG4gICAgICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZm9ybSBpbnB1dCB2aWV3IG9iamVjdFxuICAgICAgICAgICAgZm9ybUlucHV0VmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBmb3JtIGlucHV0IHZpZXcgb2JqZWN0IG9wdGlvbnNcbiAgICAgICAgICAgIGZvcm1JbnB1dFZpZXdPcHRpb25zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKHNydGluZykgVGhlIGNsYXNzIG5hbWUgdG8gYWRkIHRvIHRoZSBmaWVsZCB3aGlsZSBpdCBpcyBiZWluZyBlZGl0dGVkLlxuICAgICAgICAgICAgZWRpdHRpbmdDbGFzc05hbWU6ICdpbmxpbmUtZWRpdG9yLWVkaXR0aW5nJyxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIEFsbG93IHRoZSBmaWVsZCB0byBoYXZlIGEgbnVsbCB2YWx1ZVxuICAgICAgICAgICAgYWxsb3dOdWxsOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKGludCkgVGhlIGtleWNvZGUgdG8gc2F2ZSB0aGUgZmllbGQgZGF0YVxuICAgICAgICAgICAgc2F2ZUtleWNvZGU6IDEzLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUga2V5Y29kZSB0byBjYW5jZWwgdGhlIGZpZWxkIGRhdGFcbiAgICAgICAgICAgIGNhbmNlbEtleWNvZGU6IDI3LFxuICAgICAgICB9LFxuXG4gICAgICAgIHJlZ2lvbnM6IHtcbiAgICAgICAgICAgIGlucHV0OiAnLmlubGluZS1lZGl0b3ItZmllbGQnLFxuICAgICAgICAgICAgaW5kaWNhdG9yOiAnLmlubGluZS1lZGl0b3ItYWN0aXZpdHktaW5kaWNhdG9yJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmlubGluZS1lZGl0b3ItbGFiZWwnOiAnbGFiZWw6Y2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRm9ybUlucHV0VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZm9ybUlucHV0VmlldycpO1xuXG4gICAgICAgICAgICBpZighVmlldykge1xuICAgICAgICAgICAgICAgIFZpZXcgPSBUb29sYm94LklucHV0RmllbGQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignYXR0cmlidXRlJykpLFxuICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignZm9ybUlucHV0Vmlld09wdGlvbnMnKSk7XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcob3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ2JsdXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LmJsdXIoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2aWV3LiRlbC5vbigna2V5cHJlc3MnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgaWYoZS5rZXlDb2RlID09PSB0LmdldE9wdGlvbignc2F2ZUtleWNvZGUnKSkge1xuICAgICAgICAgICAgICAgICAgICBpZih0LmdldE9wdGlvbignYWxsb3dOdWxsJykgfHwgIXQuZ2V0T3B0aW9uKCdhbGxvd051bGwnKSAmJiAhdC5pc051bGwoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZpZXcuJGVsLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSB0LmdldE9wdGlvbignY2FuY2VsS2V5Y29kZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICd0aW55J1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygnaW5kaWNhdG9yJywgdmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZUFjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLmVtcHR5KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNOdWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldElucHV0VmFsdWUoKSA9PT0gJycgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0TGFiZWxIdG1sOiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuaW5saW5lLWVkaXRvci1sYWJlbCcpLmh0bWwoaHRtbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb2RlbFZhbHVlKCkgIT09IHRoaXMuZ2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmJsdXIoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY2FuY2VsJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmhhc0NoYW5nZWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2VkaXR0aW5nQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2JsdXInKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZWRpdHRpbmdDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB0aGlzLmdldENoaWxkVmlldygnaW5wdXQnKS5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdmb2N1cycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldE1vZGVsVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdhdHRyaWJ1dGUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRDaGlsZFZpZXcoJ2lucHV0JykuZ2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEZvcm1EYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0T3B0aW9uKCdhdHRyaWJ1dGUnKTtcblxuICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHRoaXMuZ2V0SW5wdXRWYWx1ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TGFiZWxIdG1sKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkJlZm9yZVNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93QWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkFmdGVyU2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVBY3Rpdml0eUluZGljYXRvcigpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWxsb3dOdWxsJykgfHwgIXRoaXMuZ2V0T3B0aW9uKCdhbGxvd051bGwnKSAmJiAhdGhpcy5pc051bGwoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdiZWZvcmU6c2F2ZScpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlKHRoaXMuZ2V0Rm9ybURhdGEoKSwge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc2F2ZTpzdWNjZXNzJywgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnYWZ0ZXI6c2F2ZScsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2NoYW5nZScsIHQuZ2V0SW5wdXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzYXZlOmVycm9yJywgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnYWZ0ZXI6c2F2ZScsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlJywgdGhpcy5nZXRJbnB1dFZhbHVlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uTGFiZWxDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRMYWJlbEh0bWwodGhpcy5nZXRNb2RlbFZhbHVlKCkpO1xuICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdpbnB1dCcsIHRoaXMuY3JlYXRlRm9ybUlucHV0VmlldygpKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LklucHV0RmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLWlucHV0LWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnXG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guTGlnaHRTd2l0Y2hGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tbGlnaHQtc3dpdGNoLWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdmFsdWU6IDAsXG5cbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzTmFtZTogJ29uJyxcblxuICAgICAgICAgICAgb25WYWx1ZTogMSxcblxuICAgICAgICAgICAgb2ZmVmFsdWU6IDAsXG5cbiAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RvcjogJy5saWdodC1zd2l0Y2gnLFxuXG4gICAgICAgICAgICBpbnB1dENsYXNzTmFtZTogJ2xpZ2h0LXN3aXRjaCdcbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2NsaWNrIC5saWdodC1zd2l0Y2gtY29udGFpbmVyJzogJ2NsaWNrJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2tleXVwJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5nZXRPcHRpb24oJ29mZlZhbHVlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFZhbHVlKHRoaXMuZ2V0T3B0aW9uKCdvblZhbHVlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5CYXNlRmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLnZhbHVlID09PSBmYWxzZSB8fCBfLmlzTmFOKHRoaXMub3B0aW9ucy52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMudmFsdWUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLmdldE9wdGlvbigndmFsdWUnKSkgPT09IDE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlQ2xhc3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQWN0aXZlQ2xhc3MoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjaGFuZ2UnLCB2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGlnaHRTd2l0Y2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJy5saWdodC1zd2l0Y2gnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCdpbnB1dCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEFjdGl2ZUNsYXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXRMaWdodFN3aXRjaCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkcmFnZ2luZ0NsYXNzTmFtZScpKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmxpZ2h0LXN3aXRjaC1jb250YWluZXInKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAnbWFyZ2luLWxlZnQnOiAwXG4gICAgICAgICAgICB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuZ2V0TGlnaHRTd2l0Y2goKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModC5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModC5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlQWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldExpZ2h0U3dpdGNoKCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcubGlnaHQtc3dpdGNoLWNvbnRhaW5lcicpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICdtYXJnaW4tbGVmdCc6IC0xMVxuICAgICAgICAgICAgfSwgMTAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LmdldExpZ2h0U3dpdGNoKClcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHQuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHQuZ2V0T3B0aW9uKCdkcmFnZ2luZ0NsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZighdGhpcy5pc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmdldE9wdGlvbignb25WYWx1ZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5nZXRPcHRpb24oJ29mZlZhbHVlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXNcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm9MaXN0R3JvdXBJdGVtID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tbGlzdC1ncm91cC1pdGVtJyksXG5cblx0XHRjbGFzc05hbWU6ICdsaXN0LWdyb3VwLWl0ZW0nLFxuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRtZXNzYWdlOiAnVGhlcmUgYXJlIG5vIGl0ZW1zIGluIHRoZSBsaXN0Lidcblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnM7XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guTGlzdEdyb3VwSXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2xpc3QtZ3JvdXAtaXRlbScpLFxuXG5cdFx0Y2xhc3NOYW1lOiAnbGlzdC1ncm91cC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGJhZGdlQXR0cmlidXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRlbnRBdHRyaWJ1dGU6IGZhbHNlLFxuICAgICAgICAgICAgZWRpdEZvcm1DbGFzczogZmFsc2UsXG4gICAgICAgICAgICBkZWxldGVGb3JtQ2xhc3M6IGZhbHNlLFxuICAgICAgICAgICAgZWRpdEJ1dHRvbjoge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2J0biBidG4td2FybmluZyBidG4teHMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXG4gICAgICAgICAgICAgICAgaWNvbjogJ2ZhIGZhLWVkaXQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbjoge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2J0biBidG4tZGFuZ2VyIGJ0bi14cycsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgIGljb246ICdmYSBmYS10cmFzaC1vJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0ID09IHRoaXMuJGVsLmdldCgwKSkge1xuICAgIFx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljaycsIHRoaXMsIGUpO1xuICAgICAgICAgICAgICAgIH1cblx0XHRcdH0sXG4gICAgICAgICAgICAnY2xpY2sgLmVkaXQtaXRlbSc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmVkaXQnLCB0aGlzLCBlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY2xpY2sgLmRlbGV0ZS1pdGVtJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2s6ZGVsZXRlJywgdGhpcywgZSk7XG4gICAgICAgICAgICB9XG5cdFx0fSxcblxuICAgICAgICBnZXRCYWRnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2JhZGdlQXR0cmlidXRlJykgP1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdiYWRnZUF0dHJpYnV0ZScpKSA6XG4gICAgICAgICAgICAgICAgZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2NvbnRlbnRBdHRyaWJ1dGUnKSA/XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2NvbnRlbnRBdHRyaWJ1dGUnKSkgOlxuICAgICAgICAgICAgICAgIGZhbHNlO1xuICAgICAgICB9LFxuXG5cdFx0dGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBiYWRnZSwgY29udGVudCwgaGVscGVyID0gXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGhhc0VkaXRGb3JtOiB0aGlzLmdldE9wdGlvbignZWRpdEZvcm1DbGFzcycpID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGhhc0RlbGV0ZUZvcm06IHRoaXMuZ2V0T3B0aW9uKCdkZWxldGVGb3JtQ2xhc3MnKSA/IHRydWUgOiBmYWxzZVxuICAgICAgICAgICAgfSwgdGhpcy5vcHRpb25zKTtcblxuICAgICAgICAgICAgaWYoYmFkZ2UgPSB0aGlzLmdldEJhZGdlKCkpIHtcbiAgICAgICAgICAgICAgICBoZWxwZXIuYmFkZ2UgPSBiYWRnZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpKSB7XG4gICAgICAgICAgICAgICAgaGVscGVyLmNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaGVscGVyO1xuXHRcdH0sXG5cbiAgICAgICAgb25DbGlja0VkaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VkaXRGb3JtQ2xhc3MnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoe1xuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbignc3VibWl0OnN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsID0gbmV3IFRvb2xib3guTW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50Vmlldzogdmlld1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbW9kYWwuc2hvdygpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93OmVkaXQnLCBtb2RhbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrRGVsZXRlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdkZWxldGVGb3JtQ2xhc3MnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoe1xuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbignc3VibWl0OnN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsID0gbmV3IFRvb2xib3guTW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50Vmlldzogdmlld1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbW9kYWwuc2hvdygpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93OmRlbGV0ZScsIG1vZGFsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cblx0fSk7XG5cblx0VG9vbGJveC5MaXN0R3JvdXAgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guTGlzdEdyb3VwSXRlbSxcblxuXHRcdGNsYXNzTmFtZTogJ2xpc3QtZ3JvdXAnLFxuXG5cdFx0dGFnTmFtZTogJ3VsJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoYm9vbCkgQWN0aXZhdGUgbGlzdCBpdGVtIG9uIGNsaWNrXG5cdFx0XHRhY3RpdmF0ZU9uQ2xpY2s6IGZhbHNlLFxuXG5cdFx0XHQvLyAoYm9vbCkgQWN0aXZhdGUgb25seSBhIHNpbmdsZSBpdGVtIGluIHRoZSBsaXN0IGl0ZW0gYXQgb25jZVxuXHRcdFx0YWN0aXZhdGVTaW5nbGVJdGVtOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgQWN0aXZlIGNsYXNzIG5hbWVcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIGxpc3QgaXRlbXNcblx0XHRcdGVtcHR5TWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nLFxuXG5cdFx0XHQvLyAob2JqZWN0KSBUaGUgdmlldyBvYmplY3QgdG8gdXNlIGZvciB0aGUgZW1wdHkgbWVzc2FnZVxuXHRcdFx0ZW1wdHlNZXNzYWdlVmlldzogVG9vbGJveC5Ob0xpc3RHcm91cEl0ZW0sXG5cblx0XHRcdC8vIChib29sKSBTaG93IHRoZSBlbXB0eSBtZXNzYWdlIHZpZXdcblx0XHRcdHNob3dFbXB0eU1lc3NhZ2U6IHRydWUsXG5cdFx0fSxcblxuXHRcdGNoaWxkVmlld0V2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24oY2hpbGQsIGUpIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWN0aXZhdGVPbkNsaWNrJykpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoY2hpbGQuJGVsLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLiRlbC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2FjdGl2YXRlU2luZ2xlSXRlbScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnYWN0aXZhdGUnLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2l0ZW06Y2xpY2snLCBjaGlsZCwgZSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuICAgICAgICBlbXB0eVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcdGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93RW1wdHlNZXNzYWdlJykpIHtcblx0ICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlVmlldycpO1xuXG5cdCAgICAgICAgICAgIFZpZXcgPSBWaWV3LmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG5cdCAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZScpXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBWaWV3O1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oJCwgXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSlcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guTW9kYWwgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbW9kYWwtd2luZG93JyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnbW9kYWwtd2luZG93LXdyYXBwZXInLFxuXG4gICAgICAgIHJlZ2lvbnM6IHtcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcubW9kYWwtY29udGVudCdcbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2NsaWNrIC5tb2RhbC1jbG9zZSc6ICdjbG9zZTpjbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBbiBhcnJheSBvZiBidXR0b24gb2JqZWN0cyB0byBhZGQgdG8gdGhlIG1vZGFsIHdpbmRvd1xuICAgICAgICAgICAgYnV0dG9uczogW10sXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBtb2RhbCB3aW5kb3cgaGVhZGVyIHRleHRcbiAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHVzZWQgZm9yIHRoZSBtb2RhbCBhbmltYXRpb25cbiAgICAgICAgICAgIGNsb3NlQW5pbWF0aW9uUmF0ZTogNTAwXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLm1vZGFsLWJ1dHRvbnMgYSc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnV0dG9ucyA9IHRoaXMuZ2V0T3B0aW9uKCdidXR0b25zJyk7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAkKGUudGFyZ2V0KS5pbmRleCgpO1xuXG4gICAgICAgICAgICAgICAgaWYoXy5pc0FycmF5KGJ1dHRvbnMpICYmIGJ1dHRvbnNbaV0ub25DbGljaykge1xuICAgICAgICAgICAgICAgICAgICBidXR0b25zW2ldLm9uQ2xpY2suY2FsbCh0aGlzLCAkKGUudGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0NvbnRlbnRWaWV3OiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnNldENvbnRlbnRWaWV3KHZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldENvbnRlbnRWaWV3OiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2NvbnRlbnQnLCB2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDb250ZW50VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRSZWdpb24oJ2NvbnRlbnQnKS5jdXJyZW50VmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcywgdmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50VmlldycpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdiZWZvcmU6ZGV0YWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnYm9keScpLm9mZigna2V5dXAnLCBrZXl1cEhhbmRsZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ2NhbmNlbDpjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHZhciBrZXl1cEhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgaWYoZS5rZXlDb2RlID09IDI3KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLiRlbCkub24oJ2tleXVwJywga2V5dXBIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdjb250ZW50Jywgdmlldyk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi4kZWwuYWRkQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc2hvdycpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZ2V0UmVnaW9uKCdjb250ZW50JykuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICBzZWxmLiRlbC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdjbG9zZUFuaW1hdGlvblJhdGUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbG9zZUNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmdW5jdGlvbigkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vdGlmaWNhdGlvbiA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0Y2xhc3NOYW1lOiAnbm90aWZpY2F0aW9uIGNsZWFyZml4JyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoaW50KSBUaGUgZmx5LW91dCBhbmltYXRpb24gcmF0ZSBpbiBtaWxsaXNlY29uZHNcblx0XHRcdGFuaW1hdGlvbjogNTAwLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgY2xvc2UgY2xhc3MgbmFtZVxuXHRcdFx0Y2xvc2VDbGFzc05hbWU6ICdjbG9zZScsXG5cblx0XHRcdC8vIChpbnQpIENsb3NlIGFmdGVyIGEgZGVsYXkgaW4gbWlsbGVjb25kcy4gUGFzcyBmYWxzZSB0byBub3QgY2xvc2Vcblx0XHRcdGNsb3NlT25EZWxheTogNDAwMCxcblxuXHRcdFx0Ly8gKGJvb2wpIENsb3NlIHRoZSBub3RpZmljYXRpb24gd2hlbiBjbGlja2VkIGFueXdoZXJlXG5cdFx0XHRjbG9zZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBUaGUgaWNvbiBjbGFzcyB1c2VkIGluIHRoZSBhbGVydFxuXHRcdFx0aWNvbjogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmd8ZmFsc2UpIFRoZSBub3RpZmljYXRpb24gbWVzc2FnZVxuXHRcdFx0bWVzc2FnZTogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmd8ZmFsc2UpIFRoZSBub3RpZmljYXRpb24gdGl0bGVcblx0XHRcdHRpdGxlOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVHlwZSBvZiBub3RpZmljYXRpb24gKGFsZXJ0fHdhcm5pbmd8c3VjY2Vzcylcblx0XHRcdHR5cGU6ICdhbGVydCcsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBjbGFzcyBuYW1lIHRoYXQgbWFrZXMgdGhlIG5vdGlmaWNhdGlvbiB2aXNpYmxlXG5cdFx0XHR2aXNpYmxlQ2xhc3NOYW1lOiAndmlzaWJsZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBjbGFzcyBuYW1lIHRoYXQgaXMgdXNlZCBpbiB0aGUgd3JhcHBlciB0byB3aGljaFxuXHRcdFx0Ly8gbm90aWZpY2F0aW9uIGFyZSBhcHBlbmRlZFxuXHRcdFx0d3JhcHBlckNsYXNzTmFtZTogJ25vdGlmaWNhdGlvbnMnXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdub3RpZmljYXRpb24nKSxcblxuXHRcdG1vZGVsOiBmYWxzZSxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2snOiAnY2xpY2snLFxuXHRcdFx0J2NsaWNrIC5jbG9zZSc6ICdjbG9zZTpjbGljaydcblx0XHR9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cblx0XHRvbkNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdjbG9zZU9uQ2xpY2snKSkge1xuXHRcdFx0XHR0aGlzLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25DbG9zZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuaGlkZSgpO1xuXHRcdH0sXG5cblx0XHRpc1Zpc2libGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuJGVsLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCd2aXNpYmxlQ2xhc3NOYW1lJykpO1xuXHRcdH0sXG5cblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3Zpc2libGVDbGFzc05hbWUnKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHQuJGVsLnJlbW92ZSgpO1xuXHRcdFx0fSwgdGhpcy5nZXRPcHRpb24oJ2FuaW1hdGlvbicpKTtcblxuXHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdoaWRlJyk7XG5cdFx0fSxcblxuXHRcdGNyZWF0ZU5vdGlmaWNhdGlvbnNEb21XcmFwcGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciAkd3JhcHBlciA9ICQoJzxkaXYgY2xhc3M9XCInK3RoaXMuZ2V0T3B0aW9uKCd3cmFwcGVyQ2xhc3NOYW1lJykrJ1wiIC8+Jyk7XG5cblx0XHRcdCQoJ2JvZHknKS5hcHBlbmQoJHdyYXBwZXIpO1xuXG5cdFx0XHRyZXR1cm4gJHdyYXBwZXI7XG5cdFx0fSxcblxuXHRcdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHQgPSB0aGlzLCAkd3JhcHBlciA9ICQoJ2JvZHknKS5maW5kKCcuJyArIHRoaXMuZ2V0T3B0aW9uKCd3cmFwcGVyQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXG5cdFx0XHRpZighJHdyYXBwZXIubGVuZ3RoKSB7XG5cdFx0XHRcdCR3cmFwcGVyID0gdGhpcy5jcmVhdGVOb3RpZmljYXRpb25zRG9tV3JhcHBlcigpO1xuXHRcdFx0fVxuXG5cdFx0XHQkd3JhcHBlci5hcHBlbmQodGhpcy4kZWwpO1xuXG5cdFx0XHR0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbigndHlwZScpKTtcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dC4kZWwuYWRkQ2xhc3ModC5nZXRPcHRpb24oJ3Zpc2libGVDbGFzc05hbWUnKSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ2Nsb3NlT25EZWxheScpICE9PSBmYWxzZSkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmKHQuaXNWaXNpYmxlKCkpIHtcblx0XHRcdFx0XHRcdHQuaGlkZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgdGhpcy5nZXRPcHRpb24oJ2Nsb3NlT25EZWxheScpKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93Jyk7XG5cdFx0fVxuXG5cdH0pO1xuXG5cdHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm9PcmRlcmVkTGlzdEl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCduby1vcmRlcmVkLWxpc3QtaXRlbScpLFxuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRtZXNzYWdlOiAnVGhlcmUgYXJlIG5vIGl0ZW1zIGluIHRoZSBsaXN0Lidcblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnM7XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guT3JkZXJlZExpc3RJdGVtID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnb3JkZXJlZC1saXN0LWl0ZW0nKSxcblxuXHRcdGNsYXNzTmFtZTogJ29yZGVyZWQtbGlzdC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKGUsIG9iaikge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrJywgb2JqKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5PcmRlcmVkTGlzdCA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuXHRcdGNoaWxkVmlldzogVG9vbGJveC5PcmRlcmVkTGlzdEl0ZW0sXG5cbiAgICBcdGVtcHR5VmlldzogVG9vbGJveC5Ob1Vub3JkZXJlZExpc3RJdGVtLFxuXG5cdFx0Y2xhc3NOYW1lOiAnb3JkZXJlZC1saXN0JyxcblxuXHRcdHRhZ05hbWU6ICdvbCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKG9iamVjdCkgVGhlIHZpZXcgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGVtcHR5IG1lc3NhZ2Vcblx0XHRcdGVtcHR5TWVzc2FnZVZpZXc6IFRvb2xib3guTm9PcmRlcmVkTGlzdEl0ZW0sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIGxpc3QgaXRlbXNcblx0XHRcdGVtcHR5TWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgZW1wdHkgbWVzc2FnZSB2aWV3XG5cdFx0XHRzaG93RW1wdHlNZXNzYWdlOiB0cnVlXG5cdFx0fSxcblxuXHRcdGNoaWxkVmlld0V2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2l0ZW06Y2xpY2snLCB2aWV3KTtcblx0XHRcdH1cblx0XHR9LFxuXG4gICAgICAgIGdldEVtcHR5VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0aWYodGhpcy5nZXRPcHRpb24oJ3Nob3dFbXB0eU1lc3NhZ2UnKSkge1xuXHQgICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2VWaWV3Jyk7XG5cblx0ICAgICAgICAgICAgVmlldyA9IFZpZXcuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcblx0ICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlJylcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIFZpZXc7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LlBhZ2VyID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncGFnZXInKSxcblxuXHRcdHRhZ05hbWU6ICduYXYnLFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayAubmV4dC1wYWdlJzogJ25leHQ6cGFnZTpjbGljaycsXG5cdFx0XHQnY2xpY2sgLnByZXYtcGFnZSc6ICdwcmV2OnBhZ2U6Y2xpY2snXG5cdFx0fSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgcGFnZXIgY2xhc3MgbmFtZVxuXHRcdFx0cGFnZXJDbGFzc05hbWU6ICdwYWdlcicsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBhY3RpdmUgY2xhc3MgbmFtZVxuXHRcdFx0YWN0aXZlQ2xhc3NOYW1lOiAnYWN0aXZlJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRpc2FibGVkIGNsYXNzIG5hbWVcblx0XHRcdGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgcHJldmlvdXMgYnV0dG9uIGNsYXNzIG5hbWVcblx0XHRcdHByZXZDbGFzc05hbWU6ICdwcmV2aW91cycsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBuZXh0IGJ1dHRvbiBjbGFzcyBuYW1lXG5cdFx0XHRuZXh0Q2xhc3NOYW1lOiAnbmV4dCcsXG5cblx0XHRcdC8vIChib29sKSBJbmNsdWRlIHRoZSBwYWdlIHRvdGFscyBiZXR3ZWVuIHRoZSBwYWdlciBidXR0b25zXG5cdFx0XHRpbmNsdWRlUGFnZVRvdGFsczogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIEFsaWduIHBhZ2VyIGJ1dHRzb24gdG8gbGVmdCBhbmQgcmlnaHQgZWRnZVxuXHRcdFx0c25hcFRvRWRnZXM6IHRydWUsXG5cblx0XHRcdC8vIChpbnQpIFRoZSBjdXJyZW50IHBhZ2UgbnVtYmVyXG5cdFx0XHRwYWdlOiAxLFxuXG5cdFx0XHQvLyAoaW50KSBUaGUgdG90YWwgbnVtYmVyIG9mIHBhZ2VzXG5cdFx0XHR0b3RhbFBhZ2VzOiAxLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBOZXh0IGJ1dHRvbiBsYWJlbFxuXHRcdFx0bmV4dExhYmVsOiAnTmV4dCcsXG5cblx0XHRcdC8vIChzdHJpbmcpIFByZXZpb3VzIGJ1dHRvbiBsYWJlbFxuXHRcdFx0cHJldkxhYmVsOiAnUHJldmlvdXMnXG5cdFx0fSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0bmV4dFBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdFx0dmFyIHRvdGFsID0gdGhpcy5nZXRPcHRpb24oJ3RvdGFsUGFnZXMnKTtcblxuXHRcdFx0aWYocGFnZSA8IHRvdGFsKSB7XG5cdFx0XHRcdHBhZ2UrKztcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHBhZ2UpO1xuXHRcdH0sXG5cblx0XHRvbk5leHRQYWdlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5uZXh0UGFnZSgpO1xuXHRcdH0sXG5cblx0XHRwcmV2UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cblx0XHRcdGlmKHBhZ2UgPiAxKSB7XG5cdFx0XHRcdHBhZ2UtLTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHBhZ2UpO1xuXHRcdH0sXG5cblx0XHRvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdwYWdlJykgPT0gMSkge1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCcucHJldi1wYWdlJykucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJykpIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLm5leHQtcGFnZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25QcmV2UGFnZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMucHJldlBhZ2UoKTtcblx0XHR9LFxuXG5cdFx0c2V0QWN0aXZlUGFnZTogZnVuY3Rpb24ocGFnZSkge1xuXHRcdFx0dGhpcy5vcHRpb25zLnBhZ2UgPSBwYWdlO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgncGFnaW5hdGUnLCBwYWdlKTtcblx0XHR9LFxuXG5cdFx0Z2V0QWN0aXZlUGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHR9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAnYmFja2JvbmUnXSwgZnVuY3Rpb24oJCwgQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5QYWdpbmF0aW9uSXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRhZ05hbWU6ICdsaScsXG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3BhZ2luYXRpb24taXRlbScpLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgYWN0aXZlIHBhZ2UgY2xhc3MgbmFtZVxuICAgICAgICAgICAgZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCdcbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2NsaWNrIGE6bm90KC5uZXh0LXBhZ2UsIC5wcmV2LXBhZ2UpJzogJ2NsaWNrJyxcbiAgICAgICAgICAgICdjbGljayAubmV4dC1wYWdlJzogJ3BhZ2U6bmV4dCcsXG4gICAgICAgICAgICAnY2xpY2sgLnByZXYtcGFnZSc6ICdwYWdlOnByZXYnXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMubW9kZWwuZ2V0KCdkaXZpZGVyJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsLmdldCgncGFnZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtcGFnZSc6IHRoaXMubW9kZWwuZ2V0KCdwYWdlJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5QYWdpbmF0aW9uTGlzdCA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAndWwnLFxuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5QYWdpbmF0aW9uSXRlbSxcblxuICAgICAgICBjbGFzc05hbWU6ICdwYWdpbmF0aW9uJyxcblxuICAgICAgICBjaGlsZFZpZXdFdmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayc6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3BhZ2luYXRlJywgdmlldyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3BhZ2U6bmV4dCc6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3BhZ2U6bmV4dCcsIHZpZXcpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdwYWdlOnByZXYnOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdwYWdlOnByZXYnLCB2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBUb29sYm94LlBhZ2luYXRpb24gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncGFnaW5hdGlvbicpLFxuXG5cdFx0dGFnTmFtZTogJ25hdicsXG5cblx0XHRyZWdpb25zOiB7XG4gICAgICAgICAgICBsaXN0OiB7XG4gICAgICAgICAgICAgICAgZWw6ICd1bCcsXG4gICAgICAgICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgcGFnaW5hdGlvbkNsYXNzTmFtZTogJ3BhZ2luYXRpb24nLFxuICAgICAgICAgICAgYWN0aXZlQ2xhc3NOYW1lOiAnYWN0aXZlJyxcbiAgICAgICAgICAgIGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnLFxuICAgICAgICAgICAgdG90YWxQYWdlczogMSxcbiAgICAgICAgICAgIHNob3dQYWdlczogNixcbiAgICAgICAgICAgIHBhZ2U6IDFcbiAgICAgICAgfSxcblxuXHRcdGNoaWxkVmlld0V2ZW50czoge1xuXHRcdFx0J3BhZ2U6bmV4dCc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLm5leHRQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J3BhZ2U6cHJldic6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J3BhZ2luYXRlJzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlUGFnZSh2aWV3Lm1vZGVsLmdldCgncGFnZScpKTtcblx0XHRcdH1cblx0XHR9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdFRvb2xib3guVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZighdGhpcy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKTtcbiAgICAgICAgICAgIH1cblx0XHR9LFxuXG5cdFx0b25CZWZvcmVSZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jb2xsZWN0aW9uLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uYWRkKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJyZsYXF1bzsnLFxuICAgICAgICAgICAgICAgIGNsYXNzOiAncHJldi1wYWdlJ1xuICAgICAgICAgICAgfSk7XG5cblx0XHRcdHZhciBjdXJyZW50UGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0XHR2YXIgdG90YWxQYWdlcyA9IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cdFx0XHR2YXIgc2hvd1BhZ2VzID0gdGhpcy5nZXRPcHRpb24oJ3Nob3dQYWdlcycpO1xuXG5cdFx0XHRpZihzaG93UGFnZXMgJSAyKSB7XG5cdFx0XHRcdHNob3dQYWdlcysrOyAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyXG5cdFx0XHR9XG5cblx0XHRcdHZhciBzdGFydFBhZ2UgPSAoY3VycmVudFBhZ2UgPCBzaG93UGFnZXMpID8gMSA6IGN1cnJlbnRQYWdlIC0gKHNob3dQYWdlcyAvIDIpO1xuXG5cdFx0XHR2YXIgZW5kUGFnZSA9IHNob3dQYWdlcyArIHN0YXJ0UGFnZTtcblxuXHRcdFx0ZW5kUGFnZSA9ICh0b3RhbFBhZ2VzIDwgZW5kUGFnZSkgPyB0b3RhbFBhZ2VzIDogZW5kUGFnZTtcblxuXHRcdFx0dmFyIGRpZmYgPSBzdGFydFBhZ2UgLSBlbmRQYWdlICsgc2hvd1BhZ2VzO1xuXG5cdFx0XHRzdGFydFBhZ2UgLT0gKHN0YXJ0UGFnZSAtIGRpZmYgPiAwKSA/IGRpZmYgOiAwO1xuXG5cdFx0XHRpZiAoc3RhcnRQYWdlID4gMSkge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiAxfSk7XG5cblx0XHRcdFx0aWYoc3RhcnRQYWdlID4gMikge1xuXHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe2RpdmlkZXI6IHRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmb3IodmFyIGkgPSBzdGFydFBhZ2U7IGkgPD0gZW5kUGFnZTsgaSsrKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe3BhZ2U6IGl9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGVuZFBhZ2UgPCB0b3RhbFBhZ2VzKSB7XG5cdFx0XHRcdGlmKHRvdGFsUGFnZXMgLSAxID4gZW5kUGFnZSkge1xuXHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe2RpdmlkZXI6IHRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiB0b3RhbFBhZ2VzfSk7XG5cdFx0XHR9XG5cbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5hZGQoe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnJnJhcXVvOycsXG4gICAgICAgICAgICAgICAgY2xhc3M6ICduZXh0LXBhZ2UnXG4gICAgICAgICAgICB9KTtcblx0XHR9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdbZGF0YS1wYWdlPVwiJyt0aGlzLmdldE9wdGlvbigncGFnZScpKydcIl0nKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdwYWdlJykgPT0gMSkge1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCcucHJldi1wYWdlJykucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IHRoaXMuZ2V0VG90YWxQYWdlcygpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2xpc3QnLCBuZXcgVG9vbGJveC5QYWdpbmF0aW9uTGlzdCh7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VG90YWxQYWdlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RvdGFsUGFnZXMnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0XHR2YXIgdG90YWwgPSB0aGlzLmdldFRvdGFsUGFnZXMoKTtcblxuXHRcdFx0aWYocGFnZSA8IHRvdGFsKSB7XG5cdFx0XHRcdHBhZ2UrKztcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHBhZ2UpO1xuXHRcdH0sXG5cblx0XHRvbk5leHRQYWdlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5uZXh0UGFnZSgpO1xuXHRcdH0sXG5cblx0XHRwcmV2UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cblx0XHRcdGlmKHBhZ2UgPiAxKSB7XG5cdFx0XHRcdHBhZ2UtLTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHBhZ2UpO1xuXHRcdH0sXG5cblx0XHRvblByZXZQYWdlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5wcmV2UGFnZSgpO1xuXHRcdH0sXG5cbiAgICAgICAgc2V0U2hvd1BhZ2VzOiBmdW5jdGlvbihzaG93UGFnZXMpIHtcblx0XHRcdHRoaXMub3B0aW9ucy5zaG93UGFnZXMgPSBzaG93UGFnZXM7XG5cdFx0fSxcblxuXHRcdGdldFNob3dQYWdlczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3Nob3dQYWdlcycpO1xuXHRcdH0sXG5cblx0XHRzZXRUb3RhbFBhZ2VzOiBmdW5jdGlvbih0b3RhbFBhZ2VzKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMudG90YWxQYWdlcyA9IHRvdGFsUGFnZXM7XG5cdFx0fSxcblxuXHRcdGdldFRvdGFsUGFnZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cdFx0fSxcblxuXHRcdHNldFBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcblx0XHR9LFxuXG5cdFx0Z2V0UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHR9LFxuXG5cdFx0c2V0UGFnaW5hdGlvbkxpbmtzOiBmdW5jdGlvbihwYWdlLCB0b3RhbFBhZ2VzKSB7XG5cdFx0XHR0aGlzLnNldFBhZ2UocGFnZSk7XG5cdFx0XHR0aGlzLnNldFRvdGFsUGFnZXModG90YWxQYWdlcyk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0sXG5cblx0XHRzZXRBY3RpdmVQYWdlOiBmdW5jdGlvbihwYWdlKSB7XG5cdFx0XHRpZih0aGlzLm9wdGlvbnMucGFnZSAhPSBwYWdlKSB7XG5cdFx0XHRcdHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcblx0XHRcdFx0dGhpcy5yZW5kZXIoKTtcblxuXHRcdFx0XHR2YXIgcXVlcnkgPSB0aGlzLmNvbGxlY3Rpb24ud2hlcmUoe3BhZ2U6IHBhZ2V9KTtcblxuXHRcdFx0XHRpZihxdWVyeS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5nZXRSZWdpb24oJ2xpc3QnKS5jdXJyZW50Vmlldy5jaGlsZHJlbi5maW5kQnlNb2RlbChxdWVyeVswXSk7XG5cblx0XHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3BhZ2luYXRlJywgcGFnZSwgY2hpbGQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGdldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0fVxuXG4gICAgfSk7XG5cbiAgICAvKlxuICAgICovXG5cbiAgICAvKlxuICAgICovXG5cbiAgICAvKlxuXHRUb29sYm94LlBhZ2luYXRpb24gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdwYWdpbmF0aW9uJyksXG5cblx0XHR0YWdOYW1lOiAnbmF2JyxcblxuXHRcdHJlZ2lvbnM6IHtcbiAgICAgICAgICAgIGxpc3Q6IHtcbiAgICAgICAgICAgICAgICBlbDogJ3VsJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlRWxlbWVudDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBwYWdpbmF0aW9uQ2xhc3NOYW1lOiAncGFnaW5hdGlvbicsXG4gICAgICAgICAgICBhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuICAgICAgICAgICAgZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICB0b3RhbFBhZ2VzOiAxLFxuICAgICAgICAgICAgc2hvd1BhZ2VzOiA2LFxuICAgICAgICAgICAgcGFnZTogMVxuICAgICAgICB9LFxuXG5cdFx0Y2hpbGRWaWV3RXZlbnRzOiB7XG5cdFx0XHQncGFnZTpuZXh0JzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMubmV4dFBhZ2UoKTtcblx0XHRcdH0sXG5cdFx0XHQncGFnZTpwcmV2JzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMucHJldlBhZ2UoKTtcblx0XHRcdH0sXG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRcdGlmKCF2aWV3LiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSkpIHtcblx0XHRcdFx0XHR0aGlzLnNldEFjdGl2ZVBhZ2Uodmlldy5tb2RlbC5nZXQoJ3BhZ2UnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayAubmV4dC1wYWdlJzogJ25leHQ6cGFnZTpjbGljaycsXG5cdFx0XHQnY2xpY2sgLnByZXYtcGFnZSc6ICdwcmV2OnBhZ2U6Y2xpY2snXG5cdFx0fSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRUb29sYm94LkNvbGxlY3Rpb25WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuICAgICAgICAgICAgfVxuXHRcdH0sXG5cblx0XHRvbkJlZm9yZVJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmNvbGxlY3Rpb24ucmVzZXQoKTtcblxuXHRcdFx0dmFyIGN1cnJlbnRQYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHRcdHZhciB0b3RhbFBhZ2VzID0gdGhpcy5nZXRUb3RhbFBhZ2VzKCk7XG5cdFx0XHR2YXIgc2hvd1BhZ2VzID0gdGhpcy5nZXRPcHRpb24oJ3Nob3dQYWdlcycpO1xuXG5cdFx0XHRpZihzaG93UGFnZXMgJSAyKSB7XG5cdFx0XHRcdHNob3dQYWdlcysrOyAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyXG5cdFx0XHR9XG5cblx0XHRcdHZhciBzdGFydFBhZ2UgPSAoY3VycmVudFBhZ2UgPCBzaG93UGFnZXMpID8gMSA6IGN1cnJlbnRQYWdlIC0gKHNob3dQYWdlcyAvIDIpO1xuXG5cdFx0XHR2YXIgZW5kUGFnZSA9IHNob3dQYWdlcyArIHN0YXJ0UGFnZTtcblxuXHRcdFx0ZW5kUGFnZSA9ICh0b3RhbFBhZ2VzIDwgZW5kUGFnZSkgPyB0b3RhbFBhZ2VzIDogZW5kUGFnZTtcblxuXHRcdFx0dmFyIGRpZmYgPSBzdGFydFBhZ2UgLSBlbmRQYWdlICsgc2hvd1BhZ2VzO1xuXG5cdFx0XHRzdGFydFBhZ2UgLT0gKHN0YXJ0UGFnZSAtIGRpZmYgPiAwKSA/IGRpZmYgOiAwO1xuXG5cdFx0XHRpZiAoc3RhcnRQYWdlID4gMSkge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiAxfSk7XG5cblx0XHRcdFx0aWYoc3RhcnRQYWdlID4gMikge1xuXHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe2RpdmlkZXI6IHRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmb3IodmFyIGkgPSBzdGFydFBhZ2U7IGkgPD0gZW5kUGFnZTsgaSsrKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe3BhZ2U6IGl9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGVuZFBhZ2UgPCB0b3RhbFBhZ2VzKSB7XG5cdFx0XHRcdGlmKHRvdGFsUGFnZXMgLSAxID4gZW5kUGFnZSkge1xuXHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe2RpdmlkZXI6IHRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiB0b3RhbFBhZ2VzfSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG5leHRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHRcdHZhciB0b3RhbCA9IHRoaXMuZ2V0VG90YWxQYWdlcygpO1xuXG5cdFx0XHRpZihwYWdlIDwgdG90YWwpIHtcblx0XHRcdFx0cGFnZSsrO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldEFjdGl2ZVBhZ2UocGFnZSk7XG5cdFx0fSxcblxuXHRcdG9uTmV4dFBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm5leHRQYWdlKCk7XG5cdFx0fSxcblxuXHRcdHByZXZQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblxuXHRcdFx0aWYocGFnZSA+IDEpIHtcblx0XHRcdFx0cGFnZS0tO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldEFjdGl2ZVBhZ2UocGFnZSk7XG5cdFx0fSxcblxuXHRcdG9uUHJldlBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0fSxcblxuXHRcdG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCdbZGF0YS1wYWdlPVwiJyt0aGlzLmdldE9wdGlvbigncGFnZScpKydcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHR0aGlzLiRlbC5maW5kKCcucHJldi1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLm5leHQtcGFnZScpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSAxKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdwYWdlJykgPT0gdGhpcy5nZXRUb3RhbFBhZ2VzKCkpIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLm5leHQtcGFnZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblxuICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdsaXN0JywgbmV3IFRvb2xib3guUGFnaW5hdGlvbkxpc3Qoe1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvblxuICAgICAgICAgICAgfSkpO1xuXHRcdH0sXG5cblx0XHRzZXRTaG93UGFnZXM6IGZ1bmN0aW9uKHNob3dQYWdlcykge1xuXHRcdFx0dGhpcy5vcHRpb25zLnNob3dQYWdlcyA9IHNob3dQYWdlcztcblx0XHR9LFxuXG5cdFx0Z2V0U2hvd1BhZ2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbignc2hvd1BhZ2VzJyk7XG5cdFx0fSxcblxuXHRcdHNldFRvdGFsUGFnZXM6IGZ1bmN0aW9uKHRvdGFsUGFnZXMpIHtcblx0XHRcdHRoaXMub3B0aW9ucy50b3RhbFBhZ2VzID0gdG90YWxQYWdlcztcblx0XHR9LFxuXG5cdFx0Z2V0VG90YWxQYWdlczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RvdGFsUGFnZXMnKTtcblx0XHR9LFxuXG5cdFx0c2V0UGFnZTogZnVuY3Rpb24ocGFnZSkge1xuXHRcdFx0dGhpcy5vcHRpb25zLnBhZ2UgPSBwYWdlO1xuXHRcdH0sXG5cblx0XHRnZXRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdH0sXG5cblx0XHRzZXRQYWdpbmF0aW9uTGlua3M6IGZ1bmN0aW9uKHBhZ2UsIHRvdGFsUGFnZXMpIHtcblx0XHRcdHRoaXMuc2V0UGFnZShwYWdlKTtcblx0XHRcdHRoaXMuc2V0VG90YWxQYWdlcyh0b3RhbFBhZ2VzKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSxcblxuXHRcdHNldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdGlmKHRoaXMub3B0aW9ucy5wYWdlICE9IHBhZ2UpIHtcblx0XHRcdFx0dGhpcy5vcHRpb25zLnBhZ2UgPSBwYWdlO1xuXHRcdFx0XHR0aGlzLnJlbmRlcigpO1xuXG5cdFx0XHRcdHZhciBxdWVyeSA9IHRoaXMuY29sbGVjdGlvbi53aGVyZSh7cGFnZTogcGFnZX0pO1xuXG5cdFx0XHRcdGlmKHF1ZXJ5Lmxlbmd0aCkge1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgncGFnaW5hdGUnLCBwYWdlLCB0aGlzLmNoaWxkcmVuLmZpbmRCeU1vZGVsKHF1ZXJ5WzBdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0QWN0aXZlUGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHR9XG5cblx0fSk7XG4gICAgKi9cblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guUHJvZ3Jlc3NCYXIgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdwcm9ncmVzcy1iYXInKSxcblxuXHRcdGNsYXNzTmFtZTogJ3Byb2dyZXNzJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgcHJvZ3Jlc3MgYmFyIGNsYXNzIG5hbWVcblx0XHRcdHByb2dyZXNzQmFyQ2xhc3NOYW1lOiAncHJvZ3Jlc3MtYmFyJyxcblxuXHRcdFx0Ly8gKGludCkgVGhlIHByb2dyZXNzIHBlcmNlbnRhZ2Vcblx0XHRcdHByb2dyZXNzOiAwXG5cdFx0fSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0c2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uKHByb2dyZXNzKSB7XG5cdFx0XHRpZihwcm9ncmVzcyA8IDApIHtcblx0XHRcdFx0cHJvZ3Jlc3MgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihwcm9ncmVzcyA+IDEwMCkge1xuXHRcdFx0XHRwcm9ncmVzcyA9IDEwMDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vcHRpb25zLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3Byb2dyZXNzJywgcHJvZ3Jlc3MpO1xuXG5cdFx0XHRpZihwcm9ncmVzcyA9PT0gMTAwKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY29tcGxldGUnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwcm9ncmVzcycpO1xuXHRcdH0sXG5cblx0XHRvblByb2dyZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlJhZGlvRmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLXJhZGlvLWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgb3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdyYWRpbycsXG4gICAgICAgICAgICBjaGVja2JveENsYXNzTmFtZTogJ3JhZGlvJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJzpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCdbdmFsdWU9XCInK3ZhbHVlKydcIl0nKS5hdHRyKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnbm91aXNsaWRlciddLCBmdW5jdGlvbihub1VpU2xpZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIG5vVWlTbGlkZXIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdub3Vpc2xpZGVyJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Lm5vVWlTbGlkZXIpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIG5vVWlTbGlkZXIpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guUmFuZ2VTbGlkZXIgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncmFuZ2Utc2xpZGVyJyksXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChib29sKSBTaG91bGQgdGhlIHNsaWRlciBiZSBhbmltYXRlXG4gICAgICAgICAgICBhbmltYXRlOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBDbGljayBlZmZlY3RzIGZvciBtYW5pcHVsYXRpbmcgdGhlIHNsaWRlci5cbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIHZhbHVlczogXCJkcmFnXCIsIFwidGFwXCIsIFwiZml4ZWRcIiwgXCJzbmFwXCIgb3IgXCJub25lXCJcbiAgICAgICAgICAgIGJlaGF2aW9yOiAndGFwJyxcblxuICAgICAgICAgICAgLy8gKG1peGVkKSBTaG91bGQgdGhlIGhhbmRsZXMgYmUgY29ubmVjdGVkLlxuICAgICAgICAgICAgLy8gUG9zc2libGUgdmFsdWVzOiB0cnVlLCBmYWxzZSwgXCJ1cHBlclwiLCBvciBcImxvd2VyXCJcbiAgICAgICAgICAgIGNvbm5lY3Q6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgZGlyZWN0aW9uIG9mIHRoZSBzbGlkZXIuIFwibHRyXCIgb3IgXCJydGxcIlxuICAgICAgICAgICAgZGlyZWN0aW9uOiAnbHRyJyxcblxuICAgICAgICAgICAgLy8gKGludCkgVGhlIG1heGltdW0gZGlzdGFuY2UgdGhlIGhhbmRsZXMgY2FuIGJlIGZyb20gZWFjaCBvdGhlclxuICAgICAgICAgICAgLy8gZmFsc2UgZGlzYWJsZXMgdGhpcyBvcHRpb24uXG4gICAgICAgICAgICBsaW1pdDogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBtaW5pbXVtIGRpc3RhbmNlIHRoZSBoYW5kbGVzIGNhbiBiZSBmcm9tIGVhY2ggb3RoZXJcbiAgICAgICAgICAgIC8vIGZhbHNlIGRpc2FibGVkIHRoaXMgb3B0aW9uXG4gICAgICAgICAgICBtYXJnaW46IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgb3JpZW50YXRpb24gb2YgdGhlIHNsaWRlci4gXCJob3Jpem9udGFsXCIgb3IgXCJ2ZXJ0aWNhbFwiXG4gICAgICAgICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIHN0YXJ0aW5nIHBvc3NpdGlvbiBvZiB0aGUgc2xpZGVyIGhhbmRsZXNcbiAgICAgICAgICAgIHN0YXJ0OiBbMF0sXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBzdGVwIGludGVnZXJcbiAgICAgICAgICAgIHN0ZXA6IDAsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIHRoZSByYW5nZSBvYmplY3QgZGVmaW5lZCB0aGUgbWluL21heCB2YWx1ZXNcbiAgICAgICAgICAgIHJhbmdlOiB7XG4gICAgICAgICAgICAgICAgbWluOiBbMF0sXG4gICAgICAgICAgICAgICAgbWF4OiBbMTAwXVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZTogdGhpcy5nZXRPcHRpb24oJ2FuaW1hdGUnKSxcbiAgICAgICAgICAgICAgICBiZWhhdmlvcjogdGhpcy5nZXRPcHRpb24oJ2JlaGF2aW9yJyksXG4gICAgICAgICAgICAgICAgY29ubmVjdDogdGhpcy5nZXRPcHRpb24oJ2Nvbm5lY3QnKSxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IHRoaXMuZ2V0T3B0aW9uKCdkaXJlY3Rpb24nKSxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogdGhpcy5nZXRPcHRpb24oJ29yaWVudGF0aW9uJyksXG4gICAgICAgICAgICAgICAgcmFuZ2U6IHRoaXMuZ2V0T3B0aW9uKCdyYW5nZScpLFxuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldE9wdGlvbignc3RhcnQnKSxcbiAgICAgICAgICAgICAgICBzdGVwOiB0aGlzLmdldE9wdGlvbignc3RlcCcpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbWFyZ2luJykgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5tYXJnaW4gPSB0aGlzLmdldE9wdGlvbignbWFyZ2luJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdsaW1pdCcpICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubGltaXQgPSB0aGlzLmdldE9wdGlvbignbGltaXQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNsaWRlciA9IHRoaXMuJGVsLmZpbmQoJy5zbGlkZXInKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHNsaWRlciA9IG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHNsaWRlci5vbignc2xpZGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3NsaWRlJywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXIub24oJ3NldCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc2V0JywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnY2hhbmdlJywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNsaWRlckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJy5zbGlkZXInKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmdldFNsaWRlckVsZW1lbnQoKS52YWwodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkuYXR0cignZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5TZWxlY3RGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tc2VsZWN0LWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAnc2VsZWN0JyxcbiAgICAgICAgICAgIG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IFtdXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjaGFuZ2UgLmZvcm0tY29udHJvbCc6ICdjaGFuZ2UnXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnc2VsZWN0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh0aGlzLmdldElucHV0RmllbGQoKS5maW5kKCdvcHRpb246Zmlyc3QnKS52YWwoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnLCAnaW50ZXJhY3QuanMnXSwgZnVuY3Rpb24oJCwgXywgaW50ZXJhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXywgaW50ZXJhY3QpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2ludGVyYWN0LmpzJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8sIHJvb3QuaW50ZXJhY3QpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8sIGludGVyYWN0KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlNlbGVjdGlvblBvb2wgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnc2VsZWN0aW9uLXBvb2wnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICdzZWxlY3Rpb24tcG9vbCcsXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgYXZhaWxhYmxlOiAnLmF2YWlsYWJsZS1wb29sJyxcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnLnNlbGVjdGVkLXBvb2wnLFxuICAgICAgICAgICAgLy9hY3Rpdml0eTogJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtYWN0aXZpdHknXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuZXN0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlOiBbXSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlldzogVG9vbGJveC5TZWxlY3Rpb25Qb29sVHJlZVZpZXcsXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlld1RlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdzZWxlY3Rpb24tcG9vbC10cmVlLW5vZGUnKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWU6IFtdLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXc6IFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVWaWV3LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWVWaWV3VGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3NlbGVjdGlvbi1wb29sLXRyZWUtbm9kZScpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwaW5nU3RvcHBlZFRocmVzaG9sZDogNTAwLFxuICAgICAgICAgICAgICAgIGxpa2VuZXNzVGhyZXNob2xkOiA3NSxcbiAgICAgICAgICAgICAgICBzY3JvbGxCb3R0b21UaHJlc2hvbGQ6IDEwLFxuICAgICAgICAgICAgICAgIHNlYXJjaEluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAndGlueSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXInOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJTZWFyY2goKTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vZmYoJ2RldGVjdGlvbjp0eXBpbmc6c3RhcnRlZCcsIGZhbHNlLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vZmYoJ2RldGVjdGlvbjp0eXBpbmc6c3RvcHBlZCcsIGZhbHNlLCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwub24oJ2RldGVjdGlvbjp0eXBpbmc6c3RhcnRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgndHlwaW5nOnN0YXJ0ZWQnKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwub24oJ2RldGVjdGlvbjp0eXBpbmc6c3RvcHBlZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd0eXBpbmc6c3RvcHBlZCcsIHZhbHVlKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTZWFyY2hBY3Rpdml0eTogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoLWFjdGl2aXR5JykucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoJykuYXBwZW5kKFtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInNlbGVjdGlvbi1wb29sLXNlYXJjaC1hY3Rpdml0eVwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2VsZWN0aW9uLXBvb2wtc2VhcmNoLWFjdGl2aXR5LWxhYmVsXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIChtZXNzYWdlIHx8ICdMb2FkaW5nLi4uJyksXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nLFxuICAgICAgICAgICAgICAgICc8L2Rpdj4nXG4gICAgICAgICAgICBdLmpvaW4oJycpKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLiRlbC5hZGRDbGFzcygnc2hvdy1hY3Rpdml0eScpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVTZWFyY2hBY3Rpdml0eTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzaG93LWFjdGl2aXR5Jyk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi4kZWwuZmluZCgnLnNlbGVjdGlvbi1wb29sLXNlYXJjaC1hY3Rpdml0eScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSwgMjUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QXZhaWxhYmxlUG9vbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIEF2YWlsYWJsZVRyZWVWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKEF2YWlsYWJsZVRyZWVWaWV3KSB7XG4gICAgICAgIFx0XHR2YXIgdmlldyA9IG5ldyBBdmFpbGFibGVUcmVlVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWUnKSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogXy5leHRlbmQoe30sIEF2YWlsYWJsZVRyZWVWaWV3LnByb3RvdHlwZS5jaGlsZFZpZXdPcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guRHJhZ2dhYmxlVHJlZVZpZXcsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0YWJsZTogdGhpcy5nZXRPcHRpb24oJ25lc3RhYmxlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3VGVtcGxhdGUnKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICBcdFx0fSwgdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3T3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgICAgICB2aWV3LmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVzZXRTY3JvbGxCb3R0b20uY2FsbChzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2F2YWlsYWJsZScsIHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTZWxlY3RlZFBvb2w6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFNlbGVjdGVkVHJlZVZpZXcgPSB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlVmlldycpO1xuXG4gICAgICAgICAgICBpZihTZWxlY3RlZFRyZWVWaWV3KSB7XG4gICAgICAgIFx0XHR2YXIgdmlldyA9IG5ldyBTZWxlY3RlZFRyZWVWaWV3KF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlJyksXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld09wdGlvbnM6IF8uZXh0ZW5kKHt9LCBTZWxlY3RlZFRyZWVWaWV3LnByb3RvdHlwZS5jaGlsZFZpZXdPcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guRHJhZ2dhYmxlVHJlZVZpZXcsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0YWJsZTogdGhpcy5nZXRPcHRpb24oJ25lc3RhYmxlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRPcHRpb24oJ3NlbGVjdGVkVHJlZVZpZXdUZW1wbGF0ZScpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIFx0XHR9LCB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdzZWxlY3RlZCcsIHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG1vZGVsQ29udGFpbnM6IGZ1bmN0aW9uKG1vZGVsLCBxdWVyeSkge1xuICAgICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiBtb2RlbCA9IG1vZGVsLnRvSlNPTigpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbW9kZWxbaV07XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLmNvbnRhaW5zLmNhbGwodGhpcywgdmFsdWUsIHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjb250YWluczogZnVuY3Rpb24oc3ViamVjdCwgcXVlcnkpIHtcbiAgICAgICAgICAgIGlmKCFfLmlzU3RyaW5nKHN1YmplY3QpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gcXVlcnkgPSBxdWVyeS5zcGxpdCgnICcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcXVlcnlbaV07XG5cbiAgICAgICAgICAgICAgICBpZihzdWJqZWN0LnRvVXBwZXJDYXNlKCkuaW5jbHVkZXModmFsdWUudG9VcHBlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGNvbXBhcmlzb24gPSBuZXcgVG9vbGJveC5MZXZlbnNodGVpbih2YWx1ZS50b1VwcGVyQ2FzZSgpLCBzdWJqZWN0LnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICAgICAgICAgIHZhciBwZXJjZW50ID0gY29tcGFyaXNvbi5kaXN0YW5jZSAvIHN1YmplY3QubGVuZ3RoICogMTAwIC0gMTAwO1xuXG4gICAgICAgICAgICAgICAgaWYocGVyY2VudCA+IHRoaXMuZ2V0T3B0aW9uKCdsaWtlbmVzc1RocmVzaG9sZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlYXJjaDogZnVuY3Rpb24oY29sbGVjdGlvbiwgcXVlcnkpIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5tb2RlbENvbnRhaW5zKG1vZGVsLCBxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ2hpZGRlbicsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuYXZhaWxhYmxlLmN1cnJlbnRWaWV3LnJlbmRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyU2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtZmllbGQgaW5wdXQnKS52YWwoJycpLmZvY3VzKCk7XG4gICAgICAgICAgICB0aGlzLmhpZGVDbGVhclNlYXJjaEJ1dHRvbigpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd0eXBpbmc6c3RvcHBlZCcsICcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q2xlYXJTZWFyY2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNlbGVjdGlvbi1wb29sLXNlYXJjaC1jbGVhcicpLmFkZENsYXNzKCdzaG93Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZUNsZWFyU2VhcmNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXInKS5yZW1vdmVDbGFzcygnc2hvdycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uVHlwaW5nU3RhcnRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25UeXBpbmdTdG9wcGVkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDbGVhclNlYXJjaEJ1dHRvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlQ2xlYXJTZWFyY2hCdXR0b24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5hdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaCh0aGlzLmdldFJlZ2lvbignYXZhaWxhYmxlJykuY3VycmVudFZpZXcuY29sbGVjdGlvbiwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlc2V0U2Nyb2xsQm90dG9tOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbEF0Qm90dG9tID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxIZWlnaHQgPSB0aGlzLmdldFJlZ2lvbignYXZhaWxhYmxlJykuY3VycmVudFZpZXcuJGVsLnBhcmVudCgpLnByb3AoJ3Njcm9sbEhlaWdodCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIGRldGVjdGlvbiA9IG5ldyBUb29sYm94LlR5cGluZ0RldGVjdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoIGlucHV0JyksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3R5cGluZ1N0b3BwZWRUaHJlc2hvbGQnKSxcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHZhciAkYXZhaWxhYmxlUG9vbCA9IHRoaXMuZ2V0UmVnaW9uKCdhdmFpbGFibGUnKS5jdXJyZW50Vmlldy4kZWwucGFyZW50KCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2xhc3RTY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsQXRCb3R0b20gPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYuX3Njcm9sbEhlaWdodCA9ICRhdmFpbGFibGVQb29sLnByb3AoJ3Njcm9sbEhlaWdodCcpO1xuXG4gICAgICAgICAgICAkYXZhaWxhYmxlUG9vbC5zY3JvbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNjcm9sbFRvcCA9ICQodGhpcykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVzaG9sZCA9IHNlbGYuZ2V0T3B0aW9uKCdzY3JvbGxCb3R0b21UaHJlc2hvbGQnKTtcblxuICAgICAgICAgICAgICAgIHNlbGYuX2lzU2Nyb2xsaW5nRG93biA9IHNjcm9sbFRvcCA+IHNlbGYuX2xhc3RTY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNQYXN0VGhyZXNob2xkID0gc2Nyb2xsVG9wICsgJCh0aGlzKS5oZWlnaHQoKSA+PSBzZWxmLl9zY3JvbGxIZWlnaHQgLSB0aHJlc2hvbGQ7XG5cbiAgICAgICAgICAgICAgICBpZihzZWxmLl9pc1Njcm9sbGluZ0Rvd24gJiYgc2VsZi5faXNQYXN0VGhyZXNob2xkICYmICFzZWxmLl9zY3JvbGxBdEJvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zY3JvbGxBdEJvdHRvbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnc2Nyb2xsOmJvdHRvbScsIHNjcm9sbFRvcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFzZWxmLl9pc1Njcm9sbGluZ0Rvd24gJiYgIXNlbGYuX2lzUGFzdFRocmVzaG9sZCl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Njcm9sbEF0Qm90dG9tID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fbGFzdFNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuZHJvcHBhYmxlLXBvb2wnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciAkcG9vbCA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpbnRlcmFjdCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAuZHJvcHpvbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXB0OiAkKHRoaXMpLmRhdGEoJ2FjY2VwdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25kcm9wOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aGVyZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcm9tID0gc2VsZi5nZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvID0gc2VsZi5nZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZXJlW3NlbGYuZ2V0SWRBdHRyaWJ1dGUoJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBmcm9tLmNvbGxlY3Rpb24uZmluZFdoZXJlKHdoZXJlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20uY29sbGVjdGlvbi5yZW1vdmVOb2RlKG1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGUobW9kZWwsIG51bGwsIHthdDogJChldmVudC5yZWxhdGVkVGFyZ2V0KS5pbmRleCgpfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLiRlbC5yZW1vdmVDbGFzcygnZHJvcHBpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcG9vbC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdwb29sOmRyb3AnLCBldmVudCwgbW9kZWwsIGZyb20sIHRvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmRyYWdlbnRlcjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi4kZWwuYWRkQ2xhc3MoJ2Ryb3BwaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHBvb2wucGFyZW50KCkuYWRkQ2xhc3MoJ2Ryb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgncG9vbDpkcmFnOmVudGVyJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZHJhZ2xlYXZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLiRlbC5yZW1vdmVDbGFzcygnZHJvcHBpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcG9vbC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdwb29sOmRyYWc6bGVhdmUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SWRBdHRyaWJ1dGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5pc051bGwobmV3IFN0cmluZyh2YWx1ZSkubWF0Y2goL15jXFxkKyQvKSkgPyAnaWQnIDogJ2NpZCc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgJHBhcmVudCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmKCEkcGFyZW50Lmhhc0NsYXNzKCdkcm9wcGFibGUtcG9vbCcpKSB7XG4gICAgICAgICAgICAgICAgJHBhcmVudCA9ICRwYXJlbnQucGFyZW50cygnLmRyb3BwYWJsZS1wb29sJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAkcGFyZW50Lmhhc0NsYXNzKCdhdmFpbGFibGUtcG9vbCcpID9cbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlZ2lvbignYXZhaWxhYmxlJykuY3VycmVudFZpZXcgOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdzZWxlY3RlZCcpLmN1cnJlbnRWaWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0F2YWlsYWJsZVBvb2woKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NlbGVjdGVkUG9vbCgpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgZnVuY3Rpb24gdHJhbnNmZXJOb2RlQWZ0ZXIoZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgdmFyIGZyb21XaGVyZSA9IHt9LCB0b1doZXJlID0ge307XG4gICAgICAgIHZhciBmcm9tID0gdmlldy5nZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCk7XG4gICAgICAgIHZhciB0byA9IHZpZXcuZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgZnJvbVdoZXJlW3ZpZXcuZ2V0SWRBdHRyaWJ1dGUoJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gICAgICAgIHRvV2hlcmVbdmlldy5nZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgdmFyIGZyb21Nb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUoZnJvbVdoZXJlKTtcbiAgICAgICAgdmFyIHRvTW9kZWwgPSB0by5jb2xsZWN0aW9uLmZpbmRXaGVyZSh0b1doZXJlKTtcblxuICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShmcm9tTW9kZWwpO1xuICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihmcm9tTW9kZWwsIHRvTW9kZWwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zZmVyTm9kZUJlZm9yZShldmVudCwgdmlldykge1xuICAgICAgICB2YXIgZnJvbVdoZXJlID0ge30sIHRvV2hlcmUgPSB7fTtcbiAgICAgICAgdmFyIGZyb20gPSB2aWV3LmdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC5yZWxhdGVkVGFyZ2V0KTtcbiAgICAgICAgdmFyIHRvID0gdmlldy5nZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcblxuXG4gICAgICAgIGZyb21XaGVyZVt2aWV3LmdldElkQXR0cmlidXRlKCQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAgICAgICB0b1doZXJlW3ZpZXcuZ2V0SWRBdHRyaWJ1dGUoJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpO1xuXG4gICAgICAgIHZhciBmcm9tTW9kZWwgPSBmcm9tLmNvbGxlY3Rpb24uZmluZFdoZXJlKGZyb21XaGVyZSk7XG4gICAgICAgIHZhciB0b01vZGVsID0gdG8uY29sbGVjdGlvbi5maW5kV2hlcmUodG9XaGVyZSk7XG5cbiAgICAgICAgZnJvbS5jb2xsZWN0aW9uLnJlbW92ZU5vZGUoZnJvbU1vZGVsKTtcbiAgICAgICAgdG8uY29sbGVjdGlvbi5hcHBlbmROb2RlQmVmb3JlKGZyb21Nb2RlbCwgdG9Nb2RlbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNmZXJOb2RlQ2hpbGRyZW4oZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgdmFyIGZyb21XaGVyZSA9IHt9LCB0b1doZXJlID0ge307XG4gICAgICAgIHZhciBmcm9tID0gdmlldy5nZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCk7XG4gICAgICAgIHZhciB0byA9IHZpZXcuZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgaWYoJChldmVudC50YXJnZXQpLmZpbmQoJy5jaGlsZHJlbicpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiY2hpbGRyZW5cIiAvPicpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJvbVdoZXJlW3ZpZXcuZ2V0SWRBdHRyaWJ1dGUoJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gICAgICAgIHRvV2hlcmVbdmlldy5nZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgdmFyIGZyb21Nb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUoZnJvbVdoZXJlKTtcbiAgICAgICAgdmFyIHRvTW9kZWwgPSB0by5jb2xsZWN0aW9uLmZpbmRXaGVyZSh0b1doZXJlKTtcblxuICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShmcm9tTW9kZWwpO1xuICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGUoZnJvbU1vZGVsLCB0b01vZGVsLCB7XG4gICAgICAgICAgICBhdDogMFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBUb29sYm94LlNlbGVjdGlvblBvb2xUcmVlVmlldyA9IFRvb2xib3guRHJhZ2dhYmxlVHJlZVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBvbkRyb3BBZnRlcjogZnVuY3Rpb24oZXZlbnQsIHBhcmVudCkge1xuICAgICAgICAgICAgdHJhbnNmZXJOb2RlQWZ0ZXIoZXZlbnQsIHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnQnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wQmVmb3JlOiBmdW5jdGlvbihldmVudCwgcGFyZW50KSB7XG4gICAgICAgICAgICB0cmFuc2Zlck5vZGVCZWZvcmUoZXZlbnQsICB0aGlzLmdldE9wdGlvbigncGFyZW50JykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcENoaWxkcmVuOiBmdW5jdGlvbihldmVudCwgcGFyZW50KSB7XG4gICAgICAgICAgICB0cmFuc2Zlck5vZGVDaGlsZHJlbihldmVudCwgdGhpcy5nZXRPcHRpb24oJ3BhcmVudCcpKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydiYWNrYm9uZScsICdiYWNrYm9uZS5tYXJpb25ldHRlJywgJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oQmFja2JvbmUsIE1hcmlvbmV0dGUsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgQmFja2JvbmUsIE1hcmlvbmV0dGUsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuQmFja2JvbmUsIHJvb3QuTWFyaW9uZXR0ZSwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5TdG9yYWdlID0gTWFyaW9uZXR0ZS5PYmplY3QuZXh0ZW5kKHtcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgc3RvcmFnZUVuZ2luZTogbG9jYWxTdG9yYWdlLFxuICAgICAgICAgICAgZGF0YUNsYXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAgICAgTWFyaW9uZXR0ZS5PYmplY3QucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gVG9vbGJveC5PcHRpb25zKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucywgdGhpcyk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLnRhYmxlTmFtZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIFxcJ3RhYmxlXFwnIG9wdGlvbiBtdXN0IGJlIHNldCB3aXRoIGEgdmFsaWQgdGFibGUgbmFtZS4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZSgpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZGF0YScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ2RhdGEnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGVuZ2luZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0b3JhZ2VFbmdpbmUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0YWJsZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCd0YWJsZScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgZG9lc1RhYmxlRXhpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICFfLmlzTnVsbCh0aGlzLmVuZ2luZSgpLmdldEl0ZW0odGhpcy50YWJsZU5hbWUoKSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmRvZXNUYWJsZUV4aXN0KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95VGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUoKS5yZW1vdmVJdGVtKHRoaXMudGFibGVOYW1lKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHRoaXMuZW5naW5lKCkuZ2V0SXRlbSh0aGlzLnRhYmxlTmFtZSgpKSk7XG4gICAgICAgICAgICB2YXIgRGF0YUNsYXNzID0gXy5pc0FycmF5KGRhdGEpID8gQmFja2JvbmUuQ29sbGVjdGlvbiA6IEJhY2tib25lLk1vZGVsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZGF0YUNsYXNzJykpIHtcbiAgICAgICAgICAgICAgICBEYXRhQ2xhc3MgID0gdGhpcy5nZXRPcHRpb24oJ2RhdGFDbGFzcycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmRhdGEgPSBuZXcgRGF0YUNsYXNzKGRhdGEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2RhdGEnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lKCkuc2V0SXRlbSh0aGlzLnRhYmxlTmFtZSgpLCBKU09OLnN0cmluZ2lmeSh0aGlzLmdldE9wdGlvbignZGF0YScpLnRvSlNPTigpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgLy8gVE9ETzogQWRkIEtleVN0b3JlXG4gICAgLypcbiAgICBUb29sYm94LktleVN0b3JlID0gVG9vbGJveC5TdG9yYWdlLmV4dGVuZCh7XG5cbiAgICB9KTtcbiAgICAqL1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbigkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVGFibGVOb0l0ZW1zUm93ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGFnTmFtZTogJ3RyJyxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtbm8taXRlbXMnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICduby1yZXN1bHRzJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZXJlIGFyZSBubyB0YWJsZSByb3dzXG4gICAgICAgICAgICBtZXNzYWdlOiAnTm8gcm93cyBmb3VuZCdcbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guVGFibGVWaWV3Um93ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGFnTmFtZTogJ3RyJyxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtdmlldy1yb3cnKSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAobWl4ZWQpIElmIG5vdCBmYWxzZSwgcGFzcyBhIHZhbGlkIFZpZXcgcHJvdG90eXBlXG4gICAgICAgICAgICBlZGl0Rm9ybUNsYXNzOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG1peGVkKSBJZiBub3QgZmFsc2UsIHBhc3MgYSB2YWxpZCBWaWV3IHByb3RvdHlwZVxuICAgICAgICAgICAgZGVsZXRlRm9ybUNsYXNzOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmVkaXQnOiAnY2xpY2s6ZWRpdCcsXG4gICAgICAgICAgICAnY2xpY2sgLmRlbGV0ZSc6ICdjbGljazpkZWxldGUnXG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrRWRpdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlZGl0Rm9ybUNsYXNzJyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZpZXcub24oJ3N1Ym1pdDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dWaWV3SW5Nb2RhbCh2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrRGVsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2RlbGV0ZUZvcm1DbGFzcycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyh7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dWaWV3SW5Nb2RhbCh2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Vmlld0luTW9kYWw6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgIHZhciBtb2RhbCA9IG5ldyBUb29sYm94Lk1vZGFsKHtcbiAgICAgICAgICAgICAgICBjb250ZW50Vmlldzogdmlld1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ3N1Ym1pdDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbW9kYWwuaGlkZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1vZGFsLnNob3coKTtcblxuICAgICAgICAgICAgcmV0dXJuIG1vZGFsO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guVGFibGVWaWV3Qm9keSA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAndGJvZHknLFxuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5UYWJsZVZpZXdSb3csXG5cbiAgICAgICAgb25DaGlsZHZpZXdCZWZvcmVSZW5kZXI6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICBjaGlsZC5vcHRpb25zLmNvbHVtbnMgPSB0aGlzLmdldE9wdGlvbignY29sdW1ucycpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guVGFibGVWaWV3ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHRjbGFzc05hbWU6ICd0YWJsZS12aWV3JyxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgZWw6ICd0Ym9keScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoZWFkZXI6ICd0aGVhZCcsXG4gICAgICAgICAgICBmb290ZXI6ICd0Zm9vdCB0ZCdcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtdmlldy1ncm91cCcpLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgc3RhcnRpbmcgcGFnZVxuICAgICAgICAgICAgcGFnZTogMSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG9yZGVyIG9mIHRoZSBkYXRlIGJlaW5nIHJldHVybmVkXG4gICAgICAgICAgICBvcmRlcjogbnVsbCxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgRWl0aGVyIGFzYyBvciBkZXNjIHNvcnRpbmcgb3JkZXJcbiAgICAgICAgICAgIHNvcnQ6IG51bGwsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBudW1iZXJzIG9mIHJvd3MgcGVyIHBhZ2VcbiAgICAgICAgICAgIGxpbWl0OiAyMCxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIFNob3VsZCBzaG93IHRoZSBwYWdpbmF0aW9uIGZvciB0aGlzIHRhYmxlXG4gICAgICAgICAgICBwYWdpbmF0ZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgRmV0Y2ggdGhlIGRhdGEgd2hlbiB0YWJsZSBpcyBzaG93blxuICAgICAgICAgICAgZmV0Y2hPblNob3c6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgaGVhZGVycyBhcHBlbmRlZCB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgcmVxdWVzdEhlYWRlcnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIFRoZSBkZWZhdWx0IG9wdGlvbnMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgICAgICBkZWZhdWx0UmVxdWVzdERhdGFPcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgJ3BhZ2UnLFxuICAgICAgICAgICAgICAgICdsaW1pdCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnc29ydCdcbiAgICAgICAgICAgIF0sXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQWRkaXRpb25hbCBvcHRpb25zIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIHF1ZXJ5IHN0cmluZ1xuICAgICAgICAgICAgcmVxdWVzdERhdGFPcHRpb25zOiBbXSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGJvZHkgdmlldyBjbGFzc1xuICAgICAgICAgICAgYm9keVZpZXc6IFRvb2xib3guVGFibGVWaWV3Qm9keSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGJvZHkgdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgYm9keVZpZXdPcHRpb25zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIHBhZ2luYXRpb24gdmlldyBjbGFzc1xuICAgICAgICAgICAgZm9vdGVyVmlldzogVG9vbGJveC5QYWdpbmF0aW9uLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgcGFnaW5hdGlvbiB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBmb290ZXJWaWV3T3B0aW9uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXJcbiAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXIgdGFnIG5hbWVcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMycsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXIgY2xhc3MgbmFtZVxuICAgICAgICAgICAgaGVhZGVyQ2xhc3NOYW1lOiAndGFibGUtaGVhZGVyJyxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGhlYWRlciB2aWV3IGNsYXNzXG4gICAgICAgICAgICBoZWFkZXJWaWV3OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGhlYWRlciB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBoZWFkZXJWaWV3T3B0aW9uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBkZXNjcmlwdGlvblxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgZGVzY3JpcHRpb24gdGFnXG4gICAgICAgICAgICBkZXNjcmlwdGlvblRhZzogJ3AnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgZGVzY3JpcHRpb24gdGFnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbkNsYXNzTmFtZTogJ2Rlc2NyaXB0aW9uIHJvdyBjb2wtc20tNicsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBjbGFzcyBuYW1lXG4gICAgICAgICAgICB0YWJsZUNsYXNzTmFtZTogJ3RhYmxlJyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGxvYWRpbmcgY2xhc3MgbmFtZVxuICAgICAgICAgICAgbG9hZGluZ0NsYXNzTmFtZTogJ2xvYWRpbmcnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1vZGVsIHN0b3JpbmcgdGhlIGNvbHVtbnNcbiAgICAgICAgICAgIGNoaWxkVmlld0NvbHVtbnNQcm9wZXJ0eTogJ2NvbHVtbnMnLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgIGluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdzbWFsbCdcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIHRhYmxlIHJvd3NcbiAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogJ05vIHJvd3MgZm91bmQnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbmFtZSBvZiB0aGUgY2xhc3MgYXBwZW5kZWQgdG8gdGhlIGJ1dHRvbnNcbiAgICAgICAgICAgIGJ1dHRvbkNsYXNzTmFtZTogJ2J0biBidG4tZGVmYXVsdCcsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgYnV0dG9uIG9iamVjdHNcbiAgICAgICAgICAgIC8vIHtocmVmOiAndGVzdC0xMjMnLCBsYWJlbDogJ1Rlc3QgMTIzJ31cbiAgICAgICAgICAgIGJ1dHRvbnM6IFtdXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLnNvcnQnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzb3J0OmNsaWNrJywgZSk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NsaWNrIC5idXR0b25zLXdyYXBwZXIgYSc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnV0dG9ucyA9IHRoaXMuZ2V0T3B0aW9uKCdidXR0b25zJyk7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAkKGUudGFyZ2V0KS5pbmRleCgpO1xuXG4gICAgICAgICAgICAgICAgaWYoXy5pc0FycmF5KGJ1dHRvbnMpICYmIGJ1dHRvbnNbaV0ub25DbGljaykge1xuICAgICAgICAgICAgICAgICAgICBidXR0b25zW2ldLm9uQ2xpY2suY2FsbCh0aGlzLCAkKGUudGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXJyZW50UGFnZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5jdXJyZW50X3BhZ2UgfHwgcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGFzdFBhZ2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UubGFzdF9wYWdlIHx8IHJlc3BvbnNlLmxhc3RQYWdlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEVtcHR5VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IFRvb2xib3guVGFibGVOb0l0ZW1zUm93LmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnM6IHRoaXMuZ2V0T3B0aW9uKCdjb2x1bW5zJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93SGVhZGVyVmlldygpO1xuICAgICAgICAgICAgdGhpcy5zaG93Qm9keVZpZXcoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2ZldGNoT25TaG93JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZldGNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Tb3J0Q2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0U29ydCA9ICdhc2MnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRPcmRlciA9IHRoaXMuZ2V0T3B0aW9uKCdvcmRlcicpLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTb3J0ID0gdGhpcy5nZXRPcHRpb24oJ3NvcnQnKSxcbiAgICAgICAgICAgICAgICBvcmRlciA9ICQoZS50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgICAgIGlmKGN1cnJlbnRPcmRlciA9PSBvcmRlcikge1xuICAgICAgICAgICAgICAgIGlmKCFjdXJyZW50U29ydCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc29ydCA9IGRlZmF1bHRTb3J0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHRoaXMuZ2V0T3B0aW9uKCdzb3J0JykgPT09ICdhc2MnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zb3J0ID0gJ2Rlc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9yZGVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zb3J0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9yZGVyID0gb3JkZXI7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNvcnQgPSBkZWZhdWx0U29ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNvcnQnKS5wYXJlbnQoKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc29ydC1hc2MnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc29ydC1kZXNjJyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzb3J0JykpIHtcbiAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnQoKS5hZGRDbGFzcygnc29ydC0nK3RoaXMuZ2V0T3B0aW9uKCdzb3J0JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmZldGNoKHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dIZWFkZXJWaWV3OiBmdW5jdGlvbihWaWV3KSB7XG4gICAgICAgICAgICBWaWV3ID0gVmlldyB8fCB0aGlzLmdldE9wdGlvbignaGVhZGVyVmlldycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q2hpbGRWaWV3KCdoZWFkZXInLCBuZXcgVmlldyhfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dCb2R5VmlldzogZnVuY3Rpb24oVmlldykge1xuICAgICAgICAgICAgVmlldyA9IFZpZXcgfHwgdGhpcy5nZXRPcHRpb24oJ2JvZHlWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldE9wdGlvbignY29sdW1ucycpXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2JvZHlWaWV3T3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2JvZHknLCB2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Rm9vdGVyVmlldzogZnVuY3Rpb24oVmlldykge1xuICAgICAgICAgICAgVmlldyA9IFZpZXcgfHwgdGhpcy5nZXRPcHRpb24oJ2Zvb3RlclZpZXcnKTtcblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFnZTogdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSxcbiAgICAgICAgICAgICAgICB0b3RhbFBhZ2VzOiB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignZm9vdGVyVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdwYWdpbmF0ZScsIGZ1bmN0aW9uKHBhZ2UsIHZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucGFnZSA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaCh0cnVlKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcoJ2Zvb3RlcicsIHZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdib2R5JykuY3VycmVudFZpZXcuY29sbGVjdGlvbi5yZXNldCgpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCd0YWJsZScpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdsb2FkaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB2YXIgQWN0aXZpdHlSb3cgPSBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYmxlLWFjdGl2aXR5LWluZGljYXRvci1yb3cnKSxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAndHInLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgXy5leHRlbmQodGhpcy5vcHRpb25zLCBzZWxmLmdldE9wdGlvbignaW5kaWNhdG9yT3B0aW9ucycpKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuY29sdW1ucyA9IHNlbGYuZ2V0T3B0aW9uKCdjb2x1bW5zJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRoZSBhY3Rpdml0eSBpbmRpY2F0b3IgaW5zdGFuY2UgdG8gYmUgcmVtb3ZlZCBsYXRlclxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9hY3Rpdml0eUluZGljYXRvciA9IHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdib2R5JykuY3VycmVudFZpZXcuYWRkQ2hpbGRWaWV3KG5ldyBBY3Rpdml0eVJvdyh7XG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICB0aGlzLiRlbC5maW5kKCd0YWJsZScpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdsb2FkaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9hY3Rpdml0eUluZGljYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdib2R5JykuY3VycmVudFZpZXcucmVtb3ZlQ2hpbGRWaWV3KHRoaXMuX2FjdGl2aXR5SW5kaWNhdG9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpdml0eUluZGljYXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJlcXVlc3REYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge30sIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbigncmVxdWVzdERhdGFPcHRpb25zJyk7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbignZGVmYXVsdFJlcXVlc3REYXRhT3B0aW9ucycpO1xuXG4gICAgICAgICAgICBfLmVhY2goKFtdKS5jb25jYXQoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYoIV8uaXNOdWxsKHRoaXMuZ2V0T3B0aW9uKG5hbWUpKSAmJiAhXy5pc1VuZGVmaW5lZCh0aGlzLmdldE9wdGlvbihuYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHRoaXMuZ2V0T3B0aW9uKG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoZGF0YSwgdGhpcy5nZXRPcHRpb24oJ3JlcXVlc3REYXRhJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU29ydENsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIG9yZGVyQnkgPSAkKGUudGFyZ2V0KS5kYXRhKCdpZCcpO1xuXG4gICAgICAgICAgICBfLmVhY2goKFtdKS5jb25jYXQoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYoIV8uaXNOdWxsKHRoaXMuZ2V0T3B0aW9uKG5hbWUpKSAmJiAhXy5pc1VuZGVmaW5lZCh0aGlzLmdldE9wdGlvbihuYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24obmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbbmFtZV0gPSB0aGlzLmdldE9wdGlvbihuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHNlbGYuZ2V0T3B0aW9uKCdzb3J0JykgPT09ICdhc2MnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub3B0aW9ucy5zb3J0ID0gJ2Rlc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vcHRpb25zLm9yZGVyQnkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vcHRpb25zLnNvcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNvcnQnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnc29ydC1hc2MnKS5yZW1vdmVDbGFzcygnc29ydC1kZXNjJyk7XG5cbiAgICAgICAgICAgIGlmKHNlbGYuZ2V0T3B0aW9uKCdzb3J0JykpIHtcbiAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnQoKS5hZGRDbGFzcygnc29ydC0nK3NlbGYuZ2V0T3B0aW9uKCdzb3J0JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLmZldGNoKHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2g6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hTdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLmdldEN1cnJlbnRQYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHZhciB0b3RhbFBhZ2VzID0gdGhpcy5nZXRMYXN0UGFnZShyZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmKGNvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RW1wdHlWaWV3KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50b3RhbFBhZ2VzID0gdG90YWxQYWdlcztcblxuICAgICAgICAgICAgdGhpcy5zaG93Rm9vdGVyVmlldygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hDb21wbGV0ZTogZnVuY3Rpb24oc3RhdHVzLCBjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXJyZW50UGFnZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5jdXJyZW50X3BhZ2UgfHwgcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGFzdFBhZ2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UubGFzdF9wYWdlIHx8IHJlc3BvbnNlLmxhc3RQYWdlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZldGNoOiBmdW5jdGlvbihyZXNldCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZihyZXNldCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goe1xuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZ2V0UmVxdWVzdERhdGEoKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbih4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi5nZXRPcHRpb24oJ3JlcXVlc3RIZWFkZXJzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZWFjaChzZWxmLmdldE9wdGlvbigncmVxdWVzdEhlYWRlcnMnKSwgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIHRydWUsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdmZXRjaDpzdWNjZXNzJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZmV0Y2g6Y29tcGxldGUnLCBmYWxzZSwgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZmV0Y2gnKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVGFiQ29udGVudCA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYi1jb250ZW50JyksXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0bmFtZTogZmFsc2UsXG5cblx0XHRcdGlkOiBmYWxzZSxcblxuXHRcdFx0Y29udGVudDogZmFsc2Vcblx0XHR9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXHRUb29sYm94LlRhYnMgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJzJyksXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayBbZGF0YS10b2dnbGU9XCJ0YWJcIl0nOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgndGFiOmNsaWNrJywgJChlLnRhcmdldCkuYXR0cignaHJlZicpKTtcblxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRjb250ZW50VmlldzogVG9vbGJveC5UYWJDb250ZW50LFxuXG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuXG4gICAgICAgICAgICB0YWJDbGFzc05hbWU6ICduYXYgbmF2LXRhYnMnLFxuXG5cdFx0XHR0YWJQYW5lQ2xhc3NOYW1lOiAndGFiLXBhbmUnLFxuXG5cdFx0XHRjb250ZW50OiBbXVxuXHRcdH0sXG5cblx0XHR0YWJWaWV3czogW10sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWaWV3TmFtZTogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcuZ2V0T3B0aW9uKCd0YWJOYW1lJykgPyB2aWV3LmdldE9wdGlvbigndGFiTmFtZScpIDogKFxuICAgICAgICAgICAgICAgIHZpZXcuZ2V0T3B0aW9uKCduYW1lJykgPyB2aWV3LmdldE9wdGlvbignbmFtZScpIDogbnVsbFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWaWV3TGFiZWw6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgIHJldHVybiB2aWV3LmdldE9wdGlvbigndGFiTGFiZWwnKSA/IHZpZXcuZ2V0T3B0aW9uKCd0YWJMYWJlbCcpIDogKFxuICAgICAgICAgICAgICAgIHZpZXcuZ2V0T3B0aW9uKCdsYWJlbCcpID8gdmlldy5nZXRPcHRpb24oJ2xhYmVsJykgOiBudWxsXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVRhYjogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldFZpZXdOYW1lKHZpZXcpO1xuXG4gICAgICAgIFx0dGhpcy4kZWwuZmluZCgnLm5hdi10YWJzJykuZmluZCgnW2hyZWY9XCIjJytuYW1lKydcIl0nKS5wYXJlbnQoKS5yZW1vdmUoKTtcblxuICAgICAgICBcdHRoaXMucmVnaW9uTWFuYWdlci5yZW1vdmVSZWdpb24obmFtZSk7XG5cbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcjJytuYW1lKS5yZW1vdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRUYWI6IGZ1bmN0aW9uKHZpZXcsIHNldEFjdGl2ZSkge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldFZpZXdOYW1lKHZpZXcpO1xuICAgICAgICBcdHZhciB0YWIgPSAnPGxpIHJvbGU9XCJwcmVzZW50YXRpb25cIj48YSBocmVmPVwiIycrbmFtZSsnXCIgYXJpYS1jb250cm9scz1cIicrbmFtZSsnXCIgcm9sZT1cInRhYlwiIGRhdGEtdG9nZ2xlPVwidGFiXCI+Jyt0aGlzLmdldFZpZXdMYWJlbCh2aWV3KSsnPC9hPjwvbGk+JztcblxuICAgICAgICBcdHZhciBodG1sID0gJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCInK3RoaXMuZ2V0T3B0aW9uKCd0YWJQYW5lQ2xhc3NOYW1lJykrJ1wiIGlkPVwiJytuYW1lKydcIiAvPic7XG5cbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcubmF2LXRhYnMnKS5hcHBlbmQodGFiKTtcbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcudGFiLWNvbnRlbnQnKS5hcHBlbmQoaHRtbCk7XG5cdFx0XHR0aGlzLmFkZFJlZ2lvbihuYW1lLCAnIycrbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnNob3dDaGlsZFZpZXcobmFtZSwgdmlldyk7XG5cblx0XHRcdGlmKHNldEFjdGl2ZSkge1xuXHRcdFx0XHR0aGlzLnNldEFjdGl2ZVRhYih2aWV3KTtcblx0XHRcdH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0Xy5lYWNoKHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50JyksIGZ1bmN0aW9uKG9iaiwgaSkge1xuICAgICAgICBcdFx0aWYob2JqLmNpZCkge1xuICAgICAgICBcdFx0XHR0aGlzLmFkZFRhYihvYmopO1xuICAgICAgICBcdFx0fVxuICAgICAgICBcdFx0ZWxzZSB7XG4gICAgICAgIFx0XHRcdHZhciBjb250ZW50VmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50VmlldycpO1xuXG5cdFx0XHRcdFx0aWYoXy5pc09iamVjdChvYmoudmlldykpIHtcblx0XHRcdFx0XHRcdGNvbnRlbnRWaWV3ID0gb2JqLnZpZXc7XG5cblx0XHRcdFx0XHRcdGRlbGV0ZSBvYmoudmlldztcblx0XHRcdFx0XHR9XG5cblx0ICAgICAgICBcdFx0dGhpcy5hZGRUYWIobmV3IGNvbnRlbnRWaWV3KG9iaikpO1xuICAgICAgICBcdFx0fVxuICAgICAgICBcdH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEFjdGl2ZVRhYjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgXHRpZihfLmlzT2JqZWN0KGlkKSkge1xuICAgICAgICBcdFx0aWQgPSBpZC5nZXRPcHRpb24oJ25hbWUnKTtcbiAgICAgICAgXHR9XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnW2hyZWY9XCInK2lkKydcIl0nKVxuICAgICAgICAgICAgICAgIC5wYXJlbnQoKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKGlkKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3NldDphY3RpdmU6dGFiJywgaWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRlbnRWaWV3OiBmdW5jdGlvbihpZCkge1xuICAgICAgICBcdGlmKHRoaXNbaWRdICYmIHRoaXNbaWRdLmN1cnJlbnRWaWV3KSB7XG4gICAgICAgIFx0XHRyZXR1cm4gdGhpc1tpZF0uY3VycmVudFZpZXc7XG4gICAgICAgIFx0fVxuXG4gICAgICAgIFx0cmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZighdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZVRhYicpKSB7XG5cdCAgICAgICAgXHR0aGlzLiRlbC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl06Zmlyc3QnKS5jbGljaygpO1xuXHQgICAgICAgIH1cblx0ICAgICAgICBlbHNlIHtcblx0ICAgICAgICBcdHRoaXMuc2V0QWN0aXZlVGFiKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVUYWInKSk7XG5cdCAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uVGFiQ2xpY2s6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIFx0dGhpcy5zZXRBY3RpdmVUYWIoaWQpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVGV4dEFyZWFGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tdGV4dGFyZWEtZmllbGQnKSxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB0cmlnZ2VyU2VsZWN0b3I6ICd0ZXh0YXJlYSdcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCd0ZXh0YXJlYScpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmQgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQnLFxuXG4gICAgXHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkJyksXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgcHJvZ3Jlc3M6ICcud2l6YXJkLXByb2dyZXNzJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcud2l6YXJkLWNvbnRlbnQnLFxuICAgICAgICAgICAgYnV0dG9uczogJy53aXphcmQtYnV0dG9ucydcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdrZXl1cCc6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3N1Ym1pdEZvcm1PbkVudGVyJykgJiYgZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnZm9ybScpLnN1Ym1pdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgaGVhZGVyVGFnTmFtZTogJ2gyJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJDbGFzc05hbWU6ICd3aXphcmQtaGVhZGVyJyxcbiAgICAgICAgICAgICAgICBmaW5pc2hlZENsYXNzTmFtZTogJ3dpemFyZC1maW5pc2hlZCcsXG4gICAgICAgICAgICAgICAgZml4ZWRIZWlnaHRDbGFzc05hbWU6ICdmaXhlZC1oZWlnaHQnLFxuICAgICAgICAgICAgICAgIGhhc1BhbmVsQ2xhc3NOYW1lOiAnd2l6YXJkLXBhbmVsJyxcbiAgICAgICAgICAgICAgICBwYW5lbENsYXNzTmFtZTogJ3BhbmVsIHBhbmVsLWRlZmF1bHQnLFxuICAgICAgICAgICAgICAgIGJ1dHRvblZpZXc6IFRvb2xib3guV2l6YXJkQnV0dG9ucyxcbiAgICAgICAgICAgICAgICBidXR0b25WaWV3T3B0aW9uczoge30sXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NWaWV3OiBUb29sYm94LldpemFyZFByb2dyZXNzLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzVmlld09wdGlvbnM6IHt9LFxuICAgICAgICAgICAgICAgIGhpZ2hlc3RTdGVwOiAxLFxuICAgICAgICAgICAgICAgIHN0ZXA6IDEsXG4gICAgICAgICAgICAgICAgc3RlcHM6IFtdLFxuICAgICAgICAgICAgICAgIGZpbmlzaGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzVmlldzogVG9vbGJveC5XaXphcmRTdWNjZXNzLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NWaWV3T3B0aW9uczoge30sXG4gICAgICAgICAgICAgICAgZXJyb3JWaWV3OiBUb29sYm94LldpemFyZEVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yVmlld09wdGlvbnM6IHt9LFxuICAgICAgICAgICAgICAgIHNob3dCdXR0b25zOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhbmVsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250ZW50SGVpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzdWJtaXRGb3JtT25FbnRlcjogZmFsc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICByZXNldFJlZ2lvbnM6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgIGlmKHZpZXcucmVnaW9ucyAmJiB2aWV3LnJlZ2lvbk1hbmFnZXIpIHtcbiAgICAgICAgICAgICAgICB2aWV3LnJlZ2lvbk1hbmFnZXIuZW1wdHlSZWdpb25zKCk7XG4gICAgICAgICAgICAgICAgdmlldy5yZWdpb25NYW5hZ2VyLmFkZFJlZ2lvbnModmlldy5yZWdpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb250ZW50SGVpZ2h0OiBmdW5jdGlvbihoZWlnaHQpIHtcbiAgICAgICAgICAgIGhlaWdodCB8fCAoaGVpZ2h0ID0gNDAwKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLndpemFyZC1jb250ZW50JylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2ZpeGVkSGVpZ2h0Q2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB2YXIgdmlldyA9IGZhbHNlLCBwcmV2U3RlcCA9IHRoaXMuZ2V0U3RlcCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcCA9IHBhcnNlSW50KHN0ZXApO1xuXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuc3RlcCA8IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcCA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgPiB0aGlzLmdldE9wdGlvbignaGlnaGVzdFN0ZXAnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oaWdoZXN0U3RlcCA9IHRoaXMuZ2V0T3B0aW9uKCdzdGVwJylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRSZWdpb24oJ2J1dHRvbnMnKS5jdXJyZW50Vmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdidXR0b25zJykuY3VycmVudFZpZXcucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHZpZXcgPSB0aGlzLmdldFN0ZXAoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NvbnRlbnQodmlldyk7XG4gICAgICAgICAgICAgICAgdmlldy50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6c2hvdzpzdGVwJywgdGhpcy5nZXRTdGVwKCksIHByZXZTdGVwLCB2aWV3KTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3Nob3c6c3RlcCcsIHRoaXMuZ2V0U3RlcCgpLCBwcmV2U3RlcCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1ZpZXc6IGZ1bmN0aW9uKFZpZXcsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDb250ZW50KG5ldyBWaWV3KG9wdGlvbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKG9wdGlvbnMsIHJlZ2lvbikge1xuICAgICAgICAgICAgcmVnaW9uIHx8IChyZWdpb24gPSB0aGlzLmdldFJlZ2lvbignY29udGVudCcpKTtcblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvcihfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAnbWVkaXVtJyxcbiAgICAgICAgICAgICAgICBtaW5IZWlnaHQ6ICc0MDBweCdcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpKTtcblxuICAgICAgICAgICAgcmVnaW9uLnNob3codmlldywge1xuICAgICAgICAgICAgICAgIHByZXZlbnREZXN0cm95OiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93UHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbigncHJvZ3Jlc3NWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbigncHJvZ3Jlc3NWaWV3T3B0aW9ucycpLCB7XG4gICAgICAgICAgICAgICAgICAgIHdpemFyZDogdGhpc1xuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygncHJvZ3Jlc3MnLCB2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGJ1dHRvbiB2aWV3IGlzIG5vdCBhIHZhbGlkIGNsYXNzLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2J1dHRvblZpZXcnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe30sIHRoaXMuZ2V0T3B0aW9uKCdidXR0b25WaWV3T3B0aW9ucycpLCB7XG4gICAgICAgICAgICAgICAgICAgIHdpemFyZDogdGhpc1xuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygnYnV0dG9ucycsIHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgYnV0dG9uIHZpZXcgaXMgbm90IGEgdmFsaWQgY2xhc3MuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0NvbnRlbnQ6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgIGlmKHZpZXcpIHtcbiAgICAgICAgICAgICAgICB2aWV3Lm9wdGlvbnMud2l6YXJkID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NoaWxkVmlldygnY29udGVudCcsIHZpZXcsIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlc3Ryb3k6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZpZXcub25jZSgnYXR0YWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRSZWdpb25zKHZpZXcpO1xuICAgICAgICAgICAgICAgICAgICB2aWV3LnRyaWdnZXJNZXRob2QoJ3dpemFyZDphdHRhY2gnKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0ZXBzJylbKHN0ZXAgfHwgdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSkgLSAxXTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRUb3RhbFN0ZXBzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NvbXBsZXRlOnN0ZXAnLCB0aGlzLmdldFN0ZXAoKSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0ZXAodGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSArIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgLSAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNob3dTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmdldFJlZ2lvbigncHJvZ3Jlc3MnKS5jdXJyZW50Vmlldy5zZXRBY3RpdmUoc3RlcC5nZXRPcHRpb24oJ3N0ZXAnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Db21wbGV0ZVN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdwcm9ncmVzcycpLmN1cnJlbnRWaWV3LnNldENvbXBsZXRlKHN0ZXAuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ3Byb2dyZXNzJykuY3VycmVudFZpZXcucmVuZGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25XaXphcmRFcnJvcjogZnVuY3Rpb24ob3B0aW9ucywgRXJyb3JWaWV3KSB7XG4gICAgICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHdpemFyZDogdGhpc1xuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2Vycm9yVmlld09wdGlvbnMnKSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoRXJyb3JWaWV3IHx8IHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXcnKSwgb3B0aW9ucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25XaXphcmRTdWNjZXNzOiBmdW5jdGlvbihvcHRpb25zLCBTdWNjZXNzVmlldykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICB3aXphcmQ6IHRoaXNcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdzdWNjZXNzVmlld09wdGlvbnMnKSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdidXR0b25zJykuZW1wdHkoKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGVwKys7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2ZpbmlzaGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ3Byb2dyZXNzJykuY3VycmVudFZpZXcuc2V0QWN0aXZlKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICAgICAgdGhpcy5zaG93VmlldyhTdWNjZXNzVmlldyB8fCB0aGlzLmdldE9wdGlvbignc3VjY2Vzc1ZpZXcnKSwgb3B0aW9ucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluaXNoOiBmdW5jdGlvbihzdWNjZXNzLCBvcHRpb25zLCBWaWV3KSB7XG4gICAgICAgICAgICBpZihfLmlzVW5kZWZpbmVkKHN1Y2Nlc3MpIHx8IHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NvbXBsZXRlOnN0ZXAnLCB0aGlzLmdldFN0ZXAoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6c3VjY2VzcycsIG9wdGlvbnMsIFZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6ZXJyb3InLCBvcHRpb25zLCBWaWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2NvbnRlbnRIZWlnaHQnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q29udGVudEhlaWdodCh0aGlzLmdldE9wdGlvbignY29udGVudEhlaWdodCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dQcm9ncmVzcycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93UHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dCdXR0b25zJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dCdXR0b25zKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdwYW5lbCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2hhc1BhbmVsQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0ZXAodGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUJ1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ2J1dHRvbnMnKS5jdXJyZW50Vmlldy5kaXNhYmxlQnV0dG9ucygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVOZXh0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdidXR0b25zJykuY3VycmVudFZpZXcuZGlzYWJsZU5leHRCdXR0b24oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlQmFja0J1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdldFJlZ2lvbignYnV0dG9ucycpLmN1cnJlbnRWaWV3LmRpc2FibGVCYWNrQnV0dG9uKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUZpbmlzaEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdldFJlZ2lvbignYnV0dG9ucycpLmN1cnJlbnRWaWV3LmRpc2FibGVGaW5pc2hCdXR0b24oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVnaW9uKCdidXR0b25zJykuY3VycmVudFZpZXcuZW5hYmxlQnV0dG9ucygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZU5leHRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ2J1dHRvbnMnKS5jdXJyZW50Vmlldy5lbmFibGVOZXh0QnV0dG9uKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlQmFja0J1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdldFJlZ2lvbignYnV0dG9ucycpLmN1cnJlbnRWaWV3LmVuYWJsZUJhY2tCdXR0b24oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVGaW5pc2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRSZWdpb24oJ2J1dHRvbnMnKS5jdXJyZW50Vmlldy5lbmFibGVGaW5pc2hCdXR0b24oKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oJCwgXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmRCdXR0b25zID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3dpemFyZC1idXR0b25zJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLWJ1dHRvbnMtd3JhcHBlciBjbGVhcmZpeCcsXG5cbiAgICAgICAgY2hhbm5lbE5hbWU6ICd0b29sYm94LndpemFyZCcsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN0ZXA6IGZhbHNlLFxuICAgICAgICAgICAgdG90YWxTdGVwczogZmFsc2UsXG4gICAgICAgICAgICB3aXphcmQ6IGZhbHNlLFxuICAgICAgICAgICAgYnV0dG9uU2l6ZUNsYXNzTmFtZTogJ2J0bi1tZCcsXG4gICAgICAgICAgICBkZWZhdWx0QnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcbiAgICAgICAgICAgIHByaW1hcnlCdXR0b25DbGFzc05hbWU6ICdidG4gYnRuLXByaW1hcnknLFxuICAgICAgICAgICAgZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICBsZWZ0QnV0dG9uczogW3tcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtbG9uZy1hcnJvdy1sZWZ0JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0JhY2snLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5nZXRDdXJyZW50U3RlcCgpID09IDEgPyAnZGlzYWJsZWQgJyA6ICcnXG4gICAgICAgICAgICAgICAgICAgICkgKyB0aGlzLnBhcmVudC5nZXREZWZhdWx0QnV0dG9uQ2xhc3NlcygnYmFjaycpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmJhY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHJpZ2h0QnV0dG9uczogW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0ZpbmlzaCcsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5wYXJlbnQuZ2V0Q3VycmVudFN0ZXAoKSAhPSB0aGlzLnBhcmVudC5nZXRUb3RhbFN0ZXBzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnaGlkZSc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuZ2V0UHJpbWFyeUJ1dHRvbkNsYXNzZXMoJ2ZpbmlzaCcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmZpbmlzaCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGljb246ICdmYSBmYS1sb25nLWFycm93LXJpZ2h0JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ05leHQnLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMucGFyZW50LmdldEN1cnJlbnRTdGVwKCkgPT0gdGhpcy5wYXJlbnQuZ2V0VG90YWxTdGVwcygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2hpZGUnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldERlZmF1bHRCdXR0b25DbGFzc2VzKCduZXh0Jyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2s6bmV4dCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLndpemFyZC1sZWZ0LWJ1dHRvbnMgYnV0dG9uJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciAkYnV0dG9uID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICRidXR0b24uaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKCRidXR0b24uaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggdGhpcy5nZXRPcHRpb24oJ2xlZnRCdXR0b25zJylbaW5kZXhdICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdsZWZ0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdsZWZ0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdjbGljayAud2l6YXJkLXJpZ2h0LWJ1dHRvbnMgYnV0dG9uJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciAkYnV0dG9uID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICRidXR0b24uaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKCRidXR0b24uaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggdGhpcy5nZXRPcHRpb24oJ3JpZ2h0QnV0dG9ucycpW2luZGV4XSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbigncmlnaHRCdXR0b25zJylbaW5kZXhdLm9uQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3JpZ2h0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLm9wdGlvbnMucmlnaHRCdXR0b25zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLm9wdGlvbnMubGVmdEJ1dHRvbnMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpdGVtLnBhcmVudCA9IHRoaXM7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVSaWdodEJ1dHRvbjogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIGlmKF8uaXNPYmplY3QoaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKHRoaXMub3B0aW9ucy5yaWdodEJ1dHRvbnMsIGZ1bmN0aW9uKGJ1dHRvbiwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZihidXR0b24gPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUmlnaHRCdXR0b24oaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yaWdodEJ1dHRvbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFkZFJpZ2h0QnV0dG9uOiBmdW5jdGlvbihidXR0b24sIGF0KSB7XG5cdFx0XHR2YXIgYnV0dG9ucyA9IF8uY2xvbmUodGhpcy5vcHRpb25zLnJpZ2h0QnV0dG9ucyk7XG5cbiAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQoYXQpKSB7XG4gICAgICAgICAgICAgICAgYXQgPSBidXR0b25zLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnV0dG9uLnBhcmVudCA9IHRoaXM7XG4gICAgICAgICAgICBidXR0b25zLnNwbGljZShhdCwgMCwgYnV0dG9uKTtcblxuXHRcdFx0dGhpcy5vcHRpb25zLnJpZ2h0QnV0dG9ucyA9IGJ1dHRvbnM7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUxlZnRCdXR0b246IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZihfLmlzT2JqZWN0KGluZGV4KSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0aGlzLm9wdGlvbnMubGVmdEJ1dHRvbnMsIGZ1bmN0aW9uKGJ1dHRvbiwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZihidXR0b24gPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTGVmdEJ1dHRvbihpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKF8uaXNOdW1iZXIoaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmxlZnRCdXR0b25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhZGRMZWZ0QnV0dG9uOiBmdW5jdGlvbihidXR0b24sIGF0KSB7XG5cdFx0XHR2YXIgYnV0dG9ucyA9IF8uY2xvbmUodGhpcy5vcHRpb25zLmxlZnRCdXR0b25zKTtcblxuICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZChhdCkpIHtcbiAgICAgICAgICAgICAgICBhdCA9IGJ1dHRvbnMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBidXR0b24ucGFyZW50ID0gdGhpcztcbiAgICAgICAgICAgIGJ1dHRvbnMuc3BsaWNlKGF0LCAwLCBidXR0b24pO1xuXG5cdFx0XHR0aGlzLm9wdGlvbnMubGVmdEJ1dHRvbnMgPSBidXR0b25zO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlQnV0dG9uOiBmdW5jdGlvbihidXR0b24pIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy4nK2J1dHRvbikuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN0ZXBzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignc3RlcHMnKSA/IHRoaXMuZ2V0T3B0aW9uKCdzdGVwcycpIDogKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKSA/IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXBzJykgOiBbXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXJyZW50U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSA/IHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgOiAoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpID8gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcCcpIDogMVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRUb3RhbFN0ZXBzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndG90YWxTdGVwcycpID8gdGhpcy5nZXRPcHRpb24oJ3RvdGFsU3RlcHMnKSA6IChcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykgPyB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdzdGVwcycpLmxlbmd0aCA6IDFcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0ZXAgPSB0aGlzLmdldEN1cnJlbnRTdGVwKCk7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSB0aGlzLmdldFRvdGFsU3RlcHMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc0ZpcnN0U3RlcDogc3RlcCA9PSAxLFxuICAgICAgICAgICAgICAgIGlzTGFzdFN0ZXA6IHN0ZXAgPT0gdG90YWwsXG4gICAgICAgICAgICAgICAgdG90YWxTdGVwczogdG90YWxcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5vcHRpb25zKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrQmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IHRoaXMuZ2V0Q3VycmVudFN0ZXAoKTtcbiAgICAgICAgICAgIHZhciBzdGVwcyA9IHRoaXMuZ2V0U3RlcHMoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoKS50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6Y2xpY2s6YmFjaycsIHN0ZXBzW3N0ZXAgLSAxXSk7XG5cbiAgICAgICAgICAgICAgICBpZihfLmlzVW5kZWZpbmVkKHJlc3BvbnNlKSB8fCByZXNwb25zZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGVwLS07XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrTmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IHRoaXMuZ2V0Q3VycmVudFN0ZXAoKTtcbiAgICAgICAgICAgIHZhciBzdGVwcyA9IHRoaXMuZ2V0U3RlcHMoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoKS50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6Y2xpY2s6bmV4dCcsIHN0ZXBzW3N0ZXAgKyAxXSk7XG5cbiAgICAgICAgICAgICAgICBpZihfLmlzVW5kZWZpbmVkKHJlc3BvbnNlKSB8fCByZXNwb25zZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGVwKys7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrRmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGVwID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBzdGVwLnRyaWdnZXJNZXRob2QoJ3dpemFyZDpjbGljazpmaW5pc2gnLCBzdGVwKTtcblxuICAgICAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQocmVzcG9uc2UpIHx8IHJlc3BvbnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5maW5pc2goKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcCA9IHRoaXMuZ2V0VG90YWxTdGVwcygpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGVmYXVsdEJ1dHRvbkNsYXNzZXM6IGZ1bmN0aW9uKGFwcGVuZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdkZWZhdWx0QnV0dG9uQ2xhc3NOYW1lJykgKyAnICcgKyB0aGlzLmdldE9wdGlvbignYnV0dG9uU2l6ZUNsYXNzTmFtZScpICsgJyAnICsgKGFwcGVuZCB8fCAnJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UHJpbWFyeUJ1dHRvbkNsYXNzZXM6IGZ1bmN0aW9uKGFwcGVuZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwcmltYXJ5QnV0dG9uQ2xhc3NOYW1lJykgKyAnICcgKyB0aGlzLmdldE9wdGlvbignYnV0dG9uU2l6ZUNsYXNzTmFtZScpICsgJyAnICsgKGFwcGVuZCB8fCAnJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUJ1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnYnV0dG9uJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVOZXh0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5uZXh0JykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVCYWNrQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5iYWNrJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVGaW5pc2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmZpbmlzaCcpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2J1dHRvbicpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVOZXh0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5uZXh0JykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUJhY2tCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmJhY2snKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlRmluaXNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5maW5pc2gnKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LldpemFyZEVycm9yID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLWVycm9yJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLWVycm9yJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMycsXG4gICAgICAgICAgICBoZWFkZXI6ICdFcnJvciEnLFxuICAgICAgICAgICAgZXJyb3JJY29uOiAnZmEgZmEtdGltZXMnLFxuICAgICAgICAgICAgbWVzc2FnZTogZmFsc2UsXG4gICAgICAgICAgICBzaG93QmFja0J1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJhY2tCdXR0b25DbGFzc05hbWU6ICdidG4gYnRuLWxnIGJ0bi1wcmltYXJ5JyxcbiAgICAgICAgICAgIGJhY2tCdXR0b25MYWJlbDogJ0dvIEJhY2snLFxuICAgICAgICAgICAgYmFja0J1dHRvbkljb246ICdmYSBmYS1sb25nLWFycm93LWxlZnQnLFxuICAgICAgICAgICAgb25DbGlja0JhY2s6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayBidXR0b24nOiAnY2xpY2s6YmFjaydcbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tCYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCB0aGlzLmdldE9wdGlvbignb25DbGlja0JhY2snKSAmJiBfLmlzRnVuY3Rpb24odGhpcy5nZXRPcHRpb24oJ29uQ2xpY2tCYWNrJykpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ29uQ2xpY2tCYWNrJykuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5zaG93QnV0dG9ucygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKSAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbigkLCBfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guV2l6YXJkUHJvZ3Jlc3MgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd3aXphcmQtcHJvZ3Jlc3MnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQtcHJvZ3Jlc3Mtd3JhcHBlcicsXG5cbiAgICAgICAgY2hhbm5lbE5hbWU6ICd0b29sYm94LndpemFyZCcsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHdpemFyZDogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG4gICAgICAgICAgICBjb21wbGV0ZUNsYXNzTmFtZTogJ2NvbXBsZXRlJyxcbiAgICAgICAgICAgIGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLndpemFyZC1zdGVwJzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHN0ZXAgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBzdGVwID0gJHN0ZXAuZGF0YSgnc3RlcCcpO1xuXG4gICAgICAgICAgICAgICAgaWYoICEkc3RlcC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ2ZpbmlzaGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLnNldFN0ZXAoc3RlcCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKSwgZnVuY3Rpb24oc3RlcCwgaSkge1xuICAgICAgICAgICAgICAgIHN0ZXAub3B0aW9ucy5sYWJlbCA9IHN0ZXAuZ2V0T3B0aW9uKCdsYWJlbCcpIHx8IHN0ZXAubGFiZWw7XG4gICAgICAgICAgICAgICAgc3RlcC5vcHRpb25zLnRpdGxlID0gc3RlcC5nZXRPcHRpb24oJ3RpdGxlJykgfHwgc3RlcC50aXRsZTtcbiAgICAgICAgICAgICAgICBzdGVwLm9wdGlvbnMuc3RlcCA9IGkgKyAxO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB0aGlzLmdldE9wdGlvbignd2l6YXJkJykub3B0aW9ucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RGlzYWJsZWQ6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcDpsdCgnK3N0ZXArJyknKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q29tcGxldGU6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoc3RlcCk7XG5cbiAgICAgICAgICAgIHZpZXcub3B0aW9ucy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcDpsdCgnKyhzdGVwIC0gMSkrJyknKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignY29tcGxldGVDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcud2l6YXJkLXN0ZXA6bnRoLWNoaWxkKCcrc3RlcCsnKScpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFdpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcCcpLmNzcygnd2lkdGgnLCAoMTAwIC8gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGgpICsgJyUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRXaWR0aCgpO1xuICAgICAgICAgICAgdGhpcy5zZXREaXNhYmxlZCh0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdoaWdoZXN0U3RlcCcpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmRTdWNjZXNzID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLXN1Y2Nlc3MnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQtc3VjY2VzcycsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMycsXG4gICAgICAgICAgICBoZWFkZXI6ICdTdWNjZXNzIScsXG4gICAgICAgICAgICBzdWNjZXNzSWNvbjogJ2ZhIGZhLWNoZWNrJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiJdfQ==
