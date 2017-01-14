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

    Toolbox.VERSION = '0.7.28';

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
        return _.extend({}, Marionette._getValue(defaultOptions, context), Marionette._getValue(options, context));
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

    Toolbox.Dropzones = function(event, element, callbacks, context) {
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

        var $elm = $(element);

        if(event.pageY < top + heightThreshold) {
            callbacks.before ? callbacks.before.call(context, $elm) : null;
        }
        else if(event.pageY > bottom - heightThreshold || event.pageX < left + widthThreshold) {
            callbacks.after ? callbacks.after.call(context, $elm) : null;
        }
        else {
            callbacks.children ? callbacks.children.call(context, $elm) : null;
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

(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['activity-indicator'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "dimmed";
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "min-height:"
    + escapeExpression(((stack1 = (depth1 && depth1.minHeight)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ";";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "position:"
    + escapeExpression(((stack1 = (depth1 && depth1.position)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ";";
  return buffer;
  }

function program7(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "background-color: "
    + escapeExpression(((stack1 = (depth1 && depth1.dimmedBgColor)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ";";
  return buffer;
  }

function program9(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<span class=\"activity-indicator-label\" style=\"";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.labelFontSize), {hash:{},inverse:self.noop,fn:self.programWithDepth(10, program10, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span>";
  return buffer;
  }
function program10(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "font-size:"
    + escapeExpression(((stack1 = (depth2 && depth2.labelFontSize)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  return buffer;
  }

  buffer += "<div class=\"activity-indicator-dimmer ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.dimmed), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" style=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.minHeight), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.position), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.dimmedBgColor), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n\n	<span class=\"activity-indicator\">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n\n</div>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['form-error'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n    <span>"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</span>";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.newline), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "<br>";
  }

  stack1 = helpers.each.call(depth0, (depth0 && depth0.errors), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['button-dropdown-menu'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "dropup";
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n		<button type=\"button\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.buttonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.buttonLabel)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</button>\n		<button type=\"button\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.buttonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = (depth1 && depth1.dropdownMenuToggleClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n			<span class=\"caret\"></span>\n			<span class=\"sr-only\">Toggle Dropdown</span>\n		</button>\n	";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n		<button type=\"button\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.buttonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = (depth1 && depth1.dropdownMenuToggleClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n			"
    + escapeExpression(((stack1 = (depth1 && depth1.buttonLabel)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n			<span class=\"caret\"></span>\n			<span class=\"sr-only\">Toggle Dropdown</span>\n		</button>\n	";
  return buffer;
  }

function program7(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.dropdownMenuClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  buffer += "<div class=\"btn-group ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.dropUp), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.splitButton), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n	";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.splitButton), options) : helperMissing.call(depth0, "not", (depth0 && depth0.splitButton), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n	<ul class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.dropdownMenuClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></ul>\n\n</div>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['breadcrumb'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "<a href=\"";
  if (helper = helpers.href) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.href); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "</a>";
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.href), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.href), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['no-breadcrumbs'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['calendar-monthly-day-view'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "\n	<span class=\"calendar-has-events\"><i class=\"fa fa-circle\"></i></span>\n";
  }

  buffer += "<span class=\"calendar-date\">";
  if (helper = helpers.day) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.day); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span>\n\n";
  stack1 = (helper = helpers.is || (depth0 && depth0.is),options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.events)),stack1 == null || stack1 === false ? stack1 : stack1.length), ">", "0", options) : helperMissing.call(depth0, "is", ((stack1 = (depth0 && depth0.events)),stack1 == null || stack1 === false ? stack1 : stack1.length), ">", "0", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['calendar-monthly-view'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"calendar-masthead\">\n	<nav class=\"calendar-navigation\">\n		<a href=\"#\" class=\"calendar-navigation-prev\"><i class=\"fa fa-angle-left\"></i></a>\n		<a href=\"#\" class=\"calendar-navigation-next\"><i class=\"fa fa-angle-right\"></i></a>\n	</nav>\n\n	<div class=\"calendar-header\"></div>\n	<div class=\"calendar-sub-header\"></div>\n</div>\n\n<div class=\"calendar-view\">\n	<div class=\"indicator\"></div>\n\n	<table class=\"calendar-monthly-view\">\n		<thead>\n			<tr>\n				<th>Sun</th>\n				<th>Mon</th>\n				<th>Tue</th>\n				<th>Wed</th>\n				<th>Thur</th>\n				<th>Fri</th>\n				<th>Sat</th>\n			</tr>\n		</thead>\n		<tbody></tbody>\n	</table>\n</div>";
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['form-checkbox-field'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<p ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.descriptionClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n";
  return buffer;
  }
function program4(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.descriptionClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program6(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<div class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.inputClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n		<label ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.labelClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "><input type=\""
    + escapeExpression(((stack1 = (depth1 && depth1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" name=\""
    + escapeExpression(((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" value=\""
    + escapeExpression(((stack1 = (depth1 && depth1.value)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></label>\n	</div>\n";
  return buffer;
  }
function program7(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.labelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program9(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	";
  stack1 = ((stack1 = ((stack1 = (depth1 && depth1.options)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1)),blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(10, program10, data, depth1),data:data}));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program10(depth0,data,depth2) {
  
  var buffer = "", stack1, helper;
  buffer += "\n	<div class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.inputClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n		<label ";
  stack1 = helpers['if'].call(depth0, (depth2 && depth2.labelClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth2),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "><input type=\""
    + escapeExpression(((stack1 = (depth2 && depth2.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" name=\""
    + escapeExpression(((stack1 = (depth2 && depth2.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "[]\" value=\"";
  if (helper = helpers.value) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.value); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"> ";
  if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</label>\n	</div>\n	";
  return buffer;
  }
function program11(depth0,data,depth3) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth3 && depth3.labelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.description), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.options), options) : helperMissing.call(depth0, "not", (depth0 && depth0.options), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.options), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['button-group-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<i class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.icon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i> ";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.icon), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['no-button-group-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['dropdown-menu-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<a href=\""
    + escapeExpression(((stack1 = (depth1 && depth1.href)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.icon), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.value), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.label), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</a>\n";
  return buffer;
  }
function program2(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "<i class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.icon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i> ";
  return buffer;
  }

function program4(depth0,data,depth2) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth2 && depth2.value)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program6(depth0,data,depth2) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth2 && depth2.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.divider), options) : helperMissing.call(depth0, "not", (depth0 && depth0.divider), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['dropdown-menu-no-items'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['dropdown-menu'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.dropdownMenuClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  buffer += "<a href=\"#\" class=\"";
  if (helper = helpers.dropdownMenuToggleClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.dropdownMenuToggleClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">";
  if (helper = helpers.toggleLabel) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.toggleLabel); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " <i class=\"";
  if (helper = helpers.dropdownMenuToggleIconClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.dropdownMenuToggleIconClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></i></a>\n\n<ul class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.dropdownMenuClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></ul>";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['form-light-switch-field'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<label for=\""
    + escapeExpression(((stack1 = (depth1 && depth1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.labelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</label>\n";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<p ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.descriptionClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n";
  return buffer;
  }
function program6(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.descriptionClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program8(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.activeClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.description), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n<div class=\"";
  if (helper = helpers.inputClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.inputClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " ";
  stack1 = (helper = helpers.is || (depth0 && depth0.is),options={hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.value), 1, options) : helperMissing.call(depth0, "is", (depth0 && depth0.value), 1, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" tabindex=\"0\">\n	<div class=\"light-switch-container\">\n		<div class=\"light-switch-label on\"></div>\n		<div class=\"light-switch-handle\"></div>\n		<div class=\"light-switch-label off\"></div>\n	</div>\n</div>\n\n<input type=\"hidden\" name=\"";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" value=\"";
  if (helper = helpers.value) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.value); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" id=\"";
  if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['inline-editor'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"inline-editor-label\"></div>\n\n<i class=\"fa fa-pencil inline-editor-edit-icon\"></i>\n\n<div class=\"inline-editor-field\"></div>\n\n<div class=\"inline-editor-activity-indicator\"></div>";
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['form-input-field'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<label ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.id), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.labelClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</label>\n";
  return buffer;
  }
function program4(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program6(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.labelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program8(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<p ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.descriptionClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n";
  return buffer;
  }
function program9(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.descriptionClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program11(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "name=\""
    + escapeExpression(((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program13(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.description), {hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n<input type=\"";
  if (helper = helpers.type) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.type); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.id), {hash:{},inverse:self.noop,fn:self.programWithDepth(13, program13, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " class=\"";
  if (helper = helpers.inputClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.inputClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" />";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['list-group-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<span class=\"badge\">"
    + escapeExpression(((stack1 = (depth1 && depth1.badge)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span>\n";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.badge), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['no-list-group-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "No items found.";
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['modal-window'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n	<h3 class=\"modal-header\">";
  if (helper = helpers.header) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.header); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h3>\n	";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n		<div class=\"modal-buttons\">\n		";
  options={hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data}
  if (helper = helpers.buttons) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.buttons); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.buttons) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</div>\n	";
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n			<a href=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.href), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" class=\"";
  if (helper = helpers.className) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.className); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.id), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.icon), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a>\n		";
  return buffer;
  }
function program5(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.href)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program7(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "id=\"";
  if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program9(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<span class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.icon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></span> ";
  return buffer;
  }

  buffer += "<div class=\"modal-window\">\n	<a href=\"#\" class=\"modal-close\"><i class=\"fa fa-times-circle\"></i></a>\n\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n	<div class=\"modal-content clearfix\"></div>\n\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.buttons), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['no-ordered-list-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, helper, functionType="function";


  if (helper = helpers.message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['ordered-list-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, helper, functionType="function";


  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['pager'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.prevClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n		<li class=\"page-totals\">Page "
    + escapeExpression(((stack1 = (depth1 && depth1.page)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " of ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.totalPages), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</li>\n	";
  return buffer;
  }
function program4(depth0,data,depth2) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth2 && depth2.totalPages)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program6(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.nextClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  buffer += "<ul class=\"";
  if (helper = helpers.pagerClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pagerClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n	<li class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.snapToEdges), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"><a href=\"#\" class=\"prev-page\"><i class=\"fa fa-long-arrow-left\" aria-hidden=\"true\"></i> ";
  if (helper = helpers.prevLabel) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.prevLabel); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a></li>\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.includePageTotals), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	<li class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.snapToEdges), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"><a href=\"#\" class=\"next-page\">";
  if (helper = helpers.nextLabel) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nextLabel); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " <i class=\"fa fa-long-arrow-right\" aria-hidden=\"true\"></i></a></li>\n</ul>";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['notification'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, helper;
  buffer += "\n	<div class=\"col-sm-2\">\n		<i class=\"fa fa-";
  if (helper = helpers.icon) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.icon); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " icon\"></i>\n	</div>\n	<div class=\"col-lg-10\">\n		";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.title), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n		";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.message), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</div>\n	";
  return buffer;
  }
function program2(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "<h3>"
    + escapeExpression(((stack1 = (depth2 && depth2.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h3>";
  return buffer;
  }

function program4(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "<p>"
    + escapeExpression(((stack1 = (depth2 && depth2.message)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>";
  return buffer;
  }

function program6(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<div class=\"col-lg-12\">\n		";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.title), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n		";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.message), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</div>\n	";
  return buffer;
  }

  buffer += "<a href=\"#\" class=\"close\"><i class=\"fa fa-times-circle\"></i></a>\n\n<div class=\"row\">\n\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.icon), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n	";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.icon), options) : helperMissing.call(depth0, "not", (depth0 && depth0.icon), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n</div>";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['pagination-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n	<a href=\"";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.href), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = (helper = helpers.not || (depth1 && depth1.not),options={hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data},helper ? helper.call(depth0, (depth1 && depth1.href), options) : helperMissing.call(depth0, "not", (depth1 && depth1.href), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-page=\""
    + escapeExpression(((stack1 = (depth1 && depth1.page)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.page)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</a>\n";
  return buffer;
  }
function program2(depth0,data,depth2) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth2 && depth2.href)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program4(depth0,data) {
  
  
  return "#";
  }

function program6(depth0,data) {
  
  
  return "\n	<a>&hellip;</a>\n";
  }

  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.divider), options) : helperMissing.call(depth0, "not", (depth0 && depth0.divider), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.divider), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['pagination'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<ul class=\"pagination ";
  if (helper = helpers.paginationClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.paginationClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n	<li>\n		<a href=\"#\" class=\"prev-page\" aria-label=\"Previous\">\n			<span aria-hidden=\"true\">&laquo;</span>\n		</a>\n	</li>\n    <li>\n		<a href=\"#\" class=\"next-page\" aria-label=\"Next\">\n			<span aria-hidden=\"true\">&raquo;</span>\n		</a>\n    </li>\n</ul>";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['progress-bar'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"";
  if (helper = helpers.progressBarClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.progressBarClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" role=\"progressbar\" aria-valuenow=\"";
  if (helper = helpers.progress) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.progress); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ";
  if (helper = helpers.progress) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.progress); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%;\">\n	<span class=\"sr-only\">";
  if (helper = helpers.progress) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.progress); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "% Complete</span>\n</div>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['form-radio-field'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<p ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.descriptionClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n";
  return buffer;
  }
function program4(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.descriptionClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program6(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<div class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.inputClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n		<label ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.labelClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "><input type=\""
    + escapeExpression(((stack1 = (depth1 && depth1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" name=\""
    + escapeExpression(((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" value=\""
    + escapeExpression(((stack1 = (depth1 && depth1.value)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></label>\n	</div>\n";
  return buffer;
  }
function program7(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.labelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program9(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	";
  stack1 = ((stack1 = ((stack1 = (depth1 && depth1.options)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1)),blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(10, program10, data, depth1),data:data}));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program10(depth0,data,depth2) {
  
  var buffer = "", stack1, helper;
  buffer += "\n	<div class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.inputClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n		<label ";
  stack1 = helpers['if'].call(depth0, (depth2 && depth2.labelClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth2),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "><input type=\""
    + escapeExpression(((stack1 = (depth2 && depth2.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" name=\""
    + escapeExpression(((stack1 = (depth2 && depth2.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "[]\" value=\"";
  if (helper = helpers.value) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.value); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"> ";
  if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</label>\n	</div>\n	";
  return buffer;
  }
function program11(depth0,data,depth3) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth3 && depth3.labelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.description), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.options), options) : helperMissing.call(depth0, "not", (depth0 && depth0.options), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.options), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['range-slider'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"slider\"></div>";
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['form-select-field'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<label ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.id), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.labelClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</label>\n";
  return buffer;
  }
function program4(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program6(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.labelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program8(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<p ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.descriptionClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n";
  return buffer;
  }
function program9(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.descriptionClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program11(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "name=\""
    + escapeExpression(((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program13(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program15(depth0,data) {
  
  
  return "multiple";
  }

function program17(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n	<option ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.value), {hash:{},inverse:self.noop,fn:self.programWithDepth(18, program18, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.selected), {hash:{},inverse:self.noop,fn:self.program(20, program20, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.programWithDepth(22, program22, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(24, program24, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.label), options) : helperMissing.call(depth0, "not", (depth0 && depth0.label), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</option>\n";
  return buffer;
  }
function program18(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "value=\""
    + escapeExpression(((stack1 = (depth1 && depth1.value)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program20(depth0,data) {
  
  
  return "selected";
  }

function program22(depth0,data,depth1) {
  
  var stack1;
  stack1 = ((stack1 = (depth1 && depth1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }

function program24(depth0,data,depth1) {
  
  var stack1;
  stack1 = ((stack1 = (depth1 && depth1.value)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.description), {hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n<select ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.id), {hash:{},inverse:self.noop,fn:self.programWithDepth(13, program13, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " class=\"";
  if (helper = helpers.inputClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.inputClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.multiple), {hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n";
  options={hash:{},inverse:self.noop,fn:self.program(17, program17, data),data:data}
  if (helper = helpers.options) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.options); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.options) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(17, program17, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</select>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['selection-pool-tree-node'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\n    <ul class=\"children\"></ul>\n";
  }

  buffer += "<i class=\"fa fa-bars drag-handle\"></i> <span class=\"node-name\">";
  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasChildren), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['selection-pool'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "height:"
    + escapeExpression(((stack1 = (depth1 && depth1.height)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ";";
  return buffer;
  }

  buffer += "<div class=\"row selection-pool-search\">\n    <div class=\"col-sm-12\">\n        <div class=\"selection-pool-search-field\">\n            <div class=\"selection-pool-search-activity\"></div>\n            <a href=\"#\" class=\"selection-pool-search-clear\"><i class=\"fa fa-times-circle\"></i></a>\n            <input type=\"text\" value=\"\" placeholder=\"Enter keywords to search the list\" class=\"search form-control\">\n        </div>\n    </div>\n</div>\n\n<div class=\"row selection-pool-lists\">\n    <div class=\"col-sm-6\">\n        <div class=\"available-pool droppable-pool\" data-accept=\".selected-pool .draggable-tree-node\" style=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.height), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></div>\n    </div>\n    <div class=\"col-sm-6\">\n        <div class=\"selected-pool droppable-pool\" data-accept=\".available-pool .draggable-tree-node\" style=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.height), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></div>\n    </div>\n</div>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['table-activity-indicator-row'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "style=\"height:"
    + escapeExpression(((stack1 = (depth1 && depth1.height)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "px\"";
  return buffer;
  }

  buffer += "<td class=\"activity-indicator-row\" colspan=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.columns)),stack1 == null || stack1 === false ? stack1 : stack1.length)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.height), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n\n	<div class=\"activity-indicator-dimmer\">\n		\n		<span class=\"activity-indicator\"></span>\n\n	</div>\n\n</td>";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['table-no-items'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<td colspan=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.columns)),stack1 == null || stack1 === false ? stack1 : stack1.length)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n	";
  if (helper = helpers.message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n</td>";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['table-view-footer'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.totalPages)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program3(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.page)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  buffer += "<td colspan=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.columns)),stack1 == null || stack1 === false ? stack1 : stack1.length)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"page-totals\">\n    Page ";
  if (helper = helpers.page) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.page); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " of ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.totalPages), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.totalPages), options) : helperMissing.call(depth0, "not", (depth0 && depth0.totalPages), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</td>";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['table-view-group'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n<div class=\"buttons-wrapper pull-right\">\n	";
  stack1 = ((stack1 = ((stack1 = (depth1 && depth1.buttons)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1)),blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth0),data:data}));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;
  }
function program2(depth0,data,depth1) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n		<a href=\"";
  if (helper = helpers.href) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.href); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.className), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth1),data:data},helper ? helper.call(depth0, (depth0 && depth0.className), options) : helperMissing.call(depth0, "not", (depth0 && depth0.className), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.icon), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a>\n	";
  return buffer;
  }
function program3(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.className)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program5(depth0,data,depth2) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth2 && depth2.buttonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program7(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<i class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.icon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i>";
  return buffer;
  }

function program9(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.headerClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n";
  return buffer;
  }

function program11(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<"
    + escapeExpression(((stack1 = (depth1 && depth1.descriptionTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.descriptionClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.descriptionTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n";
  return buffer;
  }

function program13(depth0,data,depth1) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n			<th scope=\"col\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.width), {hash:{},inverse:self.noop,fn:self.programWithDepth(14, program14, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.className), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = (helper = helpers.is || (depth0 && depth0.is),options={hash:{},inverse:self.noop,fn:self.programWithDepth(16, program16, data, depth1),data:data},helper ? helper.call(depth0, (depth0 && depth0.id), (depth1 && depth1.order), options) : helperMissing.call(depth0, "is", (depth0 && depth0.id), (depth1 && depth1.order), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n				";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.id), {hash:{},inverse:self.noop,fn:self.programWithDepth(18, program18, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n				";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(20, program20, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.id), options) : helperMissing.call(depth0, "not", (depth0 && depth0.id), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n			</th>\n		";
  return buffer;
  }
function program14(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "width=\""
    + escapeExpression(((stack1 = (depth1 && depth1.width)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program16(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "sort-"
    + escapeExpression(((stack1 = (depth2 && depth2.sort)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  return buffer;
  }

function program18(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n					<a href=\"#\" data-id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"sort\">";
  stack1 = ((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</a>\n					<i class=\"sort-icon asc fa fa-sort-asc\"></i>\n					<i class=\"sort-icon desc fa fa-sort-desc\"></i>\n				";
  return buffer;
  }

function program20(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n					";
  stack1 = ((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n				";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.buttons)),stack1 == null || stack1 === false ? stack1 : stack1.length), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.description), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n<table class=\"";
  if (helper = helpers.tableClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.tableClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n	<thead>\n		<tr>\n		";
  options={hash:{},inverse:self.noop,fn:self.programWithDepth(13, program13, data, depth0),data:data}
  if (helper = helpers.columns) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.columns); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.columns) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(13, program13, data, depth0),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</tr>\n	</thead>\n	<tbody></tbody>\n	<tfoot></tfoot>\n</table>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['table-view-pagination'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div></div>";
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['table-view-row'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n	<td data-id=\"";
  if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">"
    + escapeExpression((helper = helpers.propertyOf || (depth1 && depth1.propertyOf),options={hash:{},data:data},helper ? helper.call(depth0, depth1, (depth0 && depth0.id), options) : helperMissing.call(depth0, "propertyOf", depth1, (depth0 && depth0.id), options)))
    + "</td>\n";
  return buffer;
  }

  options={hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}
  if (helper = helpers.columns) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.columns); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.columns) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}); }
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['tab-content'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, helper, functionType="function";


  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['tabs'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<!-- Nav tabs -->\n<ul class=\"nav nav-tabs\" role=\"tablist\"></ul>\n\n<!-- Tab panes -->\n<div class=\"tab-content\">\n</div>";
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['form-textarea-field'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<label ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.id), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.labelClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</label>\n";
  return buffer;
  }
function program4(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program6(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.labelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program8(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<p ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.descriptionClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">"
    + escapeExpression(((stack1 = (depth1 && depth1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n";
  return buffer;
  }
function program9(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.descriptionClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program11(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "name=\""
    + escapeExpression(((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program13(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.description), {hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n<textarea ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.id), {hash:{},inverse:self.noop,fn:self.programWithDepth(13, program13, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " class=\"";
  if (helper = helpers.inputClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.inputClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></textarea>";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['no-unordered-list-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, helper, functionType="function";


  if (helper = helpers.message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['unordered-list-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, helper, functionType="function";


  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['draggable-tree-view-node'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<i class=\"fa fa-bars drag-handle\"></i>\n\n<div class=\"node-name\">\n    <span>";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span>\n</div>\n\n<ul class=\"children\"></ul>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['tree-view-node'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\n    <ul class=\"children\"></ul>\n";
  }

  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasChildren), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['wizard-buttons'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.disabledClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<i class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.backIcon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i> ";
  return buffer;
  }

function program5(depth0,data) {
  
  
  return "type=\"button\"";
  }

function program7(depth0,data) {
  
  
  return "type=\"submit\"";
  }

function program9(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += escapeExpression(((stack1 = (depth1 && depth1.defaultButtonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " next";
  return buffer;
  }

function program11(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += escapeExpression(((stack1 = (depth1 && depth1.primaryButtonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " finish";
  return buffer;
  }

function program13(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += escapeExpression(((stack1 = (depth1 && depth1.nextLabel)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.nextIcon), {hash:{},inverse:self.noop,fn:self.programWithDepth(14, program14, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  }
function program14(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += " <i class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.nextIcon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i>";
  return buffer;
  }

function program16(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.finishLabel)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  buffer += "<button type=\"button\" class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.disableBackButton), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  if (helper = helpers.defaultButtonClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultButtonClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " ";
  if (helper = helpers.buttonSizeClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.buttonSizeClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " back ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isFirstStep), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.backIcon), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  if (helper = helpers.backLabel) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.backLabel); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n</button>\n\n<button ";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.isLastStep), options) : helperMissing.call(depth0, "not", (depth0 && depth0.isLastStep), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isLastStep), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.disableNextButton), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.isLastStep), options) : helperMissing.call(depth0, "not", (depth0 && depth0.isLastStep), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isLastStep), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  if (helper = helpers.buttonSizeClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.buttonSizeClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n    ";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(13, program13, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.isLastStep), options) : helperMissing.call(depth0, "not", (depth0 && depth0.isLastStep), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isLastStep), {hash:{},inverse:self.noop,fn:self.programWithDepth(16, program16, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</button>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['wizard-error'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<div class=\"wizard-error-icon\"><i class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.errorIcon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i></div>";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.message)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.errorIcon), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.message), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['wizard-progress'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n    <a class=\"wizard-step ";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.complete), options) : helperMissing.call(depth0, "not", ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.complete), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.complete), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-step=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.step)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.title), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n        ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.label), {hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n        ";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.programWithDepth(10, program10, data, depth0),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.label), options) : helperMissing.call(depth0, "not", ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.label), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </a>\n";
  return buffer;
  }
function program2(depth0,data,depth2) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth2 && depth2.disabledClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program4(depth0,data,depth2) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth2 && depth2.completeClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program6(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "title=\""
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.options)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

function program8(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n            <span class=\"wizard-step-label\">"
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.options)),stack1 == null || stack1 === false ? stack1 : stack1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span>\n        ";
  return buffer;
  }

function program10(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth1 && depth1.options)),stack1 == null || stack1 === false ? stack1 : stack1.title), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program11(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "\n                <span class=\"wizard-step-label\">"
    + escapeExpression(((stack1 = ((stack1 = (depth2 && depth2.options)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span>\n            ";
  return buffer;
  }

  buffer += "<div class=\"wizard-progress-bar\">\n";
  options={hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}
  if (helper = helpers.steps) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.steps); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.steps) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['wizard-success'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<div class=\"wizard-success-icon\"><i class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.successIcon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i></div>";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.message)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.successIcon), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.message), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['wizard'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n<div class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.panelClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n    <div class=\"panel-body\">\n    ";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n            <"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTag)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">\n        ";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n            <p>"
    + escapeExpression(((stack1 = (depth1 && depth1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n        ";
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "\n    </div>\n    <div class=\"wizard-buttons\"></div>\n</div>\n";
  }

function program9(depth0,data) {
  
  
  return "\n<div class=\"wizard-buttons\"></div>\n";
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.panel), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n        <div class=\"wizard-progress\"></div>\n\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.description), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n        <div class=\"wizard-content\"></div>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.panel), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.panel), options) : helperMissing.call(depth0, "not", (depth0 && depth0.panel), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  })}));
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

            while (data.length > 0) {
                var parent = null, removeModels = [];

                data.each(function(model) {
                    var child, parentId = this.getParentId(model);

                    if(model) {
                        if(_.isNull(parentId)) {
                            data.remove(this.appendNode(model));
                        }
                        else if (parent = this.findNodeById(parentId)) {
                            data.remove(this.appendNode(model, parent));
                        }
                    }
                }, this);
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

        appendNode(child, parent, options) {
            options || (options = {});
            child.children || (child.children = this._createCollection());

            /*
            if(this.getOption('comparator')) {
                var comparator = (!_.isUndefined(options.at) ? options.at : (parent ? parent.children.length : this.length)) + 1;

                child.set(this.getOption('comparator'), comparator);
            }
            */ 

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

        appendNodeBefore(child, sibling) {
            var parentId = this.getParentId(sibling);
            var parent = parentId ? this.find({id: parentId}) : null;
            var index = parent ? parent.children.indexOf(sibling) : this.indexOf(sibling);

            this.appendNode(child, parent, {
                at: index
            });

            return child;
        },

        appendNodeAfter(child, sibling) {
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

                if(!model) {
                    for(var i in collection.models) {
                        var model = collection.models[i];

                        if(model.children && model.children.length) {
                            var found = find(model.children);

                            if(found) {
                                return found;
                            }
                        }
                    }
                }

                return model;
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

    Toolbox.ItemView = Marionette.ItemView.extend({

        defaultOptions: {

        },

        initialize: function() {
            Marionette.ItemView.prototype.initialize.apply(this, arguments);

            this.options = Toolbox.Options(this.defaultOptions, this.options, this);
            this.channelName = _.result(this, 'channelName') || _.result(this.options, 'channelName') || 'global';
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

    Toolbox.LayoutView = Marionette.LayoutView.extend({

        defaultOptions: {

        },

        initialize: function() {
            Marionette.LayoutView.prototype.initialize.apply(this, arguments);

            this.options = Toolbox.Options(this.defaultOptions, this.options, this);
            this.channelName = _.result(this, 'channelName') || _.result(this.options, 'channelName') || 'global';
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

    Toolbox.CompositeView = Marionette.CompositeView.extend({

        initialize: function() {
            Marionette.CompositeView.prototype.initialize.apply(this, arguments);

            this.options = Toolbox.Options(this.defaultOptions, this.options, this);
            this.channelName = _.result(this, 'channelName') || _.result(this.options, 'channelName') || 'global';
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

    Toolbox.BaseField = Toolbox.ItemView.extend({

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

        templateHelpers: function() {
            return this.options;
        },

        initialize: function() {
            Toolbox.ItemView.prototype.initialize.apply(this, arguments);

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

    Toolbox.BlockFormError = Toolbox.ItemView.extend({

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

        templateHelpers: function() {
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

    Toolbox.BaseForm = Toolbox.LayoutView.extend({

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

            return data;
        },

        showActivityIndicator: function() {
            this.$indicator = this.$el.find('.form-indicator');

            if(this.$indicator.length === 0) {
                this.$indicator = $('<div class="form-indicator"></div>');
            }

            if(this.$el.find('footer').length) {
                this.$el.find('footer').append(this.$indicator);
            }
            else {
                this.$el.append(this.$indicator);
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

	Toolbox.NoUnorderedListItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('no-unordered-list-item'),

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateHelpers: function() {
			return this.options;
		}

	});

	Toolbox.UnorderedListItem = Toolbox.ItemView.extend({

		className: 'unordered-list-item',

		tagName: 'li',

		events: {
			'click': function(e, obj) {
				this.triggerMethod('click', obj);
			}
		},

		templateHelpers: function() {
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

    Toolbox.DropdownMenuNoItems = Toolbox.ItemView.extend({

		tagName: 'li',

		template: Toolbox.Template('dropdown-menu-no-items'),

		className: 'no-results'

	});

	Toolbox.DropdownMenuItem = Toolbox.ItemView.extend({

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

	Toolbox.DropdownMenu = Toolbox.CompositeView.extend({

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
			dropdownMenuToggleClassName: 'dropdown-toggle',

			// (string) The dropdown toggle icon class name
			dropdownMenuToggleIconClassName: 'fa fa-caret-down',

			// (string) The dropdown menu class name
			dropdownMenuClassName: 'dropdown-menu',

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

        templateHelpers: function() {
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
			this.$el.find('.'+this.getOption('dropdownMenuToggleClassName')).parent().addClass(this.getOption('toggleClassName'));
			this.$el.find('.'+this.getOption('dropdownMenuToggleClassName')).attr('aria-expanded', 'true');
		},

		hideMenu: function() {
			this.$el.find('.'+this.getOption('dropdownMenuToggleClassName')).parent().removeClass(this.getOption('toggleClassName'));
			this.$el.find('.'+this.getOption('dropdownMenuToggleClassName')).attr('aria-expanded', 'false');
		},

		isMenuVisible: function() {
			return this.$el.find('.'+this.getOption('dropdownMenuToggleClassName')).parent().hasClass(this.getOption('toggleClassName'));
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

    Toolbox.TreeViewNode = Toolbox.CompositeView.extend({

        getTemplate: function() {
            if(!this.getOption('template')) {
                throw new Error('A template option must be set.');
            }

            return this.getOption('template');
        },

        tagName: 'li',

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

        templateHelpers: function() {
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
            var self = this;
            var nodeWhere = {}, parentWhere = {};

            var id = $(event.relatedTarget).data('id');
            var parentId = $(event.target).data('id');

            console.log(id);

            nodeWhere[getIdAttribute(id)] = id;
            parentWhere[getIdAttribute(parentId)] = parentId;

            var node = self.root().collection.find(nodeWhere);
            var parent = self.root().collection.find(parentWhere);

            self.root().collection.removeNode(node);

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
            });

            self.root().triggerMethod('drop', event, this);
        },

        onDropMove: function(event) {
            var self = this;

            Toolbox.Dropzones(event, event.dropzone.element(), {
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
                    if(self.getOption('nestable')) {
                        $(event.dropzone.element())
                            .addClass('drop-children')
                            .removeClass('drop-after drop-before')
                    }
                }
            });
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
            /*
            this._ghostElement = $(event.target).parent().next()
                .css({'margin-top': $(event.target).parent().outerHeight()});

            if(this._ghostElement.length == 0) {
                this._ghostElement = $(event.target).parent().prev()
                    .css({'margin-bottom': $(event.target).parent().outerHeight()});
            }
            */

            var target = event.target; //, offset = $(target).offset();

            $(target).css({
                'left': event.clientX,
                'top': event.clientY,
                'width': $(target).width()
            });

            //$(event.target).parents('.' + this.className).css({left: event.clientX, top: event.clientY});

            this.root().triggerMethod('drag:start', event, this);
        },

        onDragEnd: function(event) {
            this.$el.removeClass('dragging');

            //this._ghostElement.css('transform', '');
            //this._ghostElement = false;
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

        onDragEnter: function() {
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
                .on('dragmove', function (event) {
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

    Toolbox.ActivityIndicator = Toolbox.ItemView.extend({

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

        templateHelpers: function() {
            return this.options;
        },

        getPresetOptions: function() {
            return {
                'tiny': {
                    lines: 12, // The number of lines to draw
                    length: 4, // The length of each line
                    width: 1, // The line thickness
                    radius: 4, // The radius of the inner circle
                    corners: 1 // Corner roundness (0..1)
                },
                'small': {
                    lines: 12, // The number of lines to draw
                    length: 7, // The length of each line
                    width: 1, // The line thickness
                    radius: 7, // The radius of the inner circle
                    corners: 1 // Corner roundness (0..1)
                },
                'medium': {
                    lines: 12, // The number of lines to draw
                    length: 14, // The length of each line
                    width: 1, // The line thickness
                    radius: 11, // The radius of the inner circle
                    corners: 1 // Corner roundness (0..1)
                },
                'large': {
                    lines: 12, // The number of lines to draw
                    length: 28, // The length of each line
                    width: 1, // The line thickness
                    radius: 20, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    labelOffset: 10
                }
            };
        },

        initialize: function() {
            Toolbox.ItemView.prototype.initialize.apply(this, arguments);

            var resizeTimer, self = this;

            $(window).resize(function() {
                self.$el.find('.activity-indicator-label').css({top: ''});
                self.positionLabel();
            });
        },

        positionLabel: function() {
            if(this.getOption('label')) {
                var height = this.$el.find('.activity-indicator-label').outerHeight();

                this.$el.find('.activity-indicator-label').css({
                    top: this.$el.find('.activity-indicator-label').offset().top +
                        this.spinner.opts.length +
                        this.spinner.opts.radius +
                        (height / 2) +
                        (this.spinner.opts.labelOffset || 0)
                });
            }
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

	Toolbox.NoBreadcrumbs = Toolbox.ItemView.extend({

		template: Toolbox.Template('no-breadcrumbs'),

		tagName: 'li',

		className: 'no-breadcrumbs'

	});

	Toolbox.Breadcrumb = Toolbox.ItemView.extend({

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
			dropdownMenuToggleClassName: 'dropdown-toggle',

			// (string) The dropdown menu class name
			dropdownMenuClassName: 'dropdown-menu',

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

    Toolbox.ButtonGroupItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('button-group-item'),

		tagName: 'a',

		className: 'btn btn-default',

		triggers: {
			'click': 'click'
		},

		onDomRefresh: function() {
			if(this.model.get('active')) {
				this.$el.addClass('active');
			}
		}

	});

	Toolbox.NoButtonGroupItems = Toolbox.ItemView.extend({

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
			this.trigger('click', child);

			if(this.getOption('activateOnClick') && !child.$el.hasClass(this.getOption('activeClassName'))) {
				this.$el.find('.'+this.getOption('activeClassName'))
					.removeClass(this.getOption('activeClassName'));

				child.$el.addClass(this.getOption('activeClassName'));

				this.triggerMethod('activate', child);
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

    Toolbox.MonthlyCalendarDay = Toolbox.ItemView.extend({

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

        templateHelpers: function() {
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
                this.addChild(this.getDayModel(), this.getChildView(), i);
            }, this);
        },

        _initialEvents: function() {

        }

    });

    Toolbox.MonthlyCalendar = Toolbox.CompositeView.extend({

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
                this.addChild(this.getWeekModel(), this.getChildView(), i);
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

    Toolbox.InlineEditor = Toolbox.LayoutView.extend({

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

	Toolbox.NoListGroupItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('no-list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		}

	});

	Toolbox.ListGroupItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

		events: {
			'click': function(e) {
				this.triggerMethod('click', e);
			}
		},

		templateHelpers: function() {
			return this.options
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
			showEmptyMessage: true
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

    Toolbox.Modal = Toolbox.LayoutView.extend({

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

        templateHelpers: function() {
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

	Toolbox.Notification = Toolbox.ItemView.extend({

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

        templateHelpers: function() {
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

	Toolbox.NoOrderedListItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('no-ordered-list-item'),

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateHelpers: function() {
			return this.options;
		}

	});

	Toolbox.OrderedListItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('ordered-list-item'),

		className: 'ordered-list-item',

		tagName: 'li',

		events: {
			'click': function(e, obj) {
				this.triggerMethod('click', obj);
			}
		},

		templateHelpers: function() {
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

	Toolbox.Pager = Toolbox.ItemView.extend({

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

        templateHelpers: function() {
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

	Toolbox.PaginationItem = Toolbox.ItemView.extend({

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

	Toolbox.Pagination = Toolbox.CompositeView.extend({

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

        templateHelpers: function() {
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

	Toolbox.ProgressBar = Toolbox.ItemView.extend({

		template: Toolbox.Template('progress-bar'),

		className: 'progress',

		defaultOptions: {
			// (string) The progress bar class name
			progressBarClassName: 'progress-bar',

			// (int) The progress percentage
			progress: 0
		},

        templateHelpers: function() {
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

    Toolbox.RangeSlider = Toolbox.ItemView.extend({

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

    Toolbox.SelectionPool = Toolbox.LayoutView.extend({

        template: Toolbox.Template('selection-pool'),

        className: 'selection-pool',

        regions: {
            available: '.available-pool',
            selected: '.selected-pool',
            activity: '.selection-pool-search-activity'
        },

        defaultOptions: function() {
            return {
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

        templateHelpers: function() {
            return this.options;
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
            var view = new Toolbox.ActivityIndicator(this.getOption('searchIndicatorOptions'));

            this.$el.addClass('show-activity');
            this.activity.show(view);
        },

        hideSearchActivity: function() {
            this.$el.removeClass('show-activity');
            this.activity.empty();
        },

        showAvailablePool: function() {
            var View = this.getOption('availableTreeView');

            if(View) {
        		var view = new View(_.extend({
                    collection: this.getOption('availableTree'),
                    childViewOptions: _.extend({}, View.prototype.childViewOptions, {
                        template: this.getOption('availableTreeViewTemplate')
                    })
        		}, this.getOption('availableTreeViewOptions')));

                view.on('drop:before', function(event) {
                    transferNodeBefore(event, this);
                }, this);

                view.on('drop:after', function(event) {
                    transferNodeAfter(event, this);
                }, this);

                view.on('drop:children', function(event) {
                    transferNodeChildren(event, this);
                }, this);

                this.available.show(view);
            }
        },

        showSelectedPool: function() {
            var View = this.getOption('selectedTreeView');

            if(View) {
        		var view = new View(_.extend({
                    collection: this.getOption('selectedTree'),
                    childViewOptions: _.extend({}, View.prototype.childViewOptions, {
                        template: this.getOption('selectedTreeViewTemplate')
                    })
        		}, this.getOption('selectedTreeViewOptions')));

                view.on('drop:before', function(event) {
                    transferNodeBefore(event, this);
                }, this);

                view.on('drop:after', function(event) {
                    transferNodeAfter(event, this);
                }, this);

                view.on('drop:children', function(event) {
                    transferNodeChildren(event, this);
                }, this);

                this.selected.show(view);
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

            this.search(this.available.currentView.collection, value);
            this.available.currentView.render();
        },

        onDomRefresh: function() {
            var self = this;

            var detection = new Toolbox.TypingDetection(
                this.$el.find('.selection-pool-search input'),
                this.getOption('typingStoppedThreshold'),
                this.channel
            );

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
                        },
                        ondragenter: function (event) {
                            self.$el.addClass('dropping');
                            $pool.parent().addClass('droppable');
                        },
                        ondragleave: function (event) {
                            self.$el.removeClass('dropping');
                            $pool.parent().removeClass('droppable');
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

        attributes: function() {
            var attributes = Toolbox.DraggableTreeNode.prototype.attributes.call(this);

            return attributes;
        },

        onDrop: function(event) {
            var id = $(event.relatedTarget).data('id');
            var node = this.root().collection.find({id: id});

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

    Toolbox.TableNoItemsRow = Toolbox.ItemView.extend({

        tagName: 'tr',

        template: Toolbox.Template('table-no-items'),

        className: 'no-results',

        defaultOptions: {
            // (array) Array of array of column
            columns: false,

            // (string) The message to display if there are no table rows
            message: 'No rows found'
        },

        templateHelpers: function() {
            return this.options;
        }

    });

    Toolbox.TableViewRow = Toolbox.ItemView.extend({

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

        templateHelpers: function() {
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

    Toolbox.TableViewFooter = Toolbox.LayoutView.extend({

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

        templateHelpers: function() {
            return this.options;
        }

    });

    Toolbox.TableView = Toolbox.CompositeView.extend({

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
            headerTag: 'h3',

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

        templateHelpers: function() {
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
                templateHelpers: function() {
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

        getCurrentPage(response) {
            return response.current_page || response.currentPage;
        },

        getLastPage(response) {
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

    Toolbox.TabContent = Toolbox.ItemView.extend({

		template: Toolbox.Template('tab-content'),

		defaultOptions: {
			name: false,

			id: false,

			content: false
		},

        templateHelpers: function() {
            return this.options;
        }
    });

	Toolbox.Tabs = Toolbox.LayoutView.extend({

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

			tabPaneClassName: 'tab-pane',

			content: []
		},

		tabViews: [],

        templateHelpers: function() {
            return this.options;
        },

        removeTab: function(view) {
        	this.$el.find('.nav-tabs').find('[href="#'+view.getOption('name')+'"]').remove();

        	this.regionManager.removeRegion(view.getOption('name'));

        	this.$el.find('#'+view.getOption('name')).remove();
        },

        addTab: function(view, setActive) {
        	var tab = '<li role="presentation"><a href="#'+view.getOption('name')+'" aria-controls="'+view.getOption('name')+'" role="tab" data-toggle="tab">'+view.getOption('label')+'</a></li>';

        	var html = '<div role="tabpanel" class="'+this.getOption('tabPaneClassName')+'" id="'+view.getOption('name')+'" />';

        	this.$el.find('.nav-tabs').append(tab);
        	this.$el.find('.tab-content').append(html);

			this.regionManager.addRegion(view.getOption('name'), '#'+view.getOption('name'));

			this[view.getOption('name')].show(view);

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
        factory(root.Toolbox);
    } else if (typeof exports === 'object') {
        module.exports = factory(root.Toolbox);
    } else {
        root.Toolbox = factory(root.Toolbox);
    }
}(this, function (Toolbox) {

    'use strict';

	Toolbox.Wizard = Toolbox.LayoutView.extend({

        className: 'wizard',

        channelName: 'toolbox.wizard',

    	template: Toolbox.Template('wizard'),

        regions: {
            progress: '.wizard-progress',
            content: '.wizard-content',
            buttons: '.wizard-buttons'
        },

        defaultOptions: function() {
            return {
                header: false,
                headerTag: 'h2',
                headerTagClassName: 'wizard-header',
                finishedClassName: 'wizard-finished',
                fixedHeightClassName: 'fixed-height',
                hasPanelClassName: 'wizard-panel',
                panelClassName: 'panel panel-default',
                highestStep: 1,
                step: 1,
                steps: [],
                finished: false,
                successView: Toolbox.WizardSuccess,
                errorView: Toolbox.WizardError,
                showButtons: true,
                showProgress: true,
                panel: false,
                contentHeight: false
            };
        },

        templateHelpers: function() {
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

            this.channel.reply('wizard:error', function(options) {
                this.buttons.empty();
                this.showView(this.getOption('errorView'), options);
            }, this);

            this.channel.reply('wizard:success', function() {
                this.finish(true);
            }, this);
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

        showProgress: function() {
            var view = new Toolbox.WizardProgress({
                wizard: this
            });

            this.progress.show(view);
        },

        showButtons: function() {
            var view = new Toolbox.WizardButtons({
                wizard: this,
                channel: this.channel
            });

            this.buttons.show(view);
        },

        showContent: function(view) {
            if(view) {
                view.options.wizard = this;

                this.content.show(view, {
                    preventDestroy: true
                });

                view.once('attach', function() {
                    if(view.regions && view.regionManager) {
                        view.regionManager.emptyRegions();
                        view.regionManager.addRegions(view.regions);
                    }
                });

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

        finish: function(success) {
            this.buttons.empty();

            if(success) {
                this.options.finished = true;
                this.$el.addClass(this.getOption('finishedClassName'));
                this.channel.request('complete:step');
                this.setStep(this.getTotalSteps() + 1);
                this.showView(this.getOption('successView'));
            }
            else {
                this.showView(this.getOption('errorView'));
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

	Toolbox.WizardButtons = Toolbox.ItemView.extend({

        template: Toolbox.Template('wizard-buttons'),

        className: 'wizard-buttons-wrapper',

        channelName: 'toolbox.wizard',

        options: {
            wizard: false,
            buttonSizeClassName: 'btn-md',
            defaultButtonClassName: 'btn btn-default',
            primaryButtonClassName: 'btn btn-primary',
            disabledClassName: 'disabled',
            finishLabel: 'Finish',
            nextLabel: 'Next',
            nextIcon: 'fa fa-long-arrow-right',
            backLabel: 'Back',
            backIcon: 'fa fa-long-arrow-left'
        },

        triggers: {
            'click .back:not(.disabled)': 'click:back',
            'click .next:not(.disabled)': 'click:next',
            'click .finish:not(.disabled)': 'click:finish'
        },

        disableButton: function(button) {
            this.$el.find('.'+button).addClass(this.getOption('disabledClassName'));
        },

        templateHelpers: function() {
            var step = this.getOption('wizard').getOption('step');
            var total =  this.getOption('wizard').getOption('steps').length

            return _.extend({}, this.options, {
                isFirstStep: step == 1,
                isLastStep: step == total,
                totalSteps: total
            }, this.getOption('wizard').options);
        },

        onClickBack: function() {
            var step = this.getOption('wizard').getOption('step');
            var steps = this.getOption('wizard').getOption('steps');
            var response = this.getOption('wizard').getStep().triggerMethod('wizard:click:back', steps[step - 1]);

            if(typeof response === "undefined" || response === true) {
                this.getOption('wizard').back();
            }
        },

        onClickNext: function() {
            var step = this.getOption('wizard').getOption('step');
            var steps = this.getOption('wizard').getOption('steps');
            var response = this.getOption('wizard').getStep().triggerMethod('wizard:click:next', steps[step + 1]);

            if(typeof response === "undefined" || response === true) {
                this.getOption('wizard').next();
            }
        },

        onClickFinish: function() {
            this.channel.request('wizard:success');
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

	Toolbox.WizardError = Toolbox.ItemView.extend({

		template: Toolbox.Template('wizard-error'),

        className: 'wizard-error',

        options: {
            headerTag: 'h3',
            header: 'Error!',
            errorIcon: 'fa fa-times',
            message: false
        },

        templateHelpers: function() {
            return this.options;
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

	Toolbox.WizardProgress = Toolbox.ItemView.extend({

		template: Toolbox.Template('wizard-progress'),

        className: 'wizard-progress-wrapper',

        channelName: 'toolbox.wizard',

        options: {
            wizard: false,
            content: {},
            activeClassName: 'active',
            completeClassName: 'complete',
            disabledClassName: 'disabled'
        },

        events: {
            'click .wizard-step': function(event) {
                var $step = $(event.target);
                var step = $step.data('step');

                if( !$step.hasClass(this.getOption('disabledClassName')) &&
                    !this.getOption('wizard').getOption('finished')) {
                    this.channel.request('set:step', step);
                }

                event.preventDefault();
            }
        },

        templateHelpers: function() {
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
            //this.setComplete(this.getOption('wizard').getOption('step'));
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

	Toolbox.WizardSuccess = Toolbox.ItemView.extend({

		template: Toolbox.Template('wizard-success'),

        className: 'wizard-success',

        options: {
            headerTag: 'h3',
            header: 'Success!',
            successIcon: 'fa fa-check',
            message: false
        },

        templateHelpers: function() {
            return this.options;
        }

	});

    return Toolbox;

}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvb2xib3guanMiLCJEcm9wem9uZXMuanMiLCJUeXBpbmdEZXRlY3Rpb24uanMiLCJWaWV3T2Zmc2V0LmpzIiwidGVtcGxhdGVzLmpzIiwiaXMuanMiLCJub3QuanMiLCJwcm9wZXJ0eU9mLmpzIiwiVHJlZS5qcyIsIkl0ZW1WaWV3LmpzIiwiTGF5b3V0Vmlldy5qcyIsIkNvbXBvc2l0ZVZpZXcuanMiLCJDb2xsZWN0aW9uVmlldy5qcyIsIkJhc2VGaWVsZC5qcyIsIkJhc2VGb3JtLmpzIiwiVW5vcmRlcmVkTGlzdC5qcyIsIkRyb3Bkb3duTWVudS5qcyIsIlRyZWVWaWV3Tm9kZS5qcyIsIlRyZWVWaWV3LmpzIiwiRHJhZ2dhYmxlVHJlZU5vZGUuanMiLCJEcmFnZ2FibGVUcmVlVmlldy5qcyIsIkFjdGl2aXR5SW5kaWNhdG9yL0FjdGl2aXR5SW5kaWNhdG9yLmpzIiwiQnJlYWRjcnVtYnMvQnJlYWRjdW1icy5qcyIsIkJ1dHRvbkRyb3Bkb3duTWVudS9CdXR0b25Ecm9wZG93bk1lbnUuanMiLCJCdXR0b25Hcm91cC9CdXR0b25Hcm91cC5qcyIsIkNhbGVuZGFyL0NhbGVuZGFyLmpzIiwiQ2hlY2tib3hGaWVsZC9DaGVja2JveEZpZWxkLmpzIiwiQ29yZS9MZW52ZW5zaHRlaW4uanMiLCJJbmxpbmVFZGl0b3IvSW5saW5lRWRpdG9yLmpzIiwiSW5wdXRGaWVsZC9JbnB1dEZpZWxkLmpzIiwiTGlnaHRTd2l0Y2hGaWVsZC9MaWdodFN3aXRjaEZpZWxkLmpzIiwiTGlzdEdyb3VwL0xpc3RHcm91cC5qcyIsIk1vZGFsL01vZGFsLmpzIiwiTm90aWZpY2F0aW9uL05vdGlmaWNhdGlvbi5qcyIsIk9yZGVyZWRMaXN0L09yZGVyZWRMaXN0LmpzIiwiUGFnZXIvUGFnZXIuanMiLCJQYWdpbmF0aW9uL1BhZ2luYXRpb24uanMiLCJQcm9ncmVzc0Jhci9Qcm9ncmVzc0Jhci5qcyIsIlJhbmdlU2xpZGVyL1JhbmdlU2xpZGVyLmpzIiwiUmFkaW9GaWVsZC9SYWRpb0ZpZWxkLmpzIiwiU2VsZWN0aW9uUG9vbC9TZWxlY3Rpb25Qb29sLmpzIiwiU2VsZWN0aW9uUG9vbC9TZWxlY3Rpb25Qb29sVHJlZU5vZGUuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2xUcmVlVmlldy5qcyIsIlNlbGVjdEZpZWxkL1NlbGVjdEZpZWxkLmpzIiwiU3RvcmFnZS9TdG9yYWdlLmpzIiwiVGFibGVWaWV3L1RhYmxlVmlldy5qcyIsIlRhYnMvVGFicy5qcyIsIlRleHRhcmVhRmllbGQvVGV4dEFyZWFGaWVsZC5qcyIsIldpemFyZC9XaXphcmQuanMiLCJXaXphcmQvV2l6YXJkQnV0dG9ucy5qcyIsIldpemFyZC9XaXphcmRFcnJvci5qcyIsIldpemFyZC9XaXphcmRQcm9ncmVzcy5qcyIsIldpemFyZC9XaXphcmRTdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaG5FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1hcmlvbmV0dGUudG9vbGJveC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1xuICAgICAgICAgICAgICAgICdqcXVlcnknLFxuICAgICAgICAgICAgICAgICdiYWNrYm9uZScsXG4gICAgICAgICAgICAgICAgJ2JhY2tib25lLnJhZGlvJyxcbiAgICAgICAgICAgICAgICAnYmFja2JvbmUubWFyaW9uZXR0ZScsXG4gICAgICAgICAgICAgICAgJ2hhbmRsZWJhcnMnLFxuICAgICAgICAgICAgICAgICd1bmRlcnNjb3JlJ1xuICAgICAgICAgICAgXSwgZnVuY3Rpb24oJCwgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlLCBIYW5kbGViYXJzLCBfKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdCwgJCwgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlLCBIYW5kbGViYXJzLCBfKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QsXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lJyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5yYWRpbycpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnaGFuZGxlYmFycycpLFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShyb290LCByb290LiQsIHJvb3QuQmFja2JvbmUsIHJvb3QuQmFja2JvbmUuUmFkaW8sIHJvb3QuTWFyaW9uZXR0ZSwgcm9vdC5IYW5kbGViYXJzLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24ocm9vdCwgJCwgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlLCBIYW5kbGViYXJzLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgVG9vbGJveCA9IHt9O1xuXG4gICAgVG9vbGJveC5oYW5kbGViYXJzID0ge307XG5cbiAgICBUb29sYm94LlZpZXdzID0ge307XG5cbiAgICBUb29sYm94LlZFUlNJT04gPSAnJSVHVUxQX0lOSkVDVF9WRVJTSU9OJSUnO1xuXG4gICAgLy8gVG9vbGJveC5UZW1wbGF0ZVxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBHZXQgYW4gZXhpc3RpbmcgcmVuZGVyZWQgaGFuZGxlYmFycyB0ZW1wbGF0ZVxuXG4gICAgVG9vbGJveC5UZW1wbGF0ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgaWYoVG9vbGJveC50ZW1wbGF0ZXNbbmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiBUb29sYm94LnRlbXBsYXRlc1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93ICdDYW5ub3QgbG9jYXRlIHRoZSBIYW5kbGViYXJzIHRlbXBsYXRlIHdpdGggdGhlIG5hbWUgb2YgXCInK25hbWUrJ1wiLic7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVG9vbGJveC5PcHRpb25zXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEdldCB0aGUgZGVmYXVsdCBvcHRpb25zIGFuZCBvcHRpb25zIGFuZCBtZXJnZSB0aGUsXG5cbiAgICBUb29sYm94Lk9wdGlvbnMgPSBmdW5jdGlvbihkZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIE1hcmlvbmV0dGUuX2dldFZhbHVlKGRlZmF1bHRPcHRpb25zLCBjb250ZXh0KSwgTWFyaW9uZXR0ZS5fZ2V0VmFsdWUob3B0aW9ucywgY29udGV4dCkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcm9vdC5Ub29sYm94ID0gVG9vbGJveDtcbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGRlZmluZShbJ2pxdWVyeSddLCBmdW5jdGlvbigkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkRyb3B6b25lcyA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCBjYWxsYmFja3MsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIG9mZnNldCA9IFRvb2xib3guVmlld09mZnNldChlbGVtZW50KTtcbiAgICAgICAgdmFyIHRvcCA9IG9mZnNldC55O1xuICAgICAgICB2YXIgbGVmdCA9IG9mZnNldC54O1xuICAgICAgICB2YXIgaGVpZ2h0ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHZhciBoZWlnaHRUaHJlc2hvbGQgPSBoZWlnaHQgKiAuMjU7XG4gICAgICAgIHZhciB3aWR0aFRocmVzaG9sZCA9IDQwO1xuICAgICAgICB2YXIgYm90dG9tID0gdG9wICsgaGVpZ2h0O1xuXG4gICAgICAgIGlmKGhlaWdodFRocmVzaG9sZCA+IDIwKSB7XG4gICAgICAgICAgICBoZWlnaHRUaHJlc2hvbGQgPSAyMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkZWxtID0gJChlbGVtZW50KTtcblxuICAgICAgICBpZihldmVudC5wYWdlWSA8IHRvcCArIGhlaWdodFRocmVzaG9sZCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmJlZm9yZSA/IGNhbGxiYWNrcy5iZWZvcmUuY2FsbChjb250ZXh0LCAkZWxtKSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihldmVudC5wYWdlWSA+IGJvdHRvbSAtIGhlaWdodFRocmVzaG9sZCB8fCBldmVudC5wYWdlWCA8IGxlZnQgKyB3aWR0aFRocmVzaG9sZCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmFmdGVyID8gY2FsbGJhY2tzLmFmdGVyLmNhbGwoY29udGV4dCwgJGVsbSkgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmNoaWxkcmVuID8gY2FsbGJhY2tzLmNoaWxkcmVuLmNhbGwoY29udGV4dCwgJGVsbSkgOiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVHlwaW5nRGV0ZWN0aW9uID0gZnVuY3Rpb24oJGVsZW1lbnQsIHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQsIHJhZGlvQ2hhbm5lbCkge1xuICAgICAgICB0eXBpbmdTdG9wcGVkVGhyZXNob2xkIHx8ICh0eXBpbmdTdG9wcGVkVGhyZXNob2xkID0gNTAwKTtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB0eXBpbmdUaW1lciwgbGFzdFZhbHVlO1xuICAgICAgICB2YXIgaGFzVHlwaW5nU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZ2V0VmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkZWxlbWVudC52YWwoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhhc1R5cGluZ1N0YXJ0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TGFzdFZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFzdFZhbHVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2xlYXJUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodHlwaW5nVGltZXIpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodHlwaW5nVGltZXIpO1xuICAgICAgICAgICAgICAgIHR5cGluZ1RpbWVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRlbGVtZW50LmtleXVwKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmKCF0eXBpbmdUaW1lcikge1xuICAgICAgICAgICAgICAgIHR5cGluZ1RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYocmFkaW9DaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb0NoYW5uZWwudHJpZ2dlcignZGV0ZWN0aW9uOnR5cGluZzpzdG9wcGVkJywgc2VsZi5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0VmFsdWUgPSBzZWxmLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGhhc1R5cGluZ1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LCB0eXBpbmdTdG9wcGVkVGhyZXNob2xkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGVsZW1lbnQua2V5ZG93bihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmKCFoYXNUeXBpbmdTdGFydGVkICYmIHNlbGYuZ2V0VmFsdWUoKSAhPSBsYXN0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYocmFkaW9DaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb0NoYW5uZWwudHJpZ2dlcignZGV0ZWN0aW9uOnR5cGluZzpzdGFydGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaGFzVHlwaW5nU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlbGYuY2xlYXJUaW1lcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5WaWV3T2Zmc2V0ID0gZnVuY3Rpb24obm9kZSwgc2luZ2xlRnJhbWUpIHtcbiAgICAgICAgZnVuY3Rpb24gYWRkT2Zmc2V0KG5vZGUsIGNvb3Jkcywgdmlldykge1xuICAgICAgICAgICAgdmFyIHAgPSBub2RlLm9mZnNldFBhcmVudDtcblxuICAgICAgICAgICAgY29vcmRzLnggKz0gbm9kZS5vZmZzZXRMZWZ0IC0gKHAgPyBwLnNjcm9sbExlZnQgOiAwKTtcbiAgICAgICAgICAgIGNvb3Jkcy55ICs9IG5vZGUub2Zmc2V0VG9wIC0gKHAgPyBwLnNjcm9sbFRvcCA6IDApO1xuXG4gICAgICAgICAgICBpZiAocCkge1xuICAgICAgICAgICAgICAgIGlmIChwLm5vZGVUeXBlID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFN0eWxlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKHAsICcnKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50U3R5bGUucG9zaXRpb24gIT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLmJvcmRlckxlZnRXaWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBwYXJzZUludChwYXJlbnRTdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwLmxvY2FsTmFtZSA9PSAnVEFCTEUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQocGFyZW50U3R5bGUucGFkZGluZ0xlZnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLnBhZGRpbmdUb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocC5sb2NhbE5hbWUgPT0gJ0JPRFknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKG5vZGUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHAubG9jYWxOYW1lID09ICdCT0RZJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQocGFyZW50U3R5bGUuYm9yZGVyTGVmdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLmJvcmRlclRvcFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHAgIT0gcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCAtPSBwYXJlbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55IC09IHBhcmVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGFkZE9mZnNldChwLCBjb29yZHMsIHZpZXcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmxvY2FsTmFtZSA9PSAnQk9EWScpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKG5vZGUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQoc3R5bGUuYm9yZGVyTGVmdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gcGFyc2VJbnQoc3R5bGUuYm9yZGVyVG9wV2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBodG1sU3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUobm9kZS5wYXJlbnROb2RlLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54IC09IHBhcnNlSW50KGh0bWxTdHlsZS5wYWRkaW5nTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55IC09IHBhcnNlSW50KGh0bWxTdHlsZS5wYWRkaW5nVG9wKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5zY3JvbGxMZWZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54ICs9IG5vZGUuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5zY3JvbGxUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gbm9kZS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHdpbiA9IG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldztcblxuICAgICAgICAgICAgICAgIGlmICh3aW4gJiYgKCFzaW5nbGVGcmFtZSAmJiB3aW4uZnJhbWVFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBhZGRPZmZzZXQod2luLmZyYW1lRWxlbWVudCwgY29vcmRzLCB3aW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb29yZHMgPSB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBhZGRPZmZzZXQobm9kZSwgY29vcmRzLCBub2RlLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvb3JkcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2FjdGl2aXR5LWluZGljYXRvciddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJkaW1tZWRcIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIm1pbi1oZWlnaHQ6XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5taW5IZWlnaHQpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjtcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcInBvc2l0aW9uOlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEucG9zaXRpb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjtcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImJhY2tncm91bmQtY29sb3I6IFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGltbWVkQmdDb2xvcikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiO1wiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPHNwYW4gY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvci1sYWJlbFxcXCIgc3R5bGU9XFxcIlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5sYWJlbEZvbnRTaXplKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEwLCBwcm9ncmFtMTAsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubGFiZWwpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvc3Bhbj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTEwKGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiZm9udC1zaXplOlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIubGFiZWxGb250U2l6ZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPVxcXCJhY3Rpdml0eS1pbmRpY2F0b3ItZGltbWVyIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kaW1tZWQpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIiBzdHlsZT1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLm1pbkhlaWdodCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAucG9zaXRpb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNSwgcHJvZ3JhbTUsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRpbW1lZEJnQ29sb3IpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNywgcHJvZ3JhbTcsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblxcblx0PHNwYW4gY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvclxcXCI+XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDksIHByb2dyYW05LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9zcGFuPlxcblxcbjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Zvcm0tZXJyb3InXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuICAgIDxzcGFuPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCh0eXBlb2YgZGVwdGgwID09PSBmdW5jdGlvblR5cGUgPyBkZXB0aDAuYXBwbHkoZGVwdGgwKSA6IGRlcHRoMCkpXG4gICAgKyBcIjwvc3Bhbj5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEubmV3bGluZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgyLCBwcm9ncmFtMiwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCI8YnI+XCI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmVycm9ycyksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2J1dHRvbi1kcm9wZG93bi1tZW51J10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcImRyb3B1cFwiO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5idXR0b25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5idXR0b25MYWJlbCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9idXR0b24+XFxuXHRcdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5idXR0b25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIiBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRyb3Bkb3duTWVudVRvZ2dsZUNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBkYXRhLXRvZ2dsZT1cXFwiZHJvcGRvd25cXFwiIGFyaWEtZXhwYW5kZWQ9XFxcImZhbHNlXFxcIj5cXG5cdFx0XHQ8c3BhbiBjbGFzcz1cXFwiY2FyZXRcXFwiPjwvc3Bhbj5cXG5cdFx0XHQ8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+VG9nZ2xlIERyb3Bkb3duPC9zcGFuPlxcblx0XHQ8L2J1dHRvbj5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW01KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5idXR0b25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIiBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRyb3Bkb3duTWVudVRvZ2dsZUNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBkYXRhLXRvZ2dsZT1cXFwiZHJvcGRvd25cXFwiIGFyaWEtZXhwYW5kZWQ9XFxcImZhbHNlXFxcIj5cXG5cdFx0XHRcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJ1dHRvbkxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXG5cdFx0XHQ8c3BhbiBjbGFzcz1cXFwiY2FyZXRcXFwiPjwvc3Bhbj5cXG5cdFx0XHQ8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+VG9nZ2xlIERyb3Bkb3duPC9zcGFuPlxcblx0XHQ8L2J1dHRvbj5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW03KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kcm9wZG93bk1lbnVDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwiYnRuLWdyb3VwIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kcm9wVXApLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cXG5cdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5zcGxpdEJ1dHRvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0XCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDUsIHByb2dyYW01LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5zcGxpdEJ1dHRvbiksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKGRlcHRoMCAmJiBkZXB0aDAuc3BsaXRCdXR0b24pLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdDx1bCBjbGFzcz1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRyb3Bkb3duTWVudUNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg3LCBwcm9ncmFtNywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+PC91bD5cXG5cXG48L2Rpdj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydicmVhZGNydW1iJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXI7XG4gIGJ1ZmZlciArPSBcIjxhIGhyZWY9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5ocmVmKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmhyZWYpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIjwvYT5cIjtcbiAgfVxuXG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhyZWYpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSk7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhyZWYpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyduby1icmVhZGNydW1icyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2NhbGVuZGFyLW1vbnRobHktZGF5LXZpZXcnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuXHQ8c3BhbiBjbGFzcz1cXFwiY2FsZW5kYXItaGFzLWV2ZW50c1xcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNpcmNsZVxcXCI+PC9pPjwvc3Bhbj5cXG5cIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxzcGFuIGNsYXNzPVxcXCJjYWxlbmRhci1kYXRlXFxcIj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuZGF5KSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmRheSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3NwYW4+XFxuXFxuXCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLmlzIHx8IChkZXB0aDAgJiYgZGVwdGgwLmlzKSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsICgoc3RhY2sxID0gKGRlcHRoMCAmJiBkZXB0aDAuZXZlbnRzKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sZW5ndGgpLCBcIj5cIiwgXCIwXCIsIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJpc1wiLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLmV2ZW50cykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEubGVuZ3RoKSwgXCI+XCIsIFwiMFwiLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2NhbGVuZGFyLW1vbnRobHktdmlldyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJjYWxlbmRhci1tYXN0aGVhZFxcXCI+XFxuXHQ8bmF2IGNsYXNzPVxcXCJjYWxlbmRhci1uYXZpZ2F0aW9uXFxcIj5cXG5cdFx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcImNhbGVuZGFyLW5hdmlnYXRpb24tcHJldlxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWFuZ2xlLWxlZnRcXFwiPjwvaT48L2E+XFxuXHRcdDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJjYWxlbmRhci1uYXZpZ2F0aW9uLW5leHRcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1hbmdsZS1yaWdodFxcXCI+PC9pPjwvYT5cXG5cdDwvbmF2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwiY2FsZW5kYXItaGVhZGVyXFxcIj48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImNhbGVuZGFyLXN1Yi1oZWFkZXJcXFwiPjwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XFxcImNhbGVuZGFyLXZpZXdcXFwiPlxcblx0PGRpdiBjbGFzcz1cXFwiaW5kaWNhdG9yXFxcIj48L2Rpdj5cXG5cXG5cdDx0YWJsZSBjbGFzcz1cXFwiY2FsZW5kYXItbW9udGhseS12aWV3XFxcIj5cXG5cdFx0PHRoZWFkPlxcblx0XHRcdDx0cj5cXG5cdFx0XHRcdDx0aD5TdW48L3RoPlxcblx0XHRcdFx0PHRoPk1vbjwvdGg+XFxuXHRcdFx0XHQ8dGg+VHVlPC90aD5cXG5cdFx0XHRcdDx0aD5XZWQ8L3RoPlxcblx0XHRcdFx0PHRoPlRodXI8L3RoPlxcblx0XHRcdFx0PHRoPkZyaTwvdGg+XFxuXHRcdFx0XHQ8dGg+U2F0PC90aD5cXG5cdFx0XHQ8L3RyPlxcblx0XHQ8L3RoZWFkPlxcblx0XHQ8dGJvZHk+PC90Ym9keT5cXG5cdDwvdGFibGU+XFxuPC9kaXY+XCI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snZm9ybS1jaGVja2JveC1maWVsZCddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBibG9ja0hlbHBlck1pc3Npbmc9aGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8cCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb25DbGFzc05hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNCwgcHJvZ3JhbTQsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9wPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmRlc2NyaXB0aW9uQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaW5wdXRDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdDxsYWJlbCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEubGFiZWxDbGFzc05hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNywgcHJvZ3JhbTcsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI+PGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEudHlwZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBuYW1lPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm5hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEudmFsdWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+PC9sYWJlbD5cXG5cdDwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNyhkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmxhYmVsQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFwiO1xuICBzdGFjazEgPSAoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEub3B0aW9ucykpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSksYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBzdGFjazEsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMCwgcHJvZ3JhbTEwLCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMTAoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXI7XG4gIGJ1ZmZlciArPSBcIlxcblx0PGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5pbnB1dENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0PGxhYmVsIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgyICYmIGRlcHRoMi5sYWJlbENsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMSwgcHJvZ3JhbTExLCBkYXRhLCBkZXB0aDIpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPjxpbnB1dCB0eXBlPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLnR5cGUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5uYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJbXVxcXCIgdmFsdWU9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy52YWx1ZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC52YWx1ZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPiBcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9sYWJlbD5cXG5cdDwvZGl2Plxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0xMShkZXB0aDAsZGF0YSxkZXB0aDMpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDMgJiYgZGVwdGgzLmxhYmVsQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGVzY3JpcHRpb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMywgcHJvZ3JhbTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNiwgcHJvZ3JhbTYsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAub3B0aW9ucyksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg5LCBwcm9ncmFtOSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snYnV0dG9uLWdyb3VwLWl0ZW0nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCI8aSBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pY29uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSk7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snbm8tYnV0dG9uLWdyb3VwLWl0ZW0nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiO1xuXG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydkcm9wZG93bi1tZW51LWl0ZW0nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8YSBocmVmPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhyZWYpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmljb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMiwgcHJvZ3JhbTIsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS52YWx1ZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg0LCBwcm9ncmFtNCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9hPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmljb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+PC9pPiBcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIudmFsdWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW02KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5sYWJlbCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGl2aWRlciksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKGRlcHRoMCAmJiBkZXB0aDAuZGl2aWRlciksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Ryb3Bkb3duLW1lbnUtbm8taXRlbXMnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiO1xuXG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydkcm9wZG93bi1tZW51J10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kcm9wZG93bk1lbnVDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5kcm9wZG93bk1lbnVUb2dnbGVDbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuZHJvcGRvd25NZW51VG9nZ2xlQ2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCIgZGF0YS10b2dnbGU9XFxcImRyb3Bkb3duXFxcIiByb2xlPVxcXCJidXR0b25cXFwiIGFyaWEtaGFzcG9wdXA9XFxcInRydWVcXFwiIGFyaWEtZXhwYW5kZWQ9XFxcImZhbHNlXFxcIj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMudG9nZ2xlTGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAudG9nZ2xlTGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiIDxpIGNsYXNzPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuZHJvcGRvd25NZW51VG9nZ2xlSWNvbkNsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5kcm9wZG93bk1lbnVUb2dnbGVJY29uQ2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCI+PC9pPjwvYT5cXG5cXG48dWwgY2xhc3M9XFxcIlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kcm9wZG93bk1lbnVDbGFzc05hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPjwvdWw+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snZm9ybS1saWdodC1zd2l0Y2gtZmllbGQnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXIpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxsYWJlbCBmb3I9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaWQpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubGFiZWxDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5sYWJlbCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9sYWJlbD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PHAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5kZXNjcmlwdGlvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW04KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5hY3RpdmVDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRlc2NyaXB0aW9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDUsIHByb2dyYW01LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuPGRpdiBjbGFzcz1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmlucHV0Q2xhc3NOYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmlucHV0Q2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIiBcIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDgsIHByb2dyYW04LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC52YWx1ZSksIDEsIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJpc1wiLCAoZGVwdGgwICYmIGRlcHRoMC52YWx1ZSksIDEsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiPlxcblx0PGRpdiBjbGFzcz1cXFwibGlnaHQtc3dpdGNoLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxpZ2h0LXN3aXRjaC1sYWJlbCBvblxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxpZ2h0LXN3aXRjaC1oYW5kbGVcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsaWdodC1zd2l0Y2gtbGFiZWwgb2ZmXFxcIj48L2Rpdj5cXG5cdDwvZGl2PlxcbjwvZGl2PlxcblxcbjxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5uYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLm5hbWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiB2YWx1ZT1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnZhbHVlKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnZhbHVlKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCIgaWQ9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5pZCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2lubGluZS1lZGl0b3InXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiaW5saW5lLWVkaXRvci1sYWJlbFxcXCI+PC9kaXY+XFxuXFxuPGkgY2xhc3M9XFxcImZhIGZhLXBlbmNpbCBpbmxpbmUtZWRpdG9yLWVkaXQtaWNvblxcXCI+PC9pPlxcblxcbjxkaXYgY2xhc3M9XFxcImlubGluZS1lZGl0b3ItZmllbGRcXFwiPjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XFxcImlubGluZS1lZGl0b3ItYWN0aXZpdHktaW5kaWNhdG9yXFxcIj48L2Rpdj5cIjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydmb3JtLWlucHV0LWZpZWxkJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXIpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxsYWJlbCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEuaWQpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNCwgcHJvZ3JhbTQsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubGFiZWwpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiaWQ9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuaWQpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmxhYmVsQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTgoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxwIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbkNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg5LCBwcm9ncmFtOSwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3A+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuZGVzY3JpcHRpb25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJuYW1lPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm5hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJpZD1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pZCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRlc2NyaXB0aW9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDgsIHByb2dyYW04LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuPGlucHV0IHR5cGU9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy50eXBlKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnR5cGUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMSwgcHJvZ3JhbTExLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pZCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMywgcHJvZ3JhbTEzLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIGNsYXNzPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaW5wdXRDbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaW5wdXRDbGFzc05hbWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiAvPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2xpc3QtZ3JvdXAtaXRlbSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PHNwYW4gY2xhc3M9XFxcImJhZGdlXFxcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJhZGdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3NwYW4+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5iYWRnZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5jb250ZW50KSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ25vLWxpc3QtZ3JvdXAtaXRlbSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCJObyBpdGVtcyBmb3VuZC5cIjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydtb2RhbC13aW5kb3cnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGJsb2NrSGVscGVyTWlzc2luZz1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlcjtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8aDMgY2xhc3M9XFxcIm1vZGFsLWhlYWRlclxcXCI+XCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmhlYWRlcikgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9oMz5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnM7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJtb2RhbC1idXR0b25zXFxcIj5cXG5cdFx0XCI7XG4gIG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDQsIHByb2dyYW00LCBkYXRhKSxkYXRhOmRhdGF9XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmJ1dHRvbnMpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCBvcHRpb25zKTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuYnV0dG9ucyk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwgb3B0aW9ucykgOiBoZWxwZXI7IH1cbiAgaWYgKCFoZWxwZXJzLmJ1dHRvbnMpIHsgc3RhY2sxID0gYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBzdGFjazEsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg0LCBwcm9ncmFtNCwgZGF0YSksZGF0YTpkYXRhfSk7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L2Rpdj5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHQ8YSBocmVmPVxcXCJcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaHJlZiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg1LCBwcm9ncmFtNSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCIgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5jbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDcsIHByb2dyYW03LCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaWNvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg5LCBwcm9ncmFtOSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnRleHQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAudGV4dCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKTtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9hPlxcblx0XHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhyZWYpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW03KGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXI7XG4gIGJ1ZmZlciArPSBcImlkPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaWQpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPHNwYW4gY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaWNvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48L3NwYW4+IFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwibW9kYWwtd2luZG93XFxcIj5cXG5cdDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJtb2RhbC1jbG9zZVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzLWNpcmNsZVxcXCI+PC9pPjwvYT5cXG5cXG5cdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJtb2RhbC1jb250ZW50IGNsZWFyZml4XFxcIj48L2Rpdj5cXG5cXG5cdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5idXR0b25zKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDMsIHByb2dyYW0zLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ25vLW9yZGVyZWQtbGlzdC1pdGVtJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBpZiAoaGVscGVyID0gaGVscGVycy5tZXNzYWdlKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLm1lc3NhZ2UpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgcmV0dXJuIHN0YWNrMTsgfVxuICBlbHNlIHsgcmV0dXJuICcnOyB9XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snb3JkZXJlZC1saXN0LWl0ZW0nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyByZXR1cm4gc3RhY2sxOyB9XG4gIGVsc2UgeyByZXR1cm4gJyc7IH1cbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydwYWdlciddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEucHJldkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGxpIGNsYXNzPVxcXCJwYWdlLXRvdGFsc1xcXCI+UGFnZSBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnBhZ2UpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIiBvZiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEudG90YWxQYWdlcyksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg0LCBwcm9ncmFtNCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvbGk+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTQoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLnRvdGFsUGFnZXMpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW02KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5uZXh0Q2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjx1bCBjbGFzcz1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnBhZ2VyQ2xhc3NOYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnBhZ2VyQ2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCI+XFxuXHQ8bGkgY2xhc3M9XFxcIlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5zbmFwVG9FZGdlcyksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcInByZXYtcGFnZVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWxvbmctYXJyb3ctbGVmdFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvaT4gXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnByZXZMYWJlbCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5wcmV2TGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaW5jbHVkZVBhZ2VUb3RhbHMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMywgcHJvZ3JhbTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDxsaSBjbGFzcz1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLnNuYXBUb0VkZ2VzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj48YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwibmV4dC1wYWdlXFxcIj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubmV4dExhYmVsKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLm5leHRMYWJlbCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCIgPGkgY2xhc3M9XFxcImZhIGZhLWxvbmctYXJyb3ctcmlnaHRcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L2k+PC9hPjwvbGk+XFxuPC91bD5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydub3RpZmljYXRpb24nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyO1xuICBidWZmZXIgKz0gXCJcXG5cdDxkaXYgY2xhc3M9XFxcImNvbC1zbS0yXFxcIj5cXG5cdFx0PGkgY2xhc3M9XFxcImZhIGZhLVwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5pY29uKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmljb24pOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiIGljb25cXFwiPjwvaT5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiY29sLWxnLTEwXFxcIj5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLnRpdGxlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDIsIHByb2dyYW0yLCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5tZXNzYWdlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDQsIHByb2dyYW00LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHQ8L2Rpdj5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIjxoMz5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLnRpdGxlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L2gzPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPHA+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5tZXNzYWdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3A+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxkaXYgY2xhc3M9XFxcImNvbC1sZy0xMlxcXCI+XFxuXHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS50aXRsZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgyLCBwcm9ncmFtMiwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEubWVzc2FnZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg0LCBwcm9ncmFtNCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC9kaXY+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzLWNpcmNsZVxcXCI+PC9pPjwvYT5cXG5cXG48ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcblxcblx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmljb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdFwiO1xuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg2LCBwcm9ncmFtNiwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaWNvbiksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKGRlcHRoMCAmJiBkZXB0aDAuaWNvbiksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3BhZ2luYXRpb24taXRlbSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnM7XG4gIGJ1ZmZlciArPSBcIlxcblx0PGEgaHJlZj1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmhyZWYpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMiwgcHJvZ3JhbTIsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5ub3QgfHwgKGRlcHRoMSAmJiBkZXB0aDEubm90KSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg0LCBwcm9ncmFtNCwgZGF0YSksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmhyZWYpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDEgJiYgZGVwdGgxLmhyZWYpLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiIGRhdGEtcGFnZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5wYWdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEucGFnZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9hPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuaHJlZikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTQoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCIjXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdDxhPiZoZWxsaXA7PC9hPlxcblwiO1xuICB9XG5cbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRpdmlkZXIpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLmRpdmlkZXIpLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGl2aWRlciksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg2LCBwcm9ncmFtNiwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3BhZ2luYXRpb24nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cblxuICBidWZmZXIgKz0gXCI8dWwgY2xhc3M9XFxcInBhZ2luYXRpb24gXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnBhZ2luYXRpb25DbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAucGFnaW5hdGlvbkNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcblx0PGxpPlxcblx0XHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwicHJldi1wYWdlXFxcIiBhcmlhLWxhYmVsPVxcXCJQcmV2aW91c1xcXCI+XFxuXHRcdFx0PHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPiZsYXF1bzs8L3NwYW4+XFxuXHRcdDwvYT5cXG5cdDwvbGk+XFxuICAgIDxsaT5cXG5cdFx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIm5leHQtcGFnZVxcXCIgYXJpYS1sYWJlbD1cXFwiTmV4dFxcXCI+XFxuXHRcdFx0PHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPiZyYXF1bzs8L3NwYW4+XFxuXHRcdDwvYT5cXG4gICAgPC9saT5cXG48L3VsPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3Byb2dyZXNzLWJhciddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5wcm9ncmVzc0JhckNsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5wcm9ncmVzc0JhckNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIHJvbGU9XFxcInByb2dyZXNzYmFyXFxcIiBhcmlhLXZhbHVlbm93PVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMucHJvZ3Jlc3MpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAucHJvZ3Jlc3MpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiBhcmlhLXZhbHVlbWluPVxcXCIwXFxcIiBhcmlhLXZhbHVlbWF4PVxcXCIxMDBcXFwiIHN0eWxlPVxcXCJ3aWR0aDogXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnByb2dyZXNzKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnByb2dyZXNzKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIiU7XFxcIj5cXG5cdDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMucHJvZ3Jlc3MpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAucHJvZ3Jlc3MpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiJSBDb21wbGV0ZTwvc3Bhbj5cXG48L2Rpdj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydmb3JtLXJhZGlvLWZpZWxkJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGJsb2NrSGVscGVyTWlzc2luZz1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXIpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxwIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbkNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg0LCBwcm9ncmFtNCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3A+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuZGVzY3JpcHRpb25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNihkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pbnB1dENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0PGxhYmVsIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5sYWJlbENsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg3LCBwcm9ncmFtNywgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj48aW5wdXQgdHlwZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS50eXBlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIG5hbWU9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS52YWx1ZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48L2xhYmVsPlxcblx0PC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW03KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIubGFiZWxDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtOShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XCI7XG4gIHN0YWNrMSA9ICgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5vcHRpb25zKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKSxibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEwLCBwcm9ncmFtMTAsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSkpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0xMChkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlcjtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmlucHV0Q2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlxcblx0XHQ8bGFiZWwgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDIgJiYgZGVwdGgyLmxhYmVsQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDExLCBwcm9ncmFtMTEsIGRhdGEsIGRlcHRoMiksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI+PGlucHV0IHR5cGU9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIudHlwZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBuYW1lPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLm5hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIltdXFxcIiB2YWx1ZT1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnZhbHVlKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnZhbHVlKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCI+IFwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L2xhYmVsPlxcblx0PC9kaXY+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTExKGRlcHRoMCxkYXRhLGRlcHRoMykge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMyAmJiBkZXB0aDMubGFiZWxDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhlYWRlciksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kZXNjcmlwdGlvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblwiO1xuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg2LCBwcm9ncmFtNiwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAub3B0aW9ucyksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKGRlcHRoMCAmJiBkZXB0aDAub3B0aW9ucyksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDksIHByb2dyYW05LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydyYW5nZS1zbGlkZXInXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwic2xpZGVyXFxcIj48L2Rpdj5cIjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydmb3JtLXNlbGVjdC1maWVsZCddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYmxvY2tIZWxwZXJNaXNzaW5nPWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8bGFiZWwgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmlkKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDQsIHByb2dyYW00LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5sYWJlbENsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg2LCBwcm9ncmFtNiwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImlkPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmlkKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5sYWJlbENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW04KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8cCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb25DbGFzc05hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOSwgcHJvZ3JhbTksIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9wPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtOShkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmRlc2NyaXB0aW9uQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTExKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwibmFtZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5uYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTEzKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiaWQ9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaWQpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTUoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJtdWx0aXBsZVwiO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xNyhkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zO1xuICBidWZmZXIgKz0gXCJcXG5cdDxvcHRpb24gXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLnZhbHVlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDE4LCBwcm9ncmFtMTgsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLnNlbGVjdGVkKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIwLCBwcm9ncmFtMjAsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgyMiwgcHJvZ3JhbTIyLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMjQsIHByb2dyYW0yNCwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9vcHRpb24+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0xOChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcInZhbHVlPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnZhbHVlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTIwKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwic2VsZWN0ZWRcIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMjIoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICBzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IHJldHVybiBzdGFjazE7IH1cbiAgZWxzZSB7IHJldHVybiAnJzsgfVxuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0yNChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEudmFsdWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgcmV0dXJuIHN0YWNrMTsgfVxuICBlbHNlIHsgcmV0dXJuICcnOyB9XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMywgcHJvZ3JhbTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGVzY3JpcHRpb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOCwgcHJvZ3JhbTgsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG48c2VsZWN0IFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5uYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDExLCBwcm9ncmFtMTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEzLCBwcm9ncmFtMTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5pbnB1dENsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5tdWx0aXBsZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxNSwgcHJvZ3JhbTE1LCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cXG5cIjtcbiAgb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMTcsIHByb2dyYW0xNywgZGF0YSksZGF0YTpkYXRhfVxuICBpZiAoaGVscGVyID0gaGVscGVycy5vcHRpb25zKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwgb3B0aW9ucyk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpIDogaGVscGVyOyB9XG4gIGlmICghaGVscGVycy5vcHRpb25zKSB7IHN0YWNrMSA9IGJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgc3RhY2sxLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMTcsIHByb2dyYW0xNywgZGF0YSksZGF0YTpkYXRhfSk7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvc2VsZWN0PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3NlbGVjdGlvbi1wb29sLXRyZWUtbm9kZSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcbiAgICA8dWwgY2xhc3M9XFxcImNoaWxkcmVuXFxcIj48L3VsPlxcblwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGkgY2xhc3M9XFxcImZhIGZhLWJhcnMgZHJhZy1oYW5kbGVcXFwiPjwvaT4gPHNwYW4gY2xhc3M9XFxcIm5vZGUtbmFtZVxcXCI+XCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3NwYW4+XFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhhc0NoaWxkcmVuKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3NlbGVjdGlvbi1wb29sJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImhlaWdodDpcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlaWdodCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiO1wiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwicm93IHNlbGVjdGlvbi1wb29sLXNlYXJjaFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS0xMlxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWxlY3Rpb24tcG9vbC1zZWFyY2gtZmllbGRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInNlbGVjdGlvbi1wb29sLXNlYXJjaC1hY3Rpdml0eVxcXCI+PC9kaXY+XFxuICAgICAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcInNlbGVjdGlvbi1wb29sLXNlYXJjaC1jbGVhclxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzLWNpcmNsZVxcXCI+PC9pPjwvYT5cXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgdmFsdWU9XFxcIlxcXCIgcGxhY2Vob2xkZXI9XFxcIkVudGVyIGtleXdvcmRzIHRvIHNlYXJjaCB0aGUgbGlzdFxcXCIgY2xhc3M9XFxcInNlYXJjaCBmb3JtLWNvbnRyb2xcXFwiPlxcbiAgICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XFxcInJvdyBzZWxlY3Rpb24tcG9vbC1saXN0c1xcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS02XFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImF2YWlsYWJsZS1wb29sIGRyb3BwYWJsZS1wb29sXFxcIiBkYXRhLWFjY2VwdD1cXFwiLnNlbGVjdGVkLXBvb2wgLmRyYWdnYWJsZS10cmVlLW5vZGVcXFwiIHN0eWxlPVxcXCJcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVpZ2h0KSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS02XFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInNlbGVjdGVkLXBvb2wgZHJvcHBhYmxlLXBvb2xcXFwiIGRhdGEtYWNjZXB0PVxcXCIuYXZhaWxhYmxlLXBvb2wgLmRyYWdnYWJsZS10cmVlLW5vZGVcXFwiIHN0eWxlPVxcXCJcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVpZ2h0KSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuPC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1sndGFibGUtYWN0aXZpdHktaW5kaWNhdG9yLXJvdyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJzdHlsZT1cXFwiaGVpZ2h0OlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVpZ2h0KSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJweFxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjx0ZCBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLXJvd1xcXCIgY29sc3Bhbj1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLmNvbHVtbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmxlbmd0aCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVpZ2h0KSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlxcblxcblx0PGRpdiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWRpbW1lclxcXCI+XFxuXHRcdFxcblx0XHQ8c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yXFxcIj48L3NwYW4+XFxuXFxuXHQ8L2Rpdj5cXG5cXG48L3RkPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3RhYmxlLW5vLWl0ZW1zJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG5cbiAgYnVmZmVyICs9IFwiPHRkIGNvbHNwYW49XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5jb2x1bW5zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sZW5ndGgpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5tZXNzYWdlKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcbjwvdGQ+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1sndGFibGUtdmlldy1mb290ZXInXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS50b3RhbFBhZ2VzKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEucGFnZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGQgY29sc3Bhbj1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLmNvbHVtbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmxlbmd0aCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwicGFnZS10b3RhbHNcXFwiPlxcbiAgICBQYWdlIFwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5wYWdlKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnBhZ2UpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiIG9mIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC50b3RhbFBhZ2VzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMywgcHJvZ3JhbTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLnRvdGFsUGFnZXMpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLnRvdGFsUGFnZXMpLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L3RkPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3RhYmxlLXZpZXctZ3JvdXAnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGJsb2NrSGVscGVyTWlzc2luZz1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG48ZGl2IGNsYXNzPVxcXCJidXR0b25zLXdyYXBwZXIgcHVsbC1yaWdodFxcXCI+XFxuXHRcIjtcbiAgc3RhY2sxID0gKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJ1dHRvbnMpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpLGJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgc3RhY2sxLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMiwgcHJvZ3JhbTIsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSkpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGEgaHJlZj1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmhyZWYpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaHJlZik7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIGNsYXNzPVxcXCJcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNSwgcHJvZ3JhbTUsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaWNvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg3LCBwcm9ncmFtNywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9hPlxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5jbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW01KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5idXR0b25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW03KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPGkgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaWNvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48L2k+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZykpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlckNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlcikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZykpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb25UYWcpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb25UYWcpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnM7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDx0aCBzY29wZT1cXFwiY29sXFxcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAud2lkdGgpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTQsIHByb2dyYW0xNCwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBjbGFzcz1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDE2LCBwcm9ncmFtMTYsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwgKGRlcHRoMSAmJiBkZXB0aDEub3JkZXIpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwiaXNcIiwgKGRlcHRoMCAmJiBkZXB0aDAuaWQpLCAoZGVwdGgxICYmIGRlcHRoMS5vcmRlciksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+XFxuXHRcdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaWQpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTgsIHByb2dyYW0xOCwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdFx0XCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDIwLCBwcm9ncmFtMjAsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC5pZCksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDwvdGg+XFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMTQoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJ3aWR0aD1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS53aWR0aCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xNihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcInNvcnQtXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5zb3J0KSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTgoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI1xcXCIgZGF0YS1pZD1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pZCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwic29ydFxcXCI+XCI7XG4gIHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvYT5cXG5cdFx0XHRcdFx0PGkgY2xhc3M9XFxcInNvcnQtaWNvbiBhc2MgZmEgZmEtc29ydC1hc2NcXFwiPjwvaT5cXG5cdFx0XHRcdFx0PGkgY2xhc3M9XFxcInNvcnQtaWNvbiBkZXNjIGZhIGZhLXNvcnQtZGVzY1xcXCI+PC9pPlxcblx0XHRcdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTIwKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdFx0XHRcdFwiO1xuICBzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm5hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5idXR0b25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sZW5ndGgpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDksIHByb2dyYW05LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRlc2NyaXB0aW9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDExLCBwcm9ncmFtMTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG48dGFibGUgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy50YWJsZUNsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC50YWJsZUNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcblx0PHRoZWFkPlxcblx0XHQ8dHI+XFxuXHRcdFwiO1xuICBvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMywgcHJvZ3JhbTEzLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5jb2x1bW5zKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCBvcHRpb25zKSA6IGhlbHBlcjsgfVxuICBpZiAoIWhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEzLCBwcm9ncmFtMTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L3RyPlxcblx0PC90aGVhZD5cXG5cdDx0Ym9keT48L3Rib2R5Plxcblx0PHRmb290PjwvdGZvb3Q+XFxuPC90YWJsZT5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd0YWJsZS12aWV3LXBhZ2luYXRpb24nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdj48L2Rpdj5cIjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd0YWJsZS12aWV3LXJvdyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIHNlbGY9dGhpcywgYmxvY2tIZWxwZXJNaXNzaW5nPWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucztcbiAgYnVmZmVyICs9IFwiXFxuXHQ8dGQgZGF0YS1pZD1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmlkKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmlkKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKGhlbHBlciA9IGhlbHBlcnMucHJvcGVydHlPZiB8fCAoZGVwdGgxICYmIGRlcHRoMS5wcm9wZXJ0eU9mKSxvcHRpb25zPXtoYXNoOnt9LGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCBkZXB0aDEsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcInByb3BlcnR5T2ZcIiwgZGVwdGgxLCAoZGVwdGgwICYmIGRlcHRoMC5pZCksIG9wdGlvbnMpKSlcbiAgICArIFwiPC90ZD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5jb2x1bW5zKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCBvcHRpb25zKSA6IGhlbHBlcjsgfVxuICBpZiAoIWhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgcmV0dXJuIHN0YWNrMTsgfVxuICBlbHNlIHsgcmV0dXJuICcnOyB9XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1sndGFiLWNvbnRlbnQnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyByZXR1cm4gc3RhY2sxOyB9XG4gIGVsc2UgeyByZXR1cm4gJyc7IH1cbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd0YWJzJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjwhLS0gTmF2IHRhYnMgLS0+XFxuPHVsIGNsYXNzPVxcXCJuYXYgbmF2LXRhYnNcXFwiIHJvbGU9XFxcInRhYmxpc3RcXFwiPjwvdWw+XFxuXFxuPCEtLSBUYWIgcGFuZXMgLS0+XFxuPGRpdiBjbGFzcz1cXFwidGFiLWNvbnRlbnRcXFwiPlxcbjwvZGl2PlwiO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Zvcm0tdGV4dGFyZWEtZmllbGQnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZ05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlcikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZ05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PGxhYmVsIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5pZCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg0LCBwcm9ncmFtNCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEubGFiZWxDbGFzc05hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNiwgcHJvZ3JhbTYsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5sYWJlbCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9sYWJlbD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTQoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJpZD1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5pZCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW02KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIubGFiZWxDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtOChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PHAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDksIHByb2dyYW05LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5kZXNjcmlwdGlvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIm5hbWU9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xMyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImlkPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmlkKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMywgcHJvZ3JhbTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGVzY3JpcHRpb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOCwgcHJvZ3JhbTgsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG48dGV4dGFyZWEgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLm5hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTEsIHByb2dyYW0xMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaWQpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTMsIHByb2dyYW0xMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBjbGFzcz1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmlucHV0Q2xhc3NOYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmlucHV0Q2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCI+PC90ZXh0YXJlYT5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyduby11bm9yZGVyZWQtbGlzdC1pdGVtJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBpZiAoaGVscGVyID0gaGVscGVycy5tZXNzYWdlKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLm1lc3NhZ2UpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgcmV0dXJuIHN0YWNrMTsgfVxuICBlbHNlIHsgcmV0dXJuICcnOyB9XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1sndW5vcmRlcmVkLWxpc3QtaXRlbSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuY29udGVudCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IHJldHVybiBzdGFjazE7IH1cbiAgZWxzZSB7IHJldHVybiAnJzsgfVxuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2RyYWdnYWJsZS10cmVlLXZpZXctbm9kZSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuXG4gIGJ1ZmZlciArPSBcIjxpIGNsYXNzPVxcXCJmYSBmYS1iYXJzIGRyYWctaGFuZGxlXFxcIj48L2k+XFxuXFxuPGRpdiBjbGFzcz1cXFwibm9kZS1uYW1lXFxcIj5cXG4gICAgPHNwYW4+XCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLm5hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3NwYW4+XFxuPC9kaXY+XFxuXFxuPHVsIGNsYXNzPVxcXCJjaGlsZHJlblxcXCI+PC91bD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd0cmVlLXZpZXctbm9kZSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcbiAgICA8dWwgY2xhc3M9XFxcImNoaWxkcmVuXFxcIj48L3VsPlxcblwiO1xuICB9XG5cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5uYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oYXNDaGlsZHJlbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd3aXphcmQtYnV0dG9ucyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRpc2FibGVkQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJhY2tJY29uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJ0eXBlPVxcXCJidXR0b25cXFwiXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTcoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJ0eXBlPVxcXCJzdWJtaXRcXFwiXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlZmF1bHRCdXR0b25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIiBuZXh0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTExKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5wcmltYXJ5QnV0dG9uQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCIgZmluaXNoXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTEzKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5uZXh0TGFiZWwpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5uZXh0SWNvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxNCwgcHJvZ3JhbTE0LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTE0KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiIDxpIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLm5leHRJY29uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvaT5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTYoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmZpbmlzaExhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRpc2FibGVCYWNrQnV0dG9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5kZWZhdWx0QnV0dG9uQ2xhc3NOYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmRlZmF1bHRCdXR0b25DbGFzc05hbWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiIFwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5idXR0b25TaXplQ2xhc3NOYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmJ1dHRvblNpemVDbGFzc05hbWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiIGJhY2sgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlzRmlyc3RTdGVwKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG4gICAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmJhY2tJY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuYmFja0xhYmVsKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmJhY2tMYWJlbCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG48L2J1dHRvbj5cXG5cXG48YnV0dG9uIFwiO1xuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg1LCBwcm9ncmFtNSwgZGF0YSksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlzTGFzdFN0ZXApLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLmlzTGFzdFN0ZXApLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlzTGFzdFN0ZXApLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNywgcHJvZ3JhbTcsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIGNsYXNzPVxcXCJcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGlzYWJsZU5leHRCdXR0b24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDksIHByb2dyYW05LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pc0xhc3RTdGVwKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC5pc0xhc3RTdGVwKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pc0xhc3RTdGVwKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDExLCBwcm9ncmFtMTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmJ1dHRvblNpemVDbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuYnV0dG9uU2l6ZUNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcbiAgICBcIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTMsIHByb2dyYW0xMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaXNMYXN0U3RlcCksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKGRlcHRoMCAmJiBkZXB0aDAuaXNMYXN0U3RlcCksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlzTGFzdFN0ZXApLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTYsIHByb2dyYW0xNiwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvYnV0dG9uPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3dpemFyZC1lcnJvciddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCI8XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWcpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlcikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZykpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLWVycm9yLWljb25cXFwiPjxpIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmVycm9ySWNvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48L2k+PC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm1lc3NhZ2UpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmVycm9ySWNvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5tZXNzYWdlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDUsIHByb2dyYW01LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snd2l6YXJkLXByb2dyZXNzJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBibG9ja0hlbHBlck1pc3Npbmc9aGVscGVycy5ibG9ja0hlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zO1xuICBidWZmZXIgKz0gXCJcXG4gICAgPGEgY2xhc3M9XFxcIndpemFyZC1zdGVwIFwiO1xuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgyLCBwcm9ncmFtMiwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5jb21wbGV0ZSksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5jb21wbGV0ZSksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5jb21wbGV0ZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg0LCBwcm9ncmFtNCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCIgZGF0YS1zdGVwPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAmJiBkZXB0aDAub3B0aW9ucykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEuc3RlcCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS50aXRsZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg2LCBwcm9ncmFtNiwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cXG4gICAgICAgIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmxhYmVsKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDgsIHByb2dyYW04LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuICAgICAgICBcIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTAsIHByb2dyYW0xMCwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sYWJlbCksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sYWJlbCksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbiAgICA8L2E+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5kaXNhYmxlZENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTQoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmNvbXBsZXRlQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNihkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcInRpdGxlPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEub3B0aW9ucykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEudGl0bGUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtOChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJ3aXphcmQtc3RlcC1sYWJlbFxcXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3NwYW4+XFxuICAgICAgICBcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTAoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG4gICAgICAgICAgICBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS50aXRsZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMSwgcHJvZ3JhbTExLCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuICAgICAgICBcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTExKGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJ3aXphcmQtc3RlcC1sYWJlbFxcXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLnRpdGxlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3NwYW4+XFxuICAgICAgICAgICAgXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtcHJvZ3Jlc3MtYmFyXFxcIj5cXG5cIjtcbiAgb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfVxuICBpZiAoaGVscGVyID0gaGVscGVycy5zdGVwcykgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5zdGVwcyk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwgb3B0aW9ucykgOiBoZWxwZXI7IH1cbiAgaWYgKCFoZWxwZXJzLnN0ZXBzKSB7IHN0YWNrMSA9IGJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgc3RhY2sxLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3dpemFyZC1zdWNjZXNzJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIjxcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZykpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtc3VjY2Vzcy1pY29uXFxcIj48aSBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5zdWNjZXNzSWNvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48L2k+PC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm1lc3NhZ2UpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLnN1Y2Nlc3NJY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLm1lc3NhZ2UpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNSwgcHJvZ3JhbTUsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd3aXphcmQnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuPGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5wYW5lbENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwicGFuZWwtYm9keVxcXCI+XFxuICAgIFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuICAgICAgICAgICAgPFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XFxuICAgICAgICBcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcbiAgICAgICAgICAgIDxwPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvcD5cXG4gICAgICAgIFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW03KGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ3aXphcmQtYnV0dG9uc1xcXCI+PC9kaXY+XFxuPC9kaXY+XFxuXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG48ZGl2IGNsYXNzPVxcXCJ3aXphcmQtYnV0dG9uc1xcXCI+PC9kaXY+XFxuXCI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5wYW5lbCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcbiAgICAgICAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhlYWRlciksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwid2l6YXJkLXByb2dyZXNzXFxcIj48L2Rpdj5cXG5cXG4gICAgICAgIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kZXNjcmlwdGlvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg1LCBwcm9ncmFtNSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwid2l6YXJkLWNvbnRlbnRcXFwiPjwvZGl2PlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5wYW5lbCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg3LCBwcm9ncmFtNywgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oOSwgcHJvZ3JhbTksIGRhdGEpLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5wYW5lbCksIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJub3RcIiwgKGRlcHRoMCAmJiBkZXB0aDAucGFuZWwpLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7IiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnaGFuZGxlYmFycycpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuSGFuZGxlYmFyc0hlbHBlcnNSZWdpc3RyeSA9IGZhY3Rvcnkocm9vdC5IYW5kbGViYXJzKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG5cbiAgICB2YXIgaXNBcnJheSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICB2YXIgRXhwcmVzc2lvblJlZ2lzdHJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZXhwcmVzc2lvbnMgPSBbXTtcbiAgICB9O1xuXG4gICAgRXhwcmVzc2lvblJlZ2lzdHJ5LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAob3BlcmF0b3IsIG1ldGhvZCkge1xuICAgICAgICB0aGlzLmV4cHJlc3Npb25zW29wZXJhdG9yXSA9IG1ldGhvZDtcbiAgICB9O1xuXG4gICAgRXhwcmVzc2lvblJlZ2lzdHJ5LnByb3RvdHlwZS5jYWxsID0gZnVuY3Rpb24gKG9wZXJhdG9yLCBsZWZ0LCByaWdodCkge1xuICAgICAgICBpZiAoICEgdGhpcy5leHByZXNzaW9ucy5oYXNPd25Qcm9wZXJ0eShvcGVyYXRvcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBvcGVyYXRvciBcIicrb3BlcmF0b3IrJ1wiJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5leHByZXNzaW9uc1tvcGVyYXRvcl0obGVmdCwgcmlnaHQpO1xuICAgIH07XG5cbiAgICB2YXIgZVIgPSBuZXcgRXhwcmVzc2lvblJlZ2lzdHJ5KCk7XG4gICAgZVIuYWRkKCdub3QnLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCAhPSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJz4nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPCcsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0IDwgcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc+PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ID49IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPD0nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA8PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJz09JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPT0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc9PT0nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCchPT0nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCAhPT0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCdpbicsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIGlmICggISBpc0FycmF5KHJpZ2h0KSkge1xuICAgICAgICAgICAgcmlnaHQgPSByaWdodC5zcGxpdCgnLCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByaWdodC5pbmRleE9mKGxlZnQpICE9PSAtMTtcbiAgICB9KTtcblxuICAgIHZhciBpc0hlbHBlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIGxlZnQgPSBhcmdzWzBdLFxuICAgICAgICAgICAgb3BlcmF0b3IgPSBhcmdzWzFdLFxuICAgICAgICAgICAgcmlnaHQgPSBhcmdzWzJdLFxuICAgICAgICAgICAgb3B0aW9ucyA9IGFyZ3NbM107XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmdzWzFdO1xuICAgICAgICAgICAgaWYgKGxlZnQpIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAzKSB7XG4gICAgICAgICAgICByaWdodCA9IGFyZ3NbMV07XG4gICAgICAgICAgICBvcHRpb25zID0gYXJnc1syXTtcbiAgICAgICAgICAgIGlmIChsZWZ0ID09IHJpZ2h0KSByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZVIuY2FsbChvcGVyYXRvciwgbGVmdCwgcmlnaHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgIH07XG5cbiAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpcycsIGlzSGVscGVyKTtcblxuICAgIC8qXG4gICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbmwyYnInLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHZhciBubDJiciA9ICh0ZXh0ICsgJycpLnJlcGxhY2UoLyhbXj5cXHJcXG5dPykoXFxyXFxufFxcblxccnxcXHJ8XFxuKS9nLCAnJDEnICsgJzxicj4nICsgJyQyJyk7XG4gICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKG5sMmJyKTtcbiAgICB9KTtcblxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhbJ1ZhbHVlczonXS5jb25jYXQoXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDAsIC0xKVxuICAgICAgICApKTtcbiAgICB9KTtcblxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2RlYnVnJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb250ZXh0OicsIHRoaXMpO1xuICAgICAgICBjb25zb2xlLmxvZyhbJ1ZhbHVlczonXS5jb25jYXQoXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDAsIC0xKVxuICAgICAgICApKTtcbiAgICB9KTtcblx0Ki9cblxuICAgIHJldHVybiBlUjtcblxufSkpOyIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydoYW5kbGViYXJzJywgJ3VuZGVyc2NvcmUnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5IYW5kbGViYXJzSGVscGVyc1JlZ2lzdHJ5ID0gZmFjdG9yeShyb290LkhhbmRsZWJhcnMsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoSGFuZGxlYmFycywgXykge1xuXG4gICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbm90JywgZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcbiAgICBcdHJldHVybiAhdmFsdWUgfHwgdmFsdWUgPT0gMCA/IG9wdGlvbnMuZm4odmFsdWUpIDogZmFsc2U7XG4gICAgfSk7XG4gICAgXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdoYW5kbGViYXJzJykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2hhbmRsZWJhcnMnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5IYW5kbGViYXJzSGVscGVyc1JlZ2lzdHJ5ID0gZmFjdG9yeShyb290LkhhbmRsZWJhcnMpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKEhhbmRsZWJhcnMpIHtcblxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3Byb3BlcnR5T2YnLCBmdW5jdGlvbihvYmplY3QsIHByb3ApIHtcbiAgICAgICAgaWYob2JqZWN0Lmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhvYmplY3RbcHJvcF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZScsICdiYWNrYm9uZS5tYXJpb25ldHRlJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lLCBNYXJpb25ldHRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXG4gICAgVG9vbGJveC5UcmVlID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG4gICAgICAgIGhhc1Jlc2V0T25jZTogZmFsc2UsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wYXJhdG9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uQ2xhc3M6IEJhY2tib25lLkNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDb2xsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpZEF0dHJpYnV0ZTogJ2lkJyxcbiAgICAgICAgICAgICAgICBwYXJlbnRBdHRyaWJ1dGU6ICdwYXJlbnRfaWQnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIEJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBbXSwgdGhpcy5vcHRpb25zID0gb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFRvb2xib3guT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMpO1xuXG4gICAgICAgICAgICBpZighdGhpcy5nZXRPcHRpb24oJ29yaWdpbmFsQ29sbGVjdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9yaWdpbmFsQ29sbGVjdGlvbiA9IGNvbGxlY3Rpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMudGVtcGxhdGUgJiYgIXRoaXMuZ2V0T3B0aW9uKCdjaGlsZFZpZXdPcHRpb25zJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuY2hpbGRWaWV3T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uKCdhZnRlcjppbml0aWFsaXplJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idWlsZFRyZWUoY29sbGVjdGlvbik7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBIYWNrIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IENvbGxlY3Rpb24gZnVuY3Rpb25hbGl0eVxuICAgICAgICAgICAgLy8gaW5oZXJpdGVkIGJ5IHRoZSBwcm90b3R5cGUuXG4gICAgICAgICAgICBpZighdGhpcy5oYXNSZXNldE9uY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1Jlc2V0T25jZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdhZnRlcjppbml0aWFsaXplJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBCYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5yZXNldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkVHJlZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuXG4gICAgICAgICAgICBpZihkYXRhLnRvSlNPTikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvSlNPTigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fY3JlYXRlQ29sbGVjdGlvbihkYXRhKTtcblxuICAgICAgICAgICAgd2hpbGUgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBudWxsLCByZW1vdmVNb2RlbHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGRhdGEuZWFjaChmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGQsIHBhcmVudElkID0gdGhpcy5nZXRQYXJlbnRJZChtb2RlbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYobW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKF8uaXNOdWxsKHBhcmVudElkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucmVtb3ZlKHRoaXMuYXBwZW5kTm9kZShtb2RlbCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFyZW50ID0gdGhpcy5maW5kTm9kZUJ5SWQocGFyZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5yZW1vdmUodGhpcy5hcHBlbmROb2RlKG1vZGVsLCBwYXJlbnQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldE9wdGlvbjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgaWYoIV8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zW25hbWVdKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbbmFtZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFBhcmVudElkOiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgaWYoIW1vZGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ3BhcmVudEF0dHJpYnV0ZScpKSB8fCBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElkOiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignaWRBdHRyaWJ1dGUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVvcmRlcjogZnVuY3Rpb24oY29sbGVjdGlvbikge1xuICAgICAgICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb24gfHwgdGhpcztcblxuICAgICAgICAgICAgY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsLCBpKSB7XG4gICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdvcmRlcicsIGkgKyAxKTtcblxuICAgICAgICAgICAgICAgIGlmKG1vZGVsLmNoaWxkcmVuICYmIG1vZGVsLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlb3JkZXIobW9kZWwuY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZE5vZGVzOiBmdW5jdGlvbihjaGlsZHJlbiwgcGFyZW50KSB7XG4gICAgICAgICAgICBfLmVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmROb2RlKGNoaWxkLCBwYXJlbnQpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kTm9kZShjaGlsZCwgcGFyZW50LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgICAgICAgICAgY2hpbGQuY2hpbGRyZW4gfHwgKGNoaWxkLmNoaWxkcmVuID0gdGhpcy5fY3JlYXRlQ29sbGVjdGlvbigpKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdjb21wYXJhdG9yJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcGFyYXRvciA9ICghXy5pc1VuZGVmaW5lZChvcHRpb25zLmF0KSA/IG9wdGlvbnMuYXQgOiAocGFyZW50ID8gcGFyZW50LmNoaWxkcmVuLmxlbmd0aCA6IHRoaXMubGVuZ3RoKSkgKyAxO1xuXG4gICAgICAgICAgICAgICAgY2hpbGQuc2V0KHRoaXMuZ2V0T3B0aW9uKCdjb21wYXJhdG9yJyksIGNvbXBhcmF0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKi8gXG5cbiAgICAgICAgICAgIGlmKHBhcmVudCkge1xuICAgICAgICAgICAgICAgIGNoaWxkLnNldCh0aGlzLmdldE9wdGlvbigncGFyZW50QXR0cmlidXRlJyksIHBhcmVudC5nZXQodGhpcy5nZXRPcHRpb24oJ2lkQXR0cmlidXRlJykpKTtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4uYWRkKGNoaWxkLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoaWxkLnNldCh0aGlzLmdldE9wdGlvbigncGFyZW50QXR0cmlidXRlJyksIG51bGwpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKGNoaWxkLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZE5vZGVCZWZvcmUoY2hpbGQsIHNpYmxpbmcpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHRoaXMuZ2V0UGFyZW50SWQoc2libGluZyk7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gcGFyZW50SWQgPyB0aGlzLmZpbmQoe2lkOiBwYXJlbnRJZH0pIDogbnVsbDtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHBhcmVudCA/IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHNpYmxpbmcpIDogdGhpcy5pbmRleE9mKHNpYmxpbmcpO1xuXG4gICAgICAgICAgICB0aGlzLmFwcGVuZE5vZGUoY2hpbGQsIHBhcmVudCwge1xuICAgICAgICAgICAgICAgIGF0OiBpbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmROb2RlQWZ0ZXIoY2hpbGQsIHNpYmxpbmcpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHRoaXMuZ2V0UGFyZW50SWQoc2libGluZyk7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5maW5kKHtpZDogcGFyZW50SWR9KTtcblxuICAgICAgICAgICAgaWYocGFyZW50SWQgJiYgcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmROb2RlKGNoaWxkLCBwYXJlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgYXQ6IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHNpYmxpbmcpICsgMVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmROb2RlKGNoaWxkLCBudWxsLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0OiB0aGlzLmluZGV4T2Yoc2libGluZykgKyAxXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVOb2RlOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB0aGlzLmdldFBhcmVudElkKG5vZGUpO1xuXG4gICAgICAgICAgICBpZihwYXJlbnRJZCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmZpbmQoe2lkOiBwYXJlbnRJZH0pO1xuXG4gICAgICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuLnJlbW92ZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpbHRlcjogZnVuY3Rpb24oaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbHRlcihjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gXy5maWx0ZXIoY29sbGVjdGlvbi5tb2RlbHMsIGl0ZXJhdGVlLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIGlmKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gY29sbGVjdGlvbi5tb2RlbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gY29sbGVjdGlvbi5tb2RlbHNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYobW9kZWwuY2hpbGRyZW4gJiYgbW9kZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBmaWx0ZXIobW9kZWwuY2hpbGRyZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcih0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kOiBmdW5jdGlvbihpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZmluZChjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gXy5maW5kKGNvbGxlY3Rpb24ubW9kZWxzLCBpdGVyYXRlZSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBpZighbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGNvbGxlY3Rpb24ubW9kZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBjb2xsZWN0aW9uLm1vZGVsc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobW9kZWwuY2hpbGRyZW4gJiYgbW9kZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gZmluZChtb2RlbC5jaGlsZHJlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmluZCh0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICB3aGVyZTogZnVuY3Rpb24oYXR0cmlidXRlcywgY29udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZC5jYWxsKHRoaXMsIGF0dHJpYnV0ZXMsIGNvbnRleHQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmRQYXJlbnROb2RlOiBmdW5jdGlvbihjaGlsZCwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZE5vZGVCeUlkKHRoaXMuZ2V0UGFyZW50SWQoY2hpbGQpLCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kTm9kZTogZnVuY3Rpb24oY2hpbGQsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmROb2RlQnlJZCh0aGlzLmdldElkKGNoaWxkKSwgY29sbGVjdGlvbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZE5vZGVCeUlkOiBmdW5jdGlvbihpZCwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgY29sbGVjdGlvbiB8fCAoY29sbGVjdGlvbiA9IHRoaXMpO1xuICAgICAgICAgICAgdmFyIG1vZGVscyA9IGNvbGxlY3Rpb24udG9BcnJheSgpO1xuXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gbW9kZWxzKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gbW9kZWxzW2ldO1xuXG4gICAgICAgICAgICAgICAgaWYoaWQgPT0gdGhpcy5nZXRJZChtb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKG1vZGVsLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5maW5kTm9kZUJ5SWQoaWQsIG1vZGVsLmNoaWxkcmVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZighXy5pc051bGwobm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0pTT046IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gcGFyc2UoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBbXTtcblxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBtb2RlbC50b0pTT04oKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihtb2RlbC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuY2hpbGRyZW4gPSBwYXJzZShtb2RlbC5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByb3cucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcm93O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFyc2UodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMudG9KU09OKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jcmVhdGVDb2xsZWN0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgQ29sbGVjdGlvbiA9IHRoaXMuZ2V0T3B0aW9uKCdjb2xsZWN0aW9uQ2xhc3MnKSB8fCBCYWNrYm9uZS5Db2xsZWN0aW9uO1xuXG4gICAgICAgICAgICBkYXRhID0gbmV3IENvbGxlY3Rpb24oZGF0YSB8fCBbXSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdjb21wYXJhdG9yJykpIHtcbiAgICAgICAgICAgICAgICBkYXRhLmNvbXBhcmF0b3IgPSB0aGlzLmdldE9wdGlvbignY29tcGFyYXRvcicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJywgJ2JhY2tib25lLnJhZGlvJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSwgcmVxdWlyZSgnYmFja2JvbmUucmFkaW8nKSwgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lLCByb290LkJhY2tib25lLlJhZGlvLCByb290Lk1hcmlvbmV0dGUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5JdGVtVmlldyA9IE1hcmlvbmV0dGUuSXRlbVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYXJpb25ldHRlLkl0ZW1WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFRvb2xib3guT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsTmFtZSA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsTmFtZScpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWxOYW1lJykgfHwgJ2dsb2JhbCc7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbCcpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWwnKSB8fCBSYWRpby5jaGFubmVsKHRoaXMuY2hhbm5lbE5hbWUpO1xuICAgICAgICB9XG5cblx0fSk7XG5cblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUucmFkaW8nLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5yYWRpbycpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuQmFja2JvbmUuUmFkaW8sIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkxheW91dFZpZXcgPSBNYXJpb25ldHRlLkxheW91dFZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYXJpb25ldHRlLkxheW91dFZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gVG9vbGJveC5PcHRpb25zKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucywgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gXy5yZXN1bHQodGhpcywgJ2NoYW5uZWxOYW1lJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbE5hbWUnKSB8fCAnZ2xvYmFsJztcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbCcpIHx8IFJhZGlvLmNoYW5uZWwodGhpcy5jaGFubmVsTmFtZSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZScsICdiYWNrYm9uZS5yYWRpbycsICdiYWNrYm9uZS5tYXJpb25ldHRlJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLnJhZGlvJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSwgcm9vdC5CYWNrYm9uZS5SYWRpbywgcm9vdC5NYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQ29tcG9zaXRlVmlldyA9IE1hcmlvbmV0dGUuQ29tcG9zaXRlVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFyaW9uZXR0ZS5Db21wb3NpdGVWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFRvb2xib3guT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsTmFtZSA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsTmFtZScpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWxOYW1lJykgfHwgJ2dsb2JhbCc7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbCcpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWwnKSB8fCBSYWRpby5jaGFubmVsKHRoaXMuY2hhbm5lbE5hbWUpO1xuICAgICAgICB9XG5cblx0fSk7XG5cblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUucmFkaW8nLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5yYWRpbycpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuQmFja2JvbmUuUmFkaW8sIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkNvbGxlY3Rpb25WaWV3ID0gTWFyaW9uZXR0ZS5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG5cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIE1hcmlvbmV0dGUuQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gVG9vbGJveC5PcHRpb25zKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucywgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gXy5yZXN1bHQodGhpcywgJ2NoYW5uZWxOYW1lJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbE5hbWUnKSB8fCAnZ2xvYmFsJztcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsJykgfHwgXy5yZXN1bHQodGhpcy5vcHRpb25zLCAnY2hhbm5lbCcpIHx8IFJhZGlvLmNoYW5uZWwodGhpcy5jaGFubmVsTmFtZSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkJhc2VGaWVsZCA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBmb3JtTW9kZWw6IGZhbHNlLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2Zvcm0tZ3JvdXAnLFxuXG4gICAgICAgIGRlZmF1bHRUcmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2ZvY3VzIHt7dHJpZ2dlclNlbGVjdG9yfX0nOiB7XG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdmb2N1cycsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2JsdXIge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2JsdXInLFxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdjbGljayB7e3RyaWdnZXJTZWxlY3Rvcn19Jzoge1xuICAgICAgICAgICAgICAgIGV2ZW50OiAnY2xpY2snLFxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdrZXl1cCB7e3RyaWdnZXJTZWxlY3Rvcn19Jzoge1xuICAgICAgICAgICAgICAgIGV2ZW50OiAna2V5OnVwJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAna2V5ZG93biB7e3RyaWdnZXJTZWxlY3Rvcn19Jzoge1xuICAgICAgICAgICAgICAgIGV2ZW50OiAna2V5OmRvd24nLFxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdrZXlwcmVzcyB7e3RyaWdnZXJTZWxlY3Rvcn19Jzoge1xuICAgICAgICAgICAgICAgIGV2ZW50OiAna2V5OnByZXNzJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2Vyczoge30sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGlkOiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIG5hbWU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICAgICAgaGVhZGVyOiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsQ2xhc3NOYW1lOiAnY29udHJvbC1sYWJlbCcsXG4gICAgICAgICAgICBpbnB1dENsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbkNsYXNzTmFtZTogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoNCcsXG4gICAgICAgICAgICB0cmlnZ2VyU2VsZWN0b3I6ICdpbnB1dCcsXG4gICAgICAgICAgICB1cGRhdGVNb2RlbDogdHJ1ZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5JdGVtVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJzID0gXy5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdFRyaWdnZXJzKCksIHRoaXMudHJpZ2dlcnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERlZmF1bHRUcmlnZ2VyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIGRlZmF1bHRUcmlnZ2VycyA9IHt9O1xuXG4gICAgICAgICAgICBfLmVhY2godGhpcy5kZWZhdWx0VHJpZ2dlcnMsIGZ1bmN0aW9uKHRyaWdnZXIsIGtleSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0Lm9wdGlvbnMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgPSBrZXkucmVwbGFjZSgne3snK25hbWUrJ319JywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0VHJpZ2dlcnNba2V5LnRyaW0oKV0gPSB0cmlnZ2VyO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VHJpZ2dlcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGQoKS5ibHVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkuZm9jdXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldElucHV0VmFsdWUodGhpcy5nZXRPcHRpb24oJ3ZhbHVlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzYXZlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZ2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3VwZGF0ZU1vZGVsJykgPT09IHRydWUgJiYgdGhpcy5tb2RlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KHRoaXMuZ2V0T3B0aW9uKCduYW1lJyksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRJbnB1dFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbigkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpLFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSwgcm9vdC5NYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5CbG9ja0Zvcm1FcnJvciA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS1lcnJvcicpLFxuXG4gICAgICAgIHRhZ05hbWU6ICdzcGFuJyxcblxuICAgICAgICBjbGFzc05hbWU6ICdoZWxwLWJsb2NrJyxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgaW5wdXQgZmllbGQgbmFtZVxuICAgICAgICAgICAgZmllbGQ6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIFRoZSBpbnB1dCBmaWVsZCBlcnJvcnNcbiAgICAgICAgICAgIGVycm9yczogW10sXG5cbiAgICAgICAgICAgIC8vIChib29sKSBJZiB0cnVlIGVycm9ycyB3aWxsIGhhdmUgPGJyPiB0YWdzIHRvIGJyZWFrIGVycm9yIGludG8gbmV3bGluZXNcbiAgICAgICAgICAgIG5ld2xpbmU6IHRydWVcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zKTtcblxuICAgICAgICAgICAgaWYoIV8uaXNBcnJheShvcHRpb25zLmVycm9ycykpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9ycyA9IFtvcHRpb25zLmVycm9yc107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guSW5saW5lRm9ybUVycm9yID0gVG9vbGJveC5CbG9ja0Zvcm1FcnJvci5leHRlbmQoe1xuXG4gICAgICAgIGNsYXNzTmFtZTogJ2hlbHAtaW5saW5lJ1xuXG4gICAgfSk7XG5cbiAgICBUb29sYm94LkJhc2VGb3JtID0gVG9vbGJveC5MYXlvdXRWaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGFnTmFtZTogJ2Zvcm0nLFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnc3VibWl0JzogJ3N1Ym1pdCdcbiAgICAgICAgfSxcblxuICAgICAgICBpc1N1Ym1pdHRpbmc6IGZhbHNlLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIEFuIG9iamVjdCBvZiBhY3Rpdml0eSBpbmRpY2F0b3Igb3B0aW9uc1xuICAgICAgICAgICAgYWN0aXZpdHlJbmRpY2F0b3JPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAnc21hbGwnXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZXJyb3IgdmlldyBvYmplY3RcbiAgICAgICAgICAgIGVycm9yVmlldzogVG9vbGJveC5CbG9ja0Zvcm1FcnJvcixcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGVycm9yIHZpZXcgb3B0aW9ucyBvYmplY3RcbiAgICAgICAgICAgIGVycm9yVmlld09wdGlvbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZ2xvYmFsIGVycm9yIHZpZXcgb2JqZWN0XG4gICAgICAgICAgICBnbG9iYWxFcnJvcnNWaWV3OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGdsb2JhbCBlcnJvciB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBnbG9iYWxFcnJvcnNPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgc2hvd0VtcHR5TWVzc2FnZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIChib29sKSBTaG93IGdsb2JhbCBlcnJvcnMgYWZ0ZXIgZm9ybSBzdWJtaXRzXG4gICAgICAgICAgICBzaG93R2xvYmFsRXJyb3JzOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIFNob3cgbm90aWZpY2F0aW9ucyBhZnRlciBmb3JtIHN1Ym1pdHNcbiAgICAgICAgICAgIHNob3dOb3RpZmljYXRpb25zOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgbm90aWZpY2F0aW9uIHZpZXcgb2JqZWN0XG4gICAgICAgICAgICBub3RpZmljYXRpb25WaWV3OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIG5vdGlmaWNhdGlvbiB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBub3RpZmljYXRpb25WaWV3T3B0aW9uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBmb3JtIGdyb3VwIGNsYXNzIG5hbWVcbiAgICAgICAgICAgIGZvcm1Hcm91cENsYXNzTmFtZTogJ2Zvcm0tZ3JvdXAnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgaGFzIGVycm9yIGNsYXNzIG5hbWVcbiAgICAgICAgICAgIGhhc0Vycm9yQ2xhc3NOYW1lOiAnaGFzLWVycm9yJyxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIEFkZCB0aGUgaGFzIGVycm9yIGNsYXNzZXMgdG8gZmllbGRzXG4gICAgICAgICAgICBhZGRIYXNFcnJvckNsYXNzOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgQWRkIHRoZSBpbmxpbmUgZm9ybSBlcnJvcnNcbiAgICAgICAgICAgIHNob3dJbmxpbmVFcnJvcnM6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSByZWRpcmVjdCB1cmwuIEZhbHNlIGlmIG5vIHJlZGlyZWN0XG4gICAgICAgICAgICByZWRpcmVjdDogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBzdWNjZXNzIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBkZWZhdWx0IHN1Y2Nlc3MgbWVzc2FnZSBvYmplY3RcbiAgICAgICAgICAgIGRlZmF1bHRTdWNjZXNzTWVzc2FnZToge1xuICAgICAgICAgICAgICAgIGljb246ICdmYSBmYS1jaGVjaycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnU3VjY2VzcyEnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgZm9ybSB3YXMgc3VjY2Vzc2Z1bGx5IHN1Ym1pdHRlZC4nXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZXJycHIgbWVzc2FnZSBvYmplY3RcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBkZWZhdWx0IHN1Y2Nlc3MgbWVzc2FnZSBvYmplY3RcbiAgICAgICAgICAgIGRlZmF1bHRFcnJvck1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtd2FybmluZycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FsZXJ0JyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0Vycm9yIScsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBmb3JtIGNvdWxkIG5vdCBiZSBzdWJtaXR0ZWQuJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zZXJpYWxpemVkRm9ybTogZmFsc2UsXG5cbiAgICAgICAgX2Vycm9yVmlld3M6IGZhbHNlLFxuXG4gICAgICAgIGdldEZvcm1EYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHN0cmlwQnJhY2tldHMoY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSBjb21wb25lbnQubWF0Y2goL1teXFxbXFxdXSsvKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzID8gbWF0Y2hlc1swXSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRDb21wb25lbnQoc3ViamVjdCwgY29tcG9uZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmKCFzdWJqZWN0W2NvbXBvbmVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgc3ViamVjdFtjb21wb25lbnRdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1YmplY3RbY29tcG9uZW50XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gYWRkQ29tcG9uZW50cyhzdWJqZWN0LCBjb21wb25lbnRzLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaChjb21wb25lbnRzLCBmdW5jdGlvbihjb21wb25lbnQsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhcmlhYmxlID0gc3RyaXBCcmFja2V0cyhjb21wb25lbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHZhcmlhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0ID0gYWRkQ29tcG9uZW50KHN1YmplY3QsIHZhcmlhYmxlLCBjb21wb25lbnRzLmxlbmd0aCA+IGkgKyAxID8ge30gOiB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGFycmF5IGxpa2UgW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVPYmplY3RzKHJvb3QsIGNvbXBvbmVudHMsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYoIWRhdGFbcm9vdF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtyb290XSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFkZENvbXBvbmVudHMoZGF0YVtyb290XSwgY29tcG9uZW50cywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSAkKHRoaXMpLmF0dHIoJ25hbWUnKTtcblxuICAgICAgICAgICAgICAgIGlmKCgkKHRoaXMpLmlzKCc6cmFkaW8nKSB8fCAkKHRoaXMpLmlzKCc6Y2hlY2tib3gnKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5pcygnOmNoZWNrZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZihuYW1lICYmICghXy5pc051bGwodmFsdWUpICYmICFfLmlzVW5kZWZpbmVkKHZhbHVlKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSBuYW1lLm1hdGNoKC8oXlxcdyspPyhcXFsuKiE/XFxdKS8pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByb290ID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRzID0gbWF0Y2hlc1syXS5tYXRjaCgvXFxbLio/XFxdL2cpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVPYmplY3RzKHJvb3QsIGNvbXBvbmVudHMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kaW5kaWNhdG9yID0gdGhpcy4kZWwuZmluZCgnLmZvcm0taW5kaWNhdG9yJyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuJGluZGljYXRvci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRpbmRpY2F0b3IgPSAkKCc8ZGl2IGNsYXNzPVwiZm9ybS1pbmRpY2F0b3JcIj48L2Rpdj4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy4kZWwuZmluZCgnZm9vdGVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnZm9vdGVyJykuYXBwZW5kKHRoaXMuJGluZGljYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy4kaW5kaWNhdG9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBuZXcgQmFja2JvbmUuTWFyaW9uZXR0ZS5SZWdpb24oe1xuICAgICAgICAgICAgICAgIGVsOiB0aGlzLiRpbmRpY2F0b3IuZ2V0KDApXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIGluZGljYXRvciA9IG5ldyBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKHRoaXMuZ2V0T3B0aW9uKCdhY3Rpdml0eUluZGljYXRvck9wdGlvbnMnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnNob3coaW5kaWNhdG9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVFcnJvcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy4kZXJyb3JzKSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKHRoaXMuJGVycm9ycywgZnVuY3Rpb24oJGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICRlcnJvci5wYXJlbnRzKCcuJyt0aGlzLmdldE9wdGlvbignaGFzRXJyb3JDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignaGFzRXJyb3JDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0Rm9ybURhdGEoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzRm9ybUNoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuX3NlcmlhbGl6ZWRGb3JtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VyaWFsaXplZEZvcm0gIT09IHRoaXMuc2VyaWFsaXplKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlR2xvYmFsRXJyb3JzUmVnaW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2dsb2JhbEVycm9yc1ZpZXcnKTtcblxuICAgICAgICAgICAgaWYoIVZpZXcpIHtcbiAgICAgICAgICAgICAgICBWaWV3ID0gVG9vbGJveC5Vbm9yZGVyZWRMaXN0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRnbG9iYWxFcnJvcnMgPSAkKCc8ZGl2IGNsYXNzPVwiZ2xvYmFsLWVycm9yc1wiPjwvZGl2PicpO1xuXG4gICAgICAgICAgICB0aGlzLmFwcGVuZEdsb2JhbEVycm9yUmVnaW9uVG9Eb20odGhpcy4kZ2xvYmFsRXJyb3JzKTtcblxuICAgICAgICAgICAgdGhpcy5nbG9iYWxFcnJvcnMgPSBuZXcgTWFyaW9uZXR0ZS5SZWdpb24oe1xuICAgICAgICAgICAgICAgIGVsOiB0aGlzLiRnbG9iYWxFcnJvcnMuZ2V0KDApXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIGVycm9yc1ZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh0aGlzLmdldE9wdGlvbignZ2xvYmFsRXJyb3JzT3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsRXJyb3JzLnNob3coZXJyb3JzVmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kR2xvYmFsRXJyb3JSZWdpb25Ub0RvbTogZnVuY3Rpb24oJGdsb2JhbEVycm9ycykge1xuICAgICAgICAgICAgdGhpcy4kZWwucHJlcGVuZCgkZ2xvYmFsRXJyb3JzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb246IGZ1bmN0aW9uKG5vdGljZSkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignbm90aWZpY2F0aW9uVmlldycpO1xuXG4gICAgICAgICAgICBpZighVmlldykge1xuICAgICAgICAgICAgICAgIFZpZXcgPSBUb29sYm94Lk5vdGlmaWNhdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgdHlwZTogbm90aWNlLnR5cGUgPyBub3RpY2UudHlwZSA6ICdhbGVydCcsXG4gICAgICAgICAgICAgICAgdGl0bGU6IG5vdGljZS50aXRsZSA/IG5vdGljZS50aXRsZSA6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlID8gbm90aWNlLm1lc3NhZ2UgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpY29uOiBub3RpY2UuaWNvbiA/IG5vdGljZS5pY29uIDogZmFsc2VcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdub3RpZmljYXRpb25WaWV3T3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUVycm9yOiBmdW5jdGlvbihmaWVsZCwgZXJyb3IpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2Vycm9yVmlldycpO1xuXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoKTtcblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7fSwgdGhpcy5nZXRPcHRpb24oJ2Vycm9yVmlld09wdGlvbnMnKSwge1xuICAgICAgICAgICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgICAgICBlcnJvcnM6IGVycm9yXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGRQYXJlbnQ6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbnB1dEZpZWxkKGZpZWxkKS5wYXJlbnRzKCcuJyArIHRoaXMuZ2V0T3B0aW9uKCdmb3JtR3JvdXBDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgICAgICAgIGZpZWxkID0gZmllbGQucmVwbGFjZSgnLicsICdfJyk7XG5cbiAgICAgICAgICAgIHZhciAkZmllbGQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicrZmllbGQrJ1wiXScpO1xuXG4gICAgICAgICAgICBpZigkZmllbGQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRmaWVsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcjJytmaWVsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oZmllbGQsIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGQoZmllbGQpLnZhbCh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkSGFzRXJyb3JDbGFzc1RvRmllbGQ6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZFBhcmVudChmaWVsZCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUhhc0Vycm9yQ2xhc3NGcm9tRmllbGQ6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZFBhcmVudChmaWVsZCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUdsb2JhbEVycm9yczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdsb2JhbEVycm9ycyAmJiB0aGlzLmdsb2JhbEVycm9ycy5jdXJyZW50Vmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsRXJyb3JzLmN1cnJlbnRWaWV3LmNvbGxlY3Rpb24ucmVzZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmb2N1c09uRmlyc3RFcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0b3IgPSAnZGl2LicrdGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykrJzpmaXJzdCc7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2lucHV0LCBzZWxlY3QsIHRleHRhcmVhJylcbiAgICAgICAgICAgICAgICAuZm9jdXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmRFcnJvclZpZXdUb0dsb2JhbDogZnVuY3Rpb24oZXJyb3JWaWV3KSB7XG4gICAgICAgICAgICB0aGlzLmdsb2JhbEVycm9ycy5jdXJyZW50Vmlldy5jb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgICAgICAgICAgY29udGVudDogZXJyb3JWaWV3LmdldE9wdGlvbignZXJyb3JzJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZEVycm9yVmlld1RvRmllbGQ6IGZ1bmN0aW9uKGVycm9yVmlldykge1xuICAgICAgICAgICAgZXJyb3JWaWV3LnJlbmRlcigpO1xuXG4gICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGRQYXJlbnQoZXJyb3JWaWV3LmdldE9wdGlvbignZmllbGQnKSlcbiAgICAgICAgICAgICAgICAuYXBwZW5kKGVycm9yVmlldy4kZWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVFcnJvcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dHbG9iYWxFcnJvcnMnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlR2xvYmFsRXJyb3JzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKF8uaXNBcnJheSh0aGlzLl9lcnJvclZpZXdzKSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0aGlzLl9lcnJvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhZGRIYXNFcnJvckNsYXNzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlSGFzRXJyb3JDbGFzc0Zyb21GaWVsZCh2aWV3LmdldE9wdGlvbignZmllbGQnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd0lubGluZUVycm9ycycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3LiRlbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dFcnJvcjogZnVuY3Rpb24oZmllbGQsIGVycm9yKSB7XG4gICAgICAgICAgICBpZighdGhpcy5fZXJyb3JWaWV3cykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Vycm9yVmlld3MgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVycm9yVmlldyA9IHRoaXMuY3JlYXRlRXJyb3IoZmllbGQsIGVycm9yKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dHbG9iYWxFcnJvcnMnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kRXJyb3JWaWV3VG9HbG9iYWwoZXJyb3JWaWV3KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2FkZEhhc0Vycm9yQ2xhc3MnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkSGFzRXJyb3JDbGFzc1RvRmllbGQoZmllbGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd0lubGluZUVycm9ycycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRFcnJvclZpZXdUb0ZpZWxkKGVycm9yVmlldyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2Vycm9yVmlld3MucHVzaChlcnJvclZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dFcnJvcnM6IGZ1bmN0aW9uKGVycm9ycykge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBfLmVhY2goZXJyb3JzLCBmdW5jdGlvbihlcnJvciwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICB0LnNob3dFcnJvcihmaWVsZCwgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNPbkZpcnN0RXJyb3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5pbmRpY2F0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvci5lbXB0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldEVycm9yc0Zyb21SZXNwb25zZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3JzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJlZGlyZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigncmVkaXJlY3QnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWRpcmVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSB0aGlzLmdldFJlZGlyZWN0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1N1Y2Nlc3NOb3RpZmljYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IHRoaXMuY3JlYXRlTm90aWZpY2F0aW9uKF8uZXh0ZW5kKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdkZWZhdWx0U3VjY2Vzc01lc3NhZ2UnKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignc3VjY2Vzc01lc3NhZ2UnKVxuICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0Vycm9yTm90aWZpY2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSB0aGlzLmNyZWF0ZU5vdGlmaWNhdGlvbihfLmV4dGVuZChcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZGVmYXVsdEVycm9yTWVzc2FnZScpLFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdlcnJvck1lc3NhZ2UnKVxuICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fc2VyaWFsaXplZEZvcm0gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd0dsb2JhbEVycm9ycycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVHbG9iYWxFcnJvcnNSZWdpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblN1Ym1pdFN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5oYXNGb3JtQ2hhbmdlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdmb3JtOmNoYW5nZWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXJpYWxpemVkRm9ybSA9IHRoaXMuc2VyaWFsaXplKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93Tm90aWZpY2F0aW9ucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93U3VjY2Vzc05vdGlmaWNhdGlvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbigncmVkaXJlY3QnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVkaXJlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblN1Ym1pdENvbXBsZXRlOiBmdW5jdGlvbihzdGF0dXMsIG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdGhpcy5pc1N1Ym1pdHRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaGlkZUVycm9ycygpO1xuICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblN1Ym1pdEVycm9yOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93Tm90aWZpY2F0aW9ucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RXJyb3JOb3RpZmljYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zaG93RXJyb3JzKHRoaXMuZ2V0RXJyb3JzRnJvbVJlc3BvbnNlKHJlc3BvbnNlKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZighdGhpcy5pc1N1Ym1pdHRpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3VibWl0dGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93QWN0aXZpdHlJbmRpY2F0b3IoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2F2ZSh0aGlzLmdldEZvcm1EYXRhKCksIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24obW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3N1Ym1pdDpjb21wbGV0ZScsIHRydWUsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3N1Ym1pdDpzdWNjZXNzJywgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzdWJtaXQ6Y29tcGxldGUnLCBmYWxzZSwgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc3VibWl0OmVycm9yJywgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2JhY2tib25lJ10sIGZ1bmN0aW9uKEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuQmFja2JvbmUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEJhY2tib25lKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5Ob1Vub3JkZXJlZExpc3RJdGVtID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLXVub3JkZXJlZC1saXN0LWl0ZW0nKSxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0bWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zO1xuXHRcdH1cblxuXHR9KTtcblxuXHRUb29sYm94LlVub3JkZXJlZExpc3RJdGVtID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0Y2xhc3NOYW1lOiAndW5vcmRlcmVkLWxpc3QtaXRlbScsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbihlLCBvYmopIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljaycsIG9iaik7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zXG5cdFx0fSxcblxuICAgICAgICBnZXRUZW1wbGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZighdGhpcy5nZXRPcHRpb24oJ3RlbXBsYXRlJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9vbGJveC5UZW1wbGF0ZSgndW5vcmRlcmVkLWxpc3QtaXRlbScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RlbXBsYXRlJyk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuXHRUb29sYm94LlVub3JkZXJlZExpc3QgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guVW5vcmRlcmVkTGlzdEl0ZW0sXG5cblx0XHRjbGFzc05hbWU6ICd1bm9yZGVyZWQtbGlzdCcsXG5cblx0XHR0YWdOYW1lOiAndWwnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdC8vIChvYmplY3QpIFRoZSB2aWV3IG9iamVjdCB0byB1c2UgZm9yIHRoZSBlbXB0eSBtZXNzYWdlXG5cdFx0XHRlbXB0eU1lc3NhZ2VWaWV3OiBUb29sYm94Lk5vVW5vcmRlcmVkTGlzdEl0ZW0sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIGxpc3QgaXRlbXNcblx0XHRcdGVtcHR5TWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgZW1wdHkgbWVzc2FnZSB2aWV3XG5cdFx0XHRzaG93RW1wdHlNZXNzYWdlOiB0cnVlXG5cdFx0fSxcblxuXHRcdGNoaWxkRXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0aWYoIXRoaXMuY29sbGVjdGlvbikge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgZ2V0RW1wdHlWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZih0aGlzLmdldE9wdGlvbignc2hvd0VtcHR5TWVzc2FnZScpKSB7XG5cdCAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZVZpZXcnKTtcblxuXHQgICAgICAgICAgICBWaWV3ID0gVmlldy5leHRlbmQoe1xuXHQgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuXHQgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2UnKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICByZXR1cm4gVmlldztcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2JhY2tib25lJ10sIGZ1bmN0aW9uKEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5Ecm9wZG93bk1lbnVOb0l0ZW1zID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdkcm9wZG93bi1tZW51LW5vLWl0ZW1zJyksXG5cblx0XHRjbGFzc05hbWU6ICduby1yZXN1bHRzJ1xuXG5cdH0pO1xuXG5cdFRvb2xib3guRHJvcGRvd25NZW51SXRlbSA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZHJvcGRvd24tbWVudS1pdGVtJyksXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0ZGl2aWRlckNsYXNzTmFtZTogJ2RpdmlkZXInXG5cdFx0fSxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2snOiB7XG5cdFx0XHRcdGV2ZW50OiAnY2xpY2snLFxuXHRcdFx0XHRwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG5cdFx0XHRcdHN0b3BQcm9wYWdhdGlvbjogZmFsc2Vcblx0XHQgICAgfVxuXHRcdH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgYSc6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYoXy5pc0Z1bmN0aW9uKHRoaXMubW9kZWwuZ2V0KCdvbkNsaWNrJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0KCdvbkNsaWNrJykuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdkaXZpZGVyJykgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RpdmlkZXJDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guRHJvcGRvd25NZW51ID0gVG9vbGJveC5Db21wb3NpdGVWaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXdDb250YWluZXI6ICd1bCcsXG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guRHJvcGRvd25NZW51SXRlbSxcblxuXHRcdGVtcHR5VmlldzogVG9vbGJveC5Ecm9wZG93bk1lbnVOb0l0ZW1zLFxuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Ryb3Bkb3duLW1lbnUnKSxcblxuXHRcdGNsYXNzTmFtZTogJ2Ryb3Bkb3duJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRjaGlsZEV2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignY2xvc2VPbkNsaWNrJykgPT09IHRydWUpIHtcblx0XHRcdFx0XHR0aGlzLmhpZGVNZW51KClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrIC5kcm9wZG93bi10b2dnbGUnOiAndG9nZ2xlOmNsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBbiBhcnJheSBvZiBtZW51IGl0ZW1zIHRvIGJlIGNvbnZlcnRlZCB0byBhIGNvbGxlY3Rpb24uXG4gICAgICAgICAgICBpdGVtczogW10sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgdGV4dFxuXHRcdFx0dG9nZ2xlTGFiZWw6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGNsYXNzIG5hbWVcblx0XHRcdGRyb3Bkb3duTWVudVRvZ2dsZUNsYXNzTmFtZTogJ2Ryb3Bkb3duLXRvZ2dsZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgaWNvbiBjbGFzcyBuYW1lXG5cdFx0XHRkcm9wZG93bk1lbnVUb2dnbGVJY29uQ2xhc3NOYW1lOiAnZmEgZmEtY2FyZXQtZG93bicsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biBtZW51IGNsYXNzIG5hbWVcblx0XHRcdGRyb3Bkb3duTWVudUNsYXNzTmFtZTogJ2Ryb3Bkb3duLW1lbnUnLFxuXG5cdFx0XHQvLyAoaW50fGJvb2wpIFRoZSBjb2xsZWN0aW9uIGxpbWl0XG5cdFx0XHRsaW1pdDogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBvcmRlciBvZiB0aGUgY29sbGVjdGlvbiBpdGVtc1xuXHRcdFx0b3JkZXI6ICduYW1lJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgRWl0aGVyIGFzYyBvciBkZXNjXG5cdFx0XHRzb3J0OiAnYXNjJyxcblxuXHRcdFx0Ly8gKGJvb2wpIENsb3NlIHRoZSBtZW51IGFmdGVyIGFuIGl0ZW0gaGFzIGJlZW4gY2xpY2tlZFxuXHRcdFx0Y2xvc2VPbkNsaWNrOiB0cnVlLFxuXG5cdFx0XHQvLyAoYm9vbCkgRmV0Y2ggdGhlIGNvbGxlY3Rpb24gd2hlbiB0aGUgZHJvcGRvd24gbWVudSBpcyBzaG93blxuXHRcdFx0ZmV0Y2hPblNob3c6IGZhbHNlLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyBhbiBhY3Rpdml0eSBpbmRpY2F0b3Igd2hlbiBmZXRjaGluZyB0aGUgY29sbGVjdGlvblxuXHRcdFx0c2hvd0luZGljYXRvcjogdHJ1ZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIHRvZ2dsZSBjbGFzcyBuYW1lXG5cdFx0XHR0b2dnbGVDbGFzc05hbWU6ICdvcGVuJ1xuXHRcdH0sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdFRvb2xib3guQ29tcG9zaXRlVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG5cdFx0XHR0aGlzLm9uKCdmZXRjaCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignc2hvd0luZGljYXRvcicpKSB7XG5cdFx0XHRcdFx0dGhpcy5zaG93SW5kaWNhdG9yKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm9uKCdmZXRjaDpzdWNjZXNzIGZldGNoOmVycm9yJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93SW5kaWNhdG9yJykpIHtcblx0XHRcdFx0XHR0aGlzLmhpZGVJbmRpY2F0b3IoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbih0aGlzLmdldE9wdGlvbignaXRlbXMnKSk7XG4gICAgICAgICAgICB9XG5cdFx0fSxcblxuXHRcdHNob3dJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIEFjdGl2aXR5Vmlld0l0ZW0gPSBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yLmV4dGVuZCh7XG5cdFx0XHRcdHRhZ05hbWU6ICdsaScsXG5cdFx0XHRcdGNsYXNzTmFtZTogJ2FjdGl2aXR5LWluZGljYXRvci1pdGVtJyxcblx0XHRcdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0VG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG5cdFx0XHRcdFx0dGhpcy5vcHRpb25zLmluZGljYXRvciA9ICdzbWFsbCc7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLmFkZENoaWxkKG5ldyBCYWNrYm9uZS5Nb2RlbCgpLCBBY3Rpdml0eVZpZXdJdGVtKTtcblx0XHR9LFxuXG5cdFx0aGlkZUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdmlldyA9IHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoMCk7XG5cblx0XHRcdGlmKHZpZXcgJiYgdmlldyBpbnN0YW5jZW9mIFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IpIHtcblx0XHRcdFx0dGhpcy5jaGlsZHJlbi5yZW1vdmUodGhpcy5jaGlsZHJlbi5maW5kQnlJbmRleCgwKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHNob3dNZW51OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdkcm9wZG93bk1lbnVUb2dnbGVDbGFzc05hbWUnKSkucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdkcm9wZG93bk1lbnVUb2dnbGVDbGFzc05hbWUnKSkuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG5cdFx0fSxcblxuXHRcdGhpZGVNZW51OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdkcm9wZG93bk1lbnVUb2dnbGVDbGFzc05hbWUnKSkucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdkcm9wZG93bk1lbnVUb2dnbGVDbGFzc05hbWUnKSkuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXHRcdH0sXG5cblx0XHRpc01lbnVWaXNpYmxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignZHJvcGRvd25NZW51VG9nZ2xlQ2xhc3NOYW1lJykpLnBhcmVudCgpLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0fSxcblxuXHRcdG9uVG9nZ2xlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoIXRoaXMuaXNNZW51VmlzaWJsZSgpKSB7XG5cdFx0XHRcdHRoaXMuc2hvd01lbnUoKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLmhpZGVNZW51KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uU2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdCA9IHRoaXM7XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdmZXRjaE9uU2hvdycpKSB7XG5cdFx0XHRcdHRoaXMuZmV0Y2goKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZmV0Y2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHQgPSB0aGlzO1xuXG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2ZldGNoJyk7XG5cblx0XHRcdHRoaXMuY29sbGVjdGlvbi5mZXRjaCh7XG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRsaW1pdDogdGhpcy5nZXRPcHRpb24oJ2xpbWl0JyksXG5cdFx0XHRcdFx0b3JkZXI6IHRoaXMuZ2V0T3B0aW9uKCdvcmRlcicpLFxuXHRcdFx0XHRcdHNvcnQ6IHRoaXMuZ2V0T3B0aW9uKCdzb3J0JyksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0aWYodC5nZXRPcHRpb24oJ3Nob3dJbmRpY2F0b3InKSkge1xuXHRcdFx0XHRcdFx0dC5oaWRlSW5kaWNhdG9yKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dC5yZW5kZXIoKTtcblx0XHRcdFx0XHR0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOnN1Y2Nlc3MnLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuXHRcdFx0XHRcdHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6ZXJyb3InLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlRyZWVWaWV3Tm9kZSA9IFRvb2xib3guQ29tcG9zaXRlVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGdldFRlbXBsYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmdldE9wdGlvbigndGVtcGxhdGUnKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSB0ZW1wbGF0ZSBvcHRpb24gbXVzdCBiZSBzZXQuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndGVtcGxhdGUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0YWdOYW1lOiAnbGknLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiAge1xuICAgICAgICAgICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG4gICAgICAgICAgICBwYXJlbnRBdHRyaWJ1dGU6ICdwYXJlbnRfaWQnLFxuICAgICAgICAgICAgY2hpbGRWaWV3Q29udGFpbmVyOiAnLmNoaWxkcmVuJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdpZEF0dHJpYnV0ZScpKSB8fCB0aGlzLm1vZGVsLmNpZCxcbiAgICAgICAgICAgICAgICAnZGF0YS1wYXJlbnQtaWQnOiB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbigncGFyZW50QXR0cmlidXRlJykpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5Db21wb3NpdGVWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbiA9IHRoaXMubW9kZWwuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLm1vZGVsO1xuXG4gICAgICAgICAgICB0aGlzLmNoaWxkVmlld09wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucywgdGhpcy5nZXRPcHRpb24oJ2NoaWxkVmlld09wdGlvbnMnKSB8fCB7fSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaGFzQ2hpbGRyZW46ICB0aGlzLmNvbGxlY3Rpb24gPyB0aGlzLmNvbGxlY3Rpb24ubGVuZ3RoID4gMCA6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlRyZWVWaWV3ID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5UcmVlVmlld05vZGUsXG5cbiAgICAgICAgdGFnTmFtZTogJ3VsJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgbmVzdGFibGU6IHRydWVcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNoaWxkVmlld09wdGlvbnMgPSBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgIHRyZWVSb290OiB0aGlzLFxuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2NoaWxkVmlld09wdGlvbnMnKSB8fCB7fSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnanF1ZXJ5JywgJ2JhY2tib25lLm1hcmlvbmV0dGUnLCAnaW50ZXJhY3QuanMnXSwgZnVuY3Rpb24oXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2ludGVyYWN0LmpzJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LiQsIHJvb3QuTWFyaW9uZXR0ZSwgcm9vdC5pbnRlcmFjdCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpIHtcblxuICAgIGZ1bmN0aW9uIGdldElkQXR0cmlidXRlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBfLmlzTnVsbChuZXcgU3RyaW5nKHZhbHVlKS5tYXRjaCgvXmNcXGQrJC8pKSA/ICdpZCcgOiAnY2lkJztcbiAgICB9XG5cbiAgICBUb29sYm94LkRyYWdnYWJsZVRyZWVOb2RlID0gVG9vbGJveC5UcmVlVmlld05vZGUuZXh0ZW5kKHtcblxuICAgICAgICBjbGFzc05hbWU6ICdkcmFnZ2FibGUtdHJlZS1ub2RlJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIFRvb2xib3guVHJlZVZpZXdOb2RlLnByb3RvdHlwZS5kZWZhdWx0T3B0aW9ucywge1xuICAgICAgICAgICAgICAgIG1lbnVDbGFzc05hbWU6ICdtZW51JyxcbiAgICAgICAgICAgICAgICBtZW51VmlldzogVG9vbGJveC5Ecm9wZG93bk1lbnUsXG4gICAgICAgICAgICAgICAgbWVudVZpZXdPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6ICdkaXYnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZW51SXRlbXM6IFtdLFxuICAgICAgICAgICAgICAgIG5lc3RhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByb290OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndHJlZVJvb3QnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRNZW51Q29udGFpbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcuJyArIHRoaXMuZ2V0T3B0aW9uKCdtZW51Q2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ21lbnVWaWV3JyksIGNvbnRhaW5lciA9IHRoaXMuZ2V0TWVudUNvbnRhaW5lcigpO1xuXG4gICAgICAgICAgICBpZihWaWV3ICYmIGNvbnRhaW5lci5sZW5ndGgpIHtcbiAgICAgICAgXHRcdHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe30sIHRoaXMuZ2V0T3B0aW9uKCdtZW51Vmlld09wdGlvbnMnKSwge1xuICAgICAgICBcdFx0XHRpdGVtczogdGhpcy5nZXRPcHRpb24oJ21lbnVJdGVtcycpXG4gICAgICAgIFx0XHR9KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUgPSBuZXcgTWFyaW9uZXR0ZS5SZWdpb24oe1xuICAgICAgICAgICAgICAgICAgICBlbDogY29udGFpbmVyLmdldCgwKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51LnNob3codmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIG5vZGVXaGVyZSA9IHt9LCBwYXJlbnRXaGVyZSA9IHt9O1xuXG4gICAgICAgICAgICB2YXIgaWQgPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coaWQpO1xuXG4gICAgICAgICAgICBub2RlV2hlcmVbZ2V0SWRBdHRyaWJ1dGUoaWQpXSA9IGlkO1xuICAgICAgICAgICAgcGFyZW50V2hlcmVbZ2V0SWRBdHRyaWJ1dGUocGFyZW50SWQpXSA9IHBhcmVudElkO1xuXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHNlbGYucm9vdCgpLmNvbGxlY3Rpb24uZmluZChub2RlV2hlcmUpO1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IHNlbGYucm9vdCgpLmNvbGxlY3Rpb24uZmluZChwYXJlbnRXaGVyZSk7XG5cbiAgICAgICAgICAgIHNlbGYucm9vdCgpLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShub2RlKTtcblxuICAgICAgICAgICAgVG9vbGJveC5Ecm9wem9uZXMoZXZlbnQuZHJhZ0V2ZW50LCBldmVudC50YXJnZXQsIHtcbiAgICAgICAgICAgICAgICBiZWZvcmU6IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucm9vdCgpLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUJlZm9yZShub2RlLCBwYXJlbnQpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmJlZm9yZScsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFmdGVyOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihub2RlLCBwYXJlbnQpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHNlbGYuZ2V0T3B0aW9uKCduZXN0YWJsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGUobm9kZSwgcGFyZW50LCB7YXQ6IDB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihub2RlLCBwYXJlbnQsIHthdDogMH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcCcsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3BNb3ZlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBUb29sYm94LkRyb3B6b25lcyhldmVudCwgZXZlbnQuZHJvcHpvbmUuZWxlbWVudCgpLCB7XG4gICAgICAgICAgICAgICAgYmVmb3JlOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygnZHJvcC1iZWZvcmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdkcm9wLWFmdGVyIGRyb3AtY2hpbGRyZW4nKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFmdGVyOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LmRyb3B6b25lLmVsZW1lbnQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnZHJvcC1hZnRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2Ryb3AtYmVmb3JlIGRyb3AtY2hpbGRyZW4nKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZihzZWxmLmdldE9wdGlvbignbmVzdGFibGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChldmVudC5kcm9wem9uZS5lbGVtZW50KCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdkcm9wLWNoaWxkcmVuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2Ryb3AtYWZ0ZXIgZHJvcC1iZWZvcmUnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EcmFnTW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAgICAgICB2YXIgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSArIGV2ZW50LmR4O1xuICAgICAgICAgICAgdmFyIHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCkgKyBldmVudC5keTtcblxuICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCAnICsgeSArICdweCknO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuICAgICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG4gICAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJhZzptb3ZlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHRoaXMuX2dob3N0RWxlbWVudCA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5uZXh0KClcbiAgICAgICAgICAgICAgICAuY3NzKHsnbWFyZ2luLXRvcCc6ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5vdXRlckhlaWdodCgpfSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX2dob3N0RWxlbWVudC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2dob3N0RWxlbWVudCA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5wcmV2KClcbiAgICAgICAgICAgICAgICAgICAgLmNzcyh7J21hcmdpbi1ib3R0b20nOiAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkub3V0ZXJIZWlnaHQoKX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDsgLy8sIG9mZnNldCA9ICQodGFyZ2V0KS5vZmZzZXQoKTtcblxuICAgICAgICAgICAgJCh0YXJnZXQpLmNzcyh7XG4gICAgICAgICAgICAgICAgJ2xlZnQnOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgICAgICd0b3AnOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgICAgICAgICd3aWR0aCc6ICQodGFyZ2V0KS53aWR0aCgpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8kKGV2ZW50LnRhcmdldCkucGFyZW50cygnLicgKyB0aGlzLmNsYXNzTmFtZSkuY3NzKHtsZWZ0OiBldmVudC5jbGllbnRYLCB0b3A6IGV2ZW50LmNsaWVudFl9KTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJhZzpzdGFydCcsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcblxuICAgICAgICAgICAgLy90aGlzLl9naG9zdEVsZW1lbnQuY3NzKCd0cmFuc2Zvcm0nLCAnJyk7XG4gICAgICAgICAgICAvL3RoaXMuX2dob3N0RWxlbWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmF0dHIoe1xuICAgICAgICAgICAgICAgICdkYXRhLXgnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnZGF0YS15JzogZmFsc2UsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogJycsXG4gICAgICAgICAgICAgICAgJ2xlZnQnOiAnJyxcbiAgICAgICAgICAgICAgICAndG9wJzogJycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZm9ybSc6ICcnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJhZzplbmQnLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EcmFnRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJhZzplbnRlcicsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyYWdMZWF2ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5yZW1vdmVDbGFzcygnZHJvcC1iZWZvcmUgZHJvcC1hZnRlciBkcm9wLWNoaWxkcmVuJyk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6bGVhdmUnLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wRGVhY3RpdmF0ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5yZW1vdmVDbGFzcygnZHJvcC1iZWZvcmUgZHJvcC1hZnRlciBkcm9wLWNoaWxkcmVuJyk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6ZGVhY3RpdmF0ZScsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCAkZWwgPSB0aGlzLiRlbDtcblxuICAgICAgICAgICAgaW50ZXJhY3QodGhpcy4kZWwuZ2V0KDApKVxuICAgICAgICAgICAgICAgIC5kcmFnZ2FibGUoe1xuICAgICAgICAgICAgICAgICAgICBhdXRvU2Nyb2xsOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvbm1vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6bW92ZScsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25lbmQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOmVuZCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25zdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJhZzpzdGFydCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRyb3B6b25lKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjZXB0OiAnLicgKyB0aGlzLmNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgb25kcmFnZW50ZXI6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOmVudGVyJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbmRyYWdsZWF2ZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6bGVhdmUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uZHJvcDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2Ryb3AnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uZHJvcGRlYWN0aXZhdGU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcm9wOmRlYWN0aXZhdGUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbignZHJhZ21vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZXZlbnQuZHJvcHpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJvcDptb3ZlJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd01lbnUoKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2pxdWVyeScsICdiYWNrYm9uZS5tYXJpb25ldHRlJywgJ2ludGVyYWN0LmpzJ10sIGZ1bmN0aW9uKF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdpbnRlcmFjdC5qcycpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kLCByb290Lk1hcmlvbmV0dGUsIHJvb3QuaW50ZXJhY3QpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG5cbiAgICBUb29sYm94LkRyYWdnYWJsZVRyZWVWaWV3ID0gVG9vbGJveC5UcmVlVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5EcmFnZ2FibGVUcmVlTm9kZSxcblxuICAgICAgICBjbGFzc05hbWU6ICdkcmFnZ2FibGUtdHJlZScsXG5cbiAgICAgICAgY2hpbGRWaWV3T3B0aW9uczoge1xuICAgICAgICAgICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG4gICAgICAgICAgICBwYXJlbnRBdHRyaWJ1dGU6ICdwYXJlbnRfaWQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZW9yZGVyKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdqcXVlcnknLCAnc3Bpbi5qcyddLCBmdW5jdGlvbihfLCAkLCBTcGlubmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sICQsIFNwaW5uZXIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCdzcGluLmpzJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuJCwgcm9vdC5TcGlubmVyKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCAkLCBTcGlubmVyKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdhY3Rpdml0eS1pbmRpY2F0b3InKSxcblxuICAgICAgICBzcGlubmluZzogZmFsc2UsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsRm9udFNpemU6IGZhbHNlLFxuICAgICAgICAgICAgZGltbWVkQmdDb2xvcjogZmFsc2UsXG4gICAgICAgICAgICBkaW1tZWQ6IGZhbHNlLFxuICAgICAgICAgICAgYXV0b1N0YXJ0OiB0cnVlLFxuICAgICAgICAgICAgcG9zaXRpb246IGZhbHNlLFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAnMHB4JyxcbiAgICAgICAgICAgIGluZGljYXRvcjoge30sXG4gICAgICAgICAgICBkZWZhdWx0SW5kaWNhdG9yOiB7XG4gICAgICAgICAgICAgICAgbGluZXM6IDExLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICBsZW5ndGg6IDE1LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgIHdpZHRoOiAzLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEzLCAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICAgICAgICAgICAgICBjb3JuZXJzOiA0LCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgIHJvdGF0ZTogMCwgLy8gVGhlIHJvdGF0aW9uIG9mZnNldFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMSwgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzAwMCcsIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcbiAgICAgICAgICAgICAgICBzcGVlZDogMSwgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgICAgICAgICAgICAgICB0cmFpbDogNDAsIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgc2hhZG93OiBmYWxzZSwgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcbiAgICAgICAgICAgICAgICBod2FjY2VsOiB0cnVlLCAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdhY3Rpdml0eS1pbmRpY2F0b3Itc3Bpbm5lcicsIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXG4gICAgICAgICAgICAgICAgekluZGV4OiAyZTksIC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxuICAgICAgICAgICAgICAgIHRvcDogJzUwJScsIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcbiAgICAgICAgICAgICAgICBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFByZXNldE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAndGlueSc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA0LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNCwgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdzbWFsbCc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA3LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNywgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdtZWRpdW0nOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogMTQsIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMSwgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdsYXJnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXM6IDEyLCAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiAyOCwgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEsIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDIwLCAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICAgICAgICAgICAgICAgICAgY29ybmVyczogMSwgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxPZmZzZXQ6IDEwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guSXRlbVZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdmFyIHJlc2l6ZVRpbWVyLCBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLiRlbC5maW5kKCcuYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsJykuY3NzKHt0b3A6ICcnfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5wb3NpdGlvbkxhYmVsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3NpdGlvbkxhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdsYWJlbCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuJGVsLmZpbmQoJy5hY3Rpdml0eS1pbmRpY2F0b3ItbGFiZWwnKS5vdXRlckhlaWdodCgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmFjdGl2aXR5LWluZGljYXRvci1sYWJlbCcpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGhpcy4kZWwuZmluZCgnLmFjdGl2aXR5LWluZGljYXRvci1sYWJlbCcpLm9mZnNldCgpLnRvcCArXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwaW5uZXIub3B0cy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGlubmVyLm9wdHMucmFkaXVzICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChoZWlnaHQgLyAyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAodGhpcy5zcGlubmVyLm9wdHMubGFiZWxPZmZzZXQgfHwgMClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTcGlubmVyT3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdEluZGljYXRvciA9IHRoaXMuZ2V0T3B0aW9uKCdkZWZhdWx0SW5kaWNhdG9yJyk7XG4gICAgICAgICAgICB2YXIgaW5kaWNhdG9yID0gdGhpcy5nZXRPcHRpb24oJ2luZGljYXRvcicpO1xuICAgICAgICAgICAgdmFyIHByZXNldHMgPSB0aGlzLmdldFByZXNldE9wdGlvbnMoKTtcblxuICAgICAgICAgICAgaWYoXy5pc1N0cmluZyhpbmRpY2F0b3IpICYmIHByZXNldHNbaW5kaWNhdG9yXSkge1xuICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHByZXNldHNbaW5kaWNhdG9yXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYodHlwZW9mIGluZGljYXRvciAhPT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgZGVmYXVsdEluZGljYXRvciwgaW5kaWNhdG9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTcGlubmVyRG9tOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcuYWN0aXZpdHktaW5kaWNhdG9yJykuZ2V0KDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyLnNwaW4odGhpcy5nZXRTcGlubmVyRG9tKCkpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzdGFydCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zcGlubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc3RvcCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgc3Bpbm5lciBvYmplY3RcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKHRoaXMuZ2V0U3Bpbm5lck9wdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIC8vIHN0YXJ0IGlmIG9wdGlvbnMuYXV0b1N0YXJ0IGlzIHRydWVcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhdXRvU3RhcnQnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uTGFiZWwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vQnJlYWRjcnVtYnMgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tYnJlYWRjcnVtYnMnKSxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRjbGFzc05hbWU6ICduby1icmVhZGNydW1icydcblxuXHR9KTtcblxuXHRUb29sYm94LkJyZWFkY3J1bWIgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnYnJlYWRjcnVtYicpLFxuXG5cdFx0dGFnTmFtZTogJ2xpJ1xuXG5cdH0pO1xuXG5cdFRvb2xib3guQnJlYWRjcnVtYnMgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guQnJlYWRjcnVtYixcblxuXHRcdGVtcHR5VmlldzogVG9vbGJveC5Ob0JyZWFkY3J1bWJzLFxuXG5cdFx0Y2xhc3NOYW1lOiAnYnJlYWRjcnVtYicsXG5cblx0XHR0YWdOYW1lOiAnb2wnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZSdcblx0XHR9LFxuXG5cdFx0Y29sbGVjdGlvbkV2ZW50czoge1xuXHRcdFx0J2NoYW5nZSBhZGQgcmVtb3ZlIHJlc2V0JzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHQub25Eb21SZWZyZXNoKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0aWYoIXRoaXMuY29sbGVjdGlvbikge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRnZXRCcmVhZGNydW1iczogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYnJlYWRjcnVtYnMgPSB0aGlzLmNvbGxlY3Rpb24gPyB0aGlzLmNvbGxlY3Rpb24udG9KU09OKCkgOiBbXTtcblxuXHRcdFx0aWYoIV8uaXNBcnJheShicmVhZGNydW1icykpIHtcblx0XHRcdFx0YnJlYWRjcnVtYnMgPSBbXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJyZWFkY3J1bWJzO1xuXHRcdH0sXG5cblx0XHRhZGRCcmVhZGNydW1iczogZnVuY3Rpb24oYnJlYWRjcnVtYnMpIHtcblx0XHRcdGlmKF8uaXNBcnJheShicmVhZGNydW1icykpIHtcblx0XHRcdFx0Xy5lYWNoKGJyZWFkY3J1bWJzLCBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRCcmVhZGNydW1iKGJyZWFkY3J1bWIpO1xuXHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignQWRkaW5nIG11bHRpcGxlIGJyZWFkY3J1bWJzIG11c3QgZG9uZSBieSBwYXNzaW5nIGFuIGFycmF5Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRhZGRCcmVhZGNydW1iOiBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KGJyZWFkY3J1bWIpKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoYnJlYWRjcnVtYik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0EgYnJlYWRjcnVtYiBtdXN0IGJlIHBhc3NlZCBhcyBhbiBvYmplY3QnKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdHNldEJyZWFkY3J1bWJzOiBmdW5jdGlvbihicmVhZGNydW1icykge1xuXHRcdFx0aWYoXy5pc0FycmF5KGJyZWFkY3J1bWJzKSkge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uc2V0KGJyZWFkY3J1bWJzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byBzZXQgdGhlIGJyZWFkY3J1bWJzJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRpbnNlcnRCcmVhZGNydW1iOiBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KGJyZWFkY3J1bWIpKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi51bnNoaWZ0KGJyZWFkY3J1bWIpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdBIGJyZWFkY3J1bWIgbXVzdCBiZSBwYXNzZWQgYXMgYW4gb2JqZWN0Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRpbnNlcnRCcmVhZGNydW1iczogZnVuY3Rpb24oYnJlYWRjcnVtYnMpIHtcblx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0aWYoXy5pc0FycmF5KGJyZWFkY3J1bWJzKSkge1xuXHRcdFx0XHRfLmVhY2goYnJlYWRjcnVtYnMsIGZ1bmN0aW9uKGJyZWFkY3J1bWIpIHtcblx0XHRcdFx0XHR0Lmluc2VydEJyZWFkY3J1bWIoYnJlYWRjcnVtYik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdJbnNlcnRpbmcgbXVsdGlwbGUgYnJlYWRjcnVtYnMgbXVzdCBkb25lIGJ5IHBhc3NpbmcgYW4gYXJyYXknKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdHJlbW92ZUJyZWFkY3J1bWJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuXHRcdH0sXG5cblx0XHRvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoIXRoaXMuJGVsLmZpbmQoJy5uby1icmVhZGNydW1icycpLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLiRlbC5wYXJlbnQoKS5zaG93KCk7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0XHRpZih0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkIGEnKS5sZW5ndGgpIHtcblx0XHRcdFx0XHR0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkJykuaHRtbCh0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkIGEnKS5odG1sKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy4kZWwucGFyZW50KCkuaGlkZSgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guQnV0dG9uRHJvcGRvd25NZW51ID0gVG9vbGJveC5Ecm9wZG93bk1lbnUuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdidXR0b24tZHJvcGRvd24tbWVudScpLFxuXG5cdFx0Y2hpbGRWaWV3Q29udGFpbmVyOiAndWwnLFxuXG5cdFx0dGFnTmFtZTogJ2RpdicsXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrIC5idG46bm90KC5kcm9wZG93bi10b2dnbGUpJzogJ2J1dHRvbjpjbGljaycsXG5cdFx0XHQnY2xpY2sgLmRyb3Bkb3duLXRvZ2dsZSc6ICd0b2dnbGU6Y2xpY2snXG5cdFx0fSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoYXJyYXkpIEFuIGFycmF5IG9mIG1lbnUgaXRlbXMgdG8gYmUgY29udmVydGVkIHRvIGEgY29sbGVjdGlvbi5cbiAgICAgICAgICAgIGl0ZW1zOiBbXSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIGJ1dHRvbiB0ZXh0XG5cdFx0XHRidXR0b25MYWJlbDogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biBidXR0b24gY2xhc3MgbmFtZVxuXHRcdFx0YnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIHRvZ2dsZSBjbGFzcyBuYW1lXG5cdFx0XHRkcm9wZG93bk1lbnVUb2dnbGVDbGFzc05hbWU6ICdkcm9wZG93bi10b2dnbGUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gbWVudSBjbGFzcyBuYW1lXG5cdFx0XHRkcm9wZG93bk1lbnVDbGFzc05hbWU6ICdkcm9wZG93bi1tZW51JyxcblxuXHRcdFx0Ly8gKGludHxib29sKSBUaGUgY29sbGVjdGlvbiBsaW1pdFxuXHRcdFx0bGltaXQ6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgb3JkZXIgb2YgdGhlIGNvbGxlY3Rpb24gaXRlbXNcblx0XHRcdG9yZGVyOiAnbmFtZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIEVpdGhlciBhc2Mgb3IgZGVzY1xuXHRcdFx0c29ydDogJ2FzYycsXG5cblx0XHRcdC8vIChib29sKSBDbG9zZSB0aGUgbWVudSBhZnRlciBhbiBpdGVtIGhhcyBiZWVuIGNsaWNrZWRcblx0XHRcdGNsb3NlT25DbGljazogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIE1lbnUgYXBwZWFyIGFzIGEgXCJkcm9wdXBcIiBpbnN0ZWFkIG9mIGEgXCJkcm9wZG93blwiXG5cdFx0XHRkcm9wVXA6IGZhbHNlLFxuXG5cdFx0XHQvLyAoYm9vbCkgRmV0Y2ggdGhlIGNvbGxlY3Rpb24gd2hlbiB0aGUgZHJvcGRvd24gbWVudSBpcyBzaG93blxuXHRcdFx0ZmV0Y2hPblNob3c6IGZhbHNlLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyBhbiBhY3Rpdml0eSBpbmRpY2F0b3Igd2hlbiBmZXRjaGluZyB0aGUgY29sbGVjdGlvblxuXHRcdFx0c2hvd0luZGljYXRvcjogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIFNob3cgdGhlIGJ1dHRvbiBhcyBzcGxpdCB3aXRoIHR3byBhY3Rpb25zIGluc3RlYWQgb2Ygb25lXG5cdFx0XHRzcGxpdEJ1dHRvbjogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgY2xhc3MgbmFtZVxuXHRcdFx0dG9nZ2xlQ2xhc3NOYW1lOiAnb3Blbidcblx0XHR9LFxuXG5cdFx0c2hvd01lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG5cdFx0fSxcblxuXHRcdGhpZGVNZW51OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5kcm9wZG93bi10b2dnbGUnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblx0XHR9LFxuXG5cdFx0aXNNZW51VmlzaWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKS5sZW5ndGggPiAwO1xuXHRcdH1cblxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnYmFja2JvbmUnXSwgZnVuY3Rpb24oQmFja2JvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQnV0dG9uR3JvdXBJdGVtID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2J1dHRvbi1ncm91cC1pdGVtJyksXG5cblx0XHR0YWdOYW1lOiAnYScsXG5cblx0XHRjbGFzc05hbWU6ICdidG4gYnRuLWRlZmF1bHQnLFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayc6ICdjbGljaydcblx0XHR9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKSkge1xuXHRcdFx0XHR0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guTm9CdXR0b25Hcm91cEl0ZW1zID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLWJ1dHRvbi1ncm91cC1pdGVtJylcblxuXHR9KTtcblxuXHRUb29sYm94LkJ1dHRvbkdyb3VwID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94LkJ1dHRvbkdyb3VwSXRlbSxcblxuXHRcdGVtcHR5VmlldzogVG9vbGJveC5Ob0J1dHRvbkdyb3VwSXRlbXMsXG5cblx0XHRjbGFzc05hbWU6ICdidG4tZ3JvdXAnLFxuXG5cdFx0dGFnTmFtZTogJ2RpdicsXG5cblx0XHRjaGlsZEV2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogJ29uQ2hpbGRDbGljaydcblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdC8vIChzdHJpbmcpIFRoZSBhY3RpdmUgY2xhc3MgbmFtZVxuXHRcdFx0YWN0aXZlQ2xhc3NOYW1lOiAnYWN0aXZlJyxcblxuXHRcdFx0Ly8gKGJvb2wpIEFjdGl2YXRlIHRoZSBidXR0b24gb24gY2xpY2tcblx0XHRcdGFjdGl2YXRlT25DbGljazogdHJ1ZSxcblxuXHRcdFx0Ly8gKG1peGVkKSBQYXNzIGFuIGFycmF5IG9mIGJ1dHRvbnMgaW5zdGVhZCBvZiBwYXNzaW5nIGEgY29sbGVjdGlvbiBvYmplY3QuXG5cdFx0XHRidXR0b25zOiBmYWxzZVxuXHRcdH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAgICAgVG9vbGJveC5Db2xsZWN0aW9uVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYnV0dG9ucycpICYmICFvcHRpb25zLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbih0aGlzLmdldE9wdGlvbignYnV0dG9ucycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRBY3RpdmVJbmRleDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5maW5kQnlJbmRleChpbmRleCkuJGVsLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblx0XHRvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKS5jbGljaygpO1xuXHRcdH0sXG5cblx0XHRvbkNoaWxkQ2xpY2s6IGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHR0aGlzLnRyaWdnZXIoJ2NsaWNrJywgY2hpbGQpO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbignYWN0aXZhdGVPbkNsaWNrJykgJiYgIWNoaWxkLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0XHRjaGlsZC4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2FjdGl2YXRlJywgY2hpbGQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXG4gICAgICAgICAgICAndW5kZXJzY29yZScsXG4gICAgICAgICAgICAnYmFja2JvbmUnLFxuICAgICAgICAgICAgJ2JhY2tib25lLm1hcmlvbmV0dGUnLFxuICAgICAgICAgICAgJ21vbWVudCdcbiAgICAgICAgXSwgZnVuY3Rpb24oXywgQmFja2JvbmUsIE1hcmlvbmV0dGUsIG1vbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgbW9tZW50KVxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnbW9tZW50JylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcm9vdC5fLFxuICAgICAgICAgICAgcm9vdC5CYWNrYm9uZSxcbiAgICAgICAgICAgIHJvb3QuTWFyaW9uZXR0ZSxcbiAgICAgICAgICAgIHJvb3QubW9tZW50XG4gICAgICAgICk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUsIG1vbWVudCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5Nb250aGx5Q2FsZW5kYXJEYXkgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2NhbGVuZGFyLW1vbnRobHktZGF5LXZpZXcnKSxcblxuICAgICAgICB0YWdOYW1lOiAndGQnLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2NhbGVuZGFyLWRheScsXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayc6ICdjbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBtb2RlbEV2ZW50czogIHtcbiAgICAgICAgICAgICdjaGFuZ2UnOiAnbW9kZWxDaGFuZ2VkJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBkYXRlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIG1vZGVsQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRheTogdGhpcy5nZXRPcHRpb24oJ2RheScpLFxuICAgICAgICAgICAgICAgIGhhc0V2ZW50czogdGhpcy5oYXNFdmVudHMoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldENlbGxIZWlnaHQ6IGZ1bmN0aW9uKHdpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5jc3MoJ2hlaWdodCcsIHdpZHRoIHx8IHRoaXMuJGVsLndpZHRoKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdkYXRlJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCgnZXZlbnRzJykubGVuZ3RoID4gMCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0RGF0ZSgpLmlzU2FtZShuZXcgRGF0ZSgpLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnY2FsZW5kYXItdG9kYXknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXREYXRlKCkuaXNTYW1lKHRoaXMuZ2V0T3B0aW9uKCdjdXJyZW50RGF0ZScpLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnY2FsZW5kYXItY3VycmVudC1kYXknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXREYXRlKCkuaXNTYW1lKHRoaXMuZ2V0T3B0aW9uKCdjdXJyZW50RGF0ZScpLCAnbW9udGgnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdjYWxlbmRhci1tb250aCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoJ2V2ZW50cycpIHx8IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEV2ZW50czogZnVuY3Rpb24oZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNldCgnZXZlbnRzJywgZXZlbnRzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRFdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZyA9IF8uY2xvbmUodGhpcy5nZXRFdmVudHMoKSk7XG5cbiAgICAgICAgICAgIGV4aXN0aW5nLnB1c2goZXZlbnQpO1xuXG4gICAgICAgICAgICB0aGlzLnNldEV2ZW50cyhleGlzdGluZyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkRXZlbnRzOiBmdW5jdGlvbihldmVudHMpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZyA9IF8uY2xvbmUodGhpcy5nZXRFdmVudHMoKSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0RXZlbnRzKF8ubWVyZ2UoZXhpc3RpbmcsIGV2ZW50cykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUV2ZW50OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbaW5kZXhdO1xuXG4gICAgICAgICAgICB0aGlzLnNldEV2ZW50cyhldmVudHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldEV2ZW50cyhbXSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5Nb250aGx5Q2FsZW5kYXJXZWVrID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5Nb250aGx5Q2FsZW5kYXJEYXksXG5cbiAgICAgICAgdGFnTmFtZTogJ3RyJyxcblxuICAgICAgICBjaGlsZEV2ZW50czoge1xuICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKHZpZXcsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2RheTpjbGljaycsIHZpZXcsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBkYXlzOiBmYWxzZSxcbiAgICAgICAgICAgIGV2ZW50czogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiBmdW5jdGlvbihjaGlsZCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERheShpbmRleCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF5czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2RheXMnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREYXk6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgZGF5cyA9IHRoaXMuZ2V0RGF5cygpO1xuXG4gICAgICAgICAgICBpZihkYXlzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXlzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRGaXJzdERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uZmlyc3QoKS5nZXREYXRlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGFzdERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4ubGFzdCgpLmdldERhdGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREYXlNb2RlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJhY2tib25lLk1vZGVsKHtcbiAgICAgICAgICAgICAgICBldmVudHM6IFtdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfcmVuZGVyQ2hpbGRyZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95RW1wdHlWaWV3KCk7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lDaGlsZHJlbigpO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXJ0QnVmZmVyaW5nKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dDb2xsZWN0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmVuZEJ1ZmZlcmluZygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDb2xsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLmdldE9wdGlvbignZGF5cycpLCBmdW5jdGlvbihkYXksIGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuZ2V0RGF5TW9kZWwoKSwgdGhpcy5nZXRDaGlsZFZpZXcoKSwgaSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaW5pdGlhbEV2ZW50czogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBUb29sYm94Lk1vbnRobHlDYWxlbmRhciA9IFRvb2xib3guQ29tcG9zaXRlVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdjYWxlbmRhci1tb250aGx5LXZpZXcnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICdjYWxlbmRhcicsXG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94Lk1vbnRobHlDYWxlbmRhcldlZWssXG5cbiAgICAgICAgY2hpbGRWaWV3Q29udGFpbmVyOiAndGJvZHknLFxuXG4gICAgICAgIGNoaWxkRXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2snOiBmdW5jdGlvbih3ZWVrLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd3ZWVrOmNsaWNrJywgd2VlaywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2RheTpjbGljayc6IGZ1bmN0aW9uKHdlZWssIGRheSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0ZShkYXkuZ2V0RGF0ZSgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2RheTpjbGljaycsIHdlZWssIGRheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGZhbHNlLFxuICAgICAgICAgICAgZGF0ZTogZmFsc2UsXG4gICAgICAgICAgICBhbHdheXNTaG93U2l4V2Vla3M6IHRydWUsXG4gICAgICAgICAgICBmZXRjaE9uUmVuZGVyOiB0cnVlLFxuICAgICAgICAgICAgaW5kaWNhdG9yT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3NtYWxsJyxcbiAgICAgICAgICAgICAgICBkaW1tZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgZGltbWVkQmdDb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgLjYpJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmNhbGVuZGFyLW5hdmlnYXRpb24tcHJldic6ICdwcmV2OmNsaWNrJyxcbiAgICAgICAgICAgICdjbGljayAuY2FsZW5kYXItbmF2aWdhdGlvbi1uZXh0JzogJ25leHQ6Y2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogZnVuY3Rpb24oY2hpbGQsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRheXM6IHRoaXMuZ2V0Q2FsZW5kYXJXZWVrKGluZGV4KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeVZhcmlhYmxlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldEZpcnN0RGF0ZSgpLmZvcm1hdCgnWVlZWS1NTS1ERCBISC1tbS1zcycpLFxuICAgICAgICAgICAgICAgIGVuZDogdGhpcy5nZXRMYXN0RGF0ZSgpLmZvcm1hdCgnWVlZWS1NTS1ERCBISC1tbS1zcycpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGZldGNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcywgcGFyYW1zID0gdGhpcy5nZXRRdWVyeVZhcmlhYmxlcygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldENhY2hlUmVzcG9uc2UocGFyYW1zKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZUNhY2hlUmVzcG9uc2UocGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZmV0Y2gnLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuc2V0Q2FjaGVSZXNwb25zZShwYXJhbXMsIGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIHRydWUsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6c3VjY2VzcycsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIGZhbHNlLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25GZXRjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUV2ZW50OiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBtb2RlbC5nZXQoJ3N0YXJ0JykgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBlbmQ6IG1vZGVsLmdldCgnZW5kJykgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY3JlYXRlOmV2ZW50JywgZXZlbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmNhbGVuZGFyLWhlYWRlcicpLmh0bWwodGhpcy5nZXRDYWxlbmRhckhlYWRlcigpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5jYWxlbmRhci1zdWItaGVhZGVyJykuaHRtbCh0aGlzLmdldENhbGVuZGFyU3ViSGVhZGVyKCkpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJDb2xsZWN0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdmZXRjaE9uUmVuZGVyJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZldGNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzdG9yZUNhY2hlUmVzcG9uc2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gdGhpcy5nZXRDYWNoZVJlc3BvbnNlKHBhcmFtcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3Jlc3RvcmU6Y2FjaGU6cmVzcG9uc2UnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDYWNoZVJlc3BvbnNlOiBmdW5jdGlvbihwYXJhbXMsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShwYXJhbXMpO1xuXG4gICAgICAgICAgICBpZighY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlc1tzdHJpbmddID0gXy5jbG9uZShjb2xsZWN0aW9uKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzZXQ6Y2FjaGU6cmVzcG9uc2UnLCBjb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXNbc3RyaW5nXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FjaGVSZXNwb25zZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXMgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5jb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXMuaGFzT3duUHJvcGVydHkoc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlc1tzdHJpbmddO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBuZXcgTWFyaW9uZXR0ZS5SZWdpb24oe1xuICAgICAgICAgICAgICAgIGVsOiB0aGlzLiRlbC5maW5kKCcuaW5kaWNhdG9yJylcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKHRoaXMuZ2V0T3B0aW9uKCdpbmRpY2F0b3JPcHRpb25zJykpO1xuXG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5zaG93KHZpZXcpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdpbmRpY2F0b3I6c2hvdycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5lbXB0eSgpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdpbmRpY2F0b3I6aGlkZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlckNvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdiZWZvcmU6cmVuZGVyOmNvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsLCBpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudChtb2RlbCk7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSB0aGlzLmdldFZpZXdCeURhdGUoZXZlbnQuc3RhcnQpO1xuICAgICAgICAgICAgICAgIGlmKHZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlldy5hZGRFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2FmdGVyOnJlbmRlcjpjb2xsZWN0aW9uJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Vmlld0J5RGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgaWYoIWRhdGUgaW5zdGFuY2VvZiBtb21lbnQpIHtcbiAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmlldyA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbih3ZWVrLCB4KSB7XG4gICAgICAgICAgICAgICAgd2Vlay5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGRheSwgeSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXkuZ2V0RGF0ZSgpLmlzU2FtZShkYXRlLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKF8uaXNOdWxsKHZpZXcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IGRheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFdlZWtNb2RlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJhY2tib25lLk1vZGVsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJIZWFkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmZvcm1hdCgnTU1NTScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENhbGVuZGFyU3ViSGVhZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERhdGUoKS55ZWFyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJXZWVrOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIHdlZWtzID0gdGhpcy5nZXRDYWxlbmRhcldlZWtzKCk7XG5cbiAgICAgICAgICAgIGlmKHdlZWtzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsZW5kYXJXZWVrczogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlIHx8IHRoaXMuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgdmFyIHN0YXJ0T2ZUaGlzTW9udGggPSBkYXRlLmNsb25lKCkuc3RhcnRPZignbW9udGgnKTtcbiAgICAgICAgICAgIHZhciBlbmRPZlRoaXNNb250aCA9IGRhdGUuY2xvbmUoKS5lbmRPZignbW9udGgnKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2Fsd2F5c1Nob3dTaXhXZWVrcycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYoc3RhcnRPZlRoaXNNb250aC5kYXkoKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydE9mVGhpc01vbnRoLnN1YnRyYWN0KDEsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoZW5kT2ZUaGlzTW9udGguZGF5KCkgPT09IDYpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kT2ZUaGlzTW9udGguYWRkKDEsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZW5kT2ZUaGlzTW9udGhXZWVrID0gZW5kT2ZUaGlzTW9udGguY2xvbmUoKTtcblxuICAgICAgICAgICAgaWYoIWVuZE9mVGhpc01vbnRoLmNsb25lKCkuZW5kT2YoJ3dlZWsnKS5pc1NhbWUoc3RhcnRPZlRoaXNNb250aCwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICBlbmRPZlRoaXNNb250aFdlZWsuZW5kT2YoJ3dlZWsnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRvdGFsRGF5c0luTW9udGggPSBkYXRlLmRheXNJbk1vbnRoKCk7XG4gICAgICAgICAgICB2YXIgdG90YWxEYXlzSW5DYWxlbmRhciA9IGVuZE9mVGhpc01vbnRoV2Vlay5kaWZmKHN0YXJ0T2ZUaGlzTW9udGgsICdkYXlzJyk7XG4gICAgICAgICAgICB2YXIgdG90YWxXZWVrc0luQ2FsZW5kYXIgPSBNYXRoLmNlaWwodG90YWxEYXlzSW5DYWxlbmRhciAvIDcpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWx3YXlzU2hvd1NpeFdlZWtzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFdlZWtzSW5DYWxlbmRhciA8IDYpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kT2ZUaGlzTW9udGhXZWVrLmFkZCg2IC0gdG90YWxXZWVrc0luQ2FsZW5kYXIsICd3ZWVrJyk7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsV2Vla3NJbkNhbGVuZGFyICs9IDYgLSB0b3RhbFdlZWtzSW5DYWxlbmRhcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB3ZWVrcyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IodmFyIHggPSAwOyB4IDwgdG90YWxXZWVrc0luQ2FsZW5kYXI7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBkYXlzID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IodmFyIHkgPSAwOyB5IDwgNzsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IHN0YXJ0T2ZUaGlzTW9udGhcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbG9uZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkKHgsICd3ZWVrJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdGFydE9mKCd3ZWVrJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGQoeSwgJ2RheScpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRheXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRheTogc3RhcnQuZGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9udGg6IHN0YXJ0Lm1vbnRoKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyOiBzdGFydC55ZWFyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZTogZGF0ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3ZWVrcy5wdXNoKGRheXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gd2Vla3M7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0V2Vla3NJbk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5nZXREYXRlKCkuZGF5c0luTW9udGgoKSAvIDcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEZpcnN0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5maXJzdCgpLmdldEZpcnN0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExhc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmxhc3QoKS5nZXRMYXN0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdkYXRlJykgfHwgbW9tZW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgaWYoIWRhdGUgaW5zdGFuY2VvZiBtb21lbnQpIHtcbiAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcHJldkRhdGUgPSB0aGlzLmdldERhdGUoKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSBkYXRlO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkYXRlOnNldCcsIGRhdGUsIHByZXZEYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRhdGVTZXQ6IGZ1bmN0aW9uKG5ld0RhdGUsIHByZXZEYXRlKSB7XG4gICAgICAgICAgICBpZighbmV3RGF0ZS5pc1NhbWUocHJldkRhdGUsICdtb250aCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Vmlld0J5RGF0ZShwcmV2RGF0ZSkuJGVsLnJlbW92ZUNsYXNzKCdjYWxlbmRhci1jdXJyZW50LWRheScpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Vmlld0J5RGF0ZShuZXdEYXRlKS4kZWwuYWRkQ2xhc3MoJ2NhbGVuZGFyLWN1cnJlbnQtZGF5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRWaWV3QnlEYXRlKG5ld0RhdGUpO1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHZpZXcubW9kZWwuZ2V0KCdldmVudHMnKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93OmV2ZW50cycsIHZpZXcsIGV2ZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UHJldkRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmNsb25lKCkuc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TmV4dERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0ZSgpLmNsb25lKCkuYWRkKDEsICdtb250aCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKHRoaXMuZ2V0UHJldkRhdGUoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUodGhpcy5nZXROZXh0RGF0ZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblByZXZDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnByZXYoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbk5leHRDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q29sbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRDYWxlbmRhcldlZWtzKCksIGZ1bmN0aW9uKHdlZWssIGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuZ2V0V2Vla01vZGVsKCksIHRoaXMuZ2V0Q2hpbGRWaWV3KCksIGkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbmRlckNoaWxkcmVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveUVtcHR5VmlldygpO1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95Q2hpbGRyZW4oKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRCdWZmZXJpbmcoKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd0NvbGxlY3Rpb24oKTtcbiAgICAgICAgICAgIHRoaXMuZW5kQnVmZmVyaW5nKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gTXVzdCBvdmVycmlkZSBjb3JlIG1ldGhvZCB0byBkbyBub3RoaW5nXG4gICAgICAgIF9pbml0aWFsRXZlbnRzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKCQsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXylcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkNoZWNrYm94RmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLWNoZWNrYm94LWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgb3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdjaGVja2JveCdcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnOmNoZWNrZWQnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKCQodGhpcykudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPiAxID8gdmFsdWVzIDogdmFsdWVzWzBdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldElucHV0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgaWYoIV8uaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gW3ZhbHVlc107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJzpjaGVja2VkJykuYXR0cignY2hlY2tlZCcsIGZhbHNlKTtcblxuICAgICAgICAgICAgXy5lYWNoKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdbdmFsdWU9XCInK3ZhbHVlKydcIl0nKS5hdHRyKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgZnVuY3Rpb24gZm9yRWFjaCggYXJyYXksIGZuICkgeyB2YXIgaSwgbGVuZ3RoXG4gICAgaSA9IC0xXG4gICAgbGVuZ3RoID0gYXJyYXkubGVuZ3RoXG4gICAgd2hpbGUgKCArK2kgPCBsZW5ndGggKVxuICAgICAgZm4oIGFycmF5WyBpIF0sIGksIGFycmF5IClcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hcCggYXJyYXksIGZuICkgeyB2YXIgcmVzdWx0XG4gICAgcmVzdWx0ID0gQXJyYXkoIGFycmF5Lmxlbmd0aCApXG4gICAgZm9yRWFjaCggYXJyYXksIGZ1bmN0aW9uICggdmFsLCBpLCBhcnJheSApIHtcbiAgICAgIHJlc3VsdFtpXSA9IGZuKCB2YWwsIGksIGFycmF5IClcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZHVjZSggYXJyYXksIGZuLCBhY2N1bXVsYXRvciApIHtcbiAgICBmb3JFYWNoKCBhcnJheSwgZnVuY3Rpb24oIHZhbCwgaSwgYXJyYXkgKSB7XG4gICAgICBhY2N1bXVsYXRvciA9IGZuKCB2YWwsIGksIGFycmF5IClcbiAgICB9KVxuICAgIHJldHVybiBhY2N1bXVsYXRvclxuICB9XG5cbiAgLy8gTGV2ZW5zaHRlaW4gZGlzdGFuY2VcbiAgZnVuY3Rpb24gTGV2ZW5zaHRlaW4oIHN0cl9tLCBzdHJfbiApIHsgdmFyIHByZXZpb3VzLCBjdXJyZW50LCBtYXRyaXhcbiAgICAvLyBDb25zdHJ1Y3RvclxuICAgIG1hdHJpeCA9IHRoaXMuX21hdHJpeCA9IFtdXG5cbiAgICAvLyBTYW5pdHkgY2hlY2tzXG4gICAgaWYgKCBzdHJfbSA9PSBzdHJfbiApXG4gICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZSA9IDBcbiAgICBlbHNlIGlmICggc3RyX20gPT0gJycgKVxuICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2UgPSBzdHJfbi5sZW5ndGhcbiAgICBlbHNlIGlmICggc3RyX24gPT0gJycgKVxuICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2UgPSBzdHJfbS5sZW5ndGhcbiAgICBlbHNlIHtcbiAgICAgIC8vIERhbmdlciBXaWxsIFJvYmluc29uXG4gICAgICBwcmV2aW91cyA9IFsgMCBdXG4gICAgICBmb3JFYWNoKCBzdHJfbSwgZnVuY3Rpb24oIHYsIGkgKSB7IGkrKywgcHJldmlvdXNbIGkgXSA9IGkgfSApXG5cbiAgICAgIG1hdHJpeFswXSA9IHByZXZpb3VzXG4gICAgICBmb3JFYWNoKCBzdHJfbiwgZnVuY3Rpb24oIG5fdmFsLCBuX2lkeCApIHtcbiAgICAgICAgY3VycmVudCA9IFsgKytuX2lkeCBdXG4gICAgICAgIGZvckVhY2goIHN0cl9tLCBmdW5jdGlvbiggbV92YWwsIG1faWR4ICkge1xuICAgICAgICAgIG1faWR4KytcbiAgICAgICAgICBpZiAoIHN0cl9tLmNoYXJBdCggbV9pZHggLSAxICkgPT0gc3RyX24uY2hhckF0KCBuX2lkeCAtIDEgKSApXG4gICAgICAgICAgICBjdXJyZW50WyBtX2lkeCBdID0gcHJldmlvdXNbIG1faWR4IC0gMSBdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY3VycmVudFsgbV9pZHggXSA9IE1hdGgubWluXG4gICAgICAgICAgICAgICggcHJldmlvdXNbIG1faWR4IF0gICAgICsgMSAgIC8vIERlbGV0aW9uXG4gICAgICAgICAgICAgICwgY3VycmVudFsgIG1faWR4IC0gMSBdICsgMSAgIC8vIEluc2VydGlvblxuICAgICAgICAgICAgICAsIHByZXZpb3VzWyBtX2lkeCAtIDEgXSArIDEgICAvLyBTdWJ0cmFjdGlvblxuICAgICAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIHByZXZpb3VzID0gY3VycmVudFxuICAgICAgICBtYXRyaXhbIG1hdHJpeC5sZW5ndGggXSA9IHByZXZpb3VzXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZSA9IGN1cnJlbnRbIGN1cnJlbnQubGVuZ3RoIC0gMSBdXG4gICAgfVxuICB9XG5cbiAgTGV2ZW5zaHRlaW4ucHJvdG90eXBlLnRvU3RyaW5nID0gTGV2ZW5zaHRlaW4ucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICggbm9fcHJpbnQgKSB7XG4gICAgICB2YXIgbWF0cml4LCBtYXgsIGJ1ZmYsIHNlcCwgcm93cywgbWF0cml4ID0gdGhpcy5nZXRNYXRyaXgoKTtcblxuICAgICAgbWF4ID0gcmVkdWNlKCBtYXRyaXgsZnVuY3Rpb24oIG0sIG8gKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGgubWF4KCBtLCByZWR1Y2UoIG8sIE1hdGgubWF4LCAwICkgKVxuICAgICAgfSwgMCApO1xuXG4gICAgICBidWZmID0gQXJyYXkoKCBtYXggKyAnJyApLmxlbmd0aCkuam9pbignICcpO1xuXG4gICAgICBzZXAgPSBbXTtcblxuICAgICAgd2hpbGUgKCBzZXAubGVuZ3RoIDwgKG1hdHJpeFswXSAmJiBtYXRyaXhbMF0ubGVuZ3RoIHx8IDApICkge1xuICAgICAgICAgIHNlcFsgc2VwLmxlbmd0aCBdID0gQXJyYXkoIGJ1ZmYubGVuZ3RoICsgMSApLmpvaW4oICctJyApO1xuICAgICAgfVxuXG4gICAgICBzZXAgPSBzZXAuam9pbiggJy0rJyApICsgJy0nO1xuXG4gICAgICByb3dzID0gbWFwKCBtYXRyaXgsIGZ1bmN0aW9uKHJvdykge1xuICAgICAgICAgIHZhciBjZWxscztcblxuICAgICAgICAgIGNlbGxzID0gbWFwKHJvdywgZnVuY3Rpb24oY2VsbCkge1xuICAgICAgICAgICAgICByZXR1cm4gKGJ1ZmYgKyBjZWxsKS5zbGljZSggLSBidWZmLmxlbmd0aCApXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gY2VsbHMuam9pbiggJyB8JyApICsgJyAnO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByb3dzLmpvaW4oIFwiXFxuXCIgKyBzZXAgKyBcIlxcblwiICk7XG4gIH1cblxuICBMZXZlbnNodGVpbi5wcm90b3R5cGUuZ2V0TWF0cml4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX21hdHJpeC5zbGljZSgpXG4gIH1cblxuICBMZXZlbnNodGVpbi5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2VcbiAgfVxuXG4gIFRvb2xib3guTGV2ZW5zaHRlaW4gPSBMZXZlbnNodGVpbjtcblxuICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5JbmxpbmVFZGl0b3IgPSBUb29sYm94LkxheW91dFZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnaW5saW5lLWVkaXRvcicpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2lubGluZS1lZGl0b3Itd3JhcHBlcicsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBhdHRyaWJ1dGUgaW4gdGhlIG1vZGVsIHRvIGVkaXRcbiAgICAgICAgICAgIGF0dHJpYnV0ZTogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBmb3JtIGlucHV0IHZpZXcgb2JqZWN0XG4gICAgICAgICAgICBmb3JtSW5wdXRWaWV3OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGZvcm0gaW5wdXQgdmlldyBvYmplY3Qgb3B0aW9uc1xuICAgICAgICAgICAgZm9ybUlucHV0Vmlld09wdGlvbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3J0aW5nKSBUaGUgY2xhc3MgbmFtZSB0byBhZGQgdG8gdGhlIGZpZWxkIHdoaWxlIGl0IGlzIGJlaW5nIGVkaXR0ZWQuXG4gICAgICAgICAgICBlZGl0dGluZ0NsYXNzTmFtZTogJ2lubGluZS1lZGl0b3ItZWRpdHRpbmcnLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgQWxsb3cgdGhlIGZpZWxkIHRvIGhhdmUgYSBudWxsIHZhbHVlXG4gICAgICAgICAgICBhbGxvd051bGw6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUga2V5Y29kZSB0byBzYXZlIHRoZSBmaWVsZCBkYXRhXG4gICAgICAgICAgICBzYXZlS2V5Y29kZTogMTMsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBrZXljb2RlIHRvIGNhbmNlbCB0aGUgZmllbGQgZGF0YVxuICAgICAgICAgICAgY2FuY2VsS2V5Y29kZTogMjcsXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgaW5wdXQ6ICcuaW5saW5lLWVkaXRvci1maWVsZCcsXG4gICAgICAgICAgICBpbmRpY2F0b3I6ICcuaW5saW5lLWVkaXRvci1hY3Rpdml0eS1pbmRpY2F0b3InXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayAuaW5saW5lLWVkaXRvci1sYWJlbCc6ICdsYWJlbDpjbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVGb3JtSW5wdXRWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcywgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdmb3JtSW5wdXRWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guSW5wdXRGaWVsZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdhdHRyaWJ1dGUnKSksXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdmb3JtSW5wdXRWaWV3T3B0aW9ucycpKTtcblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhvcHRpb25zKTtcblxuICAgICAgICAgICAgdmlldy5vbignYmx1cicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuYmx1cigpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZpZXcuJGVsLm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZihlLmtleUNvZGUgPT09IHQuZ2V0T3B0aW9uKCdzYXZlS2V5Y29kZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHQuZ2V0T3B0aW9uKCdhbGxvd051bGwnKSB8fCAhdC5nZXRPcHRpb24oJ2FsbG93TnVsbCcpICYmICF0LmlzTnVsbCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LmJsdXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmlldy4kZWwub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IHQuZ2V0T3B0aW9uKCdjYW5jZWxLZXljb2RlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0FjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3Ioe1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3RpbnknXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3Iuc2hvdyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IuZW1wdHkoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc051bGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRWYWx1ZSgpID09PSAnJyA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRMYWJlbEh0bWw6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5pbmxpbmUtZWRpdG9yLWxhYmVsJykuaHRtbChodG1sKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1vZGVsVmFsdWUoKSAhPT0gdGhpcy5nZXRJbnB1dFZhbHVlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FuY2VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjYW5jZWwnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBibHVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuaGFzQ2hhbmdlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZWRpdHRpbmdDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnYmx1cicpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdlZGl0dGluZ0NsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuY3VycmVudFZpZXcuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZm9jdXMnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRNb2RlbFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignYXR0cmlidXRlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQuY3VycmVudFZpZXcuZ2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEZvcm1EYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0T3B0aW9uKCdhdHRyaWJ1dGUnKTtcblxuICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHRoaXMuZ2V0SW5wdXRWYWx1ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TGFiZWxIdG1sKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkJlZm9yZVNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93QWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkFmdGVyU2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVBY3Rpdml0eUluZGljYXRvcigpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWxsb3dOdWxsJykgfHwgIXRoaXMuZ2V0T3B0aW9uKCdhbGxvd051bGwnKSAmJiAhdGhpcy5pc051bGwoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdiZWZvcmU6c2F2ZScpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlKHRoaXMuZ2V0Rm9ybURhdGEoKSwge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc2F2ZTpzdWNjZXNzJywgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnYWZ0ZXI6c2F2ZScsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2NoYW5nZScsIHQuZ2V0SW5wdXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzYXZlOmVycm9yJywgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnYWZ0ZXI6c2F2ZScsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlJywgdGhpcy5nZXRJbnB1dFZhbHVlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uTGFiZWxDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRMYWJlbEh0bWwodGhpcy5nZXRNb2RlbFZhbHVlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNob3codGhpcy5jcmVhdGVGb3JtSW5wdXRWaWV3KCkpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guSW5wdXRGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0taW5wdXQtZmllbGQnKSxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCdcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5MaWdodFN3aXRjaEZpZWxkID0gVG9vbGJveC5CYXNlRmllbGQuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS1saWdodC1zd2l0Y2gtZmllbGQnKSxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB2YWx1ZTogMCxcblxuICAgICAgICAgICAgYWN0aXZlQ2xhc3NOYW1lOiAnb24nLFxuXG4gICAgICAgICAgICBvblZhbHVlOiAxLFxuXG4gICAgICAgICAgICBvZmZWYWx1ZTogMCxcblxuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAnLmxpZ2h0LXN3aXRjaCcsXG5cbiAgICAgICAgICAgIGlucHV0Q2xhc3NOYW1lOiAnbGlnaHQtc3dpdGNoJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmxpZ2h0LXN3aXRjaC1jb250YWluZXInOiAnY2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAna2V5dXAnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmdldE9wdGlvbignb2ZmVmFsdWUnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5nZXRPcHRpb24oJ29uVmFsdWUnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkJhc2VGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMudmFsdWUgPT09IGZhbHNlIHx8IF8uaXNOYU4odGhpcy5vcHRpb25zLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy52YWx1ZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKSA9PT0gMTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKHZhbHVlKTtcblxuICAgICAgICAgICAgaWYodGhpcy5pc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVDbGFzcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBY3RpdmVDbGFzcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NoYW5nZScsIHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMaWdodFN3aXRjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnLmxpZ2h0LXN3aXRjaCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldExpZ2h0U3dpdGNoKCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcubGlnaHQtc3dpdGNoLWNvbnRhaW5lcicpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICdtYXJnaW4tbGVmdCc6IDBcbiAgICAgICAgICAgIH0sIDEwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC5nZXRMaWdodFN3aXRjaCgpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0LmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0LmdldE9wdGlvbignZHJhZ2dpbmdDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVBY3RpdmVDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0TGlnaHRTd2l0Y2goKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZHJhZ2dpbmdDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5saWdodC1zd2l0Y2gtY29udGFpbmVyJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgJ21hcmdpbi1sZWZ0JzogLTExXG4gICAgICAgICAgICB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuZ2V0TGlnaHRTd2l0Y2goKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModC5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModC5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmlzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFZhbHVlKHRoaXMuZ2V0T3B0aW9uKCdvblZhbHVlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmdldE9wdGlvbignb2ZmVmFsdWUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpc1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm9MaXN0R3JvdXBJdGVtID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLWxpc3QtZ3JvdXAtaXRlbScpLFxuXG5cdFx0Y2xhc3NOYW1lOiAnbGlzdC1ncm91cC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0bWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nXG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guTGlzdEdyb3VwSXRlbSA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdsaXN0LWdyb3VwLWl0ZW0nKSxcblxuXHRcdGNsYXNzTmFtZTogJ2xpc3QtZ3JvdXAtaXRlbScsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2snLCBlKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5MaXN0R3JvdXAgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guTGlzdEdyb3VwSXRlbSxcblxuXHRcdGNsYXNzTmFtZTogJ2xpc3QtZ3JvdXAnLFxuXG5cdFx0dGFnTmFtZTogJ3VsJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoYm9vbCkgQWN0aXZhdGUgbGlzdCBpdGVtIG9uIGNsaWNrXG5cdFx0XHRhY3RpdmF0ZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChzdHJpbmcpIEFjdGl2ZSBjbGFzcyBuYW1lXG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZXJlIGFyZSBubyBsaXN0IGl0ZW1zXG5cdFx0XHRlbXB0eU1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJyxcblxuXHRcdFx0Ly8gKG9iamVjdCkgVGhlIHZpZXcgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGVtcHR5IG1lc3NhZ2Vcblx0XHRcdGVtcHR5TWVzc2FnZVZpZXc6IFRvb2xib3guTm9MaXN0R3JvdXBJdGVtLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgZW1wdHkgbWVzc2FnZSB2aWV3XG5cdFx0XHRzaG93RW1wdHlNZXNzYWdlOiB0cnVlXG5cdFx0fSxcblxuXHRcdGNoaWxkRXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3LCBlKSB7XG5cdFx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmF0ZU9uQ2xpY2snKSkge1xuXHRcdFx0XHRcdGlmKHZpZXcuJGVsLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSkpIHtcblx0XHRcdFx0XHRcdHZpZXcuJGVsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0dmlldy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdhY3RpdmF0ZScsIHZpZXcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcsIGUpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgZ2V0RW1wdHlWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZih0aGlzLmdldE9wdGlvbignc2hvd0VtcHR5TWVzc2FnZScpKSB7XG5cdCAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZVZpZXcnKTtcblxuXHQgICAgICAgICAgICBWaWV3ID0gVmlldy5leHRlbmQoe1xuXHQgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuXHQgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2UnKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICByZXR1cm4gVmlldztcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKCQsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94Lk1vZGFsID0gVG9vbGJveC5MYXlvdXRWaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ21vZGFsLXdpbmRvdycpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ21vZGFsLXdpbmRvdy13cmFwcGVyJyxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBjb250ZW50OiAnLm1vZGFsLWNvbnRlbnQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayAubW9kYWwtY2xvc2UnOiAnY2xvc2U6Y2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgYnV0dG9uIG9iamVjdHMgdG8gYWRkIHRvIHRoZSBtb2RhbCB3aW5kb3dcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbW9kYWwgd2luZG93IGhlYWRlciB0ZXh0XG4gICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB1c2VkIGZvciB0aGUgbW9kYWwgYW5pbWF0aW9uXG4gICAgICAgICAgICBjbG9zZUFuaW1hdGlvblJhdGU6IDUwMFxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5tb2RhbC1idXR0b25zIGEnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ1dHRvbnMgPSB0aGlzLmdldE9wdGlvbignYnV0dG9ucycpO1xuICAgICAgICAgICAgICAgIHZhciBpID0gJChlLnRhcmdldCkuaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKF8uaXNBcnJheShidXR0b25zKSAmJiBidXR0b25zW2ldLm9uQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5vbkNsaWNrLmNhbGwodGhpcywgJChlLnRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDb250ZW50VmlldzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdGhpcy5zZXRDb250ZW50Vmlldyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb250ZW50VmlldzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNob3codmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGVudFZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50VmlldycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCB2aWV3ID0gdGhpcy5nZXRDb250ZW50VmlldygpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdjYW5jZWw6Y2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LmhpZGUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJGVsKTtcblxuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNob3codmlldyk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC4kZWwuYWRkQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc2hvdycpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuJGVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2Nsb3NlQW5pbWF0aW9uUmF0ZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsb3NlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZ1bmN0aW9uKCQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm90aWZpY2F0aW9uID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0Y2xhc3NOYW1lOiAnbm90aWZpY2F0aW9uIGNsZWFyZml4JyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoaW50KSBUaGUgZmx5LW91dCBhbmltYXRpb24gcmF0ZSBpbiBtaWxsaXNlY29uZHNcblx0XHRcdGFuaW1hdGlvbjogNTAwLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgY2xvc2UgY2xhc3MgbmFtZVxuXHRcdFx0Y2xvc2VDbGFzc05hbWU6ICdjbG9zZScsXG5cblx0XHRcdC8vIChpbnQpIENsb3NlIGFmdGVyIGEgZGVsYXkgaW4gbWlsbGVjb25kcy4gUGFzcyBmYWxzZSB0byBub3QgY2xvc2Vcblx0XHRcdGNsb3NlT25EZWxheTogNDAwMCxcblxuXHRcdFx0Ly8gKGJvb2wpIENsb3NlIHRoZSBub3RpZmljYXRpb24gd2hlbiBjbGlja2VkIGFueXdoZXJlXG5cdFx0XHRjbG9zZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBUaGUgaWNvbiBjbGFzcyB1c2VkIGluIHRoZSBhbGVydFxuXHRcdFx0aWNvbjogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmd8ZmFsc2UpIFRoZSBub3RpZmljYXRpb24gbWVzc2FnZVxuXHRcdFx0bWVzc2FnZTogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmd8ZmFsc2UpIFRoZSBub3RpZmljYXRpb24gdGl0bGVcblx0XHRcdHRpdGxlOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVHlwZSBvZiBub3RpZmljYXRpb24gKGFsZXJ0fHdhcm5pbmd8c3VjY2Vzcylcblx0XHRcdHR5cGU6ICdhbGVydCcsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBjbGFzcyBuYW1lIHRoYXQgbWFrZXMgdGhlIG5vdGlmaWNhdGlvbiB2aXNpYmxlXG5cdFx0XHR2aXNpYmxlQ2xhc3NOYW1lOiAndmlzaWJsZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBjbGFzcyBuYW1lIHRoYXQgaXMgdXNlZCBpbiB0aGUgd3JhcHBlciB0byB3aGljaFxuXHRcdFx0Ly8gbm90aWZpY2F0aW9uIGFyZSBhcHBlbmRlZFxuXHRcdFx0d3JhcHBlckNsYXNzTmFtZTogJ25vdGlmaWNhdGlvbnMnXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdub3RpZmljYXRpb24nKSxcblxuXHRcdG1vZGVsOiBmYWxzZSxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2snOiAnY2xpY2snLFxuXHRcdFx0J2NsaWNrIC5jbG9zZSc6ICdjbG9zZTpjbGljaydcblx0XHR9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0b25DbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbignY2xvc2VPbkNsaWNrJykpIHtcblx0XHRcdFx0dGhpcy5oaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uQ2xvc2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmhpZGUoKTtcblx0XHR9LFxuXG5cdFx0aXNWaXNpYmxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbigndmlzaWJsZUNsYXNzTmFtZScpKTtcblx0XHR9LFxuXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdCA9IHRoaXM7XG5cblx0XHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCd2aXNpYmxlQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0LiRlbC5yZW1vdmUoKTtcblx0XHRcdH0sIHRoaXMuZ2V0T3B0aW9uKCdhbmltYXRpb24nKSk7XG5cblx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaGlkZScpO1xuXHRcdH0sXG5cblx0XHRjcmVhdGVOb3RpZmljYXRpb25zRG9tV3JhcHBlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgJHdyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwiJyt0aGlzLmdldE9wdGlvbignd3JhcHBlckNsYXNzTmFtZScpKydcIiAvPicpO1xuXG5cdFx0XHQkKCdib2R5JykuYXBwZW5kKCR3cmFwcGVyKTtcblxuXHRcdFx0cmV0dXJuICR3cmFwcGVyO1xuXHRcdH0sXG5cblx0XHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciB0ID0gdGhpcywgJHdyYXBwZXIgPSAkKCdib2R5JykuZmluZCgnLicgKyB0aGlzLmdldE9wdGlvbignd3JhcHBlckNsYXNzTmFtZScpKTtcblxuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblxuXHRcdFx0aWYoISR3cmFwcGVyLmxlbmd0aCkge1xuXHRcdFx0XHQkd3JhcHBlciA9IHRoaXMuY3JlYXRlTm90aWZpY2F0aW9uc0RvbVdyYXBwZXIoKTtcblx0XHRcdH1cblxuXHRcdFx0JHdyYXBwZXIuYXBwZW5kKHRoaXMuJGVsKTtcblxuXHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3R5cGUnKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHQuJGVsLmFkZENsYXNzKHQuZ2V0T3B0aW9uKCd2aXNpYmxlQ2xhc3NOYW1lJykpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdjbG9zZU9uRGVsYXknKSAhPT0gZmFsc2UpIHtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZih0LmlzVmlzaWJsZSgpKSB7XG5cdFx0XHRcdFx0XHR0LmhpZGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHRoaXMuZ2V0T3B0aW9uKCdjbG9zZU9uRGVsYXknKSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnc2hvdycpO1xuXHRcdH1cblxuXHR9KTtcblxuXHRyZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vT3JkZXJlZExpc3RJdGVtID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLW9yZGVyZWQtbGlzdC1pdGVtJyksXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdG1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJ1xuXHRcdH0sXG5cblx0XHR0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9ucztcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5PcmRlcmVkTGlzdEl0ZW0gPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnb3JkZXJlZC1saXN0LWl0ZW0nKSxcblxuXHRcdGNsYXNzTmFtZTogJ29yZGVyZWQtbGlzdC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKGUsIG9iaikge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrJywgb2JqKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5PcmRlcmVkTGlzdCA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuXHRcdGNoaWxkVmlldzogVG9vbGJveC5PcmRlcmVkTGlzdEl0ZW0sXG5cbiAgICBcdGVtcHR5VmlldzogVG9vbGJveC5Ob1Vub3JkZXJlZExpc3RJdGVtLFxuXG5cdFx0Y2xhc3NOYW1lOiAnb3JkZXJlZC1saXN0JyxcblxuXHRcdHRhZ05hbWU6ICdvbCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKG9iamVjdCkgVGhlIHZpZXcgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGVtcHR5IG1lc3NhZ2Vcblx0XHRcdGVtcHR5TWVzc2FnZVZpZXc6IFRvb2xib3guTm9PcmRlcmVkTGlzdEl0ZW0sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIGxpc3QgaXRlbXNcblx0XHRcdGVtcHR5TWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgZW1wdHkgbWVzc2FnZSB2aWV3XG5cdFx0XHRzaG93RW1wdHlNZXNzYWdlOiB0cnVlXG5cdFx0fSxcblxuXHRcdGNoaWxkRXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgZ2V0RW1wdHlWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZih0aGlzLmdldE9wdGlvbignc2hvd0VtcHR5TWVzc2FnZScpKSB7XG5cdCAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZVZpZXcnKTtcblxuXHQgICAgICAgICAgICBWaWV3ID0gVmlldy5leHRlbmQoe1xuXHQgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuXHQgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2UnKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICByZXR1cm4gVmlldztcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guUGFnZXIgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncGFnZXInKSxcblxuXHRcdHRhZ05hbWU6ICduYXYnLFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayAubmV4dC1wYWdlJzogJ25leHQ6cGFnZTpjbGljaycsXG5cdFx0XHQnY2xpY2sgLnByZXYtcGFnZSc6ICdwcmV2OnBhZ2U6Y2xpY2snXG5cdFx0fSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgcGFnZXIgY2xhc3MgbmFtZVxuXHRcdFx0cGFnZXJDbGFzc05hbWU6ICdwYWdlcicsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBhY3RpdmUgY2xhc3MgbmFtZVxuXHRcdFx0YWN0aXZlQ2xhc3NOYW1lOiAnYWN0aXZlJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRpc2FibGVkIGNsYXNzIG5hbWVcblx0XHRcdGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgcHJldmlvdXMgYnV0dG9uIGNsYXNzIG5hbWVcblx0XHRcdHByZXZDbGFzc05hbWU6ICdwcmV2aW91cycsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBuZXh0IGJ1dHRvbiBjbGFzcyBuYW1lXG5cdFx0XHRuZXh0Q2xhc3NOYW1lOiAnbmV4dCcsXG5cblx0XHRcdC8vIChib29sKSBJbmNsdWRlIHRoZSBwYWdlIHRvdGFscyBiZXR3ZWVuIHRoZSBwYWdlciBidXR0b25zXG5cdFx0XHRpbmNsdWRlUGFnZVRvdGFsczogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIEFsaWduIHBhZ2VyIGJ1dHRzb24gdG8gbGVmdCBhbmQgcmlnaHQgZWRnZVxuXHRcdFx0c25hcFRvRWRnZXM6IHRydWUsXG5cblx0XHRcdC8vIChpbnQpIFRoZSBjdXJyZW50IHBhZ2UgbnVtYmVyXG5cdFx0XHRwYWdlOiAxLFxuXG5cdFx0XHQvLyAoaW50KSBUaGUgdG90YWwgbnVtYmVyIG9mIHBhZ2VzXG5cdFx0XHR0b3RhbFBhZ2VzOiAxLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBOZXh0IGJ1dHRvbiBsYWJlbFxuXHRcdFx0bmV4dExhYmVsOiAnTmV4dCcsXG5cblx0XHRcdC8vIChzdHJpbmcpIFByZXZpb3VzIGJ1dHRvbiBsYWJlbFxuXHRcdFx0cHJldkxhYmVsOiAnUHJldmlvdXMnXG5cdFx0fSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdG5leHRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHRcdHZhciB0b3RhbCA9IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cblx0XHRcdGlmKHBhZ2UgPCB0b3RhbCkge1xuXHRcdFx0XHRwYWdlKys7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25OZXh0UGFnZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubmV4dFBhZ2UoKTtcblx0XHR9LFxuXG5cdFx0cHJldlBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXG5cdFx0XHRpZihwYWdlID4gMSkge1xuXHRcdFx0XHRwYWdlLS07XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IDEpIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uUHJldlBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0fSxcblxuXHRcdHNldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3BhZ2luYXRlJywgcGFnZSk7XG5cdFx0fSxcblxuXHRcdGdldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKCQsIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LlBhZ2luYXRpb25JdGVtID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdwYWdpbmF0aW9uLWl0ZW0nKSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgYWN0aXZlIHBhZ2UgY2xhc3MgbmFtZVxuXHRcdFx0ZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCdcblx0XHR9LFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayBhJzogJ2NsaWNrJ1xuXHRcdH0sXG5cblx0XHRvblJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCgnZGl2aWRlcicpID09PSB0cnVlKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5QYWdpbmF0aW9uID0gVG9vbGJveC5Db21wb3NpdGVWaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXdDb250YWluZXI6ICd1bCcsXG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guUGFnaW5hdGlvbkl0ZW0sXG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncGFnaW5hdGlvbicpLFxuXG5cdFx0dGFnTmFtZTogJ25hdicsXG5cblx0XHRjaGlsZEV2ZW50czoge1xuXHRcdFx0J3BhZ2U6bmV4dCc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLm5leHRQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J3BhZ2U6cHJldic6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHRpZighdmlldy4kZWwuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHZpZXcubW9kZWwuZ2V0KCdwYWdlJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIC5uZXh0LXBhZ2UnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5uZXh0UGFnZSgpO1xuXHRcdFx0fSxcblx0XHRcdCdjbGljayAucHJldi1wYWdlJzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMucHJldlBhZ2UoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdHBhZ2luYXRpb25DbGFzc05hbWU6ICdwYWdpbmF0aW9uJyxcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cdFx0XHRkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJyxcblx0XHRcdHRvdGFsUGFnZXM6IDEsXG5cdFx0XHRzaG93UGFnZXM6IDYsXG5cdFx0XHRwYWdlOiAxXG5cdFx0fSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0VG9vbGJveC5Db21wb3NpdGVWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuICAgICAgICAgICAgfVxuXHRcdH0sXG5cblx0XHRhdHRhY2hCdWZmZXI6IGZ1bmN0aW9uKGNvbGxlY3Rpb25WaWV3LCBidWZmZXIpIHtcblx0XHRcdCQoYnVmZmVyKS5pbnNlcnRBZnRlcihjb2xsZWN0aW9uVmlldy4kZWwuZmluZCgnbGk6Zmlyc3QtY2hpbGQnKSk7XG5cdFx0fSxcblxuXHRcdG9uQmVmb3JlUmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuXG5cdFx0XHR2YXIgY3VycmVudFBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdFx0dmFyIHRvdGFsUGFnZXMgPSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpO1xuXHRcdFx0dmFyIHNob3dQYWdlcyA9IHRoaXMuZ2V0T3B0aW9uKCdzaG93UGFnZXMnKTtcblxuXHRcdFx0aWYoc2hvd1BhZ2VzICUgMikge1xuXHRcdFx0XHRzaG93UGFnZXMrKzsgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlclxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3RhcnRQYWdlID0gKGN1cnJlbnRQYWdlIDwgc2hvd1BhZ2VzKSA/IDEgOiBjdXJyZW50UGFnZSAtIChzaG93UGFnZXMgLyAyKTtcblxuXHRcdFx0dmFyIGVuZFBhZ2UgPSBzaG93UGFnZXMgKyBzdGFydFBhZ2U7XG5cblx0XHRcdGVuZFBhZ2UgPSAodG90YWxQYWdlcyA8IGVuZFBhZ2UpID8gdG90YWxQYWdlcyA6IGVuZFBhZ2U7XG5cblx0XHRcdHZhciBkaWZmID0gc3RhcnRQYWdlIC0gZW5kUGFnZSArIHNob3dQYWdlcztcblxuXHRcdFx0c3RhcnRQYWdlIC09IChzdGFydFBhZ2UgLSBkaWZmID4gMCkgPyBkaWZmIDogMDtcblxuXHRcdFx0aWYgKHN0YXJ0UGFnZSA+IDEpIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZCh7cGFnZTogMX0pO1xuXG5cdFx0XHRcdGlmKHN0YXJ0UGFnZSA+IDIpIHtcblx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtkaXZpZGVyOiB0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Zm9yKHZhciBpID0gc3RhcnRQYWdlOyBpIDw9IGVuZFBhZ2U7IGkrKykge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiBpfSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xuXHRcdFx0XHRpZih0b3RhbFBhZ2VzIC0gMSA+IGVuZFBhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtkaXZpZGVyOiB0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZCh7cGFnZTogdG90YWxQYWdlc30pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRuZXh0UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0XHR2YXIgdG90YWwgPSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpO1xuXG5cdFx0XHRpZihwYWdlIDwgdG90YWwpIHtcblx0XHRcdFx0cGFnZSsrO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldEFjdGl2ZVBhZ2UocGFnZSk7XG5cdFx0fSxcblxuXHRcdG9uTmV4dFBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm5leHRQYWdlKCk7XG5cdFx0fSxcblxuXHRcdHByZXZQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblxuXHRcdFx0aWYocGFnZSA+IDEpIHtcblx0XHRcdFx0cGFnZS0tO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldEFjdGl2ZVBhZ2UocGFnZSk7XG5cdFx0fSxcblxuXHRcdG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCdbZGF0YS1wYWdlPVwiJyt0aGlzLmdldE9wdGlvbigncGFnZScpKydcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHR0aGlzLiRlbC5maW5kKCcucHJldi1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLm5leHQtcGFnZScpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSAxKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdwYWdlJykgPT0gdGhpcy5nZXRPcHRpb24oJ3RvdGFsUGFnZXMnKSkge1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvblByZXZQYWdlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5wcmV2UGFnZSgpO1xuXHRcdH0sXG5cblx0XHRzZXRTaG93UGFnZXM6IGZ1bmN0aW9uKHNob3dQYWdlcykge1xuXHRcdFx0dGhpcy5vcHRpb25zLnNob3dQYWdlcyA9IHNob3dQYWdlcztcblx0XHR9LFxuXG5cdFx0Z2V0U2hvd1BhZ2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbignc2hvd1BhZ2VzJyk7XG5cdFx0fSxcblxuXHRcdHNldFRvdGFsUGFnZXM6IGZ1bmN0aW9uKHRvdGFsUGFnZXMpIHtcblx0XHRcdHRoaXMub3B0aW9ucy50b3RhbFBhZ2VzID0gdG90YWxQYWdlcztcblx0XHR9LFxuXG5cdFx0Z2V0VG90YWxQYWdlczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2dldFRvdGFsUGFnZXMnKTtcblx0XHR9LFxuXG5cdFx0c2V0UGFnZTogZnVuY3Rpb24ocGFnZSkge1xuXHRcdFx0dGhpcy5vcHRpb25zLnBhZ2UgPSBwYWdlO1xuXHRcdH0sXG5cblx0XHRnZXRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdH0sXG5cblx0XHRzZXRQYWdpbmF0aW9uTGlua3M6IGZ1bmN0aW9uKHBhZ2UsIHRvdGFsUGFnZXMpIHtcblx0XHRcdHRoaXMuc2V0UGFnZShwYWdlKTtcblx0XHRcdHRoaXMuc2V0VG90YWxQYWdlcyh0b3RhbFBhZ2VzKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSxcblxuXHRcdHNldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdGlmKHRoaXMub3B0aW9ucy5wYWdlICE9IHBhZ2UpIHtcblx0XHRcdFx0dGhpcy5vcHRpb25zLnBhZ2UgPSBwYWdlO1xuXHRcdFx0XHR0aGlzLnJlbmRlcigpO1xuXG5cdFx0XHRcdHZhciBxdWVyeSA9IHRoaXMuY29sbGVjdGlvbi53aGVyZSh7cGFnZTogcGFnZX0pO1xuXG5cdFx0XHRcdGlmKHF1ZXJ5Lmxlbmd0aCkge1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgncGFnaW5hdGUnLCBwYWdlLCB0aGlzLmNoaWxkcmVuLmZpbmRCeU1vZGVsKHF1ZXJ5WzBdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0QWN0aXZlUGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHR9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LlByb2dyZXNzQmFyID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3Byb2dyZXNzLWJhcicpLFxuXG5cdFx0Y2xhc3NOYW1lOiAncHJvZ3Jlc3MnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdC8vIChzdHJpbmcpIFRoZSBwcm9ncmVzcyBiYXIgY2xhc3MgbmFtZVxuXHRcdFx0cHJvZ3Jlc3NCYXJDbGFzc05hbWU6ICdwcm9ncmVzcy1iYXInLFxuXG5cdFx0XHQvLyAoaW50KSBUaGUgcHJvZ3Jlc3MgcGVyY2VudGFnZVxuXHRcdFx0cHJvZ3Jlc3M6IDBcblx0XHR9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0c2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uKHByb2dyZXNzKSB7XG5cdFx0XHRpZihwcm9ncmVzcyA8IDApIHtcblx0XHRcdFx0cHJvZ3Jlc3MgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihwcm9ncmVzcyA+IDEwMCkge1xuXHRcdFx0XHRwcm9ncmVzcyA9IDEwMDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vcHRpb25zLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3Byb2dyZXNzJywgcHJvZ3Jlc3MpO1xuXG5cdFx0XHRpZihwcm9ncmVzcyA9PT0gMTAwKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY29tcGxldGUnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwcm9ncmVzcycpO1xuXHRcdH0sXG5cblx0XHRvblByb2dyZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnbm91aXNsaWRlciddLCBmdW5jdGlvbihub1VpU2xpZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIG5vVWlTbGlkZXIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdub3Vpc2xpZGVyJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Lm5vVWlTbGlkZXIpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIG5vVWlTbGlkZXIpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guUmFuZ2VTbGlkZXIgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3JhbmdlLXNsaWRlcicpLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoYm9vbCkgU2hvdWxkIHRoZSBzbGlkZXIgYmUgYW5pbWF0ZVxuICAgICAgICAgICAgYW5pbWF0ZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgQ2xpY2sgZWZmZWN0cyBmb3IgbWFuaXB1bGF0aW5nIHRoZSBzbGlkZXIuXG4gICAgICAgICAgICAvLyBQb3NzaWJsZSB2YWx1ZXM6IFwiZHJhZ1wiLCBcInRhcFwiLCBcImZpeGVkXCIsIFwic25hcFwiIG9yIFwibm9uZVwiXG4gICAgICAgICAgICBiZWhhdmlvcjogJ3RhcCcsXG5cbiAgICAgICAgICAgIC8vIChtaXhlZCkgU2hvdWxkIHRoZSBoYW5kbGVzIGJlIGNvbm5lY3RlZC5cbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIHZhbHVlczogdHJ1ZSwgZmFsc2UsIFwidXBwZXJcIiwgb3IgXCJsb3dlclwiXG4gICAgICAgICAgICBjb25uZWN0OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGRpcmVjdGlvbiBvZiB0aGUgc2xpZGVyLiBcImx0clwiIG9yIFwicnRsXCJcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ2x0cicsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBtYXhpbXVtIGRpc3RhbmNlIHRoZSBoYW5kbGVzIGNhbiBiZSBmcm9tIGVhY2ggb3RoZXJcbiAgICAgICAgICAgIC8vIGZhbHNlIGRpc2FibGVzIHRoaXMgb3B0aW9uLlxuICAgICAgICAgICAgbGltaXQ6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgbWluaW11bSBkaXN0YW5jZSB0aGUgaGFuZGxlcyBjYW4gYmUgZnJvbSBlYWNoIG90aGVyXG4gICAgICAgICAgICAvLyBmYWxzZSBkaXNhYmxlZCB0aGlzIG9wdGlvblxuICAgICAgICAgICAgbWFyZ2luOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG9yaWVudGF0aW9uIG9mIHRoZSBzbGlkZXIuIFwiaG9yaXpvbnRhbFwiIG9yIFwidmVydGljYWxcIlxuICAgICAgICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBzdGFydGluZyBwb3NzaXRpb24gb2YgdGhlIHNsaWRlciBoYW5kbGVzXG4gICAgICAgICAgICBzdGFydDogWzBdLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgc3RlcCBpbnRlZ2VyXG4gICAgICAgICAgICBzdGVwOiAwLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSB0aGUgcmFuZ2Ugb2JqZWN0IGRlZmluZWQgdGhlIG1pbi9tYXggdmFsdWVzXG4gICAgICAgICAgICByYW5nZToge1xuICAgICAgICAgICAgICAgIG1pbjogWzBdLFxuICAgICAgICAgICAgICAgIG1heDogWzEwMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGU6IHRoaXMuZ2V0T3B0aW9uKCdhbmltYXRlJyksXG4gICAgICAgICAgICAgICAgYmVoYXZpb3I6IHRoaXMuZ2V0T3B0aW9uKCdiZWhhdmlvcicpLFxuICAgICAgICAgICAgICAgIGNvbm5lY3Q6IHRoaXMuZ2V0T3B0aW9uKCdjb25uZWN0JyksXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmdldE9wdGlvbignZGlyZWN0aW9uJyksXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246IHRoaXMuZ2V0T3B0aW9uKCdvcmllbnRhdGlvbicpLFxuICAgICAgICAgICAgICAgIHJhbmdlOiB0aGlzLmdldE9wdGlvbigncmFuZ2UnKSxcbiAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5nZXRPcHRpb24oJ3N0YXJ0JyksXG4gICAgICAgICAgICAgICAgc3RlcDogdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ21hcmdpbicpICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubWFyZ2luID0gdGhpcy5nZXRPcHRpb24oJ21hcmdpbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbGltaXQnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxpbWl0ID0gdGhpcy5nZXRPcHRpb24oJ2xpbWl0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzbGlkZXIgPSB0aGlzLiRlbC5maW5kKCcuc2xpZGVyJykuZ2V0KDApO1xuXG4gICAgICAgICAgICBzbGlkZXIgPSBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBzbGlkZXIub24oJ3NsaWRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzbGlkZScsIHQuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVyLm9uKCdzZXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3NldCcsIHQuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2NoYW5nZScsIHQuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTbGlkZXJFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcuc2xpZGVyJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2xpZGVyRWxlbWVudCgpLnZhbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkudmFsKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2xpZGVyRWxlbWVudCgpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2xpZGVyRWxlbWVudCgpLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guUmFkaW9GaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tcmFkaW8tZmllbGQnKSxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBvcHRpb25zOiBmYWxzZSxcbiAgICAgICAgICAgIHR5cGU6ICdyYWRpbycsXG4gICAgICAgICAgICBpbnB1dENsYXNzTmFtZTogJ3JhZGlvJyxcbiAgICAgICAgICAgIGNoZWNrYm94Q2xhc3NOYW1lOiAncmFkaW8nXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRJbnB1dFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ1t2YWx1ZT1cIicrdmFsdWUrJ1wiXScpLmF0dHIoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZScsICdpbnRlcmFjdC5qcyddLCBmdW5jdGlvbigkLCBfLCBpbnRlcmFjdCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfLCBpbnRlcmFjdCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpLFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnaW50ZXJhY3QuanMnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXywgcm9vdC5pbnRlcmFjdCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXywgaW50ZXJhY3QpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGZ1bmN0aW9uIGdldElkQXR0cmlidXRlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBfLmlzTnVsbChuZXcgU3RyaW5nKHZhbHVlKS5tYXRjaCgvXmNcXGQrJC8pKSA/ICdpZCcgOiAnY2lkJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZWxlbWVudCwgdmlldykge1xuICAgICAgICB2YXIgJHBhcmVudCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgaWYoISRwYXJlbnQuaGFzQ2xhc3MoJ2Ryb3BwYWJsZS1wb29sJykpIHtcbiAgICAgICAgICAgICRwYXJlbnQgPSAkcGFyZW50LnBhcmVudHMoJy5kcm9wcGFibGUtcG9vbCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRwYXJlbnQuaGFzQ2xhc3MoJ2F2YWlsYWJsZS1wb29sJykgP1xuICAgICAgICAgICAgdmlldy5hdmFpbGFibGUuY3VycmVudFZpZXcgOlxuICAgICAgICAgICAgdmlldy5zZWxlY3RlZC5jdXJyZW50VmlldztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zlck5vZGVBZnRlcihldmVudCwgdmlldykge1xuICAgICAgICB2YXIgZnJvbVdoZXJlID0ge30sIHRvV2hlcmUgPSB7fTtcbiAgICAgICAgdmFyIGZyb20gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCwgdmlldyk7XG4gICAgICAgIHZhciB0byA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC50YXJnZXQsIHZpZXcpO1xuXG4gICAgICAgIGZyb21XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICAgICAgdG9XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgdmFyIGZyb21Nb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUoZnJvbVdoZXJlKTtcbiAgICAgICAgdmFyIHRvTW9kZWwgPSB0by5jb2xsZWN0aW9uLmZpbmRXaGVyZSh0b1doZXJlKTtcblxuICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShmcm9tTW9kZWwpO1xuICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihmcm9tTW9kZWwsIHRvTW9kZWwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zZmVyTm9kZUJlZm9yZShldmVudCwgdmlldykge1xuICAgICAgICB2YXIgZnJvbVdoZXJlID0ge30sIHRvV2hlcmUgPSB7fTtcbiAgICAgICAgdmFyIGZyb20gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCwgdmlldyk7XG4gICAgICAgIHZhciB0byA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC50YXJnZXQsIHZpZXcpO1xuXG5cbiAgICAgICAgZnJvbVdoZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAgICAgICB0b1doZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICB2YXIgZnJvbU1vZGVsID0gZnJvbS5jb2xsZWN0aW9uLmZpbmRXaGVyZShmcm9tV2hlcmUpO1xuICAgICAgICB2YXIgdG9Nb2RlbCA9IHRvLmNvbGxlY3Rpb24uZmluZFdoZXJlKHRvV2hlcmUpO1xuXG4gICAgICAgIGZyb20uY29sbGVjdGlvbi5yZW1vdmVOb2RlKGZyb21Nb2RlbCk7XG4gICAgICAgIHRvLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUJlZm9yZShmcm9tTW9kZWwsIHRvTW9kZWwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zZmVyTm9kZUNoaWxkcmVuKGV2ZW50LCB2aWV3KSB7XG4gICAgICAgIHZhciBmcm9tV2hlcmUgPSB7fSwgdG9XaGVyZSA9IHt9O1xuICAgICAgICB2YXIgZnJvbSA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC5yZWxhdGVkVGFyZ2V0LCB2aWV3KTtcbiAgICAgICAgdmFyIHRvID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnRhcmdldCwgdmlldyk7XG5cbiAgICAgICAgaWYoJChldmVudC50YXJnZXQpLmZpbmQoJy5jaGlsZHJlbicpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiY2hpbGRyZW5cIiAvPicpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJvbVdoZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAgICAgICB0b1doZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICB2YXIgZnJvbU1vZGVsID0gZnJvbS5jb2xsZWN0aW9uLmZpbmRXaGVyZShmcm9tV2hlcmUpO1xuICAgICAgICB2YXIgdG9Nb2RlbCA9IHRvLmNvbGxlY3Rpb24uZmluZFdoZXJlKHRvV2hlcmUpO1xuXG4gICAgICAgIGZyb20uY29sbGVjdGlvbi5yZW1vdmVOb2RlKGZyb21Nb2RlbCk7XG4gICAgICAgIHRvLmNvbGxlY3Rpb24uYXBwZW5kTm9kZShmcm9tTW9kZWwsIHRvTW9kZWwsIHtcbiAgICAgICAgICAgIGF0OiAwXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIFRvb2xib3guU2VsZWN0aW9uUG9vbCA9IFRvb2xib3guTGF5b3V0Vmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdzZWxlY3Rpb24tcG9vbCcpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3NlbGVjdGlvbi1wb29sJyxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBhdmFpbGFibGU6ICcuYXZhaWxhYmxlLXBvb2wnLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6ICcuc2VsZWN0ZWQtcG9vbCcsXG4gICAgICAgICAgICBhY3Rpdml0eTogJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtYWN0aXZpdHknXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlOiBbXSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlldzogVG9vbGJveC5TZWxlY3Rpb25Qb29sVHJlZVZpZXcsXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlld1RlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdzZWxlY3Rpb24tcG9vbC10cmVlLW5vZGUnKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWU6IFtdLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXc6IFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVWaWV3LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWVWaWV3VGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3NlbGVjdGlvbi1wb29sLXRyZWUtbm9kZScpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwaW5nU3RvcHBlZFRocmVzaG9sZDogNTAwLFxuICAgICAgICAgICAgICAgIGxpa2VuZXNzVGhyZXNob2xkOiA3NSxcbiAgICAgICAgICAgICAgICBzZWFyY2hJbmRpY2F0b3JPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3RpbnknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayAuc2VsZWN0aW9uLXBvb2wtc2VhcmNoLWNsZWFyJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclNlYXJjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5MYXlvdXRWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vbignZGV0ZWN0aW9uOnR5cGluZzpzdGFydGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd0eXBpbmc6c3RhcnRlZCcpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vbignZGV0ZWN0aW9uOnR5cGluZzpzdG9wcGVkJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3R5cGluZzpzdG9wcGVkJywgdmFsdWUpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1NlYXJjaEFjdGl2aXR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IodGhpcy5nZXRPcHRpb24oJ3NlYXJjaEluZGljYXRvck9wdGlvbnMnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzaG93LWFjdGl2aXR5Jyk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2aXR5LnNob3codmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZVNlYXJjaEFjdGl2aXR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzaG93LWFjdGl2aXR5Jyk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2aXR5LmVtcHR5KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0F2YWlsYWJsZVBvb2w6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignYXZhaWxhYmxlVHJlZVZpZXcnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICBcdFx0dmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuZ2V0T3B0aW9uKCdhdmFpbGFibGVUcmVlJyksXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld09wdGlvbnM6IF8uZXh0ZW5kKHt9LCBWaWV3LnByb3RvdHlwZS5jaGlsZFZpZXdPcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3VGVtcGxhdGUnKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICBcdFx0fSwgdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3T3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgICAgICB2aWV3Lm9uKCdkcm9wOmJlZm9yZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyTm9kZUJlZm9yZShldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICB2aWV3Lm9uKCdkcm9wOmFmdGVyJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmZXJOb2RlQWZ0ZXIoZXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbignZHJvcDpjaGlsZHJlbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyTm9kZUNoaWxkcmVuKGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYXZhaWxhYmxlLnNob3codmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1NlbGVjdGVkUG9vbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdzZWxlY3RlZFRyZWVWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgXHRcdHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlJyksXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld09wdGlvbnM6IF8uZXh0ZW5kKHt9LCBWaWV3LnByb3RvdHlwZS5jaGlsZFZpZXdPcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRPcHRpb24oJ3NlbGVjdGVkVHJlZVZpZXdUZW1wbGF0ZScpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIFx0XHR9LCB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbignZHJvcDpiZWZvcmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zlck5vZGVCZWZvcmUoZXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbignZHJvcDphZnRlcicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyTm9kZUFmdGVyKGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgICAgIHZpZXcub24oJ2Ryb3A6Y2hpbGRyZW4nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zlck5vZGVDaGlsZHJlbihldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkLnNob3codmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9kZWxDb250YWluczogZnVuY3Rpb24obW9kZWwsIHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yKHZhciBpIGluIG1vZGVsID0gbW9kZWwudG9KU09OKCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBtb2RlbFtpXTtcblxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY29udGFpbnMuY2FsbCh0aGlzLCB2YWx1ZSwgcXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbnRhaW5zOiBmdW5jdGlvbihzdWJqZWN0LCBxdWVyeSkge1xuICAgICAgICAgICAgaWYoIV8uaXNTdHJpbmcoc3ViamVjdCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiBxdWVyeSA9IHF1ZXJ5LnNwbGl0KCcgJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBxdWVyeVtpXTtcblxuICAgICAgICAgICAgICAgIGlmKHN1YmplY3QudG9VcHBlckNhc2UoKS5pbmNsdWRlcyh2YWx1ZS50b1VwcGVyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY29tcGFyaXNvbiA9IG5ldyBUb29sYm94LkxldmVuc2h0ZWluKHZhbHVlLnRvVXBwZXJDYXNlKCksIHN1YmplY3QudG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcGVyY2VudCA9IGNvbXBhcmlzb24uZGlzdGFuY2UgLyBzdWJqZWN0Lmxlbmd0aCAqIDEwMCAtIDEwMDtcblxuICAgICAgICAgICAgICAgIGlmKHBlcmNlbnQgPiB0aGlzLmdldE9wdGlvbignbGlrZW5lc3NUaHJlc2hvbGQnKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWFyY2g6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHF1ZXJ5KSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kZWxDb250YWlucyhtb2RlbCwgcXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldCgnaGlkZGVuJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdoaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyU2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9ICcnO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoLWZpZWxkIGlucHV0JykudmFsKHZhbHVlKS5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5oaWRlQ2xlYXJTZWFyY2hCdXR0b24oKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgndHlwaW5nOnN0b3BwZWQnLCB2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0NsZWFyU2VhcmNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXInKS5hZGRDbGFzcygnc2hvdycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVDbGVhclNlYXJjaEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoLWNsZWFyJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblR5cGluZ1N0YXJ0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93U2VhcmNoQWN0aXZpdHkoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblR5cGluZ1N0b3BwZWQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVTZWFyY2hBY3Rpdml0eSgpO1xuXG4gICAgICAgICAgICBpZih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NsZWFyU2VhcmNoQnV0dG9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVDbGVhclNlYXJjaEJ1dHRvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNlYXJjaCh0aGlzLmF2YWlsYWJsZS5jdXJyZW50Vmlldy5jb2xsZWN0aW9uLCB2YWx1ZSk7XG4gICAgICAgICAgICB0aGlzLmF2YWlsYWJsZS5jdXJyZW50Vmlldy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgZGV0ZWN0aW9uID0gbmV3IFRvb2xib3guVHlwaW5nRGV0ZWN0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2ggaW5wdXQnKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbigndHlwaW5nU3RvcHBlZFRocmVzaG9sZCcpLFxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmRyb3BwYWJsZS1wb29sJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBvb2wgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgaW50ZXJhY3QodGhpcylcbiAgICAgICAgICAgICAgICAgICAgLmRyb3B6b25lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2VwdDogJCh0aGlzKS5kYXRhKCdhY2NlcHQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZHJvcDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2hlcmUgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZnJvbSA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC5yZWxhdGVkVGFyZ2V0LCBzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG8gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0LCBzZWxmKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZXJlW2dldElkQXR0cmlidXRlKCQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gZnJvbS5jb2xsZWN0aW9uLmZpbmRXaGVyZSh3aGVyZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShtb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8uY29sbGVjdGlvbi5hcHBlbmROb2RlKG1vZGVsLCBudWxsLCB7YXQ6ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuaW5kZXgoKX0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi4kZWwucmVtb3ZlQ2xhc3MoJ2Ryb3BwaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHBvb2wucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2Ryb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZHJhZ2VudGVyOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLiRlbC5hZGRDbGFzcygnZHJvcHBpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcG9vbC5wYXJlbnQoKS5hZGRDbGFzcygnZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25kcmFnbGVhdmU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuJGVsLnJlbW92ZUNsYXNzKCdkcm9wcGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRwb29sLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdkcm9wcGFibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93QXZhaWxhYmxlUG9vbCgpO1xuICAgICAgICAgICAgdGhpcy5zaG93U2VsZWN0ZWRQb29sKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdqcXVlcnknXSwgZnVuY3Rpb24oXywgJCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCAkKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LiQpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQpIHtcblxuICAgIFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVOb2RlID0gVG9vbGJveC5EcmFnZ2FibGVUcmVlTm9kZS5leHRlbmQoe1xuXG4gICAgICAgIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBUb29sYm94LkRyYWdnYWJsZVRyZWVOb2RlLnByb3RvdHlwZS5hdHRyaWJ1dGVzLmNhbGwodGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBpZCA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5yb290KCkuY29sbGVjdGlvbi5maW5kKHtpZDogaWR9KTtcblxuICAgICAgICAgICAgVG9vbGJveC5Ecm9wem9uZXMoZXZlbnQuZHJhZ0V2ZW50LCBldmVudC50YXJnZXQsIHtcbiAgICAgICAgICAgICAgICBiZWZvcmU6IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YmVmb3JlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWZ0ZXI6IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogZnVuY3Rpb24oJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ25lc3RhYmxlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkRyYWdnYWJsZVRyZWVOb2RlLnByb3RvdHlwZS5vbkRvbVJlZnJlc2guY2FsbCh0aGlzKTtcblxuICAgICAgICAgICAgaWYodGhpcy5tb2RlbC5nZXQoJ2hpZGRlbicpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgVG9vbGJveC5TZWxlY3Rpb25Qb29sVHJlZVZpZXcgPSBUb29sYm94LkRyYWdnYWJsZVRyZWVWaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94LlNlbGVjdGlvblBvb2xUcmVlTm9kZVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guU2VsZWN0RmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLXNlbGVjdC1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RvcjogJ3NlbGVjdCcsXG4gICAgICAgICAgICBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICBvcHRpb25zOiBbXVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2hhbmdlIC5mb3JtLWNvbnRyb2wnOiAnY2hhbmdlJ1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ3NlbGVjdCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbigndmFsdWUnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh0aGlzLmdldE9wdGlvbigndmFsdWUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKEJhY2tib25lLCBNYXJpb25ldHRlLCBfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEJhY2tib25lLCBNYXJpb25ldHRlLCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnYmFja2JvbmUnKSwgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkJhY2tib25lLCByb290Lk1hcmlvbmV0dGUsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgQmFja2JvbmUsIE1hcmlvbmV0dGUsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guU3RvcmFnZSA9IE1hcmlvbmV0dGUuT2JqZWN0LmV4dGVuZCh7XG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHN0b3JhZ2VFbmdpbmU6IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgICAgIGRhdGFDbGFzczogZmFsc2UsXG4gICAgICAgICAgICBkYXRhOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIE1hcmlvbmV0dGUuT2JqZWN0LnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFRvb2xib3guT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMpO1xuXG4gICAgICAgICAgICBpZighdGhpcy50YWJsZU5hbWUoKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBcXCd0YWJsZVxcJyBvcHRpb24gbXVzdCBiZSBzZXQgd2l0aCBhIHZhbGlkIHRhYmxlIG5hbWUuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFibGUoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2RhdGEnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdkYXRhJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlbmdpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdzdG9yYWdlRW5naW5lJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGFibGVOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbigndGFibGUnKVxuICAgICAgICB9LFxuXG4gICAgICAgIGRvZXNUYWJsZUV4aXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhXy5pc051bGwodGhpcy5lbmdpbmUoKS5nZXRJdGVtKHRoaXMudGFibGVOYW1lKCkpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVUYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZighdGhpcy5kb2VzVGFibGVFeGlzdCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVzdHJveVRhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lKCkucmVtb3ZlSXRlbSh0aGlzLnRhYmxlTmFtZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZSh0aGlzLmVuZ2luZSgpLmdldEl0ZW0odGhpcy50YWJsZU5hbWUoKSkpO1xuICAgICAgICAgICAgdmFyIERhdGFDbGFzcyA9IF8uaXNBcnJheShkYXRhKSA/IEJhY2tib25lLkNvbGxlY3Rpb24gOiBCYWNrYm9uZS5Nb2RlbDtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2RhdGFDbGFzcycpKSB7XG4gICAgICAgICAgICAgICAgRGF0YUNsYXNzICA9IHRoaXMuZ2V0T3B0aW9uKCdkYXRhQ2xhc3MnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5kYXRhID0gbmV3IERhdGFDbGFzcyhkYXRhKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzYXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdkYXRhJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZSgpLnNldEl0ZW0odGhpcy50YWJsZU5hbWUoKSwgSlNPTi5zdHJpbmdpZnkodGhpcy5nZXRPcHRpb24oJ2RhdGEnKS50b0pTT04oKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIC8vIFRPRE86IEFkZCBLZXlTdG9yZVxuICAgIC8qXG4gICAgVG9vbGJveC5LZXlTdG9yZSA9IFRvb2xib3guU3RvcmFnZS5leHRlbmQoe1xuXG4gICAgfSk7XG4gICAgKi9cblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJywgJ2JhY2tib25lJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnXSwgZnVuY3Rpb24oJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlRhYmxlTm9JdGVtc1JvdyA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAndHInLFxuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS1uby1pdGVtcycpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ25vLXJlc3VsdHMnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoYXJyYXkpIEFycmF5IG9mIGFycmF5IG9mIGNvbHVtblxuICAgICAgICAgICAgY29sdW1uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIHRhYmxlIHJvd3NcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdObyByb3dzIGZvdW5kJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guVGFibGVWaWV3Um93ID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRhZ05hbWU6ICd0cicsXG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYmxlLXZpZXctcm93JyksXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQXJyYXkgb2YgYXJyYXkgb2YgY29sdW1uXG4gICAgICAgICAgICBjb2x1bW5zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG1peGVkKSBJZiBub3QgZmFsc2UsIHBhc3MgYSB2YWxpZCBWaWV3IHByb3RvdHlwZVxuICAgICAgICAgICAgZWRpdEZvcm1DbGFzczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChtaXhlZCkgSWYgbm90IGZhbHNlLCBwYXNzIGEgdmFsaWQgVmlldyBwcm90b3R5cGVcbiAgICAgICAgICAgIGRlbGV0ZUZvcm1DbGFzczogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2NsaWNrIC5lZGl0JzogJ2NsaWNrOmVkaXQnLFxuICAgICAgICAgICAgJ2NsaWNrIC5kZWxldGUnOiAnY2xpY2s6ZGVsZXRlJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tFZGl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VkaXRGb3JtQ2xhc3MnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoe1xuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbignc3VibWl0OnN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXdJbk1vZGFsKHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tEZWxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZGVsZXRlRm9ybUNsYXNzJyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXdJbk1vZGFsKHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dWaWV3SW5Nb2RhbDogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdmFyIG1vZGFsID0gbmV3IFRvb2xib3guTW9kYWwoe1xuICAgICAgICAgICAgICAgIGNvbnRlbnRWaWV3OiB2aWV3XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmlldy5vbignc3VibWl0OnN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBtb2RhbC5oaWRlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbW9kYWwuc2hvdygpO1xuXG4gICAgICAgICAgICByZXR1cm4gbW9kYWw7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5UYWJsZVZpZXdGb290ZXIgPSBUb29sYm94LkxheW91dFZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0YWdOYW1lOiAndHInLFxuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS12aWV3LWZvb3RlcicpLFxuXG4gICAgICAgIG1vZGVsRXZlbnRzOiB7XG4gICAgICAgICAgICAnY2hhbmdlJzogJ3JlbmRlcidcbiAgICAgICAgfSxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBjb250ZW50OiAndGQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQXJyYXkgb2YgYXJyYXkgb2YgY29sdW1uXG4gICAgICAgICAgICBjb2x1bW5zOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guVGFibGVWaWV3ID0gVG9vbGJveC5Db21wb3NpdGVWaWV3LmV4dGVuZCh7XG5cblx0XHRjbGFzc05hbWU6ICd0YWJsZS12aWV3JyxcblxuICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guVGFibGVWaWV3Um93LFxuXG4gICAgICAgIGNoaWxkVmlld0NvbnRhaW5lcjogJ3Rib2R5JyxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtdmlldy1ncm91cCcpLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgc3RhcnRpbmcgcGFnZVxuICAgICAgICAgICAgcGFnZTogMSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG9yZGVyIG9mIHRoZSBkYXRlIGJlaW5nIHJldHVybmVkXG4gICAgICAgICAgICBvcmRlcjogbnVsbCxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgRWl0aGVyIGFzYyBvciBkZXNjIHNvcnRpbmcgb3JkZXJcbiAgICAgICAgICAgIHNvcnQ6IG51bGwsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBudW1iZXJzIG9mIHJvd3MgcGVyIHBhZ2VcbiAgICAgICAgICAgIGxpbWl0OiAyMCxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIFNob3VsZCBzaG93IHRoZSBwYWdpbmF0aW9uIGZvciB0aGlzIHRhYmxlXG4gICAgICAgICAgICBwYWdpbmF0ZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgRmV0Y2ggdGhlIGRhdGEgd2hlbiB0YWJsZSBpcyBzaG93blxuICAgICAgICAgICAgZmV0Y2hPblNob3c6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgaGVhZGVycyBhcHBlbmRlZCB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgcmVxdWVzdEhlYWRlcnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIFRoZSBkZWZhdWx0IG9wdGlvbnMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgICAgICBkZWZhdWx0UmVxdWVzdERhdGFPcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgJ3BhZ2UnLFxuICAgICAgICAgICAgICAgICdsaW1pdCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnc29ydCdcbiAgICAgICAgICAgIF0sXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgQWRkaXRpb25hbCBvcHRpb25zIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIHF1ZXJ5IHN0cmluZ1xuICAgICAgICAgICAgcmVxdWVzdERhdGFPcHRpb25zOiBbXSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIHBhZ2luYXRpb24gdmlldyBjbGFzc1xuICAgICAgICAgICAgcGFnaW5hdGlvblZpZXc6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgcGFnaW5hdGlvbiB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBwYWdpbmF0aW9uVmlld09wdGlvbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgaGVhZGVyXG4gICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgdGFibGUgaGVhZGVyIHRhZyBuYW1lXG4gICAgICAgICAgICBoZWFkZXJUYWc6ICdoMycsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXIgY2xhc3MgbmFtZVxuICAgICAgICAgICAgaGVhZGVyQ2xhc3NOYW1lOiAndGFibGUtaGVhZGVyJyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIHRhYmxlIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBkZXNjcmlwdGlvbiB0YWdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uVGFnOiAncCcsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBkZXNjcmlwdGlvbiB0YWdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uQ2xhc3NOYW1lOiAnZGVzY3JpcHRpb24gcm93IGNvbC1zbS02JyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIHRhYmxlIGNsYXNzIG5hbWVcbiAgICAgICAgICAgIHRhYmxlQ2xhc3NOYW1lOiAndGFibGUnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbG9hZGluZyBjbGFzcyBuYW1lXG4gICAgICAgICAgICBsb2FkaW5nQ2xhc3NOYW1lOiAnbG9hZGluZycsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbW9kZWwgc3RvcmluZyB0aGUgY29sdW1uc1xuICAgICAgICAgICAgY2hpbGRWaWV3Q29sdW1uc1Byb3BlcnR5OiAnY29sdW1ucycsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBhY3Rpdml0eSBpbmRpY2F0b3Igb3B0aW9uc1xuICAgICAgICAgICAgaW5kaWNhdG9yT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3NtYWxsJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGVyZSBhcmUgbm8gdGFibGUgcm93c1xuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiAnTm8gcm93cyBmb3VuZCcsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBuYW1lIG9mIHRoZSBjbGFzcyBhcHBlbmRlZCB0byB0aGUgYnV0dG9uc1xuICAgICAgICAgICAgYnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBBbiBhcnJheSBvZiBidXR0b24gb2JqZWN0c1xuICAgICAgICAgICAgLy8ge2hyZWY6ICd0ZXN0LTEyMycsIGxhYmVsOiAnVGVzdCAxMjMnfVxuICAgICAgICAgICAgYnV0dG9uczogW11cbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayAuc29ydCc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3NvcnQ6Y2xpY2snLCBlKTtcblxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY2xpY2sgLmJ1dHRvbnMtd3JhcHBlciBhJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciBidXR0b25zID0gdGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKTtcbiAgICAgICAgICAgICAgICB2YXIgaSA9ICQoZS50YXJnZXQpLmluZGV4KCk7XG5cbiAgICAgICAgICAgICAgICBpZihfLmlzQXJyYXkoYnV0dG9ucykgJiYgYnV0dG9uc1tpXS5vbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnNbaV0ub25DbGljay5jYWxsKHRoaXMsICQoZS50YXJnZXQpKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFbXB0eVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSBUb29sYm94LlRhYmxlTm9JdGVtc1Jvdy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZScpLFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldE9wdGlvbignY29sdW1ucycpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBWaWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZmV0Y2hPblNob3cnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblNvcnRDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBvcmRlckJ5ID0gJChlLnRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICAgICAgaWYodC5nZXRPcHRpb24oJ29yZGVyJykgPT09IG9yZGVyQnkpIHtcbiAgICAgICAgICAgICAgICBpZighdC5nZXRPcHRpb24oJ3NvcnQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0Lm9wdGlvbnMuc29ydCA9ICdhc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHQuZ2V0T3B0aW9uKCdzb3J0JykgPT09ICdhc2MnKSB7XG4gICAgICAgICAgICAgICAgICAgIHQub3B0aW9ucy5zb3J0ID0gJ2Rlc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdC5vcHRpb25zLm9yZGVyQnkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdC5vcHRpb25zLnNvcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0Lm9wdGlvbnMub3JkZXIgPSBvcmRlckJ5O1xuICAgICAgICAgICAgICAgIHQub3B0aW9ucy5zb3J0ID0gJ2FzYyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuJGVsLmZpbmQoJy5zb3J0JykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ3NvcnQtYXNjJykucmVtb3ZlQ2xhc3MoJ3NvcnQtZGVzYycpO1xuXG4gICAgICAgICAgICBpZih0LmdldE9wdGlvbignc29ydCcpKSB7XG4gICAgICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50KCkuYWRkQ2xhc3MoJ3NvcnQtJyt0LmdldE9wdGlvbignc29ydCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5mZXRjaCh0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93UGFnaW5hdGlvbjogZnVuY3Rpb24ocGFnZSwgdG90YWxQYWdlcykge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2luYXRpb25WaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guUGFnZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwYWdpbmF0aW9uVmlld09wdGlvbnMgPSB0aGlzLmdldE9wdGlvbigncGFnaW5hdGlvblZpZXdPcHRpb25zJyk7XG5cbiAgICAgICAgICAgIGlmKCFfLmlzT2JqZWN0KHBhZ2luYXRpb25WaWV3T3B0aW9ucykpIHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uVmlld09wdGlvbnMgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgICAgICAgICB0b3RhbFBhZ2VzOiB0b3RhbFBhZ2VzLFxuICAgICAgICAgICAgfSwgcGFnaW5hdGlvblZpZXdPcHRpb25zKSk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ3BhZ2luYXRlJywgZnVuY3Rpb24ocGFnZSwgdmlldykge1xuICAgICAgICAgICAgICAgIGlmKHBhZ2UgIT0gdC5nZXRPcHRpb24oJ3BhZ2UnKSkge1xuICAgICAgICAgICAgICAgICAgICB0Lm9wdGlvbnMucGFnZSA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgICAgIHQuZmV0Y2godHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBmb290ZXJWaWV3ID0gbmV3IFRvb2xib3guVGFibGVWaWV3Rm9vdGVyKHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldE9wdGlvbignY29sdW1ucycpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kZWwuZmluZCgndGZvb3QnKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbi5zaG93KGZvb3RlclZpZXcpO1xuXG4gICAgICAgICAgICBmb290ZXJWaWV3LmNvbnRlbnQuc2hvdyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lDaGlsZHJlbigpO1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95RW1wdHlWaWV3KCk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ3RhYmxlJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2xvYWRpbmdDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5tb2RlbCwgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS1hY3Rpdml0eS1pbmRpY2F0b3Itcm93JyksXG4gICAgICAgICAgICAgICAgdGFnTmFtZTogJ3RyJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIGFjdGl2aXR5IGluZGljYXRvciBvcHRpb25zXG4gICAgICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMub3B0aW9ucywgdC5nZXRPcHRpb24oJ2luZGljYXRvck9wdGlvbnMnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNvbHVtbnMgPSB0LmdldE9wdGlvbignY29sdW1ucycpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgYWN0aXZpdHkgaW5kaWNhdG9yIGluc3RhbmNlIHRvIGJlIHJlbW92ZWQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgdC5fYWN0aXZpdHlJbmRpY2F0b3IgPSB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICB0aGlzLiRlbC5maW5kKCd0YWJsZScpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdsb2FkaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9hY3Rpdml0eUluZGljYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGRWaWV3KHRoaXMuX2FjdGl2aXR5SW5kaWNhdG9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpdml0eUluZGljYXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2hpbGR2aWV3QmVmb3JlUmVuZGVyOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgY2hpbGQub3B0aW9ucy5jb2x1bW5zID0gdGhpcy5nZXRPcHRpb24oJ2NvbHVtbnMnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZXF1ZXN0RGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbigncmVxdWVzdERhdGFPcHRpb25zJyk7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbignZGVmYXVsdFJlcXVlc3REYXRhT3B0aW9ucycpO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3REYXRhID0gdGhpcy5nZXRPcHRpb24oJ3JlcXVlc3REYXRhJyk7XG5cbiAgICAgICAgICAgIGlmKHJlcXVlc3REYXRhKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHJlcXVlc3REYXRhO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmVhY2goKFtdKS5jb25jYXQoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYoIV8uaXNOdWxsKHRoaXMuZ2V0T3B0aW9uKG5hbWUpKSAmJiAhXy5pc1VuZGVmaW5lZCh0aGlzLmdldE9wdGlvbihuYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHRoaXMuZ2V0T3B0aW9uKG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZldGNoOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95RW1wdHlWaWV3KCk7XG4gICAgICAgICAgICB0aGlzLnNob3dBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hTdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLmdldEN1cnJlbnRQYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHZhciB0b3RhbFBhZ2VzID0gdGhpcy5nZXRMYXN0UGFnZShyZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmKGNvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RW1wdHlWaWV3KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50b3RhbFBhZ2VzID0gdG90YWxQYWdlcztcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3BhZ2luYXRlJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQYWdpbmF0aW9uKHBhZ2UsIHRvdGFsUGFnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hDb21wbGV0ZTogZnVuY3Rpb24oc3RhdHVzLCBjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXJyZW50UGFnZShyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmN1cnJlbnRfcGFnZSB8fCByZXNwb25zZS5jdXJyZW50UGFnZTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMYXN0UGFnZShyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmxhc3RfcGFnZSB8fCByZXNwb25zZS5sYXN0UGFnZTtcbiAgICAgICAgfSxcblxuICAgICAgICBmZXRjaDogZnVuY3Rpb24ocmVzZXQpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYocmVzZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24ucmVzZXQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmZldGNoKHtcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmdldFJlcXVlc3REYXRhKCksXG4gICAgICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24oeGhyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHQuZ2V0T3B0aW9uKCdyZXF1ZXN0SGVhZGVycycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmVhY2godC5nZXRPcHRpb24oJ3JlcXVlc3RIZWFkZXJzJyksIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6Y29tcGxldGUnLCB0cnVlLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6c3VjY2VzcycsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOmNvbXBsZXRlJywgZmFsc2UsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDplcnJvcicsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2ZldGNoJyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlRhYkNvbnRlbnQgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFiLWNvbnRlbnQnKSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRuYW1lOiBmYWxzZSxcblxuXHRcdFx0aWQ6IGZhbHNlLFxuXG5cdFx0XHRjb250ZW50OiBmYWxzZVxuXHRcdH0sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXHRUb29sYm94LlRhYnMgPSBUb29sYm94LkxheW91dFZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJzJyksXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayBbZGF0YS10b2dnbGU9XCJ0YWJcIl0nOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgndGFiOmNsaWNrJywgJChlLnRhcmdldCkuYXR0cignaHJlZicpKTtcblxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRjb250ZW50VmlldzogVG9vbGJveC5UYWJDb250ZW50LFxuXG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuXG5cdFx0XHR0YWJQYW5lQ2xhc3NOYW1lOiAndGFiLXBhbmUnLFxuXG5cdFx0XHRjb250ZW50OiBbXVxuXHRcdH0sXG5cblx0XHR0YWJWaWV3czogW10sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlVGFiOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgIFx0dGhpcy4kZWwuZmluZCgnLm5hdi10YWJzJykuZmluZCgnW2hyZWY9XCIjJyt2aWV3LmdldE9wdGlvbignbmFtZScpKydcIl0nKS5yZW1vdmUoKTtcblxuICAgICAgICBcdHRoaXMucmVnaW9uTWFuYWdlci5yZW1vdmVSZWdpb24odmlldy5nZXRPcHRpb24oJ25hbWUnKSk7XG5cbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcjJyt2aWV3LmdldE9wdGlvbignbmFtZScpKS5yZW1vdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRUYWI6IGZ1bmN0aW9uKHZpZXcsIHNldEFjdGl2ZSkge1xuICAgICAgICBcdHZhciB0YWIgPSAnPGxpIHJvbGU9XCJwcmVzZW50YXRpb25cIj48YSBocmVmPVwiIycrdmlldy5nZXRPcHRpb24oJ25hbWUnKSsnXCIgYXJpYS1jb250cm9scz1cIicrdmlldy5nZXRPcHRpb24oJ25hbWUnKSsnXCIgcm9sZT1cInRhYlwiIGRhdGEtdG9nZ2xlPVwidGFiXCI+Jyt2aWV3LmdldE9wdGlvbignbGFiZWwnKSsnPC9hPjwvbGk+JztcblxuICAgICAgICBcdHZhciBodG1sID0gJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCInK3RoaXMuZ2V0T3B0aW9uKCd0YWJQYW5lQ2xhc3NOYW1lJykrJ1wiIGlkPVwiJyt2aWV3LmdldE9wdGlvbignbmFtZScpKydcIiAvPic7XG5cbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcubmF2LXRhYnMnKS5hcHBlbmQodGFiKTtcbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcudGFiLWNvbnRlbnQnKS5hcHBlbmQoaHRtbCk7XG5cblx0XHRcdHRoaXMucmVnaW9uTWFuYWdlci5hZGRSZWdpb24odmlldy5nZXRPcHRpb24oJ25hbWUnKSwgJyMnK3ZpZXcuZ2V0T3B0aW9uKCduYW1lJykpO1xuXG5cdFx0XHR0aGlzW3ZpZXcuZ2V0T3B0aW9uKCduYW1lJyldLnNob3codmlldyk7XG5cblx0XHRcdGlmKHNldEFjdGl2ZSkge1xuXHRcdFx0XHR0aGlzLnNldEFjdGl2ZVRhYih2aWV3KTtcblx0XHRcdH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcdF8uZWFjaCh0aGlzLmdldE9wdGlvbignY29udGVudCcpLCBmdW5jdGlvbihvYmosIGkpIHtcbiAgICAgICAgXHRcdGlmKG9iai5jaWQpIHtcbiAgICAgICAgXHRcdFx0dGhpcy5hZGRUYWIob2JqKTtcbiAgICAgICAgXHRcdH1cbiAgICAgICAgXHRcdGVsc2Uge1xuICAgICAgICBcdFx0XHR2YXIgY29udGVudFZpZXcgPSB0aGlzLmdldE9wdGlvbignY29udGVudFZpZXcnKTtcblxuXHRcdFx0XHRcdGlmKF8uaXNPYmplY3Qob2JqLnZpZXcpKSB7XG5cdFx0XHRcdFx0XHRjb250ZW50VmlldyA9IG9iai52aWV3O1xuXG5cdFx0XHRcdFx0XHRkZWxldGUgb2JqLnZpZXc7XG5cdFx0XHRcdFx0fVxuXG5cdCAgICAgICAgXHRcdHRoaXMuYWRkVGFiKG5ldyBjb250ZW50VmlldyhvYmopKTtcbiAgICAgICAgXHRcdH1cbiAgICAgICAgXHR9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRBY3RpdmVUYWI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIFx0aWYoXy5pc09iamVjdChpZCkpIHtcbiAgICAgICAgXHRcdGlkID0gaWQuZ2V0T3B0aW9uKCduYW1lJyk7XG4gICAgICAgIFx0fVxuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tocmVmPVwiJytpZCsnXCJdJylcbiAgICAgICAgICAgICAgICAucGFyZW50KClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZChpZCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzZXQ6YWN0aXZlOnRhYicsIGlkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDb250ZW50VmlldzogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgXHRpZih0aGlzW2lkXSAmJiB0aGlzW2lkXS5jdXJyZW50Vmlldykge1xuICAgICAgICBcdFx0cmV0dXJuIHRoaXNbaWRdLmN1cnJlbnRWaWV3O1xuICAgICAgICBcdH1cblxuICAgICAgICBcdHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0aWYoIXRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVUYWInKSkge1xuXHQgICAgICAgIFx0dGhpcy4kZWwuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdOmZpcnN0JykuY2xpY2soKTtcblx0ICAgICAgICB9XG5cdCAgICAgICAgZWxzZSB7XG5cdCAgICAgICAgXHR0aGlzLnNldEFjdGl2ZVRhYih0aGlzLmdldE9wdGlvbignYWN0aXZlVGFiJykpO1xuXHQgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblRhYkNsaWNrOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBcdHRoaXMuc2V0QWN0aXZlVGFiKGlkKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlRleHRBcmVhRmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLXRleHRhcmVhLWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAndGV4dGFyZWEnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgndGV4dGFyZWEnKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LldpemFyZCA9IFRvb2xib3guTGF5b3V0Vmlldy5leHRlbmQoe1xuXG4gICAgICAgIGNsYXNzTmFtZTogJ3dpemFyZCcsXG5cbiAgICAgICAgY2hhbm5lbE5hbWU6ICd0b29sYm94LndpemFyZCcsXG5cbiAgICBcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd3aXphcmQnKSxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBwcm9ncmVzczogJy53aXphcmQtcHJvZ3Jlc3MnLFxuICAgICAgICAgICAgY29udGVudDogJy53aXphcmQtY29udGVudCcsXG4gICAgICAgICAgICBidXR0b25zOiAnLndpemFyZC1idXR0b25zJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaGVhZGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBoZWFkZXJUYWc6ICdoMicsXG4gICAgICAgICAgICAgICAgaGVhZGVyVGFnQ2xhc3NOYW1lOiAnd2l6YXJkLWhlYWRlcicsXG4gICAgICAgICAgICAgICAgZmluaXNoZWRDbGFzc05hbWU6ICd3aXphcmQtZmluaXNoZWQnLFxuICAgICAgICAgICAgICAgIGZpeGVkSGVpZ2h0Q2xhc3NOYW1lOiAnZml4ZWQtaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICBoYXNQYW5lbENsYXNzTmFtZTogJ3dpemFyZC1wYW5lbCcsXG4gICAgICAgICAgICAgICAgcGFuZWxDbGFzc05hbWU6ICdwYW5lbCBwYW5lbC1kZWZhdWx0JyxcbiAgICAgICAgICAgICAgICBoaWdoZXN0U3RlcDogMSxcbiAgICAgICAgICAgICAgICBzdGVwOiAxLFxuICAgICAgICAgICAgICAgIHN0ZXBzOiBbXSxcbiAgICAgICAgICAgICAgICBmaW5pc2hlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc1ZpZXc6IFRvb2xib3guV2l6YXJkU3VjY2VzcyxcbiAgICAgICAgICAgICAgICBlcnJvclZpZXc6IFRvb2xib3guV2l6YXJkRXJyb3IsXG4gICAgICAgICAgICAgICAgc2hvd0J1dHRvbnM6IHRydWUsXG4gICAgICAgICAgICAgICAgc2hvd1Byb2dyZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhbmVsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250ZW50SGVpZ2h0OiBmYWxzZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guTGF5b3V0Vmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVwbHkoJ2NvbXBsZXRlOnN0ZXAnLCBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcy5jdXJyZW50Vmlldy5zZXRDb21wbGV0ZShzdGVwIHx8IHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXBseSgnc2V0OnN0ZXAnLCBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHN0ZXApO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXBseSgnd2l6YXJkOmVycm9yJywgZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5lbXB0eSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcodGhpcy5nZXRPcHRpb24oJ2Vycm9yVmlldycpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVwbHkoJ3dpemFyZDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maW5pc2godHJ1ZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb250ZW50SGVpZ2h0OiBmdW5jdGlvbihoZWlnaHQpIHtcbiAgICAgICAgICAgIGhlaWdodCB8fCAoaGVpZ2h0ID0gNDAwKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLndpemFyZC1jb250ZW50JylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2ZpeGVkSGVpZ2h0Q2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB2YXIgdmlldyA9IGZhbHNlO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcCA9IHBhcnNlSW50KHN0ZXApO1xuXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuc3RlcCA8IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RlcCA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgPiB0aGlzLmdldE9wdGlvbignaGlnaGVzdFN0ZXAnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oaWdoZXN0U3RlcCA9IHRoaXMuZ2V0T3B0aW9uKCdzdGVwJylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzcy5jdXJyZW50Vmlldy5yZW5kZXIoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5idXR0b25zLmN1cnJlbnRWaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b25zLmN1cnJlbnRWaWV3LnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih2aWV3ID0gdGhpcy5nZXRTdGVwKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDb250ZW50KHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dWaWV3OiBmdW5jdGlvbihWaWV3LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q29udGVudChuZXcgVmlldyhvcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1Byb2dyZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFRvb2xib3guV2l6YXJkUHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICAgIHdpemFyZDogdGhpc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3Muc2hvdyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBUb29sYm94LldpemFyZEJ1dHRvbnMoe1xuICAgICAgICAgICAgICAgIHdpemFyZDogdGhpcyxcbiAgICAgICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmJ1dHRvbnMuc2hvdyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q29udGVudDogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgaWYodmlldykge1xuICAgICAgICAgICAgICAgIHZpZXcub3B0aW9ucy53aXphcmQgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50LnNob3codmlldywge1xuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVzdHJveTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmlldy5vbmNlKCdhdHRhY2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodmlldy5yZWdpb25zICYmIHZpZXcucmVnaW9uTWFuYWdlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5yZWdpb25NYW5hZ2VyLmVtcHR5UmVnaW9ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5yZWdpb25NYW5hZ2VyLmFkZFJlZ2lvbnModmlldy5yZWdpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmlldy50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6c2hvdzpzdGVwJywgdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdzaG93OnN0ZXAnLCB0aGlzLmdldE9wdGlvbignc3RlcCcpLCB2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0ZXBzJylbKHN0ZXAgfHwgdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSkgLSAxXTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRUb3RhbFN0ZXBzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVxdWVzdCgnY29tcGxldGU6c3RlcCcpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RlcCh0aGlzLmdldE9wdGlvbignc3RlcCcpIC0gMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluaXNoOiBmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbnMuZW1wdHkoKTtcblxuICAgICAgICAgICAgaWYoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2ZpbmlzaGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXF1ZXN0KCdjb21wbGV0ZTpzdGVwJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0VG90YWxTdGVwcygpICsgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Vmlldyh0aGlzLmdldE9wdGlvbignc3VjY2Vzc1ZpZXcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dWaWV3KHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50SGVpZ2h0JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldENvbnRlbnRIZWlnaHQodGhpcy5nZXRPcHRpb24oJ2NvbnRlbnRIZWlnaHQnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93UHJvZ3Jlc3MnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1Byb2dyZXNzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93QnV0dG9ucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93QnV0dG9ucygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbigncGFuZWwnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNQYW5lbENsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guV2l6YXJkQnV0dG9ucyA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLWJ1dHRvbnMnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQtYnV0dG9ucy13cmFwcGVyJyxcblxuICAgICAgICBjaGFubmVsTmFtZTogJ3Rvb2xib3gud2l6YXJkJyxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB3aXphcmQ6IGZhbHNlLFxuICAgICAgICAgICAgYnV0dG9uU2l6ZUNsYXNzTmFtZTogJ2J0bi1tZCcsXG4gICAgICAgICAgICBkZWZhdWx0QnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcbiAgICAgICAgICAgIHByaW1hcnlCdXR0b25DbGFzc05hbWU6ICdidG4gYnRuLXByaW1hcnknLFxuICAgICAgICAgICAgZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICBmaW5pc2hMYWJlbDogJ0ZpbmlzaCcsXG4gICAgICAgICAgICBuZXh0TGFiZWw6ICdOZXh0JyxcbiAgICAgICAgICAgIG5leHRJY29uOiAnZmEgZmEtbG9uZy1hcnJvdy1yaWdodCcsXG4gICAgICAgICAgICBiYWNrTGFiZWw6ICdCYWNrJyxcbiAgICAgICAgICAgIGJhY2tJY29uOiAnZmEgZmEtbG9uZy1hcnJvdy1sZWZ0J1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmJhY2s6bm90KC5kaXNhYmxlZCknOiAnY2xpY2s6YmFjaycsXG4gICAgICAgICAgICAnY2xpY2sgLm5leHQ6bm90KC5kaXNhYmxlZCknOiAnY2xpY2s6bmV4dCcsXG4gICAgICAgICAgICAnY2xpY2sgLmZpbmlzaDpub3QoLmRpc2FibGVkKSc6ICdjbGljazpmaW5pc2gnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUJ1dHRvbjogZnVuY3Rpb24oYnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuJytidXR0b24pLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0ZXAgPSB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdzdGVwJyk7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGhcblxuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBpc0ZpcnN0U3RlcDogc3RlcCA9PSAxLFxuICAgICAgICAgICAgICAgIGlzTGFzdFN0ZXA6IHN0ZXAgPT0gdG90YWwsXG4gICAgICAgICAgICAgICAgdG90YWxTdGVwczogdG90YWxcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5vcHRpb25zKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrQmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKTtcbiAgICAgICAgICAgIHZhciBzdGVwcyA9IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXBzJyk7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0U3RlcCgpLnRyaWdnZXJNZXRob2QoJ3dpemFyZDpjbGljazpiYWNrJywgc3RlcHNbc3RlcCAtIDFdKTtcblxuICAgICAgICAgICAgaWYodHlwZW9mIHJlc3BvbnNlID09PSBcInVuZGVmaW5lZFwiIHx8IHJlc3BvbnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrTmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKTtcbiAgICAgICAgICAgIHZhciBzdGVwcyA9IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXBzJyk7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0U3RlcCgpLnRyaWdnZXJNZXRob2QoJ3dpemFyZDpjbGljazpuZXh0Jywgc3RlcHNbc3RlcCArIDFdKTtcblxuICAgICAgICAgICAgaWYodHlwZW9mIHJlc3BvbnNlID09PSBcInVuZGVmaW5lZFwiIHx8IHJlc3BvbnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrRmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXF1ZXN0KCd3aXphcmQ6c3VjY2VzcycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2J1dHRvbicpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlTmV4dEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcubmV4dCcpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlQmFja0J1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuYmFjaycpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlRmluaXNoQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5maW5pc2gnKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdidXR0b24nKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlTmV4dEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcubmV4dCcpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVCYWNrQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5iYWNrJykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUZpbmlzaEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuZmluaXNoJykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmRFcnJvciA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd3aXphcmQtZXJyb3InKSxcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQtZXJyb3InLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGhlYWRlclRhZzogJ2gzJyxcbiAgICAgICAgICAgIGhlYWRlcjogJ0Vycm9yIScsXG4gICAgICAgICAgICBlcnJvckljb246ICdmYSBmYS10aW1lcycsXG4gICAgICAgICAgICBtZXNzYWdlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbigkLCBfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guV2l6YXJkUHJvZ3Jlc3MgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLXByb2dyZXNzJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLXByb2dyZXNzLXdyYXBwZXInLFxuXG4gICAgICAgIGNoYW5uZWxOYW1lOiAndG9vbGJveC53aXphcmQnLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHdpemFyZDogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG4gICAgICAgICAgICBjb21wbGV0ZUNsYXNzTmFtZTogJ2NvbXBsZXRlJyxcbiAgICAgICAgICAgIGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLndpemFyZC1zdGVwJzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHN0ZXAgPSAkKGV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICAgICAgdmFyIHN0ZXAgPSAkc3RlcC5kYXRhKCdzdGVwJyk7XG5cbiAgICAgICAgICAgICAgICBpZiggISRzdGVwLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKSAmJlxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignZmluaXNoZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVxdWVzdCgnc2V0OnN0ZXAnLCBzdGVwKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKSwgZnVuY3Rpb24oc3RlcCwgaSkge1xuICAgICAgICAgICAgICAgIHN0ZXAub3B0aW9ucy5sYWJlbCA9IHN0ZXAuZ2V0T3B0aW9uKCdsYWJlbCcpIHx8IHN0ZXAubGFiZWw7XG4gICAgICAgICAgICAgICAgc3RlcC5vcHRpb25zLnRpdGxlID0gc3RlcC5nZXRPcHRpb24oJ3RpdGxlJykgfHwgc3RlcC50aXRsZTtcbiAgICAgICAgICAgICAgICBzdGVwLm9wdGlvbnMuc3RlcCA9IGkgKyAxO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB0aGlzLmdldE9wdGlvbignd2l6YXJkJykub3B0aW9ucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RGlzYWJsZWQ6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcDpsdCgnK3N0ZXArJyknKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q29tcGxldGU6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoc3RlcCk7XG5cbiAgICAgICAgICAgIHZpZXcub3B0aW9ucy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcDpsdCgnKyhzdGVwIC0gMSkrJyknKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignY29tcGxldGVDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcud2l6YXJkLXN0ZXA6bnRoLWNoaWxkKCcrc3RlcCsnKScpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFdpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcCcpLmNzcygnd2lkdGgnLCAoMTAwIC8gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGgpICsgJyUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRXaWR0aCgpO1xuICAgICAgICAgICAgLy90aGlzLnNldENvbXBsZXRlKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKSk7XG4gICAgICAgICAgICB0aGlzLnNldERpc2FibGVkKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ2hpZ2hlc3RTdGVwJykpO1xuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmUodGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcCcpKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LldpemFyZFN1Y2Nlc3MgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLXN1Y2Nlc3MnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQtc3VjY2VzcycsXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgaGVhZGVyVGFnOiAnaDMnLFxuICAgICAgICAgICAgaGVhZGVyOiAnU3VjY2VzcyEnLFxuICAgICAgICAgICAgc3VjY2Vzc0ljb246ICdmYSBmYS1jaGVjaycsXG4gICAgICAgICAgICBtZXNzYWdlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIl19
