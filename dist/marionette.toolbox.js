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
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "		<button type=\"button\" class=\""
    + alias2(alias1((depths[1] != null ? depths[1].buttonClassName : depths[1]), depth0))
    + "\">"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].buttonIcon : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + alias2(alias1((depths[1] != null ? depths[1].buttonLabel : depths[1]), depth0))
    + "</button>\n		<button type=\"button\" class=\""
    + alias2(alias1((depths[1] != null ? depths[1].buttonClassName : depths[1]), depth0))
    + " "
    + alias2(alias1((depths[1] != null ? depths[1].buttonToggleClassName : depths[1]), depth0))
    + "\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n			<span class=\"caret\"></span>\n			<span class=\"sr-only\">Toggle Dropdown</span>\n		</button>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<i class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].buttonIcon : depths[2]), depth0))
    + "\"></i>";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "		<button type=\"button\" class=\""
    + alias2(alias1((depths[1] != null ? depths[1].buttonClassName : depths[1]), depth0))
    + " "
    + alias2(alias1((depths[1] != null ? depths[1].buttonToggleClassName : depths[1]), depth0))
    + "\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n			"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].buttonIcon : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n			"
    + alias2(alias1((depths[1] != null ? depths[1].buttonLabel : depths[1]), depth0))
    + "\n			<span class=\"caret\"></span>\n			<span class=\"sr-only\">Toggle Dropdown</span>\n		</button>\n";
},"8":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].menuClassName : depths[1]), depth0));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"btn-group "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.dropUp : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.splitButton : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.splitButton : depth0),{"name":"not","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n	<ul class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.menuClassName : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></ul>\n</div>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["button-group-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<i class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].icon : depths[1]), depth0))
    + "\"></i> ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)));
},"useData":true,"useDepths":true});
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
this["Toolbox"]["templates"]["form-checkbox-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "	<p "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].descriptionClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].description : depths[1]), depth0))
    + "</p>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].descriptionClassName : depths[2]), depth0))
    + "\"";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "	<div class=\""
    + alias2(alias1((depths[1] != null ? depths[1].inputClassName : depths[1]), depth0))
    + "\">\n		<label "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].labelClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><input type=\""
    + alias2(alias1((depths[1] != null ? depths[1].type : depths[1]), depth0))
    + "\" name=\""
    + alias2(alias1((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "\" value=\""
    + alias2(alias1((depths[1] != null ? depths[1].value : depths[1]), depth0))
    + "\"></label>\n	</div>\n";
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].labelClassName : depths[2]), depth0))
    + "\"";
},"9":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers.blockHelperMissing.call(depth0,container.lambda((depths[1] != null ? depths[1].options : depths[1]), depth0),{"name":"../options","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing, alias5="function";

  return "	<div class=\""
    + alias2(alias1((depths[2] != null ? depths[2].inputClassName : depths[2]), depth0))
    + "\">\n		<label "
    + ((stack1 = helpers["if"].call(alias3,(depths[2] != null ? depths[2].labelClassName : depths[2]),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><input type=\""
    + alias2(alias1((depths[2] != null ? depths[2].type : depths[2]), depth0))
    + "\" name=\""
    + alias2(alias1((depths[2] != null ? depths[2].name : depths[2]), depth0))
    + "[]\" value=\""
    + alias2(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"value","hash":{},"data":data}) : helper)))
    + "\"> "
    + alias2(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n	</div>\n";
},"11":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[3] != null ? depths[3].labelClassName : depths[3]), depth0))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.options : depth0),{"name":"not","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.options : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["dropdown-menu-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "	<a href=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].href : depths[1]), depth0))
    + "\">"
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].icon : depths[1]),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].value : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].label : depths[1]),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</a>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<i class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].icon : depths[2]), depth0))
    + "\"></i> ";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[2] != null ? depths[2].value : depths[2]), depth0));
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[2] != null ? depths[2].label : depths[2]), depth0));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = (helpers.not || (depth0 && depth0.not) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.divider : depth0),{"name":"not","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["dropdown-menu-no-items"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
this["Toolbox"]["templates"]["dropdown-menu"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].menuClassName : depths[1]), depth0));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\"#\" class=\""
    + alias4(((helper = (helper = helpers.toggleClassName || (depth0 != null ? depth0.toggleClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"toggleClassName","hash":{},"data":data}) : helper)))
    + "\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">"
    + alias4(((helper = (helper = helpers.toggleLabel || (depth0 != null ? depth0.toggleLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"toggleLabel","hash":{},"data":data}) : helper)))
    + " <i class=\""
    + alias4(((helper = (helper = helpers.toggleIconClassName || (depth0 != null ? depth0.toggleIconClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"toggleIconClassName","hash":{},"data":data}) : helper)))
    + "\"></i></a>\n\n<ul class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.menuClassName : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></ul>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["inline-editor"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"inline-editor-label\"></div>\n\n<i class=\"fa fa-pencil inline-editor-edit-icon\"></i>\n\n<div class=\"inline-editor-field\"></div>\n\n<div class=\"inline-editor-activity-indicator\"></div>";
},"useData":true});
this["Toolbox"]["templates"]["form-input-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "	<label "
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].id : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].labelClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].label : depths[1]), depth0))
    + "</label>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "id=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].id : depths[2]), depth0))
    + "\"";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].labelClassName : depths[2]), depth0))
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
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<input type=\""
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\""
    + alias4(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + "\" />";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["form-light-switch-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<label for=\""
    + alias2(alias1((depths[1] != null ? depths[1].id : depths[1]), depth0))
    + "\" class=\""
    + alias2(alias1((depths[1] != null ? depths[1].labelClassName : depths[1]), depth0))
    + "\">"
    + alias2(alias1((depths[1] != null ? depths[1].label : depths[1]), depth0))
    + "</label>\n";
},"5":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "	<p "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].descriptionClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].description : depths[1]), depth0))
    + "</p>\n";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].descriptionClassName : depths[2]), depth0))
    + "\"";
},"8":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].activeClassName : depths[1]), depth0));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<div class=\""
    + alias4(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || alias2).call(alias1,(depth0 != null ? depth0.value : depth0),1,{"name":"is","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" tabindex=\"0\">\n	<div class=\"light-switch-container\">\n		<div class=\"light-switch-label on\"></div>\n		<div class=\"light-switch-handle\"></div>\n		<div class=\"light-switch-label off\"></div>\n	</div>\n</div>\n\n<input type=\"hidden\" name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\" id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["list-group-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "	<span class=\"badge\">"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].badge : depths[1]), depth0))
    + "</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.badge : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["no-list-group-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    No items found.\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return ((stack1 = (helpers.not || (depth0 && depth0.not) || alias2).call(alias1,(depth0 != null ? depth0.message : depth0),{"name":"not","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"useData":true});
this["Toolbox"]["templates"]["modal-window"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "	<h3 class=\"modal-header\">"
    + container.escapeExpression(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"header","hash":{},"data":data}) : helper)))
    + "</h3>\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, buffer = 
  "		<div class=\"modal-buttons\">\n";
  stack1 = ((helper = (helper = helpers.buttons || (depth0 != null ? depth0.buttons : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"buttons","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.buttons) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "		</div>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "			<a href=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.href : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" class=\""
    + alias4(((helper = (helper = helpers.className || (depth0 != null ? depth0.className : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"className","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"5":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].href : depths[1]), depth0));
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"";
},"9":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<span class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].icon : depths[1]), depth0))
    + "\"></span> ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"modal-window\">\n	<a href=\"#\" class=\"modal-close\"><i class=\"fa fa-times-circle\"></i></a>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n	<div class=\"modal-content clearfix\"></div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.buttons : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["notification"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "	<div class=\"col-sm-2\">\n		<i class=\"fa fa-"
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + " icon\"></i>\n	</div>\n	<div class=\"col-lg-10\">\n		"
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].title : depths[1]),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n		"
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].message : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n	</div>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<h3>"
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].title : depths[2]), depth0))
    + "</h3>";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<p>"
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].message : depths[2]), depth0))
    + "</p>";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "	<div class=\"col-lg-12\">\n		"
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].title : depths[1]),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n		"
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].message : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n	</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<a href=\"#\" class=\"close\"><i class=\"fa fa-times-circle\"></i></a>\n\n<div class=\"row\">\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"not","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n</div>";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["no-ordered-list-item"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["ordered-list-item"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true});
this["Toolbox"]["templates"]["pager"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].prevClassName : depths[1]), depth0));
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "		<li class=\"page-totals\">Page "
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].page : depths[1]), depth0))
    + " of "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].totalPages : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</li>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[2] != null ? depths[2].totalPages : depths[2]), depth0));
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].nextClassName : depths[1]), depth0));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<ul class=\""
    + alias4(((helper = (helper = helpers.pagerClassName || (depth0 != null ? depth0.pagerClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pagerClassName","hash":{},"data":data}) : helper)))
    + "\">\n	<li class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.snapToEdges : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"><a href=\"#\" class=\"prev-page\"><i class=\"fa fa-long-arrow-left\" aria-hidden=\"true\"></i> "
    + alias4(((helper = (helper = helpers.prevLabel || (depth0 != null ? depth0.prevLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"prevLabel","hash":{},"data":data}) : helper)))
    + "</a></li>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.includePageTotals : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	<li class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.snapToEdges : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"><a href=\"#\" class=\"next-page\">"
    + alias4(((helper = (helper = helpers.nextLabel || (depth0 != null ? depth0.nextLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nextLabel","hash":{},"data":data}) : helper)))
    + " <i class=\"fa fa-long-arrow-right\" aria-hidden=\"true\"></i></a></li>\n</ul>";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["pagination-item"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=container.lambda, alias3=container.escapeExpression;

  return "	<a href=\""
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].href : depths[1]),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || helpers.helperMissing).call(alias1,(depths[1] != null ? depths[1].href : depths[1]),{"name":"not","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" data-page=\""
    + alias3(alias2((depths[1] != null ? depths[1].page : depths[1]), depth0))
    + "\">"
    + alias3(alias2((depths[1] != null ? depths[1].page : depths[1]), depth0))
    + "</a>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[2] != null ? depths[2].href : depths[2]), depth0));
},"4":function(container,depth0,helpers,partials,data) {
    return "#";
},"6":function(container,depth0,helpers,partials,data) {
    return "	<a>&hellip;</a>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = (helpers.not || (depth0 && depth0.not) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.divider : depth0),{"name":"not","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.divider : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["pagination"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<ul class=\"pagination "
    + container.escapeExpression(((helper = (helper = helpers.paginationClassName || (depth0 != null ? depth0.paginationClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"paginationClassName","hash":{},"data":data}) : helper)))
    + "\">\n	<li>\n		<a href=\"#\" class=\"prev-page\" aria-label=\"Previous\">\n			<span aria-hidden=\"true\">&laquo;</span>\n		</a>\n	</li>\n    <li>\n		<a href=\"#\" class=\"next-page\" aria-label=\"Next\">\n			<span aria-hidden=\"true\">&raquo;</span>\n		</a>\n    </li>\n</ul>";
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
this["Toolbox"]["templates"]["form-radio-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "	<p "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].descriptionClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].description : depths[1]), depth0))
    + "</p>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].descriptionClassName : depths[2]), depth0))
    + "\"";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "	<div class=\""
    + alias2(alias1((depths[1] != null ? depths[1].inputClassName : depths[1]), depth0))
    + "\">\n		<label "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].labelClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><input type=\""
    + alias2(alias1((depths[1] != null ? depths[1].type : depths[1]), depth0))
    + "\" name=\""
    + alias2(alias1((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "\" value=\""
    + alias2(alias1((depths[1] != null ? depths[1].value : depths[1]), depth0))
    + "\"></label>\n	</div>\n";
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].labelClassName : depths[2]), depth0))
    + "\"";
},"9":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers.blockHelperMissing.call(depth0,container.lambda((depths[1] != null ? depths[1].options : depths[1]), depth0),{"name":"../options","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing, alias5="function";

  return "	<div class=\""
    + alias2(alias1((depths[2] != null ? depths[2].inputClassName : depths[2]), depth0))
    + "\">\n		<label "
    + ((stack1 = helpers["if"].call(alias3,(depths[2] != null ? depths[2].labelClassName : depths[2]),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><input type=\""
    + alias2(alias1((depths[2] != null ? depths[2].type : depths[2]), depth0))
    + "\" name=\""
    + alias2(alias1((depths[2] != null ? depths[2].name : depths[2]), depth0))
    + "[]\" value=\""
    + alias2(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"value","hash":{},"data":data}) : helper)))
    + "\"> "
    + alias2(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n	</div>\n";
},"11":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[3] != null ? depths[3].labelClassName : depths[3]), depth0))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.options : depth0),{"name":"not","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.options : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["range-slider"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"slider\"></div>";
},"useData":true});
this["Toolbox"]["templates"]["form-select-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "	<label "
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].id : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].labelClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].label : depths[1]), depth0))
    + "</label>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "id=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].id : depths[2]), depth0))
    + "\"";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].labelClassName : depths[2]), depth0))
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
},"17":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "	<option "
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || alias2).call(alias1,(depth0 != null ? depth0.value : depth0),"!==",undefined,{"name":"is","hash":{},"fn":container.program(18, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.selected : depth0),{"name":"if","hash":{},"fn":container.program(20, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || alias2).call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"not","hash":{},"fn":container.program(24, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</option>\n";
},"18":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "value=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].value : depths[1]), depth0))
    + "\"";
},"20":function(container,depth0,helpers,partials,data) {
    return "selected=\"selected\"";
},"22":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = container.lambda((depths[1] != null ? depths[1].label : depths[1]), depth0)) != null ? stack1 : "");
},"24":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = container.lambda((depths[1] != null ? depths[1].value : depths[1]), depth0)) != null ? stack1 : "");
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

  return "<div class=\"row selection-pool-search\">\n    <div class=\"col-sm-12\">\n        <div class=\"selection-pool-search-field\">\n            <div class=\"selection-pool-search-activity\"></div>\n            <a href=\"#\" class=\"selection-pool-search-clear\"><i class=\"fa fa-times-circle\"></i></a>\n            <input type=\"text\" value=\"\" placeholder=\"Enter keywords to search the list\" class=\"search form-control\">\n        </div>\n    </div>\n</div>\n\n<div class=\"row selection-pool-lists\">\n    <div class=\"col-sm-6\">\n        <div class=\"available-pool droppable-pool\" data-accept=\".selected-pool .draggable-tree-node\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.height : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></div>\n    </div>\n    <div class=\"col-sm-6\">\n        <div class=\"selected-pool droppable-pool\" data-accept=\".available-pool .draggable-tree-node\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.height : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></div>\n    </div>\n</div>\n";
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
this["Toolbox"]["templates"]["table-view-footer"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].totalPages : depths[1]), depth0));
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].page : depths[1]), depth0));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : {}, alias3=helpers.helperMissing;

  return "<td colspan=\""
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.columns : depth0)) != null ? stack1.length : stack1), depth0))
    + "\" class=\"page-totals\">\n    Page "
    + alias1(((helper = (helper = helpers.page || (depth0 != null ? depth0.page : depth0)) != null ? helper : alias3),(typeof helper === "function" ? helper.call(alias2,{"name":"page","hash":{},"data":data}) : helper)))
    + " of "
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.totalPages : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || alias3).call(alias2,(depth0 != null ? depth0.totalPages : depth0),{"name":"not","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n</td>";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["table-view-group"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "<div class=\"buttons-wrapper pull-right\">\n"
    + ((stack1 = helpers.blockHelperMissing.call(depth0,container.lambda((depths[1] != null ? depths[1].buttons : depths[1]), depth0),{"name":"../buttons","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "		<a href=\""
    + alias4(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"href","hash":{},"data":data}) : helper)))
    + "\" class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.className : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || alias2).call(alias1,(depth0 != null ? depth0.className : depth0),{"name":"not","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[1] != null ? depths[1].className : depths[1]), depth0));
},"5":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[2] != null ? depths[2].buttonClassName : depths[2]), depth0));
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<i class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].icon : depths[1]), depth0))
    + "\"></i>";
},"9":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + " class=\""
    + alias2(alias1((depths[1] != null ? depths[1].headerClassName : depths[1]), depth0))
    + "\">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">\n";
},"11":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<"
    + alias2(alias1((depths[1] != null ? depths[1].descriptionTag : depths[1]), depth0))
    + " class=\""
    + alias2(alias1((depths[1] != null ? depths[1].descriptionClassName : depths[1]), depth0))
    + "\">"
    + alias2(alias1((depths[1] != null ? depths[1].description : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].descriptionTag : depths[1]), depth0))
    + ">\n";
},"13":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "			<th scope=\"col\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.width : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.className : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || alias2).call(alias1,(depth0 != null ? depth0.id : depth0),(depths[1] != null ? depths[1].order : depths[1]),{"name":"is","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(18, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || alias2).call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"not","hash":{},"fn":container.program(20, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "			</th>\n";
},"14":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "width=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].width : depths[1]), depth0))
    + "\"";
},"16":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "sort-"
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].sort : depths[2]), depth0));
},"18":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda;

  return "					<a href=\"#\" data-id=\""
    + container.escapeExpression(alias1((depths[1] != null ? depths[1].id : depths[1]), depth0))
    + "\" class=\"sort\">"
    + ((stack1 = alias1((depths[1] != null ? depths[1].name : depths[1]), depth0)) != null ? stack1 : "")
    + "</a>\n					<i class=\"sort-icon asc fa fa-sort-asc\"></i>\n					<i class=\"sort-icon desc fa fa-sort-desc\"></i>\n";
},"20":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "					"
    + ((stack1 = container.lambda((depths[1] != null ? depths[1].name : depths[1]), depth0)) != null ? stack1 : "")
    + "\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer = 
  ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.buttons : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<table class=\""
    + container.escapeExpression(((helper = (helper = helpers.tableClassName || (depth0 != null ? depth0.tableClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tableClassName","hash":{},"data":data}) : helper)))
    + "\">\n	<thead>\n		<tr>\n";
  stack1 = ((helper = (helper = helpers.columns || (depth0 != null ? depth0.columns : depth0)) != null ? helper : alias2),(options={"name":"columns","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.columns) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "		</tr>\n	</thead>\n	<tbody></tbody>\n	<tfoot></tfoot>\n</table>\n";
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
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.columns || (depth0 != null ? depth0.columns : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"columns","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.columns) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["form-textarea-field"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "	<label "
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].id : depths[1]),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].labelClassName : depths[1]),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].label : depths[1]), depth0))
    + "</label>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "id=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].id : depths[2]), depth0))
    + "\"";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].labelClassName : depths[2]), depth0))
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
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<textarea "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\""
    + container.escapeExpression(((helper = (helper = helpers.inputClassName || (depth0 != null ? depth0.inputClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"inputClassName","hash":{},"data":data}) : helper)))
    + "\"></textarea>";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["draggable-tree-view-node"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <ul class=\"children\"></ul>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<i class=\"fa fa-bars drag-handle\"></i>\n\n<div class=\"node-name\">\n    <span>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>\n</div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasChildren : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
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
    return container.escapeExpression(container.lambda((depths[2] != null ? depths[2].disabledClassName : depths[2]), depth0));
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<i class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].icon : depths[1]), depth0))
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
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return " <i class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].icon : depths[1]), depth0))
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
this["Toolbox"]["templates"]["wizard-error"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<div class=\"wizard-error-icon\"><i class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].errorIcon : depths[1]), depth0))
    + "\"></i></div>";
},"5":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "<p>"
    + ((stack1 = container.lambda((depths[1] != null ? depths[1].message : depths[1]), depth0)) != null ? stack1 : "")
    + "</p>";
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "    <ul class=\"wizard-error-list\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].errors : depths[1]),{"name":"each","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </ul>\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "        <li>"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</li>\n";
},"10":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<button type=\"button\" class=\""
    + alias2(alias1((depths[1] != null ? depths[1].backButtonClassName : depths[1]), depth0))
    + "\">"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].backButtonIcon : depths[1]),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + alias2(alias1((depths[1] != null ? depths[1].backButtonLabel : depths[1]), depth0))
    + "</button>\n";
},"11":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<i class=\""
    + container.escapeExpression(container.lambda((depths[2] != null ? depths[2].backButtonIcon : depths[2]), depth0))
    + "\"></i> ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.errorIcon : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.message : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.errors : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.showBackButton : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["wizard-progress"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "    <a class=\"wizard-step "
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || alias2).call(alias1,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.complete : stack1),{"name":"not","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.complete : stack1),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" data-step=\""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.step : stack1), depth0))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.title : stack1),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.label : stack1),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || alias2).call(alias1,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.label : stack1),{"name":"not","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </a>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[2] != null ? depths[2].disabledClassName : depths[2]), depth0));
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return container.escapeExpression(container.lambda((depths[2] != null ? depths[2].completeClassName : depths[2]), depth0));
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "title=\""
    + container.escapeExpression(container.lambda(((stack1 = (depths[1] != null ? depths[1].options : depths[1])) != null ? stack1.title : stack1), depth0))
    + "\"";
},"8":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "            <span class=\"wizard-step-label\">"
    + container.escapeExpression(container.lambda(((stack1 = (depths[1] != null ? depths[1].options : depths[1])) != null ? stack1.label : stack1), depth0))
    + "</span>\n";
},"10":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = (depths[1] != null ? depths[1].options : depths[1])) != null ? stack1.title : stack1),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "                <span class=\"wizard-step-label\">"
    + container.escapeExpression(container.lambda(((stack1 = (depths[2] != null ? depths[2].options : depths[2])) != null ? stack1.title : stack1), depth0))
    + "</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, buffer = 
  "<div class=\"wizard-progress-bar\">\n";
  stack1 = ((helper = (helper = helpers.steps || (depth0 != null ? depth0.steps : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"steps","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.steps) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["wizard-success"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<div class=\"wizard-success-icon\"><i class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].successIcon : depths[1]), depth0))
    + "\"></i></div>";
},"5":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<p>"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].message : depths[1]), depth0))
    + "</p>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.successIcon : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.message : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"useData":true,"useDepths":true});
this["Toolbox"]["templates"]["wizard"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "<div class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].panelClassName : depths[1]), depth0))
    + "\">\n    <div class=\"panel-body\">\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "            <"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + " class=\""
    + alias2(alias1((depths[1] != null ? depths[1].headerClassName : depths[1]), depth0))
    + "\">"
    + alias2(alias1((depths[1] != null ? depths[1].header : depths[1]), depth0))
    + "</"
    + alias2(alias1((depths[1] != null ? depths[1].headerTagName : depths[1]), depth0))
    + ">\n";
},"5":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "            <p>"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].description : depths[1]), depth0))
    + "</p>\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "    </div>\n    <div class=\"wizard-buttons\"></div>\n</div>\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "<div class=\"wizard-buttons\"></div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.panel : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        <div class=\"wizard-progress\"></div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        <div class=\"wizard-content\"></div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.panel : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.not || (depth0 && depth0.not) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.panel : depth0),{"name":"not","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
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

    /*
    Handlebars.registerHelper('nl2br', function(text) {
        var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
        return new Handlebars.SafeString(nl2br);
    });

    Handlebars.registerHelper('log', function() {
        console.log(['Values:'].concat(
            Array.prototype.slice.call(arguments, 0, -1)
        ));
    });

    Handlebars.registerHelper('debug', function() {
        console.log('Context:', this);
        console.log(['Values:'].concat(
            Array.prototype.slice.call(arguments, 0, -1)
        ));
    });
	*/

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
                data.each(function(model) {
                    if(model) {
                        var parentId = this.getParentId(model);
                        var parent = this.findNodeById(parentId);

                        if(_.isNull(parentId)) {
                            data.remove(this.appendNode(model));
                        }
                        else if (parent = this.findNodeById(parentId)) {
                            data.remove(this.appendNode(model, parent));
                        }
                    }
                }, this);

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
                model.set('order', i + 1);

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

            //this.channelName = _.result(this, 'channelName') || _.result(this.options, 'channelName') || 'global';
            //this.channel = _.result(this, 'channel') || _.result(this.options, 'channel') || Radio.channel(this.channelName);
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
            window.location = this.getRedirect();
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

		childEvents: {
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

		className: 'no-results'

	});

	Toolbox.DropdownMenuItem = Toolbox.View.extend({

		tagName: 'li',

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
            }
        },

		onDomRefresh: function() {
			if(this.model.get('divider') === true) {
				this.$el.addClass(this.getOption('dividerClassName'));
			}
		}

	});

	Toolbox.DropdownMenu = Toolbox.CollectionView.extend({

		childViewContainer: 'ul',

		childView: Toolbox.DropdownMenuItem,

		emptyView: Toolbox.DropdownMenuNoItems,

		template: Toolbox.Template('dropdown-menu'),

		className: 'dropdown',

		tagName: 'li',

		childEvents: {
			'click': function(view) {
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
			toggleClassName: 'open'
		},

       templateContext: function() {
            return this.options;
        },

		initialize: function() {
			Toolbox.CompositeView.prototype.initialize.apply(this, arguments);

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
			this.$el.find('.'+this.getOption('toggleClassName')).parent().addClass(this.getOption('toggleClassName'));
			this.$el.find('.'+this.getOption('toggleClassName')).attr('aria-expanded', 'true');
		},

		hideMenu: function() {
			this.$el.find('.'+this.getOption('toggleClassName')).parent().removeClass(this.getOption('toggleClassName'));
			this.$el.find('.'+this.getOption('toggleClassName')).attr('aria-expanded', 'false');
		},

		isMenuVisible: function() {
			return this.$el.find('.'+this.getOption('toggleClassName')).parent().hasClass(this.getOption('toggleClassName'));
		},

		onToggleClick: function() {
			if(!this.isMenuVisible()) {
				this.showMenu();
			}
			else {
				this.hideMenu();
			}
		},

		onShow: function() {
			var t = this;

			if(this.getOption('fetchOnShow')) {
				this.fetch();
			}
		},

		fetch: function() {
			var t = this;

			this.triggerMethod('fetch');

			this.collection.fetch({
				data: {
					limit: this.getOption('limit'),
					order: this.getOption('order'),
					sort: this.getOption('sort'),
				},
				success: function(collection, response) {
					if(t.getOption('showIndicator')) {
						t.hideIndicator();
					}

					t.render();
					t.triggerMethod('fetch:success', collection, response);
				},
				error: function(collection, response) {
					t.triggerMethod('fetch:error', collection, response);
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

    Toolbox.TreeViewNode = Toolbox.CollectionView.extend({

        getTemplate: function() {
            if(!this.getOption('template')) {
                throw new Error('A template option must be set.');
            }

            return this.getOption('template');
        },

        tagName: 'li',

        className: 'tree-view-node',

        defaultOptions:  {
            idAttribute: 'id',
            parentAttribute: 'parent_id',
            childViewContainer: '.children'
        },

        attributes: function() {
            return {
                'data-id': this.model.get(this.getOption('idAttribute')) || this.model.cid,
                'data-parent-id': this.model.get(this.getOption('parentAttribute'))
            };
        },

        initialize: function() {
            Toolbox.CompositeView.prototype.initialize.apply(this, arguments);

            this.collection = this.model.children;

            var options = _.extend({}, this.options);

            delete options.model;

            this.childViewOptions = _.extend({}, options, this.getOption('childViewOptions') || {});
        },

       templateContext: function() {
            return {
                hasChildren:  this.collection ? this.collection.length > 0 : false
            };
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

        initialize: function() {
            Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

            this.options.childViewOptions = _.extend({}, {
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
            console.log('drop');

            var self = this, $target = $(event.target);
            var nodeWhere = {}, parentWhere = {};

            var id = $(event.relatedTarget).data('id');
            var parentId = $(event.target).data('id');

            nodeWhere[getIdAttribute(id)] = id;
            parentWhere[getIdAttribute(parentId)] = parentId;

            var node = self.root().collection.find(nodeWhere);
            var parent = self.root().collection.find(parentWhere);

            self.root().collection.removeNode(node);

            if($target.hasClass('drop-before')) {
                self.root().collection.appendNodeBefore(node, parent);
                self.root().triggerMethod('drop:before', event, self);
            }
            else if($target.hasClass('drop-after')) {
                self.root().collection.appendNodeAfter(node, parent);
                self.root().triggerMethod('drop:after', event, self);
            }
            else if($target.hasClass('drop-children')) {
                if($(event.target).find('.children').length == 0) {
                    $(event.target).append('<div class="children" />');
                }

                if(self.getOption('nestable')) {
                    self.root().collection.appendNode(node, parent, {at: 0});
                    self.root().triggerMethod('drop:children', event, self);
                }
                else {
                    self.root().collection.appendNodeAfter(node, parent, {at: 0});
                    self.root().triggerMethod('drop:after', event, self);
                }
            }

            /*
            Toolbox.Dropzones(event.dragEvent, event.target, {
                before: function($element) {
                    self.root().collection.appendNodeBefore(node, parent);
                    self.root().triggerMethod('drop:before', event, self);
                },
                after: function($element) {
                    self.root().collection.appendNodeAfter(node, parent);
                    self.root().triggerMethod('drop:after', event, self);
                },
                children: function($element) {
                    if(self.getOption('nestable')) {
                        self.root().collection.appendNode(node, parent, {at: 0});
                        self.root().triggerMethod('drop:children', event, self);
                    }
                    else {
                        self.root().collection.appendNodeAfter(node, parent, {at: 0});
                        self.root().triggerMethod('drop:after', event, self);
                    }
                },
            }, this, true);
            */

            self.root().triggerMethod('drop', event, this);
        },

        onDragEnter: function() {
            this.root().triggerMethod('drag:enter', event, this);
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

            this.root().triggerMethod('drag:enter', event, this);
        },

        onDragMove: function(event) {
            this.$el.addClass('dragging');

            var target = event.target;

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

            this._ghostElement = $target.next('.' + this.className).css({
                'margin-top': $target.outerHeight()
            });

            if(this._ghostElement.length == 0) {
                this._ghostElement = $target.prev().length ? $target.prev() : $target.parent();
                this._ghostElement.css({'margin-bottom': $target.outerHeight()});
            }

            $target.css({
                'left': event.clientX - 50,
                'top': event.clientY - 25,
                'width': $target.width()
            });

            this.root().triggerMethod('drag:start', event, this);
        },

        onDragEnd: function(event) {
            this.$el.removeClass('dragging');

            this._ghostElement.attr('style', '');

            $(event.target).attr({
                'data-x': false,
                'data-y': false,
            })
            .css({
                'width': '',
                'left': '',
                'top': '',
                'transform': ''
            });

            this.root().triggerMethod('drag:end', event, this);
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
            var self = this, $el = this.$el;

            interact(this.$el.get(0))
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
                    overlap: 'center',
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
            parentAttribute: 'parent_id'
        },

        onDrop: function() {
            this.collection.reorder();
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

		childEvents: {
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

        defaultOptions: {
            date: false
        },

        modelChanged: function() {
            this.render();
        },

       templateContext: function() {
            return {
                day: this.getOption('day'),
                hasEvents: this.hasEvents()
            }
        },

        setCellHeight: function(width) {
            this.$el.css('height', width || this.$el.width());
        },

        getDate: function() {
            return this.getOption('date');
        },

        hasEvents: function() {
            return this.model.get('events').length > 0 ? true : false;
        },

        onRender: function() {
            var t = this;

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

        childEvents: {
            click: function(view, args) {
                this.triggerMethod('day:click', view, args);
            }
        },

        defaultOptions: {
            days: false,
            events: false
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
        },

        getDayModel: function() {
            return new Backbone.Model({
                events: []
            });
        },

        _renderChildren: function() {
            this.destroyEmptyView();
            this.destroyChildren();

            this.startBuffering();
            this.showCollection();
            this.endBuffering();
        },

        showCollection: function() {
            _.each(this.getOption('days'), function(day, i) {
                this.addChild(this.getDayModel(), this.childView, i);
            }, this);
        },

        _initialEvents: function() {

        }

    });

    Toolbox.MonthlyCalendar = Toolbox.CollectionView.extend({

        template: Toolbox.Template('calendar-monthly-view'),

        className: 'calendar',

        childView: Toolbox.MonthlyCalendarWeek,

        childViewContainer: 'tbody',

        childEvents: {
            'click': function(week, args) {
                this.triggerMethod('week:click', week, args);
            },
            'day:click': function(week, day) {
                this.setDate(day.getDate());
                this.triggerMethod('day:click', week, day);
            }
        },

        defaultOptions: {
            collection: false,
            date: false,
            alwaysShowSixWeeks: true,
            fetchOnRender: true,
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
            var t = this, params = this.getQueryVariables();

            if(this.getCacheResponse(params)) {
                this.restoreCacheResponse(params);
            }
            else {
                this.triggerMethod('fetch', params);
                this.collection.reset();
                this.collection.fetch({
                    data: params,
                    success: function(collection, response) {
                        t.setCacheResponse(params, collection);
                        t.triggerMethod('fetch:complete', true, collection, response);
                        t.triggerMethod('fetch:success', collection, response);
                    },
                    error: function(model, response) {
                        t.triggerMethod('fetch:complete', false, collection, response);
                        t.triggerMethod('fetch:error', collection, response);
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

        onRender: function() {
            this.$el.find('.calendar-header').html(this.getCalendarHeader());
            this.$el.find('.calendar-sub-header').html(this.getCalendarSubHeader());
            this.renderCollection();

            if(this.getOption('fetchOnRender')) {
                this.fetch();
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

        renderCollection: function() {
            this.triggerMethod('before:render:collection');
            this.collection.each(function(model, i) {
                var event = this.createEvent(model);
                var view = this.getViewByDate(event.start);
                if(view) {
                    view.addEvent(event);
                }
            }, this);
            this.triggerMethod('after:render:collection');
        },

        getViewByDate: function(date) {
            if(!date instanceof moment) {
                date = moment(date);
            }

            var view = null;

            this.children.each(function(week, x) {
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
                this.addChild(this.getWeekModel(), this.childView, i);
            }, this);
        },

        _renderChildren: function() {
            this.destroyEmptyView();
            this.destroyChildren();
            this.startBuffering();
            this.showCollection();
            this.endBuffering();
        },

        // Must override core method to do nothing
        _initialEvents: function() {

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

            this.indicator.show(view);
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
            this.input.currentView.focus();
            this.triggerMethod('focus');
        },

        getModelValue: function() {
            return this.model.get(this.getOption('attribute'));
        },

        getInputValue: function() {
            return this.input.currentView.getInputValue();
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
        },

        onShow: function() {
            this.input.show(this.createFormInputView());
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
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

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
            contentAttribute: false
        },

		events: {
			'click': function(e) {
				this.triggerMethod('click', e);
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
            var helper = {},
                badge = this.getBadge(),
                content = this.getContent();

            if(badge) {
                helper.badge = badge;
            }

            if(content) {
                helper.content = content;
            }

            return helper;
		}

	});

	Toolbox.ListGroup = Toolbox.CollectionView.extend({

		childView: Toolbox.ListGroupItem,

		className: 'list-group',

		tagName: 'ul',

		defaultOptions: {
			// (bool) Activate list item on click
			activateOnClick: true,

			// (string) Active class name
			activeClassName: 'active',

			// (string) The message to display if there are no list items
			emptyMessage: 'There are no items in the list.',

			// (object) The view object to use for the empty message
			emptyMessageView: Toolbox.NoListGroupItem,

			// (bool) Show the empty message view
			showEmptyMessage: true,
		},

		childEvents: {
			'click': function(view, e) {
				if(this.getOption('activateOnClick')) {
					if(view.$el.hasClass(this.getOption('activeClassName'))) {
						view.$el.removeClass(this.getOption('activeClassName'));
					}
					else {
						view.$el.addClass(this.getOption('activeClassName'));

						this.triggerMethod('activate', view);
					}
				}

				this.triggerMethod('item:click', view, e);
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
            this.content.show(view);
        },

        getContentView: function() {
            return this.getOption('contentView');
        },

        show: function() {
            var t = this, view = this.getContentView();

            this.render();

            view.on('cancel:click', function() {
                t.hide();
            });

            $('body').append(this.$el);

            this.content.show(view);

            setTimeout(function() {
                t.$el.addClass('show');
            });
        },

        hide: function() {
            var t = this;

            this.$el.removeClass('show');

            setTimeout(function() {
                t.$el.remove();
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

		childEvents: {
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
			'click a': 'click'
		},

		onRender: function() {
			if(this.model.get('divider') === true) {
				this.$el.addClass(this.getOption('disabledClassName'));
			}
		}

	});

	Toolbox.Pagination = Toolbox.CollectionView.extend({

		childViewContainer: 'ul',

		childView: Toolbox.PaginationItem,

		template: Toolbox.Template('pagination'),

		tagName: 'nav',

		childEvents: {
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

		events: {
			'click .next-page': function() {
				this.nextPage();
			},
			'click .prev-page': function() {
				this.prevPage();
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

       templateContext: function() {
            return this.options;
        },

		initialize: function() {
			Toolbox.CompositeView.prototype.initialize.apply(this, arguments);

            if(!this.collection) {
                this.collection = new Backbone.Collection();
            }
		},

		attachBuffer: function(collectionView, buffer) {
			$(buffer).insertAfter(collectionView.$el.find('li:first-child'));
		},

		onBeforeRender: function() {
			this.collection.reset();

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
			this.$el.find('.'+this.getOption('activeClassName')).removeClass(this.getOption('activeClassName'));
			this.$el.find('[data-page="'+this.getOption('page')+'"]').parent().addClass(this.getOption('activeClassName'));

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
			return this.getOption('getTotalPages');
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
            view.available.currentView :
            view.selected.currentView;
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
            activity: '.selection-pool-search-activity'
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
            'click .selection-pool-search-clear': function() {
                this.clearSearch();
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
            Toolbox.LayoutView.prototype.initialize.apply(this, arguments);

            this.channel.on('detection:typing:started', function() {
                this.triggerMethod('typing:started');
            }, this);

            this.channel.on('detection:typing:stopped', function(value) {
                this.triggerMethod('typing:stopped', value);
            }, this);
        },

        showSearchActivity: function() {
            if(this.activity) {
                var view = new Toolbox.ActivityIndicator(this.getOption('searchIndicatorOptions'));
                this.$el.addClass('show-activity');
                this.activity.show(view);
            }
        },

        hideSearchActivity: function() {
            if(this.activity) {
                this.$el.removeClass('show-activity');
                this.activity.empty();
            }
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

                this.showSelectionPoolView(this.available, view);
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

                this.showSelectionPoolView(this.selected, view);
            }
        },

        showSelectionPoolView: function(region, view) {
            view.on('drop', function(event, view) {
                this.triggerMethod('drop', event, view);
            }, this);

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

                this.available.currentView.render();

                return true;
            }, this);
        },

        clearSearch: function() {
            var value = '';

            this.$el.find('.selection-pool-search-field input').val(value).focus();
            this.hideClearSearchButton();
            this.triggerMethod('typing:stopped', value);
        },

        showClearSearchButton: function() {
            this.$el.find('.selection-pool-search-clear').addClass('show');
        },

        hideClearSearchButton: function() {
            this.$el.find('.selection-pool-search-clear').removeClass('show');
        },

        onTypingStarted: function() {
            this.showSearchActivity();
        },

        onTypingStopped: function(value) {
            this.hideSearchActivity();

            if(value) {
                this.showClearSearchButton();
            }
            else {
                this.hideClearSearchButton();
            }

            if(this.available) {
                this.search(this.available.currentView.collection, value);
            }
        },

        resetScrollBottom: function() {
            this._scrollAtBottom = false;
            this._scrollHeight = this.available.currentView.$el.parent().prop('scrollHeight');
        },

        onDomRefresh: function() {
            var self = this, detection = new Toolbox.TypingDetection(
                this.$el.find('.selection-pool-search input'),
                this.getOption('typingStoppedThreshold'),
                this.channel
            );

            var $availablePool = this.available.currentView.$el.parent();

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

        onShow: function() {
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

            /*
            Toolbox.Dropzones(event.dragEvent, event.target, {
                before: function($element) {
                    this.root().triggerMethod('drop:before', event, this);
                },
                after: function($element) {
                    this.root().triggerMethod('drop:after', event, this);
                },
                children: function($element) {
                    if(this.getOption('nestable')) {
                        this.root().triggerMethod('drop:children', event, this);
                    }
                    else {
                        this.root().triggerMethod('drop:after', event, this);
                    }
                },
            }, this);
            */

            if($target.hasClass('drop-before')) {
                //this.root().collection.appendNodeBefore(node, parent);
                this.root().triggerMethod('drop:before', event, self);
            }
            else if($target.hasClass('drop-after')) {
                //this.root().collection.appendNodeAfter(node, parent);
                this.root().triggerMethod('drop:after', event, self);
            }
            else if($target.hasClass('drop-children')) {
                if(this.getOption('nestable')) {
                    //this.root().collection.appendNode(node, parent, {at: 0});
                    this.root().triggerMethod('drop:children', event, self);
                }
                else {
                    //this.root().collection.appendNodeAfter(node, parent, {at: 0});
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

    Toolbox.TableViewFooter = Toolbox.View.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-view-footer'),

        modelEvents: {
            'change': 'render'
        },

        regions: {
            content: 'td'
        },

        defaultOptions: {
            // (array) Array of array of column
            columns: false
        },

       templateContext: function() {
            return this.options;
        }

    });

    Toolbox.TableView = Toolbox.CollectionView.extend({

		className: 'table-view',

        childView: Toolbox.TableViewRow,

        childViewContainer: 'tbody',

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

            // (object) The pagination view class
            paginationView: false,

            // (object) The pagination view options object
            paginationViewOptions: false,

            // (string) The table header
            header: false,

            // (string) The table header tag name
            headerTagName: 'h3',

            // (string) The table header class name
            headerClassName: 'table-header',

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

        getEmptyView: function() {
            var View = Toolbox.TableNoItemsRow.extend({
                options: {
                    message: this.getOption('emptyMessage'),
                    columns: this.getOption('columns')
                }
            });

            return View;
        },

        onShow: function() {
            if(this.getOption('fetchOnShow')) {
                this.fetch();
            }
        },

        onSortClick: function(e) {
            var t = this, orderBy = $(e.target).data('id');

            if(t.getOption('order') === orderBy) {
                if(!t.getOption('sort')) {
                    t.options.sort = 'asc';
                }
                else if(t.getOption('sort') === 'asc') {
                    t.options.sort = 'desc';
                }
                else {
                    t.options.orderBy = false;
                    t.options.sort = false;
                }
            }
            else {
                t.options.order = orderBy;
                t.options.sort = 'asc';
            }

            t.$el.find('.sort').parent().removeClass('sort-asc').removeClass('sort-desc');

            if(t.getOption('sort')) {
                $(e.target).parent().addClass('sort-'+t.getOption('sort'));
            }

            t.fetch(true);
        },

        showPagination: function(page, totalPages) {
            var t = this, View = this.getOption('paginationView');

            if(!View) {
                View = Toolbox.Pager;
            }

            var paginationViewOptions = this.getOption('paginationViewOptions');

            if(!_.isObject(paginationViewOptions)) {
                paginationViewOptions = {};
            }

            var view = new View(_.extend({
                page: page,
                totalPages: totalPages,
            }, paginationViewOptions));

            view.on('paginate', function(page, view) {
                if(page != t.getOption('page')) {
                    t.options.page = page;
                    t.fetch(true);
                }
            });

            var footerView = new Toolbox.TableViewFooter({
                columns: this.getOption('columns')
            });

            this.pagination = new Marionette.Region({
                el: this.$el.find('tfoot')
            });

            this.pagination.show(footerView);

            footerView.content.show(view);
        },

        showActivityIndicator: function() {
            var t = this;

            this.destroyChildren();
            this.destroyEmptyView();

            this.$el.find('table').addClass(this.getOption('loadingClassName'));

            this.addChild(this.model, Toolbox.ActivityIndicator.extend({
                template: Toolbox.Template('table-activity-indicator-row'),
                tagName: 'tr',
               templateContext: function() {
                    return this.options;
                },
                initialize: function() {
                    Toolbox.ActivityIndicator.prototype.initialize.apply(this, arguments);

                    // Set the activity indicator options
                    _.extend(this.options, t.getOption('indicatorOptions'));

                    this.options.columns = t.getOption('columns');

                    // Set the activity indicator instance to be removed later
                    t._activityIndicator = this;
                }
            }));
        },

        hideActivityIndicator: function() {
           this.$el.find('table').removeClass(this.getOption('loadingClassName'));

            if(this._activityIndicator) {
                this.removeChildView(this._activityIndicator);
                this._activityIndicator = false;
            }
        },

        onChildviewBeforeRender: function(child) {
            child.options.columns = this.getOption('columns');
        },

        getRequestData: function() {
            var data = {};
            var options = this.getOption('requestDataOptions');
            var defaultOptions = this.getOption('defaultRequestDataOptions');
            var requestData = this.getOption('requestData');

            if(requestData) {
                data = requestData;
            }

            _.each(([]).concat(defaultOptions, options), function(name) {
                if(!_.isNull(this.getOption(name)) && !_.isUndefined(this.getOption(name))) {
                    data[name] = this.getOption(name);
                }
            }, this);

            return data;
        },

        onFetch: function(collection, response) {
            this.destroyEmptyView();
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

            if(this.getOption('paginate')) {
                this.showPagination(page, totalPages);
            }
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
            var t = this;

            if(reset) {
                this.collection.reset();
            }

            this.collection.fetch({
                data: this.getRequestData(),
                beforeSend: function(xhr) {
                    if(t.getOption('requestHeaders')) {
                        _.each(t.getOption('requestHeaders'), function(value, name) {
                            xhr.setRequestHeader(name, value);
                        });
                    }
                },
                success: function(collection, response) {
                    t.triggerMethod('fetch:complete', true, collection, response);
                    t.triggerMethod('fetch:success', collection, response);
                },
                error: function(collection, response) {
                    t.triggerMethod('fetch:complete', false, collection, response);
                    t.triggerMethod('fetch:error', collection, response)
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
			this.regionManager.addRegion(name, '#'+name);
			this[name].show(view);

			if(setActive) {
				this.setActiveTab(view);
			}
        },

        onShow: function() {
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

        channelName: 'toolbox.wizard',

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
                submitFormOnEnter: true
            };
        },

       templateContext: function() {
            return this.options;
        },

        initialize: function() {
            Toolbox.LayoutView.prototype.initialize.apply(this, arguments);

            this.channel.reply('complete:step', function(step) {
                this.progress.currentView.setComplete(step || this.getOption('step'));
            }, this);

            this.channel.reply('set:step', function(step) {
                this.setStep(step);
            }, this);

            this.channel.reply('wizard:error', function(options, errorView) {
                options = _.extend({}, this.getOption('errorViewOptions'), options, {
                    wizard: this
                });

                this.buttons.empty();
                this.showView(errorView || this.getOption('errorView'), options);
            }, this);

            this.channel.reply('wizard:success', function(options, successView) {
                options = _.extend({}, this.getOption('successViewOptions'), options, {
                    wizard: this
                });

                this.buttons.empty();
                this.showView(successView || this.getOption('successView'), options);
            }, this);
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
            var view = false;

            this.options.step = parseInt(step);

            if(this.options.step < 1) {
                this.options.step = 1;
            }

            if(this.getOption('step') > this.getOption('highestStep')) {
                this.options.highestStep = this.getOption('step')
            }

            this.progress.currentView.render();

            if(this.buttons.currentView) {
                this.buttons.currentView.render();
            }

            if(view = this.getStep()) {
                this.showContent(view);
            }
        },

        showView: function(View, options) {
            if(View) {
                this.showContent(new View(options));
            }
        },

        showActivityIndicator: function(options, region) {
            region || (region = this.content);

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

                this.progress.show(view);
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

                this.buttons.show(view);
            }
            else {
                throw new Error('The button view is not a valid class.');
            }
        },

        showContent: function(view) {
            if(view) {
                view.options.wizard = this;

                this.content.show(view, {
                    preventDestroy: true
                });

                view.once('attach', function() {
                    this.resetRegions(view);
                    view.triggerMethod('wizard:attach');
                }, this);

                view.triggerMethod('wizard:show:step', this.getOption('step'), this);
                this.triggerMethod('show:step', this.getOption('step'), view);
            }
        },

        getStep: function(step) {
            return this.getOption('steps')[(step || this.getOption('step')) - 1];
        },

        getTotalSteps: function() {
            return this.getOption('steps').length;
        },

        next: function() {
            this.channel.request('complete:step');
            this.setStep(this.getOption('step') + 1);
        },

        back: function() {
            this.setStep(this.getOption('step') - 1);
        },

        finish: function(success, options, View) {
            success = (_.isUndefined(success) || success) ? true : false;

            if(success) {
                this.options.finished = true;
                this.$el.addClass(this.getOption('finishedClassName'));
                this.channel.request('complete:step');
                this.setStep(this.getTotalSteps() + 1);
                this.channel.request('wizard:success', options, View);
            }
            else {
                this.channel.request('wizard:error', options, View);
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
            this.buttons.currentView.disableButtons();
        },

        disableNextButton: function() {
            this.buttons.currentView.disableNextButton();
        },

        disableBackButton: function() {
            this.buttons.currentView.disableBackButton();
        },

        disableFinishButton: function() {
            this.buttons.currentView.disableFinishButton();
        },

        enableButtons: function() {
            this.buttons.currentView.enableButtons();
        },

        enableNextButton: function() {
            this.buttons.currentView.enableNextButton();
        },

        enableBackButton: function() {
            this.buttons.currentView.enableBackButton();
        },

        enableFinishButton: function() {
            this.buttons.currentView.enableFinishButton();
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
            return (append ? append : '') + ' ' + this.getOption('defaultButtonClassName') + ' ' + this.getOption('buttonSizeClassName');
        },

        getPrimaryButtonClasses: function() {
            return this.getOption('primaryButtonClassName') + ' ' + this.getOption('buttonSizeClassName');
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
                    this.channel.request('set:step', step);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvb2xib3guanMiLCJEcm9wem9uZXMuanMiLCJUeXBpbmdEZXRlY3Rpb24uanMiLCJWaWV3T2Zmc2V0LmpzIiwidGVtcGxhdGVzLmpzIiwiaXMuanMiLCJub3QuanMiLCJwcm9wZXJ0eU9mLmpzIiwiVHJlZS5qcyIsIlZpZXcuanMiLCJDb2xsZWN0aW9uVmlldy5qcyIsIkJhc2VGaWVsZC5qcyIsIkJhc2VGb3JtLmpzIiwiVW5vcmRlcmVkTGlzdC5qcyIsIkRyb3Bkb3duTWVudS5qcyIsIlRyZWVWaWV3Tm9kZS5qcyIsIlRyZWVWaWV3LmpzIiwiRHJhZ2dhYmxlVHJlZU5vZGUuanMiLCJEcmFnZ2FibGVUcmVlVmlldy5qcyIsIkFjdGl2aXR5SW5kaWNhdG9yL0FjdGl2aXR5SW5kaWNhdG9yLmpzIiwiQnJlYWRjcnVtYnMvQnJlYWRjdW1icy5qcyIsIkJ1dHRvbkRyb3Bkb3duTWVudS9CdXR0b25Ecm9wZG93bk1lbnUuanMiLCJCdXR0b25Hcm91cC9CdXR0b25Hcm91cC5qcyIsIkNhbGVuZGFyL0NhbGVuZGFyLmpzIiwiQ2hlY2tib3hGaWVsZC9DaGVja2JveEZpZWxkLmpzIiwiQ29yZS9MZW52ZW5zaHRlaW4uanMiLCJJbmxpbmVFZGl0b3IvSW5saW5lRWRpdG9yLmpzIiwiSW5wdXRGaWVsZC9JbnB1dEZpZWxkLmpzIiwiTGlnaHRTd2l0Y2hGaWVsZC9MaWdodFN3aXRjaEZpZWxkLmpzIiwiTGlzdEdyb3VwL0xpc3RHcm91cC5qcyIsIk1vZGFsL01vZGFsLmpzIiwiTm90aWZpY2F0aW9uL05vdGlmaWNhdGlvbi5qcyIsIk9yZGVyZWRMaXN0L09yZGVyZWRMaXN0LmpzIiwiUGFnZXIvUGFnZXIuanMiLCJQYWdpbmF0aW9uL1BhZ2luYXRpb24uanMiLCJQcm9ncmVzc0Jhci9Qcm9ncmVzc0Jhci5qcyIsIlJhZGlvRmllbGQvUmFkaW9GaWVsZC5qcyIsIlJhbmdlU2xpZGVyL1JhbmdlU2xpZGVyLmpzIiwiU2VsZWN0RmllbGQvU2VsZWN0RmllbGQuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2wuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2xUcmVlTm9kZS5qcyIsIlNlbGVjdGlvblBvb2wvU2VsZWN0aW9uUG9vbFRyZWVWaWV3LmpzIiwiU3RvcmFnZS9TdG9yYWdlLmpzIiwiVGFibGVWaWV3L1RhYmxlVmlldy5qcyIsIlRhYnMvVGFicy5qcyIsIlRleHRhcmVhRmllbGQvVGV4dEFyZWFGaWVsZC5qcyIsIldpemFyZC9XaXphcmQuanMiLCJXaXphcmQvV2l6YXJkQnV0dG9ucy5qcyIsIldpemFyZC9XaXphcmRFcnJvci5qcyIsIldpemFyZC9XaXphcmRQcm9ncmVzcy5qcyIsIldpemFyZC9XaXphcmRTdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3R1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbGlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYXJpb25ldHRlLnRvb2xib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcbiAgICAgICAgICAgICAgICAnanF1ZXJ5JyxcbiAgICAgICAgICAgICAgICAnYmFja2JvbmUnLFxuICAgICAgICAgICAgICAgICdiYWNrYm9uZS5yYWRpbycsXG4gICAgICAgICAgICAgICAgJ2JhY2tib25lLm1hcmlvbmV0dGUnLFxuICAgICAgICAgICAgICAgICdoYW5kbGViYXJzJyxcbiAgICAgICAgICAgICAgICAndW5kZXJzY29yZSdcbiAgICAgICAgICAgIF0sIGZ1bmN0aW9uKCQsIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSwgSGFuZGxlYmFycywgXykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QsICQsIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSwgSGFuZGxlYmFycywgXyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUucmFkaW8nKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdCwgcm9vdC4kLCByb290LkJhY2tib25lLCByb290LkJhY2tib25lLlJhZGlvLCByb290Lk1hcmlvbmV0dGUsIHJvb3QuSGFuZGxlYmFycywgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uKHJvb3QsICQsIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSwgSGFuZGxlYmFycywgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIFRvb2xib3ggPSB7fTtcblxuICAgIFRvb2xib3guaGFuZGxlYmFycyA9IHt9O1xuXG4gICAgVG9vbGJveC5WaWV3cyA9IHt9O1xuXG4gICAgVG9vbGJveC5WRVJTSU9OID0gJyUlR1VMUF9JTkpFQ1RfVkVSU0lPTiUlJztcblxuICAgIC8vIFRvb2xib3guVGVtcGxhdGVcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gR2V0IGFuIGV4aXN0aW5nIHJlbmRlcmVkIGhhbmRsZWJhcnMgdGVtcGxhdGVcblxuICAgIFRvb2xib3guVGVtcGxhdGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGlmKFRvb2xib3gudGVtcGxhdGVzW25hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gVG9vbGJveC50ZW1wbGF0ZXNbbmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAnQ2Fubm90IGxvY2F0ZSB0aGUgSGFuZGxlYmFycyB0ZW1wbGF0ZSB3aXRoIHRoZSBuYW1lIG9mIFwiJytuYW1lKydcIi4nO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRvb2xib3guT3B0aW9uc1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBHZXQgdGhlIGRlZmF1bHQgb3B0aW9ucyBhbmQgb3B0aW9ucyBhbmQgbWVyZ2UgdGhlLFxuXG4gICAgVG9vbGJveC5PcHRpb25zID0gZnVuY3Rpb24oZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIGNvbnRleHQpIHtcbiAgICAgICAgaWYoXy5pc0Z1bmN0aW9uKGRlZmF1bHRPcHRpb25zKSkge1xuICAgICAgICAgICAgZGVmYXVsdE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucy5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoXy5pc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIHJldHVybiByb290LlRvb2xib3ggPSBUb29sYm94O1xufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICByZXR1cm4gZGVmaW5lKFsnanF1ZXJ5J10sIGZ1bmN0aW9uKCQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJClcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guRHJvcHpvbmVzID0gZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrcywgY29udGV4dCkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGV2ZW50LmRyb3B6b25lLmVsZW1lbnQoKTtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyIG9mZnNldCA9IFRvb2xib3guVmlld09mZnNldChlbGVtZW50KTtcbiAgICAgICAgdmFyIHRvcCA9IG9mZnNldC55O1xuICAgICAgICB2YXIgbGVmdCA9IG9mZnNldC54O1xuICAgICAgICB2YXIgaGVpZ2h0ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHZhciBoZWlnaHRUaHJlc2hvbGQgPSBoZWlnaHQgKiAuMjU7XG4gICAgICAgIHZhciB3aWR0aFRocmVzaG9sZCA9IDQwO1xuICAgICAgICB2YXIgYm90dG9tID0gdG9wICsgaGVpZ2h0O1xuXG4gICAgICAgIGlmKGhlaWdodFRocmVzaG9sZCA+IDIwKSB7XG4gICAgICAgICAgICBoZWlnaHRUaHJlc2hvbGQgPSAyMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGV2ZW50LnBhZ2VZIDwgdG9wICsgaGVpZ2h0VGhyZXNob2xkKSB7XG4gICAgICAgICAgICBjYWxsYmFja3MuYmVmb3JlID8gY2FsbGJhY2tzLmJlZm9yZS5jYWxsKGNvbnRleHQsICRlbGVtZW50KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihldmVudC5wYWdlWSA+IGJvdHRvbSAtIGhlaWdodFRocmVzaG9sZCB8fCBldmVudC5wYWdlWCA8IGxlZnQgKyB3aWR0aFRocmVzaG9sZCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmFmdGVyID8gY2FsbGJhY2tzLmFmdGVyLmNhbGwoY29udGV4dCwgJGVsZW1lbnQpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5jaGlsZHJlbiA/IGNhbGxiYWNrcy5jaGlsZHJlbi5jYWxsKGNvbnRleHQsICRlbGVtZW50KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UeXBpbmdEZXRlY3Rpb24gPSBmdW5jdGlvbigkZWxlbWVudCwgdHlwaW5nU3RvcHBlZFRocmVzaG9sZCwgcmFkaW9DaGFubmVsKSB7XG4gICAgICAgIHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQgfHwgKHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQgPSA1MDApO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHR5cGluZ1RpbWVyLCBsYXN0VmFsdWU7XG4gICAgICAgIHZhciBoYXNUeXBpbmdTdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5nZXRWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50LnZhbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGFzVHlwaW5nU3RhcnRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMYXN0VmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXN0VmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGVhclRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0eXBpbmdUaW1lcikge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBpbmdUaW1lcik7XG4gICAgICAgICAgICAgICAgdHlwaW5nVGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJGVsZW1lbnQua2V5dXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYoIXR5cGluZ1RpbWVyKSB7XG4gICAgICAgICAgICAgICAgdHlwaW5nVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZihyYWRpb0NoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2hhbm5lbC50cmlnZ2VyKCdkZXRlY3Rpb246dHlwaW5nOnN0b3BwZWQnLCBzZWxmLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxhc3RWYWx1ZSA9IHNlbGYuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgaGFzVHlwaW5nU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sIHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkZWxlbWVudC5rZXlkb3duKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYoIWhhc1R5cGluZ1N0YXJ0ZWQgJiYgc2VsZi5nZXRWYWx1ZSgpICE9IGxhc3RWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihyYWRpb0NoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2hhbm5lbC50cmlnZ2VyKCdkZXRlY3Rpb246dHlwaW5nOnN0YXJ0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoYXNUeXBpbmdTdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5jbGVhclRpbWVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlZpZXdPZmZzZXQgPSBmdW5jdGlvbihub2RlLCBzaW5nbGVGcmFtZSkge1xuICAgICAgICBmdW5jdGlvbiBhZGRPZmZzZXQobm9kZSwgY29vcmRzLCB2aWV3KSB7XG4gICAgICAgICAgICB2YXIgcCA9IG5vZGUub2Zmc2V0UGFyZW50O1xuXG4gICAgICAgICAgICBjb29yZHMueCArPSBub2RlLm9mZnNldExlZnQgLSAocCA/IHAuc2Nyb2xsTGVmdCA6IDApO1xuICAgICAgICAgICAgY29vcmRzLnkgKz0gbm9kZS5vZmZzZXRUb3AgLSAocCA/IHAuc2Nyb2xsVG9wIDogMCk7XG5cbiAgICAgICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHAubm9kZVR5cGUgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50U3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUocCwgJycpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRTdHlsZS5wb3NpdGlvbiAhPSAnc3RhdGljJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQocGFyZW50U3R5bGUuYm9yZGVyTGVmdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLmJvcmRlclRvcFdpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHAubG9jYWxOYW1lID09ICdUQUJMRScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChwYXJlbnRTdHlsZS5wYWRkaW5nTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gcGFyc2VJbnQocGFyZW50U3R5bGUucGFkZGluZ1RvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwLmxvY2FsTmFtZSA9PSAnQk9EWScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUobm9kZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpbkxlZnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocC5sb2NhbE5hbWUgPT0gJ0JPRFknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChwYXJlbnRTdHlsZS5ib3JkZXJMZWZ0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gcGFyc2VJbnQocGFyZW50U3R5bGUuYm9yZGVyVG9wV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocCAhPSBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54IC09IHBhcmVudC5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgLT0gcGFyZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYWRkT2Zmc2V0KHAsIGNvb3Jkcywgdmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubG9jYWxOYW1lID09ICdCT0RZJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUobm9kZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChzdHlsZS5ib3JkZXJMZWZ0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBwYXJzZUludChzdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWxTdHlsZSA9IHZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLnBhcmVudE5vZGUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggLT0gcGFyc2VJbnQoaHRtbFN0eWxlLnBhZGRpbmdMZWZ0KTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgLT0gcGFyc2VJbnQoaHRtbFN0eWxlLnBhZGRpbmdUb3ApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLnNjcm9sbExlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gbm9kZS5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLnNjcm9sbFRvcCkge1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBub2RlLnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgd2luID0gbm9kZS5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4gICAgICAgICAgICAgICAgaWYgKHdpbiAmJiAoIXNpbmdsZUZyYW1lICYmIHdpbi5mcmFtZUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZE9mZnNldCh3aW4uZnJhbWVFbGVtZW50LCBjb29yZHMsIHdpbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvb3JkcyA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgIGFkZE9mZnNldChub2RlLCBjb29yZHMsIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgIH07XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwidGhpc1tcIlRvb2xib3hcIl0gPSB0aGlzW1wiVG9vbGJveFwiXSB8fCB7fTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdID0gdGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl0gfHwge307XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImFjdGl2aXR5LWluZGljYXRvclwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiZGltbWVkXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJtaW4taGVpZ2h0OlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1pbkhlaWdodCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWluSGVpZ2h0IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibWluSGVpZ2h0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjtcIjtcbn0sXCI1XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcInBvc2l0aW9uOlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBvc2l0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wb3NpdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInBvc2l0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjtcIjtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImJhY2tncm91bmQtY29sb3I6IFwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRpbW1lZEJnQ29sb3IgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRpbW1lZEJnQ29sb3IgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJkaW1tZWRCZ0NvbG9yXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjtcIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPVxcXCJhY3Rpdml0eS1pbmRpY2F0b3ItbGFiZWxcXFwiIHN0eWxlPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsRm9udFNpemUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEwLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjxzcGFuIGNsYXNzPVxcXCJhY3Rpdml0eS1pbmRpY2F0b3ItbGFiZWwtdGV4dFxcXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3NwYW4+PC9zcGFuPlwiO1xufSxcIjEwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcImZvbnQtc2l6ZTpcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbEZvbnRTaXplIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbEZvbnRTaXplIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibGFiZWxGb250U2l6ZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJhY3Rpdml0eS1pbmRpY2F0b3ItZGltbWVyIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGltbWVkIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiIHN0eWxlPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pbkhlaWdodCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucG9zaXRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDUsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRpbW1lZEJnQ29sb3IgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDcsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+XFxuXFxuXHQ8c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg5LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L3NwYW4+XFxuXFxuPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZm9ybS1lcnJvclwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiICAgIDxzcGFuPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKGRlcHRoMCwgZGVwdGgwKSlcbiAgICArIFwiPC9zcGFuPlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm5ld2xpbmUgOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxicj5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5lcnJvcnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImJyZWFkY3J1bWJcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaHJlZiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaHJlZiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImhyZWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8L2E+XCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ocmVmIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJuby1icmVhZGNydW1ic1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiYnV0dG9uLWRyb3Bkb3duLW1lbnVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcImRyb3B1cFwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9Y29udGFpbmVyLmxhbWJkYSwgYWxpYXMyPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHQ8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5idXR0b25DbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmJ1dHRvbkljb24gOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uYnV0dG9uTGFiZWwgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI8L2J1dHRvbj5cXG5cdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uYnV0dG9uQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5idXR0b25Ub2dnbGVDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIGRhdGEtdG9nZ2xlPVxcXCJkcm9wZG93blxcXCIgYXJpYS1leHBhbmRlZD1cXFwiZmFsc2VcXFwiPlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJjYXJldFxcXCI+PC9zcGFuPlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5Ub2dnbGUgRHJvcGRvd248L3NwYW4+XFxuXHRcdDwvYnV0dG9uPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCI8aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLmJ1dHRvbkljb24gOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPjwvaT5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uYnV0dG9uQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5idXR0b25Ub2dnbGVDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIGRhdGEtdG9nZ2xlPVxcXCJkcm9wZG93blxcXCIgYXJpYS1leHBhbmRlZD1cXFwiZmFsc2VcXFwiPlxcblx0XHRcdFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmJ1dHRvbkljb24gOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0XHRcdFwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5idXR0b25MYWJlbCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJjYXJldFxcXCI+PC9zcGFuPlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5Ub2dnbGUgRHJvcGRvd248L3NwYW4+XFxuXHRcdDwvYnV0dG9uPlxcblwiO1xufSxcIjhcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubWVudUNsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJidG4tZ3JvdXAgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kcm9wVXAgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+XFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zcGxpdEJ1dHRvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc3BsaXRCdXR0b24gOiBkZXB0aDApLHtcIm5hbWVcIjpcIm5vdFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdDx1bCBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZW51Q2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg4LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjwvdWw+XFxuPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImJ1dHRvbi1ncm91cC1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiPGkgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pY29uIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj48L2k+IFwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibm8tYnV0dG9uLWdyb3VwLWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImNhbGVuZGFyLW1vbnRobHktZGF5LXZpZXdcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0PHNwYW4gY2xhc3M9XFxcImNhbGVuZGFyLWhhcy1ldmVudHNcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jaXJjbGVcXFwiPjwvaT48L3NwYW4+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCI8c3BhbiBjbGFzcz1cXFwiY2FsZW5kYXItZGF0ZVxcXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZGF5IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kYXkgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRheVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3NwYW4+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZXZlbnRzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sZW5ndGggOiBzdGFjazEpLFwiPlwiLFwiMFwiLHtcIm5hbWVcIjpcImlzXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImNhbGVuZGFyLW1vbnRobHktdmlld1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiY2FsZW5kYXItbWFzdGhlYWRcXFwiPlxcblx0PG5hdiBjbGFzcz1cXFwiY2FsZW5kYXItbmF2aWdhdGlvblxcXCI+XFxuXHRcdDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJjYWxlbmRhci1uYXZpZ2F0aW9uLXByZXZcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1hbmdsZS1sZWZ0XFxcIj48L2k+PC9hPlxcblx0XHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiY2FsZW5kYXItbmF2aWdhdGlvbi1uZXh0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtYW5nbGUtcmlnaHRcXFwiPjwvaT48L2E+XFxuXHQ8L25hdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcImNhbGVuZGFyLWhlYWRlclxcXCI+PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJjYWxlbmRhci1zdWItaGVhZGVyXFxcIj48L2Rpdj5cXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPVxcXCJjYWxlbmRhci12aWV3XFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcImluZGljYXRvclxcXCI+PC9kaXY+XFxuXFxuXHQ8dGFibGUgY2xhc3M9XFxcImNhbGVuZGFyLW1vbnRobHktdmlld1xcXCI+XFxuXHRcdDx0aGVhZD5cXG5cdFx0XHQ8dHI+XFxuXHRcdFx0XHQ8dGg+U3VuPC90aD5cXG5cdFx0XHRcdDx0aD5Nb248L3RoPlxcblx0XHRcdFx0PHRoPlR1ZTwvdGg+XFxuXHRcdFx0XHQ8dGg+V2VkPC90aD5cXG5cdFx0XHRcdDx0aD5UaHVyPC90aD5cXG5cdFx0XHRcdDx0aD5Gcmk8L3RoPlxcblx0XHRcdFx0PHRoPlNhdDwvdGg+XFxuXHRcdFx0PC90cj5cXG5cdFx0PC90aGVhZD5cXG5cdFx0PHRib2R5PjwvdGJvZHk+XFxuXHQ8L3RhYmxlPlxcbjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImZvcm0tY2hlY2tib3gtZmllbGRcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyVGFnTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyVGFnTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJcdDxwIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmRlc2NyaXB0aW9uIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPC9wPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLmRlc2NyaXB0aW9uQ2xhc3NOYW1lIDogZGVwdGhzWzJdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9Y29udGFpbmVyLmxhbWJkYSwgYWxpYXMyPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmlucHV0Q2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0PGxhYmVsIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+PGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS50eXBlIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiBuYW1lPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS52YWx1ZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+PC9sYWJlbD5cXG5cdDwvZGl2PlxcblwiO1xufSxcIjdcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGhzWzJdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjlcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm9wdGlvbnMgOiBkZXB0aHNbMV0pLCBkZXB0aDApLHtcIm5hbWVcIjpcIi4uL29wdGlvbnNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTAsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcIjEwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9Y29udGFpbmVyLmxhbWJkYSwgYWxpYXMyPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczM9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXM0PWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXM1PVwiZnVuY3Rpb25cIjtcblxuICByZXR1cm4gXCJcdDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5pbnB1dENsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdDxsYWJlbCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczMsKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGhzWzJdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPjxpbnB1dCB0eXBlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0udHlwZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLm5hbWUgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJbXVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52YWx1ZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXM0KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM1ID8gaGVscGVyLmNhbGwoYWxpYXMzLHtcIm5hbWVcIjpcInZhbHVlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+IFwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXM0KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM1ID8gaGVscGVyLmNhbGwoYWxpYXMzLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXHQ8L2Rpdj5cXG5cIjtcbn0sXCIxMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzNdICE9IG51bGwgPyBkZXB0aHNbM10ubGFiZWxDbGFzc05hbWUgOiBkZXB0aHNbM10pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRlc2NyaXB0aW9uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5vcHRpb25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJub3RcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5vcHRpb25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg5LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZHJvcGRvd24tbWVudS1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8YSBocmVmPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaHJlZiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pY29uIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLnZhbHVlIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmxhYmVsIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2E+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uaWNvbiA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+PC9pPiBcIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLnZhbHVlIDogZGVwdGhzWzJdKSwgZGVwdGgwKSk7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5sYWJlbCA6IGRlcHRoc1syXSksIGRlcHRoMCkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kaXZpZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJub3RcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImRyb3Bkb3duLW1lbnUtbm8taXRlbXNcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImRyb3Bkb3duLW1lbnVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubWVudUNsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50b2dnbGVDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRvZ2dsZUNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidG9nZ2xlQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgZGF0YS10b2dnbGU9XFxcImRyb3Bkb3duXFxcIiByb2xlPVxcXCJidXR0b25cXFwiIGFyaWEtaGFzcG9wdXA9XFxcInRydWVcXFwiIGFyaWEtZXhwYW5kZWQ9XFxcImZhbHNlXFxcIj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudG9nZ2xlTGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRvZ2dsZUxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ0b2dnbGVMYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgPGkgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50b2dnbGVJY29uQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50b2dnbGVJY29uQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ0b2dnbGVJY29uQ2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC9pPjwvYT5cXG5cXG48dWwgY2xhc3M9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVudUNsYXNzTmFtZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIj48L3VsPlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJpbmxpbmUtZWRpdG9yXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJpbmxpbmUtZWRpdG9yLWxhYmVsXFxcIj48L2Rpdj5cXG5cXG48aSBjbGFzcz1cXFwiZmEgZmEtcGVuY2lsIGlubGluZS1lZGl0b3ItZWRpdC1pY29uXFxcIj48L2k+XFxuXFxuPGRpdiBjbGFzcz1cXFwiaW5saW5lLWVkaXRvci1maWVsZFxcXCI+PC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cXFwiaW5saW5lLWVkaXRvci1hY3Rpdml0eS1pbmRpY2F0b3JcXFwiPjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcImZvcm0taW5wdXQtZmllbGRcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyVGFnTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyVGFnTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8bGFiZWwgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pZCA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubGFiZWxDbGFzc05hbWUgOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubGFiZWwgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJpZD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLmlkIDogZGVwdGhzWzJdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGhzWzJdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjhcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIlx0PHAgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDksIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uZGVzY3JpcHRpb24gOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI8L3A+XFxuXCI7XG59LFwiOVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uZGVzY3JpcHRpb25DbGFzc05hbWUgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJuYW1lPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcImlkPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaWQgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50eXBlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50eXBlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJ0eXBlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5wdXRDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlucHV0Q2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgLz5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZm9ybS1saWdodC1zd2l0Y2gtZmllbGRcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyVGFnTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyVGFnTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIGFsaWFzMT1jb250YWluZXIubGFtYmRhLCBhbGlhczI9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHQ8bGFiZWwgZm9yPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaWQgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubGFiZWxDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHQ8cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmFjdGl2ZUNsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDUsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5wdXRDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlucHV0Q2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5pcyB8fCAoZGVwdGgwICYmIGRlcHRoMC5pcykgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApLDEse1wibmFtZVwiOlwiaXNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIiB0YWJpbmRleD1cXFwiMFxcXCI+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJsaWdodC1zd2l0Y2gtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGlnaHQtc3dpdGNoLWxhYmVsIG9uXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGlnaHQtc3dpdGNoLWhhbmRsZVxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxpZ2h0LXN3aXRjaC1sYWJlbCBvZmZcXFwiPjwvZGl2Plxcblx0PC9kaXY+XFxuPC9kaXY+XFxuXFxuPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm5hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcIm5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnZhbHVlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52YWx1ZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidmFsdWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBpZD1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaWRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibGlzdC1ncm91cC1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiXHQ8c3BhbiBjbGFzcz1cXFwiYmFkZ2VcXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5iYWRnZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvc3Bhbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJhZGdlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbnRlbnQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJuby1saXN0LWdyb3VwLWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICBObyBpdGVtcyBmb3VuZC5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApLHtcIm5hbWVcIjpcIm5vdFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcIm1lc3NhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIm1vZGFsLXdpbmRvd1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCJcdDxoMyBjbGFzcz1cXFwibW9kYWwtaGVhZGVyXFxcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5oZWFkZXIgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImhlYWRlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2gzPlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFxuICBcIlx0XHQ8ZGl2IGNsYXNzPVxcXCJtb2RhbC1idXR0b25zXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5idXR0b25zIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5idXR0b25zIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwiYnV0dG9uc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmJ1dHRvbnMpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyICsgXCJcdFx0PC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHQ8YSBocmVmPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhyZWYgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDUsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRleHQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRleHQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcInRleHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9hPlxcblwiO1xufSxcIjVcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaHJlZiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcIjdcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXI7XG5cbiAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pY29uIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj48L3NwYW4+IFwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJtb2RhbC13aW5kb3dcXFwiPlxcblx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIm1vZGFsLWNsb3NlXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtdGltZXMtY2lyY2xlXFxcIj48L2k+PC9hPlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdDxkaXYgY2xhc3M9XFxcIm1vZGFsLWNvbnRlbnQgY2xlYXJmaXhcXFwiPjwvZGl2PlxcblxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9ucyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIm5vdGlmaWNhdGlvblwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8ZGl2IGNsYXNzPVxcXCJjb2wtc20tMlxcXCI+XFxuXHRcdDxpIGNsYXNzPVxcXCJmYSBmYS1cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJpY29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBpY29uXFxcIj48L2k+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImNvbC1sZy0xMFxcXCI+XFxuXHRcdFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0udGl0bGUgOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblxcblx0XHRcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm1lc3NhZ2UgOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0PC9kaXY+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIjxoMz5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0udGl0bGUgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCI8L2gzPlwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCI8cD5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0ubWVzc2FnZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvcD5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiXHQ8ZGl2IGNsYXNzPVxcXCJjb2wtbGctMTJcXFwiPlxcblx0XHRcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLnRpdGxlIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cdFx0XCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5tZXNzYWdlIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdDwvZGl2PlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCI8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiY2xvc2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lcy1jaXJjbGVcXFwiPjwvaT48L2E+XFxuXFxuPGRpdiBjbGFzcz1cXFwicm93XFxcIj5cXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcIm5vdFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wibm8tb3JkZXJlZC1saXN0LWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlcjtcblxuICByZXR1cm4gKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJtZXNzYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJvcmRlcmVkLWxpc3QtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29udGVudCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInBhZ2VyXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLnByZXZDbGFzc05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKTtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJcdFx0PGxpIGNsYXNzPVxcXCJwYWdlLXRvdGFsc1xcXCI+UGFnZSBcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ucGFnZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIiBvZiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS50b3RhbFBhZ2VzIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2xpPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0udG90YWxQYWdlcyA6IGRlcHRoc1syXSksIGRlcHRoMCkpO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubmV4dENsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPHVsIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGFnZXJDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBhZ2VyQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJwYWdlckNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0PGxpIGNsYXNzPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnNuYXBUb0VkZ2VzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJwcmV2LXBhZ2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1sb25nLWFycm93LWxlZnRcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L2k+IFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wcmV2TGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnByZXZMYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicHJldkxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvYT48L2xpPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5jbHVkZVBhZ2VUb3RhbHMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0PGxpIGNsYXNzPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnNuYXBUb0VkZ2VzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJuZXh0LXBhZ2VcXFwiPlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uZXh0TGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm5leHRMYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibmV4dExhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiA8aSBjbGFzcz1cXFwiZmEgZmEtbG9uZy1hcnJvdy1yaWdodFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvaT48L2E+PC9saT5cXG48L3VsPlwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJwYWdpbmF0aW9uLWl0ZW1cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMz1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxhIGhyZWY9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaHJlZiA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGFsaWFzMSwoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaHJlZiA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwibm90XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCIgZGF0YS1wYWdlPVxcXCJcIlxuICAgICsgYWxpYXMzKGFsaWFzMigoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ucGFnZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzMyhhbGlhczIoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLnBhZ2UgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI8L2E+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5ocmVmIDogZGVwdGhzWzJdKSwgZGVwdGgwKSk7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiI1wiO1xufSxcIjZcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0PGE+JmhlbGxpcDs8L2E+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRpdmlkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcIm5vdFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRpdmlkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJwYWdpbmF0aW9uXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjx1bCBjbGFzcz1cXFwicGFnaW5hdGlvbiBcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wYWdpbmF0aW9uQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYWdpbmF0aW9uQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwicGFnaW5hdGlvbkNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0PGxpPlxcblx0XHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwicHJldi1wYWdlXFxcIiBhcmlhLWxhYmVsPVxcXCJQcmV2aW91c1xcXCI+XFxuXHRcdFx0PHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPiZsYXF1bzs8L3NwYW4+XFxuXHRcdDwvYT5cXG5cdDwvbGk+XFxuICAgIDxsaT5cXG5cdFx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIm5leHQtcGFnZVxcXCIgYXJpYS1sYWJlbD1cXFwiTmV4dFxcXCI+XFxuXHRcdFx0PHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPiZyYXF1bzs8L3NwYW4+XFxuXHRcdDwvYT5cXG4gICAgPC9saT5cXG48L3VsPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInByb2dyZXNzLWJhclwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucHJvZ3Jlc3NCYXJDbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnByb2dyZXNzQmFyQ2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJwcm9ncmVzc0JhckNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIHJvbGU9XFxcInByb2dyZXNzYmFyXFxcIiBhcmlhLXZhbHVlbm93PVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucHJvZ3Jlc3MgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnByb2dyZXNzIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJwcm9ncmVzc1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGFyaWEtdmFsdWVtaW49XFxcIjBcXFwiIGFyaWEtdmFsdWVtYXg9XFxcIjEwMFxcXCIgc3R5bGU9XFxcIndpZHRoOiBcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucHJvZ3Jlc3MgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnByb2dyZXNzIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJwcm9ncmVzc1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIlO1xcXCI+XFxuXHQ8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnByb2dyZXNzIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wcm9ncmVzcyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwicHJvZ3Jlc3NcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJSBDb21wbGV0ZTwvc3Bhbj5cXG48L2Rpdj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJmb3JtLXJhZGlvLWZpZWxkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIGFsaWFzMT1jb250YWluZXIubGFtYmRhLCBhbGlhczI9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHQ8XCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlclRhZ05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlciA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlclRhZ05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHQ8cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pbnB1dENsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdDxsYWJlbCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPjxpbnB1dCB0eXBlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0udHlwZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm5hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0udmFsdWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPjwvbGFiZWw+XFxuXHQ8L2Rpdj5cXG5cIjtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5vcHRpb25zIDogZGVwdGhzWzFdKSwgZGVwdGgwKSx7XCJuYW1lXCI6XCIuLi9vcHRpb25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEwLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCIxMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXMzPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzND1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzNT1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiXHQ8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uaW5wdXRDbGFzc05hbWUgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcblx0XHQ8bGFiZWwgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMzLChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1syXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj48aW5wdXQgdHlwZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1syXSAhPSBudWxsID8gZGVwdGhzWzJdLnR5cGUgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIG5hbWU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5uYW1lIDogZGVwdGhzWzJdKSwgZGVwdGgwKSlcbiAgICArIFwiW11cXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmFsdWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZhbHVlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzNCksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNSA/IGhlbHBlci5jYWxsKGFsaWFzMyx7XCJuYW1lXCI6XCJ2YWx1ZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPiBcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGFiZWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzNCksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNSA/IGhlbHBlci5jYWxsKGFsaWFzMyx7XCJuYW1lXCI6XCJsYWJlbFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2xhYmVsPlxcblx0PC9kaXY+XFxuXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1szXSAhPSBudWxsID8gZGVwdGhzWzNdLmxhYmVsQ2xhc3NOYW1lIDogZGVwdGhzWzNdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkse1wibmFtZVwiOlwibm90XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInJhbmdlLXNsaWRlclwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwic2xpZGVyXFxcIj48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJmb3JtLXNlbGVjdC1maWVsZFwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBhbGlhczE9Y29udGFpbmVyLmxhbWJkYSwgYWxpYXMyPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXJUYWdOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXIgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXJUYWdOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxsYWJlbCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmlkIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcImlkPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uaWQgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0ubGFiZWxDbGFzc05hbWUgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHQ8cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIm5hbWU9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5uYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjEzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pZCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwibXVsdGlwbGVcIjtcbn0sXCIxN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlx0PG9wdGlvbiBcIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5pcyB8fCAoZGVwdGgwICYmIGRlcHRoMC5pcykgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmFsdWUgOiBkZXB0aDApLFwiIT09XCIsdW5kZWZpbmVkLHtcIm5hbWVcIjpcImlzXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDE4LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zZWxlY3RlZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMjAsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIj5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYmVsIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyMiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcIm5vdFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyNCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9vcHRpb24+XFxuXCI7XG59LFwiMThcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJ2YWx1ZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLnZhbHVlIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjIwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiXCI7XG59LFwiMjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmxhYmVsIDogZGVwdGhzWzFdKSwgZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcIjI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS52YWx1ZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYnVmZmVyID0gXG4gICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDgsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjxzZWxlY3QgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlucHV0Q2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbnB1dENsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaW5wdXRDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm11bHRpcGxlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxNSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm9wdGlvbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwob3B0aW9ucz17XCJuYW1lXCI6XCJvcHRpb25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDE3LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMub3B0aW9ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIjwvc2VsZWN0PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJzZWxlY3Rpb24tcG9vbC10cmVlLW5vZGVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8dWwgY2xhc3M9XFxcImNoaWxkcmVuXFxcIj48L3VsPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGkgY2xhc3M9XFxcImZhIGZhLWJhcnMgZHJhZy1oYW5kbGVcXFwiPjwvaT4gPHNwYW4gY2xhc3M9XFxcIm5vZGUtbmFtZVxcXCI+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29udGVudCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3NwYW4+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oYXNDaGlsZHJlbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wic2VsZWN0aW9uLXBvb2xcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJoZWlnaHQ6XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlaWdodCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjtcIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwicm93IHNlbGVjdGlvbi1wb29sLXNlYXJjaFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS0xMlxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWxlY3Rpb24tcG9vbC1zZWFyY2gtZmllbGRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInNlbGVjdGlvbi1wb29sLXNlYXJjaC1hY3Rpdml0eVxcXCI+PC9kaXY+XFxuICAgICAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcInNlbGVjdGlvbi1wb29sLXNlYXJjaC1jbGVhclxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzLWNpcmNsZVxcXCI+PC9pPjwvYT5cXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgdmFsdWU9XFxcIlxcXCIgcGxhY2Vob2xkZXI9XFxcIkVudGVyIGtleXdvcmRzIHRvIHNlYXJjaCB0aGUgbGlzdFxcXCIgY2xhc3M9XFxcInNlYXJjaCBmb3JtLWNvbnRyb2xcXFwiPlxcbiAgICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XFxcInJvdyBzZWxlY3Rpb24tcG9vbC1saXN0c1xcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS02XFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImF2YWlsYWJsZS1wb29sIGRyb3BwYWJsZS1wb29sXFxcIiBkYXRhLWFjY2VwdD1cXFwiLnNlbGVjdGVkLXBvb2wgLmRyYWdnYWJsZS10cmVlLW5vZGVcXFwiIHN0eWxlPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlaWdodCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS02XFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInNlbGVjdGVkLXBvb2wgZHJvcHBhYmxlLXBvb2xcXFwiIGRhdGEtYWNjZXB0PVxcXCIuYXZhaWxhYmxlLXBvb2wgLmRyYWdnYWJsZS10cmVlLW5vZGVcXFwiIHN0eWxlPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlaWdodCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInRhYi1jb250ZW50XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb250ZW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFic1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8IS0tIE5hdiB0YWJzIC0tPlxcbjx1bCBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGFiQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50YWJDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJ0YWJDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiByb2xlPVxcXCJ0YWJsaXN0XFxcIj48L3VsPlxcblxcbjwhLS0gVGFiIHBhbmVzIC0tPlxcbjxkaXYgY2xhc3M9XFxcInRhYi1jb250ZW50XFxcIj48L2Rpdj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ0YWJsZS1hY3Rpdml0eS1pbmRpY2F0b3Itcm93XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwic3R5bGU9XFxcImhlaWdodDpcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVpZ2h0IDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwicHhcXFwiXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiPHRkIGNsYXNzPVxcXCJhY3Rpdml0eS1pbmRpY2F0b3Itcm93XFxcIiBjb2xzcGFuPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb2x1bW5zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sZW5ndGggOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlaWdodCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlxcblxcblx0PGRpdiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWRpbW1lclxcXCI+XFxuXHRcdFxcblx0XHQ8c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yXFxcIj48L3NwYW4+XFxuXFxuXHQ8L2Rpdj5cXG5cXG48L3RkPlwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ0YWJsZS1uby1pdGVtc1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPHRkIGNvbHNwYW49XFxcIlwiXG4gICAgKyBhbGlhczEoY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb2x1bW5zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sZW5ndGggOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcblx0XCJcbiAgICArIGFsaWFzMSgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lc3NhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSx7XCJuYW1lXCI6XCJtZXNzYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcbjwvdGQ+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFibGUtdmlldy1mb290ZXJcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0udG90YWxQYWdlcyA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ucGFnZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXMyPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbiAgcmV0dXJuIFwiPHRkIGNvbHNwYW49XFxcIlwiXG4gICAgKyBhbGlhczEoY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb2x1bW5zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sZW5ndGggOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIGNsYXNzPVxcXCJwYWdlLXRvdGFsc1xcXCI+XFxuICAgIFBhZ2UgXCJcbiAgICArIGFsaWFzMSgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBhZ2UgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBhZ2UgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMzKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMyLHtcIm5hbWVcIjpcInBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIG9mIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMiwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG90YWxQYWdlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCkgfHwgYWxpYXMzKS5jYWxsKGFsaWFzMiwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudG90YWxQYWdlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwibm90XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcbjwvdGQ+XCI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInRhYmxlLXZpZXctZ3JvdXBcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcImJ1dHRvbnMtd3JhcHBlciBwdWxsLXJpZ2h0XFxcIj5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5idXR0b25zIDogZGVwdGhzWzFdKSwgZGVwdGgwKSx7XCJuYW1lXCI6XCIuLi9idXR0b25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvZGl2PlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdDxhIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ocmVmIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ocmVmIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJocmVmXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY2xhc3NOYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcIm5vdFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvYT5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmNsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpO1xufSxcIjVcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uYnV0dG9uQ2xhc3NOYW1lIDogZGVwdGhzWzJdKSwgZGVwdGgwKSk7XG59LFwiN1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaWNvbiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+PC9pPlwiO1xufSxcIjlcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyVGFnTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlckNsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlciA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlclRhZ05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI+XFxuXCI7XG59LFwiMTFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDxcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uZGVzY3JpcHRpb25UYWcgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmRlc2NyaXB0aW9uIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPC9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uZGVzY3JpcHRpb25UYWcgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI+XFxuXCI7XG59LFwiMTNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcdFx0XHQ8dGggc2NvcGU9XFxcImNvbFxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC53aWR0aCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jbGFzc05hbWUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5pcyB8fCAoZGVwdGgwICYmIGRlcHRoMC5pcykgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5vcmRlciA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaXNcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTYsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcXCI+XFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTgsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJub3RcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMjAsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0XHRcdDwvdGg+XFxuXCI7XG59LFwiMTRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCJ3aWR0aD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLndpZHRoIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjE2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwic29ydC1cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uc29ydCA6IGRlcHRoc1syXSksIGRlcHRoMCkpO1xufSxcIjE4XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGE7XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmlkIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwic29ydFxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5uYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvYT5cXG5cdFx0XHRcdFx0PGkgY2xhc3M9XFxcInNvcnQtaWNvbiBhc2MgZmEgZmEtc29ydC1hc2NcXFwiPjwvaT5cXG5cdFx0XHRcdFx0PGkgY2xhc3M9XFxcInNvcnQtaWNvbiBkZXNjIGZhIGZhLXNvcnQtZGVzY1xcXCI+PC9pPlxcblwiO1xufSxcIjIwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJcdFx0XHRcdFx0XCJcbiAgICArICgoc3RhY2sxID0gY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ubmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYnVmZmVyID0gXG4gICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJ1dHRvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxlbmd0aCA6IHN0YWNrMSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oZWFkZXIgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDksIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZGVzY3JpcHRpb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDExLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG48dGFibGUgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRhYmxlQ2xhc3NOYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50YWJsZUNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwidGFibGVDbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdDx0aGVhZD5cXG5cdFx0PHRyPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbHVtbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbHVtbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwob3B0aW9ucz17XCJuYW1lXCI6XCJjb2x1bW5zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIlx0XHQ8L3RyPlxcblx0PC90aGVhZD5cXG5cdDx0Ym9keT48L3Rib2R5Plxcblx0PHRmb290PjwvdGZvb3Q+XFxuPC90YWJsZT5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widGFibGUtdmlldy1wYWdpbmF0aW9uXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2PjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcInRhYmxlLXZpZXctcm93XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdDx0ZCBkYXRhLWlkPVxcXCJcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJpZFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczMoKGhlbHBlcnMucHJvcGVydHlPZiB8fCAoZGVwdGgwICYmIGRlcHRoMC5wcm9wZXJ0eU9mKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLGRlcHRoc1sxXSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcInByb3BlcnR5T2ZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkpXG4gICAgKyBcIjwvdGQ+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucztcblxuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbHVtbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbHVtbnMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJjb2x1bW5zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyByZXR1cm4gc3RhY2sxOyB9XG4gIGVsc2UgeyByZXR1cm4gJyc7IH1cbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZm9ybS10ZXh0YXJlYS1maWVsZFwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBhbGlhczE9Y29udGFpbmVyLmxhbWJkYSwgYWxpYXMyPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0PFwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXJUYWdOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXIgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXJUYWdOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gXCJcdDxsYWJlbCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmlkIDogZGVwdGhzWzFdKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbENsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5sYWJlbCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcImlkPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uaWQgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcImNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0ubGFiZWxDbGFzc05hbWUgOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHQ8cCBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5kZXNjcmlwdGlvbkNsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCIxMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIm5hbWU9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5uYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIlwiO1xufSxcIjEzXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiaWQ9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pZCA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCJcIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPHRleHRhcmVhIFwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5wdXRDbGFzc05hbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlucHV0Q2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+PC90ZXh0YXJlYT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wiZHJhZ2dhYmxlLXRyZWUtdmlldy1ub2RlXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPHVsIGNsYXNzPVxcXCJjaGlsZHJlblxcXCI+PC91bD5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiBcIjxpIGNsYXNzPVxcXCJmYSBmYS1iYXJzIGRyYWctaGFuZGxlXFxcIj48L2k+XFxuXFxuPGRpdiBjbGFzcz1cXFwibm9kZS1uYW1lXFxcIj5cXG4gICAgPHNwYW4+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3NwYW4+XFxuPC9kaXY+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5oYXNDaGlsZHJlbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widHJlZS12aWV3LW5vZGVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8dWwgY2xhc3M9XFxcImNoaWxkcmVuXFxcIj48L3VsPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhhc0NoaWxkcmVuIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJuby11bm9yZGVyZWQtbGlzdC1pdGVtXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXI7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZXNzYWdlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwibWVzc2FnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1widW5vcmRlcmVkLWxpc3QtaXRlbVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY29udGVudCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIndpemFyZC1idXR0b25zXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPVwiZnVuY3Rpb25cIiwgYWxpYXM0PWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRpc2FibGVkIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNsYXNzTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY2xhc3NOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJjbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG4gICAgICAgICAgICBcIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJlbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiZWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImxhYmVsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcbiAgICAgICAgPC9idXR0b24+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5kaXNhYmxlZENsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCI8aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmljb24gOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kaXNhYmxlZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNsYXNzTmFtZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuICAgICAgICAgICAgXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sYWJlbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwibGFiZWxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg3LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG4gICAgICAgIDwvYnV0dG9uPlxcblwiO1xufSxcIjdcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCIgPGkgY2xhc3M9XFxcIlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5pY29uIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj48L2k+XCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZywgYnVmZmVyID0gXG4gIFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLWxlZnQtYnV0dG9ucyBwdWxsLWxlZnRcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxlZnRCdXR0b25zIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5sZWZ0QnV0dG9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLChvcHRpb25zPXtcIm5hbWVcIjpcImxlZnRCdXR0b25zXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5sZWZ0QnV0dG9ucykgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPVxcXCJ3aXphcmQtcmlnaHQtYnV0dG9ucyBwdWxsLXJpZ2h0XFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5yaWdodEJ1dHRvbnMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJpZ2h0QnV0dG9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLChvcHRpb25zPXtcIm5hbWVcIjpcInJpZ2h0QnV0dG9uc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMucmlnaHRCdXR0b25zKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ3aXphcmQtZXJyb3JcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8XCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlclRhZ05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlciA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlclRhZ05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI+XCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIndpemFyZC1lcnJvci1pY29uXFxcIj48aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmVycm9ySWNvbiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+PC9pPjwvZGl2PlwiO1xufSxcIjVcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxwPlwiXG4gICAgKyAoKHN0YWNrMSA9IGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm1lc3NhZ2UgOiBkZXB0aHNbMV0pLCBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9wPlwiO1xufSxcIjdcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIiAgICA8dWwgY2xhc3M9XFxcIndpemFyZC1lcnJvci1saXN0XFxcIj5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5lcnJvcnMgOiBkZXB0aHNbMV0pLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oOCwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICAgIDwvdWw+XFxuXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgICAgICA8bGk+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoZGVwdGgwLCBkZXB0aDApKVxuICAgICsgXCI8L2xpPlxcblwiO1xufSxcIjEwXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWNvbnRhaW5lci5sYW1iZGEsIGFsaWFzMj1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5iYWNrQnV0dG9uQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5iYWNrQnV0dG9uSWNvbiA6IGRlcHRoc1sxXSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5iYWNrQnV0dG9uTGFiZWwgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI8L2J1dHRvbj5cXG5cIjtcbn0sXCIxMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uYmFja0J1dHRvbkljb24gOiBkZXB0aHNbMl0pLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmVycm9ySWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmVycm9ycyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zaG93QmFja0J1dHRvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTAsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xudGhpc1tcIlRvb2xib3hcIl1bXCJ0ZW1wbGF0ZXNcIl1bXCJ3aXphcmQtcHJvZ3Jlc3NcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCIgICAgPGEgY2xhc3M9XFxcIndpemFyZC1zdGVwIFwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuY29tcGxldGUgOiBzdGFjazEpLHtcIm5hbWVcIjpcIm5vdFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmNvbXBsZXRlIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXFwiIGRhdGEtc3RlcD1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3B0aW9ucyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc3RlcCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnRpdGxlIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg2LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI+XFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxhYmVsIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg4LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9wdGlvbnMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxhYmVsIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJub3RcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTAsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICA8L2E+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5kaXNhYmxlZENsYXNzTmFtZSA6IGRlcHRoc1syXSksIGRlcHRoMCkpO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoZGVwdGhzWzJdICE9IG51bGwgPyBkZXB0aHNbMl0uY29tcGxldGVDbGFzc05hbWUgOiBkZXB0aHNbMl0pLCBkZXB0aDApKTtcbn0sXCI2XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJ0aXRsZT1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0ub3B0aW9ucyA6IGRlcHRoc1sxXSkpICE9IG51bGwgPyBzdGFjazEudGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIndpemFyZC1zdGVwLWxhYmVsXFxcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5vcHRpb25zIDogZGVwdGhzWzFdKSkgIT0gbnVsbCA/IHN0YWNrMS5sYWJlbCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvc3Bhbj5cXG5cIjtcbn0sXCIxMFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwoKHN0YWNrMSA9IChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5vcHRpb25zIDogZGVwdGhzWzFdKSkgIT0gbnVsbCA/IHN0YWNrMS50aXRsZSA6IHN0YWNrMSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMTEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcIjExXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIndpemFyZC1zdGVwLWxhYmVsXFxcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oY29udGFpbmVyLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aHNbMl0gIT0gbnVsbCA/IGRlcHRoc1syXS5vcHRpb25zIDogZGVwdGhzWzJdKSkgIT0gbnVsbCA/IHN0YWNrMS50aXRsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvc3Bhbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtcHJvZ3Jlc3MtYmFyXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5zdGVwcyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc3RlcHMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJzdGVwc1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLnN0ZXBzKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiPC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWUsXCJ1c2VEZXB0aHNcIjp0cnVlfSk7XG50aGlzW1wiVG9vbGJveFwiXVtcInRlbXBsYXRlc1wiXVtcIndpemFyZC1zdWNjZXNzXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIGFsaWFzMT1jb250YWluZXIubGFtYmRhLCBhbGlhczI9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPFwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXJUYWdOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXIgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI8L1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5oZWFkZXJUYWdOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPlwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtc3VjY2Vzcy1pY29uXFxcIj48aSBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLnN1Y2Nlc3NJY29uIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj48L2k+PC9kaXY+XCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIjxwPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5tZXNzYWdlIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiPC9wPlwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhlYWRlciA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zdWNjZXNzSWNvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZXNzYWdlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg1LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbnRoaXNbXCJUb29sYm94XCJdW1widGVtcGxhdGVzXCJdW1wid2l6YXJkXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKGNvbnRhaW5lci5sYW1iZGEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLnBhbmVsQ2xhc3NOYW1lIDogZGVwdGhzWzFdKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwicGFuZWwtYm9keVxcXCI+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBhbGlhczE9Y29udGFpbmVyLmxhbWJkYSwgYWxpYXMyPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgICAgICAgICAgIDxcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uaGVhZGVyVGFnTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlckNsYXNzTmFtZSA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlciA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLmhlYWRlclRhZ05hbWUgOiBkZXB0aHNbMV0pLCBkZXB0aDApKVxuICAgICsgXCI+XFxuXCI7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHJldHVybiBcIiAgICAgICAgICAgIDxwPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbihjb250YWluZXIubGFtYmRhKChkZXB0aHNbMV0gIT0gbnVsbCA/IGRlcHRoc1sxXS5kZXNjcmlwdGlvbiA6IGRlcHRoc1sxXSksIGRlcHRoMCkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbn0sXCI3XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcIndpemFyZC1idXR0b25zXFxcIj48L2Rpdj5cXG48L2Rpdj5cXG5cIjtcbn0sXCI5XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtYnV0dG9uc1xcXCI+PC9kaXY+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhLGJsb2NrUGFyYW1zLGRlcHRocykge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9O1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFuZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaGVhZGVyIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgzLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIndpemFyZC1wcm9ncmVzc1xcXCI+PC9kaXY+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kZXNjcmlwdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtY29udGVudFxcXCI+PC9kaXY+XFxuXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1tcImlmXCJdLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wYW5lbCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGFuZWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcIm5vdFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg5LCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTsiLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdoYW5kbGViYXJzJykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2hhbmRsZWJhcnMnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5IYW5kbGViYXJzSGVscGVyc1JlZ2lzdHJ5ID0gZmFjdG9yeShyb290LkhhbmRsZWJhcnMpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKEhhbmRsZWJhcnMpIHtcblxuICAgIHZhciBpc0FycmF5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIHZhciBFeHByZXNzaW9uUmVnaXN0cnkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5leHByZXNzaW9ucyA9IFtdO1xuICAgIH07XG5cbiAgICBFeHByZXNzaW9uUmVnaXN0cnkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChvcGVyYXRvciwgbWV0aG9kKSB7XG4gICAgICAgIHRoaXMuZXhwcmVzc2lvbnNbb3BlcmF0b3JdID0gbWV0aG9kO1xuICAgIH07XG5cbiAgICBFeHByZXNzaW9uUmVnaXN0cnkucHJvdG90eXBlLmNhbGwgPSBmdW5jdGlvbiAob3BlcmF0b3IsIGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIGlmICggISB0aGlzLmV4cHJlc3Npb25zLmhhc093blByb3BlcnR5KG9wZXJhdG9yKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG9wZXJhdG9yIFwiJytvcGVyYXRvcisnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmV4cHJlc3Npb25zW29wZXJhdG9yXShsZWZ0LCByaWdodCk7XG4gICAgfTtcblxuICAgIHZhciBlUiA9IG5ldyBFeHByZXNzaW9uUmVnaXN0cnkoKTtcbiAgICBlUi5hZGQoJ25vdCcsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ICE9IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPicsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ID4gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc8JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJz49JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPj0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc8PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPT0nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA9PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJz09PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJyE9PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ICE9PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJ2luJywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgaWYgKCAhIGlzQXJyYXkocmlnaHQpKSB7XG4gICAgICAgICAgICByaWdodCA9IHJpZ2h0LnNwbGl0KCcsJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJpZ2h0LmluZGV4T2YobGVmdCkgIT09IC0xO1xuICAgIH0pO1xuXG4gICAgdmFyIGlzSGVscGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgbGVmdCA9IGFyZ3NbMF0sXG4gICAgICAgICAgICBvcGVyYXRvciA9IGFyZ3NbMV0sXG4gICAgICAgICAgICByaWdodCA9IGFyZ3NbMl0sXG4gICAgICAgICAgICBvcHRpb25zID0gYXJnc1szXTtcblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IGFyZ3NbMV07XG4gICAgICAgICAgICBpZiAobGVmdCkgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDMpIHtcbiAgICAgICAgICAgIHJpZ2h0ID0gYXJnc1sxXTtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmdzWzJdO1xuICAgICAgICAgICAgaWYgKGxlZnQgPT0gcmlnaHQpIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlUi5jYWxsKG9wZXJhdG9yLCBsZWZ0LCByaWdodCkpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfTtcblxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lzJywgaXNIZWxwZXIpO1xuXG4gICAgLypcbiAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdubDJicicsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIG5sMmJyID0gKHRleHQgKyAnJykucmVwbGFjZSgvKFtePlxcclxcbl0/KShcXHJcXG58XFxuXFxyfFxccnxcXG4pL2csICckMScgKyAnPGJyPicgKyAnJDInKTtcbiAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcobmwyYnIpO1xuICAgIH0pO1xuXG4gICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFsnVmFsdWVzOiddLmNvbmNhdChcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgLTEpXG4gICAgICAgICkpO1xuICAgIH0pO1xuXG4gICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZGVidWcnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0NvbnRleHQ6JywgdGhpcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFsnVmFsdWVzOiddLmNvbmNhdChcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgLTEpXG4gICAgICAgICkpO1xuICAgIH0pO1xuXHQqL1xuXG4gICAgcmV0dXJuIGVSO1xuXG59KSk7IiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnaGFuZGxlYmFycycpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2hhbmRsZWJhcnMnLCAndW5kZXJzY29yZSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LkhhbmRsZWJhcnNIZWxwZXJzUmVnaXN0cnkgPSBmYWN0b3J5KHJvb3QuSGFuZGxlYmFycywgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChIYW5kbGViYXJzLCBfKSB7XG5cbiAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdub3QnLCBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucykge1xuICAgIFx0cmV0dXJuICF2YWx1ZSB8fCB2YWx1ZSA9PSAwID8gb3B0aW9ucy5mbih2YWx1ZSkgOiBmYWxzZTtcbiAgICB9KTtcbiAgICBcbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LkhhbmRsZWJhcnNIZWxwZXJzUmVnaXN0cnkgPSBmYWN0b3J5KHJvb3QuSGFuZGxlYmFycyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoSGFuZGxlYmFycykge1xuXG4gICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncHJvcGVydHlPZicsIGZ1bmN0aW9uKG9iamVjdCwgcHJvcCkge1xuICAgICAgICBpZihvYmplY3QuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKG9iamVjdFtwcm9wXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9KTtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSwgcm9vdC5NYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cbiAgICBUb29sYm94LlRyZWUgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cbiAgICAgICAgaGFzUmVzZXRPbmNlOiBmYWxzZSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBhcmF0b3I6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNoaWxkVmlld09wdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25DbGFzczogQmFja2JvbmUuQ29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBvcmlnaW5hbENvbGxlY3Rpb246IGZhbHNlLFxuICAgICAgICAgICAgICAgIGlkQXR0cmlidXRlOiAnaWQnLFxuICAgICAgICAgICAgICAgIHBhcmVudEF0dHJpYnV0ZTogJ3BhcmVudF9pZCdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oY29sbGVjdGlvbiwgb3B0aW9ucykge1xuICAgICAgICAgICAgQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIFtdLCB0aGlzLm9wdGlvbnMgPSBvcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gVG9vbGJveC5PcHRpb25zKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucywgdGhpcyk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmdldE9wdGlvbignb3JpZ2luYWxDb2xsZWN0aW9uJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub3JpZ2luYWxDb2xsZWN0aW9uID0gY29sbGVjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy50ZW1wbGF0ZSAmJiAhdGhpcy5nZXRPcHRpb24oJ2NoaWxkVmlld09wdGlvbnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jaGlsZFZpZXdPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub24oJ2FmdGVyOmluaXRpYWxpemUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkVHJlZShjb2xsZWN0aW9uKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIEhhY2sgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgQ29sbGVjdGlvbiBmdW5jdGlvbmFsaXR5XG4gICAgICAgICAgICAvLyBpbmhlcml0ZWQgYnkgdGhlIHByb3RvdHlwZS5cbiAgICAgICAgICAgIGlmKCF0aGlzLmhhc1Jlc2V0T25jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFzUmVzZXRPbmNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2FmdGVyOmluaXRpYWxpemUnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLnJlc2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRUcmVlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICAgICAgICAgIGlmKGRhdGEudG9KU09OKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9KU09OKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9jcmVhdGVDb2xsZWN0aW9uKGRhdGEpO1xuXG4gICAgICAgICAgICB2YXIgY291bnQgPSAwLCB0b3RhbEF0dGVtcHRzID0gZGF0YS5sZW5ndGg7XG5cbiAgICAgICAgICAgIHdoaWxlIChkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkYXRhLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHRoaXMuZ2V0UGFyZW50SWQobW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZmluZE5vZGVCeUlkKHBhcmVudElkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoXy5pc051bGwocGFyZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5yZW1vdmUodGhpcy5hcHBlbmROb2RlKG1vZGVsKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYXJlbnQgPSB0aGlzLmZpbmROb2RlQnlJZChwYXJlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnJlbW92ZSh0aGlzLmFwcGVuZE5vZGUobW9kZWwsIHBhcmVudCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZihjb3VudCA+IHRvdGFsQXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgdHJlZSBjb3VsZCBub3QgYmUgZ2VuZXJhdGVkLiBJbmZpbml0ZSBsb29wIGRldGVjdGVkIHdpdGggdGhlIHJlbWFpbmluZyBtb2RlbHM6IFwiJytkYXRhLnBsdWNrKCdpZCcpKydcIicpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0T3B0aW9uOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICBpZighXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnNbbmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1tuYW1lXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UGFyZW50SWQ6IGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICBpZighbW9kZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldCh0aGlzLmdldE9wdGlvbigncGFyZW50QXR0cmlidXRlJykpIHx8IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SWQ6IGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdpZEF0dHJpYnV0ZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW9yZGVyOiBmdW5jdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uID0gY29sbGVjdGlvbiB8fCB0aGlzO1xuXG4gICAgICAgICAgICBjb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwsIGkpIHtcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ29yZGVyJywgaSArIDEpO1xuXG4gICAgICAgICAgICAgICAgaWYobW9kZWwuY2hpbGRyZW4gJiYgbW9kZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVvcmRlcihtb2RlbC5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kTm9kZXM6IGZ1bmN0aW9uKGNoaWxkcmVuLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIF8uZWFjaChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZE5vZGUoY2hpbGQsIHBhcmVudCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmROb2RlOiBmdW5jdGlvbihjaGlsZCwgcGFyZW50LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgICAgICAgICAgY2hpbGQuY2hpbGRyZW4gfHwgKGNoaWxkLmNoaWxkcmVuID0gdGhpcy5fY3JlYXRlQ29sbGVjdGlvbigpKTtcblxuICAgICAgICAgICAgaWYocGFyZW50KSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuc2V0KHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnRBdHRyaWJ1dGUnKSwgcGFyZW50LmdldCh0aGlzLmdldE9wdGlvbignaWRBdHRyaWJ1dGUnKSkpO1xuICAgICAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbi5hZGQoY2hpbGQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuc2V0KHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnRBdHRyaWJ1dGUnKSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQoY2hpbGQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kTm9kZUJlZm9yZTogZnVuY3Rpb24oY2hpbGQsIHNpYmxpbmcpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHRoaXMuZ2V0UGFyZW50SWQoc2libGluZyk7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gcGFyZW50SWQgPyB0aGlzLmZpbmQoe2lkOiBwYXJlbnRJZH0pIDogbnVsbDtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHBhcmVudCA/IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHNpYmxpbmcpIDogdGhpcy5pbmRleE9mKHNpYmxpbmcpO1xuXG4gICAgICAgICAgICB0aGlzLmFwcGVuZE5vZGUoY2hpbGQsIHBhcmVudCwge1xuICAgICAgICAgICAgICAgIGF0OiBpbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmROb2RlQWZ0ZXI6IGZ1bmN0aW9uKGNoaWxkLCBzaWJsaW5nKSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB0aGlzLmdldFBhcmVudElkKHNpYmxpbmcpO1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZmluZCh7aWQ6IHBhcmVudElkfSk7XG5cbiAgICAgICAgICAgIGlmKHBhcmVudElkICYmIHBhcmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kTm9kZShjaGlsZCwgcGFyZW50LCB7XG4gICAgICAgICAgICAgICAgICAgIGF0OiBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihzaWJsaW5nKSArIDFcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kTm9kZShjaGlsZCwgbnVsbCwge1xuICAgICAgICAgICAgICAgICAgICBhdDogdGhpcy5pbmRleE9mKHNpYmxpbmcpICsgMVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTm9kZTogZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gdGhpcy5nZXRQYXJlbnRJZChub2RlKTtcblxuICAgICAgICAgICAgaWYocGFyZW50SWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5maW5kKHtpZDogcGFyZW50SWR9KTtcblxuICAgICAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbi5yZW1vdmUobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uKGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBmaWx0ZXIoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IF8uZmlsdGVyKGNvbGxlY3Rpb24ubW9kZWxzLCBpdGVyYXRlZSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBpZihtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGNvbGxlY3Rpb24ubW9kZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IGNvbGxlY3Rpb24ubW9kZWxzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKG1vZGVsLmNoaWxkcmVuICYmIG1vZGVsLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gZmlsdGVyKG1vZGVsLmNoaWxkcmVuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXIodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZDogZnVuY3Rpb24oaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmQoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IF8uZmluZChjb2xsZWN0aW9uLm1vZGVscywgaXRlcmF0ZWUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgICAgICAgaWYobW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBjb2xsZWN0aW9uLm1vZGVscykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm93ID0gY29sbGVjdGlvbi5tb2RlbHNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYocm93LmNoaWxkcmVuICYmIHJvdy5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9IGZpbmQocm93LmNoaWxkcmVuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZpbmQodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2hlcmU6IGZ1bmN0aW9uKGF0dHJpYnV0ZXMsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmQuY2FsbCh0aGlzLCBhdHRyaWJ1dGVzLCBjb250ZXh0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kUGFyZW50Tm9kZTogZnVuY3Rpb24oY2hpbGQsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmROb2RlQnlJZCh0aGlzLmdldFBhcmVudElkKGNoaWxkKSwgY29sbGVjdGlvbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZE5vZGU6IGZ1bmN0aW9uKGNoaWxkLCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kTm9kZUJ5SWQodGhpcy5nZXRJZChjaGlsZCksIGNvbGxlY3Rpb24pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmROb2RlQnlJZDogZnVuY3Rpb24oaWQsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24gfHwgKGNvbGxlY3Rpb24gPSB0aGlzKTtcbiAgICAgICAgICAgIHZhciBtb2RlbHMgPSBjb2xsZWN0aW9uLnRvQXJyYXkoKTtcblxuICAgICAgICAgICAgZm9yKHZhciBpIGluIG1vZGVscykge1xuICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IG1vZGVsc1tpXTtcblxuICAgICAgICAgICAgICAgIGlmKGlkID09IHRoaXMuZ2V0SWQobW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihtb2RlbC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuZmluZE5vZGVCeUlkKGlkLCBtb2RlbC5jaGlsZHJlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIV8uaXNOdWxsKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9KU09OOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHBhcnNlKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gW107XG5cbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gbW9kZWwudG9KU09OKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYobW9kZWwuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmNoaWxkcmVuID0gcGFyc2UobW9kZWwuY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcm93LnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlKHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnRvSlNPTigpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY3JlYXRlQ29sbGVjdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIENvbGxlY3Rpb24gPSB0aGlzLmdldE9wdGlvbignY29sbGVjdGlvbkNsYXNzJykgfHwgQmFja2JvbmUuQ29sbGVjdGlvbjtcblxuICAgICAgICAgICAgZGF0YSA9IG5ldyBDb2xsZWN0aW9uKGRhdGEgfHwgW10pO1xuXG4gICAgICAgICAgICBkYXRhLmNvbXBhcmF0b3IgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2NvbXBhcmF0b3InKSkge1xuICAgICAgICAgICAgICAgIGRhdGEuY29tcGFyYXRvciA9IHRoaXMuZ2V0T3B0aW9uKCdjb21wYXJhdG9yJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUucmFkaW8nLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5yYWRpbycpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuQmFja2JvbmUuUmFkaW8sIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlZpZXcgPSBNYXJpb25ldHRlLlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYXJpb25ldHRlLlZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gVG9vbGJveC5PcHRpb25zKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucywgdGhpcyk7XG5cbiAgICAgICAgICAgIC8vdGhpcy5jaGFubmVsTmFtZSA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsTmFtZScpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWxOYW1lJykgfHwgJ2dsb2JhbCc7XG4gICAgICAgICAgICAvL3RoaXMuY2hhbm5lbCA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbCcpIHx8IFJhZGlvLmNoYW5uZWwodGhpcy5jaGFubmVsTmFtZSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZScsICdiYWNrYm9uZS5yYWRpbycsICdiYWNrYm9uZS5tYXJpb25ldHRlJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLnJhZGlvJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSwgcm9vdC5CYWNrYm9uZS5SYWRpbywgcm9vdC5NYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQ29sbGVjdGlvblZpZXcgPSBNYXJpb25ldHRlLkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFyaW9uZXR0ZS5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBUb29sYm94Lk9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbE5hbWUnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsTmFtZScpIHx8ICdnbG9iYWwnO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gXy5yZXN1bHQodGhpcywgJ2NoYW5uZWwnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsJykgfHwgUmFkaW8uY2hhbm5lbCh0aGlzLmNoYW5uZWxOYW1lKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQmFzZUZpZWxkID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZm9ybU1vZGVsOiBmYWxzZSxcblxuICAgICAgICBjbGFzc05hbWU6ICdmb3JtLWdyb3VwJyxcblxuICAgICAgICBkZWZhdWx0VHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdmb2N1cyB7e3RyaWdnZXJTZWxlY3Rvcn19Jzoge1xuICAgICAgICAgICAgICAgIGV2ZW50OiAnZm9jdXMnLFxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdibHVyIHt7dHJpZ2dlclNlbGVjdG9yfX0nOiB7XG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdibHVyJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY2xpY2sge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAna2V5dXAge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTp1cCcsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2tleWRvd24ge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTpkb3duJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAna2V5cHJlc3Mge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTpwcmVzcycsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHt9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBpZDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBuYW1lOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbENsYXNzTmFtZTogJ2NvbnRyb2wtbGFiZWwnLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb25DbGFzc05hbWU6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJUYWdOYW1lOiAnaDQnLFxuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAnaW5wdXQnLFxuICAgICAgICAgICAgdXBkYXRlTW9kZWw6IHRydWVcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJzID0gXy5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdFRyaWdnZXJzKCksIHRoaXMudHJpZ2dlcnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERlZmF1bHRUcmlnZ2VyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIGRlZmF1bHRUcmlnZ2VycyA9IHt9O1xuXG4gICAgICAgICAgICBfLmVhY2godGhpcy5kZWZhdWx0VHJpZ2dlcnMsIGZ1bmN0aW9uKHRyaWdnZXIsIGtleSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0Lm9wdGlvbnMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgPSBrZXkucmVwbGFjZSgne3snK25hbWUrJ319JywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0VHJpZ2dlcnNba2V5LnRyaW0oKV0gPSB0cmlnZ2VyO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VHJpZ2dlcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGQoKS5ibHVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkuZm9jdXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldElucHV0VmFsdWUodGhpcy5nZXRPcHRpb24oJ3ZhbHVlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzYXZlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZ2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3VwZGF0ZU1vZGVsJykgPT09IHRydWUgJiYgdGhpcy5tb2RlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KHRoaXMuZ2V0T3B0aW9uKCduYW1lJyksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRJbnB1dFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbigkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpLFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSwgcm9vdC5NYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5CbG9ja0Zvcm1FcnJvciA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLWVycm9yJyksXG5cbiAgICAgICAgdGFnTmFtZTogJ3NwYW4nLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2hlbHAtYmxvY2snLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBpbnB1dCBmaWVsZCBuYW1lXG4gICAgICAgICAgICBmaWVsZDogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgVGhlIGlucHV0IGZpZWxkIGVycm9yc1xuICAgICAgICAgICAgZXJyb3JzOiBbXSxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIElmIHRydWUgZXJyb3JzIHdpbGwgaGF2ZSA8YnI+IHRhZ3MgdG8gYnJlYWsgZXJyb3IgaW50byBuZXdsaW5lc1xuICAgICAgICAgICAgbmV3bGluZTogdHJ1ZVxuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmKCFfLmlzQXJyYXkob3B0aW9ucy5lcnJvcnMpKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcnMgPSBbb3B0aW9ucy5lcnJvcnNdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBUb29sYm94LklubGluZUZvcm1FcnJvciA9IFRvb2xib3guQmxvY2tGb3JtRXJyb3IuZXh0ZW5kKHtcblxuICAgICAgICBjbGFzc05hbWU6ICdoZWxwLWlubGluZSdcblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5CYXNlRm9ybSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRhZ05hbWU6ICdmb3JtJyxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ3N1Ym1pdCc6ICdzdWJtaXQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNTdWJtaXR0aW5nOiBmYWxzZSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBBbiBvYmplY3Qgb2YgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgIGFjdGl2aXR5SW5kaWNhdG9yT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3NtYWxsJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGVycm9yIHZpZXcgb2JqZWN0XG4gICAgICAgICAgICBlcnJvclZpZXc6IFRvb2xib3guQmxvY2tGb3JtRXJyb3IsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBlcnJvciB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBlcnJvclZpZXdPcHRpb25zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGdsb2JhbCBlcnJvciB2aWV3IG9iamVjdFxuICAgICAgICAgICAgZ2xvYmFsRXJyb3JzVmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBnbG9iYWwgZXJyb3IgdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgZ2xvYmFsRXJyb3JzT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIHNob3dFbXB0eU1lc3NhZ2U6IGZhbHNlXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgU2hvdyBnbG9iYWwgZXJyb3JzIGFmdGVyIGZvcm0gc3VibWl0c1xuICAgICAgICAgICAgc2hvd0dsb2JhbEVycm9yczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBTaG93IG5vdGlmaWNhdGlvbnMgYWZ0ZXIgZm9ybSBzdWJtaXRzXG4gICAgICAgICAgICBzaG93Tm90aWZpY2F0aW9uczogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIG5vdGlmaWNhdGlvbiB2aWV3IG9iamVjdFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uVmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBub3RpZmljYXRpb24gdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uVmlld09wdGlvbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgZm9ybSBncm91cCBjbGFzcyBuYW1lXG4gICAgICAgICAgICBmb3JtR3JvdXBDbGFzc05hbWU6ICdmb3JtLWdyb3VwJyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGhhcyBlcnJvciBjbGFzcyBuYW1lXG4gICAgICAgICAgICBoYXNFcnJvckNsYXNzTmFtZTogJ2hhcy1lcnJvcicsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBBZGQgdGhlIGhhcyBlcnJvciBjbGFzc2VzIHRvIGZpZWxkc1xuICAgICAgICAgICAgYWRkSGFzRXJyb3JDbGFzczogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIEFkZCB0aGUgaW5saW5lIGZvcm0gZXJyb3JzXG4gICAgICAgICAgICBzaG93SW5saW5lRXJyb3JzOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgcmVkaXJlY3QgdXJsLiBGYWxzZSBpZiBubyByZWRpcmVjdFxuICAgICAgICAgICAgcmVkaXJlY3Q6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgc3VjY2VzcyBtZXNzYWdlIG9iamVjdFxuICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZGVmYXVsdCBzdWNjZXNzIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBkZWZhdWx0U3VjY2Vzc01lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtY2hlY2snLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1N1Y2Nlc3MhJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGZvcm0gd2FzIHN1Y2Nlc3NmdWxseSBzdWJtaXR0ZWQuJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGVycnByIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZGVmYXVsdCBzdWNjZXNzIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBkZWZhdWx0RXJyb3JNZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgaWNvbjogJ2ZhIGZhLXdhcm5pbmcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdhbGVydCcsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdFcnJvciEnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgZm9ybSBjb3VsZCBub3QgYmUgc3VibWl0dGVkLidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfc2VyaWFsaXplZEZvcm06IGZhbHNlLFxuXG4gICAgICAgIF9lcnJvclZpZXdzOiBmYWxzZSxcblxuICAgICAgICBnZXRGb3JtRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZm9ybURhdGEgPSB7fTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaXNBcnJheShrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5ICYmIGtleS5tYXRjaCgvXFxbKFxcZCspP1xcXS8pID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmVhY2godGhpcy4kZWwuc2VyaWFsaXplQXJyYXkoKSwgZnVuY3Rpb24oZmllbGQsIHgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViamVjdCA9IGZvcm1EYXRhLCBsYXN0S2V5LCBtYXRjaGVzID0gZmllbGQubmFtZS5tYXRjaCgvXlxcdyt8XFxbKFxcdyspP1xcXS9nKTtcblxuICAgICAgICAgICAgICAgIF8uZWFjaChtYXRjaGVzLCBmdW5jdGlvbihtYXRjaCwgaSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbWF0Y2gucmVwbGFjZSgvW1xcW1xcXV0vZywgJycpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dEtleSA9IG1hdGNoZXNbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNMYXN0TWF0Y2ggPSBtYXRjaGVzLmxlbmd0aCAtIDEgPT0gaTtcblxuICAgICAgICAgICAgICAgICAgICBpZihpc0FycmF5KG1hdGNoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3QucHVzaChmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0LnNwbGljZShrZXksIDAsIGZpZWxkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFzdWJqZWN0W2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0W2tleV0gPSBuZXh0S2V5ICYmIGlzQXJyYXkobmV4dEtleSkgPyBbXSA6IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc0xhc3RNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3Rba2V5XSA9IGZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0ID0gc3ViamVjdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFzdEtleSA9IGtleTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZm9ybURhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLypcbiAgICAgICAgZ2V0Rm9ybURhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gc3RyaXBCcmFja2V0cyhjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IGNvbXBvbmVudC5tYXRjaCgvW15cXFtcXF1dKy8pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXMgPyBtYXRjaGVzWzBdIDogZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGFkZENvbXBvbmVudChzdWJqZWN0LCBjb21wb25lbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYoIXN1YmplY3RbY29tcG9uZW50XSkge1xuICAgICAgICAgICAgICAgICAgICBzdWJqZWN0W2NvbXBvbmVudF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3ViamVjdFtjb21wb25lbnRdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRDb21wb25lbnRzKHN1YmplY3QsIGNvbXBvbmVudHMsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKGNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCwgaSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFyaWFibGUgPSBzdHJpcEJyYWNrZXRzKGNvbXBvbmVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYodmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3QgPSBhZGRDb21wb25lbnQoc3ViamVjdCwgdmFyaWFibGUsIGNvbXBvbmVudHMubGVuZ3RoID4gaSArIDEgPyB7fSA6IHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gYXJyYXkgbGlrZSBbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU9iamVjdHMocm9vdCwgY29tcG9uZW50cywgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZighZGF0YVtyb290XSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhW3Jvb3RdID0ge307XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYWRkQ29tcG9uZW50cyhkYXRhW3Jvb3RdLCBjb21wb25lbnRzLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0LCBzZWxlY3QsIHRleHRhcmVhJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9ICQodGhpcykuYXR0cignbmFtZScpO1xuXG4gICAgICAgICAgICAgICAgaWYoKCQodGhpcykuaXMoJzpyYWRpbycpIHx8ICQodGhpcykuaXMoJzpjaGVja2JveCcpKSkge1xuICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKG5hbWUgJiYgKCFfLmlzTnVsbCh2YWx1ZSkgJiYgIV8uaXNVbmRlZmluZWQodmFsdWUpKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IG5hbWUubWF0Y2goLyheXFx3Kyk/KFxcWy4qIT9cXF0pLyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJvb3QgPSBtYXRjaGVzWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBtYXRjaGVzWzJdLm1hdGNoKC9cXFsuKj9cXF0vZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU9iamVjdHMocm9vdCwgY29tcG9uZW50cywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2RhdGEnLCB0aGlzLiRlbC5zZXJpYWxpemVBcnJheSgpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG4gICAgICAgICovXG5cbiAgICAgICAgc2hvd0FjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGluZGljYXRvciA9IHRoaXMuJGVsLmZpbmQoJy5mb3JtLWluZGljYXRvcicpO1xuXG4gICAgICAgICAgICBpZih0aGlzLiRpbmRpY2F0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kaW5kaWNhdG9yID0gJCgnPGRpdiBjbGFzcz1cImZvcm0taW5kaWNhdG9yXCI+PC9kaXY+Jyk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLiRlbC5maW5kKCdmb290ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnZm9vdGVyJykuYXBwZW5kKHRoaXMuJGluZGljYXRvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy4kaW5kaWNhdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yID0gbmV3IEJhY2tib25lLk1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kaW5kaWNhdG9yLmdldCgwKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBpbmRpY2F0b3IgPSBuZXcgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvcih0aGlzLmdldE9wdGlvbignYWN0aXZpdHlJbmRpY2F0b3JPcHRpb25zJykpO1xuXG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5zaG93KGluZGljYXRvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuJGVycm9ycykge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0aGlzLiRlcnJvcnMsIGZ1bmN0aW9uKCRlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAkZXJyb3IucGFyZW50cygnLicrdGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmdldEZvcm1EYXRhKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0Zvcm1DaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9zZXJpYWxpemVkRm9ybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlcmlhbGl6ZWRGb3JtICE9PSB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUdsb2JhbEVycm9yc1JlZ2lvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdnbG9iYWxFcnJvcnNWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guVW5vcmRlcmVkTGlzdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kZ2xvYmFsRXJyb3JzID0gJCgnPGRpdiBjbGFzcz1cImdsb2JhbC1lcnJvcnNcIj48L2Rpdj4nKTtcblxuICAgICAgICAgICAgdGhpcy5hcHBlbmRHbG9iYWxFcnJvclJlZ2lvblRvRG9tKHRoaXMuJGdsb2JhbEVycm9ycyk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsRXJyb3JzID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kZ2xvYmFsRXJyb3JzLmdldCgwKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBlcnJvcnNWaWV3ID0gbmV3IFZpZXcoXy5leHRlbmQodGhpcy5nZXRPcHRpb24oJ2dsb2JhbEVycm9yc09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICB0aGlzLmdsb2JhbEVycm9ycy5zaG93KGVycm9yc1ZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZEdsb2JhbEVycm9yUmVnaW9uVG9Eb206IGZ1bmN0aW9uKCRnbG9iYWxFcnJvcnMpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnByZXBlbmQoJGdsb2JhbEVycm9ycyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uOiBmdW5jdGlvbihub3RpY2UpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ25vdGlmaWNhdGlvblZpZXcnKTtcblxuICAgICAgICAgICAgaWYoIVZpZXcpIHtcbiAgICAgICAgICAgICAgICBWaWV3ID0gVG9vbGJveC5Ob3RpZmljYXRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHR5cGU6IG5vdGljZS50eXBlID8gbm90aWNlLnR5cGUgOiAnYWxlcnQnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBub3RpY2UudGl0bGUgPyBub3RpY2UudGl0bGUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSA/IG5vdGljZS5tZXNzYWdlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaWNvbjogbm90aWNlLmljb24gPyBub3RpY2UuaWNvbiA6IGZhbHNlXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignbm90aWZpY2F0aW9uVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVFcnJvcjogZnVuY3Rpb24oZmllbGQsIGVycm9yKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXcnKTtcblxuICAgICAgICAgICAgdmFyIG1vZGVsID0gbmV3IEJhY2tib25lLk1vZGVsKCk7XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe30sIHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXdPcHRpb25zJyksIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICAgICAgZXJyb3JzOiBlcnJvclxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkUGFyZW50OiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWVsZChmaWVsZCkucGFyZW50cygnLicgKyB0aGlzLmdldE9wdGlvbignZm9ybUdyb3VwQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICBmaWVsZCA9IGZpZWxkLnJlcGxhY2UoJy4nLCAnXycpO1xuXG4gICAgICAgICAgICB2YXIgJGZpZWxkID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInK2ZpZWxkKydcIl0nKTtcblxuICAgICAgICAgICAgaWYoJGZpZWxkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkZmllbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnIycrZmllbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldElucHV0RmllbGQ6IGZ1bmN0aW9uKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKGZpZWxkKS52YWwodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZEhhc0Vycm9yQ2xhc3NUb0ZpZWxkOiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGRQYXJlbnQoZmllbGQpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVIYXNFcnJvckNsYXNzRnJvbUZpZWxkOiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGRQYXJlbnQoZmllbGQpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVHbG9iYWxFcnJvcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nbG9iYWxFcnJvcnMgJiYgdGhpcy5nbG9iYWxFcnJvcnMuY3VycmVudFZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbEVycm9ycy5jdXJyZW50Vmlldy5jb2xsZWN0aW9uLnJlc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9jdXNPbkZpcnN0RXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gJ2Rpdi4nK3RoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKyc6Zmlyc3QnO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5maW5kKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpXG4gICAgICAgICAgICAgICAgLmZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kRXJyb3JWaWV3VG9HbG9iYWw6IGZ1bmN0aW9uKGVycm9yVmlldykge1xuICAgICAgICAgICAgdGhpcy5nbG9iYWxFcnJvcnMuY3VycmVudFZpZXcuY29sbGVjdGlvbi5hZGQoe1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGVycm9yVmlldy5nZXRPcHRpb24oJ2Vycm9ycycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmRFcnJvclZpZXdUb0ZpZWxkOiBmdW5jdGlvbihlcnJvclZpZXcpIHtcbiAgICAgICAgICAgIGVycm9yVmlldy5yZW5kZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkUGFyZW50KGVycm9yVmlldy5nZXRPcHRpb24oJ2ZpZWxkJykpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChlcnJvclZpZXcuJGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93R2xvYmFsRXJyb3JzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdsb2JhbEVycm9ycygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihfLmlzQXJyYXkodGhpcy5fZXJyb3JWaWV3cykpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2godGhpcy5fZXJyb3JWaWV3cywgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWRkSGFzRXJyb3JDbGFzcycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUhhc0Vycm9yQ2xhc3NGcm9tRmllbGQodmlldy5nZXRPcHRpb24oJ2ZpZWxkJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmxpbmVFcnJvcnMnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlldy4kZWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93RXJyb3I6IGZ1bmN0aW9uKGZpZWxkLCBlcnJvcikge1xuICAgICAgICAgICAgaWYoIXRoaXMuX2Vycm9yVmlld3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lcnJvclZpZXdzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlcnJvclZpZXcgPSB0aGlzLmNyZWF0ZUVycm9yKGZpZWxkLCBlcnJvcik7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93R2xvYmFsRXJyb3JzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZEVycm9yVmlld1RvR2xvYmFsKGVycm9yVmlldyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhZGRIYXNFcnJvckNsYXNzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEhhc0Vycm9yQ2xhc3NUb0ZpZWxkKGZpZWxkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmxpbmVFcnJvcnMnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kRXJyb3JWaWV3VG9GaWVsZChlcnJvclZpZXcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9lcnJvclZpZXdzLnB1c2goZXJyb3JWaWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93RXJyb3JzOiBmdW5jdGlvbihlcnJvcnMpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgXy5lYWNoKGVycm9ycywgZnVuY3Rpb24oZXJyb3IsIGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgdC5zaG93RXJyb3IoZmllbGQsIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzT25GaXJzdEVycm9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZUFjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuaW5kaWNhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IuZW1wdHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFcnJvcnNGcm9tUmVzcG9uc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucmVzcG9uc2VKU09OLmVycm9ycztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZWRpcmVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3JlZGlyZWN0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVkaXJlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gdGhpcy5nZXRSZWRpcmVjdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTdWNjZXNzTm90aWZpY2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSB0aGlzLmNyZWF0ZU5vdGlmaWNhdGlvbihfLmV4dGVuZChcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZGVmYXVsdFN1Y2Nlc3NNZXNzYWdlJyksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3N1Y2Nlc3NNZXNzYWdlJylcbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICBub3RpZmljYXRpb24uc2hvdygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dFcnJvck5vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gdGhpcy5jcmVhdGVOb3RpZmljYXRpb24oXy5leHRlbmQoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ2RlZmF1bHRFcnJvck1lc3NhZ2UnKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZXJyb3JNZXNzYWdlJylcbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICBub3RpZmljYXRpb24uc2hvdygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlcmlhbGl6ZWRGb3JtID0gdGhpcy5zZXJpYWxpemUoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dHbG9iYWxFcnJvcnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlR2xvYmFsRXJyb3JzUmVnaW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRTdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuaGFzRm9ybUNoYW5nZWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZm9ybTpjaGFuZ2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2VyaWFsaXplZEZvcm0gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd05vdGlmaWNhdGlvbnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1N1Y2Nlc3NOb3RpZmljYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3JlZGlyZWN0JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZGlyZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRDb21wbGV0ZTogZnVuY3Rpb24oc3RhdHVzLCBtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTdWJtaXR0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmhpZGVFcnJvcnMoKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZUFjdGl2aXR5SW5kaWNhdG9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRFcnJvcjogZnVuY3Rpb24obW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd05vdGlmaWNhdGlvbnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yTm90aWZpY2F0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9ycyh0aGlzLmdldEVycm9yc0Zyb21SZXNwb25zZShyZXNwb25zZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYoIXRoaXMuaXNTdWJtaXR0aW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1N1Ym1pdHRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FjdGl2aXR5SW5kaWNhdG9yKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmUodGhpcy5nZXRGb3JtRGF0YSgpLCB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzdWJtaXQ6Y29tcGxldGUnLCB0cnVlLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzdWJtaXQ6c3VjY2VzcycsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc3VibWl0OmNvbXBsZXRlJywgZmFsc2UsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3N1Ym1pdDplcnJvcicsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydiYWNrYm9uZSddLCBmdW5jdGlvbihCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm9Vbm9yZGVyZWRMaXN0SXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLXVub3JkZXJlZC1saXN0LWl0ZW0nKSxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0bWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zO1xuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94LlVub3JkZXJlZExpc3RJdGVtID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHRjbGFzc05hbWU6ICd1bm9yZGVyZWQtbGlzdC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKGUsIG9iaikge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrJywgb2JqKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNcblx0XHR9LFxuXG4gICAgICAgIGdldFRlbXBsYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmdldE9wdGlvbigndGVtcGxhdGUnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb29sYm94LlRlbXBsYXRlKCd1bm9yZGVyZWQtbGlzdC1pdGVtJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndGVtcGxhdGUnKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cdFRvb2xib3guVW5vcmRlcmVkTGlzdCA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuXHRcdGNoaWxkVmlldzogVG9vbGJveC5Vbm9yZGVyZWRMaXN0SXRlbSxcblxuXHRcdGNsYXNzTmFtZTogJ3Vub3JkZXJlZC1saXN0JyxcblxuXHRcdHRhZ05hbWU6ICd1bCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKG9iamVjdCkgVGhlIHZpZXcgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGVtcHR5IG1lc3NhZ2Vcblx0XHRcdGVtcHR5TWVzc2FnZVZpZXc6IFRvb2xib3guTm9Vbm9yZGVyZWRMaXN0SXRlbSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGVyZSBhcmUgbm8gbGlzdCBpdGVtc1xuXHRcdFx0ZW1wdHlNZXNzYWdlOiAnVGhlcmUgYXJlIG5vIGl0ZW1zIGluIHRoZSBsaXN0LicsXG5cblx0XHRcdC8vIChib29sKSBTaG93IHRoZSBlbXB0eSBtZXNzYWdlIHZpZXdcblx0XHRcdHNob3dFbXB0eU1lc3NhZ2U6IHRydWVcblx0XHR9LFxuXG5cdFx0Y2hpbGRFdmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdpdGVtOmNsaWNrJywgdmlldyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0VG9vbGJveC5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG5cdFx0XHRpZighdGhpcy5jb2xsZWN0aW9uKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuICAgICAgICBnZXRFbXB0eVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcdGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93RW1wdHlNZXNzYWdlJykpIHtcblx0ICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlVmlldycpO1xuXG5cdCAgICAgICAgICAgIFZpZXcgPSBWaWV3LmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG5cdCAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZScpXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBWaWV3O1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnYmFja2JvbmUnXSwgZnVuY3Rpb24oQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIHJvb3QuQmFja2JvbmUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkRyb3Bkb3duTWVudU5vSXRlbXMgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZHJvcGRvd24tbWVudS1uby1pdGVtcycpLFxuXG5cdFx0Y2xhc3NOYW1lOiAnbm8tcmVzdWx0cydcblxuXHR9KTtcblxuXHRUb29sYm94LkRyb3Bkb3duTWVudUl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZHJvcGRvd24tbWVudS1pdGVtJyksXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0ZGl2aWRlckNsYXNzTmFtZTogJ2RpdmlkZXInXG5cdFx0fSxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2snOiB7XG5cdFx0XHRcdGV2ZW50OiAnY2xpY2snLFxuXHRcdFx0XHRwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG5cdFx0XHRcdHN0b3BQcm9wYWdhdGlvbjogZmFsc2Vcblx0XHQgICAgfVxuXHRcdH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgYSc6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYoXy5pc0Z1bmN0aW9uKHRoaXMubW9kZWwuZ2V0KCdvbkNsaWNrJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0KCdvbkNsaWNrJykuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdkaXZpZGVyJykgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RpdmlkZXJDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guRHJvcGRvd25NZW51ID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3Q29udGFpbmVyOiAndWwnLFxuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94LkRyb3Bkb3duTWVudUl0ZW0sXG5cblx0XHRlbXB0eVZpZXc6IFRvb2xib3guRHJvcGRvd25NZW51Tm9JdGVtcyxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdkcm9wZG93bi1tZW51JyksXG5cblx0XHRjbGFzc05hbWU6ICdkcm9wZG93bicsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0Y2hpbGRFdmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ2Nsb3NlT25DbGljaycpID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0dGhpcy5oaWRlTWVudSgpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2l0ZW06Y2xpY2snLCB2aWV3KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayAuZHJvcGRvd24tdG9nZ2xlJzogJ3RvZ2dsZTpjbGljaydcblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgbWVudSBpdGVtcyB0byBiZSBjb252ZXJ0ZWQgdG8gYSBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgaXRlbXM6IFtdLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIHRleHRcblx0XHRcdHRvZ2dsZUxhYmVsOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIHRvZ2dsZSBjbGFzcyBuYW1lXG5cdFx0XHR0b2dnbGVDbGFzc05hbWU6ICdkcm9wZG93bi10b2dnbGUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGljb24gY2xhc3MgbmFtZVxuXHRcdFx0dG9nZ2xlSWNvbkNsYXNzTmFtZTogJ2ZhIGZhLWNhcmV0LWRvd24nLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gbWVudSBjbGFzcyBuYW1lXG5cdFx0XHRtZW51Q2xhc3NOYW1lOiAnZHJvcGRvd24tbWVudScsXG5cblx0XHRcdC8vIChpbnR8Ym9vbCkgVGhlIGNvbGxlY3Rpb24gbGltaXRcblx0XHRcdGxpbWl0OiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIG9yZGVyIG9mIHRoZSBjb2xsZWN0aW9uIGl0ZW1zXG5cdFx0XHRvcmRlcjogJ25hbWUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBFaXRoZXIgYXNjIG9yIGRlc2Ncblx0XHRcdHNvcnQ6ICdhc2MnLFxuXG5cdFx0XHQvLyAoYm9vbCkgQ2xvc2UgdGhlIG1lbnUgYWZ0ZXIgYW4gaXRlbSBoYXMgYmVlbiBjbGlja2VkXG5cdFx0XHRjbG9zZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBGZXRjaCB0aGUgY29sbGVjdGlvbiB3aGVuIHRoZSBkcm9wZG93biBtZW51IGlzIHNob3duXG5cdFx0XHRmZXRjaE9uU2hvdzogZmFsc2UsXG5cblx0XHRcdC8vIChib29sKSBTaG93IGFuIGFjdGl2aXR5IGluZGljYXRvciB3aGVuIGZldGNoaW5nIHRoZSBjb2xsZWN0aW9uXG5cdFx0XHRzaG93SW5kaWNhdG9yOiB0cnVlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGNsYXNzIG5hbWVcblx0XHRcdHRvZ2dsZUNsYXNzTmFtZTogJ29wZW4nXG5cdFx0fSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRUb29sYm94LkNvbXBvc2l0ZVZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0dGhpcy5vbignZmV0Y2gnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmRpY2F0b3InKSkge1xuXHRcdFx0XHRcdHRoaXMuc2hvd0luZGljYXRvcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5vbignZmV0Y2g6c3VjY2VzcyBmZXRjaDplcnJvcicsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignc2hvd0luZGljYXRvcicpKSB7XG5cdFx0XHRcdFx0dGhpcy5oaWRlSW5kaWNhdG9yKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG4gICAgICAgICAgICBpZighdGhpcy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24odGhpcy5nZXRPcHRpb24oJ2l0ZW1zJykpO1xuICAgICAgICAgICAgfVxuXHRcdH0sXG5cblx0XHRzaG93SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBBY3Rpdml0eVZpZXdJdGVtID0gVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5leHRlbmQoe1xuXHRcdFx0XHR0YWdOYW1lOiAnbGknLFxuXHRcdFx0XHRjbGFzc05hbWU6ICdhY3Rpdml0eS1pbmRpY2F0b3ItaXRlbScsXG5cdFx0XHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0XHRcdHRoaXMub3B0aW9ucy5pbmRpY2F0b3IgPSAnc21hbGwnO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5hZGRDaGlsZChuZXcgQmFja2JvbmUuTW9kZWwoKSwgQWN0aXZpdHlWaWV3SXRlbSk7XG5cdFx0fSxcblxuXHRcdGhpZGVJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHZpZXcgPSB0aGlzLmNoaWxkcmVuLmZpbmRCeUluZGV4KDApO1xuXG5cdFx0XHRpZih2aWV3ICYmIHZpZXcgaW5zdGFuY2VvZiBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKSB7XG5cdFx0XHRcdHRoaXMuY2hpbGRyZW4ucmVtb3ZlKHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoMCkpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzaG93TWVudTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuXHRcdH0sXG5cblx0XHRoaWRlTWVudTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblx0XHR9LFxuXG5cdFx0aXNNZW51VmlzaWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKS5wYXJlbnQoKS5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpO1xuXHRcdH0sXG5cblx0XHRvblRvZ2dsZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKCF0aGlzLmlzTWVudVZpc2libGUoKSkge1xuXHRcdFx0XHR0aGlzLnNob3dNZW51KCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy5oaWRlTWVudSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvblNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHQgPSB0aGlzO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbignZmV0Y2hPblNob3cnKSkge1xuXHRcdFx0XHR0aGlzLmZldGNoKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGZldGNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdmZXRjaCcpO1xuXG5cdFx0XHR0aGlzLmNvbGxlY3Rpb24uZmV0Y2goe1xuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0bGltaXQ6IHRoaXMuZ2V0T3B0aW9uKCdsaW1pdCcpLFxuXHRcdFx0XHRcdG9yZGVyOiB0aGlzLmdldE9wdGlvbignb3JkZXInKSxcblx0XHRcdFx0XHRzb3J0OiB0aGlzLmdldE9wdGlvbignc29ydCcpLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuXHRcdFx0XHRcdGlmKHQuZ2V0T3B0aW9uKCdzaG93SW5kaWNhdG9yJykpIHtcblx0XHRcdFx0XHRcdHQuaGlkZUluZGljYXRvcigpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHQucmVuZGVyKCk7XG5cdFx0XHRcdFx0dC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpzdWNjZXNzJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHR0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UcmVlVmlld05vZGUgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZ2V0VGVtcGxhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuZ2V0T3B0aW9uKCd0ZW1wbGF0ZScpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHRlbXBsYXRlIG9wdGlvbiBtdXN0IGJlIHNldC4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCd0ZW1wbGF0ZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRhZ05hbWU6ICdsaScsXG5cbiAgICAgICAgY2xhc3NOYW1lOiAndHJlZS12aWV3LW5vZGUnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiAge1xuICAgICAgICAgICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG4gICAgICAgICAgICBwYXJlbnRBdHRyaWJ1dGU6ICdwYXJlbnRfaWQnLFxuICAgICAgICAgICAgY2hpbGRWaWV3Q29udGFpbmVyOiAnLmNoaWxkcmVuJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdpZEF0dHJpYnV0ZScpKSB8fCB0aGlzLm1vZGVsLmNpZCxcbiAgICAgICAgICAgICAgICAnZGF0YS1wYXJlbnQtaWQnOiB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbigncGFyZW50QXR0cmlidXRlJykpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5Db21wb3NpdGVWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbiA9IHRoaXMubW9kZWwuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLm1vZGVsO1xuXG4gICAgICAgICAgICB0aGlzLmNoaWxkVmlld09wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucywgdGhpcy5nZXRPcHRpb24oJ2NoaWxkVmlld09wdGlvbnMnKSB8fCB7fSk7XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBoYXNDaGlsZHJlbjogIHRoaXMuY29sbGVjdGlvbiA/IHRoaXMuY29sbGVjdGlvbi5sZW5ndGggPiAwIDogZmFsc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVHJlZVZpZXcgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94LlRyZWVWaWV3Tm9kZSxcblxuICAgICAgICB0YWdOYW1lOiAndWwnLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3RyZWUtdmlldycsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIG5lc3RhYmxlOiB0cnVlXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkNvbGxlY3Rpb25WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jaGlsZFZpZXdPcHRpb25zID0gXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICB0cmVlUm9vdDogdGhpcyxcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdjaGlsZFZpZXdPcHRpb25zJykgfHwge30pO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2pxdWVyeScsICdiYWNrYm9uZS5tYXJpb25ldHRlJywgJ2ludGVyYWN0LmpzJ10sIGZ1bmN0aW9uKF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdpbnRlcmFjdC5qcycpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kLCByb290Lk1hcmlvbmV0dGUsIHJvb3QuaW50ZXJhY3QpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG5cbiAgICBmdW5jdGlvbiBnZXRJZEF0dHJpYnV0ZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gXy5pc051bGwobmV3IFN0cmluZyh2YWx1ZSkubWF0Y2goL15jXFxkKyQvKSkgPyAnaWQnIDogJ2NpZCc7XG4gICAgfVxuXG4gICAgVG9vbGJveC5EcmFnZ2FibGVUcmVlTm9kZSA9IFRvb2xib3guVHJlZVZpZXdOb2RlLmV4dGVuZCh7XG5cbiAgICAgICAgY2xhc3NOYW1lOiAnZHJhZ2dhYmxlLXRyZWUtbm9kZScsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBUb29sYm94LlRyZWVWaWV3Tm9kZS5wcm90b3R5cGUuZGVmYXVsdE9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBtZW51Q2xhc3NOYW1lOiAnbWVudScsXG4gICAgICAgICAgICAgICAgbWVudVZpZXc6IFRvb2xib3guRHJvcGRvd25NZW51LFxuICAgICAgICAgICAgICAgIG1lbnVWaWV3T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAnZGl2J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zOiBbXSxcbiAgICAgICAgICAgICAgICBuZXN0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcm9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RyZWVSb290Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TWVudUNvbnRhaW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnLicgKyB0aGlzLmdldE9wdGlvbignbWVudUNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdtZW51VmlldycpLCBjb250YWluZXIgPSB0aGlzLmdldE1lbnVDb250YWluZXIoKTtcblxuICAgICAgICAgICAgaWYoVmlldyAmJiBjb250YWluZXIubGVuZ3RoKSB7XG4gICAgICAgIFx0XHR2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbignbWVudVZpZXdPcHRpb25zJyksIHtcbiAgICAgICAgXHRcdFx0aXRlbXM6IHRoaXMuZ2V0T3B0aW9uKCdtZW51SXRlbXMnKVxuICAgICAgICBcdFx0fSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51ID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZWw6IGNvbnRhaW5lci5nZXQoMClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5zaG93KHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcm9wJyk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcywgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgIHZhciBub2RlV2hlcmUgPSB7fSwgcGFyZW50V2hlcmUgPSB7fTtcblxuICAgICAgICAgICAgdmFyIGlkID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgICAgIG5vZGVXaGVyZVtnZXRJZEF0dHJpYnV0ZShpZCldID0gaWQ7XG4gICAgICAgICAgICBwYXJlbnRXaGVyZVtnZXRJZEF0dHJpYnV0ZShwYXJlbnRJZCldID0gcGFyZW50SWQ7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gc2VsZi5yb290KCkuY29sbGVjdGlvbi5maW5kKG5vZGVXaGVyZSk7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gc2VsZi5yb290KCkuY29sbGVjdGlvbi5maW5kKHBhcmVudFdoZXJlKTtcblxuICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5yZW1vdmVOb2RlKG5vZGUpO1xuXG4gICAgICAgICAgICBpZigkdGFyZ2V0Lmhhc0NsYXNzKCdkcm9wLWJlZm9yZScpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlQmVmb3JlKG5vZGUsIHBhcmVudCk7XG4gICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpiZWZvcmUnLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCR0YXJnZXQuaGFzQ2xhc3MoJ2Ryb3AtYWZ0ZXInKSkge1xuICAgICAgICAgICAgICAgIHNlbGYucm9vdCgpLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUFmdGVyKG5vZGUsIHBhcmVudCk7XG4gICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoJHRhcmdldC5oYXNDbGFzcygnZHJvcC1jaGlsZHJlbicpKSB7XG4gICAgICAgICAgICAgICAgaWYoJChldmVudC50YXJnZXQpLmZpbmQoJy5jaGlsZHJlbicpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJjaGlsZHJlblwiIC8+Jyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoc2VsZi5nZXRPcHRpb24oJ25lc3RhYmxlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlKG5vZGUsIHBhcmVudCwge2F0OiAwfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihub2RlLCBwYXJlbnQsIHthdDogMH0pO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIFRvb2xib3guRHJvcHpvbmVzKGV2ZW50LmRyYWdFdmVudCwgZXZlbnQudGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgYmVmb3JlOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGVCZWZvcmUobm9kZSwgcGFyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpiZWZvcmUnLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhZnRlcjogZnVuY3Rpb24oJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlQWZ0ZXIobm9kZSwgcGFyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZihzZWxmLmdldE9wdGlvbignbmVzdGFibGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlKG5vZGUsIHBhcmVudCwge2F0OiAwfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmNoaWxkcmVuJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlQWZ0ZXIobm9kZSwgcGFyZW50LCB7YXQ6IDB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSwgdGhpcywgdHJ1ZSk7XG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBzZWxmLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ0VudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW50ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wTW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIFRvb2xib3guRHJvcHpvbmVzKGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgYmVmb3JlOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygnZHJvcC1iZWZvcmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdkcm9wLWFmdGVyIGRyb3AtY2hpbGRyZW4nKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFmdGVyOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LmRyb3B6b25lLmVsZW1lbnQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnZHJvcC1hZnRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2Ryb3AtYmVmb3JlIGRyb3AtY2hpbGRyZW4nKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbmVzdGFibGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChldmVudC5kcm9wem9uZS5lbGVtZW50KCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdkcm9wLWNoaWxkcmVuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2Ryb3AtYWZ0ZXIgZHJvcC1iZWZvcmUnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW50ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EcmFnTW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAgICAgICB2YXIgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSArIGV2ZW50LmR4O1xuICAgICAgICAgICAgdmFyIHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCkgKyBldmVudC5keTtcblxuICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCAnICsgeSArICdweCknO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuICAgICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG4gICAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJhZzptb3ZlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dob3N0RWxlbWVudCA9ICR0YXJnZXQubmV4dCgnLicgKyB0aGlzLmNsYXNzTmFtZSkuY3NzKHtcbiAgICAgICAgICAgICAgICAnbWFyZ2luLXRvcCc6ICR0YXJnZXQub3V0ZXJIZWlnaHQoKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX2dob3N0RWxlbWVudC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2dob3N0RWxlbWVudCA9ICR0YXJnZXQucHJldigpLmxlbmd0aCA/ICR0YXJnZXQucHJldigpIDogJHRhcmdldC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9naG9zdEVsZW1lbnQuY3NzKHsnbWFyZ2luLWJvdHRvbSc6ICR0YXJnZXQub3V0ZXJIZWlnaHQoKX0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkdGFyZ2V0LmNzcyh7XG4gICAgICAgICAgICAgICAgJ2xlZnQnOiBldmVudC5jbGllbnRYIC0gNTAsXG4gICAgICAgICAgICAgICAgJ3RvcCc6IGV2ZW50LmNsaWVudFkgLSAyNSxcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiAkdGFyZ2V0LndpZHRoKClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcmFnOnN0YXJ0JywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ0VuZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuXG4gICAgICAgICAgICB0aGlzLl9naG9zdEVsZW1lbnQuYXR0cignc3R5bGUnLCAnJyk7XG5cbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5hdHRyKHtcbiAgICAgICAgICAgICAgICAnZGF0YS14JzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2RhdGEteSc6IGZhbHNlLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICd3aWR0aCc6ICcnLFxuICAgICAgICAgICAgICAgICdsZWZ0JzogJycsXG4gICAgICAgICAgICAgICAgJ3RvcCc6ICcnLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zvcm0nOiAnJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW5kJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ0xlYXZlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnJlbW92ZUNsYXNzKCdkcm9wLWJlZm9yZSBkcm9wLWFmdGVyIGRyb3AtY2hpbGRyZW4nKTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJhZzpsZWF2ZScsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3BEZWFjdGl2YXRlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnJlbW92ZUNsYXNzKCdkcm9wLWJlZm9yZSBkcm9wLWFmdGVyIGRyb3AtY2hpbGRyZW4nKTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpkZWFjdGl2YXRlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsICRlbCA9IHRoaXMuJGVsO1xuXG4gICAgICAgICAgICBpbnRlcmFjdCh0aGlzLiRlbC5nZXQoMCkpXG4gICAgICAgICAgICAgICAgLmRyYWdnYWJsZSh7XG4gICAgICAgICAgICAgICAgICAgIGF1dG9TY3JvbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9ubW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJhZzptb3ZlJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbmVuZDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW5kJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbnN0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOnN0YXJ0JywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZHJvcHpvbmUoe1xuICAgICAgICAgICAgICAgICAgICBhY2NlcHQ6ICcuJyArIHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICBvdmVybGFwOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgb25kcmFnZW50ZXI6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOmVudGVyJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbmRyYWdsZWF2ZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6bGVhdmUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uZHJvcDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2Ryb3AnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uZHJvcGRlYWN0aXZhdGU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcm9wOmRlYWN0aXZhdGUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbignZHJhZ21vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZihldmVudC5kcm9wem9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcm9wOm1vdmUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zaG93TWVudSgpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnanF1ZXJ5JywgJ2JhY2tib25lLm1hcmlvbmV0dGUnLCAnaW50ZXJhY3QuanMnXSwgZnVuY3Rpb24oXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2ludGVyYWN0LmpzJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LiQsIHJvb3QuTWFyaW9uZXR0ZSwgcm9vdC5pbnRlcmFjdCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpIHtcblxuICAgIFRvb2xib3guRHJhZ2dhYmxlVHJlZVZpZXcgPSBUb29sYm94LlRyZWVWaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94LkRyYWdnYWJsZVRyZWVOb2RlLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2RyYWdnYWJsZS10cmVlJyxcblxuICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiB7XG4gICAgICAgICAgICBpZEF0dHJpYnV0ZTogJ2lkJyxcbiAgICAgICAgICAgIHBhcmVudEF0dHJpYnV0ZTogJ3BhcmVudF9pZCdcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnJlb3JkZXIoKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2pxdWVyeScsICdzcGluLmpzJ10sIGZ1bmN0aW9uKF8sICQsIFNwaW5uZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgJCwgU3Bpbm5lcik7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3NwaW4uanMnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kLCByb290LlNwaW5uZXIpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQsIFNwaW5uZXIpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnYWN0aXZpdHktaW5kaWNhdG9yJyksXG5cbiAgICAgICAgc3Bpbm5pbmc6IGZhbHNlLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBsYWJlbDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbEZvbnRTaXplOiBmYWxzZSxcbiAgICAgICAgICAgIGRpbW1lZEJnQ29sb3I6IGZhbHNlLFxuICAgICAgICAgICAgZGltbWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9TdGFydDogdHJ1ZSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIG1pbkhlaWdodDogJzBweCcsXG4gICAgICAgICAgICBpbmRpY2F0b3I6IHt9LFxuICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDAsXG4gICAgICAgICAgICBkZWZhdWx0SW5kaWNhdG9yOiB7XG4gICAgICAgICAgICAgICAgbGluZXM6IDExLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICBsZW5ndGg6IDE1LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgIHdpZHRoOiAzLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEzLCAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICAgICAgICAgICAgICBjb3JuZXJzOiA0LCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgIHJvdGF0ZTogMCwgLy8gVGhlIHJvdGF0aW9uIG9mZnNldFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMSwgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzAwMCcsIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcbiAgICAgICAgICAgICAgICBzcGVlZDogMSwgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgICAgICAgICAgICAgICB0cmFpbDogNDAsIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgc2hhZG93OiBmYWxzZSwgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcbiAgICAgICAgICAgICAgICBod2FjY2VsOiB0cnVlLCAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdhY3Rpdml0eS1pbmRpY2F0b3Itc3Bpbm5lcicsIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXG4gICAgICAgICAgICAgICAgekluZGV4OiAyZTksIC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxuICAgICAgICAgICAgICAgIHRvcDogJzUwJScsIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcbiAgICAgICAgICAgICAgICBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFByZXNldE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAndGlueSc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA0LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNCwgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEsIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAxNSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdzbWFsbCc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA3LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNywgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEsIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAyMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdtZWRpdW0nOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogMTQsIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMSwgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEsIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAzMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdsYXJnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiAyOCwgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEsIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDIwLCAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICAgICAgICAgICAgICAgICAgY29ybmVyczogMSwgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDYwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB2YXIgcmVzaXplVGltZXIsIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuJGVsLmZpbmQoJy5hY3Rpdml0eS1pbmRpY2F0b3ItbGFiZWwnKS5jc3Moe3RvcDogJyd9KTtcbiAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uTGFiZWwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc2l0aW9uTGFiZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5zcGlubmVyICYmIHRoaXMuZ2V0T3B0aW9uKCdsYWJlbCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyICRsYWJlbCA9IHRoaXMuJGVsLmZpbmQoJy5hY3Rpdml0eS1pbmRpY2F0b3ItbGFiZWwnKTtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gJGxhYmVsLm91dGVySGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IFRvb2xib3guVmlld09mZnNldCgkbGFiZWwuZ2V0KDApKTtcblxuICAgICAgICAgICAgICAgICRsYWJlbC5jaGlsZHJlbigpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGhpcy5zcGlubmVyLm9wdHMubGFiZWxPZmZzZXQgfHwgMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldExhYmVsOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmFjdGl2aXR5LWluZGljYXRvci1sYWJlbCcpLmh0bWwodGhpcy5vcHRpb25zLmxhYmVsID0gdmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNwaW5uZXJPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0SW5kaWNhdG9yID0gdGhpcy5nZXRPcHRpb24oJ2RlZmF1bHRJbmRpY2F0b3InKTtcbiAgICAgICAgICAgIHZhciBpbmRpY2F0b3IgPSB0aGlzLmdldE9wdGlvbignaW5kaWNhdG9yJyk7XG4gICAgICAgICAgICB2YXIgcHJlc2V0cyA9IHRoaXMuZ2V0UHJlc2V0T3B0aW9ucygpO1xuXG4gICAgICAgICAgICBpZihfLmlzU3RyaW5nKGluZGljYXRvcikgJiYgcHJlc2V0c1tpbmRpY2F0b3JdKSB7XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gcHJlc2V0c1tpbmRpY2F0b3JdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih0eXBlb2YgaW5kaWNhdG9yICE9PSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBkZWZhdWx0SW5kaWNhdG9yLCBpbmRpY2F0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNwaW5uZXJEb206IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJy5hY3Rpdml0eS1pbmRpY2F0b3InKS5nZXQoMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zcGlubmluZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXIuc3Bpbih0aGlzLmdldFNwaW5uZXJEb20oKSk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3N0YXJ0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzdG9wJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBzcGlubmVyIG9iamVjdFxuICAgICAgICAgICAgdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIodGhpcy5nZXRTcGlubmVyT3B0aW9ucygpKTtcblxuICAgICAgICAgICAgLy8gc3RhcnQgaWYgb3B0aW9ucy5hdXRvU3RhcnQgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2F1dG9TdGFydCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb25MYWJlbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5Ob0JyZWFkY3J1bWJzID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tYnJlYWRjcnVtYnMnKSxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRjbGFzc05hbWU6ICduby1icmVhZGNydW1icydcblxuXHR9KTtcblxuXHRUb29sYm94LkJyZWFkY3J1bWIgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdicmVhZGNydW1iJyksXG5cblx0XHR0YWdOYW1lOiAnbGknXG5cblx0fSk7XG5cblx0VG9vbGJveC5CcmVhZGNydW1icyA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuXHRcdGNoaWxkVmlldzogVG9vbGJveC5CcmVhZGNydW1iLFxuXG5cdFx0ZW1wdHlWaWV3OiBUb29sYm94Lk5vQnJlYWRjcnVtYnMsXG5cblx0XHRjbGFzc05hbWU6ICdicmVhZGNydW1iJyxcblxuXHRcdHRhZ05hbWU6ICdvbCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0YWN0aXZlQ2xhc3NOYW1lOiAnYWN0aXZlJ1xuXHRcdH0sXG5cblx0XHRjb2xsZWN0aW9uRXZlbnRzOiB7XG5cdFx0XHQnY2hhbmdlIGFkZCByZW1vdmUgcmVzZXQnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHQgPSB0aGlzO1xuXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dC5vbkRvbVJlZnJlc2goKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0VG9vbGJveC5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG5cdFx0XHRpZighdGhpcy5jb2xsZWN0aW9uKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGdldEJyZWFkY3J1bWJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBicmVhZGNydW1icyA9IHRoaXMuY29sbGVjdGlvbiA/IHRoaXMuY29sbGVjdGlvbi50b0pTT04oKSA6IFtdO1xuXG5cdFx0XHRpZighXy5pc0FycmF5KGJyZWFkY3J1bWJzKSkge1xuXHRcdFx0XHRicmVhZGNydW1icyA9IFtdO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYnJlYWRjcnVtYnM7XG5cdFx0fSxcblxuXHRcdGFkZEJyZWFkY3J1bWJzOiBmdW5jdGlvbihicmVhZGNydW1icykge1xuXHRcdFx0aWYoXy5pc0FycmF5KGJyZWFkY3J1bWJzKSkge1xuXHRcdFx0XHRfLmVhY2goYnJlYWRjcnVtYnMsIGZ1bmN0aW9uKGJyZWFkY3J1bWIpIHtcblx0XHRcdFx0XHR0aGlzLmFkZEJyZWFkY3J1bWIoYnJlYWRjcnVtYik7XG5cdFx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdBZGRpbmcgbXVsdGlwbGUgYnJlYWRjcnVtYnMgbXVzdCBkb25lIGJ5IHBhc3NpbmcgYW4gYXJyYXknKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdGFkZEJyZWFkY3J1bWI6IGZ1bmN0aW9uKGJyZWFkY3J1bWIpIHtcblx0XHRcdGlmKF8uaXNPYmplY3QoYnJlYWRjcnVtYikpIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZChicmVhZGNydW1iKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignQSBicmVhZGNydW1iIG11c3QgYmUgcGFzc2VkIGFzIGFuIG9iamVjdCcpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0c2V0QnJlYWRjcnVtYnM6IGZ1bmN0aW9uKGJyZWFkY3J1bWJzKSB7XG5cdFx0XHRpZihfLmlzQXJyYXkoYnJlYWRjcnVtYnMpKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5zZXQoYnJlYWRjcnVtYnMpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHNldCB0aGUgYnJlYWRjcnVtYnMnKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdGluc2VydEJyZWFkY3J1bWI6IGZ1bmN0aW9uKGJyZWFkY3J1bWIpIHtcblx0XHRcdGlmKF8uaXNPYmplY3QoYnJlYWRjcnVtYikpIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLnVuc2hpZnQoYnJlYWRjcnVtYik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0EgYnJlYWRjcnVtYiBtdXN0IGJlIHBhc3NlZCBhcyBhbiBvYmplY3QnKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdGluc2VydEJyZWFkY3J1bWJzOiBmdW5jdGlvbihicmVhZGNydW1icykge1xuXHRcdFx0dmFyIHQgPSB0aGlzO1xuXG5cdFx0XHRpZihfLmlzQXJyYXkoYnJlYWRjcnVtYnMpKSB7XG5cdFx0XHRcdF8uZWFjaChicmVhZGNydW1icywgZnVuY3Rpb24oYnJlYWRjcnVtYikge1xuXHRcdFx0XHRcdHQuaW5zZXJ0QnJlYWRjcnVtYihicmVhZGNydW1iKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0luc2VydGluZyBtdWx0aXBsZSBicmVhZGNydW1icyBtdXN0IGRvbmUgYnkgcGFzc2luZyBhbiBhcnJheScpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0cmVtb3ZlQnJlYWRjcnVtYnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jb2xsZWN0aW9uLnJlc2V0KCk7XG5cdFx0fSxcblxuXHRcdG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZighdGhpcy4kZWwuZmluZCgnLm5vLWJyZWFkY3J1bWJzJykubGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMuJGVsLnBhcmVudCgpLnNob3coKTtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJ2xpOmxhc3QtY2hpbGQnKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRcdGlmKHRoaXMuJGVsLmZpbmQoJ2xpOmxhc3QtY2hpbGQgYScpLmxlbmd0aCkge1xuXHRcdFx0XHRcdHRoaXMuJGVsLmZpbmQoJ2xpOmxhc3QtY2hpbGQnKS5odG1sKHRoaXMuJGVsLmZpbmQoJ2xpOmxhc3QtY2hpbGQgYScpLmh0bWwoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLiRlbC5wYXJlbnQoKS5oaWRlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5CdXR0b25Ecm9wZG93bk1lbnUgPSBUb29sYm94LkRyb3Bkb3duTWVudS5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2J1dHRvbi1kcm9wZG93bi1tZW51JyksXG5cblx0XHRjaGlsZFZpZXdDb250YWluZXI6ICd1bCcsXG5cblx0XHR0YWdOYW1lOiAnZGl2JyxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2sgLmJ0bjpub3QoLmRyb3Bkb3duLXRvZ2dsZSknOiAnYnV0dG9uOmNsaWNrJyxcblx0XHRcdCdjbGljayAuZHJvcGRvd24tdG9nZ2xlJzogJ3RvZ2dsZTpjbGljaydcblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgbWVudSBpdGVtcyB0byBiZSBjb252ZXJ0ZWQgdG8gYSBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgaXRlbXM6IFtdLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gYnV0dG9uIHRleHRcblx0XHRcdGJ1dHRvbkxhYmVsOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIGJ1dHRvbiBjbGFzcyBuYW1lXG5cdFx0XHRidXR0b25DbGFzc05hbWU6ICdidG4gYnRuLWRlZmF1bHQnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGNsYXNzIG5hbWVcblx0XHRcdGJ1dHRvblRvZ2dsZUNsYXNzTmFtZTogJ2Ryb3Bkb3duLXRvZ2dsZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biBtZW51IGNsYXNzIG5hbWVcblx0XHRcdG1lbnVDbGFzc05hbWU6ICdkcm9wZG93bi1tZW51JyxcblxuXHRcdFx0Ly8gKGludHxib29sKSBUaGUgY29sbGVjdGlvbiBsaW1pdFxuXHRcdFx0bGltaXQ6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgb3JkZXIgb2YgdGhlIGNvbGxlY3Rpb24gaXRlbXNcblx0XHRcdG9yZGVyOiAnbmFtZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIEVpdGhlciBhc2Mgb3IgZGVzY1xuXHRcdFx0c29ydDogJ2FzYycsXG5cblx0XHRcdC8vIChib29sKSBDbG9zZSB0aGUgbWVudSBhZnRlciBhbiBpdGVtIGhhcyBiZWVuIGNsaWNrZWRcblx0XHRcdGNsb3NlT25DbGljazogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIE1lbnUgYXBwZWFyIGFzIGEgXCJkcm9wdXBcIiBpbnN0ZWFkIG9mIGEgXCJkcm9wZG93blwiXG5cdFx0XHRkcm9wVXA6IGZhbHNlLFxuXG5cdFx0XHQvLyAoYm9vbCkgRmV0Y2ggdGhlIGNvbGxlY3Rpb24gd2hlbiB0aGUgZHJvcGRvd24gbWVudSBpcyBzaG93blxuXHRcdFx0ZmV0Y2hPblNob3c6IGZhbHNlLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyBhbiBhY3Rpdml0eSBpbmRpY2F0b3Igd2hlbiBmZXRjaGluZyB0aGUgY29sbGVjdGlvblxuXHRcdFx0c2hvd0luZGljYXRvcjogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIFNob3cgdGhlIGJ1dHRvbiBhcyBzcGxpdCB3aXRoIHR3byBhY3Rpb25zIGluc3RlYWQgb2Ygb25lXG5cdFx0XHRzcGxpdEJ1dHRvbjogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgY2xhc3MgbmFtZVxuXHRcdFx0dG9nZ2xlQ2xhc3NOYW1lOiAnb3Blbidcblx0XHR9LFxuXG5cdFx0c2hvd01lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG5cdFx0fSxcblxuXHRcdGhpZGVNZW51OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5kcm9wZG93bi10b2dnbGUnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblx0XHR9LFxuXG5cdFx0aXNNZW51VmlzaWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKS5sZW5ndGggPiAwO1xuXHRcdH1cblxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnYmFja2JvbmUnXSwgZnVuY3Rpb24oQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQnV0dG9uR3JvdXBJdGVtID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnYnV0dG9uLWdyb3VwLWl0ZW0nKSxcblxuXHRcdHRhZ05hbWU6ICdhJyxcblxuXHRcdGNsYXNzTmFtZTogJ2J0biBidG4tZGVmYXVsdCcsXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrJzogJ2NsaWNrJ1xuXHRcdH0sXG5cbiAgICAgICAgb3B0aW9uczoge1xuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRpc2FibGVkIGNsYXNzIG5hbWVcblx0XHRcdGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnXG4gICAgICAgIH0sXG5cblx0XHRvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhpcy5tb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblxuICAgICAgICAgICAgaWYodGhpcy5tb2RlbC5nZXQoJ2NsYXNzTmFtZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5tb2RlbC5nZXQoJ2NsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuXHRcdFx0aWYodGhpcy5tb2RlbC5nZXQoJ2FjdGl2ZScpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmNsaWNrKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guTm9CdXR0b25Hcm91cEl0ZW1zID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tYnV0dG9uLWdyb3VwLWl0ZW0nKVxuXG5cdH0pO1xuXG5cdFRvb2xib3guQnV0dG9uR3JvdXAgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guQnV0dG9uR3JvdXBJdGVtLFxuXG5cdFx0ZW1wdHlWaWV3OiBUb29sYm94Lk5vQnV0dG9uR3JvdXBJdGVtcyxcblxuXHRcdGNsYXNzTmFtZTogJ2J0bi1ncm91cCcsXG5cblx0XHR0YWdOYW1lOiAnZGl2JyxcblxuXHRcdGNoaWxkRXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiAnb25DaGlsZENsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGFjdGl2ZSBjbGFzcyBuYW1lXG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZGlzYWJsZWQgY2xhc3MgbmFtZVxuXHRcdFx0ZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG5cblx0XHRcdC8vIChib29sKSBBY3RpdmF0ZSB0aGUgYnV0dG9uIG9uIGNsaWNrXG5cdFx0XHRhY3RpdmF0ZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChtaXhlZCkgUGFzcyBhbiBhcnJheSBvZiBidXR0b25zIGluc3RlYWQgb2YgcGFzc2luZyBhIGNvbGxlY3Rpb24gb2JqZWN0LlxuXHRcdFx0YnV0dG9uczogZmFsc2Vcblx0XHR9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKSAmJiAhb3B0aW9ucy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24odGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlSW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZih0aGlzLmNoaWxkcmVuLmZpbmRCeUluZGV4KGluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoaW5kZXgpLiRlbC5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSkuY2xpY2soKTtcblx0XHR9LFxuXG5cdFx0b25DaGlsZENsaWNrOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYoIWNoaWxkLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSkpIHtcbiAgICBcdFx0XHR0aGlzLnRyaWdnZXIoJ2NsaWNrJywgY2hpbGQpO1xuXG4gICAgXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ2FjdGl2YXRlT25DbGljaycpICYmICFjaGlsZC4kZWwuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKSkge1xuICAgIFx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgIFx0XHRcdFx0XHQucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuICAgIFx0XHRcdFx0Y2hpbGQuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICBcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnYWN0aXZhdGUnLCBjaGlsZCk7XG4gICAgXHRcdFx0fVxuICAgICAgICAgICAgfVxuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXG4gICAgICAgICAgICAndW5kZXJzY29yZScsXG4gICAgICAgICAgICAnYmFja2JvbmUnLFxuICAgICAgICAgICAgJ2JhY2tib25lLm1hcmlvbmV0dGUnLFxuICAgICAgICAgICAgJ21vbWVudCdcbiAgICAgICAgXSwgZnVuY3Rpb24oXywgQmFja2JvbmUsIE1hcmlvbmV0dGUsIG1vbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgbW9tZW50KVxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnbW9tZW50JylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcm9vdC5fLFxuICAgICAgICAgICAgcm9vdC5CYWNrYm9uZSxcbiAgICAgICAgICAgIHJvb3QuTWFyaW9uZXR0ZSxcbiAgICAgICAgICAgIHJvb3QubW9tZW50XG4gICAgICAgICk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUsIG1vbWVudCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5Nb250aGx5Q2FsZW5kYXJEYXkgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnY2FsZW5kYXItbW9udGhseS1kYXktdmlldycpLFxuXG4gICAgICAgIHRhZ05hbWU6ICd0ZCcsXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnY2FsZW5kYXItZGF5JyxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2NsaWNrJzogJ2NsaWNrJ1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vZGVsRXZlbnRzOiAge1xuICAgICAgICAgICAgJ2NoYW5nZSc6ICdtb2RlbENoYW5nZWQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGRhdGU6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9kZWxDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXk6IHRoaXMuZ2V0T3B0aW9uKCdkYXknKSxcbiAgICAgICAgICAgICAgICBoYXNFdmVudHM6IHRoaXMuaGFzRXZlbnRzKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDZWxsSGVpZ2h0OiBmdW5jdGlvbih3aWR0aCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuY3NzKCdoZWlnaHQnLCB3aWR0aCB8fCB0aGlzLiRlbC53aWR0aCgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignZGF0ZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0V2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoJ2V2ZW50cycpLmxlbmd0aCA+IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldERhdGUoKS5pc1NhbWUobmV3IERhdGUoKSwgJ2RheScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2NhbGVuZGFyLXRvZGF5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0RGF0ZSgpLmlzU2FtZSh0aGlzLmdldE9wdGlvbignY3VycmVudERhdGUnKSwgJ2RheScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2NhbGVuZGFyLWN1cnJlbnQtZGF5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0RGF0ZSgpLmlzU2FtZSh0aGlzLmdldE9wdGlvbignY3VycmVudERhdGUnKSwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnY2FsZW5kYXItbW9udGgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwuZ2V0KCdldmVudHMnKSB8fCBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRFdmVudHM6IGZ1bmN0aW9uKGV2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ2V2ZW50cycsIGV2ZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RpbmcgPSBfLmNsb25lKHRoaXMuZ2V0RXZlbnRzKCkpO1xuXG4gICAgICAgICAgICBleGlzdGluZy5wdXNoKGV2ZW50KTtcblxuICAgICAgICAgICAgdGhpcy5zZXRFdmVudHMoZXhpc3RpbmcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZEV2ZW50czogZnVuY3Rpb24oZXZlbnRzKSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RpbmcgPSBfLmNsb25lKHRoaXMuZ2V0RXZlbnRzKCkpO1xuXG4gICAgICAgICAgICB0aGlzLnNldEV2ZW50cyhfLm1lcmdlKGV4aXN0aW5nLCBldmVudHMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVFdmVudDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpO1xuXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW2luZGV4XTtcblxuICAgICAgICAgICAgdGhpcy5zZXRFdmVudHMoZXZlbnRzKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRFdmVudHMoW10pO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guTW9udGhseUNhbGVuZGFyV2VlayA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guTW9udGhseUNhbGVuZGFyRGF5LFxuXG4gICAgICAgIHRhZ05hbWU6ICd0cicsXG5cbiAgICAgICAgY2hpbGRFdmVudHM6IHtcbiAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbih2aWV3LCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkYXk6Y2xpY2snLCB2aWV3LCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgZGF5czogZmFsc2UsXG4gICAgICAgICAgICBldmVudHM6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogZnVuY3Rpb24oY2hpbGQsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXkoaW5kZXgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERheXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdkYXlzJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF5OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIGRheXMgPSB0aGlzLmdldERheXMoKTtcblxuICAgICAgICAgICAgaWYoZGF5c1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF5c1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Rmlyc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmZpcnN0KCkuZ2V0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExhc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmxhc3QoKS5nZXREYXRlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF5TW9kZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBCYWNrYm9uZS5Nb2RlbCh7XG4gICAgICAgICAgICAgICAgZXZlbnRzOiBbXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbmRlckNoaWxkcmVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveUVtcHR5VmlldygpO1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95Q2hpbGRyZW4oKTtcblxuICAgICAgICAgICAgdGhpcy5zdGFydEJ1ZmZlcmluZygpO1xuICAgICAgICAgICAgdGhpcy5zaG93Q29sbGVjdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5lbmRCdWZmZXJpbmcoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q29sbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRPcHRpb24oJ2RheXMnKSwgZnVuY3Rpb24oZGF5LCBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLmdldERheU1vZGVsKCksIHRoaXMuY2hpbGRWaWV3LCBpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9pbml0aWFsRXZlbnRzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guTW9udGhseUNhbGVuZGFyID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdjYWxlbmRhci1tb250aGx5LXZpZXcnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICdjYWxlbmRhcicsXG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94Lk1vbnRobHlDYWxlbmRhcldlZWssXG5cbiAgICAgICAgY2hpbGRWaWV3Q29udGFpbmVyOiAndGJvZHknLFxuXG4gICAgICAgIGNoaWxkRXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2snOiBmdW5jdGlvbih3ZWVrLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd3ZWVrOmNsaWNrJywgd2VlaywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2RheTpjbGljayc6IGZ1bmN0aW9uKHdlZWssIGRheSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0ZShkYXkuZ2V0RGF0ZSgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2RheTpjbGljaycsIHdlZWssIGRheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGZhbHNlLFxuICAgICAgICAgICAgZGF0ZTogZmFsc2UsXG4gICAgICAgICAgICBhbHdheXNTaG93U2l4V2Vla3M6IHRydWUsXG4gICAgICAgICAgICBmZXRjaE9uUmVuZGVyOiB0cnVlLFxuICAgICAgICAgICAgaW5kaWNhdG9yT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3NtYWxsJyxcbiAgICAgICAgICAgICAgICBkaW1tZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgZGltbWVkQmdDb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgLjYpJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmNhbGVuZGFyLW5hdmlnYXRpb24tcHJldic6ICdwcmV2OmNsaWNrJyxcbiAgICAgICAgICAgICdjbGljayAuY2FsZW5kYXItbmF2aWdhdGlvbi1uZXh0JzogJ25leHQ6Y2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogZnVuY3Rpb24oY2hpbGQsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRheXM6IHRoaXMuZ2V0Q2FsZW5kYXJXZWVrKGluZGV4KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeVZhcmlhYmxlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldEZpcnN0RGF0ZSgpLmZvcm1hdCgnWVlZWS1NTS1ERCBISC1tbS1zcycpLFxuICAgICAgICAgICAgICAgIGVuZDogdGhpcy5nZXRMYXN0RGF0ZSgpLmZvcm1hdCgnWVlZWS1NTS1ERCBISC1tbS1zcycpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGZldGNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcywgcGFyYW1zID0gdGhpcy5nZXRRdWVyeVZhcmlhYmxlcygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldENhY2hlUmVzcG9uc2UocGFyYW1zKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZUNhY2hlUmVzcG9uc2UocGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZmV0Y2gnLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuc2V0Q2FjaGVSZXNwb25zZShwYXJhbXMsIGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIHRydWUsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6c3VjY2VzcycsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIGZhbHNlLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25GZXRjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUV2ZW50OiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBtb2RlbC5nZXQoJ3N0YXJ0JykgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBlbmQ6IG1vZGVsLmdldCgnZW5kJykgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY3JlYXRlOmV2ZW50JywgZXZlbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmNhbGVuZGFyLWhlYWRlcicpLmh0bWwodGhpcy5nZXRDYWxlbmRhckhlYWRlcigpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5jYWxlbmRhci1zdWItaGVhZGVyJykuaHRtbCh0aGlzLmdldENhbGVuZGFyU3ViSGVhZGVyKCkpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJDb2xsZWN0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdmZXRjaE9uUmVuZGVyJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZldGNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzdG9yZUNhY2hlUmVzcG9uc2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gdGhpcy5nZXRDYWNoZVJlc3BvbnNlKHBhcmFtcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3Jlc3RvcmU6Y2FjaGU6cmVzcG9uc2UnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDYWNoZVJlc3BvbnNlOiBmdW5jdGlvbihwYXJhbXMsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShwYXJhbXMpO1xuXG4gICAgICAgICAgICBpZighY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlc1tzdHJpbmddID0gXy5jbG9uZShjb2xsZWN0aW9uKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzZXQ6Y2FjaGU6cmVzcG9uc2UnLCBjb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXNbc3RyaW5nXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FjaGVSZXNwb25zZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXMgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5jb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXMuaGFzT3duUHJvcGVydHkoc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlc1tzdHJpbmddO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBuZXcgTWFyaW9uZXR0ZS5SZWdpb24oe1xuICAgICAgICAgICAgICAgIGVsOiB0aGlzLiRlbC5maW5kKCcuaW5kaWNhdG9yJylcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKHRoaXMuZ2V0T3B0aW9uKCdpbmRpY2F0b3JPcHRpb25zJykpO1xuXG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5zaG93KHZpZXcpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdpbmRpY2F0b3I6c2hvdycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5lbXB0eSgpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdpbmRpY2F0b3I6aGlkZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlckNvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdiZWZvcmU6cmVuZGVyOmNvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsLCBpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudChtb2RlbCk7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSB0aGlzLmdldFZpZXdCeURhdGUoZXZlbnQuc3RhcnQpO1xuICAgICAgICAgICAgICAgIGlmKHZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlldy5hZGRFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2FmdGVyOnJlbmRlcjpjb2xsZWN0aW9uJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Vmlld0J5RGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgaWYoIWRhdGUgaW5zdGFuY2VvZiBtb21lbnQpIHtcbiAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbih3ZWVrLCB4KSB7XG4gICAgICAgICAgICAgICAgd2Vlay5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGRheSwgeSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXkuZ2V0RGF0ZSgpLmlzU2FtZShkYXRlLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKF8uaXNOdWxsKHZpZXcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IGRheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFdlZWtNb2RlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJhY2tib25lLk1vZGVsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJIZWFkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmZvcm1hdCgnTU1NTScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENhbGVuZGFyU3ViSGVhZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERhdGUoKS55ZWFyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJXZWVrOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIHdlZWtzID0gdGhpcy5nZXRDYWxlbmRhcldlZWtzKCk7XG5cbiAgICAgICAgICAgIGlmKHdlZWtzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJXZWVrczogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlIHx8IHRoaXMuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgdmFyIHN0YXJ0T2ZUaGlzTW9udGggPSBkYXRlLmNsb25lKCkuc3RhcnRPZignbW9udGgnKTtcbiAgICAgICAgICAgIHZhciBlbmRPZlRoaXNNb250aCA9IGRhdGUuY2xvbmUoKS5lbmRPZignbW9udGgnKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2Fsd2F5c1Nob3dTaXhXZWVrcycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYoc3RhcnRPZlRoaXNNb250aC5kYXkoKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydE9mVGhpc01vbnRoLnN1YnRyYWN0KDEsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoZW5kT2ZUaGlzTW9udGguZGF5KCkgPT09IDYpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kT2ZUaGlzTW9udGguYWRkKDEsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZW5kT2ZUaGlzTW9udGhXZWVrID0gZW5kT2ZUaGlzTW9udGguY2xvbmUoKTtcblxuICAgICAgICAgICAgaWYoIWVuZE9mVGhpc01vbnRoLmNsb25lKCkuZW5kT2YoJ3dlZWsnKS5pc1NhbWUoc3RhcnRPZlRoaXNNb250aCwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICBlbmRPZlRoaXNNb250aFdlZWsuZW5kT2YoJ3dlZWsnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRvdGFsRGF5c0luTW9udGggPSBkYXRlLmRheXNJbk1vbnRoKCk7XG4gICAgICAgICAgICB2YXIgdG90YWxEYXlzSW5DYWxlbmRhciA9IGVuZE9mVGhpc01vbnRoV2Vlay5kaWZmKHN0YXJ0T2ZUaGlzTW9udGgsICdkYXlzJyk7XG4gICAgICAgICAgICB2YXIgdG90YWxXZWVrc0luQ2FsZW5kYXIgPSBNYXRoLmNlaWwodG90YWxEYXlzSW5DYWxlbmRhciAvIDcpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWx3YXlzU2hvd1NpeFdlZWtzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFdlZWtzSW5DYWxlbmRhciA8IDYpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kT2ZUaGlzTW9udGhXZWVrLmFkZCg2IC0gdG90YWxXZWVrc0luQ2FsZW5kYXIsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsV2Vla3NJbkNhbGVuZGFyICs9IDYgLSB0b3RhbFdlZWtzSW5DYWxlbmRhcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB3ZWVrcyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IodmFyIHggPSAwOyB4IDwgdG90YWxXZWVrc0luQ2FsZW5kYXI7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBkYXlzID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IodmFyIHkgPSAwOyB5IDwgNzsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IHN0YXJ0T2ZUaGlzTW9udGhcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbG9uZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkKHgsICd3ZWVrJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdGFydE9mKCd3ZWVrJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGQoeSwgJ2RheScpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRheXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRheTogc3RhcnQuZGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9udGg6IHN0YXJ0Lm1vbnRoKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyOiBzdGFydC55ZWFyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZTogZGF0ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3ZWVrcy5wdXNoKGRheXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gd2Vla3M7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0V2Vla3NJbk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5nZXREYXRlKCkuZGF5c0luTW9udGgoKSAvIDcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEZpcnN0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5maXJzdCgpLmdldEZpcnN0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExhc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmxhc3QoKS5nZXRMYXN0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdkYXRlJykgfHwgbW9tZW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgaWYoIWRhdGUgaW5zdGFuY2VvZiBtb21lbnQpIHtcbiAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcHJldkRhdGUgPSB0aGlzLmdldERhdGUoKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSBkYXRlO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkYXRlOnNldCcsIGRhdGUsIHByZXZEYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRhdGVTZXQ6IGZ1bmN0aW9uKG5ld0RhdGUsIHByZXZEYXRlKSB7XG4gICAgICAgICAgICBpZighbmV3RGF0ZS5pc1NhbWUocHJldkRhdGUsICdtb250aCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Vmlld0J5RGF0ZShwcmV2RGF0ZSkuJGVsLnJlbW92ZUNsYXNzKCdjYWxlbmRhci1jdXJyZW50LWRheScpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Vmlld0J5RGF0ZShuZXdEYXRlKS4kZWwuYWRkQ2xhc3MoJ2NhbGVuZGFyLWN1cnJlbnQtZGF5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRWaWV3QnlEYXRlKG5ld0RhdGUpO1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHZpZXcubW9kZWwuZ2V0KCdldmVudHMnKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93OmV2ZW50cycsIHZpZXcsIGV2ZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UHJldkRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmNsb25lKCkuc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TmV4dERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmNsb25lKCkuYWRkKDEsICdtb250aCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKHRoaXMuZ2V0UHJldkRhdGUoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUodGhpcy5nZXROZXh0RGF0ZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblByZXZDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnByZXYoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbk5leHRDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q29sbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRDYWxlbmRhcldlZWtzKCksIGZ1bmN0aW9uKHdlZWssIGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuZ2V0V2Vla01vZGVsKCksIHRoaXMuY2hpbGRWaWV3LCBpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXJDaGlsZHJlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lFbXB0eVZpZXcoKTtcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveUNoaWxkcmVuKCk7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0QnVmZmVyaW5nKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dDb2xsZWN0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmVuZEJ1ZmZlcmluZygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIE11c3Qgb3ZlcnJpZGUgY29yZSBtZXRob2QgdG8gZG8gbm90aGluZ1xuICAgICAgICBfaW5pdGlhbEV2ZW50czogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbigkLCBfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5DaGVja2JveEZpZWxkID0gVG9vbGJveC5CYXNlRmllbGQuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS1jaGVja2JveC1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIG9wdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgIGlucHV0Q2xhc3NOYW1lOiAnY2hlY2tib3gnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJzpjaGVja2VkJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaCgkKHRoaXMpLnZhbCgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZih2YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID4gMSA/IHZhbHVlcyA6IHZhbHVlc1swXTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRJbnB1dFZhbHVlOiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgIGlmKCFfLmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcyA9IFt2YWx1ZXNdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCc6Y2hlY2tlZCcpLmF0dHIoJ2NoZWNrZWQnLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIF8uZWFjaCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnW3ZhbHVlPVwiJyt2YWx1ZSsnXCJdJykuYXR0cignY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gIGZ1bmN0aW9uIGZvckVhY2goIGFycmF5LCBmbiApIHsgdmFyIGksIGxlbmd0aFxuICAgIGkgPSAtMVxuICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aFxuICAgIHdoaWxlICggKytpIDwgbGVuZ3RoIClcbiAgICAgIGZuKCBhcnJheVsgaSBdLCBpLCBhcnJheSApXG4gIH1cblxuICBmdW5jdGlvbiBtYXAoIGFycmF5LCBmbiApIHsgdmFyIHJlc3VsdFxuICAgIHJlc3VsdCA9IEFycmF5KCBhcnJheS5sZW5ndGggKVxuICAgIGZvckVhY2goIGFycmF5LCBmdW5jdGlvbiAoIHZhbCwgaSwgYXJyYXkgKSB7XG4gICAgICByZXN1bHRbaV0gPSBmbiggdmFsLCBpLCBhcnJheSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBmdW5jdGlvbiByZWR1Y2UoIGFycmF5LCBmbiwgYWNjdW11bGF0b3IgKSB7XG4gICAgZm9yRWFjaCggYXJyYXksIGZ1bmN0aW9uKCB2YWwsIGksIGFycmF5ICkge1xuICAgICAgYWNjdW11bGF0b3IgPSBmbiggdmFsLCBpLCBhcnJheSApXG4gICAgfSlcbiAgICByZXR1cm4gYWNjdW11bGF0b3JcbiAgfVxuXG4gIC8vIExldmVuc2h0ZWluIGRpc3RhbmNlXG4gIGZ1bmN0aW9uIExldmVuc2h0ZWluKCBzdHJfbSwgc3RyX24gKSB7IHZhciBwcmV2aW91cywgY3VycmVudCwgbWF0cml4XG4gICAgLy8gQ29uc3RydWN0b3JcbiAgICBtYXRyaXggPSB0aGlzLl9tYXRyaXggPSBbXVxuXG4gICAgLy8gU2FuaXR5IGNoZWNrc1xuICAgIGlmICggc3RyX20gPT0gc3RyX24gKVxuICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2UgPSAwXG4gICAgZWxzZSBpZiAoIHN0cl9tID09ICcnIClcbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlID0gc3RyX24ubGVuZ3RoXG4gICAgZWxzZSBpZiAoIHN0cl9uID09ICcnIClcbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlID0gc3RyX20ubGVuZ3RoXG4gICAgZWxzZSB7XG4gICAgICAvLyBEYW5nZXIgV2lsbCBSb2JpbnNvblxuICAgICAgcHJldmlvdXMgPSBbIDAgXVxuICAgICAgZm9yRWFjaCggc3RyX20sIGZ1bmN0aW9uKCB2LCBpICkgeyBpKyssIHByZXZpb3VzWyBpIF0gPSBpIH0gKVxuXG4gICAgICBtYXRyaXhbMF0gPSBwcmV2aW91c1xuICAgICAgZm9yRWFjaCggc3RyX24sIGZ1bmN0aW9uKCBuX3ZhbCwgbl9pZHggKSB7XG4gICAgICAgIGN1cnJlbnQgPSBbICsrbl9pZHggXVxuICAgICAgICBmb3JFYWNoKCBzdHJfbSwgZnVuY3Rpb24oIG1fdmFsLCBtX2lkeCApIHtcbiAgICAgICAgICBtX2lkeCsrXG4gICAgICAgICAgaWYgKCBzdHJfbS5jaGFyQXQoIG1faWR4IC0gMSApID09IHN0cl9uLmNoYXJBdCggbl9pZHggLSAxICkgKVxuICAgICAgICAgICAgY3VycmVudFsgbV9pZHggXSA9IHByZXZpb3VzWyBtX2lkeCAtIDEgXVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGN1cnJlbnRbIG1faWR4IF0gPSBNYXRoLm1pblxuICAgICAgICAgICAgICAoIHByZXZpb3VzWyBtX2lkeCBdICAgICArIDEgICAvLyBEZWxldGlvblxuICAgICAgICAgICAgICAsIGN1cnJlbnRbICBtX2lkeCAtIDEgXSArIDEgICAvLyBJbnNlcnRpb25cbiAgICAgICAgICAgICAgLCBwcmV2aW91c1sgbV9pZHggLSAxIF0gKyAxICAgLy8gU3VidHJhY3Rpb25cbiAgICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICBwcmV2aW91cyA9IGN1cnJlbnRcbiAgICAgICAgbWF0cml4WyBtYXRyaXgubGVuZ3RoIF0gPSBwcmV2aW91c1xuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2UgPSBjdXJyZW50WyBjdXJyZW50Lmxlbmd0aCAtIDEgXVxuICAgIH1cbiAgfVxuXG4gIExldmVuc2h0ZWluLnByb3RvdHlwZS50b1N0cmluZyA9IExldmVuc2h0ZWluLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoIG5vX3ByaW50ICkge1xuICAgICAgdmFyIG1hdHJpeCwgbWF4LCBidWZmLCBzZXAsIHJvd3MsIG1hdHJpeCA9IHRoaXMuZ2V0TWF0cml4KCk7XG5cbiAgICAgIG1heCA9IHJlZHVjZSggbWF0cml4LGZ1bmN0aW9uKCBtLCBvICkge1xuICAgICAgICAgIHJldHVybiBNYXRoLm1heCggbSwgcmVkdWNlKCBvLCBNYXRoLm1heCwgMCApIClcbiAgICAgIH0sIDAgKTtcblxuICAgICAgYnVmZiA9IEFycmF5KCggbWF4ICsgJycgKS5sZW5ndGgpLmpvaW4oJyAnKTtcblxuICAgICAgc2VwID0gW107XG5cbiAgICAgIHdoaWxlICggc2VwLmxlbmd0aCA8IChtYXRyaXhbMF0gJiYgbWF0cml4WzBdLmxlbmd0aCB8fCAwKSApIHtcbiAgICAgICAgICBzZXBbIHNlcC5sZW5ndGggXSA9IEFycmF5KCBidWZmLmxlbmd0aCArIDEgKS5qb2luKCAnLScgKTtcbiAgICAgIH1cblxuICAgICAgc2VwID0gc2VwLmpvaW4oICctKycgKSArICctJztcblxuICAgICAgcm93cyA9IG1hcCggbWF0cml4LCBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICB2YXIgY2VsbHM7XG5cbiAgICAgICAgICBjZWxscyA9IG1hcChyb3csIGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChidWZmICsgY2VsbCkuc2xpY2UoIC0gYnVmZi5sZW5ndGggKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIGNlbGxzLmpvaW4oICcgfCcgKSArICcgJztcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcm93cy5qb2luKCBcIlxcblwiICsgc2VwICsgXCJcXG5cIiApO1xuICB9XG5cbiAgTGV2ZW5zaHRlaW4ucHJvdG90eXBlLmdldE1hdHJpeCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tYXRyaXguc2xpY2UoKVxuICB9XG5cbiAgTGV2ZW5zaHRlaW4ucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlXG4gIH1cblxuICBUb29sYm94LkxldmVuc2h0ZWluID0gTGV2ZW5zaHRlaW47XG5cbiAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guSW5saW5lRWRpdG9yID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2lubGluZS1lZGl0b3InKSxcblxuICAgICAgICBjbGFzc05hbWU6ICdpbmxpbmUtZWRpdG9yLXdyYXBwZXInLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgYXR0cmlidXRlIGluIHRoZSBtb2RlbCB0byBlZGl0XG4gICAgICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZm9ybSBpbnB1dCB2aWV3IG9iamVjdFxuICAgICAgICAgICAgZm9ybUlucHV0VmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBmb3JtIGlucHV0IHZpZXcgb2JqZWN0IG9wdGlvbnNcbiAgICAgICAgICAgIGZvcm1JbnB1dFZpZXdPcHRpb25zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKHNydGluZykgVGhlIGNsYXNzIG5hbWUgdG8gYWRkIHRvIHRoZSBmaWVsZCB3aGlsZSBpdCBpcyBiZWluZyBlZGl0dGVkLlxuICAgICAgICAgICAgZWRpdHRpbmdDbGFzc05hbWU6ICdpbmxpbmUtZWRpdG9yLWVkaXR0aW5nJyxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIEFsbG93IHRoZSBmaWVsZCB0byBoYXZlIGEgbnVsbCB2YWx1ZVxuICAgICAgICAgICAgYWxsb3dOdWxsOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKGludCkgVGhlIGtleWNvZGUgdG8gc2F2ZSB0aGUgZmllbGQgZGF0YVxuICAgICAgICAgICAgc2F2ZUtleWNvZGU6IDEzLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUga2V5Y29kZSB0byBjYW5jZWwgdGhlIGZpZWxkIGRhdGFcbiAgICAgICAgICAgIGNhbmNlbEtleWNvZGU6IDI3LFxuICAgICAgICB9LFxuXG4gICAgICAgIHJlZ2lvbnM6IHtcbiAgICAgICAgICAgIGlucHV0OiAnLmlubGluZS1lZGl0b3ItZmllbGQnLFxuICAgICAgICAgICAgaW5kaWNhdG9yOiAnLmlubGluZS1lZGl0b3ItYWN0aXZpdHktaW5kaWNhdG9yJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmlubGluZS1lZGl0b3ItbGFiZWwnOiAnbGFiZWw6Y2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRm9ybUlucHV0VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZm9ybUlucHV0VmlldycpO1xuXG4gICAgICAgICAgICBpZighVmlldykge1xuICAgICAgICAgICAgICAgIFZpZXcgPSBUb29sYm94LklucHV0RmllbGQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignYXR0cmlidXRlJykpLFxuICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignZm9ybUlucHV0Vmlld09wdGlvbnMnKSk7XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcob3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ2JsdXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LmJsdXIoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2aWV3LiRlbC5vbigna2V5cHJlc3MnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgaWYoZS5rZXlDb2RlID09PSB0LmdldE9wdGlvbignc2F2ZUtleWNvZGUnKSkge1xuICAgICAgICAgICAgICAgICAgICBpZih0LmdldE9wdGlvbignYWxsb3dOdWxsJykgfHwgIXQuZ2V0T3B0aW9uKCdhbGxvd051bGwnKSAmJiAhdC5pc051bGwoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZpZXcuJGVsLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSB0LmdldE9wdGlvbignY2FuY2VsS2V5Y29kZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICd0aW55J1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnNob3codmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZUFjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLmVtcHR5KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNOdWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldElucHV0VmFsdWUoKSA9PT0gJycgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0TGFiZWxIdG1sOiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuaW5saW5lLWVkaXRvci1sYWJlbCcpLmh0bWwoaHRtbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb2RlbFZhbHVlKCkgIT09IHRoaXMuZ2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmJsdXIoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY2FuY2VsJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmhhc0NoYW5nZWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2VkaXR0aW5nQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2JsdXInKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZWRpdHRpbmdDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0LmN1cnJlbnRWaWV3LmZvY3VzKCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2ZvY3VzJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TW9kZWxWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2F0dHJpYnV0ZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlucHV0LmN1cnJlbnRWaWV3LmdldElucHV0VmFsdWUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRGb3JtRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldE9wdGlvbignYXR0cmlidXRlJyk7XG5cbiAgICAgICAgICAgIGRhdGFbbmFtZV0gPSB0aGlzLmdldElucHV0VmFsdWUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldExhYmVsSHRtbCh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25CZWZvcmVTYXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0FjdGl2aXR5SW5kaWNhdG9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25BZnRlclNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZpdHlJbmRpY2F0b3IoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2FsbG93TnVsbCcpIHx8ICF0aGlzLmdldE9wdGlvbignYWxsb3dOdWxsJykgJiYgIXRoaXMuaXNOdWxsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJsdXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzYXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYodGhpcy5tb2RlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnYmVmb3JlOnNhdmUnKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2F2ZSh0aGlzLmdldEZvcm1EYXRhKCksIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24obW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3NhdmU6c3VjY2VzcycsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2FmdGVyOnNhdmUnLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdjaGFuZ2UnLCB0LmdldElucHV0VmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc2F2ZTplcnJvcicsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2FmdGVyOnNhdmUnLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScsIHRoaXMuZ2V0SW5wdXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkxhYmVsQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TGFiZWxIdG1sKHRoaXMuZ2V0TW9kZWxWYWx1ZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zaG93KHRoaXMuY3JlYXRlRm9ybUlucHV0VmlldygpKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LklucHV0RmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLWlucHV0LWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnXG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guTGlnaHRTd2l0Y2hGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tbGlnaHQtc3dpdGNoLWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdmFsdWU6IDAsXG5cbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzTmFtZTogJ29uJyxcblxuICAgICAgICAgICAgb25WYWx1ZTogMSxcblxuICAgICAgICAgICAgb2ZmVmFsdWU6IDAsXG5cbiAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RvcjogJy5saWdodC1zd2l0Y2gnLFxuXG4gICAgICAgICAgICBpbnB1dENsYXNzTmFtZTogJ2xpZ2h0LXN3aXRjaCdcbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2NsaWNrIC5saWdodC1zd2l0Y2gtY29udGFpbmVyJzogJ2NsaWNrJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2tleXVwJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5nZXRPcHRpb24oJ29mZlZhbHVlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFZhbHVlKHRoaXMuZ2V0T3B0aW9uKCdvblZhbHVlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5CYXNlRmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLnZhbHVlID09PSBmYWxzZSB8fCBfLmlzTmFOKHRoaXMub3B0aW9ucy52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMudmFsdWUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLmdldE9wdGlvbigndmFsdWUnKSkgPT09IDE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlQ2xhc3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQWN0aXZlQ2xhc3MoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjaGFuZ2UnLCB2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGlnaHRTd2l0Y2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJy5saWdodC1zd2l0Y2gnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCdpbnB1dCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEFjdGl2ZUNsYXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5nZXRMaWdodFN3aXRjaCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkcmFnZ2luZ0NsYXNzTmFtZScpKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmxpZ2h0LXN3aXRjaC1jb250YWluZXInKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAnbWFyZ2luLWxlZnQnOiAwXG4gICAgICAgICAgICB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuZ2V0TGlnaHRTd2l0Y2goKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModC5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModC5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlQWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldExpZ2h0U3dpdGNoKCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcubGlnaHQtc3dpdGNoLWNvbnRhaW5lcicpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICdtYXJnaW4tbGVmdCc6IC0xMVxuICAgICAgICAgICAgfSwgMTAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LmdldExpZ2h0U3dpdGNoKClcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHQuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHQuZ2V0T3B0aW9uKCdkcmFnZ2luZ0NsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZighdGhpcy5pc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmdldE9wdGlvbignb25WYWx1ZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5nZXRPcHRpb24oJ29mZlZhbHVlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXNcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vTGlzdEdyb3VwSXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLWxpc3QtZ3JvdXAtaXRlbScpLFxuXG5cdFx0Y2xhc3NOYW1lOiAnbGlzdC1ncm91cC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0bWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zO1xuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94Lkxpc3RHcm91cEl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdsaXN0LWdyb3VwLWl0ZW0nKSxcblxuXHRcdGNsYXNzTmFtZTogJ2xpc3QtZ3JvdXAtaXRlbScsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBiYWRnZUF0dHJpYnV0ZTogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50QXR0cmlidXRlOiBmYWxzZVxuICAgICAgICB9LFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2snLCBlKTtcblx0XHRcdH1cblx0XHR9LFxuXG4gICAgICAgIGdldEJhZGdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignYmFkZ2VBdHRyaWJ1dGUnKSA/XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2JhZGdlQXR0cmlidXRlJykpIDpcbiAgICAgICAgICAgICAgICBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignY29udGVudEF0dHJpYnV0ZScpID9cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignY29udGVudEF0dHJpYnV0ZScpKSA6XG4gICAgICAgICAgICAgICAgZmFsc2U7XG4gICAgICAgIH0sXG5cblx0XHR0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGhlbHBlciA9IHt9LFxuICAgICAgICAgICAgICAgIGJhZGdlID0gdGhpcy5nZXRCYWRnZSgpLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKTtcblxuICAgICAgICAgICAgaWYoYmFkZ2UpIHtcbiAgICAgICAgICAgICAgICBoZWxwZXIuYmFkZ2UgPSBiYWRnZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoY29udGVudCkge1xuICAgICAgICAgICAgICAgIGhlbHBlci5jb250ZW50ID0gY29udGVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGhlbHBlcjtcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5MaXN0R3JvdXAgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guTGlzdEdyb3VwSXRlbSxcblxuXHRcdGNsYXNzTmFtZTogJ2xpc3QtZ3JvdXAnLFxuXG5cdFx0dGFnTmFtZTogJ3VsJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoYm9vbCkgQWN0aXZhdGUgbGlzdCBpdGVtIG9uIGNsaWNrXG5cdFx0XHRhY3RpdmF0ZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChzdHJpbmcpIEFjdGl2ZSBjbGFzcyBuYW1lXG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZXJlIGFyZSBubyBsaXN0IGl0ZW1zXG5cdFx0XHRlbXB0eU1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJyxcblxuXHRcdFx0Ly8gKG9iamVjdCkgVGhlIHZpZXcgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGVtcHR5IG1lc3NhZ2Vcblx0XHRcdGVtcHR5TWVzc2FnZVZpZXc6IFRvb2xib3guTm9MaXN0R3JvdXBJdGVtLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgZW1wdHkgbWVzc2FnZSB2aWV3XG5cdFx0XHRzaG93RW1wdHlNZXNzYWdlOiB0cnVlLFxuXHRcdH0sXG5cblx0XHRjaGlsZEV2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldywgZSkge1xuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignYWN0aXZhdGVPbkNsaWNrJykpIHtcblx0XHRcdFx0XHRpZih2aWV3LiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpKSB7XG5cdFx0XHRcdFx0XHR2aWV3LiRlbC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHZpZXcuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cblx0XHRcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnYWN0aXZhdGUnLCB2aWV3KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2l0ZW06Y2xpY2snLCB2aWV3LCBlKTtcblx0XHRcdH1cblx0XHR9LFxuXG4gICAgICAgIGdldEVtcHR5VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0aWYodGhpcy5nZXRPcHRpb24oJ3Nob3dFbXB0eU1lc3NhZ2UnKSkge1xuXHQgICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2VWaWV3Jyk7XG5cblx0ICAgICAgICAgICAgVmlldyA9IFZpZXcuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcblx0ICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlJylcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIFZpZXc7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbigkLCBfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgndW5kZXJzY29yZScpKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5Nb2RhbCA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdtb2RhbC13aW5kb3cnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICdtb2RhbC13aW5kb3ctd3JhcHBlcicsXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgY29udGVudDogJy5tb2RhbC1jb250ZW50J1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLm1vZGFsLWNsb3NlJzogJ2Nsb3NlOmNsaWNrJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoYXJyYXkpIEFuIGFycmF5IG9mIGJ1dHRvbiBvYmplY3RzIHRvIGFkZCB0byB0aGUgbW9kYWwgd2luZG93XG4gICAgICAgICAgICBidXR0b25zOiBbXSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG1vZGFsIHdpbmRvdyBoZWFkZXIgdGV4dFxuICAgICAgICAgICAgaGVhZGVyOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKGludCkgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdXNlZCBmb3IgdGhlIG1vZGFsIGFuaW1hdGlvblxuICAgICAgICAgICAgY2xvc2VBbmltYXRpb25SYXRlOiA1MDBcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayAubW9kYWwtYnV0dG9ucyBhJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciBidXR0b25zID0gdGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKTtcbiAgICAgICAgICAgICAgICB2YXIgaSA9ICQoZS50YXJnZXQpLmluZGV4KCk7XG5cbiAgICAgICAgICAgICAgICBpZihfLmlzQXJyYXkoYnV0dG9ucykgJiYgYnV0dG9uc1tpXS5vbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnNbaV0ub25DbGljay5jYWxsKHRoaXMsICQoZS50YXJnZXQpKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDb250ZW50VmlldzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdGhpcy5zZXRDb250ZW50Vmlldyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb250ZW50VmlldzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNob3codmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGVudFZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50VmlldycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCB2aWV3ID0gdGhpcy5nZXRDb250ZW50VmlldygpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdjYW5jZWw6Y2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LmhpZGUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJGVsKTtcblxuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNob3codmlldyk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC4kZWwuYWRkQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc2hvdycpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuJGVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2Nsb3NlQW5pbWF0aW9uUmF0ZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsb3NlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZ1bmN0aW9uKCQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm90aWZpY2F0aW9uID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHRjbGFzc05hbWU6ICdub3RpZmljYXRpb24gY2xlYXJmaXgnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdC8vIChpbnQpIFRoZSBmbHktb3V0IGFuaW1hdGlvbiByYXRlIGluIG1pbGxpc2Vjb25kc1xuXHRcdFx0YW5pbWF0aW9uOiA1MDAsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBjbG9zZSBjbGFzcyBuYW1lXG5cdFx0XHRjbG9zZUNsYXNzTmFtZTogJ2Nsb3NlJyxcblxuXHRcdFx0Ly8gKGludCkgQ2xvc2UgYWZ0ZXIgYSBkZWxheSBpbiBtaWxsZWNvbmRzLiBQYXNzIGZhbHNlIHRvIG5vdCBjbG9zZVxuXHRcdFx0Y2xvc2VPbkRlbGF5OiA0MDAwLFxuXG5cdFx0XHQvLyAoYm9vbCkgQ2xvc2UgdGhlIG5vdGlmaWNhdGlvbiB3aGVuIGNsaWNrZWQgYW55d2hlcmVcblx0XHRcdGNsb3NlT25DbGljazogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIFRoZSBpY29uIGNsYXNzIHVzZWQgaW4gdGhlIGFsZXJ0XG5cdFx0XHRpY29uOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZ3xmYWxzZSkgVGhlIG5vdGlmaWNhdGlvbiBtZXNzYWdlXG5cdFx0XHRtZXNzYWdlOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZ3xmYWxzZSkgVGhlIG5vdGlmaWNhdGlvbiB0aXRsZVxuXHRcdFx0dGl0bGU6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUeXBlIG9mIG5vdGlmaWNhdGlvbiAoYWxlcnR8d2FybmluZ3xzdWNjZXNzKVxuXHRcdFx0dHlwZTogJ2FsZXJ0JyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGNsYXNzIG5hbWUgdGhhdCBtYWtlcyB0aGUgbm90aWZpY2F0aW9uIHZpc2libGVcblx0XHRcdHZpc2libGVDbGFzc05hbWU6ICd2aXNpYmxlJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGNsYXNzIG5hbWUgdGhhdCBpcyB1c2VkIGluIHRoZSB3cmFwcGVyIHRvIHdoaWNoXG5cdFx0XHQvLyBub3RpZmljYXRpb24gYXJlIGFwcGVuZGVkXG5cdFx0XHR3cmFwcGVyQ2xhc3NOYW1lOiAnbm90aWZpY2F0aW9ucydcblx0XHR9LFxuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vdGlmaWNhdGlvbicpLFxuXG5cdFx0bW9kZWw6IGZhbHNlLFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayc6ICdjbGljaycsXG5cdFx0XHQnY2xpY2sgLmNsb3NlJzogJ2Nsb3NlOmNsaWNrJ1xuXHRcdH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ2Nsb3NlT25DbGljaycpKSB7XG5cdFx0XHRcdHRoaXMuaGlkZSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvbkNsb3NlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5oaWRlKCk7XG5cdFx0fSxcblxuXHRcdGlzVmlzaWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy4kZWwuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3Zpc2libGVDbGFzc05hbWUnKSk7XG5cdFx0fSxcblxuXHRcdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHQgPSB0aGlzO1xuXG5cdFx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbigndmlzaWJsZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dC4kZWwucmVtb3ZlKCk7XG5cdFx0XHR9LCB0aGlzLmdldE9wdGlvbignYW5pbWF0aW9uJykpO1xuXG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2hpZGUnKTtcblx0XHR9LFxuXG5cdFx0Y3JlYXRlTm90aWZpY2F0aW9uc0RvbVdyYXBwZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyICR3cmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cIicrdGhpcy5nZXRPcHRpb24oJ3dyYXBwZXJDbGFzc05hbWUnKSsnXCIgLz4nKTtcblxuXHRcdFx0JCgnYm9keScpLmFwcGVuZCgkd3JhcHBlcik7XG5cblx0XHRcdHJldHVybiAkd3JhcHBlcjtcblx0XHR9LFxuXG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdCA9IHRoaXMsICR3cmFwcGVyID0gJCgnYm9keScpLmZpbmQoJy4nICsgdGhpcy5nZXRPcHRpb24oJ3dyYXBwZXJDbGFzc05hbWUnKSk7XG5cblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cblx0XHRcdGlmKCEkd3JhcHBlci5sZW5ndGgpIHtcblx0XHRcdFx0JHdyYXBwZXIgPSB0aGlzLmNyZWF0ZU5vdGlmaWNhdGlvbnNEb21XcmFwcGVyKCk7XG5cdFx0XHR9XG5cblx0XHRcdCR3cmFwcGVyLmFwcGVuZCh0aGlzLiRlbCk7XG5cblx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0eXBlJykpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0LiRlbC5hZGRDbGFzcyh0LmdldE9wdGlvbigndmlzaWJsZUNsYXNzTmFtZScpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbignY2xvc2VPbkRlbGF5JykgIT09IGZhbHNlKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYodC5pc1Zpc2libGUoKSkge1xuXHRcdFx0XHRcdFx0dC5oaWRlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCB0aGlzLmdldE9wdGlvbignY2xvc2VPbkRlbGF5JykpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3Nob3cnKTtcblx0XHR9XG5cblx0fSk7XG5cblx0cmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5Ob09yZGVyZWRMaXN0SXRlbSA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLW9yZGVyZWQtbGlzdC1pdGVtJyksXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdG1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJ1xuXHRcdH0sXG5cblx0XHR0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9ucztcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5PcmRlcmVkTGlzdEl0ZW0gPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdvcmRlcmVkLWxpc3QtaXRlbScpLFxuXG5cdFx0Y2xhc3NOYW1lOiAnb3JkZXJlZC1saXN0LWl0ZW0nLFxuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24oZSwgb2JqKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2snLCBvYmopO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHR0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uc1xuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94Lk9yZGVyZWRMaXN0ID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94Lk9yZGVyZWRMaXN0SXRlbSxcblxuICAgIFx0ZW1wdHlWaWV3OiBUb29sYm94Lk5vVW5vcmRlcmVkTGlzdEl0ZW0sXG5cblx0XHRjbGFzc05hbWU6ICdvcmRlcmVkLWxpc3QnLFxuXG5cdFx0dGFnTmFtZTogJ29sJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAob2JqZWN0KSBUaGUgdmlldyBvYmplY3QgdG8gdXNlIGZvciB0aGUgZW1wdHkgbWVzc2FnZVxuXHRcdFx0ZW1wdHlNZXNzYWdlVmlldzogVG9vbGJveC5Ob09yZGVyZWRMaXN0SXRlbSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGVyZSBhcmUgbm8gbGlzdCBpdGVtc1xuXHRcdFx0ZW1wdHlNZXNzYWdlOiAnVGhlcmUgYXJlIG5vIGl0ZW1zIGluIHRoZSBsaXN0LicsXG5cblx0XHRcdC8vIChib29sKSBTaG93IHRoZSBlbXB0eSBtZXNzYWdlIHZpZXdcblx0XHRcdHNob3dFbXB0eU1lc3NhZ2U6IHRydWVcblx0XHR9LFxuXG5cdFx0Y2hpbGRFdmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdpdGVtOmNsaWNrJywgdmlldyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuICAgICAgICBnZXRFbXB0eVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcdGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93RW1wdHlNZXNzYWdlJykpIHtcblx0ICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlVmlldycpO1xuXG5cdCAgICAgICAgICAgIFZpZXcgPSBWaWV3LmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG5cdCAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZScpXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBWaWV3O1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5QYWdlciA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3BhZ2VyJyksXG5cblx0XHR0YWdOYW1lOiAnbmF2JyxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2sgLm5leHQtcGFnZSc6ICduZXh0OnBhZ2U6Y2xpY2snLFxuXHRcdFx0J2NsaWNrIC5wcmV2LXBhZ2UnOiAncHJldjpwYWdlOmNsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKHN0cmluZykgVGhlIHBhZ2VyIGNsYXNzIG5hbWVcblx0XHRcdHBhZ2VyQ2xhc3NOYW1lOiAncGFnZXInLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgYWN0aXZlIGNsYXNzIG5hbWVcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkaXNhYmxlZCBjbGFzcyBuYW1lXG5cdFx0XHRkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIHByZXZpb3VzIGJ1dHRvbiBjbGFzcyBuYW1lXG5cdFx0XHRwcmV2Q2xhc3NOYW1lOiAncHJldmlvdXMnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgbmV4dCBidXR0b24gY2xhc3MgbmFtZVxuXHRcdFx0bmV4dENsYXNzTmFtZTogJ25leHQnLFxuXG5cdFx0XHQvLyAoYm9vbCkgSW5jbHVkZSB0aGUgcGFnZSB0b3RhbHMgYmV0d2VlbiB0aGUgcGFnZXIgYnV0dG9uc1xuXHRcdFx0aW5jbHVkZVBhZ2VUb3RhbHM6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBBbGlnbiBwYWdlciBidXR0c29uIHRvIGxlZnQgYW5kIHJpZ2h0IGVkZ2Vcblx0XHRcdHNuYXBUb0VkZ2VzOiB0cnVlLFxuXG5cdFx0XHQvLyAoaW50KSBUaGUgY3VycmVudCBwYWdlIG51bWJlclxuXHRcdFx0cGFnZTogMSxcblxuXHRcdFx0Ly8gKGludCkgVGhlIHRvdGFsIG51bWJlciBvZiBwYWdlc1xuXHRcdFx0dG90YWxQYWdlczogMSxcblxuXHRcdFx0Ly8gKHN0cmluZykgTmV4dCBidXR0b24gbGFiZWxcblx0XHRcdG5leHRMYWJlbDogJ05leHQnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBQcmV2aW91cyBidXR0b24gbGFiZWxcblx0XHRcdHByZXZMYWJlbDogJ1ByZXZpb3VzJ1xuXHRcdH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdG5leHRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHRcdHZhciB0b3RhbCA9IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cblx0XHRcdGlmKHBhZ2UgPCB0b3RhbCkge1xuXHRcdFx0XHRwYWdlKys7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25OZXh0UGFnZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubmV4dFBhZ2UoKTtcblx0XHR9LFxuXG5cdFx0cHJldlBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXG5cdFx0XHRpZihwYWdlID4gMSkge1xuXHRcdFx0XHRwYWdlLS07XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IDEpIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uUHJldlBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0fSxcblxuXHRcdHNldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3BhZ2luYXRlJywgcGFnZSk7XG5cdFx0fSxcblxuXHRcdGdldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKCQsIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LlBhZ2luYXRpb25JdGVtID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3BhZ2luYXRpb24taXRlbScpLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdC8vIChzdHJpbmcpIFRoZSBhY3RpdmUgcGFnZSBjbGFzcyBuYW1lXG5cdFx0XHRkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJ1xuXHRcdH0sXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrIGEnOiAnY2xpY2snXG5cdFx0fSxcblxuXHRcdG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdkaXZpZGVyJykgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94LlBhZ2luYXRpb24gPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXdDb250YWluZXI6ICd1bCcsXG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guUGFnaW5hdGlvbkl0ZW0sXG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncGFnaW5hdGlvbicpLFxuXG5cdFx0dGFnTmFtZTogJ25hdicsXG5cblx0XHRjaGlsZEV2ZW50czoge1xuXHRcdFx0J3BhZ2U6bmV4dCc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLm5leHRQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J3BhZ2U6cHJldic6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHRpZighdmlldy4kZWwuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHZpZXcubW9kZWwuZ2V0KCdwYWdlJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIC5uZXh0LXBhZ2UnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5uZXh0UGFnZSgpO1xuXHRcdFx0fSxcblx0XHRcdCdjbGljayAucHJldi1wYWdlJzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMucHJldlBhZ2UoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdHBhZ2luYXRpb25DbGFzc05hbWU6ICdwYWdpbmF0aW9uJyxcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cdFx0XHRkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJyxcblx0XHRcdHRvdGFsUGFnZXM6IDEsXG5cdFx0XHRzaG93UGFnZXM6IDYsXG5cdFx0XHRwYWdlOiAxXG5cdFx0fSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRUb29sYm94LkNvbXBvc2l0ZVZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XG4gICAgICAgICAgICB9XG5cdFx0fSxcblxuXHRcdGF0dGFjaEJ1ZmZlcjogZnVuY3Rpb24oY29sbGVjdGlvblZpZXcsIGJ1ZmZlcikge1xuXHRcdFx0JChidWZmZXIpLmluc2VydEFmdGVyKGNvbGxlY3Rpb25WaWV3LiRlbC5maW5kKCdsaTpmaXJzdC1jaGlsZCcpKTtcblx0XHR9LFxuXG5cdFx0b25CZWZvcmVSZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jb2xsZWN0aW9uLnJlc2V0KCk7XG5cblx0XHRcdHZhciBjdXJyZW50UGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0XHR2YXIgdG90YWxQYWdlcyA9IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cdFx0XHR2YXIgc2hvd1BhZ2VzID0gdGhpcy5nZXRPcHRpb24oJ3Nob3dQYWdlcycpO1xuXG5cdFx0XHRpZihzaG93UGFnZXMgJSAyKSB7XG5cdFx0XHRcdHNob3dQYWdlcysrOyAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyXG5cdFx0XHR9XG5cblx0XHRcdHZhciBzdGFydFBhZ2UgPSAoY3VycmVudFBhZ2UgPCBzaG93UGFnZXMpID8gMSA6IGN1cnJlbnRQYWdlIC0gKHNob3dQYWdlcyAvIDIpO1xuXG5cdFx0XHR2YXIgZW5kUGFnZSA9IHNob3dQYWdlcyArIHN0YXJ0UGFnZTtcblxuXHRcdFx0ZW5kUGFnZSA9ICh0b3RhbFBhZ2VzIDwgZW5kUGFnZSkgPyB0b3RhbFBhZ2VzIDogZW5kUGFnZTtcblxuXHRcdFx0dmFyIGRpZmYgPSBzdGFydFBhZ2UgLSBlbmRQYWdlICsgc2hvd1BhZ2VzO1xuXG5cdFx0XHRzdGFydFBhZ2UgLT0gKHN0YXJ0UGFnZSAtIGRpZmYgPiAwKSA/IGRpZmYgOiAwO1xuXG5cdFx0XHRpZiAoc3RhcnRQYWdlID4gMSkge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiAxfSk7XG5cblx0XHRcdFx0aWYoc3RhcnRQYWdlID4gMikge1xuXHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe2RpdmlkZXI6IHRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmb3IodmFyIGkgPSBzdGFydFBhZ2U7IGkgPD0gZW5kUGFnZTsgaSsrKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe3BhZ2U6IGl9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGVuZFBhZ2UgPCB0b3RhbFBhZ2VzKSB7XG5cdFx0XHRcdGlmKHRvdGFsUGFnZXMgLSAxID4gZW5kUGFnZSkge1xuXHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoe2RpdmlkZXI6IHRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiB0b3RhbFBhZ2VzfSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG5leHRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHRcdHZhciB0b3RhbCA9IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cblx0XHRcdGlmKHBhZ2UgPCB0b3RhbCkge1xuXHRcdFx0XHRwYWdlKys7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25OZXh0UGFnZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubmV4dFBhZ2UoKTtcblx0XHR9LFxuXG5cdFx0cHJldlBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXG5cdFx0XHRpZihwYWdlID4gMSkge1xuXHRcdFx0XHRwYWdlLS07XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJ1tkYXRhLXBhZ2U9XCInK3RoaXMuZ2V0T3B0aW9uKCdwYWdlJykrJ1wiXScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IDEpIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uUHJldlBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0fSxcblxuXHRcdHNldFNob3dQYWdlczogZnVuY3Rpb24oc2hvd1BhZ2VzKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMuc2hvd1BhZ2VzID0gc2hvd1BhZ2VzO1xuXHRcdH0sXG5cblx0XHRnZXRTaG93UGFnZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdzaG93UGFnZXMnKTtcblx0XHR9LFxuXG5cdFx0c2V0VG90YWxQYWdlczogZnVuY3Rpb24odG90YWxQYWdlcykge1xuXHRcdFx0dGhpcy5vcHRpb25zLnRvdGFsUGFnZXMgPSB0b3RhbFBhZ2VzO1xuXHRcdH0sXG5cblx0XHRnZXRUb3RhbFBhZ2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbignZ2V0VG90YWxQYWdlcycpO1xuXHRcdH0sXG5cblx0XHRzZXRQYWdlOiBmdW5jdGlvbihwYWdlKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMucGFnZSA9IHBhZ2U7XG5cdFx0fSxcblxuXHRcdGdldFBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0fSxcblxuXHRcdHNldFBhZ2luYXRpb25MaW5rczogZnVuY3Rpb24ocGFnZSwgdG90YWxQYWdlcykge1xuXHRcdFx0dGhpcy5zZXRQYWdlKHBhZ2UpO1xuXHRcdFx0dGhpcy5zZXRUb3RhbFBhZ2VzKHRvdGFsUGFnZXMpO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9LFxuXG5cdFx0c2V0QWN0aXZlUGFnZTogZnVuY3Rpb24ocGFnZSkge1xuXHRcdFx0aWYodGhpcy5vcHRpb25zLnBhZ2UgIT0gcGFnZSkge1xuXHRcdFx0XHR0aGlzLm9wdGlvbnMucGFnZSA9IHBhZ2U7XG5cdFx0XHRcdHRoaXMucmVuZGVyKCk7XG5cblx0XHRcdFx0dmFyIHF1ZXJ5ID0gdGhpcy5jb2xsZWN0aW9uLndoZXJlKHtwYWdlOiBwYWdlfSk7XG5cblx0XHRcdFx0aWYocXVlcnkubGVuZ3RoKSB7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdwYWdpbmF0ZScsIHBhZ2UsIHRoaXMuY2hpbGRyZW4uZmluZEJ5TW9kZWwocXVlcnlbMF0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRnZXRBY3RpdmVQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guUHJvZ3Jlc3NCYXIgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdwcm9ncmVzcy1iYXInKSxcblxuXHRcdGNsYXNzTmFtZTogJ3Byb2dyZXNzJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgcHJvZ3Jlc3MgYmFyIGNsYXNzIG5hbWVcblx0XHRcdHByb2dyZXNzQmFyQ2xhc3NOYW1lOiAncHJvZ3Jlc3MtYmFyJyxcblxuXHRcdFx0Ly8gKGludCkgVGhlIHByb2dyZXNzIHBlcmNlbnRhZ2Vcblx0XHRcdHByb2dyZXNzOiAwXG5cdFx0fSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0c2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uKHByb2dyZXNzKSB7XG5cdFx0XHRpZihwcm9ncmVzcyA8IDApIHtcblx0XHRcdFx0cHJvZ3Jlc3MgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihwcm9ncmVzcyA+IDEwMCkge1xuXHRcdFx0XHRwcm9ncmVzcyA9IDEwMDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vcHRpb25zLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3Byb2dyZXNzJywgcHJvZ3Jlc3MpO1xuXG5cdFx0XHRpZihwcm9ncmVzcyA9PT0gMTAwKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY29tcGxldGUnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwcm9ncmVzcycpO1xuXHRcdH0sXG5cblx0XHRvblByb2dyZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlJhZGlvRmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLXJhZGlvLWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgb3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdyYWRpbycsXG4gICAgICAgICAgICBjaGVja2JveENsYXNzTmFtZTogJ3JhZGlvJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJzpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCdbdmFsdWU9XCInK3ZhbHVlKydcIl0nKS5hdHRyKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnbm91aXNsaWRlciddLCBmdW5jdGlvbihub1VpU2xpZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIG5vVWlTbGlkZXIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdub3Vpc2xpZGVyJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Lm5vVWlTbGlkZXIpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIG5vVWlTbGlkZXIpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guUmFuZ2VTbGlkZXIgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncmFuZ2Utc2xpZGVyJyksXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChib29sKSBTaG91bGQgdGhlIHNsaWRlciBiZSBhbmltYXRlXG4gICAgICAgICAgICBhbmltYXRlOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBDbGljayBlZmZlY3RzIGZvciBtYW5pcHVsYXRpbmcgdGhlIHNsaWRlci5cbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIHZhbHVlczogXCJkcmFnXCIsIFwidGFwXCIsIFwiZml4ZWRcIiwgXCJzbmFwXCIgb3IgXCJub25lXCJcbiAgICAgICAgICAgIGJlaGF2aW9yOiAndGFwJyxcblxuICAgICAgICAgICAgLy8gKG1peGVkKSBTaG91bGQgdGhlIGhhbmRsZXMgYmUgY29ubmVjdGVkLlxuICAgICAgICAgICAgLy8gUG9zc2libGUgdmFsdWVzOiB0cnVlLCBmYWxzZSwgXCJ1cHBlclwiLCBvciBcImxvd2VyXCJcbiAgICAgICAgICAgIGNvbm5lY3Q6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgZGlyZWN0aW9uIG9mIHRoZSBzbGlkZXIuIFwibHRyXCIgb3IgXCJydGxcIlxuICAgICAgICAgICAgZGlyZWN0aW9uOiAnbHRyJyxcblxuICAgICAgICAgICAgLy8gKGludCkgVGhlIG1heGltdW0gZGlzdGFuY2UgdGhlIGhhbmRsZXMgY2FuIGJlIGZyb20gZWFjaCBvdGhlclxuICAgICAgICAgICAgLy8gZmFsc2UgZGlzYWJsZXMgdGhpcyBvcHRpb24uXG4gICAgICAgICAgICBsaW1pdDogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBtaW5pbXVtIGRpc3RhbmNlIHRoZSBoYW5kbGVzIGNhbiBiZSBmcm9tIGVhY2ggb3RoZXJcbiAgICAgICAgICAgIC8vIGZhbHNlIGRpc2FibGVkIHRoaXMgb3B0aW9uXG4gICAgICAgICAgICBtYXJnaW46IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgb3JpZW50YXRpb24gb2YgdGhlIHNsaWRlci4gXCJob3Jpem9udGFsXCIgb3IgXCJ2ZXJ0aWNhbFwiXG4gICAgICAgICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIHN0YXJ0aW5nIHBvc3NpdGlvbiBvZiB0aGUgc2xpZGVyIGhhbmRsZXNcbiAgICAgICAgICAgIHN0YXJ0OiBbMF0sXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBzdGVwIGludGVnZXJcbiAgICAgICAgICAgIHN0ZXA6IDAsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIHRoZSByYW5nZSBvYmplY3QgZGVmaW5lZCB0aGUgbWluL21heCB2YWx1ZXNcbiAgICAgICAgICAgIHJhbmdlOiB7XG4gICAgICAgICAgICAgICAgbWluOiBbMF0sXG4gICAgICAgICAgICAgICAgbWF4OiBbMTAwXVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZTogdGhpcy5nZXRPcHRpb24oJ2FuaW1hdGUnKSxcbiAgICAgICAgICAgICAgICBiZWhhdmlvcjogdGhpcy5nZXRPcHRpb24oJ2JlaGF2aW9yJyksXG4gICAgICAgICAgICAgICAgY29ubmVjdDogdGhpcy5nZXRPcHRpb24oJ2Nvbm5lY3QnKSxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IHRoaXMuZ2V0T3B0aW9uKCdkaXJlY3Rpb24nKSxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogdGhpcy5nZXRPcHRpb24oJ29yaWVudGF0aW9uJyksXG4gICAgICAgICAgICAgICAgcmFuZ2U6IHRoaXMuZ2V0T3B0aW9uKCdyYW5nZScpLFxuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldE9wdGlvbignc3RhcnQnKSxcbiAgICAgICAgICAgICAgICBzdGVwOiB0aGlzLmdldE9wdGlvbignc3RlcCcpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbWFyZ2luJykgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5tYXJnaW4gPSB0aGlzLmdldE9wdGlvbignbWFyZ2luJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdsaW1pdCcpICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubGltaXQgPSB0aGlzLmdldE9wdGlvbignbGltaXQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNsaWRlciA9IHRoaXMuJGVsLmZpbmQoJy5zbGlkZXInKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHNsaWRlciA9IG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHNsaWRlci5vbignc2xpZGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3NsaWRlJywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXIub24oJ3NldCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc2V0JywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnY2hhbmdlJywgdC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNsaWRlckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJy5zbGlkZXInKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmdldFNsaWRlckVsZW1lbnQoKS52YWwodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkuYXR0cignZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5TZWxlY3RGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tc2VsZWN0LWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAnc2VsZWN0JyxcbiAgICAgICAgICAgIG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IFtdXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjaGFuZ2UgLmZvcm0tY29udHJvbCc6ICdjaGFuZ2UnXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnc2VsZWN0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh0aGlzLmdldElucHV0RmllbGQoKS5maW5kKCdvcHRpb246Zmlyc3QnKS52YWwoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnLCAnaW50ZXJhY3QuanMnXSwgZnVuY3Rpb24oJCwgXywgaW50ZXJhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXywgaW50ZXJhY3QpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2ludGVyYWN0LmpzJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8sIHJvb3QuaW50ZXJhY3QpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8sIGludGVyYWN0KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBmdW5jdGlvbiBmaW5kKGlkLCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHZhciB3aGVyZSA9IGdldFdoZXJlKGlkKTtcblxuICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5maW5kKHdoZXJlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRXaGVyZShpZCkge1xuICAgICAgICB2YXIgd2hlcmUgPSB7fTtcblxuICAgICAgICB3aGVyZVtnZXRJZEF0dHJpYnV0ZShpZCldID0gaWQ7XG5cbiAgICAgICAgcmV0dXJuIHdoZXJlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldElkQXR0cmlidXRlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBfLmlzTnVsbChuZXcgU3RyaW5nKHZhbHVlKS5tYXRjaCgvXmNcXGQrJC8pKSA/ICdpZCcgOiAnY2lkJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZWxlbWVudCwgdmlldykge1xuICAgICAgICB2YXIgJHBhcmVudCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgaWYoISRwYXJlbnQuaGFzQ2xhc3MoJ2Ryb3BwYWJsZS1wb29sJykpIHtcbiAgICAgICAgICAgICRwYXJlbnQgPSAkcGFyZW50LnBhcmVudHMoJy5kcm9wcGFibGUtcG9vbCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRwYXJlbnQuaGFzQ2xhc3MoJ2F2YWlsYWJsZS1wb29sJykgP1xuICAgICAgICAgICAgdmlldy5hdmFpbGFibGUuY3VycmVudFZpZXcgOlxuICAgICAgICAgICAgdmlldy5zZWxlY3RlZC5jdXJyZW50VmlldztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zlck5vZGVBZnRlcihldmVudCwgdmlldykge1xuICAgICAgICB2YXIgZnJvbVdoZXJlID0ge30sIHRvV2hlcmUgPSB7fTtcbiAgICAgICAgdmFyIGZyb20gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCwgdmlldyk7XG4gICAgICAgIHZhciB0byA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC50YXJnZXQsIHZpZXcpO1xuXG4gICAgICAgIGZyb21XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICAgICAgdG9XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgdmFyIGZyb21Nb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUoZnJvbVdoZXJlKTtcbiAgICAgICAgdmFyIHRvTW9kZWwgPSB0by5jb2xsZWN0aW9uLmZpbmRXaGVyZSh0b1doZXJlKTtcblxuICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShmcm9tTW9kZWwpO1xuICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihmcm9tTW9kZWwsIHRvTW9kZWwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zZmVyTm9kZUJlZm9yZShldmVudCwgdmlldykge1xuICAgICAgICB2YXIgZnJvbVdoZXJlID0ge30sIHRvV2hlcmUgPSB7fTtcbiAgICAgICAgdmFyIGZyb20gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCwgdmlldyk7XG4gICAgICAgIHZhciB0byA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC50YXJnZXQsIHZpZXcpO1xuXG5cbiAgICAgICAgZnJvbVdoZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAgICAgICB0b1doZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICB2YXIgZnJvbU1vZGVsID0gZnJvbS5jb2xsZWN0aW9uLmZpbmRXaGVyZShmcm9tV2hlcmUpO1xuICAgICAgICB2YXIgdG9Nb2RlbCA9IHRvLmNvbGxlY3Rpb24uZmluZFdoZXJlKHRvV2hlcmUpO1xuXG4gICAgICAgIGZyb20uY29sbGVjdGlvbi5yZW1vdmVOb2RlKGZyb21Nb2RlbCk7XG4gICAgICAgIHRvLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUJlZm9yZShmcm9tTW9kZWwsIHRvTW9kZWwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zZmVyTm9kZUNoaWxkcmVuKGV2ZW50LCB2aWV3KSB7XG4gICAgICAgIHZhciBmcm9tV2hlcmUgPSB7fSwgdG9XaGVyZSA9IHt9O1xuICAgICAgICB2YXIgZnJvbSA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC5yZWxhdGVkVGFyZ2V0LCB2aWV3KTtcbiAgICAgICAgdmFyIHRvID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnRhcmdldCwgdmlldyk7XG5cbiAgICAgICAgaWYoJChldmVudC50YXJnZXQpLmZpbmQoJy5jaGlsZHJlbicpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiY2hpbGRyZW5cIiAvPicpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJvbVdoZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAgICAgICB0b1doZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICB2YXIgZnJvbU1vZGVsID0gZnJvbS5jb2xsZWN0aW9uLmZpbmRXaGVyZShmcm9tV2hlcmUpO1xuICAgICAgICB2YXIgdG9Nb2RlbCA9IHRvLmNvbGxlY3Rpb24uZmluZFdoZXJlKHRvV2hlcmUpO1xuXG4gICAgICAgIGZyb20uY29sbGVjdGlvbi5yZW1vdmVOb2RlKGZyb21Nb2RlbCk7XG4gICAgICAgIHRvLmNvbGxlY3Rpb24uYXBwZW5kTm9kZShmcm9tTW9kZWwsIHRvTW9kZWwsIHtcbiAgICAgICAgICAgIGF0OiAwXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIFRvb2xib3guU2VsZWN0aW9uUG9vbCA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdzZWxlY3Rpb24tcG9vbCcpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3NlbGVjdGlvbi1wb29sJyxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBhdmFpbGFibGU6ICcuYXZhaWxhYmxlLXBvb2wnLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6ICcuc2VsZWN0ZWQtcG9vbCcsXG4gICAgICAgICAgICBhY3Rpdml0eTogJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtYWN0aXZpdHknXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuZXN0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlOiBbXSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlldzogVG9vbGJveC5TZWxlY3Rpb25Qb29sVHJlZVZpZXcsXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlld1RlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdzZWxlY3Rpb24tcG9vbC10cmVlLW5vZGUnKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWU6IFtdLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXc6IFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVWaWV3LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWVWaWV3VGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3NlbGVjdGlvbi1wb29sLXRyZWUtbm9kZScpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwaW5nU3RvcHBlZFRocmVzaG9sZDogNTAwLFxuICAgICAgICAgICAgICAgIGxpa2VuZXNzVGhyZXNob2xkOiA3NSxcbiAgICAgICAgICAgICAgICBzY3JvbGxCb3R0b21UaHJlc2hvbGQ6IDEwLFxuICAgICAgICAgICAgICAgIHNlYXJjaEluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAndGlueSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXInOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyU2VhcmNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsLm9mZignZGV0ZWN0aW9uOnR5cGluZzpzdGFydGVkJywgZmFsc2UsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsLm9mZignZGV0ZWN0aW9uOnR5cGluZzpzdG9wcGVkJywgZmFsc2UsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5MYXlvdXRWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vbignZGV0ZWN0aW9uOnR5cGluZzpzdGFydGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd0eXBpbmc6c3RhcnRlZCcpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vbignZGV0ZWN0aW9uOnR5cGluZzpzdG9wcGVkJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3R5cGluZzpzdG9wcGVkJywgdmFsdWUpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1NlYXJjaEFjdGl2aXR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuYWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKHRoaXMuZ2V0T3B0aW9uKCdzZWFyY2hJbmRpY2F0b3JPcHRpb25zJykpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzaG93LWFjdGl2aXR5Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpdml0eS5zaG93KHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVTZWFyY2hBY3Rpdml0eTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ3Nob3ctYWN0aXZpdHknKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2aXR5LmVtcHR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0F2YWlsYWJsZVBvb2w6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgXHRcdHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmdldE9wdGlvbignYXZhaWxhYmxlVHJlZScpLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiBfLmV4dGVuZCh7fSwgVmlldy5wcm90b3R5cGUuY2hpbGRWaWV3T3B0aW9ucywge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGFibGU6IHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZ2V0T3B0aW9uKCdhdmFpbGFibGVUcmVlVmlld1RlbXBsYXRlJylcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgXHRcdH0sIHRoaXMuZ2V0T3B0aW9uKCdhdmFpbGFibGVUcmVlVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICAgICAgdmlldy5jb2xsZWN0aW9uLm9uKCdhZGQgcmVtb3ZlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlc2V0U2Nyb2xsQm90dG9tLmNhbGwoc2VsZik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93U2VsZWN0aW9uUG9vbFZpZXcodGhpcy5hdmFpbGFibGUsIHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTZWxlY3RlZFBvb2w6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlVmlldycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgIFx0XHR2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5nZXRPcHRpb24oJ3NlbGVjdGVkVHJlZScpLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiBfLmV4dGVuZCh7fSwgVmlldy5wcm90b3R5cGUuY2hpbGRWaWV3T3B0aW9ucywge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGFibGU6IHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZ2V0T3B0aW9uKCdzZWxlY3RlZFRyZWVWaWV3VGVtcGxhdGUnKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICBcdFx0fSwgdGhpcy5nZXRPcHRpb24oJ3NlbGVjdGVkVHJlZVZpZXdPcHRpb25zJykpKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1NlbGVjdGlvblBvb2xWaWV3KHRoaXMuc2VsZWN0ZWQsIHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTZWxlY3Rpb25Qb29sVmlldzogZnVuY3Rpb24ocmVnaW9uLCB2aWV3KSB7XG4gICAgICAgICAgICB2aWV3Lm9uKCdkcm9wJywgZnVuY3Rpb24oZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2Ryb3AnLCBldmVudCwgdmlldyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgdmlldy5vbignZHJvcDpiZWZvcmUnLCBmdW5jdGlvbihldmVudCwgdmlldykge1xuICAgICAgICAgICAgICAgIHRyYW5zZmVyTm9kZUJlZm9yZShldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkcm9wOmJlZm9yZScsIGV2ZW50LCB2aWV3KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdkcm9wOmFmdGVyJywgZnVuY3Rpb24oZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zlck5vZGVBZnRlcihldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHZpZXcpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ2Ryb3A6Y2hpbGRyZW4nLCBmdW5jdGlvbihldmVudCwgdmlldykge1xuICAgICAgICAgICAgICAgIHRyYW5zZmVyTm9kZUNoaWxkcmVuKGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgdmlldyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcmVnaW9uLnNob3codmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9kZWxDb250YWluczogZnVuY3Rpb24obW9kZWwsIHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yKHZhciBpIGluIG1vZGVsID0gbW9kZWwudG9KU09OKCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBtb2RlbFtpXTtcblxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY29udGFpbnMuY2FsbCh0aGlzLCB2YWx1ZSwgcXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbnRhaW5zOiBmdW5jdGlvbihzdWJqZWN0LCBxdWVyeSkge1xuICAgICAgICAgICAgaWYoIV8uaXNTdHJpbmcoc3ViamVjdCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiBxdWVyeSA9IHF1ZXJ5LnNwbGl0KCcgJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBxdWVyeVtpXTtcblxuICAgICAgICAgICAgICAgIGlmKHN1YmplY3QudG9VcHBlckNhc2UoKS5pbmNsdWRlcyh2YWx1ZS50b1VwcGVyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY29tcGFyaXNvbiA9IG5ldyBUb29sYm94LkxldmVuc2h0ZWluKHZhbHVlLnRvVXBwZXJDYXNlKCksIHN1YmplY3QudG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgdmFyIHBlcmNlbnQgPSBjb21wYXJpc29uLmRpc3RhbmNlIC8gc3ViamVjdC5sZW5ndGggKiAxMDAgLSAxMDA7XG5cbiAgICAgICAgICAgICAgICBpZihwZXJjZW50ID4gdGhpcy5nZXRPcHRpb24oJ2xpa2VuZXNzVGhyZXNob2xkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VhcmNoOiBmdW5jdGlvbihjb2xsZWN0aW9uLCBxdWVyeSkge1xuICAgICAgICAgICAgY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLm1vZGVsQ29udGFpbnMobW9kZWwsIHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ2hpZGRlbicsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldCgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5hdmFpbGFibGUuY3VycmVudFZpZXcucmVuZGVyKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyU2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9ICcnO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoLWZpZWxkIGlucHV0JykudmFsKHZhbHVlKS5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5oaWRlQ2xlYXJTZWFyY2hCdXR0b24oKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgndHlwaW5nOnN0b3BwZWQnLCB2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0NsZWFyU2VhcmNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXInKS5hZGRDbGFzcygnc2hvdycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVDbGVhclNlYXJjaEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoLWNsZWFyJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblR5cGluZ1N0YXJ0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93U2VhcmNoQWN0aXZpdHkoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblR5cGluZ1N0b3BwZWQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVTZWFyY2hBY3Rpdml0eSgpO1xuXG4gICAgICAgICAgICBpZih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NsZWFyU2VhcmNoQnV0dG9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVDbGVhclNlYXJjaEJ1dHRvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoKHRoaXMuYXZhaWxhYmxlLmN1cnJlbnRWaWV3LmNvbGxlY3Rpb24sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZXNldFNjcm9sbEJvdHRvbTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxBdEJvdHRvbSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsSGVpZ2h0ID0gdGhpcy5hdmFpbGFibGUuY3VycmVudFZpZXcuJGVsLnBhcmVudCgpLnByb3AoJ3Njcm9sbEhlaWdodCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIGRldGVjdGlvbiA9IG5ldyBUb29sYm94LlR5cGluZ0RldGVjdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoIGlucHV0JyksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3R5cGluZ1N0b3BwZWRUaHJlc2hvbGQnKSxcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHZhciAkYXZhaWxhYmxlUG9vbCA9IHRoaXMuYXZhaWxhYmxlLmN1cnJlbnRWaWV3LiRlbC5wYXJlbnQoKTtcblxuICAgICAgICAgICAgdGhpcy5fbGFzdFNjcm9sbFRvcCA9IDA7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxBdEJvdHRvbSA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5fc2Nyb2xsSGVpZ2h0ID0gJGF2YWlsYWJsZVBvb2wucHJvcCgnc2Nyb2xsSGVpZ2h0Jyk7XG5cbiAgICAgICAgICAgICRhdmFpbGFibGVQb29sLnNjcm9sbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsVG9wID0gJCh0aGlzKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgICAgICB2YXIgdGhyZXNob2xkID0gc2VsZi5nZXRPcHRpb24oJ3Njcm9sbEJvdHRvbVRocmVzaG9sZCcpO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5faXNTY3JvbGxpbmdEb3duID0gc2Nyb2xsVG9wID4gc2VsZi5fbGFzdFNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICBzZWxmLl9pc1Bhc3RUaHJlc2hvbGQgPSBzY3JvbGxUb3AgKyAkKHRoaXMpLmhlaWdodCgpID49IHNlbGYuX3Njcm9sbEhlaWdodCAtIHRocmVzaG9sZDtcblxuICAgICAgICAgICAgICAgIGlmKHNlbGYuX2lzU2Nyb2xsaW5nRG93biAmJiBzZWxmLl9pc1Bhc3RUaHJlc2hvbGQgJiYgIXNlbGYuX3Njcm9sbEF0Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Njcm9sbEF0Qm90dG9tID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdzY3JvbGw6Ym90dG9tJywgc2Nyb2xsVG9wKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXNlbGYuX2lzU2Nyb2xsaW5nRG93biAmJiAhc2VsZi5faXNQYXN0VGhyZXNob2xkKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2Nyb2xsQXRCb3R0b20gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9sYXN0U2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5kcm9wcGFibGUtcG9vbCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICRwb29sID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIGludGVyYWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIC5kcm9wem9uZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHQ6ICQodGhpcykuZGF0YSgnYWNjZXB0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmRyb3A6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdoZXJlID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZyb20gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCwgc2VsZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnRhcmdldCwgc2VsZik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUod2hlcmUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbS5jb2xsZWN0aW9uLnJlbW92ZU5vZGUobW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvLmNvbGxlY3Rpb24uYXBwZW5kTm9kZShtb2RlbCwgbnVsbCwge2F0OiAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmluZGV4KCl9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuJGVsLnJlbW92ZUNsYXNzKCdkcm9wcGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRwb29sLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdkcm9wcGFibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ3Bvb2w6ZHJvcCcsIGV2ZW50LCBtb2RlbCwgZnJvbSwgdG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZHJhZ2VudGVyOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLiRlbC5hZGRDbGFzcygnZHJvcHBpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcG9vbC5wYXJlbnQoKS5hZGRDbGFzcygnZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdwb29sOmRyYWc6ZW50ZXInLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25kcmFnbGVhdmU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuJGVsLnJlbW92ZUNsYXNzKCdkcm9wcGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRwb29sLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdkcm9wcGFibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ3Bvb2w6ZHJhZzpsZWF2ZScsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93QXZhaWxhYmxlUG9vbCgpO1xuICAgICAgICAgICAgdGhpcy5zaG93U2VsZWN0ZWRQb29sKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdqcXVlcnknXSwgZnVuY3Rpb24oXywgJCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCAkKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LiQpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQpIHtcblxuICAgIFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVOb2RlID0gVG9vbGJveC5EcmFnZ2FibGVUcmVlTm9kZS5leHRlbmQoe1xuXG4gICAgICAgIG9uRHJvcDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcywgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIFRvb2xib3guRHJvcHpvbmVzKGV2ZW50LmRyYWdFdmVudCwgZXZlbnQudGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgYmVmb3JlOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmJlZm9yZScsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFmdGVyOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmNoaWxkcmVuJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIGlmKCR0YXJnZXQuaGFzQ2xhc3MoJ2Ryb3AtYmVmb3JlJykpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMucm9vdCgpLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUJlZm9yZShub2RlLCBwYXJlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YmVmb3JlJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZigkdGFyZ2V0Lmhhc0NsYXNzKCdkcm9wLWFmdGVyJykpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMucm9vdCgpLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUFmdGVyKG5vZGUsIHBhcmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoJHRhcmdldC5oYXNDbGFzcygnZHJvcC1jaGlsZHJlbicpKSB7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ25lc3RhYmxlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGUobm9kZSwgcGFyZW50LCB7YXQ6IDB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpjaGlsZHJlbicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlQWZ0ZXIobm9kZSwgcGFyZW50LCB7YXQ6IDB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3AnLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guRHJhZ2dhYmxlVHJlZU5vZGUucHJvdG90eXBlLm9uRG9tUmVmcmVzaC5jYWxsKHRoaXMpO1xuXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsLmdldCgnaGlkZGVuJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICBUb29sYm94LlNlbGVjdGlvblBvb2xUcmVlVmlldyA9IFRvb2xib3guRHJhZ2dhYmxlVHJlZVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVOb2RlXG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2JhY2tib25lJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbihCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5CYWNrYm9uZSwgcm9vdC5NYXJpb25ldHRlLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEJhY2tib25lLCBNYXJpb25ldHRlLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlN0b3JhZ2UgPSBNYXJpb25ldHRlLk9iamVjdC5leHRlbmQoe1xuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICB0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBzdG9yYWdlRW5naW5lOiBsb2NhbFN0b3JhZ2UsXG4gICAgICAgICAgICBkYXRhQ2xhc3M6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YTogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgICAgICBNYXJpb25ldHRlLk9iamVjdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBUb29sYm94Lk9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMudGFibGVOYW1lKCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgXFwndGFibGVcXCcgb3B0aW9uIG11c3QgYmUgc2V0IHdpdGggYSB2YWxpZCB0YWJsZSBuYW1lLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVRhYmxlKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdkYXRhJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZGF0YScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5naW5lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignc3RvcmFnZUVuZ2luZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRhYmxlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RhYmxlJylcbiAgICAgICAgfSxcblxuICAgICAgICBkb2VzVGFibGVFeGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIV8uaXNOdWxsKHRoaXMuZW5naW5lKCkuZ2V0SXRlbSh0aGlzLnRhYmxlTmFtZSgpKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlVGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuZG9lc1RhYmxlRXhpc3QoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3lUYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVuZ2luZSgpLnJlbW92ZUl0ZW0odGhpcy50YWJsZU5hbWUoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UodGhpcy5lbmdpbmUoKS5nZXRJdGVtKHRoaXMudGFibGVOYW1lKCkpKTtcbiAgICAgICAgICAgIHZhciBEYXRhQ2xhc3MgPSBfLmlzQXJyYXkoZGF0YSkgPyBCYWNrYm9uZS5Db2xsZWN0aW9uIDogQmFja2JvbmUuTW9kZWw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdkYXRhQ2xhc3MnKSkge1xuICAgICAgICAgICAgICAgIERhdGFDbGFzcyAgPSB0aGlzLmdldE9wdGlvbignZGF0YUNsYXNzJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZGF0YSA9IG5ldyBEYXRhQ2xhc3MoZGF0YSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZGF0YScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmdpbmUoKS5zZXRJdGVtKHRoaXMudGFibGVOYW1lKCksIEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0T3B0aW9uKCdkYXRhJykudG9KU09OKCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICAvLyBUT0RPOiBBZGQgS2V5U3RvcmVcbiAgICAvKlxuICAgIFRvb2xib3guS2V5U3RvcmUgPSBUb29sYm94LlN0b3JhZ2UuZXh0ZW5kKHtcblxuICAgIH0pO1xuICAgICovXG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZScsICdiYWNrYm9uZScsICdiYWNrYm9uZS5tYXJpb25ldHRlJ10sIGZ1bmN0aW9uKCQsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSwgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8sIEJhY2tib25lLCBNYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UYWJsZU5vSXRlbXNSb3cgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAndHInLFxuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS1uby1pdGVtcycpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ25vLXJlc3VsdHMnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoYXJyYXkpIEFycmF5IG9mIGFycmF5IG9mIGNvbHVtblxuICAgICAgICAgICAgY29sdW1uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIHRhYmxlIHJvd3NcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdObyByb3dzIGZvdW5kJ1xuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5UYWJsZVZpZXdSb3cgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAndHInLFxuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS12aWV3LXJvdycpLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoYXJyYXkpIEFycmF5IG9mIGFycmF5IG9mIGNvbHVtblxuICAgICAgICAgICAgY29sdW1uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChtaXhlZCkgSWYgbm90IGZhbHNlLCBwYXNzIGEgdmFsaWQgVmlldyBwcm90b3R5cGVcbiAgICAgICAgICAgIGVkaXRGb3JtQ2xhc3M6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAobWl4ZWQpIElmIG5vdCBmYWxzZSwgcGFzcyBhIHZhbGlkIFZpZXcgcHJvdG90eXBlXG4gICAgICAgICAgICBkZWxldGVGb3JtQ2xhc3M6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayAuZWRpdCc6ICdjbGljazplZGl0JyxcbiAgICAgICAgICAgICdjbGljayAuZGVsZXRlJzogJ2NsaWNrOmRlbGV0ZSdcbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tFZGl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VkaXRGb3JtQ2xhc3MnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoe1xuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbignc3VibWl0OnN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXdJbk1vZGFsKHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tEZWxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZGVsZXRlRm9ybUNsYXNzJyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXdJbk1vZGFsKHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dWaWV3SW5Nb2RhbDogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdmFyIG1vZGFsID0gbmV3IFRvb2xib3guTW9kYWwoe1xuICAgICAgICAgICAgICAgIGNvbnRlbnRWaWV3OiB2aWV3XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmlldy5vbignc3VibWl0OnN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBtb2RhbC5oaWRlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbW9kYWwuc2hvdygpO1xuXG4gICAgICAgICAgICByZXR1cm4gbW9kYWw7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5UYWJsZVZpZXdGb290ZXIgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAndHInLFxuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS12aWV3LWZvb3RlcicpLFxuXG4gICAgICAgIG1vZGVsRXZlbnRzOiB7XG4gICAgICAgICAgICAnY2hhbmdlJzogJ3JlbmRlcidcbiAgICAgICAgfSxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBjb250ZW50OiAndGQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQXJyYXkgb2YgYXJyYXkgb2YgY29sdW1uXG4gICAgICAgICAgICBjb2x1bW5zOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5UYWJsZVZpZXcgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjbGFzc05hbWU6ICd0YWJsZS12aWV3JyxcblxuICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guVGFibGVWaWV3Um93LFxuXG4gICAgICAgIGNoaWxkVmlld0NvbnRhaW5lcjogJ3Rib2R5JyxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtdmlldy1ncm91cCcpLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgc3RhcnRpbmcgcGFnZVxuICAgICAgICAgICAgcGFnZTogMSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG9yZGVyIG9mIHRoZSBkYXRlIGJlaW5nIHJldHVybmVkXG4gICAgICAgICAgICBvcmRlcjogbnVsbCxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgRWl0aGVyIGFzYyBvciBkZXNjIHNvcnRpbmcgb3JkZXJcbiAgICAgICAgICAgIHNvcnQ6IG51bGwsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBudW1iZXJzIG9mIHJvd3MgcGVyIHBhZ2VcbiAgICAgICAgICAgIGxpbWl0OiAyMCxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIFNob3VsZCBzaG93IHRoZSBwYWdpbmF0aW9uIGZvciB0aGlzIHRhYmxlXG4gICAgICAgICAgICBwYWdpbmF0ZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgRmV0Y2ggdGhlIGRhdGEgd2hlbiB0YWJsZSBpcyBzaG93blxuICAgICAgICAgICAgZmV0Y2hPblNob3c6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgaGVhZGVycyBhcHBlbmRlZCB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgcmVxdWVzdEhlYWRlcnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIFRoZSBkZWZhdWx0IG9wdGlvbnMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgICAgICBkZWZhdWx0UmVxdWVzdERhdGFPcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgJ3BhZ2UnLFxuICAgICAgICAgICAgICAgICdsaW1pdCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnc29ydCdcbiAgICAgICAgICAgIF0sXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQWRkaXRpb25hbCBvcHRpb25zIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIHF1ZXJ5IHN0cmluZ1xuICAgICAgICAgICAgcmVxdWVzdERhdGFPcHRpb25zOiBbXSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIHBhZ2luYXRpb24gdmlldyBjbGFzc1xuICAgICAgICAgICAgcGFnaW5hdGlvblZpZXc6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgcGFnaW5hdGlvbiB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBwYWdpbmF0aW9uVmlld09wdGlvbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgaGVhZGVyXG4gICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgaGVhZGVyIHRhZyBuYW1lXG4gICAgICAgICAgICBoZWFkZXJUYWdOYW1lOiAnaDMnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgaGVhZGVyIGNsYXNzIG5hbWVcbiAgICAgICAgICAgIGhlYWRlckNsYXNzTmFtZTogJ3RhYmxlLWhlYWRlcicsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBkZXNjcmlwdGlvblxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgZGVzY3JpcHRpb24gdGFnXG4gICAgICAgICAgICBkZXNjcmlwdGlvblRhZzogJ3AnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgZGVzY3JpcHRpb24gdGFnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbkNsYXNzTmFtZTogJ2Rlc2NyaXB0aW9uIHJvdyBjb2wtc20tNicsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBjbGFzcyBuYW1lXG4gICAgICAgICAgICB0YWJsZUNsYXNzTmFtZTogJ3RhYmxlJyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGxvYWRpbmcgY2xhc3MgbmFtZVxuICAgICAgICAgICAgbG9hZGluZ0NsYXNzTmFtZTogJ2xvYWRpbmcnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1vZGVsIHN0b3JpbmcgdGhlIGNvbHVtbnNcbiAgICAgICAgICAgIGNoaWxkVmlld0NvbHVtbnNQcm9wZXJ0eTogJ2NvbHVtbnMnLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgIGluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdzbWFsbCdcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIHRhYmxlIHJvd3NcbiAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogJ05vIHJvd3MgZm91bmQnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbmFtZSBvZiB0aGUgY2xhc3MgYXBwZW5kZWQgdG8gdGhlIGJ1dHRvbnNcbiAgICAgICAgICAgIGJ1dHRvbkNsYXNzTmFtZTogJ2J0biBidG4tZGVmYXVsdCcsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgYnV0dG9uIG9iamVjdHNcbiAgICAgICAgICAgIC8vIHtocmVmOiAndGVzdC0xMjMnLCBsYWJlbDogJ1Rlc3QgMTIzJ31cbiAgICAgICAgICAgIGJ1dHRvbnM6IFtdXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLnNvcnQnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzb3J0OmNsaWNrJywgZSk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NsaWNrIC5idXR0b25zLXdyYXBwZXIgYSc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnV0dG9ucyA9IHRoaXMuZ2V0T3B0aW9uKCdidXR0b25zJyk7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAkKGUudGFyZ2V0KS5pbmRleCgpO1xuXG4gICAgICAgICAgICAgICAgaWYoXy5pc0FycmF5KGJ1dHRvbnMpICYmIGJ1dHRvbnNbaV0ub25DbGljaykge1xuICAgICAgICAgICAgICAgICAgICBidXR0b25zW2ldLm9uQ2xpY2suY2FsbCh0aGlzLCAkKGUudGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFbXB0eVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSBUb29sYm94LlRhYmxlTm9JdGVtc1Jvdy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZScpLFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldE9wdGlvbignY29sdW1ucycpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBWaWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZmV0Y2hPblNob3cnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblNvcnRDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBvcmRlckJ5ID0gJChlLnRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICAgICAgaWYodC5nZXRPcHRpb24oJ29yZGVyJykgPT09IG9yZGVyQnkpIHtcbiAgICAgICAgICAgICAgICBpZighdC5nZXRPcHRpb24oJ3NvcnQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0Lm9wdGlvbnMuc29ydCA9ICdhc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHQuZ2V0T3B0aW9uKCdzb3J0JykgPT09ICdhc2MnKSB7XG4gICAgICAgICAgICAgICAgICAgIHQub3B0aW9ucy5zb3J0ID0gJ2Rlc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdC5vcHRpb25zLm9yZGVyQnkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdC5vcHRpb25zLnNvcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0Lm9wdGlvbnMub3JkZXIgPSBvcmRlckJ5O1xuICAgICAgICAgICAgICAgIHQub3B0aW9ucy5zb3J0ID0gJ2FzYyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuJGVsLmZpbmQoJy5zb3J0JykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ3NvcnQtYXNjJykucmVtb3ZlQ2xhc3MoJ3NvcnQtZGVzYycpO1xuXG4gICAgICAgICAgICBpZih0LmdldE9wdGlvbignc29ydCcpKSB7XG4gICAgICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50KCkuYWRkQ2xhc3MoJ3NvcnQtJyt0LmdldE9wdGlvbignc29ydCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5mZXRjaCh0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93UGFnaW5hdGlvbjogZnVuY3Rpb24ocGFnZSwgdG90YWxQYWdlcykge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2luYXRpb25WaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guUGFnZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwYWdpbmF0aW9uVmlld09wdGlvbnMgPSB0aGlzLmdldE9wdGlvbigncGFnaW5hdGlvblZpZXdPcHRpb25zJyk7XG5cbiAgICAgICAgICAgIGlmKCFfLmlzT2JqZWN0KHBhZ2luYXRpb25WaWV3T3B0aW9ucykpIHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uVmlld09wdGlvbnMgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgICAgICAgICB0b3RhbFBhZ2VzOiB0b3RhbFBhZ2VzLFxuICAgICAgICAgICAgfSwgcGFnaW5hdGlvblZpZXdPcHRpb25zKSk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ3BhZ2luYXRlJywgZnVuY3Rpb24ocGFnZSwgdmlldykge1xuICAgICAgICAgICAgICAgIGlmKHBhZ2UgIT0gdC5nZXRPcHRpb24oJ3BhZ2UnKSkge1xuICAgICAgICAgICAgICAgICAgICB0Lm9wdGlvbnMucGFnZSA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgICAgIHQuZmV0Y2godHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBmb290ZXJWaWV3ID0gbmV3IFRvb2xib3guVGFibGVWaWV3Rm9vdGVyKHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldE9wdGlvbignY29sdW1ucycpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kZWwuZmluZCgndGZvb3QnKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbi5zaG93KGZvb3RlclZpZXcpO1xuXG4gICAgICAgICAgICBmb290ZXJWaWV3LmNvbnRlbnQuc2hvdyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lDaGlsZHJlbigpO1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95RW1wdHlWaWV3KCk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ3RhYmxlJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2xvYWRpbmdDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5tb2RlbCwgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS1hY3Rpdml0eS1pbmRpY2F0b3Itcm93JyksXG4gICAgICAgICAgICAgICAgdGFnTmFtZTogJ3RyJyxcbiAgICAgICAgICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgXy5leHRlbmQodGhpcy5vcHRpb25zLCB0LmdldE9wdGlvbignaW5kaWNhdG9yT3B0aW9ucycpKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuY29sdW1ucyA9IHQuZ2V0T3B0aW9uKCdjb2x1bW5zJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRoZSBhY3Rpdml0eSBpbmRpY2F0b3IgaW5zdGFuY2UgdG8gYmUgcmVtb3ZlZCBsYXRlclxuICAgICAgICAgICAgICAgICAgICB0Ll9hY3Rpdml0eUluZGljYXRvciA9IHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ3RhYmxlJykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2xvYWRpbmdDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX2FjdGl2aXR5SW5kaWNhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZFZpZXcodGhpcy5fYWN0aXZpdHlJbmRpY2F0b3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGl2aXR5SW5kaWNhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DaGlsZHZpZXdCZWZvcmVSZW5kZXI6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICBjaGlsZC5vcHRpb25zLmNvbHVtbnMgPSB0aGlzLmdldE9wdGlvbignY29sdW1ucycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJlcXVlc3REYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9uKCdyZXF1ZXN0RGF0YU9wdGlvbnMnKTtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9uKCdkZWZhdWx0UmVxdWVzdERhdGFPcHRpb25zJyk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdERhdGEgPSB0aGlzLmdldE9wdGlvbigncmVxdWVzdERhdGEnKTtcblxuICAgICAgICAgICAgaWYocmVxdWVzdERhdGEpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gcmVxdWVzdERhdGE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uZWFjaCgoW10pLmNvbmNhdChkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZighXy5pc051bGwodGhpcy5nZXRPcHRpb24obmFtZSkpICYmICFfLmlzVW5kZWZpbmVkKHRoaXMuZ2V0T3B0aW9uKG5hbWUpKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhW25hbWVdID0gdGhpcy5nZXRPcHRpb24obmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2g6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lFbXB0eVZpZXcoKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd0FjdGl2aXR5SW5kaWNhdG9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25GZXRjaFN1Y2Nlc3M6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgcGFnZSA9IHRoaXMuZ2V0Q3VycmVudFBhZ2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgdmFyIHRvdGFsUGFnZXMgPSB0aGlzLmdldExhc3RQYWdlKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgaWYoY29sbGVjdGlvbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dFbXB0eVZpZXcoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBhZ2UgPSBwYWdlO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRvdGFsUGFnZXMgPSB0b3RhbFBhZ2VzO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbigncGFnaW5hdGUnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BhZ2luYXRpb24ocGFnZSwgdG90YWxQYWdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25GZXRjaENvbXBsZXRlOiBmdW5jdGlvbihzdGF0dXMsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEN1cnJlbnRQYWdlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmN1cnJlbnRfcGFnZSB8fCByZXNwb25zZS5jdXJyZW50UGFnZTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMYXN0UGFnZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5sYXN0X3BhZ2UgfHwgcmVzcG9uc2UubGFzdFBhZ2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmV0Y2g6IGZ1bmN0aW9uKHJlc2V0KSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKHJlc2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnJlc2V0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5nZXRSZXF1ZXN0RGF0YSgpLFxuICAgICAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKHhocikge1xuICAgICAgICAgICAgICAgICAgICBpZih0LmdldE9wdGlvbigncmVxdWVzdEhlYWRlcnMnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5lYWNoKHQuZ2V0T3B0aW9uKCdyZXF1ZXN0SGVhZGVycycpLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOmNvbXBsZXRlJywgdHJ1ZSwgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOnN1Y2Nlc3MnLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIGZhbHNlLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6ZXJyb3InLCBjb2xsZWN0aW9uLCByZXNwb25zZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdmZXRjaCcpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UYWJDb250ZW50ID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFiLWNvbnRlbnQnKSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRuYW1lOiBmYWxzZSxcblxuXHRcdFx0aWQ6IGZhbHNlLFxuXG5cdFx0XHRjb250ZW50OiBmYWxzZVxuXHRcdH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cdFRvb2xib3guVGFicyA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYnMnKSxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIFtkYXRhLXRvZ2dsZT1cInRhYlwiXSc6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCd0YWI6Y2xpY2snLCAkKGUudGFyZ2V0KS5hdHRyKCdocmVmJykpO1xuXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdGNvbnRlbnRWaWV3OiBUb29sYm94LlRhYkNvbnRlbnQsXG5cblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cbiAgICAgICAgICAgIHRhYkNsYXNzTmFtZTogJ25hdiBuYXYtdGFicycsXG5cblx0XHRcdHRhYlBhbmVDbGFzc05hbWU6ICd0YWItcGFuZScsXG5cblx0XHRcdGNvbnRlbnQ6IFtdXG5cdFx0fSxcblxuXHRcdHRhYlZpZXdzOiBbXSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZpZXdOYW1lOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICByZXR1cm4gdmlldy5nZXRPcHRpb24oJ3RhYk5hbWUnKSA/IHZpZXcuZ2V0T3B0aW9uKCd0YWJOYW1lJykgOiAoXG4gICAgICAgICAgICAgICAgdmlldy5nZXRPcHRpb24oJ25hbWUnKSA/IHZpZXcuZ2V0T3B0aW9uKCduYW1lJykgOiBudWxsXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZpZXdMYWJlbDogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcuZ2V0T3B0aW9uKCd0YWJMYWJlbCcpID8gdmlldy5nZXRPcHRpb24oJ3RhYkxhYmVsJykgOiAoXG4gICAgICAgICAgICAgICAgdmlldy5nZXRPcHRpb24oJ2xhYmVsJykgPyB2aWV3LmdldE9wdGlvbignbGFiZWwnKSA6IG51bGxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlVGFiOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0Vmlld05hbWUodmlldyk7XG5cbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcubmF2LXRhYnMnKS5maW5kKCdbaHJlZj1cIiMnK25hbWUrJ1wiXScpLnBhcmVudCgpLnJlbW92ZSgpO1xuXG4gICAgICAgIFx0dGhpcy5yZWdpb25NYW5hZ2VyLnJlbW92ZVJlZ2lvbihuYW1lKTtcblxuICAgICAgICBcdHRoaXMuJGVsLmZpbmQoJyMnK25hbWUpLnJlbW92ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZFRhYjogZnVuY3Rpb24odmlldywgc2V0QWN0aXZlKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0Vmlld05hbWUodmlldyk7XG4gICAgICAgIFx0dmFyIHRhYiA9ICc8bGkgcm9sZT1cInByZXNlbnRhdGlvblwiPjxhIGhyZWY9XCIjJytuYW1lKydcIiBhcmlhLWNvbnRyb2xzPVwiJytuYW1lKydcIiByb2xlPVwidGFiXCIgZGF0YS10b2dnbGU9XCJ0YWJcIj4nK3RoaXMuZ2V0Vmlld0xhYmVsKHZpZXcpKyc8L2E+PC9saT4nO1xuXG4gICAgICAgIFx0dmFyIGh0bWwgPSAnPGRpdiByb2xlPVwidGFicGFuZWxcIiBjbGFzcz1cIicrdGhpcy5nZXRPcHRpb24oJ3RhYlBhbmVDbGFzc05hbWUnKSsnXCIgaWQ9XCInK25hbWUrJ1wiIC8+JztcblxuICAgICAgICBcdHRoaXMuJGVsLmZpbmQoJy5uYXYtdGFicycpLmFwcGVuZCh0YWIpO1xuICAgICAgICBcdHRoaXMuJGVsLmZpbmQoJy50YWItY29udGVudCcpLmFwcGVuZChodG1sKTtcblx0XHRcdHRoaXMucmVnaW9uTWFuYWdlci5hZGRSZWdpb24obmFtZSwgJyMnK25hbWUpO1xuXHRcdFx0dGhpc1tuYW1lXS5zaG93KHZpZXcpO1xuXG5cdFx0XHRpZihzZXRBY3RpdmUpIHtcblx0XHRcdFx0dGhpcy5zZXRBY3RpdmVUYWIodmlldyk7XG5cdFx0XHR9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TaG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRfLmVhY2godGhpcy5nZXRPcHRpb24oJ2NvbnRlbnQnKSwgZnVuY3Rpb24ob2JqLCBpKSB7XG4gICAgICAgIFx0XHRpZihvYmouY2lkKSB7XG4gICAgICAgIFx0XHRcdHRoaXMuYWRkVGFiKG9iaik7XG4gICAgICAgIFx0XHR9XG4gICAgICAgIFx0XHRlbHNlIHtcbiAgICAgICAgXHRcdFx0dmFyIGNvbnRlbnRWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2NvbnRlbnRWaWV3Jyk7XG5cblx0XHRcdFx0XHRpZihfLmlzT2JqZWN0KG9iai52aWV3KSkge1xuXHRcdFx0XHRcdFx0Y29udGVudFZpZXcgPSBvYmoudmlldztcblxuXHRcdFx0XHRcdFx0ZGVsZXRlIG9iai52aWV3O1xuXHRcdFx0XHRcdH1cblxuXHQgICAgICAgIFx0XHR0aGlzLmFkZFRhYihuZXcgY29udGVudFZpZXcob2JqKSk7XG4gICAgICAgIFx0XHR9XG4gICAgICAgIFx0fSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlVGFiOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBcdGlmKF8uaXNPYmplY3QoaWQpKSB7XG4gICAgICAgIFx0XHRpZCA9IGlkLmdldE9wdGlvbignbmFtZScpO1xuICAgICAgICBcdH1cblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdbaHJlZj1cIicraWQrJ1wiXScpXG4gICAgICAgICAgICAgICAgLnBhcmVudCgpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoaWQpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2V0OmFjdGl2ZTp0YWInLCBpZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGVudFZpZXc6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIFx0aWYodGhpc1tpZF0gJiYgdGhpc1tpZF0uY3VycmVudFZpZXcpIHtcbiAgICAgICAgXHRcdHJldHVybiB0aGlzW2lkXS5jdXJyZW50VmlldztcbiAgICAgICAgXHR9XG5cbiAgICAgICAgXHRyZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcdGlmKCF0aGlzLmdldE9wdGlvbignYWN0aXZlVGFiJykpIHtcblx0ICAgICAgICBcdHRoaXMuJGVsLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXTpmaXJzdCcpLmNsaWNrKCk7XG5cdCAgICAgICAgfVxuXHQgICAgICAgIGVsc2Uge1xuXHQgICAgICAgIFx0dGhpcy5zZXRBY3RpdmVUYWIodGhpcy5nZXRPcHRpb24oJ2FjdGl2ZVRhYicpKTtcblx0ICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25UYWJDbGljazogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgXHR0aGlzLnNldEFjdGl2ZVRhYihpZCk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UZXh0QXJlYUZpZWxkID0gVG9vbGJveC5CYXNlRmllbGQuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS10ZXh0YXJlYS1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RvcjogJ3RleHRhcmVhJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ3RleHRhcmVhJyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LldpemFyZCA9IFRvb2xib3guVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGNsYXNzTmFtZTogJ3dpemFyZCcsXG5cbiAgICAgICAgY2hhbm5lbE5hbWU6ICd0b29sYm94LndpemFyZCcsXG5cbiAgICBcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd3aXphcmQnKSxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBwcm9ncmVzczogJy53aXphcmQtcHJvZ3Jlc3MnLFxuICAgICAgICAgICAgY29udGVudDogJy53aXphcmQtY29udGVudCcsXG4gICAgICAgICAgICBidXR0b25zOiAnLndpemFyZC1idXR0b25zJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2tleXVwJzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc3VibWl0Rm9ybU9uRW50ZXInKSAmJiBldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdmb3JtJykuc3VibWl0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaGVhZGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBoZWFkZXJUYWdOYW1lOiAnaDInLFxuICAgICAgICAgICAgICAgIGhlYWRlckNsYXNzTmFtZTogJ3dpemFyZC1oZWFkZXInLFxuICAgICAgICAgICAgICAgIGZpbmlzaGVkQ2xhc3NOYW1lOiAnd2l6YXJkLWZpbmlzaGVkJyxcbiAgICAgICAgICAgICAgICBmaXhlZEhlaWdodENsYXNzTmFtZTogJ2ZpeGVkLWhlaWdodCcsXG4gICAgICAgICAgICAgICAgaGFzUGFuZWxDbGFzc05hbWU6ICd3aXphcmQtcGFuZWwnLFxuICAgICAgICAgICAgICAgIHBhbmVsQ2xhc3NOYW1lOiAncGFuZWwgcGFuZWwtZGVmYXVsdCcsXG4gICAgICAgICAgICAgICAgYnV0dG9uVmlldzogVG9vbGJveC5XaXphcmRCdXR0b25zLFxuICAgICAgICAgICAgICAgIGJ1dHRvblZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1ZpZXc6IFRvb2xib3guV2l6YXJkUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NWaWV3T3B0aW9uczoge30sXG4gICAgICAgICAgICAgICAgaGlnaGVzdFN0ZXA6IDEsXG4gICAgICAgICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICAgICAgICBzdGVwczogW10sXG4gICAgICAgICAgICAgICAgZmluaXNoZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NWaWV3OiBUb29sYm94LldpemFyZFN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc1ZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBlcnJvclZpZXc6IFRvb2xib3guV2l6YXJkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JWaWV3T3B0aW9uczoge30sXG4gICAgICAgICAgICAgICAgc2hvd0J1dHRvbnM6IHRydWUsXG4gICAgICAgICAgICAgICAgcGFuZWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRIZWlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHN1Ym1pdEZvcm1PbkVudGVyOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgdGVtcGxhdGVDb250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkxheW91dFZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFubmVsLnJlcGx5KCdjb21wbGV0ZTpzdGVwJywgZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MuY3VycmVudFZpZXcuc2V0Q29tcGxldGUoc3RlcCB8fCB0aGlzLmdldE9wdGlvbignc3RlcCcpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVwbHkoJ3NldDpzdGVwJywgZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RlcChzdGVwKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVwbHkoJ3dpemFyZDplcnJvcicsIGZ1bmN0aW9uKG9wdGlvbnMsIGVycm9yVmlldykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5nZXRPcHRpb24oJ2Vycm9yVmlld09wdGlvbnMnKSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgICAgICB3aXphcmQ6IHRoaXNcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5lbXB0eSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoZXJyb3JWaWV3IHx8IHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXcnKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFubmVsLnJlcGx5KCd3aXphcmQ6c3VjY2VzcycsIGZ1bmN0aW9uKG9wdGlvbnMsIHN1Y2Nlc3NWaWV3KSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbignc3VjY2Vzc1ZpZXdPcHRpb25zJyksIG9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgICAgd2l6YXJkOiB0aGlzXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbnMuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dWaWV3KHN1Y2Nlc3NWaWV3IHx8IHRoaXMuZ2V0T3B0aW9uKCdzdWNjZXNzVmlldycpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlc2V0UmVnaW9uczogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgaWYodmlldy5yZWdpb25zICYmIHZpZXcucmVnaW9uTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIHZpZXcucmVnaW9uTWFuYWdlci5lbXB0eVJlZ2lvbnMoKTtcbiAgICAgICAgICAgICAgICB2aWV3LnJlZ2lvbk1hbmFnZXIuYWRkUmVnaW9ucyh2aWV3LnJlZ2lvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldENvbnRlbnRIZWlnaHQ6IGZ1bmN0aW9uKGhlaWdodCkge1xuICAgICAgICAgICAgaGVpZ2h0IHx8IChoZWlnaHQgPSA0MDApO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcud2l6YXJkLWNvbnRlbnQnKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZml4ZWRIZWlnaHRDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAuY3NzKCdoZWlnaHQnLCBoZWlnaHQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGVwID0gcGFyc2VJbnQoc3RlcCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5zdGVwIDwgMSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGVwID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSA+IHRoaXMuZ2V0T3B0aW9uKCdoaWdoZXN0U3RlcCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmhpZ2hlc3RTdGVwID0gdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzLmN1cnJlbnRWaWV3LnJlbmRlcigpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmJ1dHRvbnMuY3VycmVudFZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbnMuY3VycmVudFZpZXcucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHZpZXcgPSB0aGlzLmdldFN0ZXAoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NvbnRlbnQodmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1ZpZXc6IGZ1bmN0aW9uKFZpZXcsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDb250ZW50KG5ldyBWaWV3KG9wdGlvbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKG9wdGlvbnMsIHJlZ2lvbikge1xuICAgICAgICAgICAgcmVnaW9uIHx8IChyZWdpb24gPSB0aGlzLmNvbnRlbnQpO1xuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdtZWRpdW0nLFxuICAgICAgICAgICAgICAgIG1pbkhlaWdodDogJzQwMHB4J1xuICAgICAgICAgICAgfSwgb3B0aW9ucykpO1xuXG4gICAgICAgICAgICByZWdpb24uc2hvdyh2aWV3LCB7XG4gICAgICAgICAgICAgICAgcHJldmVudERlc3Ryb3k6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dQcm9ncmVzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdwcm9ncmVzc1ZpZXcnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe30sIHRoaXMuZ2V0T3B0aW9uKCdwcm9ncmVzc1ZpZXdPcHRpb25zJyksIHtcbiAgICAgICAgICAgICAgICAgICAgd2l6YXJkOiB0aGlzXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcy5zaG93KHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgYnV0dG9uIHZpZXcgaXMgbm90IGEgdmFsaWQgY2xhc3MuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0J1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignYnV0dG9uVmlldycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7fSwgdGhpcy5nZXRPcHRpb24oJ2J1dHRvblZpZXdPcHRpb25zJyksIHtcbiAgICAgICAgICAgICAgICAgICAgd2l6YXJkOiB0aGlzXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b25zLnNob3codmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBidXR0b24gdmlldyBpcyBub3QgYSB2YWxpZCBjbGFzcy4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q29udGVudDogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgaWYodmlldykge1xuICAgICAgICAgICAgICAgIHZpZXcub3B0aW9ucy53aXphcmQgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50LnNob3codmlldywge1xuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVzdHJveTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbmNlKCdhdHRhY2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFJlZ2lvbnModmlldyk7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcudHJpZ2dlck1ldGhvZCgnd2l6YXJkOmF0dGFjaCcpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgdmlldy50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6c2hvdzpzdGVwJywgdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93OnN0ZXAnLCB0aGlzLmdldE9wdGlvbignc3RlcCcpLCB2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0ZXBzJylbKHN0ZXAgfHwgdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSkgLSAxXTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRUb3RhbFN0ZXBzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVxdWVzdCgnY29tcGxldGU6c3RlcCcpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RlcCh0aGlzLmdldE9wdGlvbignc3RlcCcpIC0gMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluaXNoOiBmdW5jdGlvbihzdWNjZXNzLCBvcHRpb25zLCBWaWV3KSB7XG4gICAgICAgICAgICBzdWNjZXNzID0gKF8uaXNVbmRlZmluZWQoc3VjY2VzcykgfHwgc3VjY2VzcykgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgIGlmKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdmaW5pc2hlZENsYXNzTmFtZScpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVxdWVzdCgnY29tcGxldGU6c3RlcCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RlcCh0aGlzLmdldFRvdGFsU3RlcHMoKSArIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXF1ZXN0KCd3aXphcmQ6c3VjY2VzcycsIG9wdGlvbnMsIFZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsLnJlcXVlc3QoJ3dpemFyZDplcnJvcicsIG9wdGlvbnMsIFZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignY29udGVudEhlaWdodCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDb250ZW50SGVpZ2h0KHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50SGVpZ2h0JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd1Byb2dyZXNzJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQcm9ncmVzcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd0J1dHRvbnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0J1dHRvbnMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3BhbmVsJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignaGFzUGFuZWxDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RlcCh0aGlzLmdldE9wdGlvbignc3RlcCcpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbnMuY3VycmVudFZpZXcuZGlzYWJsZUJ1dHRvbnMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlTmV4dEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbnMuY3VycmVudFZpZXcuZGlzYWJsZU5leHRCdXR0b24oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlQmFja0J1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbnMuY3VycmVudFZpZXcuZGlzYWJsZUJhY2tCdXR0b24oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlRmluaXNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldy5kaXNhYmxlRmluaXNoQnV0dG9uKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbnMuY3VycmVudFZpZXcuZW5hYmxlQnV0dG9ucygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZU5leHRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5idXR0b25zLmN1cnJlbnRWaWV3LmVuYWJsZU5leHRCdXR0b24oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVCYWNrQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldy5lbmFibGVCYWNrQnV0dG9uKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlRmluaXNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldy5lbmFibGVGaW5pc2hCdXR0b24oKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oJCwgXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmRCdXR0b25zID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3dpemFyZC1idXR0b25zJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLWJ1dHRvbnMtd3JhcHBlciBjbGVhcmZpeCcsXG5cbiAgICAgICAgY2hhbm5lbE5hbWU6ICd0b29sYm94LndpemFyZCcsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN0ZXA6IGZhbHNlLFxuICAgICAgICAgICAgdG90YWxTdGVwczogZmFsc2UsXG4gICAgICAgICAgICB3aXphcmQ6IGZhbHNlLFxuICAgICAgICAgICAgYnV0dG9uU2l6ZUNsYXNzTmFtZTogJ2J0bi1tZCcsXG4gICAgICAgICAgICBkZWZhdWx0QnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcbiAgICAgICAgICAgIHByaW1hcnlCdXR0b25DbGFzc05hbWU6ICdidG4gYnRuLXByaW1hcnknLFxuICAgICAgICAgICAgZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICBsZWZ0QnV0dG9uczogW3tcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtbG9uZy1hcnJvdy1sZWZ0JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0JhY2snLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5nZXRDdXJyZW50U3RlcCgpID09IDEgPyAnZGlzYWJsZWQgJyA6ICcnXG4gICAgICAgICAgICAgICAgICAgICkgKyB0aGlzLnBhcmVudC5nZXREZWZhdWx0QnV0dG9uQ2xhc3NlcygnYmFjaycpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmJhY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHJpZ2h0QnV0dG9uczogW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0ZpbmlzaCcsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5wYXJlbnQuZ2V0Q3VycmVudFN0ZXAoKSAhPSB0aGlzLnBhcmVudC5nZXRUb3RhbFN0ZXBzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnaGlkZSc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuZ2V0UHJpbWFyeUJ1dHRvbkNsYXNzZXMoJ2ZpbmlzaCcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmZpbmlzaCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGljb246ICdmYSBmYS1sb25nLWFycm93LXJpZ2h0JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ05leHQnLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMucGFyZW50LmdldEN1cnJlbnRTdGVwKCkgPT0gdGhpcy5wYXJlbnQuZ2V0VG90YWxTdGVwcygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2hpZGUnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldERlZmF1bHRCdXR0b25DbGFzc2VzKCduZXh0Jyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2s6bmV4dCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLndpemFyZC1sZWZ0LWJ1dHRvbnMgYnV0dG9uJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciAkYnV0dG9uID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICRidXR0b24uaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKCRidXR0b24uaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggdGhpcy5nZXRPcHRpb24oJ2xlZnRCdXR0b25zJylbaW5kZXhdICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdsZWZ0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdsZWZ0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdjbGljayAud2l6YXJkLXJpZ2h0LWJ1dHRvbnMgYnV0dG9uJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciAkYnV0dG9uID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICRidXR0b24uaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKCRidXR0b24uaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggdGhpcy5nZXRPcHRpb24oJ3JpZ2h0QnV0dG9ucycpW2luZGV4XSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbigncmlnaHRCdXR0b25zJylbaW5kZXhdLm9uQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3JpZ2h0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLm9wdGlvbnMucmlnaHRCdXR0b25zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLm9wdGlvbnMubGVmdEJ1dHRvbnMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpdGVtLnBhcmVudCA9IHRoaXM7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVSaWdodEJ1dHRvbjogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIGlmKF8uaXNPYmplY3QoaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKHRoaXMub3B0aW9ucy5yaWdodEJ1dHRvbnMsIGZ1bmN0aW9uKGJ1dHRvbiwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZihidXR0b24gPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUmlnaHRCdXR0b24oaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yaWdodEJ1dHRvbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFkZFJpZ2h0QnV0dG9uOiBmdW5jdGlvbihidXR0b24sIGF0KSB7XG5cdFx0XHR2YXIgYnV0dG9ucyA9IF8uY2xvbmUodGhpcy5vcHRpb25zLnJpZ2h0QnV0dG9ucyk7XG5cbiAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQoYXQpKSB7XG4gICAgICAgICAgICAgICAgYXQgPSBidXR0b25zLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnV0dG9uLnBhcmVudCA9IHRoaXM7XG4gICAgICAgICAgICBidXR0b25zLnNwbGljZShhdCwgMCwgYnV0dG9uKTtcblxuXHRcdFx0dGhpcy5vcHRpb25zLnJpZ2h0QnV0dG9ucyA9IGJ1dHRvbnM7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUxlZnRCdXR0b246IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZihfLmlzT2JqZWN0KGluZGV4KSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0aGlzLm9wdGlvbnMubGVmdEJ1dHRvbnMsIGZ1bmN0aW9uKGJ1dHRvbiwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZihidXR0b24gPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTGVmdEJ1dHRvbihpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKF8uaXNOdW1iZXIoaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmxlZnRCdXR0b25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhZGRMZWZ0QnV0dG9uOiBmdW5jdGlvbihidXR0b24sIGF0KSB7XG5cdFx0XHR2YXIgYnV0dG9ucyA9IF8uY2xvbmUodGhpcy5vcHRpb25zLmxlZnRCdXR0b25zKTtcblxuICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZChhdCkpIHtcbiAgICAgICAgICAgICAgICBhdCA9IGJ1dHRvbnMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBidXR0b24ucGFyZW50ID0gdGhpcztcbiAgICAgICAgICAgIGJ1dHRvbnMuc3BsaWNlKGF0LCAwLCBidXR0b24pO1xuXG5cdFx0XHR0aGlzLm9wdGlvbnMubGVmdEJ1dHRvbnMgPSBidXR0b25zO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlQnV0dG9uOiBmdW5jdGlvbihidXR0b24pIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy4nK2J1dHRvbikuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN0ZXBzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignc3RlcHMnKSA/IHRoaXMuZ2V0T3B0aW9uKCdzdGVwcycpIDogKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKSA/IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXBzJykgOiBbXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXJyZW50U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSA/IHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgOiAoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpID8gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcCcpIDogMVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRUb3RhbFN0ZXBzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndG90YWxTdGVwcycpID8gdGhpcy5nZXRPcHRpb24oJ3RvdGFsU3RlcHMnKSA6IChcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykgPyB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdzdGVwcycpLmxlbmd0aCA6IDFcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0ZXAgPSB0aGlzLmdldEN1cnJlbnRTdGVwKCk7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSB0aGlzLmdldFRvdGFsU3RlcHMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc0ZpcnN0U3RlcDogc3RlcCA9PSAxLFxuICAgICAgICAgICAgICAgIGlzTGFzdFN0ZXA6IHN0ZXAgPT0gdG90YWwsXG4gICAgICAgICAgICAgICAgdG90YWxTdGVwczogdG90YWxcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5vcHRpb25zKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrQmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IHRoaXMuZ2V0Q3VycmVudFN0ZXAoKTtcbiAgICAgICAgICAgIHZhciBzdGVwcyA9IHRoaXMuZ2V0U3RlcHMoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoKS50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6Y2xpY2s6YmFjaycsIHN0ZXBzW3N0ZXAgLSAxXSk7XG5cbiAgICAgICAgICAgICAgICBpZihfLmlzVW5kZWZpbmVkKHJlc3BvbnNlKSB8fCByZXNwb25zZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGVwLS07XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrTmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IHRoaXMuZ2V0Q3VycmVudFN0ZXAoKTtcbiAgICAgICAgICAgIHZhciBzdGVwcyA9IHRoaXMuZ2V0U3RlcHMoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoKS50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6Y2xpY2s6bmV4dCcsIHN0ZXBzW3N0ZXAgKyAxXSk7XG5cbiAgICAgICAgICAgICAgICBpZihfLmlzVW5kZWZpbmVkKHJlc3BvbnNlKSB8fCByZXNwb25zZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGVwKys7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrRmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGVwID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBzdGVwLnRyaWdnZXJNZXRob2QoJ3dpemFyZDpjbGljazpmaW5pc2gnLCBzdGVwKTtcblxuICAgICAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQocmVzcG9uc2UpIHx8IHJlc3BvbnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5maW5pc2goKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcCA9IHRoaXMuZ2V0VG90YWxTdGVwcygpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGVmYXVsdEJ1dHRvbkNsYXNzZXM6IGZ1bmN0aW9uKGFwcGVuZCkge1xuICAgICAgICAgICAgcmV0dXJuIChhcHBlbmQgPyBhcHBlbmQgOiAnJykgKyAnICcgKyB0aGlzLmdldE9wdGlvbignZGVmYXVsdEJ1dHRvbkNsYXNzTmFtZScpICsgJyAnICsgdGhpcy5nZXRPcHRpb24oJ2J1dHRvblNpemVDbGFzc05hbWUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRQcmltYXJ5QnV0dG9uQ2xhc3NlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3ByaW1hcnlCdXR0b25DbGFzc05hbWUnKSArICcgJyArIHRoaXMuZ2V0T3B0aW9uKCdidXR0b25TaXplQ2xhc3NOYW1lJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUJ1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnYnV0dG9uJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVOZXh0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5uZXh0JykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVCYWNrQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5iYWNrJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVGaW5pc2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmZpbmlzaCcpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2J1dHRvbicpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVOZXh0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5uZXh0JykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUJhY2tCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmJhY2snKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlRmluaXNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5maW5pc2gnKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LldpemFyZEVycm9yID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLWVycm9yJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLWVycm9yJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMycsXG4gICAgICAgICAgICBoZWFkZXI6ICdFcnJvciEnLFxuICAgICAgICAgICAgZXJyb3JJY29uOiAnZmEgZmEtdGltZXMnLFxuICAgICAgICAgICAgbWVzc2FnZTogZmFsc2UsXG4gICAgICAgICAgICBzaG93QmFja0J1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJhY2tCdXR0b25DbGFzc05hbWU6ICdidG4gYnRuLWxnIGJ0bi1wcmltYXJ5JyxcbiAgICAgICAgICAgIGJhY2tCdXR0b25MYWJlbDogJ0dvIEJhY2snLFxuICAgICAgICAgICAgYmFja0J1dHRvbkljb246ICdmYSBmYS1sb25nLWFycm93LWxlZnQnLFxuICAgICAgICAgICAgb25DbGlja0JhY2s6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayBidXR0b24nOiAnY2xpY2s6YmFjaydcbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tCYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCB0aGlzLmdldE9wdGlvbignb25DbGlja0JhY2snKSAmJiBfLmlzRnVuY3Rpb24odGhpcy5nZXRPcHRpb24oJ29uQ2xpY2tCYWNrJykpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ29uQ2xpY2tCYWNrJykuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5zaG93QnV0dG9ucygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKSAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbigkLCBfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guV2l6YXJkUHJvZ3Jlc3MgPSBUb29sYm94LlZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd3aXphcmQtcHJvZ3Jlc3MnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQtcHJvZ3Jlc3Mtd3JhcHBlcicsXG5cbiAgICAgICAgY2hhbm5lbE5hbWU6ICd0b29sYm94LndpemFyZCcsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHdpemFyZDogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG4gICAgICAgICAgICBjb21wbGV0ZUNsYXNzTmFtZTogJ2NvbXBsZXRlJyxcbiAgICAgICAgICAgIGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLndpemFyZC1zdGVwJzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHN0ZXAgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBzdGVwID0gJHN0ZXAuZGF0YSgnc3RlcCcpO1xuXG4gICAgICAgICAgICAgICAgaWYoICEkc3RlcC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ2ZpbmlzaGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsLnJlcXVlc3QoJ3NldDpzdGVwJywgc3RlcCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgIHRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKSwgZnVuY3Rpb24oc3RlcCwgaSkge1xuICAgICAgICAgICAgICAgIHN0ZXAub3B0aW9ucy5sYWJlbCA9IHN0ZXAuZ2V0T3B0aW9uKCdsYWJlbCcpIHx8IHN0ZXAubGFiZWw7XG4gICAgICAgICAgICAgICAgc3RlcC5vcHRpb25zLnRpdGxlID0gc3RlcC5nZXRPcHRpb24oJ3RpdGxlJykgfHwgc3RlcC50aXRsZTtcbiAgICAgICAgICAgICAgICBzdGVwLm9wdGlvbnMuc3RlcCA9IGkgKyAxO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB0aGlzLmdldE9wdGlvbignd2l6YXJkJykub3B0aW9ucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RGlzYWJsZWQ6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcDpsdCgnK3N0ZXArJyknKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q29tcGxldGU6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoc3RlcCk7XG5cbiAgICAgICAgICAgIHZpZXcub3B0aW9ucy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcDpsdCgnKyhzdGVwIC0gMSkrJyknKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignY29tcGxldGVDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcud2l6YXJkLXN0ZXA6bnRoLWNoaWxkKCcrc3RlcCsnKScpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFdpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcCcpLmNzcygnd2lkdGgnLCAoMTAwIC8gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGgpICsgJyUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRXaWR0aCgpO1xuICAgICAgICAgICAgdGhpcy5zZXREaXNhYmxlZCh0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdoaWdoZXN0U3RlcCcpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmRTdWNjZXNzID0gVG9vbGJveC5WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLXN1Y2Nlc3MnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQtc3VjY2VzcycsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMycsXG4gICAgICAgICAgICBoZWFkZXI6ICdTdWNjZXNzIScsXG4gICAgICAgICAgICBzdWNjZXNzSWNvbjogJ2ZhIGZhLWNoZWNrJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICB0ZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiJdfQ==
