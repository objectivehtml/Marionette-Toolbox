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

    Toolbox.VERSION = '0.7.100';

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
  buffer += "\"><span class=\"activity-indicator-label-text\">"
    + escapeExpression(((stack1 = (depth1 && depth1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span></span>";
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
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['button-dropdown-menu'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "dropup";
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n		<button type=\"button\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.buttonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.buttonIcon), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " "
    + escapeExpression(((stack1 = (depth1 && depth1.buttonLabel)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</button>\n		<button type=\"button\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.buttonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = (depth1 && depth1.buttonToggleClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n			<span class=\"caret\"></span>\n			<span class=\"sr-only\">Toggle Dropdown</span>\n		</button>\n	";
  return buffer;
  }
function program4(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "<i class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.buttonIcon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i>";
  return buffer;
  }

function program6(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n		<button type=\"button\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.buttonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = (depth1 && depth1.buttonToggleClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n			";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.buttonIcon), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n			"
    + escapeExpression(((stack1 = (depth1 && depth1.buttonLabel)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n			<span class=\"caret\"></span>\n			<span class=\"sr-only\">Toggle Dropdown</span>\n		</button>\n	";
  return buffer;
  }

function program8(depth0,data,depth1) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth1 && depth1.menuClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  buffer += "<div class=\"btn-group ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.dropUp), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.splitButton), {hash:{},inverse:self.programWithDepth(6, program6, data, depth0),fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n	<ul class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.menuClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></ul>\n</div>\n";
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
  return escapeExpression(((stack1 = (depth1 && depth1.menuClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

  buffer += "<a href=\"#\" class=\"";
  if (helper = helpers.toggleClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.toggleClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">";
  if (helper = helpers.toggleLabel) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.toggleLabel); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " <i class=\"";
  if (helper = helpers.toggleIconClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.toggleIconClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></i></a>\n\n<ul class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.menuClassName), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></ul>\n";
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
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['list-group-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n		<button type=\"button\" class=\"edit-item "
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.editButton)),stack1 == null || stack1 === false ? stack1 : stack1.className)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"><i class=\""
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.editButton)),stack1 == null || stack1 === false ? stack1 : stack1.icon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i> "
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.editButton)),stack1 == null || stack1 === false ? stack1 : stack1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</button>\n	";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n		<button type=\"button\" class=\"delete-item "
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.deleteButton)),stack1 == null || stack1 === false ? stack1 : stack1.className)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"><i class=\""
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.deleteButton)),stack1 == null || stack1 === false ? stack1 : stack1.icon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i> "
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.deleteButton)),stack1 == null || stack1 === false ? stack1 : stack1.label)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</button>\n	";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n	<span class=\"badge\">"
    + escapeExpression(((stack1 = (depth1 && depth1.badge)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span>\n";
  return buffer;
  }

  buffer += "<div class=\"list-group-item-actions\">\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasEditForm), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasDeleteForm), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.badge), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['list-group-test'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "test row item\n";
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['no-list-group-item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, self=this, helperMissing=helpers.helperMissing, functionType="function";

function program1(depth0,data) {
  
  
  return "\n    No items found.\n";
  }

  stack1 = (helper = helpers.not || (depth0 && depth0.not),options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.message), options) : helperMissing.call(depth0, "not", (depth0 && depth0.message), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  if (helper = helpers.message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
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
  stack1 = (helper = helpers.is || (depth0 && depth0.is),options={hash:{},inverse:self.noop,fn:self.programWithDepth(18, program18, data, depth0),data:data},helper ? helper.call(depth0, (depth0 && depth0.value), "!==", (depth0 && depth0.undefined), options) : helperMissing.call(depth0, "is", (depth0 && depth0.value), "!==", (depth0 && depth0.undefined), options));
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
  
  
  return "selected=\"selected\"";
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
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['range-slider'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"slider\"></div>";
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

  buffer += "<div class=\"row selection-pool-search\">\n    <div class=\"col-sm-12\">\n        <div class=\"selection-pool-search-field\">\n            <a href=\"#\" class=\"selection-pool-search-clear\"><i class=\"fa fa-times-circle\"></i></a>\n            <input type=\"text\" value=\"\" placeholder=\"Enter keywords to search the list\" class=\"search form-control\">\n        </div>\n    </div>\n</div>\n\n<div class=\"row selection-pool-lists\">\n    <div class=\"col-sm-6\">\n        <div class=\"available-pool droppable-pool\" data-accept=\".selected-pool .draggable-tree-node\" style=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.height), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></div>\n    </div>\n    <div class=\"col-sm-6\">\n        <div class=\"selected-pool droppable-pool\" data-accept=\".available-pool .draggable-tree-node\" style=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.height), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></div>\n    </div>\n</div>\n";
  return buffer;
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
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- Nav tabs -->\n<ul class=\"";
  if (helper = helpers.tabClassName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.tabClassName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" role=\"tablist\"></ul>\n\n<!-- Tab panes -->\n<div class=\"tab-content\"></div>\n";
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
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.headerClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
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
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['draggable-tree-view-node'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\n    <ul class=\"children\"></ul>\n";
  }

  buffer += "<i class=\"fa fa-bars drag-handle\"></i>\n\n<div class=\"node-name\">\n    <span>";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span>\n</div>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasChildren), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
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
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['wizard-buttons'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <button type=\"button\" class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.disabled), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  if (helper = helpers.className) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.className); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.icon), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n        </button>\n    ";
  return buffer;
  }
function program2(depth0,data,depth2) {
  
  var stack1;
  return escapeExpression(((stack1 = (depth2 && depth2.disabledClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program4(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<i class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.icon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i> ";
  return buffer;
  }

function program6(depth0,data,depth1) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <button type=\"button\" class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.disabled), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  if (helper = helpers.className) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.className); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n            ";
  if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.icon), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n    ";
  return buffer;
  }
function program7(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += " <i class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.icon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i>";
  return buffer;
  }

  buffer += "<div class=\"wizard-left-buttons pull-left\">\n    ";
  options={hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}
  if (helper = helpers.leftButtons) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.leftButtons); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.leftButtons) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n\n<div class=\"wizard-right-buttons pull-right\">\n    ";
  options={hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data}
  if (helper = helpers.rightButtons) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.rightButtons); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.rightButtons) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;
  })}));
(function (root, factory) {if (typeof define === 'function' && define.amd) {define(['handlebars'], function(Handlebars) {return factory(root.Toolbox, Handlebars)});} else if (typeof exports === 'object') {module.exports = factory(root.Toolbox, require('handlebars'));} else {factory(root.Toolbox, root.Handlebars);}}(this, function (Toolbox, Handlebars) {if(typeof Toolbox === "undefined") {throw Error('Handlebars is not defined.')}if(typeof Toolbox.templates !== "object") {Toolbox.templates = {}}Toolbox.templates['wizard-error'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "<"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
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
  
  var buffer = "", stack1;
  buffer += "<p>";
  stack1 = ((stack1 = (depth1 && depth1.message)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>";
  return buffer;
  }

function program7(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n    <ul class=\"wizard-error-list\">\n    ";
  stack1 = helpers.each.call(depth0, (depth1 && depth1.errors), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </ul>\n";
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = "";
  buffer += "\n        <li>"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</li>\n    ";
  return buffer;
  }

function program10(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n<button type=\"button\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.backButtonClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.backButtonIcon), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += escapeExpression(((stack1 = (depth1 && depth1.backButtonLabel)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</button>\n";
  return buffer;
  }
function program11(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "<i class=\""
    + escapeExpression(((stack1 = (depth2 && depth2.backButtonIcon)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></i> ";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.errorIcon), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.message), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.errors), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.showBackButton), {hash:{},inverse:self.noop,fn:self.programWithDepth(10, program10, data, depth0),data:data});
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
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
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
  
  var buffer = "", stack1;
  buffer += "<p>"
    + escapeExpression(((stack1 = (depth1 && depth1.message)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>";
  return buffer;
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
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.headerClassName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = (depth1 && depth1.header)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</"
    + escapeExpression(((stack1 = (depth1 && depth1.headerTagName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
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

    Toolbox.TreeViewNode = Toolbox.CompositeView.extend({

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
            Toolbox.ItemView.prototype.initialize.apply(this, arguments);

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

	Toolbox.NoListGroupItem = Toolbox.ItemView.extend({

		template: Toolbox.Template('no-list-group-item'),

		className: 'list-group-item',

		tagName: 'li',

		defaultOptions: {
			message: 'There are no items in the list.'
		},

		templateHelpers: function() {
			return this.options;
		}

	});

	Toolbox.ListGroupItem = Toolbox.ItemView.extend({

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
    				this.triggerMethod('click', e);
                }
			},
            'click .edit-item': function(e) {
                this.triggerMethod('click:edit', e);
            },
            'click .delete-item': function(e) {
                this.triggerMethod('click:delete', e);
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

		templateHelpers: function() {
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

    Toolbox.SelectionPool = Toolbox.LayoutView.extend({

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
            'click .selection-pool-search-clear': function() {
                this.clearSearch();
            }
        },

        templateHelpers: function() {
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

        showSearchActivity: function(message) {
            var self = this;

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

            tabClassName: 'nav nav-tabs',

			tabPaneClassName: 'tab-pane',

			content: []
		},

		tabViews: [],

        templateHelpers: function() {
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

	Toolbox.Wizard = Toolbox.LayoutView.extend({

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

	Toolbox.WizardButtons = Toolbox.ItemView.extend({

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
            Toolbox.ItemView.prototype.initialize.apply(this, arguments);

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

        templateHelpers: function() {
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

	Toolbox.WizardError = Toolbox.ItemView.extend({

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

        templateHelpers: function() {
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

	Toolbox.WizardProgress = Toolbox.ItemView.extend({

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

        defaultOptions: {
            headerTagName: 'h3',
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvb2xib3guanMiLCJEcm9wem9uZXMuanMiLCJUeXBpbmdEZXRlY3Rpb24uanMiLCJWaWV3T2Zmc2V0LmpzIiwidGVtcGxhdGVzLmpzIiwiaXMuanMiLCJub3QuanMiLCJwcm9wZXJ0eU9mLmpzIiwiVHJlZS5qcyIsIkl0ZW1WaWV3LmpzIiwiTGF5b3V0Vmlldy5qcyIsIkNvbXBvc2l0ZVZpZXcuanMiLCJDb2xsZWN0aW9uVmlldy5qcyIsIkJhc2VGaWVsZC5qcyIsIkJhc2VGb3JtLmpzIiwiVW5vcmRlcmVkTGlzdC5qcyIsIkRyb3Bkb3duTWVudS5qcyIsIlRyZWVWaWV3Tm9kZS5qcyIsIlRyZWVWaWV3LmpzIiwiRHJhZ2dhYmxlVHJlZU5vZGUuanMiLCJEcmFnZ2FibGVUcmVlVmlldy5qcyIsIkJ1dHRvbkRyb3Bkb3duTWVudS9CdXR0b25Ecm9wZG93bk1lbnUuanMiLCJBY3Rpdml0eUluZGljYXRvci9BY3Rpdml0eUluZGljYXRvci5qcyIsIkJyZWFkY3J1bWJzL0JyZWFkY3VtYnMuanMiLCJCdXR0b25Hcm91cC9CdXR0b25Hcm91cC5qcyIsIkNvcmUvTGVudmVuc2h0ZWluLmpzIiwiQ2hlY2tib3hGaWVsZC9DaGVja2JveEZpZWxkLmpzIiwiQ2FsZW5kYXIvQ2FsZW5kYXIuanMiLCJJbmxpbmVFZGl0b3IvSW5saW5lRWRpdG9yLmpzIiwiSW5wdXRGaWVsZC9JbnB1dEZpZWxkLmpzIiwiTGlnaHRTd2l0Y2hGaWVsZC9MaWdodFN3aXRjaEZpZWxkLmpzIiwiTGlzdEdyb3VwL0xpc3RHcm91cC5qcyIsIk1vZGFsL01vZGFsLmpzIiwiTm90aWZpY2F0aW9uL05vdGlmaWNhdGlvbi5qcyIsIk9yZGVyZWRMaXN0L09yZGVyZWRMaXN0LmpzIiwiUGFnZXIvUGFnZXIuanMiLCJQYWdpbmF0aW9uL1BhZ2luYXRpb24uanMiLCJQcm9ncmVzc0Jhci9Qcm9ncmVzc0Jhci5qcyIsIlJhZGlvRmllbGQvUmFkaW9GaWVsZC5qcyIsIlJhbmdlU2xpZGVyL1JhbmdlU2xpZGVyLmpzIiwiU2VsZWN0RmllbGQvU2VsZWN0RmllbGQuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2wuanMiLCJTZWxlY3Rpb25Qb29sL1NlbGVjdGlvblBvb2xUcmVlTm9kZS5qcyIsIlNlbGVjdGlvblBvb2wvU2VsZWN0aW9uUG9vbFRyZWVWaWV3LmpzIiwiU3RvcmFnZS9TdG9yYWdlLmpzIiwiVGFibGVWaWV3L1RhYmxlVmlldy5qcyIsIlRhYnMvVGFicy5qcyIsIlRleHRhcmVhRmllbGQvVGV4dEFyZWFGaWVsZC5qcyIsIldpemFyZC9XaXphcmQuanMiLCJXaXphcmQvV2l6YXJkQnV0dG9ucy5qcyIsIldpemFyZC9XaXphcmRFcnJvci5qcyIsIldpemFyZC9XaXphcmRQcm9ncmVzcy5qcyIsIldpemFyZC9XaXphcmRTdWNjZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5c0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdmVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9aQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDclNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFyaW9uZXR0ZS50b29sYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXG4gICAgICAgICAgICAgICAgJ2pxdWVyeScsXG4gICAgICAgICAgICAgICAgJ2JhY2tib25lJyxcbiAgICAgICAgICAgICAgICAnYmFja2JvbmUucmFkaW8nLFxuICAgICAgICAgICAgICAgICdiYWNrYm9uZS5tYXJpb25ldHRlJyxcbiAgICAgICAgICAgICAgICAnaGFuZGxlYmFycycsXG4gICAgICAgICAgICAgICAgJ3VuZGVyc2NvcmUnXG4gICAgICAgICAgICBdLCBmdW5jdGlvbigkLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUsIEhhbmRsZWJhcnMsIF8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LCAkLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUsIEhhbmRsZWJhcnMsIF8pO1xuICAgICAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLnJhZGlvJyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdoYW5kbGViYXJzJyksXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KHJvb3QsIHJvb3QuJCwgcm9vdC5CYWNrYm9uZSwgcm9vdC5CYWNrYm9uZS5SYWRpbywgcm9vdC5NYXJpb25ldHRlLCByb290LkhhbmRsZWJhcnMsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbihyb290LCAkLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUsIEhhbmRsZWJhcnMsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBUb29sYm94ID0ge307XG5cbiAgICBUb29sYm94LmhhbmRsZWJhcnMgPSB7fTtcblxuICAgIFRvb2xib3guVmlld3MgPSB7fTtcblxuICAgIFRvb2xib3guVkVSU0lPTiA9ICclJUdVTFBfSU5KRUNUX1ZFUlNJT04lJSc7XG5cbiAgICAvLyBUb29sYm94LlRlbXBsYXRlXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEdldCBhbiBleGlzdGluZyByZW5kZXJlZCBoYW5kbGViYXJzIHRlbXBsYXRlXG5cbiAgICBUb29sYm94LlRlbXBsYXRlID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBpZihUb29sYm94LnRlbXBsYXRlc1tuYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIFRvb2xib3gudGVtcGxhdGVzW25hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCBsb2NhdGUgdGhlIEhhbmRsZWJhcnMgdGVtcGxhdGUgd2l0aCB0aGUgbmFtZSBvZiBcIicrbmFtZSsnXCIuJztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUb29sYm94Lk9wdGlvbnNcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gR2V0IHRoZSBkZWZhdWx0IG9wdGlvbnMgYW5kIG9wdGlvbnMgYW5kIG1lcmdlIHRoZSxcblxuICAgIFRvb2xib3guT3B0aW9ucyA9IGZ1bmN0aW9uKGRlZmF1bHRPcHRpb25zLCBvcHRpb25zLCBjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgTWFyaW9uZXR0ZS5fZ2V0VmFsdWUoZGVmYXVsdE9wdGlvbnMsIGNvbnRleHQpLCBNYXJpb25ldHRlLl9nZXRWYWx1ZShvcHRpb25zLCBjb250ZXh0KSk7XG4gICAgfTtcblxuICAgIHJldHVybiByb290LlRvb2xib3ggPSBUb29sYm94O1xufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICByZXR1cm4gZGVmaW5lKFsnanF1ZXJ5J10sIGZ1bmN0aW9uKCQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJClcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LiQpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guRHJvcHpvbmVzID0gZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrcywgY29udGV4dCkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGV2ZW50LmRyb3B6b25lLmVsZW1lbnQoKTtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyIG9mZnNldCA9IFRvb2xib3guVmlld09mZnNldChlbGVtZW50KTtcbiAgICAgICAgdmFyIHRvcCA9IG9mZnNldC55O1xuICAgICAgICB2YXIgbGVmdCA9IG9mZnNldC54O1xuICAgICAgICB2YXIgaGVpZ2h0ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHZhciBoZWlnaHRUaHJlc2hvbGQgPSBoZWlnaHQgKiAuMjU7XG4gICAgICAgIHZhciB3aWR0aFRocmVzaG9sZCA9IDQwO1xuICAgICAgICB2YXIgYm90dG9tID0gdG9wICsgaGVpZ2h0O1xuXG4gICAgICAgIGlmKGhlaWdodFRocmVzaG9sZCA+IDIwKSB7XG4gICAgICAgICAgICBoZWlnaHRUaHJlc2hvbGQgPSAyMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGV2ZW50LnBhZ2VZIDwgdG9wICsgaGVpZ2h0VGhyZXNob2xkKSB7XG4gICAgICAgICAgICBjYWxsYmFja3MuYmVmb3JlID8gY2FsbGJhY2tzLmJlZm9yZS5jYWxsKGNvbnRleHQsICRlbGVtZW50KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihldmVudC5wYWdlWSA+IGJvdHRvbSAtIGhlaWdodFRocmVzaG9sZCB8fCBldmVudC5wYWdlWCA8IGxlZnQgKyB3aWR0aFRocmVzaG9sZCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmFmdGVyID8gY2FsbGJhY2tzLmFmdGVyLmNhbGwoY29udGV4dCwgJGVsZW1lbnQpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5jaGlsZHJlbiA/IGNhbGxiYWNrcy5jaGlsZHJlbi5jYWxsKGNvbnRleHQsICRlbGVtZW50KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UeXBpbmdEZXRlY3Rpb24gPSBmdW5jdGlvbigkZWxlbWVudCwgdHlwaW5nU3RvcHBlZFRocmVzaG9sZCwgcmFkaW9DaGFubmVsKSB7XG4gICAgICAgIHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQgfHwgKHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQgPSA1MDApO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHR5cGluZ1RpbWVyLCBsYXN0VmFsdWU7XG4gICAgICAgIHZhciBoYXNUeXBpbmdTdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5nZXRWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50LnZhbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGFzVHlwaW5nU3RhcnRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMYXN0VmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXN0VmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGVhclRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0eXBpbmdUaW1lcikge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBpbmdUaW1lcik7XG4gICAgICAgICAgICAgICAgdHlwaW5nVGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJGVsZW1lbnQua2V5dXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYoIXR5cGluZ1RpbWVyKSB7XG4gICAgICAgICAgICAgICAgdHlwaW5nVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZihyYWRpb0NoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2hhbm5lbC50cmlnZ2VyKCdkZXRlY3Rpb246dHlwaW5nOnN0b3BwZWQnLCBzZWxmLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxhc3RWYWx1ZSA9IHNlbGYuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgaGFzVHlwaW5nU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sIHR5cGluZ1N0b3BwZWRUaHJlc2hvbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkZWxlbWVudC5rZXlkb3duKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYoIWhhc1R5cGluZ1N0YXJ0ZWQgJiYgc2VsZi5nZXRWYWx1ZSgpICE9IGxhc3RWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihyYWRpb0NoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2hhbm5lbC50cmlnZ2VyKCdkZXRlY3Rpb246dHlwaW5nOnN0YXJ0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoYXNUeXBpbmdTdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5jbGVhclRpbWVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlZpZXdPZmZzZXQgPSBmdW5jdGlvbihub2RlLCBzaW5nbGVGcmFtZSkge1xuICAgICAgICBmdW5jdGlvbiBhZGRPZmZzZXQobm9kZSwgY29vcmRzLCB2aWV3KSB7XG4gICAgICAgICAgICB2YXIgcCA9IG5vZGUub2Zmc2V0UGFyZW50O1xuXG4gICAgICAgICAgICBjb29yZHMueCArPSBub2RlLm9mZnNldExlZnQgLSAocCA/IHAuc2Nyb2xsTGVmdCA6IDApO1xuICAgICAgICAgICAgY29vcmRzLnkgKz0gbm9kZS5vZmZzZXRUb3AgLSAocCA/IHAuc2Nyb2xsVG9wIDogMCk7XG5cbiAgICAgICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHAubm9kZVR5cGUgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50U3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUocCwgJycpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRTdHlsZS5wb3NpdGlvbiAhPSAnc3RhdGljJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gcGFyc2VJbnQocGFyZW50U3R5bGUuYm9yZGVyTGVmdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlLmJvcmRlclRvcFdpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHAubG9jYWxOYW1lID09ICdUQUJMRScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChwYXJlbnRTdHlsZS5wYWRkaW5nTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gcGFyc2VJbnQocGFyZW50U3R5bGUucGFkZGluZ1RvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwLmxvY2FsTmFtZSA9PSAnQk9EWScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUobm9kZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpbkxlZnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy55ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocC5sb2NhbE5hbWUgPT0gJ0JPRFknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChwYXJlbnRTdHlsZS5ib3JkZXJMZWZ0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgKz0gcGFyc2VJbnQocGFyZW50U3R5bGUuYm9yZGVyVG9wV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocCAhPSBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy54IC09IHBhcmVudC5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgLT0gcGFyZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYWRkT2Zmc2V0KHAsIGNvb3Jkcywgdmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubG9jYWxOYW1lID09ICdCT0RZJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUobm9kZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueCArPSBwYXJzZUludChzdHlsZS5ib3JkZXJMZWZ0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBwYXJzZUludChzdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWxTdHlsZSA9IHZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLnBhcmVudE5vZGUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggLT0gcGFyc2VJbnQoaHRtbFN0eWxlLnBhZGRpbmdMZWZ0KTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnkgLT0gcGFyc2VJbnQoaHRtbFN0eWxlLnBhZGRpbmdUb3ApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLnNjcm9sbExlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLnggKz0gbm9kZS5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLnNjcm9sbFRvcCkge1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMueSArPSBub2RlLnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgd2luID0gbm9kZS5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4gICAgICAgICAgICAgICAgaWYgKHdpbiAmJiAoIXNpbmdsZUZyYW1lICYmIHdpbi5mcmFtZUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZE9mZnNldCh3aW4uZnJhbWVFbGVtZW50LCBjb29yZHMsIHdpbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvb3JkcyA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgIGFkZE9mZnNldChub2RlLCBjb29yZHMsIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgIH07XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snZm9ybS1lcnJvciddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG4gICAgPHNwYW4+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKHR5cGVvZiBkZXB0aDAgPT09IGZ1bmN0aW9uVHlwZSA/IGRlcHRoMC5hcHBseShkZXB0aDApIDogZGVwdGgwKSlcbiAgICArIFwiPC9zcGFuPlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5uZXdsaW5lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMihkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIjxicj5cIjtcbiAgfVxuXG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZXJyb3JzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snYWN0aXZpdHktaW5kaWNhdG9yJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcImRpbW1lZFwiO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwibWluLWhlaWdodDpcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm1pbkhlaWdodCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiO1wiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW01KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwicG9zaXRpb246XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5wb3NpdGlvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiO1wiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW03KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiYmFja2dyb3VuZC1jb2xvcjogXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kaW1tZWRCZ0NvbG9yKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI7XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCI8c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsXFxcIiBzdHlsZT1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsRm9udFNpemUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTAsIHByb2dyYW0xMCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+PHNwYW4gY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvci1sYWJlbC10ZXh0XFxcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3NwYW4+PC9zcGFuPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMTAoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJmb250LXNpemU6XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5sYWJlbEZvbnRTaXplKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvci1kaW1tZXIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRpbW1lZCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiIHN0eWxlPVxcXCJcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubWluSGVpZ2h0KSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5wb3NpdGlvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg1LCBwcm9ncmFtNSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGltbWVkQmdDb2xvciksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg3LCBwcm9ncmFtNywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+XFxuXFxuXHQ8c3BhbiBjbGFzcz1cXFwiYWN0aXZpdHktaW5kaWNhdG9yXFxcIj5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOSwgcHJvZ3JhbTksIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L3NwYW4+XFxuXFxuPC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snYnV0dG9uLWRyb3Bkb3duLW1lbnUnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiZHJvcHVwXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJ1dHRvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEuYnV0dG9uSWNvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg0LCBwcm9ncmFtNCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJ1dHRvbkxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L2J1dHRvbj5cXG5cdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJ1dHRvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiIFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuYnV0dG9uVG9nZ2xlQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIGRhdGEtdG9nZ2xlPVxcXCJkcm9wZG93blxcXCIgYXJpYS1leHBhbmRlZD1cXFwiZmFsc2VcXFwiPlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJjYXJldFxcXCI+PC9zcGFuPlxcblx0XHRcdDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5Ub2dnbGUgRHJvcGRvd248L3NwYW4+XFxuXHRcdDwvYnV0dG9uPlxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPGkgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuYnV0dG9uSWNvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48L2k+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJ1dHRvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiIFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuYnV0dG9uVG9nZ2xlQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIGRhdGEtdG9nZ2xlPVxcXCJkcm9wZG93blxcXCIgYXJpYS1leHBhbmRlZD1cXFwiZmFsc2VcXFwiPlxcblx0XHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5idXR0b25JY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDQsIHByb2dyYW00LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHRcdFx0XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5idXR0b25MYWJlbCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxuXHRcdFx0PHNwYW4gY2xhc3M9XFxcImNhcmV0XFxcIj48L3NwYW4+XFxuXHRcdFx0PHNwYW4gY2xhc3M9XFxcInNyLW9ubHlcXFwiPlRvZ2dsZSBEcm9wZG93bjwvc3Bhbj5cXG5cdFx0PC9idXR0b24+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtOChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubWVudUNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPVxcXCJidG4tZ3JvdXAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRyb3BVcCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLnNwbGl0QnV0dG9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNiwgcHJvZ3JhbTYsIGRhdGEsIGRlcHRoMCksZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8dWwgY2xhc3M9XFxcIlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5tZW51Q2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDgsIHByb2dyYW04LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj48L3VsPlxcbjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2JyZWFkY3J1bWInXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlcjtcbiAgYnVmZmVyICs9IFwiPGEgaHJlZj1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmhyZWYpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaHJlZik7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiPC9hPlwiO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaHJlZiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBpZiAoaGVscGVyID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKTtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaHJlZiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ25vLWJyZWFkY3J1bWJzJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIjtcblxuXG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snYnV0dG9uLWdyb3VwLWl0ZW0nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCI8aSBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pY29uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSk7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snbm8tYnV0dG9uLWdyb3VwLWl0ZW0nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiO1xuXG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydjYWxlbmRhci1tb250aGx5LWRheS12aWV3J10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0PHNwYW4gY2xhc3M9XFxcImNhbGVuZGFyLWhhcy1ldmVudHNcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jaXJjbGVcXFwiPjwvaT48L3NwYW4+XFxuXCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8c3BhbiBjbGFzcz1cXFwiY2FsZW5kYXItZGF0ZVxcXCI+XCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmRheSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5kYXkpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9zcGFuPlxcblxcblwiO1xuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5pcyB8fCAoZGVwdGgwICYmIGRlcHRoMC5pcyksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLmV2ZW50cykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEubGVuZ3RoKSwgXCI+XCIsIFwiMFwiLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwiaXNcIiwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5ldmVudHMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmxlbmd0aCksIFwiPlwiLCBcIjBcIiwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydjYWxlbmRhci1tb250aGx5LXZpZXcnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiY2FsZW5kYXItbWFzdGhlYWRcXFwiPlxcblx0PG5hdiBjbGFzcz1cXFwiY2FsZW5kYXItbmF2aWdhdGlvblxcXCI+XFxuXHRcdDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJjYWxlbmRhci1uYXZpZ2F0aW9uLXByZXZcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1hbmdsZS1sZWZ0XFxcIj48L2k+PC9hPlxcblx0XHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiY2FsZW5kYXItbmF2aWdhdGlvbi1uZXh0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtYW5nbGUtcmlnaHRcXFwiPjwvaT48L2E+XFxuXHQ8L25hdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcImNhbGVuZGFyLWhlYWRlclxcXCI+PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJjYWxlbmRhci1zdWItaGVhZGVyXFxcIj48L2Rpdj5cXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPVxcXCJjYWxlbmRhci12aWV3XFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcImluZGljYXRvclxcXCI+PC9kaXY+XFxuXFxuXHQ8dGFibGUgY2xhc3M9XFxcImNhbGVuZGFyLW1vbnRobHktdmlld1xcXCI+XFxuXHRcdDx0aGVhZD5cXG5cdFx0XHQ8dHI+XFxuXHRcdFx0XHQ8dGg+U3VuPC90aD5cXG5cdFx0XHRcdDx0aD5Nb248L3RoPlxcblx0XHRcdFx0PHRoPlR1ZTwvdGg+XFxuXHRcdFx0XHQ8dGg+V2VkPC90aD5cXG5cdFx0XHRcdDx0aD5UaHVyPC90aD5cXG5cdFx0XHRcdDx0aD5Gcmk8L3RoPlxcblx0XHRcdFx0PHRoPlNhdDwvdGg+XFxuXHRcdFx0PC90cj5cXG5cdFx0PC90aGVhZD5cXG5cdFx0PHRib2R5PjwvdGJvZHk+XFxuXHQ8L3RhYmxlPlxcbjwvZGl2PlwiO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Zvcm0tY2hlY2tib3gtZmllbGQnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgYmxvY2tIZWxwZXJNaXNzaW5nPWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZ05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlcikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZ05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PHAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDQsIHByb2dyYW00LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTQoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5kZXNjcmlwdGlvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW02KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmlucHV0Q2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlxcblx0XHQ8bGFiZWwgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDcsIHByb2dyYW03LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPjxpbnB1dCB0eXBlPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnR5cGUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5uYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnZhbHVlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvbGFiZWw+XFxuXHQ8L2Rpdj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTcoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5sYWJlbENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcIjtcbiAgc3RhY2sxID0gKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm9wdGlvbnMpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpLGJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgc3RhY2sxLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTAsIHByb2dyYW0xMCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTEwKGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyO1xuICBidWZmZXIgKz0gXCJcXG5cdDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuaW5wdXRDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdDxsYWJlbCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMiAmJiBkZXB0aDIubGFiZWxDbGFzc05hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTEsIHByb2dyYW0xMSwgZGF0YSwgZGVwdGgyKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj48aW5wdXQgdHlwZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi50eXBlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIG5hbWU9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIubmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiW11cXFwiIHZhbHVlPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMudmFsdWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAudmFsdWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj4gXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvbGFiZWw+XFxuXHQ8L2Rpdj5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMTEoZGVwdGgwLGRhdGEsZGVwdGgzKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgzICYmIGRlcHRoMy5sYWJlbENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRlc2NyaXB0aW9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOSwgcHJvZ3JhbTksIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Ryb3Bkb3duLW1lbnUtaXRlbSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxhIGhyZWY9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaHJlZikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEuaWNvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgyLCBwcm9ncmFtMiwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLnZhbHVlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDQsIHByb2dyYW00LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEubGFiZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNiwgcHJvZ3JhbTYsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L2E+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPGkgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuaWNvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48L2k+IFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi52YWx1ZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kaXZpZGVyKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC5kaXZpZGVyKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snZHJvcGRvd24tbWVudS1uby1pdGVtcyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Ryb3Bkb3duLW1lbnUnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm1lbnVDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy50b2dnbGVDbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAudG9nZ2xlQ2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCIgZGF0YS10b2dnbGU9XFxcImRyb3Bkb3duXFxcIiByb2xlPVxcXCJidXR0b25cXFwiIGFyaWEtaGFzcG9wdXA9XFxcInRydWVcXFwiIGFyaWEtZXhwYW5kZWQ9XFxcImZhbHNlXFxcIj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMudG9nZ2xlTGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAudG9nZ2xlTGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiIDxpIGNsYXNzPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMudG9nZ2xlSWNvbkNsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC50b2dnbGVJY29uQ2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCI+PC9pPjwvYT5cXG5cXG48dWwgY2xhc3M9XFxcIlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5tZW51Q2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj48L3VsPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2lubGluZS1lZGl0b3InXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiaW5saW5lLWVkaXRvci1sYWJlbFxcXCI+PC9kaXY+XFxuXFxuPGkgY2xhc3M9XFxcImZhIGZhLXBlbmNpbCBpbmxpbmUtZWRpdG9yLWVkaXQtaWNvblxcXCI+PC9pPlxcblxcbjxkaXYgY2xhc3M9XFxcImlubGluZS1lZGl0b3ItZmllbGRcXFwiPjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XFxcImlubGluZS1lZGl0b3ItYWN0aXZpdHktaW5kaWNhdG9yXFxcIj48L2Rpdj5cIjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydmb3JtLWlucHV0LWZpZWxkJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXIpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxsYWJlbCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEuaWQpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNCwgcHJvZ3JhbTQsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubGFiZWwpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiaWQ9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuaWQpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmxhYmVsQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTgoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxwIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbkNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg5LCBwcm9ncmFtOSwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3A+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuZGVzY3JpcHRpb25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJuYW1lPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm5hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJpZD1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pZCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRlc2NyaXB0aW9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDgsIHByb2dyYW04LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuPGlucHV0IHR5cGU9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy50eXBlKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnR5cGUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMSwgcHJvZ3JhbTExLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pZCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMywgcHJvZ3JhbTEzLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIGNsYXNzPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaW5wdXRDbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaW5wdXRDbGFzc05hbWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiAvPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Zvcm0tbGlnaHQtc3dpdGNoLWZpZWxkJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8bGFiZWwgZm9yPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmlkKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubGFiZWwpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxwIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbkNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg2LCBwcm9ncmFtNiwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3A+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW02KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuZGVzY3JpcHRpb25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtOChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuYWN0aXZlQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhlYWRlciksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kZXNjcmlwdGlvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg1LCBwcm9ncmFtNSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcbjxkaXYgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5pbnB1dENsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCIgXCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLmlzIHx8IChkZXB0aDAgJiYgZGVwdGgwLmlzKSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg4LCBwcm9ncmFtOCwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAudmFsdWUpLCAxLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwiaXNcIiwgKGRlcHRoMCAmJiBkZXB0aDAudmFsdWUpLCAxLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiIHRhYmluZGV4PVxcXCIwXFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcImxpZ2h0LXN3aXRjaC1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsaWdodC1zd2l0Y2gtbGFiZWwgb25cXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsaWdodC1zd2l0Y2gtaGFuZGxlXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGlnaHQtc3dpdGNoLWxhYmVsIG9mZlxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cXG5cXG48aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5uYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCIgdmFsdWU9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy52YWx1ZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC52YWx1ZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIGlkPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaWQpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWydsaXN0LWdyb3VwLWl0ZW0nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJlZGl0LWl0ZW0gXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmVkaXRCdXR0b24pKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48aSBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmVkaXRCdXR0b24pKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmljb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+PC9pPiBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZWRpdEJ1dHRvbikpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEubGFiZWwpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvYnV0dG9uPlxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJkZWxldGUtaXRlbSBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVsZXRlQnV0dG9uKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5jbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+PGkgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kZWxldGVCdXR0b24pKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmljb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+PC9pPiBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVsZXRlQnV0dG9uKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sYWJlbCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9idXR0b24+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PHNwYW4gY2xhc3M9XFxcImJhZGdlXFxcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJhZGdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3NwYW4+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPVxcXCJsaXN0LWdyb3VwLWl0ZW0tYWN0aW9uc1xcXCI+XFxuXHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGFzRWRpdEZvcm0pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oYXNEZWxldGVGb3JtKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC9kaXY+XFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmJhZGdlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDUsIHByb2dyYW01LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2xpc3QtZ3JvdXAtdGVzdCddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCJ0ZXN0IHJvdyBpdGVtXFxuXCI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snbm8tbGlzdC1ncm91cC1pdGVtJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuICAgIE5vIGl0ZW1zIGZvdW5kLlxcblwiO1xuICB9XG5cbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5tZXNzYWdlKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC5tZXNzYWdlKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubWVzc2FnZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ21vZGFsLXdpbmRvdyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgYmxvY2tIZWxwZXJNaXNzaW5nPWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyO1xuICBidWZmZXIgKz0gXCJcXG5cdDxoMyBjbGFzcz1cXFwibW9kYWwtaGVhZGVyXFxcIj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaGVhZGVyKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmhlYWRlcik7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L2gzPlxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucztcbiAgYnVmZmVyICs9IFwiXFxuXHRcdDxkaXYgY2xhc3M9XFxcIm1vZGFsLWJ1dHRvbnNcXFwiPlxcblx0XHRcIjtcbiAgb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNCwgcHJvZ3JhbTQsIGRhdGEpLGRhdGE6ZGF0YX1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuYnV0dG9ucykgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5idXR0b25zKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCBvcHRpb25zKSA6IGhlbHBlcjsgfVxuICBpZiAoIWhlbHBlcnMuYnV0dG9ucykgeyBzdGFjazEgPSBibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDQsIHByb2dyYW00LCBkYXRhKSxkYXRhOmRhdGF9KTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHRcdDwvZGl2Plxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXI7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDxhIGhyZWY9XFxcIlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5ocmVmKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDUsIHByb2dyYW01LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIiBjbGFzcz1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmNsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5jbGFzc05hbWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaWQpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNywgcHJvZ3JhbTcsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDksIHByb2dyYW05LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMudGV4dCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC50ZXh0KTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L2E+XFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaHJlZikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTcoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlcjtcbiAgYnVmZmVyICs9IFwiaWQ9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5pZCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCI8c3BhbiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pY29uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvc3Bhbj4gXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPVxcXCJtb2RhbC13aW5kb3dcXFwiPlxcblx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIm1vZGFsLWNsb3NlXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtdGltZXMtY2lyY2xlXFxcIj48L2k+PC9hPlxcblxcblx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhlYWRlciksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdDxkaXYgY2xhc3M9XFxcIm1vZGFsLWNvbnRlbnQgY2xlYXJmaXhcXFwiPjwvZGl2Plxcblxcblx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmJ1dHRvbnMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snbm90aWZpY2F0aW9uJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlcjtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPVxcXCJjb2wtc20tMlxcXCI+XFxuXHRcdDxpIGNsYXNzPVxcXCJmYSBmYS1cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5pY29uKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIiBpY29uXFxcIj48L2k+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImNvbC1sZy0xMFxcXCI+XFxuXHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS50aXRsZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgyLCBwcm9ncmFtMiwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEubWVzc2FnZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg0LCBwcm9ncmFtNCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC9kaXY+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCI8aDM+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi50aXRsZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9oMz5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIjxwPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIubWVzc2FnZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9wPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW02KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPVxcXCJjb2wtbGctMTJcXFwiPlxcblx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEudGl0bGUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMiwgcHJvZ3JhbTIsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLm1lc3NhZ2UpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNCwgcHJvZ3JhbTQsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvZGl2Plxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiY2xvc2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lcy1jaXJjbGVcXFwiPjwvaT48L2E+XFxuXFxuPGRpdiBjbGFzcz1cXFwicm93XFxcIj5cXG5cXG5cdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNiwgcHJvZ3JhbTYsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmljb24pLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLmljb24pLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyduby1vcmRlcmVkLWxpc3QtaXRlbSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5tZXNzYWdlKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IHJldHVybiBzdGFjazE7IH1cbiAgZWxzZSB7IHJldHVybiAnJzsgfVxuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ29yZGVyZWQtbGlzdC1pdGVtJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBpZiAoaGVscGVyID0gaGVscGVycy5jb250ZW50KSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgcmV0dXJuIHN0YWNrMTsgfVxuICBlbHNlIHsgcmV0dXJuICcnOyB9XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1sncGFnZXInXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnByZXZDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdDxsaSBjbGFzcz1cXFwicGFnZS10b3RhbHNcXFwiPlBhZ2UgXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5wYWdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCIgb2YgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLnRvdGFsUGFnZXMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNCwgcHJvZ3JhbTQsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L2xpPlxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIHN0YWNrMTtcbiAgcmV0dXJuIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi50b3RhbFBhZ2VzKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNihkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubmV4dENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dWwgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5wYWdlckNsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5wYWdlckNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcblx0PGxpIGNsYXNzPVxcXCJcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuc25hcFRvRWRnZXMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPjxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJwcmV2LXBhZ2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1sb25nLWFycm93LWxlZnRcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L2k+IFwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5wcmV2TGFiZWwpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAucHJldkxhYmVsKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmluY2x1ZGVQYWdlVG90YWxzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHQ8bGkgY2xhc3M9XFxcIlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5zbmFwVG9FZGdlcyksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg2LCBwcm9ncmFtNiwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIm5leHQtcGFnZVxcXCI+XCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLm5leHRMYWJlbCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5uZXh0TGFiZWwpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiIDxpIGNsYXNzPVxcXCJmYSBmYS1sb25nLWFycm93LXJpZ2h0XFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9pPjwvYT48L2xpPlxcbjwvdWw+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1sncHJvZ3Jlc3MtYmFyJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnByb2dyZXNzQmFyQ2xhc3NOYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnByb2dyZXNzQmFyQ2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCIgcm9sZT1cXFwicHJvZ3Jlc3NiYXJcXFwiIGFyaWEtdmFsdWVub3c9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5wcm9ncmVzcykgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5wcm9ncmVzcyk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIGFyaWEtdmFsdWVtaW49XFxcIjBcXFwiIGFyaWEtdmFsdWVtYXg9XFxcIjEwMFxcXCIgc3R5bGU9XFxcIndpZHRoOiBcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMucHJvZ3Jlc3MpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAucHJvZ3Jlc3MpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiJTtcXFwiPlxcblx0PHNwYW4gY2xhc3M9XFxcInNyLW9ubHlcXFwiPlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5wcm9ncmVzcykgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5wcm9ncmVzcyk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCIlIENvbXBsZXRlPC9zcGFuPlxcbjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Zvcm0tcmFkaW8tZmllbGQnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgYmxvY2tIZWxwZXJNaXNzaW5nPWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZ05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlcikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlYWRlclRhZ05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PHAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDQsIHByb2dyYW00LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvcD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTQoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5kZXNjcmlwdGlvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW02KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmlucHV0Q2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlxcblx0XHQ8bGFiZWwgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDcsIHByb2dyYW03LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPjxpbnB1dCB0eXBlPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnR5cGUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCIgbmFtZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5uYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnZhbHVlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvbGFiZWw+XFxuXHQ8L2Rpdj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTcoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5sYWJlbENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcIjtcbiAgc3RhY2sxID0gKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm9wdGlvbnMpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpLGJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgc3RhY2sxLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTAsIHByb2dyYW0xMCwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTEwKGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyO1xuICBidWZmZXIgKz0gXCJcXG5cdDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuaW5wdXRDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdDxsYWJlbCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMiAmJiBkZXB0aDIubGFiZWxDbGFzc05hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTEsIHByb2dyYW0xMSwgZGF0YSwgZGVwdGgyKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj48aW5wdXQgdHlwZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi50eXBlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIG5hbWU9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIubmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiW11cXFwiIHZhbHVlPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMudmFsdWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAudmFsdWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj4gXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvbGFiZWw+XFxuXHQ8L2Rpdj5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMTEoZGVwdGgwLGRhdGEsZGVwdGgzKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgzICYmIGRlcHRoMy5sYWJlbENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRlc2NyaXB0aW9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOSwgcHJvZ3JhbTksIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3BhZ2luYXRpb24taXRlbSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnM7XG4gIGJ1ZmZlciArPSBcIlxcblx0PGEgaHJlZj1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmhyZWYpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMiwgcHJvZ3JhbTIsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5ub3QgfHwgKGRlcHRoMSAmJiBkZXB0aDEubm90KSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg0LCBwcm9ncmFtNCwgZGF0YSksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmhyZWYpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDEgJiYgZGVwdGgxLmhyZWYpLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiIGRhdGEtcGFnZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5wYWdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEucGFnZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9hPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuaHJlZikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTQoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCIjXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdDxhPiZoZWxsaXA7PC9hPlxcblwiO1xuICB9XG5cbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMubm90IHx8IChkZXB0aDAgJiYgZGVwdGgwLm5vdCksb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRpdmlkZXIpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLmRpdmlkZXIpLCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGl2aWRlciksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg2LCBwcm9ncmFtNiwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3BhZ2luYXRpb24nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cblxuICBidWZmZXIgKz0gXCI8dWwgY2xhc3M9XFxcInBhZ2luYXRpb24gXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnBhZ2luYXRpb25DbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAucGFnaW5hdGlvbkNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcblx0PGxpPlxcblx0XHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwicHJldi1wYWdlXFxcIiBhcmlhLWxhYmVsPVxcXCJQcmV2aW91c1xcXCI+XFxuXHRcdFx0PHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPiZsYXF1bzs8L3NwYW4+XFxuXHRcdDwvYT5cXG5cdDwvbGk+XFxuICAgIDxsaT5cXG5cdFx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcIm5leHQtcGFnZVxcXCIgYXJpYS1sYWJlbD1cXFwiTmV4dFxcXCI+XFxuXHRcdFx0PHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPiZyYXF1bzs8L3NwYW4+XFxuXHRcdDwvYT5cXG4gICAgPC9saT5cXG48L3VsPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2Zvcm0tc2VsZWN0LWZpZWxkJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBibG9ja0hlbHBlck1pc3Npbmc9aGVscGVycy5ibG9ja0hlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXIpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxsYWJlbCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEuaWQpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNCwgcHJvZ3JhbTQsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsQ2xhc3NOYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubGFiZWwpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvbGFiZWw+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiaWQ9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuaWQpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmxhYmVsQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTgoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDxwIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbkNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg5LCBwcm9ncmFtOSwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3A+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhLGRlcHRoMikge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuZGVzY3JpcHRpb25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJuYW1lPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm5hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJpZD1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pZCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xNShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIm11bHRpcGxlXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTE3KGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnM7XG4gIGJ1ZmZlciArPSBcIlxcblx0PG9wdGlvbiBcIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDE4LCBwcm9ncmFtMTgsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLnZhbHVlKSwgXCIhPT1cIiwgKGRlcHRoMCAmJiBkZXB0aDAudW5kZWZpbmVkKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcImlzXCIsIChkZXB0aDAgJiYgZGVwdGgwLnZhbHVlKSwgXCIhPT1cIiwgKGRlcHRoMCAmJiBkZXB0aDAudW5kZWZpbmVkKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5zZWxlY3RlZCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgyMCwgcHJvZ3JhbTIwLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMjIsIHByb2dyYW0yMiwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDI0LCBwcm9ncmFtMjQsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvb3B0aW9uPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMTgoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJ2YWx1ZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS52YWx1ZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0yMChkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcInNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCJcIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMjIoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICBzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IHJldHVybiBzdGFjazE7IH1cbiAgZWxzZSB7IHJldHVybiAnJzsgfVxuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0yNChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEudmFsdWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgcmV0dXJuIHN0YWNrMTsgfVxuICBlbHNlIHsgcmV0dXJuICcnOyB9XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubGFiZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMywgcHJvZ3JhbTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGVzY3JpcHRpb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOCwgcHJvZ3JhbTgsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG48c2VsZWN0IFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5uYW1lKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDExLCBwcm9ncmFtMTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEzLCBwcm9ncmFtMTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5pbnB1dENsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5pbnB1dENsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5tdWx0aXBsZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxNSwgcHJvZ3JhbTE1LCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cXG5cIjtcbiAgb3B0aW9ucz17aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMTcsIHByb2dyYW0xNywgZGF0YSksZGF0YTpkYXRhfVxuICBpZiAoaGVscGVyID0gaGVscGVycy5vcHRpb25zKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwgb3B0aW9ucyk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpIDogaGVscGVyOyB9XG4gIGlmICghaGVscGVycy5vcHRpb25zKSB7IHN0YWNrMSA9IGJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgc3RhY2sxLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMTcsIHByb2dyYW0xNywgZGF0YSksZGF0YTpkYXRhfSk7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvc2VsZWN0PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3JhbmdlLXNsaWRlciddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJzbGlkZXJcXFwiPjwvZGl2PlwiO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3NlbGVjdGlvbi1wb29sLXRyZWUtbm9kZSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcbiAgICA8dWwgY2xhc3M9XFxcImNoaWxkcmVuXFxcIj48L3VsPlxcblwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGkgY2xhc3M9XFxcImZhIGZhLWJhcnMgZHJhZy1oYW5kbGVcXFwiPjwvaT4gPHNwYW4gY2xhc3M9XFxcIm5vZGUtbmFtZVxcXCI+XCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3NwYW4+XFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhhc0NoaWxkcmVuKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3NlbGVjdGlvbi1wb29sJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImhlaWdodDpcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlaWdodCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiO1wiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwicm93IHNlbGVjdGlvbi1wb29sLXNlYXJjaFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS0xMlxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWxlY3Rpb24tcG9vbC1zZWFyY2gtZmllbGRcXFwiPlxcbiAgICAgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJzZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lcy1jaXJjbGVcXFwiPjwvaT48L2E+XFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIHZhbHVlPVxcXCJcXFwiIHBsYWNlaG9sZGVyPVxcXCJFbnRlciBrZXl3b3JkcyB0byBzZWFyY2ggdGhlIGxpc3RcXFwiIGNsYXNzPVxcXCJzZWFyY2ggZm9ybS1jb250cm9sXFxcIj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPVxcXCJyb3cgc2VsZWN0aW9uLXBvb2wtbGlzdHNcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtc20tNlxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhdmFpbGFibGUtcG9vbCBkcm9wcGFibGUtcG9vbFxcXCIgZGF0YS1hY2NlcHQ9XFxcIi5zZWxlY3RlZC1wb29sIC5kcmFnZ2FibGUtdHJlZS1ub2RlXFxcIiBzdHlsZT1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhlaWdodCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+PC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtc20tNlxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWxlY3RlZC1wb29sIGRyb3BwYWJsZS1wb29sXFxcIiBkYXRhLWFjY2VwdD1cXFwiLmF2YWlsYWJsZS1wb29sIC5kcmFnZ2FibGUtdHJlZS1ub2RlXFxcIiBzdHlsZT1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhlaWdodCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+PC9kaXY+XFxuICAgIDwvZGl2PlxcbjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3RhYi1jb250ZW50J10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBpZiAoaGVscGVyID0gaGVscGVycy5jb250ZW50KSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgcmV0dXJuIHN0YWNrMTsgfVxuICBlbHNlIHsgcmV0dXJuICcnOyB9XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1sndGFicyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuXG4gIGJ1ZmZlciArPSBcIjwhLS0gTmF2IHRhYnMgLS0+XFxuPHVsIGNsYXNzPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMudGFiQ2xhc3NOYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnRhYkNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIHJvbGU9XFxcInRhYmxpc3RcXFwiPjwvdWw+XFxuXFxuPCEtLSBUYWIgcGFuZXMgLS0+XFxuPGRpdiBjbGFzcz1cXFwidGFiLWNvbnRlbnRcXFwiPjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3RhYmxlLWFjdGl2aXR5LWluZGljYXRvci1yb3cnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwic3R5bGU9XFxcImhlaWdodDpcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmhlaWdodCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwicHhcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGQgY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvci1yb3dcXFwiIGNvbHNwYW49XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5jb2x1bW5zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sZW5ndGgpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCIgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhlaWdodCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvci1kaW1tZXJcXFwiPlxcblx0XHRcXG5cdFx0PHNwYW4gY2xhc3M9XFxcImFjdGl2aXR5LWluZGljYXRvclxcXCI+PC9zcGFuPlxcblxcblx0PC9kaXY+XFxuXFxuPC90ZD5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd0YWJsZS1uby1pdGVtcyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuXG4gIGJ1ZmZlciArPSBcIjx0ZCBjb2xzcGFuPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAmJiBkZXB0aDAuY29sdW1ucykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEubGVuZ3RoKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlxcblx0XCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLm1lc3NhZ2UpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubWVzc2FnZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG48L3RkPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3RhYmxlLXZpZXctZm9vdGVyJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEudG90YWxQYWdlcykpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSk7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnBhZ2UpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPHRkIGNvbHNwYW49XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5jb2x1bW5zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sZW5ndGgpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInBhZ2UtdG90YWxzXFxcIj5cXG4gICAgUGFnZSBcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMucGFnZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5wYWdlKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIiBvZiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAudG90YWxQYWdlcyksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC50b3RhbFBhZ2VzKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC50b3RhbFBhZ2VzKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC90ZD5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd0YWJsZS12aWV3LWdyb3VwJ10gPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBibG9ja0hlbHBlck1pc3Npbmc9aGVscGVycy5ibG9ja0hlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuPGRpdiBjbGFzcz1cXFwiYnV0dG9ucy13cmFwcGVyIHB1bGwtcmlnaHRcXFwiPlxcblx0XCI7XG4gIHN0YWNrMSA9ICgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5idXR0b25zKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKSxibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDIsIHByb2dyYW0yLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMihkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucztcbiAgYnVmZmVyICs9IFwiXFxuXHRcdDxhIGhyZWY9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5ocmVmKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmhyZWYpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDUsIHByb2dyYW01LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5jbGFzc05hbWUpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmljb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNywgcHJvZ3JhbTcsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCIgXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmxhYmVsKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvYT5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuY2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNShkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuYnV0dG9uQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmljb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+PC9pPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb25UYWcpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIiBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbkNsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb25UYWcpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnM7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDx0aCBzY29wZT1cXFwiY29sXFxcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAud2lkdGgpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTQsIHByb2dyYW0xNCwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBjbGFzcz1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gKGhlbHBlciA9IGhlbHBlcnMuaXMgfHwgKGRlcHRoMCAmJiBkZXB0aDAuaXMpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDE2LCBwcm9ncmFtMTYsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwgKGRlcHRoMSAmJiBkZXB0aDEub3JkZXIpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwiaXNcIiwgKGRlcHRoMCAmJiBkZXB0aDAuaWQpLCAoZGVwdGgxICYmIGRlcHRoMS5vcmRlciksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+XFxuXHRcdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaWQpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMTgsIHByb2dyYW0xOCwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdFx0XCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDIwLCBwcm9ncmFtMjAsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSxoZWxwZXIgPyBoZWxwZXIuY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoZGVwdGgwICYmIGRlcHRoMC5pZCksIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDwvdGg+XFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMTQoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJ3aWR0aD1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS53aWR0aCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xNihkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcInNvcnQtXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5zb3J0KSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMTgoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI1xcXCIgZGF0YS1pZD1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pZCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwic29ydFxcXCI+XCI7XG4gIHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEubmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvYT5cXG5cdFx0XHRcdFx0PGkgY2xhc3M9XFxcInNvcnQtaWNvbiBhc2MgZmEgZmEtc29ydC1hc2NcXFwiPjwvaT5cXG5cdFx0XHRcdFx0PGkgY2xhc3M9XFxcInNvcnQtaWNvbiBkZXNjIGZhIGZhLXNvcnQtZGVzY1xcXCI+PC9pPlxcblx0XHRcdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTIwKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdFx0XHRcdFwiO1xuICBzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm5hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5idXR0b25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5sZW5ndGgpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGVhZGVyKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDksIHByb2dyYW05LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRlc2NyaXB0aW9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDExLCBwcm9ncmFtMTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG48dGFibGUgY2xhc3M9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy50YWJsZUNsYXNzTmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC50YWJsZUNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcblx0PHRoZWFkPlxcblx0XHQ8dHI+XFxuXHRcdFwiO1xuICBvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMywgcHJvZ3JhbTEzLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5jb2x1bW5zKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCBvcHRpb25zKSA6IGhlbHBlcjsgfVxuICBpZiAoIWhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEzLCBwcm9ncmFtMTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L3RyPlxcblx0PC90aGVhZD5cXG5cdDx0Ym9keT48L3Rib2R5Plxcblx0PHRmb290PjwvdGZvb3Q+XFxuPC90YWJsZT5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd0YWJsZS12aWV3LXBhZ2luYXRpb24nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdj48L2Rpdj5cIjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd0YWJsZS12aWV3LXJvdyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIHNlbGY9dGhpcywgYmxvY2tIZWxwZXJNaXNzaW5nPWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucztcbiAgYnVmZmVyICs9IFwiXFxuXHQ8dGQgZGF0YS1pZD1cXFwiXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmlkKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmlkKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKGhlbHBlciA9IGhlbHBlcnMucHJvcGVydHlPZiB8fCAoZGVwdGgxICYmIGRlcHRoMS5wcm9wZXJ0eU9mKSxvcHRpb25zPXtoYXNoOnt9LGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCBkZXB0aDEsIChkZXB0aDAgJiYgZGVwdGgwLmlkKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcInByb3BlcnR5T2ZcIiwgZGVwdGgxLCAoZGVwdGgwICYmIGRlcHRoMC5pZCksIG9wdGlvbnMpKSlcbiAgICArIFwiPC90ZD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5jb2x1bW5zKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCBvcHRpb25zKSA6IGhlbHBlcjsgfVxuICBpZiAoIWhlbHBlcnMuY29sdW1ucykgeyBzdGFjazEgPSBibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgcmV0dXJuIHN0YWNrMTsgfVxuICBlbHNlIHsgcmV0dXJuICcnOyB9XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snZm9ybS10ZXh0YXJlYS1maWVsZCddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8bGFiZWwgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmlkKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDQsIHByb2dyYW00LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5sYWJlbENsYXNzTmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg2LCBwcm9ncmFtNiwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmxhYmVsKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L2xhYmVsPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImlkPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmlkKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgyICYmIGRlcHRoMi5sYWJlbENsYXNzTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW04KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8cCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMSAmJiBkZXB0aDEuZGVzY3JpcHRpb25DbGFzc05hbWUpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOSwgcHJvZ3JhbTksIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5kZXNjcmlwdGlvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9wPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtOShkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcImNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmRlc2NyaXB0aW9uQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTExKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwibmFtZT1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5uYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTEzKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiaWQ9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaWQpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCJcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmhlYWRlciksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgzLCBwcm9ncmFtMywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kZXNjcmlwdGlvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg4LCBwcm9ncmFtOCwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcbjx0ZXh0YXJlYSBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubmFtZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMSwgcHJvZ3JhbTExLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5pZCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMywgcHJvZ3JhbTEzLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIGNsYXNzPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaW5wdXRDbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaW5wdXRDbGFzc05hbWUpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj48L3RleHRhcmVhPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ2RyYWdnYWJsZS10cmVlLXZpZXctbm9kZSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcbiAgICA8dWwgY2xhc3M9XFxcImNoaWxkcmVuXFxcIj48L3VsPlxcblwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGkgY2xhc3M9XFxcImZhIGZhLWJhcnMgZHJhZy1oYW5kbGVcXFwiPjwvaT5cXG5cXG48ZGl2IGNsYXNzPVxcXCJub2RlLW5hbWVcXFwiPlxcbiAgICA8c3Bhbj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubmFtZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5uYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvc3Bhbj5cXG48L2Rpdj5cXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGFzQ2hpbGRyZW4pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1sndHJlZS12aWV3LW5vZGUnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG4gICAgPHVsIGNsYXNzPVxcXCJjaGlsZHJlblxcXCI+PC91bD5cXG5cIjtcbiAgfVxuXG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLm5hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaGFzQ2hpbGRyZW4pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snbm8tdW5vcmRlcmVkLWxpc3QtaXRlbSddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubWVzc2FnZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5tZXNzYWdlKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IHJldHVybiBzdGFjazE7IH1cbiAgZWxzZSB7IHJldHVybiAnJzsgfVxuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3Vub3JkZXJlZC1saXN0LWl0ZW0nXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmNvbnRlbnQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyByZXR1cm4gc3RhY2sxOyB9XG4gIGVsc2UgeyByZXR1cm4gJyc7IH1cbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd3aXphcmQtYnV0dG9ucyddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBibG9ja0hlbHBlck1pc3Npbmc9aGVscGVycy5ibG9ja0hlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyO1xuICBidWZmZXIgKz0gXCJcXG4gICAgICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmRpc2FibGVkKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDIsIHByb2dyYW0yLCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5jbGFzc05hbWUpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCI+XFxuICAgICAgICAgICAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLmljb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNCwgcHJvZ3JhbTQsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBpZiAoaGVscGVyID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICBcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmRpc2FibGVkQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmljb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+PC9pPiBcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNihkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlcjtcbiAgYnVmZmVyICs9IFwiXFxuICAgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcIlwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5kaXNhYmxlZCksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgyLCBwcm9ncmFtMiwgZGF0YSwgZGVwdGgxKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuY2xhc3NOYW1lKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcbiAgICAgICAgICAgIFwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5sYWJlbCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKTtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuaWNvbiksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg3LCBwcm9ncmFtNywgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbiAgICAgICAgPC9idXR0b24+XFxuICAgIFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNyhkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIiA8aSBjbGFzcz1cXFwiXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5pY29uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvaT5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9XFxcIndpemFyZC1sZWZ0LWJ1dHRvbnMgcHVsbC1sZWZ0XFxcIj5cXG4gICAgXCI7XG4gIG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubGVmdEJ1dHRvbnMpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCBvcHRpb25zKTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAubGVmdEJ1dHRvbnMpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIG9wdGlvbnMpIDogaGVscGVyOyB9XG4gIGlmICghaGVscGVycy5sZWZ0QnV0dG9ucykgeyBzdGFjazEgPSBibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEsIHByb2dyYW0xLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPVxcXCJ3aXphcmQtcmlnaHQtYnV0dG9ucyBwdWxsLXJpZ2h0XFxcIj5cXG4gICAgXCI7XG4gIG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX1cbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMucmlnaHRCdXR0b25zKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwgb3B0aW9ucyk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnJpZ2h0QnV0dG9ucyk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwgb3B0aW9ucykgOiBoZWxwZXI7IH1cbiAgaWYgKCFoZWxwZXJzLnJpZ2h0QnV0dG9ucykgeyBzdGFjazEgPSBibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd3aXphcmQtZXJyb3InXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLWVycm9yLWljb25cXFwiPjxpIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmVycm9ySWNvbikpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIj48L2k+PC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCI8cD5cIjtcbiAgc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5tZXNzYWdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9wPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW03KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuICAgIDx1bCBjbGFzcz1cXFwid2l6YXJkLWVycm9yLWxpc3RcXFwiPlxcbiAgICBcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCAoZGVwdGgxICYmIGRlcHRoMS5lcnJvcnMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oOCwgcHJvZ3JhbTgsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuICAgIDwvdWw+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW04KGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuICAgICAgICA8bGk+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKHR5cGVvZiBkZXB0aDAgPT09IGZ1bmN0aW9uVHlwZSA/IGRlcHRoMC5hcHBseShkZXB0aDApIDogZGVwdGgwKSlcbiAgICArIFwiPC9saT5cXG4gICAgXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTEwKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJhY2tCdXR0b25DbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDEgJiYgZGVwdGgxLmJhY2tCdXR0b25JY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDExLCBwcm9ncmFtMTEsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmJhY2tCdXR0b25MYWJlbCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPC9idXR0b24+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0xMShkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIjxpIGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmJhY2tCdXR0b25JY29uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPjwvaT4gXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZXJyb3JJY29uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDMsIHByb2dyYW0zLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLm1lc3NhZ2UpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNSwgcHJvZ3JhbTUsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZXJyb3JzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDcsIHByb2dyYW03LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIChkZXB0aDAgJiYgZGVwdGgwLnNob3dCYWNrQnV0dG9uKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDEwLCBwcm9ncmFtMTAsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSl9KSk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7ZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmdW5jdGlvbihIYW5kbGViYXJzKSB7cmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBIYW5kbGViYXJzKX0pO30gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnaGFuZGxlYmFycycpKTt9IGVsc2Uge2ZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkhhbmRsZWJhcnMpO319KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBIYW5kbGViYXJzKSB7aWYodHlwZW9mIFRvb2xib3ggPT09IFwidW5kZWZpbmVkXCIpIHt0aHJvdyBFcnJvcignSGFuZGxlYmFycyBpcyBub3QgZGVmaW5lZC4nKX1pZih0eXBlb2YgVG9vbGJveC50ZW1wbGF0ZXMgIT09IFwib2JqZWN0XCIpIHtUb29sYm94LnRlbXBsYXRlcyA9IHt9fVRvb2xib3gudGVtcGxhdGVzWyd3aXphcmQtcHJvZ3Jlc3MnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGJsb2NrSGVscGVyTWlzc2luZz1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnM7XG4gIGJ1ZmZlciArPSBcIlxcbiAgICA8YSBjbGFzcz1cXFwid2l6YXJkLXN0ZXAgXCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDIsIHByb2dyYW0yLCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmNvbXBsZXRlKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmNvbXBsZXRlKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmNvbXBsZXRlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDQsIHByb2dyYW00LCBkYXRhLCBkZXB0aDEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIiBkYXRhLXN0ZXA9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5zdGVwKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLnRpdGxlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDYsIHByb2dyYW02LCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPlxcbiAgICAgICAgXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsICgoc3RhY2sxID0gKGRlcHRoMCAmJiBkZXB0aDAub3B0aW9ucykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEubGFiZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoOCwgcHJvZ3JhbTgsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG4gICAgICAgIFwiO1xuICBzdGFjazEgPSAoaGVscGVyID0gaGVscGVycy5ub3QgfHwgKGRlcHRoMCAmJiBkZXB0aDAubm90KSxvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxMCwgcHJvZ3JhbTEwLCBkYXRhLCBkZXB0aDApLGRhdGE6ZGF0YX0saGVscGVyID8gaGVscGVyLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmxhYmVsKSwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcIm5vdFwiLCAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmxhYmVsKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuICAgIDwvYT5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgc3RhY2sxO1xuICByZXR1cm4gZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDIgJiYgZGVwdGgyLmRpc2FibGVkQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKTtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSxkZXB0aDIpIHtcbiAgXG4gIHZhciBzdGFjazE7XG4gIHJldHVybiBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIuY29tcGxldGVDbGFzc05hbWUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW02KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwidGl0bGU9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5vcHRpb25zKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS50aXRsZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiXFxcIlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW04KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIndpemFyZC1zdGVwLWxhYmVsXFxcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEub3B0aW9ucykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEubGFiZWwpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvc3Bhbj5cXG4gICAgICAgIFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0xMChkZXB0aDAsZGF0YSxkZXB0aDEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcbiAgICAgICAgICAgIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLm9wdGlvbnMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLnRpdGxlKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtV2l0aERlcHRoKDExLCBwcm9ncmFtMTEsIGRhdGEsIGRlcHRoMSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG4gICAgICAgIFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMTEoZGVwdGgwLGRhdGEsZGVwdGgyKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIndpemFyZC1zdGVwLWxhYmVsXFxcIj5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMiAmJiBkZXB0aDIub3B0aW9ucykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEudGl0bGUpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjwvc3Bhbj5cXG4gICAgICAgICAgICBcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9XFxcIndpemFyZC1wcm9ncmVzcy1iYXJcXFwiPlxcblwiO1xuICBvcHRpb25zPXtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLnN0ZXBzKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwgb3B0aW9ucyk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLnN0ZXBzKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCBvcHRpb25zKSA6IGhlbHBlcjsgfVxuICBpZiAoIWhlbHBlcnMuc3RlcHMpIHsgc3RhY2sxID0gYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBzdGFjazEsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCgxLCBwcm9ncmFtMSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge2RlZmluZShbJ2hhbmRsZWJhcnMnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge3JldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgSGFuZGxlYmFycyl9KTt9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7fSBlbHNlIHtmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5IYW5kbGViYXJzKTt9fSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgSGFuZGxlYmFycykge2lmKHR5cGVvZiBUb29sYm94ID09PSBcInVuZGVmaW5lZFwiKSB7dGhyb3cgRXJyb3IoJ0hhbmRsZWJhcnMgaXMgbm90IGRlZmluZWQuJyl9aWYodHlwZW9mIFRvb2xib3gudGVtcGxhdGVzICE9PSBcIm9iamVjdFwiKSB7VG9vbGJveC50ZW1wbGF0ZXMgPSB7fX1Ub29sYm94LnRlbXBsYXRlc1snd2l6YXJkLXN1Y2Nlc3MnXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPFwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwid2l6YXJkLXN1Y2Nlc3MtaWNvblxcXCI+PGkgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuc3VjY2Vzc0ljb24pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcXCI+PC9pPjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW01KGRlcHRoMCxkYXRhLGRlcHRoMSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiPHA+XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5tZXNzYWdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3A+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuc3VjY2Vzc0ljb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMywgcHJvZ3JhbTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAubWVzc2FnZSksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbVdpdGhEZXB0aCg1LCBwcm9ncmFtNSwgZGF0YSwgZGVwdGgwKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KX0pKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge2lmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtyZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEhhbmRsZWJhcnMpfSk7fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHttb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdoYW5kbGViYXJzJykpO30gZWxzZSB7ZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuSGFuZGxlYmFycyk7fX0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEhhbmRsZWJhcnMpIHtpZih0eXBlb2YgVG9vbGJveCA9PT0gXCJ1bmRlZmluZWRcIikge3Rocm93IEVycm9yKCdIYW5kbGViYXJzIGlzIG5vdCBkZWZpbmVkLicpfWlmKHR5cGVvZiBUb29sYm94LnRlbXBsYXRlcyAhPT0gXCJvYmplY3RcIikge1Rvb2xib3gudGVtcGxhdGVzID0ge319VG9vbGJveC50ZW1wbGF0ZXNbJ3dpemFyZCddID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG48ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLnBhbmVsQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJwYW5lbC1ib2R5XFxcIj5cXG4gICAgXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG4gICAgICAgICAgICA8XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoZGVwdGgxICYmIGRlcHRoMS5oZWFkZXJUYWdOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCIgY2xhc3M9XFxcIlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyQ2xhc3NOYW1lKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L1wiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKGRlcHRoMSAmJiBkZXB0aDEuaGVhZGVyVGFnTmFtZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlxcbiAgICAgICAgXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEsZGVwdGgxKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG4gICAgICAgICAgICA8cD5cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9IChkZXB0aDEgJiYgZGVwdGgxLmRlc2NyaXB0aW9uKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8L3A+XFxuICAgICAgICBcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwid2l6YXJkLWJ1dHRvbnNcXFwiPjwvZGl2PlxcbjwvZGl2PlxcblwiO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW05KGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuPGRpdiBjbGFzcz1cXFwid2l6YXJkLWJ1dHRvbnNcXFwiPjwvZGl2PlxcblwiO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAucGFuZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMSwgcHJvZ3JhbTEsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG4gICAgICAgIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5oZWFkZXIpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoMywgcHJvZ3JhbTMsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIndpemFyZC1wcm9ncmVzc1xcXCI+PC9kaXY+XFxuXFxuICAgICAgICBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZGVzY3JpcHRpb24pLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW1XaXRoRGVwdGgoNSwgcHJvZ3JhbTUsIGRhdGEsIGRlcHRoMCksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIndpemFyZC1jb250ZW50XFxcIj48L2Rpdj5cXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAucGFuZWwpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNywgcHJvZ3JhbTcsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IChoZWxwZXIgPSBoZWxwZXJzLm5vdCB8fCAoZGVwdGgwICYmIGRlcHRoMC5ub3QpLG9wdGlvbnM9e2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDksIHByb2dyYW05LCBkYXRhKSxkYXRhOmRhdGF9LGhlbHBlciA/IGhlbHBlci5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAucGFuZWwpLCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwibm90XCIsIChkZXB0aDAgJiYgZGVwdGgwLnBhbmVsKSwgb3B0aW9ucykpO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pfSkpOyIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2hhbmRsZWJhcnMnKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnaGFuZGxlYmFycyddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LkhhbmRsZWJhcnNIZWxwZXJzUmVnaXN0cnkgPSBmYWN0b3J5KHJvb3QuSGFuZGxlYmFycyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoSGFuZGxlYmFycykge1xuXG4gICAgdmFyIGlzQXJyYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgdmFyIEV4cHJlc3Npb25SZWdpc3RyeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV4cHJlc3Npb25zID0gW107XG4gICAgfTtcblxuICAgIEV4cHJlc3Npb25SZWdpc3RyeS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKG9wZXJhdG9yLCBtZXRob2QpIHtcbiAgICAgICAgdGhpcy5leHByZXNzaW9uc1tvcGVyYXRvcl0gPSBtZXRob2Q7XG4gICAgfTtcblxuICAgIEV4cHJlc3Npb25SZWdpc3RyeS5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uIChvcGVyYXRvciwgbGVmdCwgcmlnaHQpIHtcbiAgICAgICAgaWYgKCAhIHRoaXMuZXhwcmVzc2lvbnMuaGFzT3duUHJvcGVydHkob3BlcmF0b3IpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gb3BlcmF0b3IgXCInK29wZXJhdG9yKydcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvbnNbb3BlcmF0b3JdKGxlZnQsIHJpZ2h0KTtcbiAgICB9O1xuXG4gICAgdmFyIGVSID0gbmV3IEV4cHJlc3Npb25SZWdpc3RyeSgpO1xuICAgIGVSLmFkZCgnbm90JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgIT0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc+JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPiByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJzwnLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA8IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPj0nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdCA+PSByaWdodDtcbiAgICB9KTtcbiAgICBlUi5hZGQoJzw9JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPD0gcmlnaHQ7XG4gICAgfSk7XG4gICAgZVIuYWRkKCc9PScsIGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBsZWZ0ID09IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnPT09JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnIT09JywgZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnQgIT09IHJpZ2h0O1xuICAgIH0pO1xuICAgIGVSLmFkZCgnaW4nLCBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICBpZiAoICEgaXNBcnJheShyaWdodCkpIHtcbiAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmlnaHQuaW5kZXhPZihsZWZ0KSAhPT0gLTE7XG4gICAgfSk7XG5cbiAgICB2YXIgaXNIZWxwZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICBsZWZ0ID0gYXJnc1swXSxcbiAgICAgICAgICAgIG9wZXJhdG9yID0gYXJnc1sxXSxcbiAgICAgICAgICAgIHJpZ2h0ID0gYXJnc1syXSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmdzWzNdO1xuXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYXJnc1sxXTtcbiAgICAgICAgICAgIGlmIChsZWZ0KSByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT0gMykge1xuICAgICAgICAgICAgcmlnaHQgPSBhcmdzWzFdO1xuICAgICAgICAgICAgb3B0aW9ucyA9IGFyZ3NbMl07XG4gICAgICAgICAgICBpZiAobGVmdCA9PSByaWdodCkgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVSLmNhbGwob3BlcmF0b3IsIGxlZnQsIHJpZ2h0KSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9O1xuXG4gICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaXMnLCBpc0hlbHBlcik7XG5cbiAgICAvKlxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ25sMmJyJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICB2YXIgbmwyYnIgPSAodGV4dCArICcnKS5yZXBsYWNlKC8oW14+XFxyXFxuXT8pKFxcclxcbnxcXG5cXHJ8XFxyfFxcbikvZywgJyQxJyArICc8YnI+JyArICckMicpO1xuICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhubDJicik7XG4gICAgfSk7XG5cbiAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coWydWYWx1ZXM6J10uY29uY2F0KFxuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwLCAtMSlcbiAgICAgICAgKSk7XG4gICAgfSk7XG5cbiAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdkZWJ1ZycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ29udGV4dDonLCB0aGlzKTtcbiAgICAgICAgY29uc29sZS5sb2coWydWYWx1ZXM6J10uY29uY2F0KFxuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwLCAtMSlcbiAgICAgICAgKSk7XG4gICAgfSk7XG5cdCovXG5cbiAgICByZXR1cm4gZVI7XG5cbn0pKTsiLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdoYW5kbGViYXJzJyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnaGFuZGxlYmFycycsICd1bmRlcnNjb3JlJ10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuSGFuZGxlYmFyc0hlbHBlcnNSZWdpc3RyeSA9IGZhY3Rvcnkocm9vdC5IYW5kbGViYXJzLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKEhhbmRsZWJhcnMsIF8pIHtcblxuICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ25vdCcsIGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgXHRyZXR1cm4gIXZhbHVlIHx8IHZhbHVlID09IDAgPyBvcHRpb25zLmZuKHZhbHVlKSA6IGZhbHNlO1xuICAgIH0pO1xuICAgIFxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnaGFuZGxlYmFycycpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydoYW5kbGViYXJzJ10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuSGFuZGxlYmFyc0hlbHBlcnNSZWdpc3RyeSA9IGZhY3Rvcnkocm9vdC5IYW5kbGViYXJzKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG5cbiAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdwcm9wZXJ0eU9mJywgZnVuY3Rpb24ob2JqZWN0LCBwcm9wKSB7XG4gICAgICAgIGlmKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcob2JqZWN0W3Byb3BdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSwgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lLCByb290Lk1hcmlvbmV0dGUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblxuICAgIFRvb2xib3guVHJlZSA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuICAgICAgICBoYXNSZXNldE9uY2U6IGZhbHNlLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGFyYXRvcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbkNsYXNzOiBCYWNrYm9uZS5Db2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ29sbGVjdGlvbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG4gICAgICAgICAgICAgICAgcGFyZW50QXR0cmlidXRlOiAncGFyZW50X2lkJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbihjb2xsZWN0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBCYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgW10sIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBUb29sYm94Lk9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuZ2V0T3B0aW9uKCdvcmlnaW5hbENvbGxlY3Rpb24nKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vcmlnaW5hbENvbGxlY3Rpb24gPSBjb2xsZWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLnRlbXBsYXRlICYmICF0aGlzLmdldE9wdGlvbignY2hpbGRWaWV3T3B0aW9ucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNoaWxkVmlld09wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbignYWZ0ZXI6aW5pdGlhbGl6ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRUcmVlKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gSGFjayB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBDb2xsZWN0aW9uIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgICAgIC8vIGluaGVyaXRlZCBieSB0aGUgcHJvdG90eXBlLlxuICAgICAgICAgICAgaWYoIXRoaXMuaGFzUmVzZXRPbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNSZXNldE9uY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignYWZ0ZXI6aW5pdGlhbGl6ZScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUucmVzZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZFRyZWU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgICAgICAgICAgaWYoZGF0YS50b0pTT04pIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS50b0pTT04oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX2NyZWF0ZUNvbGxlY3Rpb24oZGF0YSk7XG5cbiAgICAgICAgICAgIHZhciBjb3VudCA9IDAsIHRvdGFsQXR0ZW1wdHMgPSBkYXRhLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRhdGEuZWFjaChmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICBpZihtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudElkID0gdGhpcy5nZXRQYXJlbnRJZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5maW5kTm9kZUJ5SWQocGFyZW50SWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihfLmlzTnVsbChwYXJlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnJlbW92ZSh0aGlzLmFwcGVuZE5vZGUobW9kZWwpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhcmVudCA9IHRoaXMuZmluZE5vZGVCeUlkKHBhcmVudElkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucmVtb3ZlKHRoaXMuYXBwZW5kTm9kZShtb2RlbCwgcGFyZW50KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgICAgIGlmKGNvdW50ID4gdG90YWxBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSB0cmVlIGNvdWxkIG5vdCBiZSBnZW5lcmF0ZWQuIEluZmluaXRlIGxvb3AgZGV0ZWN0ZWQgd2l0aCB0aGUgcmVtYWluaW5nIG1vZGVsczogXCInK2RhdGEucGx1Y2soJ2lkJykrJ1wiJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRPcHRpb246IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIGlmKCFfLmlzVW5kZWZpbmVkKHRoaXMub3B0aW9uc1tuYW1lXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW25hbWVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRQYXJlbnRJZDogZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgIGlmKCFtb2RlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnRBdHRyaWJ1dGUnKSkgfHwgbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJZDogZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2lkQXR0cmlidXRlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlb3JkZXI6IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uIHx8IHRoaXM7XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCwgaSkge1xuICAgICAgICAgICAgICAgIG1vZGVsLnNldCgnb3JkZXInLCBpICsgMSk7XG5cbiAgICAgICAgICAgICAgICBpZihtb2RlbC5jaGlsZHJlbiAmJiBtb2RlbC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW9yZGVyKG1vZGVsLmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmROb2RlczogZnVuY3Rpb24oY2hpbGRyZW4sIHBhcmVudCkge1xuICAgICAgICAgICAgXy5lYWNoKGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kTm9kZShjaGlsZCwgcGFyZW50KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZE5vZGU6IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgICAgICAgICBjaGlsZC5jaGlsZHJlbiB8fCAoY2hpbGQuY2hpbGRyZW4gPSB0aGlzLl9jcmVhdGVDb2xsZWN0aW9uKCkpO1xuXG4gICAgICAgICAgICBpZihwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5zZXQodGhpcy5nZXRPcHRpb24oJ3BhcmVudEF0dHJpYnV0ZScpLCBwYXJlbnQuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdpZEF0dHJpYnV0ZScpKSk7XG4gICAgICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuLmFkZChjaGlsZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5zZXQodGhpcy5nZXRPcHRpb24oJ3BhcmVudEF0dHJpYnV0ZScpLCBudWxsKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZChjaGlsZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmROb2RlQmVmb3JlOiBmdW5jdGlvbihjaGlsZCwgc2libGluZykge1xuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gdGhpcy5nZXRQYXJlbnRJZChzaWJsaW5nKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSBwYXJlbnRJZCA/IHRoaXMuZmluZCh7aWQ6IHBhcmVudElkfSkgOiBudWxsO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gcGFyZW50ID8gcGFyZW50LmNoaWxkcmVuLmluZGV4T2Yoc2libGluZykgOiB0aGlzLmluZGV4T2Yoc2libGluZyk7XG5cbiAgICAgICAgICAgIHRoaXMuYXBwZW5kTm9kZShjaGlsZCwgcGFyZW50LCB7XG4gICAgICAgICAgICAgICAgYXQ6IGluZGV4XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZE5vZGVBZnRlcjogZnVuY3Rpb24oY2hpbGQsIHNpYmxpbmcpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHRoaXMuZ2V0UGFyZW50SWQoc2libGluZyk7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5maW5kKHtpZDogcGFyZW50SWR9KTtcblxuICAgICAgICAgICAgaWYocGFyZW50SWQgJiYgcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmROb2RlKGNoaWxkLCBwYXJlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgYXQ6IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHNpYmxpbmcpICsgMVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmROb2RlKGNoaWxkLCBudWxsLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0OiB0aGlzLmluZGV4T2Yoc2libGluZykgKyAxXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVOb2RlOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB0aGlzLmdldFBhcmVudElkKG5vZGUpO1xuXG4gICAgICAgICAgICBpZihwYXJlbnRJZCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmZpbmQoe2lkOiBwYXJlbnRJZH0pO1xuXG4gICAgICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuLnJlbW92ZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpbHRlcjogZnVuY3Rpb24oaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbHRlcihjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gXy5maWx0ZXIoY29sbGVjdGlvbi5tb2RlbHMsIGl0ZXJhdGVlLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIGlmKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gY29sbGVjdGlvbi5tb2RlbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gY29sbGVjdGlvbi5tb2RlbHNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYobW9kZWwuY2hpbGRyZW4gJiYgbW9kZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBmaWx0ZXIobW9kZWwuY2hpbGRyZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcih0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kOiBmdW5jdGlvbihpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZmluZChjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gXy5maW5kKGNvbGxlY3Rpb24ubW9kZWxzLCBpdGVyYXRlZSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBpZihtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGNvbGxlY3Rpb24ubW9kZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3cgPSBjb2xsZWN0aW9uLm1vZGVsc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICBpZihyb3cuY2hpbGRyZW4gJiYgcm93LmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gZmluZChyb3cuY2hpbGRyZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmluZCh0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICB3aGVyZTogZnVuY3Rpb24oYXR0cmlidXRlcywgY29udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZC5jYWxsKHRoaXMsIGF0dHJpYnV0ZXMsIGNvbnRleHQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmRQYXJlbnROb2RlOiBmdW5jdGlvbihjaGlsZCwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZE5vZGVCeUlkKHRoaXMuZ2V0UGFyZW50SWQoY2hpbGQpLCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kTm9kZTogZnVuY3Rpb24oY2hpbGQsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmROb2RlQnlJZCh0aGlzLmdldElkKGNoaWxkKSwgY29sbGVjdGlvbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZE5vZGVCeUlkOiBmdW5jdGlvbihpZCwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgY29sbGVjdGlvbiB8fCAoY29sbGVjdGlvbiA9IHRoaXMpO1xuICAgICAgICAgICAgdmFyIG1vZGVscyA9IGNvbGxlY3Rpb24udG9BcnJheSgpO1xuXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gbW9kZWxzKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gbW9kZWxzW2ldO1xuXG4gICAgICAgICAgICAgICAgaWYoaWQgPT0gdGhpcy5nZXRJZChtb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKG1vZGVsLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5maW5kTm9kZUJ5SWQoaWQsIG1vZGVsLmNoaWxkcmVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZighXy5pc051bGwobm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0pTT046IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gcGFyc2UoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBbXTtcblxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBtb2RlbC50b0pTT04oKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihtb2RlbC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuY2hpbGRyZW4gPSBwYXJzZShtb2RlbC5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByb3cucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcm93O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFyc2UodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMudG9KU09OKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jcmVhdGVDb2xsZWN0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgQ29sbGVjdGlvbiA9IHRoaXMuZ2V0T3B0aW9uKCdjb2xsZWN0aW9uQ2xhc3MnKSB8fCBCYWNrYm9uZS5Db2xsZWN0aW9uO1xuXG4gICAgICAgICAgICBkYXRhID0gbmV3IENvbGxlY3Rpb24oZGF0YSB8fCBbXSk7XG5cbiAgICAgICAgICAgIGRhdGEuY29tcGFyYXRvciA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignY29tcGFyYXRvcicpKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5jb21wYXJhdG9yID0gdGhpcy5nZXRPcHRpb24oJ2NvbXBhcmF0b3InKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZScsICdiYWNrYm9uZS5yYWRpbycsICdiYWNrYm9uZS5tYXJpb25ldHRlJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLnJhZGlvJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSwgcm9vdC5CYWNrYm9uZS5SYWRpbywgcm9vdC5NYXJpb25ldHRlKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guSXRlbVZpZXcgPSBNYXJpb25ldHRlLkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFyaW9uZXR0ZS5JdGVtVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBUb29sYm94Lk9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbE5hbWUnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsTmFtZScpIHx8ICdnbG9iYWwnO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gXy5yZXN1bHQodGhpcywgJ2NoYW5uZWwnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsJykgfHwgUmFkaW8uY2hhbm5lbCh0aGlzLmNoYW5uZWxOYW1lKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJywgJ2JhY2tib25lLnJhZGlvJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSwgcmVxdWlyZSgnYmFja2JvbmUucmFkaW8nKSwgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lLCByb290LkJhY2tib25lLlJhZGlvLCByb290Lk1hcmlvbmV0dGUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5MYXlvdXRWaWV3ID0gTWFyaW9uZXR0ZS5MYXlvdXRWaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTWFyaW9uZXR0ZS5MYXlvdXRWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFRvb2xib3guT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsTmFtZSA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsTmFtZScpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWxOYW1lJykgfHwgJ2dsb2JhbCc7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbCcpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWwnKSB8fCBSYWRpby5jaGFubmVsKHRoaXMuY2hhbm5lbE5hbWUpO1xuICAgICAgICB9XG5cblx0fSk7XG5cblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUucmFkaW8nLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSwgUmFkaW8sIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5yYWRpbycpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuQmFja2JvbmUuUmFkaW8sIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkNvbXBvc2l0ZVZpZXcgPSBNYXJpb25ldHRlLkNvbXBvc2l0ZVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIE1hcmlvbmV0dGUuQ29tcG9zaXRlVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBUb29sYm94Lk9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbE5hbWUnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsTmFtZScpIHx8ICdnbG9iYWwnO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gXy5yZXN1bHQodGhpcywgJ2NoYW5uZWwnKSB8fCBfLnJlc3VsdCh0aGlzLm9wdGlvbnMsICdjaGFubmVsJykgfHwgUmFkaW8uY2hhbm5lbCh0aGlzLmNoYW5uZWxOYW1lKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJywgJ2JhY2tib25lLnJhZGlvJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnXSwgZnVuY3Rpb24oXywgQmFja2JvbmUsIFJhZGlvLCBNYXJpb25ldHRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSwgcmVxdWlyZSgnYmFja2JvbmUucmFkaW8nKSwgcmVxdWlyZSgnYmFja2JvbmUubWFyaW9uZXR0ZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lLCByb290LkJhY2tib25lLlJhZGlvLCByb290Lk1hcmlvbmV0dGUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lLCBSYWRpbywgTWFyaW9uZXR0ZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5Db2xsZWN0aW9uVmlldyA9IE1hcmlvbmV0dGUuQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBNYXJpb25ldHRlLkNvbGxlY3Rpb25WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFRvb2xib3guT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsTmFtZSA9IF8ucmVzdWx0KHRoaXMsICdjaGFubmVsTmFtZScpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWxOYW1lJykgfHwgJ2dsb2JhbCc7XG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwgPSBfLnJlc3VsdCh0aGlzLCAnY2hhbm5lbCcpIHx8IF8ucmVzdWx0KHRoaXMub3B0aW9ucywgJ2NoYW5uZWwnKSB8fCBSYWRpby5jaGFubmVsKHRoaXMuY2hhbm5lbE5hbWUpO1xuICAgICAgICB9XG5cblx0fSk7XG5cblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5CYXNlRmllbGQgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgZm9ybU1vZGVsOiBmYWxzZSxcblxuICAgICAgICBjbGFzc05hbWU6ICdmb3JtLWdyb3VwJyxcblxuICAgICAgICBkZWZhdWx0VHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdmb2N1cyB7e3RyaWdnZXJTZWxlY3Rvcn19Jzoge1xuICAgICAgICAgICAgICAgIGV2ZW50OiAnZm9jdXMnLFxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdibHVyIHt7dHJpZ2dlclNlbGVjdG9yfX0nOiB7XG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdibHVyJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY2xpY2sge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAna2V5dXAge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTp1cCcsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2tleWRvd24ge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTpkb3duJyxcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAna2V5cHJlc3Mge3t0cmlnZ2VyU2VsZWN0b3J9fSc6IHtcbiAgICAgICAgICAgICAgICBldmVudDogJ2tleTpwcmVzcycsXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHt9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBpZDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBuYW1lOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbENsYXNzTmFtZTogJ2NvbnRyb2wtbGFiZWwnLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb25DbGFzc05hbWU6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJUYWdOYW1lOiAnaDQnLFxuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAnaW5wdXQnLFxuICAgICAgICAgICAgdXBkYXRlTW9kZWw6IHRydWVcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guSXRlbVZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VycyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmdldERlZmF1bHRUcmlnZ2VycygpLCB0aGlzLnRyaWdnZXJzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREZWZhdWx0VHJpZ2dlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBkZWZhdWx0VHJpZ2dlcnMgPSB7fTtcblxuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZGVmYXVsdFRyaWdnZXJzLCBmdW5jdGlvbih0cmlnZ2VyLCBrZXkpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2godC5vcHRpb25zLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5ID0ga2V5LnJlcGxhY2UoJ3t7JytuYW1lKyd9fScsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRyaWdnZXJzW2tleS50cmltKCldID0gdHJpZ2dlcjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFRyaWdnZXJzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkuYmx1cigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLmZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRJbnB1dFZhbHVlKHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2F2ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmdldElucHV0VmFsdWUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCd1cGRhdGVNb2RlbCcpID09PSB0cnVlICYmIHRoaXMubW9kZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldCh0aGlzLmdldE9wdGlvbignbmFtZScpLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgIHJldHVybiB0aGlzLmdldElucHV0RmllbGQoKS52YWwoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCdpbnB1dCcpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJywgJ2JhY2tib25lJywgJ2JhY2tib25lLm1hcmlvbmV0dGUnXSwgZnVuY3Rpb24oJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lJyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8sIHJvb3QuQmFja2JvbmUsIHJvb3QuTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQmxvY2tGb3JtRXJyb3IgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tZXJyb3InKSxcblxuICAgICAgICB0YWdOYW1lOiAnc3BhbicsXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnaGVscC1ibG9jaycsXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGlucHV0IGZpZWxkIG5hbWVcbiAgICAgICAgICAgIGZpZWxkOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBUaGUgaW5wdXQgZmllbGQgZXJyb3JzXG4gICAgICAgICAgICBlcnJvcnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgSWYgdHJ1ZSBlcnJvcnMgd2lsbCBoYXZlIDxicj4gdGFncyB0byBicmVhayBlcnJvciBpbnRvIG5ld2xpbmVzXG4gICAgICAgICAgICBuZXdsaW5lOiB0cnVlXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmKCFfLmlzQXJyYXkob3B0aW9ucy5lcnJvcnMpKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcnMgPSBbb3B0aW9ucy5lcnJvcnNdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBUb29sYm94LklubGluZUZvcm1FcnJvciA9IFRvb2xib3guQmxvY2tGb3JtRXJyb3IuZXh0ZW5kKHtcblxuICAgICAgICBjbGFzc05hbWU6ICdoZWxwLWlubGluZSdcblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5CYXNlRm9ybSA9IFRvb2xib3guTGF5b3V0Vmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRhZ05hbWU6ICdmb3JtJyxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ3N1Ym1pdCc6ICdzdWJtaXQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNTdWJtaXR0aW5nOiBmYWxzZSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBBbiBvYmplY3Qgb2YgYWN0aXZpdHkgaW5kaWNhdG9yIG9wdGlvbnNcbiAgICAgICAgICAgIGFjdGl2aXR5SW5kaWNhdG9yT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3NtYWxsJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGVycm9yIHZpZXcgb2JqZWN0XG4gICAgICAgICAgICBlcnJvclZpZXc6IFRvb2xib3guQmxvY2tGb3JtRXJyb3IsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBlcnJvciB2aWV3IG9wdGlvbnMgb2JqZWN0XG4gICAgICAgICAgICBlcnJvclZpZXdPcHRpb25zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGdsb2JhbCBlcnJvciB2aWV3IG9iamVjdFxuICAgICAgICAgICAgZ2xvYmFsRXJyb3JzVmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBnbG9iYWwgZXJyb3IgdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgZ2xvYmFsRXJyb3JzT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIHNob3dFbXB0eU1lc3NhZ2U6IGZhbHNlXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgU2hvdyBnbG9iYWwgZXJyb3JzIGFmdGVyIGZvcm0gc3VibWl0c1xuICAgICAgICAgICAgc2hvd0dsb2JhbEVycm9yczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBTaG93IG5vdGlmaWNhdGlvbnMgYWZ0ZXIgZm9ybSBzdWJtaXRzXG4gICAgICAgICAgICBzaG93Tm90aWZpY2F0aW9uczogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIG5vdGlmaWNhdGlvbiB2aWV3IG9iamVjdFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uVmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBub3RpZmljYXRpb24gdmlldyBvcHRpb25zIG9iamVjdFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uVmlld09wdGlvbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgZm9ybSBncm91cCBjbGFzcyBuYW1lXG4gICAgICAgICAgICBmb3JtR3JvdXBDbGFzc05hbWU6ICdmb3JtLWdyb3VwJyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGhhcyBlcnJvciBjbGFzcyBuYW1lXG4gICAgICAgICAgICBoYXNFcnJvckNsYXNzTmFtZTogJ2hhcy1lcnJvcicsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBBZGQgdGhlIGhhcyBlcnJvciBjbGFzc2VzIHRvIGZpZWxkc1xuICAgICAgICAgICAgYWRkSGFzRXJyb3JDbGFzczogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKGJvb2wpIEFkZCB0aGUgaW5saW5lIGZvcm0gZXJyb3JzXG4gICAgICAgICAgICBzaG93SW5saW5lRXJyb3JzOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgcmVkaXJlY3QgdXJsLiBGYWxzZSBpZiBubyByZWRpcmVjdFxuICAgICAgICAgICAgcmVkaXJlY3Q6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgc3VjY2VzcyBtZXNzYWdlIG9iamVjdFxuICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZGVmYXVsdCBzdWNjZXNzIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBkZWZhdWx0U3VjY2Vzc01lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtY2hlY2snLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1N1Y2Nlc3MhJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGZvcm0gd2FzIHN1Y2Nlc3NmdWxseSBzdWJtaXR0ZWQuJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGVycnByIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgZGVmYXVsdCBzdWNjZXNzIG1lc3NhZ2Ugb2JqZWN0XG4gICAgICAgICAgICBkZWZhdWx0RXJyb3JNZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgaWNvbjogJ2ZhIGZhLXdhcm5pbmcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdhbGVydCcsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdFcnJvciEnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgZm9ybSBjb3VsZCBub3QgYmUgc3VibWl0dGVkLidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfc2VyaWFsaXplZEZvcm06IGZhbHNlLFxuXG4gICAgICAgIF9lcnJvclZpZXdzOiBmYWxzZSxcblxuICAgICAgICBnZXRGb3JtRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZm9ybURhdGEgPSB7fTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaXNBcnJheShrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5ICYmIGtleS5tYXRjaCgvXFxbKFxcZCspP1xcXS8pID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmVhY2godGhpcy4kZWwuc2VyaWFsaXplQXJyYXkoKSwgZnVuY3Rpb24oZmllbGQsIHgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViamVjdCA9IGZvcm1EYXRhLCBsYXN0S2V5LCBtYXRjaGVzID0gZmllbGQubmFtZS5tYXRjaCgvXlxcdyt8XFxbKFxcdyspP1xcXS9nKTtcblxuICAgICAgICAgICAgICAgIF8uZWFjaChtYXRjaGVzLCBmdW5jdGlvbihtYXRjaCwgaSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbWF0Y2gucmVwbGFjZSgvW1xcW1xcXV0vZywgJycpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dEtleSA9IG1hdGNoZXNbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNMYXN0TWF0Y2ggPSBtYXRjaGVzLmxlbmd0aCAtIDEgPT0gaTtcblxuICAgICAgICAgICAgICAgICAgICBpZihpc0FycmF5KG1hdGNoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3QucHVzaChmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0LnNwbGljZShrZXksIDAsIGZpZWxkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFzdWJqZWN0W2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0W2tleV0gPSBuZXh0S2V5ICYmIGlzQXJyYXkobmV4dEtleSkgPyBbXSA6IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc0xhc3RNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3Rba2V5XSA9IGZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0ID0gc3ViamVjdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFzdEtleSA9IGtleTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZm9ybURhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0FjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGluZGljYXRvciA9IHRoaXMuJGVsLmZpbmQoJy5mb3JtLWluZGljYXRvcicpO1xuXG4gICAgICAgICAgICBpZih0aGlzLiRpbmRpY2F0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kaW5kaWNhdG9yID0gJCgnPGRpdiBjbGFzcz1cImZvcm0taW5kaWNhdG9yXCI+PC9kaXY+Jyk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLiRlbC5maW5kKCdmb290ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnZm9vdGVyJykuYXBwZW5kKHRoaXMuJGluZGljYXRvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy4kaW5kaWNhdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yID0gbmV3IEJhY2tib25lLk1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kaW5kaWNhdG9yLmdldCgwKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBpbmRpY2F0b3IgPSBuZXcgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvcih0aGlzLmdldE9wdGlvbignYWN0aXZpdHlJbmRpY2F0b3JPcHRpb25zJykpO1xuXG4gICAgICAgICAgICB0aGlzLmluZGljYXRvci5zaG93KGluZGljYXRvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuJGVycm9ycykge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0aGlzLiRlcnJvcnMsIGZ1bmN0aW9uKCRlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAkZXJyb3IucGFyZW50cygnLicrdGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2hhc0Vycm9yQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmdldEZvcm1EYXRhKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0Zvcm1DaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9zZXJpYWxpemVkRm9ybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlcmlhbGl6ZWRGb3JtICE9PSB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUdsb2JhbEVycm9yc1JlZ2lvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdnbG9iYWxFcnJvcnNWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guVW5vcmRlcmVkTGlzdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kZ2xvYmFsRXJyb3JzID0gJCgnPGRpdiBjbGFzcz1cImdsb2JhbC1lcnJvcnNcIj48L2Rpdj4nKTtcblxuICAgICAgICAgICAgdGhpcy5hcHBlbmRHbG9iYWxFcnJvclJlZ2lvblRvRG9tKHRoaXMuJGdsb2JhbEVycm9ycyk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsRXJyb3JzID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kZ2xvYmFsRXJyb3JzLmdldCgwKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBlcnJvcnNWaWV3ID0gbmV3IFZpZXcoXy5leHRlbmQodGhpcy5nZXRPcHRpb24oJ2dsb2JhbEVycm9yc09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICB0aGlzLmdsb2JhbEVycm9ycy5zaG93KGVycm9yc1ZpZXcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZEdsb2JhbEVycm9yUmVnaW9uVG9Eb206IGZ1bmN0aW9uKCRnbG9iYWxFcnJvcnMpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnByZXBlbmQoJGdsb2JhbEVycm9ycyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uOiBmdW5jdGlvbihub3RpY2UpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ25vdGlmaWNhdGlvblZpZXcnKTtcblxuICAgICAgICAgICAgaWYoIVZpZXcpIHtcbiAgICAgICAgICAgICAgICBWaWV3ID0gVG9vbGJveC5Ob3RpZmljYXRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHR5cGU6IG5vdGljZS50eXBlID8gbm90aWNlLnR5cGUgOiAnYWxlcnQnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBub3RpY2UudGl0bGUgPyBub3RpY2UudGl0bGUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSA/IG5vdGljZS5tZXNzYWdlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaWNvbjogbm90aWNlLmljb24gPyBub3RpY2UuaWNvbiA6IGZhbHNlXG4gICAgICAgICAgICB9LCB0aGlzLmdldE9wdGlvbignbm90aWZpY2F0aW9uVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVFcnJvcjogZnVuY3Rpb24oZmllbGQsIGVycm9yKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXcnKTtcblxuICAgICAgICAgICAgdmFyIG1vZGVsID0gbmV3IEJhY2tib25lLk1vZGVsKCk7XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe30sIHRoaXMuZ2V0T3B0aW9uKCdlcnJvclZpZXdPcHRpb25zJyksIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICAgICAgZXJyb3JzOiBlcnJvclxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkUGFyZW50OiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWVsZChmaWVsZCkucGFyZW50cygnLicgKyB0aGlzLmdldE9wdGlvbignZm9ybUdyb3VwQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICBmaWVsZCA9IGZpZWxkLnJlcGxhY2UoJy4nLCAnXycpO1xuXG4gICAgICAgICAgICB2YXIgJGZpZWxkID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInK2ZpZWxkKydcIl0nKTtcblxuICAgICAgICAgICAgaWYoJGZpZWxkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkZmllbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnIycrZmllbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldElucHV0RmllbGQ6IGZ1bmN0aW9uKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKGZpZWxkKS52YWwodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZEhhc0Vycm9yQ2xhc3NUb0ZpZWxkOiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGRQYXJlbnQoZmllbGQpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVIYXNFcnJvckNsYXNzRnJvbUZpZWxkOiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGRQYXJlbnQoZmllbGQpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVHbG9iYWxFcnJvcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nbG9iYWxFcnJvcnMgJiYgdGhpcy5nbG9iYWxFcnJvcnMuY3VycmVudFZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbEVycm9ycy5jdXJyZW50Vmlldy5jb2xsZWN0aW9uLnJlc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9jdXNPbkZpcnN0RXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gJ2Rpdi4nK3RoaXMuZ2V0T3B0aW9uKCdoYXNFcnJvckNsYXNzTmFtZScpKyc6Zmlyc3QnO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5maW5kKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpXG4gICAgICAgICAgICAgICAgLmZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kRXJyb3JWaWV3VG9HbG9iYWw6IGZ1bmN0aW9uKGVycm9yVmlldykge1xuICAgICAgICAgICAgdGhpcy5nbG9iYWxFcnJvcnMuY3VycmVudFZpZXcuY29sbGVjdGlvbi5hZGQoe1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGVycm9yVmlldy5nZXRPcHRpb24oJ2Vycm9ycycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmRFcnJvclZpZXdUb0ZpZWxkOiBmdW5jdGlvbihlcnJvclZpZXcpIHtcbiAgICAgICAgICAgIGVycm9yVmlldy5yZW5kZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkUGFyZW50KGVycm9yVmlldy5nZXRPcHRpb24oJ2ZpZWxkJykpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChlcnJvclZpZXcuJGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93R2xvYmFsRXJyb3JzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdsb2JhbEVycm9ycygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihfLmlzQXJyYXkodGhpcy5fZXJyb3JWaWV3cykpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2godGhpcy5fZXJyb3JWaWV3cywgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWRkSGFzRXJyb3JDbGFzcycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUhhc0Vycm9yQ2xhc3NGcm9tRmllbGQodmlldy5nZXRPcHRpb24oJ2ZpZWxkJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmxpbmVFcnJvcnMnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlldy4kZWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93RXJyb3I6IGZ1bmN0aW9uKGZpZWxkLCBlcnJvcikge1xuICAgICAgICAgICAgaWYoIXRoaXMuX2Vycm9yVmlld3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lcnJvclZpZXdzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlcnJvclZpZXcgPSB0aGlzLmNyZWF0ZUVycm9yKGZpZWxkLCBlcnJvcik7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93R2xvYmFsRXJyb3JzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZEVycm9yVmlld1RvR2xvYmFsKGVycm9yVmlldyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhZGRIYXNFcnJvckNsYXNzJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEhhc0Vycm9yQ2xhc3NUb0ZpZWxkKGZpZWxkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmxpbmVFcnJvcnMnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kRXJyb3JWaWV3VG9GaWVsZChlcnJvclZpZXcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9lcnJvclZpZXdzLnB1c2goZXJyb3JWaWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93RXJyb3JzOiBmdW5jdGlvbihlcnJvcnMpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgXy5lYWNoKGVycm9ycywgZnVuY3Rpb24oZXJyb3IsIGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgdC5zaG93RXJyb3IoZmllbGQsIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzT25GaXJzdEVycm9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZUFjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuaW5kaWNhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IuZW1wdHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFcnJvcnNGcm9tUmVzcG9uc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucmVzcG9uc2VKU09OLmVycm9ycztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZWRpcmVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3JlZGlyZWN0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVkaXJlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gdGhpcy5nZXRSZWRpcmVjdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTdWNjZXNzTm90aWZpY2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSB0aGlzLmNyZWF0ZU5vdGlmaWNhdGlvbihfLmV4dGVuZChcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZGVmYXVsdFN1Y2Nlc3NNZXNzYWdlJyksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3N1Y2Nlc3NNZXNzYWdlJylcbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICBub3RpZmljYXRpb24uc2hvdygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dFcnJvck5vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gdGhpcy5jcmVhdGVOb3RpZmljYXRpb24oXy5leHRlbmQoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ2RlZmF1bHRFcnJvck1lc3NhZ2UnKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignZXJyb3JNZXNzYWdlJylcbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICBub3RpZmljYXRpb24uc2hvdygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlcmlhbGl6ZWRGb3JtID0gdGhpcy5zZXJpYWxpemUoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3Nob3dHbG9iYWxFcnJvcnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlR2xvYmFsRXJyb3JzUmVnaW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRTdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuaGFzRm9ybUNoYW5nZWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZm9ybTpjaGFuZ2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2VyaWFsaXplZEZvcm0gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd05vdGlmaWNhdGlvbnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1N1Y2Nlc3NOb3RpZmljYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3JlZGlyZWN0JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZGlyZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRDb21wbGV0ZTogZnVuY3Rpb24oc3RhdHVzLCBtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTdWJtaXR0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmhpZGVFcnJvcnMoKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZUFjdGl2aXR5SW5kaWNhdG9yKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdWJtaXRFcnJvcjogZnVuY3Rpb24obW9kZWwsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc2hvd05vdGlmaWNhdGlvbnMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yTm90aWZpY2F0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9ycyh0aGlzLmdldEVycm9yc0Zyb21SZXNwb25zZShyZXNwb25zZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYoIXRoaXMuaXNTdWJtaXR0aW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1N1Ym1pdHRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FjdGl2aXR5SW5kaWNhdG9yKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmUodGhpcy5nZXRGb3JtRGF0YSgpLCB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzdWJtaXQ6Y29tcGxldGUnLCB0cnVlLCBtb2RlbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzdWJtaXQ6c3VjY2VzcycsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc3VibWl0OmNvbXBsZXRlJywgZmFsc2UsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3N1Ym1pdDplcnJvcicsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydiYWNrYm9uZSddLCBmdW5jdGlvbihCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2JhY2tib25lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm9Vbm9yZGVyZWRMaXN0SXRlbSA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCduby11bm9yZGVyZWQtbGlzdC1pdGVtJyksXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdG1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJ1xuXHRcdH0sXG5cblx0XHR0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9ucztcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5Vbm9yZGVyZWRMaXN0SXRlbSA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdGNsYXNzTmFtZTogJ3Vub3JkZXJlZC1saXN0LWl0ZW0nLFxuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24oZSwgb2JqKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2snLCBvYmopO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHR0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uc1xuXHRcdH0sXG5cbiAgICAgICAgZ2V0VGVtcGxhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuZ2V0T3B0aW9uKCd0ZW1wbGF0ZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvb2xib3guVGVtcGxhdGUoJ3Vub3JkZXJlZC1saXN0LWl0ZW0nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCd0ZW1wbGF0ZScpO1xuICAgICAgICB9XG5cblx0fSk7XG5cblx0VG9vbGJveC5Vbm9yZGVyZWRMaXN0ID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94LlVub3JkZXJlZExpc3RJdGVtLFxuXG5cdFx0Y2xhc3NOYW1lOiAndW5vcmRlcmVkLWxpc3QnLFxuXG5cdFx0dGFnTmFtZTogJ3VsJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAob2JqZWN0KSBUaGUgdmlldyBvYmplY3QgdG8gdXNlIGZvciB0aGUgZW1wdHkgbWVzc2FnZVxuXHRcdFx0ZW1wdHlNZXNzYWdlVmlldzogVG9vbGJveC5Ob1Vub3JkZXJlZExpc3RJdGVtLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZXJlIGFyZSBubyBsaXN0IGl0ZW1zXG5cdFx0XHRlbXB0eU1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJyxcblxuXHRcdFx0Ly8gKGJvb2wpIFNob3cgdGhlIGVtcHR5IG1lc3NhZ2Ugdmlld1xuXHRcdFx0c2hvd0VtcHR5TWVzc2FnZTogdHJ1ZVxuXHRcdH0sXG5cblx0XHRjaGlsZEV2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2l0ZW06Y2xpY2snLCB2aWV3KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRUb29sYm94LkNvbGxlY3Rpb25WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cblx0XHRcdGlmKCF0aGlzLmNvbGxlY3Rpb24pIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKTtcblx0XHRcdH1cblx0XHR9LFxuXG4gICAgICAgIGdldEVtcHR5VmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0aWYodGhpcy5nZXRPcHRpb24oJ3Nob3dFbXB0eU1lc3NhZ2UnKSkge1xuXHQgICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2VWaWV3Jyk7XG5cblx0ICAgICAgICAgICAgVmlldyA9IFZpZXcuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcblx0ICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmdldE9wdGlvbignZW1wdHlNZXNzYWdlJylcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIFZpZXc7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydiYWNrYm9uZSddLCBmdW5jdGlvbihCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Ll8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guRHJvcGRvd25NZW51Tm9JdGVtcyA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZHJvcGRvd24tbWVudS1uby1pdGVtcycpLFxuXG5cdFx0Y2xhc3NOYW1lOiAnbm8tcmVzdWx0cydcblxuXHR9KTtcblxuXHRUb29sYm94LkRyb3Bkb3duTWVudUl0ZW0gPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Ryb3Bkb3duLW1lbnUtaXRlbScpLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdGRpdmlkZXJDbGFzc05hbWU6ICdkaXZpZGVyJ1xuXHRcdH0sXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrJzoge1xuXHRcdFx0XHRldmVudDogJ2NsaWNrJyxcblx0XHRcdFx0cHJldmVudERlZmF1bHQ6IGZhbHNlLFxuXHRcdFx0XHRzdG9wUHJvcGFnYXRpb246IGZhbHNlXG5cdFx0ICAgIH1cblx0XHR9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIGEnOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmKF8uaXNGdW5jdGlvbih0aGlzLm1vZGVsLmdldCgnb25DbGljaycpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmdldCgnb25DbGljaycpLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKCF0aGlzLm1vZGVsLmdldCgnaHJlZicpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdkaXZpZGVyJykgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RpdmlkZXJDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guRHJvcGRvd25NZW51ID0gVG9vbGJveC5Db21wb3NpdGVWaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXdDb250YWluZXI6ICd1bCcsXG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guRHJvcGRvd25NZW51SXRlbSxcblxuXHRcdGVtcHR5VmlldzogVG9vbGJveC5Ecm9wZG93bk1lbnVOb0l0ZW1zLFxuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Ryb3Bkb3duLW1lbnUnKSxcblxuXHRcdGNsYXNzTmFtZTogJ2Ryb3Bkb3duJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRjaGlsZEV2ZW50czoge1xuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignY2xvc2VPbkNsaWNrJykgPT09IHRydWUpIHtcblx0XHRcdFx0XHR0aGlzLmhpZGVNZW51KClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHR0cmlnZ2Vyczoge1xuXHRcdFx0J2NsaWNrIC5kcm9wZG93bi10b2dnbGUnOiAndG9nZ2xlOmNsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBbiBhcnJheSBvZiBtZW51IGl0ZW1zIHRvIGJlIGNvbnZlcnRlZCB0byBhIGNvbGxlY3Rpb24uXG4gICAgICAgICAgICBpdGVtczogW10sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgdGV4dFxuXHRcdFx0dG9nZ2xlTGFiZWw6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gdG9nZ2xlIGNsYXNzIG5hbWVcblx0XHRcdHRvZ2dsZUNsYXNzTmFtZTogJ2Ryb3Bkb3duLXRvZ2dsZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgaWNvbiBjbGFzcyBuYW1lXG5cdFx0XHR0b2dnbGVJY29uQ2xhc3NOYW1lOiAnZmEgZmEtY2FyZXQtZG93bicsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biBtZW51IGNsYXNzIG5hbWVcblx0XHRcdG1lbnVDbGFzc05hbWU6ICdkcm9wZG93bi1tZW51JyxcblxuXHRcdFx0Ly8gKGludHxib29sKSBUaGUgY29sbGVjdGlvbiBsaW1pdFxuXHRcdFx0bGltaXQ6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgb3JkZXIgb2YgdGhlIGNvbGxlY3Rpb24gaXRlbXNcblx0XHRcdG9yZGVyOiAnbmFtZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIEVpdGhlciBhc2Mgb3IgZGVzY1xuXHRcdFx0c29ydDogJ2FzYycsXG5cblx0XHRcdC8vIChib29sKSBDbG9zZSB0aGUgbWVudSBhZnRlciBhbiBpdGVtIGhhcyBiZWVuIGNsaWNrZWRcblx0XHRcdGNsb3NlT25DbGljazogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIEZldGNoIHRoZSBjb2xsZWN0aW9uIHdoZW4gdGhlIGRyb3Bkb3duIG1lbnUgaXMgc2hvd25cblx0XHRcdGZldGNoT25TaG93OiBmYWxzZSxcblxuXHRcdFx0Ly8gKGJvb2wpIFNob3cgYW4gYWN0aXZpdHkgaW5kaWNhdG9yIHdoZW4gZmV0Y2hpbmcgdGhlIGNvbGxlY3Rpb25cblx0XHRcdHNob3dJbmRpY2F0b3I6IHRydWUsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgY2xhc3MgbmFtZVxuXHRcdFx0dG9nZ2xlQ2xhc3NOYW1lOiAnb3Blbidcblx0XHR9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRUb29sYm94LkNvbXBvc2l0ZVZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0dGhpcy5vbignZmV0Y2gnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3Nob3dJbmRpY2F0b3InKSkge1xuXHRcdFx0XHRcdHRoaXMuc2hvd0luZGljYXRvcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5vbignZmV0Y2g6c3VjY2VzcyBmZXRjaDplcnJvcicsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZih0aGlzLmdldE9wdGlvbignc2hvd0luZGljYXRvcicpKSB7XG5cdFx0XHRcdFx0dGhpcy5oaWRlSW5kaWNhdG9yKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG4gICAgICAgICAgICBpZighdGhpcy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24odGhpcy5nZXRPcHRpb24oJ2l0ZW1zJykpO1xuICAgICAgICAgICAgfVxuXHRcdH0sXG5cblx0XHRzaG93SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBBY3Rpdml0eVZpZXdJdGVtID0gVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5leHRlbmQoe1xuXHRcdFx0XHR0YWdOYW1lOiAnbGknLFxuXHRcdFx0XHRjbGFzc05hbWU6ICdhY3Rpdml0eS1pbmRpY2F0b3ItaXRlbScsXG5cdFx0XHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0XHRcdHRoaXMub3B0aW9ucy5pbmRpY2F0b3IgPSAnc21hbGwnO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5hZGRDaGlsZChuZXcgQmFja2JvbmUuTW9kZWwoKSwgQWN0aXZpdHlWaWV3SXRlbSk7XG5cdFx0fSxcblxuXHRcdGhpZGVJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHZpZXcgPSB0aGlzLmNoaWxkcmVuLmZpbmRCeUluZGV4KDApO1xuXG5cdFx0XHRpZih2aWV3ICYmIHZpZXcgaW5zdGFuY2VvZiBUb29sYm94LkFjdGl2aXR5SW5kaWNhdG9yKSB7XG5cdFx0XHRcdHRoaXMuY2hpbGRyZW4ucmVtb3ZlKHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoMCkpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzaG93TWVudTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuXHRcdH0sXG5cblx0XHRoaWRlTWVudTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblx0XHR9LFxuXG5cdFx0aXNNZW51VmlzaWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKS5wYXJlbnQoKS5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpO1xuXHRcdH0sXG5cblx0XHRvblRvZ2dsZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKCF0aGlzLmlzTWVudVZpc2libGUoKSkge1xuXHRcdFx0XHR0aGlzLnNob3dNZW51KCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy5oaWRlTWVudSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvblNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHQgPSB0aGlzO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbignZmV0Y2hPblNob3cnKSkge1xuXHRcdFx0XHR0aGlzLmZldGNoKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGZldGNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdmZXRjaCcpO1xuXG5cdFx0XHR0aGlzLmNvbGxlY3Rpb24uZmV0Y2goe1xuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0bGltaXQ6IHRoaXMuZ2V0T3B0aW9uKCdsaW1pdCcpLFxuXHRcdFx0XHRcdG9yZGVyOiB0aGlzLmdldE9wdGlvbignb3JkZXInKSxcblx0XHRcdFx0XHRzb3J0OiB0aGlzLmdldE9wdGlvbignc29ydCcpLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuXHRcdFx0XHRcdGlmKHQuZ2V0T3B0aW9uKCdzaG93SW5kaWNhdG9yJykpIHtcblx0XHRcdFx0XHRcdHQuaGlkZUluZGljYXRvcigpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHQucmVuZGVyKCk7XG5cdFx0XHRcdFx0dC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpzdWNjZXNzJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHR0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5UcmVlVmlld05vZGUgPSBUb29sYm94LkNvbXBvc2l0ZVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBnZXRUZW1wbGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZighdGhpcy5nZXRPcHRpb24oJ3RlbXBsYXRlJykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgdGVtcGxhdGUgb3B0aW9uIG11c3QgYmUgc2V0LicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RlbXBsYXRlJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGFnTmFtZTogJ2xpJyxcblxuICAgICAgICBjbGFzc05hbWU6ICd0cmVlLXZpZXctbm9kZScsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6ICB7XG4gICAgICAgICAgICBpZEF0dHJpYnV0ZTogJ2lkJyxcbiAgICAgICAgICAgIHBhcmVudEF0dHJpYnV0ZTogJ3BhcmVudF9pZCcsXG4gICAgICAgICAgICBjaGlsZFZpZXdDb250YWluZXI6ICcuY2hpbGRyZW4nXG4gICAgICAgIH0sXG5cbiAgICAgICAgYXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdkYXRhLWlkJzogdGhpcy5tb2RlbC5nZXQodGhpcy5nZXRPcHRpb24oJ2lkQXR0cmlidXRlJykpIHx8IHRoaXMubW9kZWwuY2lkLFxuICAgICAgICAgICAgICAgICdkYXRhLXBhcmVudC1pZCc6IHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdwYXJlbnRBdHRyaWJ1dGUnKSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkNvbXBvc2l0ZVZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gdGhpcy5tb2RlbC5jaGlsZHJlbjtcblxuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zKTtcblxuICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMubW9kZWw7XG5cbiAgICAgICAgICAgIHRoaXMuY2hpbGRWaWV3T3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB0aGlzLmdldE9wdGlvbignY2hpbGRWaWV3T3B0aW9ucycpIHx8IHt9KTtcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBoYXNDaGlsZHJlbjogIHRoaXMuY29sbGVjdGlvbiA/IHRoaXMuY29sbGVjdGlvbi5sZW5ndGggPiAwIDogZmFsc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdiYWNrYm9uZSddLCBmdW5jdGlvbihfLCBCYWNrYm9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfLCBCYWNrYm9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVHJlZVZpZXcgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94LlRyZWVWaWV3Tm9kZSxcblxuICAgICAgICB0YWdOYW1lOiAndWwnLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3RyZWUtdmlldycsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIG5lc3RhYmxlOiB0cnVlXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkNvbGxlY3Rpb25WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jaGlsZFZpZXdPcHRpb25zID0gXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICB0cmVlUm9vdDogdGhpcyxcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdjaGlsZFZpZXdPcHRpb25zJykgfHwge30pO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2pxdWVyeScsICdiYWNrYm9uZS5tYXJpb25ldHRlJywgJ2ludGVyYWN0LmpzJ10sIGZ1bmN0aW9uKF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdpbnRlcmFjdC5qcycpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kLCByb290Lk1hcmlvbmV0dGUsIHJvb3QuaW50ZXJhY3QpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQsIE1hcmlvbmV0dGUsIGludGVyYWN0KSB7XG5cbiAgICBmdW5jdGlvbiBnZXRJZEF0dHJpYnV0ZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gXy5pc051bGwobmV3IFN0cmluZyh2YWx1ZSkubWF0Y2goL15jXFxkKyQvKSkgPyAnaWQnIDogJ2NpZCc7XG4gICAgfVxuXG4gICAgVG9vbGJveC5EcmFnZ2FibGVUcmVlTm9kZSA9IFRvb2xib3guVHJlZVZpZXdOb2RlLmV4dGVuZCh7XG5cbiAgICAgICAgY2xhc3NOYW1lOiAnZHJhZ2dhYmxlLXRyZWUtbm9kZScsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBUb29sYm94LlRyZWVWaWV3Tm9kZS5wcm90b3R5cGUuZGVmYXVsdE9wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBtZW51Q2xhc3NOYW1lOiAnbWVudScsXG4gICAgICAgICAgICAgICAgbWVudVZpZXc6IFRvb2xib3guRHJvcGRvd25NZW51LFxuICAgICAgICAgICAgICAgIG1lbnVWaWV3T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAnZGl2J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zOiBbXSxcbiAgICAgICAgICAgICAgICBuZXN0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcm9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RyZWVSb290Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TWVudUNvbnRhaW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnLicgKyB0aGlzLmdldE9wdGlvbignbWVudUNsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdtZW51VmlldycpLCBjb250YWluZXIgPSB0aGlzLmdldE1lbnVDb250YWluZXIoKTtcblxuICAgICAgICAgICAgaWYoVmlldyAmJiBjb250YWluZXIubGVuZ3RoKSB7XG4gICAgICAgIFx0XHR2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbignbWVudVZpZXdPcHRpb25zJyksIHtcbiAgICAgICAgXHRcdFx0aXRlbXM6IHRoaXMuZ2V0T3B0aW9uKCdtZW51SXRlbXMnKVxuICAgICAgICBcdFx0fSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51ID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZWw6IGNvbnRhaW5lci5nZXQoMClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5zaG93KHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcm9wJyk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcywgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgIHZhciBub2RlV2hlcmUgPSB7fSwgcGFyZW50V2hlcmUgPSB7fTtcblxuICAgICAgICAgICAgdmFyIGlkID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgICAgIG5vZGVXaGVyZVtnZXRJZEF0dHJpYnV0ZShpZCldID0gaWQ7XG4gICAgICAgICAgICBwYXJlbnRXaGVyZVtnZXRJZEF0dHJpYnV0ZShwYXJlbnRJZCldID0gcGFyZW50SWQ7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gc2VsZi5yb290KCkuY29sbGVjdGlvbi5maW5kKG5vZGVXaGVyZSk7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gc2VsZi5yb290KCkuY29sbGVjdGlvbi5maW5kKHBhcmVudFdoZXJlKTtcblxuICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5yZW1vdmVOb2RlKG5vZGUpO1xuXG4gICAgICAgICAgICBpZigkdGFyZ2V0Lmhhc0NsYXNzKCdkcm9wLWJlZm9yZScpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlQmVmb3JlKG5vZGUsIHBhcmVudCk7XG4gICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpiZWZvcmUnLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCR0YXJnZXQuaGFzQ2xhc3MoJ2Ryb3AtYWZ0ZXInKSkge1xuICAgICAgICAgICAgICAgIHNlbGYucm9vdCgpLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUFmdGVyKG5vZGUsIHBhcmVudCk7XG4gICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoJHRhcmdldC5oYXNDbGFzcygnZHJvcC1jaGlsZHJlbicpKSB7XG4gICAgICAgICAgICAgICAgaWYoJChldmVudC50YXJnZXQpLmZpbmQoJy5jaGlsZHJlbicpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJjaGlsZHJlblwiIC8+Jyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoc2VsZi5nZXRPcHRpb24oJ25lc3RhYmxlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlKG5vZGUsIHBhcmVudCwge2F0OiAwfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihub2RlLCBwYXJlbnQsIHthdDogMH0pO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmFmdGVyJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIFRvb2xib3guRHJvcHpvbmVzKGV2ZW50LmRyYWdFdmVudCwgZXZlbnQudGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgYmVmb3JlOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGVCZWZvcmUobm9kZSwgcGFyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpiZWZvcmUnLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhZnRlcjogZnVuY3Rpb24oJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlQWZ0ZXIobm9kZSwgcGFyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZihzZWxmLmdldE9wdGlvbignbmVzdGFibGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlKG5vZGUsIHBhcmVudCwge2F0OiAwfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmNoaWxkcmVuJywgZXZlbnQsIHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlQWZ0ZXIobm9kZSwgcGFyZW50LCB7YXQ6IDB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSwgdGhpcywgdHJ1ZSk7XG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBzZWxmLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ0VudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW50ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wTW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIFRvb2xib3guRHJvcHpvbmVzKGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgYmVmb3JlOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygnZHJvcC1iZWZvcmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdkcm9wLWFmdGVyIGRyb3AtY2hpbGRyZW4nKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFmdGVyOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LmRyb3B6b25lLmVsZW1lbnQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnZHJvcC1hZnRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2Ryb3AtYmVmb3JlIGRyb3AtY2hpbGRyZW4nKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbmVzdGFibGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChldmVudC5kcm9wem9uZS5lbGVtZW50KCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdkcm9wLWNoaWxkcmVuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2Ryb3AtYWZ0ZXIgZHJvcC1iZWZvcmUnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW50ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EcmFnTW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAgICAgICB2YXIgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSArIGV2ZW50LmR4O1xuICAgICAgICAgICAgdmFyIHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCkgKyBldmVudC5keTtcblxuICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCAnICsgeSArICdweCknO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuICAgICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG4gICAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJhZzptb3ZlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dob3N0RWxlbWVudCA9ICR0YXJnZXQubmV4dCgnLicgKyB0aGlzLmNsYXNzTmFtZSkuY3NzKHtcbiAgICAgICAgICAgICAgICAnbWFyZ2luLXRvcCc6ICR0YXJnZXQub3V0ZXJIZWlnaHQoKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX2dob3N0RWxlbWVudC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2dob3N0RWxlbWVudCA9ICR0YXJnZXQucHJldigpLmxlbmd0aCA/ICR0YXJnZXQucHJldigpIDogJHRhcmdldC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9naG9zdEVsZW1lbnQuY3NzKHsnbWFyZ2luLWJvdHRvbSc6ICR0YXJnZXQub3V0ZXJIZWlnaHQoKX0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkdGFyZ2V0LmNzcyh7XG4gICAgICAgICAgICAgICAgJ2xlZnQnOiBldmVudC5jbGllbnRYIC0gNTAsXG4gICAgICAgICAgICAgICAgJ3RvcCc6IGV2ZW50LmNsaWVudFkgLSAyNSxcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiAkdGFyZ2V0LndpZHRoKClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcmFnOnN0YXJ0JywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ0VuZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuXG4gICAgICAgICAgICB0aGlzLl9naG9zdEVsZW1lbnQuYXR0cignc3R5bGUnLCAnJyk7XG5cbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5hdHRyKHtcbiAgICAgICAgICAgICAgICAnZGF0YS14JzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2RhdGEteSc6IGZhbHNlLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICd3aWR0aCc6ICcnLFxuICAgICAgICAgICAgICAgICdsZWZ0JzogJycsXG4gICAgICAgICAgICAgICAgJ3RvcCc6ICcnLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zvcm0nOiAnJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW5kJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZ0xlYXZlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnJlbW92ZUNsYXNzKCdkcm9wLWJlZm9yZSBkcm9wLWFmdGVyIGRyb3AtY2hpbGRyZW4nKTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJhZzpsZWF2ZScsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3BEZWFjdGl2YXRlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnJlbW92ZUNsYXNzKCdkcm9wLWJlZm9yZSBkcm9wLWFmdGVyIGRyb3AtY2hpbGRyZW4nKTtcblxuICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpkZWFjdGl2YXRlJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsICRlbCA9IHRoaXMuJGVsO1xuXG4gICAgICAgICAgICBpbnRlcmFjdCh0aGlzLiRlbC5nZXQoMCkpXG4gICAgICAgICAgICAgICAgLmRyYWdnYWJsZSh7XG4gICAgICAgICAgICAgICAgICAgIGF1dG9TY3JvbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9ubW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnZHJhZzptb3ZlJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbmVuZDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6ZW5kJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbnN0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOnN0YXJ0JywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZHJvcHpvbmUoe1xuICAgICAgICAgICAgICAgICAgICBhY2NlcHQ6ICcuJyArIHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICBvdmVybGFwOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgb25kcmFnZW50ZXI6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcmFnOmVudGVyJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbmRyYWdsZWF2ZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2RyYWc6bGVhdmUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uZHJvcDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJNZXRob2QoJ2Ryb3AnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uZHJvcGRlYWN0aXZhdGU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcm9wOmRlYWN0aXZhdGUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbignZHJhZ21vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZihldmVudC5kcm9wem9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdkcm9wOm1vdmUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zaG93TWVudSgpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnanF1ZXJ5JywgJ2JhY2tib25lLm1hcmlvbmV0dGUnLCAnaW50ZXJhY3QuanMnXSwgZnVuY3Rpb24oXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByb290LlRvb2xib3gsXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdqcXVlcnknKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2ludGVyYWN0LmpzJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LiQsIHJvb3QuTWFyaW9uZXR0ZSwgcm9vdC5pbnRlcmFjdCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXywgJCwgTWFyaW9uZXR0ZSwgaW50ZXJhY3QpIHtcblxuICAgIFRvb2xib3guRHJhZ2dhYmxlVHJlZVZpZXcgPSBUb29sYm94LlRyZWVWaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94LkRyYWdnYWJsZVRyZWVOb2RlLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2RyYWdnYWJsZS10cmVlJyxcblxuICAgICAgICBjaGlsZFZpZXdPcHRpb25zOiB7XG4gICAgICAgICAgICBpZEF0dHJpYnV0ZTogJ2lkJyxcbiAgICAgICAgICAgIHBhcmVudEF0dHJpYnV0ZTogJ3BhcmVudF9pZCdcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnJlb3JkZXIoKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LkJ1dHRvbkRyb3Bkb3duTWVudSA9IFRvb2xib3guRHJvcGRvd25NZW51LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnYnV0dG9uLWRyb3Bkb3duLW1lbnUnKSxcblxuXHRcdGNoaWxkVmlld0NvbnRhaW5lcjogJ3VsJyxcblxuXHRcdHRhZ05hbWU6ICdkaXYnLFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayAuYnRuOm5vdCguZHJvcGRvd24tdG9nZ2xlKSc6ICdidXR0b246Y2xpY2snLFxuXHRcdFx0J2NsaWNrIC5kcm9wZG93bi10b2dnbGUnOiAndG9nZ2xlOmNsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBbiBhcnJheSBvZiBtZW51IGl0ZW1zIHRvIGJlIGNvbnZlcnRlZCB0byBhIGNvbGxlY3Rpb24uXG4gICAgICAgICAgICBpdGVtczogW10sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biBidXR0b24gdGV4dFxuXHRcdFx0YnV0dG9uTGFiZWw6IGZhbHNlLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZHJvcGRvd24gYnV0dG9uIGNsYXNzIG5hbWVcblx0XHRcdGJ1dHRvbkNsYXNzTmFtZTogJ2J0biBidG4tZGVmYXVsdCcsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBkcm9wZG93biB0b2dnbGUgY2xhc3MgbmFtZVxuXHRcdFx0YnV0dG9uVG9nZ2xlQ2xhc3NOYW1lOiAnZHJvcGRvd24tdG9nZ2xlJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIG1lbnUgY2xhc3MgbmFtZVxuXHRcdFx0bWVudUNsYXNzTmFtZTogJ2Ryb3Bkb3duLW1lbnUnLFxuXG5cdFx0XHQvLyAoaW50fGJvb2wpIFRoZSBjb2xsZWN0aW9uIGxpbWl0XG5cdFx0XHRsaW1pdDogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBvcmRlciBvZiB0aGUgY29sbGVjdGlvbiBpdGVtc1xuXHRcdFx0b3JkZXI6ICduYW1lJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgRWl0aGVyIGFzYyBvciBkZXNjXG5cdFx0XHRzb3J0OiAnYXNjJyxcblxuXHRcdFx0Ly8gKGJvb2wpIENsb3NlIHRoZSBtZW51IGFmdGVyIGFuIGl0ZW0gaGFzIGJlZW4gY2xpY2tlZFxuXHRcdFx0Y2xvc2VPbkNsaWNrOiB0cnVlLFxuXG5cdFx0XHQvLyAoYm9vbCkgTWVudSBhcHBlYXIgYXMgYSBcImRyb3B1cFwiIGluc3RlYWQgb2YgYSBcImRyb3Bkb3duXCJcblx0XHRcdGRyb3BVcDogZmFsc2UsXG5cblx0XHRcdC8vIChib29sKSBGZXRjaCB0aGUgY29sbGVjdGlvbiB3aGVuIHRoZSBkcm9wZG93biBtZW51IGlzIHNob3duXG5cdFx0XHRmZXRjaE9uU2hvdzogZmFsc2UsXG5cblx0XHRcdC8vIChib29sKSBTaG93IGFuIGFjdGl2aXR5IGluZGljYXRvciB3aGVuIGZldGNoaW5nIHRoZSBjb2xsZWN0aW9uXG5cdFx0XHRzaG93SW5kaWNhdG9yOiB0cnVlLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgYnV0dG9uIGFzIHNwbGl0IHdpdGggdHdvIGFjdGlvbnMgaW5zdGVhZCBvZiBvbmVcblx0XHRcdHNwbGl0QnV0dG9uOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRyb3Bkb3duIHRvZ2dsZSBjbGFzcyBuYW1lXG5cdFx0XHR0b2dnbGVDbGFzc05hbWU6ICdvcGVuJ1xuXHRcdH0sXG5cblx0XHRzaG93TWVudTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJykucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3RvZ2dsZUNsYXNzTmFtZScpKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5kcm9wZG93bi10b2dnbGUnKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblx0XHR9LFxuXG5cdFx0aGlkZU1lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCd0b2dnbGVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJykuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXHRcdH0sXG5cblx0XHRpc01lbnVWaXNpYmxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbigndG9nZ2xlQ2xhc3NOYW1lJykpLmxlbmd0aCA+IDA7XG5cdFx0fVxuXG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2pxdWVyeScsICdzcGluLmpzJ10sIGZ1bmN0aW9uKF8sICQsIFNwaW5uZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgJCwgU3Bpbm5lcik7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3NwaW4uanMnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kLCByb290LlNwaW5uZXIpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sICQsIFNwaW5uZXIpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2FjdGl2aXR5LWluZGljYXRvcicpLFxuXG4gICAgICAgIHNwaW5uaW5nOiBmYWxzZSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWxGb250U2l6ZTogZmFsc2UsXG4gICAgICAgICAgICBkaW1tZWRCZ0NvbG9yOiBmYWxzZSxcbiAgICAgICAgICAgIGRpbW1lZDogZmFsc2UsXG4gICAgICAgICAgICBhdXRvU3RhcnQ6IHRydWUsXG4gICAgICAgICAgICBwb3NpdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBtaW5IZWlnaHQ6ICcwcHgnLFxuICAgICAgICAgICAgaW5kaWNhdG9yOiB7fSxcbiAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiAwLFxuICAgICAgICAgICAgZGVmYXVsdEluZGljYXRvcjoge1xuICAgICAgICAgICAgICAgIGxpbmVzOiAxMSwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgbGVuZ3RoOiAxNSwgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICB3aWR0aDogMywgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxMywgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgY29ybmVyczogNCwgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgICAgICAgICAgICAgICByb3RhdGU6IDAsIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDEsIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMwMDAnLCAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXG4gICAgICAgICAgICAgICAgc3BlZWQ6IDEsIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgICAgICAgICAgICAgdHJhaWw6IDQwLCAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIHNoYWRvdzogZmFsc2UsIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XG4gICAgICAgICAgICAgICAgaHdhY2NlbDogdHJ1ZSwgLy8gV2hldGhlciB0byB1c2UgaGFyZHdhcmUgYWNjZWxlcmF0aW9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYWN0aXZpdHktaW5kaWNhdG9yLXNwaW5uZXInLCAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxuICAgICAgICAgICAgICAgIHpJbmRleDogMmU5LCAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcbiAgICAgICAgICAgICAgICB0b3A6ICc1MCUnLCAvLyBUb3AgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XG4gICAgICAgICAgICAgICAgbGVmdDogJzUwJScgLy8gTGVmdCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRQcmVzZXRPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ3RpbnknOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogNCwgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEsIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDQsIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgICAgICAgICAgICAgICAgICBjb3JuZXJzOiAxLCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgICAgICBsYWJlbE9mZnNldDogMTUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnc21hbGwnOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogNywgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEsIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDcsIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgICAgICAgICAgICAgICAgICBjb3JuZXJzOiAxLCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgICAgICBsYWJlbE9mZnNldDogMjAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnbWVkaXVtJzoge1xuICAgICAgICAgICAgICAgICAgICBsaW5lczogMTIsIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IDE0LCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMTEsIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgICAgICAgICAgICAgICAgICBjb3JuZXJzOiAxLCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICAgICAgICAgICAgICBsYWJlbE9mZnNldDogMzAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnbGFyZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogMjgsIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAyMCwgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lcnM6IDEsIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsT2Zmc2V0OiA2MFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94Lkl0ZW1WaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHZhciByZXNpemVUaW1lciwgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi4kZWwuZmluZCgnLmFjdGl2aXR5LWluZGljYXRvci1sYWJlbCcpLmNzcyh7dG9wOiAnJ30pO1xuICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb25MYWJlbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcG9zaXRpb25MYWJlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLnNwaW5uZXIgJiYgdGhpcy5nZXRPcHRpb24oJ2xhYmVsJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgJGxhYmVsID0gdGhpcy4kZWwuZmluZCgnLmFjdGl2aXR5LWluZGljYXRvci1sYWJlbCcpO1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSAkbGFiZWwub3V0ZXJIZWlnaHQoKTtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gVG9vbGJveC5WaWV3T2Zmc2V0KCRsYWJlbC5nZXQoMCkpO1xuXG4gICAgICAgICAgICAgICAgJGxhYmVsLmNoaWxkcmVuKCkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0aGlzLnNwaW5uZXIub3B0cy5sYWJlbE9mZnNldCB8fCAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0TGFiZWw6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuYWN0aXZpdHktaW5kaWNhdG9yLWxhYmVsJykuaHRtbCh0aGlzLm9wdGlvbnMubGFiZWwgPSB2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3Bpbm5lck9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGRlZmF1bHRJbmRpY2F0b3IgPSB0aGlzLmdldE9wdGlvbignZGVmYXVsdEluZGljYXRvcicpO1xuICAgICAgICAgICAgdmFyIGluZGljYXRvciA9IHRoaXMuZ2V0T3B0aW9uKCdpbmRpY2F0b3InKTtcbiAgICAgICAgICAgIHZhciBwcmVzZXRzID0gdGhpcy5nZXRQcmVzZXRPcHRpb25zKCk7XG5cbiAgICAgICAgICAgIGlmKF8uaXNTdHJpbmcoaW5kaWNhdG9yKSAmJiBwcmVzZXRzW2luZGljYXRvcl0pIHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSBwcmVzZXRzW2luZGljYXRvcl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHR5cGVvZiBpbmRpY2F0b3IgIT09IFwib2JqZWN0XCIpe1xuICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHt9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGRlZmF1bHRJbmRpY2F0b3IsIGluZGljYXRvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3Bpbm5lckRvbTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnLmFjdGl2aXR5LWluZGljYXRvcicpLmdldCgwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNwaW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lci5zcGluKHRoaXMuZ2V0U3Bpbm5lckRvbSgpKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc3RhcnQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3N0b3AnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHNwaW5uZXIgb2JqZWN0XG4gICAgICAgICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcih0aGlzLmdldFNwaW5uZXJPcHRpb25zKCkpO1xuXG4gICAgICAgICAgICAvLyBzdGFydCBpZiBvcHRpb25zLmF1dG9TdGFydCBpcyB0cnVlXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYXV0b1N0YXJ0JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wb3NpdGlvbkxhYmVsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKF8sIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIF8sIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpLCByZXF1aXJlKCdiYWNrYm9uZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fLCByb290LkJhY2tib25lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCBCYWNrYm9uZSkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vQnJlYWRjcnVtYnMgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tYnJlYWRjcnVtYnMnKSxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRjbGFzc05hbWU6ICduby1icmVhZGNydW1icydcblxuXHR9KTtcblxuXHRUb29sYm94LkJyZWFkY3J1bWIgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnYnJlYWRjcnVtYicpLFxuXG5cdFx0dGFnTmFtZTogJ2xpJ1xuXG5cdH0pO1xuXG5cdFRvb2xib3guQnJlYWRjcnVtYnMgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guQnJlYWRjcnVtYixcblxuXHRcdGVtcHR5VmlldzogVG9vbGJveC5Ob0JyZWFkY3J1bWJzLFxuXG5cdFx0Y2xhc3NOYW1lOiAnYnJlYWRjcnVtYicsXG5cblx0XHR0YWdOYW1lOiAnb2wnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZSdcblx0XHR9LFxuXG5cdFx0Y29sbGVjdGlvbkV2ZW50czoge1xuXHRcdFx0J2NoYW5nZSBhZGQgcmVtb3ZlIHJlc2V0JzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHQub25Eb21SZWZyZXNoKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0aWYoIXRoaXMuY29sbGVjdGlvbikge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRnZXRCcmVhZGNydW1iczogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYnJlYWRjcnVtYnMgPSB0aGlzLmNvbGxlY3Rpb24gPyB0aGlzLmNvbGxlY3Rpb24udG9KU09OKCkgOiBbXTtcblxuXHRcdFx0aWYoIV8uaXNBcnJheShicmVhZGNydW1icykpIHtcblx0XHRcdFx0YnJlYWRjcnVtYnMgPSBbXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJyZWFkY3J1bWJzO1xuXHRcdH0sXG5cblx0XHRhZGRCcmVhZGNydW1iczogZnVuY3Rpb24oYnJlYWRjcnVtYnMpIHtcblx0XHRcdGlmKF8uaXNBcnJheShicmVhZGNydW1icykpIHtcblx0XHRcdFx0Xy5lYWNoKGJyZWFkY3J1bWJzLCBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRCcmVhZGNydW1iKGJyZWFkY3J1bWIpO1xuXHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignQWRkaW5nIG11bHRpcGxlIGJyZWFkY3J1bWJzIG11c3QgZG9uZSBieSBwYXNzaW5nIGFuIGFycmF5Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRhZGRCcmVhZGNydW1iOiBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KGJyZWFkY3J1bWIpKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi5hZGQoYnJlYWRjcnVtYik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0EgYnJlYWRjcnVtYiBtdXN0IGJlIHBhc3NlZCBhcyBhbiBvYmplY3QnKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdHNldEJyZWFkY3J1bWJzOiBmdW5jdGlvbihicmVhZGNydW1icykge1xuXHRcdFx0aWYoXy5pc0FycmF5KGJyZWFkY3J1bWJzKSkge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uc2V0KGJyZWFkY3J1bWJzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byBzZXQgdGhlIGJyZWFkY3J1bWJzJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRpbnNlcnRCcmVhZGNydW1iOiBmdW5jdGlvbihicmVhZGNydW1iKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KGJyZWFkY3J1bWIpKSB7XG5cdFx0XHRcdHRoaXMuY29sbGVjdGlvbi51bnNoaWZ0KGJyZWFkY3J1bWIpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdBIGJyZWFkY3J1bWIgbXVzdCBiZSBwYXNzZWQgYXMgYW4gb2JqZWN0Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRpbnNlcnRCcmVhZGNydW1iczogZnVuY3Rpb24oYnJlYWRjcnVtYnMpIHtcblx0XHRcdHZhciB0ID0gdGhpcztcblxuXHRcdFx0aWYoXy5pc0FycmF5KGJyZWFkY3J1bWJzKSkge1xuXHRcdFx0XHRfLmVhY2goYnJlYWRjcnVtYnMsIGZ1bmN0aW9uKGJyZWFkY3J1bWIpIHtcblx0XHRcdFx0XHR0Lmluc2VydEJyZWFkY3J1bWIoYnJlYWRjcnVtYik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdJbnNlcnRpbmcgbXVsdGlwbGUgYnJlYWRjcnVtYnMgbXVzdCBkb25lIGJ5IHBhc3NpbmcgYW4gYXJyYXknKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdHJlbW92ZUJyZWFkY3J1bWJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuXHRcdH0sXG5cblx0XHRvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoIXRoaXMuJGVsLmZpbmQoJy5uby1icmVhZGNydW1icycpLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLiRlbC5wYXJlbnQoKS5zaG93KCk7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0XHRpZih0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkIGEnKS5sZW5ndGgpIHtcblx0XHRcdFx0XHR0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkJykuaHRtbCh0aGlzLiRlbC5maW5kKCdsaTpsYXN0LWNoaWxkIGEnKS5odG1sKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy4kZWwucGFyZW50KCkuaGlkZSgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2JhY2tib25lJ10sIGZ1bmN0aW9uKEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIEJhY2tib25lKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuQmFja2JvbmUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIEJhY2tib25lKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkJ1dHRvbkdyb3VwSXRlbSA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdidXR0b24tZ3JvdXAtaXRlbScpLFxuXG5cdFx0dGFnTmFtZTogJ2EnLFxuXG5cdFx0Y2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2snOiAnY2xpY2snXG5cdFx0fSxcblxuICAgICAgICBvcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZGlzYWJsZWQgY2xhc3MgbmFtZVxuXHRcdFx0ZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCdcbiAgICAgICAgfSxcblxuXHRcdG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSkpIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsLmdldCgnY2xhc3NOYW1lJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLm1vZGVsLmdldCgnY2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCgnYWN0aXZlJykpIHtcblx0XHRcdFx0dGhpcy4kZWwuY2xpY2soKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5Ob0J1dHRvbkdyb3VwSXRlbXMgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tYnV0dG9uLWdyb3VwLWl0ZW0nKVxuXG5cdH0pO1xuXG5cdFRvb2xib3guQnV0dG9uR3JvdXAgPSBUb29sYm94LkNvbGxlY3Rpb25WaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guQnV0dG9uR3JvdXBJdGVtLFxuXG5cdFx0ZW1wdHlWaWV3OiBUb29sYm94Lk5vQnV0dG9uR3JvdXBJdGVtcyxcblxuXHRcdGNsYXNzTmFtZTogJ2J0bi1ncm91cCcsXG5cblx0XHR0YWdOYW1lOiAnZGl2JyxcblxuXHRcdGNoaWxkRXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiAnb25DaGlsZENsaWNrJ1xuXHRcdH0sXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGFjdGl2ZSBjbGFzcyBuYW1lXG5cdFx0XHRhY3RpdmVDbGFzc05hbWU6ICdhY3RpdmUnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgZGlzYWJsZWQgY2xhc3MgbmFtZVxuXHRcdFx0ZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG5cblx0XHRcdC8vIChib29sKSBBY3RpdmF0ZSB0aGUgYnV0dG9uIG9uIGNsaWNrXG5cdFx0XHRhY3RpdmF0ZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChtaXhlZCkgUGFzcyBhbiBhcnJheSBvZiBidXR0b25zIGluc3RlYWQgb2YgcGFzc2luZyBhIGNvbGxlY3Rpb24gb2JqZWN0LlxuXHRcdFx0YnV0dG9uczogZmFsc2Vcblx0XHR9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIFRvb2xib3guQ29sbGVjdGlvblZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKSAmJiAhb3B0aW9ucy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24odGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlSW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZih0aGlzLmNoaWxkcmVuLmZpbmRCeUluZGV4KGluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZmluZEJ5SW5kZXgoaW5kZXgpLiRlbC5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSkuY2xpY2soKTtcblx0XHR9LFxuXG5cdFx0b25DaGlsZENsaWNrOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYoIWNoaWxkLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSkpIHtcbiAgICBcdFx0XHR0aGlzLnRyaWdnZXIoJ2NsaWNrJywgY2hpbGQpO1xuXG4gICAgXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ2FjdGl2YXRlT25DbGljaycpICYmICFjaGlsZC4kZWwuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKSkge1xuICAgIFx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLicrdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgIFx0XHRcdFx0XHQucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuICAgIFx0XHRcdFx0Y2hpbGQuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cbiAgICBcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnYWN0aXZhdGUnLCBjaGlsZCk7XG4gICAgXHRcdFx0fVxuICAgICAgICAgICAgfVxuXHRcdH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICBmdW5jdGlvbiBmb3JFYWNoKCBhcnJheSwgZm4gKSB7IHZhciBpLCBsZW5ndGhcbiAgICBpID0gLTFcbiAgICBsZW5ndGggPSBhcnJheS5sZW5ndGhcbiAgICB3aGlsZSAoICsraSA8IGxlbmd0aCApXG4gICAgICBmbiggYXJyYXlbIGkgXSwgaSwgYXJyYXkgKVxuICB9XG5cbiAgZnVuY3Rpb24gbWFwKCBhcnJheSwgZm4gKSB7IHZhciByZXN1bHRcbiAgICByZXN1bHQgPSBBcnJheSggYXJyYXkubGVuZ3RoIClcbiAgICBmb3JFYWNoKCBhcnJheSwgZnVuY3Rpb24gKCB2YWwsIGksIGFycmF5ICkge1xuICAgICAgcmVzdWx0W2ldID0gZm4oIHZhbCwgaSwgYXJyYXkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZnVuY3Rpb24gcmVkdWNlKCBhcnJheSwgZm4sIGFjY3VtdWxhdG9yICkge1xuICAgIGZvckVhY2goIGFycmF5LCBmdW5jdGlvbiggdmFsLCBpLCBhcnJheSApIHtcbiAgICAgIGFjY3VtdWxhdG9yID0gZm4oIHZhbCwgaSwgYXJyYXkgKVxuICAgIH0pXG4gICAgcmV0dXJuIGFjY3VtdWxhdG9yXG4gIH1cblxuICAvLyBMZXZlbnNodGVpbiBkaXN0YW5jZVxuICBmdW5jdGlvbiBMZXZlbnNodGVpbiggc3RyX20sIHN0cl9uICkgeyB2YXIgcHJldmlvdXMsIGN1cnJlbnQsIG1hdHJpeFxuICAgIC8vIENvbnN0cnVjdG9yXG4gICAgbWF0cml4ID0gdGhpcy5fbWF0cml4ID0gW11cblxuICAgIC8vIFNhbml0eSBjaGVja3NcbiAgICBpZiAoIHN0cl9tID09IHN0cl9uIClcbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlID0gMFxuICAgIGVsc2UgaWYgKCBzdHJfbSA9PSAnJyApXG4gICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZSA9IHN0cl9uLmxlbmd0aFxuICAgIGVsc2UgaWYgKCBzdHJfbiA9PSAnJyApXG4gICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZSA9IHN0cl9tLmxlbmd0aFxuICAgIGVsc2Uge1xuICAgICAgLy8gRGFuZ2VyIFdpbGwgUm9iaW5zb25cbiAgICAgIHByZXZpb3VzID0gWyAwIF1cbiAgICAgIGZvckVhY2goIHN0cl9tLCBmdW5jdGlvbiggdiwgaSApIHsgaSsrLCBwcmV2aW91c1sgaSBdID0gaSB9IClcblxuICAgICAgbWF0cml4WzBdID0gcHJldmlvdXNcbiAgICAgIGZvckVhY2goIHN0cl9uLCBmdW5jdGlvbiggbl92YWwsIG5faWR4ICkge1xuICAgICAgICBjdXJyZW50ID0gWyArK25faWR4IF1cbiAgICAgICAgZm9yRWFjaCggc3RyX20sIGZ1bmN0aW9uKCBtX3ZhbCwgbV9pZHggKSB7XG4gICAgICAgICAgbV9pZHgrK1xuICAgICAgICAgIGlmICggc3RyX20uY2hhckF0KCBtX2lkeCAtIDEgKSA9PSBzdHJfbi5jaGFyQXQoIG5faWR4IC0gMSApIClcbiAgICAgICAgICAgIGN1cnJlbnRbIG1faWR4IF0gPSBwcmV2aW91c1sgbV9pZHggLSAxIF1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjdXJyZW50WyBtX2lkeCBdID0gTWF0aC5taW5cbiAgICAgICAgICAgICAgKCBwcmV2aW91c1sgbV9pZHggXSAgICAgKyAxICAgLy8gRGVsZXRpb25cbiAgICAgICAgICAgICAgLCBjdXJyZW50WyAgbV9pZHggLSAxIF0gKyAxICAgLy8gSW5zZXJ0aW9uXG4gICAgICAgICAgICAgICwgcHJldmlvdXNbIG1faWR4IC0gMSBdICsgMSAgIC8vIFN1YnRyYWN0aW9uXG4gICAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgICAgcHJldmlvdXMgPSBjdXJyZW50XG4gICAgICAgIG1hdHJpeFsgbWF0cml4Lmxlbmd0aCBdID0gcHJldmlvdXNcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlID0gY3VycmVudFsgY3VycmVudC5sZW5ndGggLSAxIF1cbiAgICB9XG4gIH1cblxuICBMZXZlbnNodGVpbi5wcm90b3R5cGUudG9TdHJpbmcgPSBMZXZlbnNodGVpbi5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCBub19wcmludCApIHtcbiAgICAgIHZhciBtYXRyaXgsIG1heCwgYnVmZiwgc2VwLCByb3dzLCBtYXRyaXggPSB0aGlzLmdldE1hdHJpeCgpO1xuXG4gICAgICBtYXggPSByZWR1Y2UoIG1hdHJpeCxmdW5jdGlvbiggbSwgbyApIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoIG0sIHJlZHVjZSggbywgTWF0aC5tYXgsIDAgKSApXG4gICAgICB9LCAwICk7XG5cbiAgICAgIGJ1ZmYgPSBBcnJheSgoIG1heCArICcnICkubGVuZ3RoKS5qb2luKCcgJyk7XG5cbiAgICAgIHNlcCA9IFtdO1xuXG4gICAgICB3aGlsZSAoIHNlcC5sZW5ndGggPCAobWF0cml4WzBdICYmIG1hdHJpeFswXS5sZW5ndGggfHwgMCkgKSB7XG4gICAgICAgICAgc2VwWyBzZXAubGVuZ3RoIF0gPSBBcnJheSggYnVmZi5sZW5ndGggKyAxICkuam9pbiggJy0nICk7XG4gICAgICB9XG5cbiAgICAgIHNlcCA9IHNlcC5qb2luKCAnLSsnICkgKyAnLSc7XG5cbiAgICAgIHJvd3MgPSBtYXAoIG1hdHJpeCwgZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgdmFyIGNlbGxzO1xuXG4gICAgICAgICAgY2VsbHMgPSBtYXAocm93LCBmdW5jdGlvbihjZWxsKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoYnVmZiArIGNlbGwpLnNsaWNlKCAtIGJ1ZmYubGVuZ3RoIClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBjZWxscy5qb2luKCAnIHwnICkgKyAnICc7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJvd3Muam9pbiggXCJcXG5cIiArIHNlcCArIFwiXFxuXCIgKTtcbiAgfVxuXG4gIExldmVuc2h0ZWluLnByb3RvdHlwZS5nZXRNYXRyaXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWF0cml4LnNsaWNlKClcbiAgfVxuXG4gIExldmVuc2h0ZWluLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZVxuICB9XG5cbiAgVG9vbGJveC5MZXZlbnNodGVpbiA9IExldmVuc2h0ZWluO1xuXG4gIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKCQsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXylcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LkNoZWNrYm94RmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLWNoZWNrYm94LWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgb3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdjaGVja2JveCdcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnOmNoZWNrZWQnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKCQodGhpcykudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPiAxID8gdmFsdWVzIDogdmFsdWVzWzBdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldElucHV0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgaWYoIV8uaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gW3ZhbHVlc107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJzpjaGVja2VkJykuYXR0cignY2hlY2tlZCcsIGZhbHNlKTtcblxuICAgICAgICAgICAgXy5lYWNoKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdbdmFsdWU9XCInK3ZhbHVlKydcIl0nKS5hdHRyKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1xuICAgICAgICAgICAgJ3VuZGVyc2NvcmUnLFxuICAgICAgICAgICAgJ2JhY2tib25lJyxcbiAgICAgICAgICAgICdiYWNrYm9uZS5tYXJpb25ldHRlJyxcbiAgICAgICAgICAgICdtb21lbnQnXG4gICAgICAgIF0sIGZ1bmN0aW9uKF8sIEJhY2tib25lLCBNYXJpb25ldHRlLCBtb21lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUsIG1vbWVudClcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpLFxuICAgICAgICAgICAgcmVxdWlyZSgnYmFja2JvbmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ21vbWVudCcpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJvb3QuXyxcbiAgICAgICAgICAgIHJvb3QuQmFja2JvbmUsXG4gICAgICAgICAgICByb290Lk1hcmlvbmV0dGUsXG4gICAgICAgICAgICByb290Lm1vbWVudFxuICAgICAgICApO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIF8sIEJhY2tib25lLCBNYXJpb25ldHRlLCBtb21lbnQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guTW9udGhseUNhbGVuZGFyRGF5ID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdjYWxlbmRhci1tb250aGx5LWRheS12aWV3JyksXG5cbiAgICAgICAgdGFnTmFtZTogJ3RkJyxcblxuICAgICAgICBjbGFzc05hbWU6ICdjYWxlbmRhci1kYXknLFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2snOiAnY2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9kZWxFdmVudHM6ICB7XG4gICAgICAgICAgICAnY2hhbmdlJzogJ21vZGVsQ2hhbmdlZCdcbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgZGF0ZTogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICBtb2RlbENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXk6IHRoaXMuZ2V0T3B0aW9uKCdkYXknKSxcbiAgICAgICAgICAgICAgICBoYXNFdmVudHM6IHRoaXMuaGFzRXZlbnRzKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDZWxsSGVpZ2h0OiBmdW5jdGlvbih3aWR0aCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuY3NzKCdoZWlnaHQnLCB3aWR0aCB8fCB0aGlzLiRlbC53aWR0aCgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignZGF0ZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0V2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoJ2V2ZW50cycpLmxlbmd0aCA+IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldERhdGUoKS5pc1NhbWUobmV3IERhdGUoKSwgJ2RheScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2NhbGVuZGFyLXRvZGF5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0RGF0ZSgpLmlzU2FtZSh0aGlzLmdldE9wdGlvbignY3VycmVudERhdGUnKSwgJ2RheScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2NhbGVuZGFyLWN1cnJlbnQtZGF5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0RGF0ZSgpLmlzU2FtZSh0aGlzLmdldE9wdGlvbignY3VycmVudERhdGUnKSwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnY2FsZW5kYXItbW9udGgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwuZ2V0KCdldmVudHMnKSB8fCBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRFdmVudHM6IGZ1bmN0aW9uKGV2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ2V2ZW50cycsIGV2ZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RpbmcgPSBfLmNsb25lKHRoaXMuZ2V0RXZlbnRzKCkpO1xuXG4gICAgICAgICAgICBleGlzdGluZy5wdXNoKGV2ZW50KTtcblxuICAgICAgICAgICAgdGhpcy5zZXRFdmVudHMoZXhpc3RpbmcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZEV2ZW50czogZnVuY3Rpb24oZXZlbnRzKSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RpbmcgPSBfLmNsb25lKHRoaXMuZ2V0RXZlbnRzKCkpO1xuXG4gICAgICAgICAgICB0aGlzLnNldEV2ZW50cyhfLm1lcmdlKGV4aXN0aW5nLCBldmVudHMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVFdmVudDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpO1xuXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW2luZGV4XTtcblxuICAgICAgICAgICAgdGhpcy5zZXRFdmVudHMoZXZlbnRzKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRFdmVudHMoW10pO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIFRvb2xib3guTW9udGhseUNhbGVuZGFyV2VlayA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBjaGlsZFZpZXc6IFRvb2xib3guTW9udGhseUNhbGVuZGFyRGF5LFxuXG4gICAgICAgIHRhZ05hbWU6ICd0cicsXG5cbiAgICAgICAgY2hpbGRFdmVudHM6IHtcbiAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbih2aWV3LCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkYXk6Y2xpY2snLCB2aWV3LCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgZGF5czogZmFsc2UsXG4gICAgICAgICAgICBldmVudHM6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hpbGRWaWV3T3B0aW9uczogZnVuY3Rpb24oY2hpbGQsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXkoaW5kZXgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERheXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdkYXlzJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF5OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIGRheXMgPSB0aGlzLmdldERheXMoKTtcblxuICAgICAgICAgICAgaWYoZGF5c1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF5c1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Rmlyc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmZpcnN0KCkuZ2V0RGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExhc3REYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmxhc3QoKS5nZXREYXRlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF5TW9kZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBCYWNrYm9uZS5Nb2RlbCh7XG4gICAgICAgICAgICAgICAgZXZlbnRzOiBbXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbmRlckNoaWxkcmVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveUVtcHR5VmlldygpO1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95Q2hpbGRyZW4oKTtcblxuICAgICAgICAgICAgdGhpcy5zdGFydEJ1ZmZlcmluZygpO1xuICAgICAgICAgICAgdGhpcy5zaG93Q29sbGVjdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5lbmRCdWZmZXJpbmcoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93Q29sbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRPcHRpb24oJ2RheXMnKSwgZnVuY3Rpb24oZGF5LCBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLmdldERheU1vZGVsKCksIHRoaXMuZ2V0Q2hpbGRWaWV3KCksIGkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2luaXRpYWxFdmVudHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5Nb250aGx5Q2FsZW5kYXIgPSBUb29sYm94LkNvbXBvc2l0ZVZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnY2FsZW5kYXItbW9udGhseS12aWV3JyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnY2FsZW5kYXInLFxuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5Nb250aGx5Q2FsZW5kYXJXZWVrLFxuXG4gICAgICAgIGNoaWxkVmlld0NvbnRhaW5lcjogJ3Rib2R5JyxcblxuICAgICAgICBjaGlsZEV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrJzogZnVuY3Rpb24od2VlaywgYXJncykge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnd2VlazpjbGljaycsIHdlZWssIGFyZ3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdkYXk6Y2xpY2snOiBmdW5jdGlvbih3ZWVrLCBkYXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldERhdGUoZGF5LmdldERhdGUoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdkYXk6Y2xpY2snLCB3ZWVrLCBkYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGU6IGZhbHNlLFxuICAgICAgICAgICAgYWx3YXlzU2hvd1NpeFdlZWtzOiB0cnVlLFxuICAgICAgICAgICAgZmV0Y2hPblJlbmRlcjogdHJ1ZSxcbiAgICAgICAgICAgIGluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdzbWFsbCcsXG4gICAgICAgICAgICAgICAgZGltbWVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRpbW1lZEJnQ29sb3I6ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIC42KSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgICAgJ2NsaWNrIC5jYWxlbmRhci1uYXZpZ2F0aW9uLXByZXYnOiAncHJldjpjbGljaycsXG4gICAgICAgICAgICAnY2xpY2sgLmNhbGVuZGFyLW5hdmlnYXRpb24tbmV4dCc6ICduZXh0OmNsaWNrJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGNoaWxkVmlld09wdGlvbnM6IGZ1bmN0aW9uKGNoaWxkLCBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXlzOiB0aGlzLmdldENhbGVuZGFyV2VlayhpbmRleClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UXVlcnlWYXJpYWJsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5nZXRGaXJzdERhdGUoKS5mb3JtYXQoJ1lZWVktTU0tREQgSEgtbW0tc3MnKSxcbiAgICAgICAgICAgICAgICBlbmQ6IHRoaXMuZ2V0TGFzdERhdGUoKS5mb3JtYXQoJ1lZWVktTU0tREQgSEgtbW0tc3MnKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBmZXRjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsIHBhcmFtcyA9IHRoaXMuZ2V0UXVlcnlWYXJpYWJsZXMoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRDYWNoZVJlc3BvbnNlKHBhcmFtcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVDYWNoZVJlc3BvbnNlKHBhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2ZldGNoJywgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24ucmVzZXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnNldENhY2hlUmVzcG9uc2UocGFyYW1zLCBjb2xsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6Y29tcGxldGUnLCB0cnVlLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOnN1Y2Nlc3MnLCBjb2xsZWN0aW9uLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6Y29tcGxldGUnLCBmYWxzZSwgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDplcnJvcicsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93QWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZldGNoQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVFdmVudDogZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IHtcbiAgICAgICAgICAgICAgICBzdGFydDogbW9kZWwuZ2V0KCdzdGFydCcpIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgZW5kOiBtb2RlbC5nZXQoJ2VuZCcpIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NyZWF0ZTpldmVudCcsIGV2ZW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5jYWxlbmRhci1oZWFkZXInKS5odG1sKHRoaXMuZ2V0Q2FsZW5kYXJIZWFkZXIoKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuY2FsZW5kYXItc3ViLWhlYWRlcicpLmh0bWwodGhpcy5nZXRDYWxlbmRhclN1YkhlYWRlcigpKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyQ29sbGVjdGlvbigpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZmV0Y2hPblJlbmRlcicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlc3RvcmVDYWNoZVJlc3BvbnNlOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuZ2V0Q2FjaGVSZXNwb25zZShwYXJhbXMpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdyZXN0b3JlOmNhY2hlOnJlc3BvbnNlJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q2FjaGVSZXNwb25zZTogZnVuY3Rpb24ocGFyYW1zLCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcblxuICAgICAgICAgICAgaWYoIWNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlcykge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlcyA9IHt9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXNbc3RyaW5nXSA9IF8uY2xvbmUoY29sbGVjdGlvbik7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2V0OmNhY2hlOnJlc3BvbnNlJywgY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzW3N0cmluZ10pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENhY2hlUmVzcG9uc2U6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgdmFyIHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHBhcmFtcyk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbGxlY3Rpb24uX2NhY2hlZFJlc3BvbnNlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuY29sbGVjdGlvbi5fY2FjaGVkUmVzcG9uc2VzLmhhc093blByb3BlcnR5KHN0cmluZykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLl9jYWNoZWRSZXNwb25zZXNbc3RyaW5nXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0FjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kZWwuZmluZCgnLmluZGljYXRvcicpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvcih0aGlzLmdldE9wdGlvbignaW5kaWNhdG9yT3B0aW9ucycpKTtcblxuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3Iuc2hvdyh2aWV3KTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnaW5kaWNhdG9yOnNob3cnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IuZW1wdHkoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnaW5kaWNhdG9yOmhpZGUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXJDb2xsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnYmVmb3JlOnJlbmRlcjpjb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCwgaSkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudCA9IHRoaXMuY3JlYXRlRXZlbnQobW9kZWwpO1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRWaWV3QnlEYXRlKGV2ZW50LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICBpZih2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcuYWRkRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdhZnRlcjpyZW5kZXI6Y29sbGVjdGlvbicpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZpZXdCeURhdGU6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgICAgIGlmKCFkYXRlIGluc3RhbmNlb2YgbW9tZW50KSB7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IG1vbWVudChkYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24od2VlaywgeCkge1xuICAgICAgICAgICAgICAgIHdlZWsuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihkYXksIHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF5LmdldERhdGUoKS5pc1NhbWUoZGF0ZSwgJ2RheScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihfLmlzTnVsbCh2aWV3KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBkYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gdmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRXZWVrTW9kZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBCYWNrYm9uZS5Nb2RlbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENhbGVuZGFySGVhZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERhdGUoKS5mb3JtYXQoJ01NTU0nKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDYWxlbmRhclN1YkhlYWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRlKCkueWVhcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENhbGVuZGFyV2VlazogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB3ZWVrcyA9IHRoaXMuZ2V0Q2FsZW5kYXJXZWVrcygpO1xuXG4gICAgICAgICAgICBpZih3ZWVrc1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla3NbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldENhbGVuZGFyV2Vla3M6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBkYXRlID0gZGF0ZSB8fCB0aGlzLmdldERhdGUoKTtcbiAgICAgICAgICAgIHZhciBzdGFydE9mVGhpc01vbnRoID0gZGF0ZS5jbG9uZSgpLnN0YXJ0T2YoJ21vbnRoJyk7XG4gICAgICAgICAgICB2YXIgZW5kT2ZUaGlzTW9udGggPSBkYXRlLmNsb25lKCkuZW5kT2YoJ21vbnRoJyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdhbHdheXNTaG93U2l4V2Vla3MnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmKHN0YXJ0T2ZUaGlzTW9udGguZGF5KCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRPZlRoaXNNb250aC5zdWJ0cmFjdCgxLCAnd2VlaycpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKGVuZE9mVGhpc01vbnRoLmRheSgpID09PSA2KSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZE9mVGhpc01vbnRoLmFkZCgxLCAnd2VlaycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVuZE9mVGhpc01vbnRoV2VlayA9IGVuZE9mVGhpc01vbnRoLmNsb25lKCk7XG5cbiAgICAgICAgICAgIGlmKCFlbmRPZlRoaXNNb250aC5jbG9uZSgpLmVuZE9mKCd3ZWVrJykuaXNTYW1lKHN0YXJ0T2ZUaGlzTW9udGgsICdtb250aCcpKSB7XG4gICAgICAgICAgICAgICAgZW5kT2ZUaGlzTW9udGhXZWVrLmVuZE9mKCd3ZWVrJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0b3RhbERheXNJbk1vbnRoID0gZGF0ZS5kYXlzSW5Nb250aCgpO1xuICAgICAgICAgICAgdmFyIHRvdGFsRGF5c0luQ2FsZW5kYXIgPSBlbmRPZlRoaXNNb250aFdlZWsuZGlmZihzdGFydE9mVGhpc01vbnRoLCAnZGF5cycpO1xuICAgICAgICAgICAgdmFyIHRvdGFsV2Vla3NJbkNhbGVuZGFyID0gTWF0aC5jZWlsKHRvdGFsRGF5c0luQ2FsZW5kYXIgLyA3KTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2Fsd2F5c1Nob3dTaXhXZWVrcycpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYodG90YWxXZWVrc0luQ2FsZW5kYXIgPCA2KSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZE9mVGhpc01vbnRoV2Vlay5hZGQoNiAtIHRvdGFsV2Vla3NJbkNhbGVuZGFyLCAnd2VlaycpO1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFdlZWtzSW5DYWxlbmRhciArPSA2IC0gdG90YWxXZWVrc0luQ2FsZW5kYXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgd2Vla3MgPSBbXTtcblxuICAgICAgICAgICAgZm9yKHZhciB4ID0gMDsgeCA8IHRvdGFsV2Vla3NJbkNhbGVuZGFyOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF5cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yKHZhciB5ID0gMDsgeSA8IDc7IHkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBzdGFydE9mVGhpc01vbnRoXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xvbmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZCh4LCAnd2VlaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3RhcnRPZignd2VlaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkKHksICdkYXknKTtcblxuICAgICAgICAgICAgICAgICAgICBkYXlzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZTogc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXk6IHN0YXJ0LmRhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoOiBzdGFydC5tb250aCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgeWVhcjogc3RhcnQueWVhcigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudERhdGU6IGRhdGVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2Vla3MucHVzaChkYXlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHdlZWtzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFdlZWtzSW5Nb250aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMuZ2V0RGF0ZSgpLmRheXNJbk1vbnRoKCkgLyA3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRGaXJzdERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uZmlyc3QoKS5nZXRGaXJzdERhdGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMYXN0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5sYXN0KCkuZ2V0TGFzdERhdGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignZGF0ZScpIHx8IG1vbWVudCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldERhdGU6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgICAgIGlmKCFkYXRlIGluc3RhbmNlb2YgbW9tZW50KSB7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IG1vbWVudChkYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHByZXZEYXRlID0gdGhpcy5nZXREYXRlKCk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5kYXRlID0gZGF0ZTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZGF0ZTpzZXQnLCBkYXRlLCBwcmV2RGF0ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EYXRlU2V0OiBmdW5jdGlvbihuZXdEYXRlLCBwcmV2RGF0ZSkge1xuICAgICAgICAgICAgaWYoIW5ld0RhdGUuaXNTYW1lKHByZXZEYXRlLCAnbW9udGgnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFZpZXdCeURhdGUocHJldkRhdGUpLiRlbC5yZW1vdmVDbGFzcygnY2FsZW5kYXItY3VycmVudC1kYXknKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFZpZXdCeURhdGUobmV3RGF0ZSkuJGVsLmFkZENsYXNzKCdjYWxlbmRhci1jdXJyZW50LWRheScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmlldyA9IHRoaXMuZ2V0Vmlld0J5RGF0ZShuZXdEYXRlKTtcbiAgICAgICAgICAgIHZhciBldmVudHMgPSB2aWV3Lm1vZGVsLmdldCgnZXZlbnRzJyk7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2hvdzpldmVudHMnLCB2aWV3LCBldmVudHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFByZXZEYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERhdGUoKS5jbG9uZSgpLnN1YnRyYWN0KDEsICdtb250aCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldE5leHREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERhdGUoKS5jbG9uZSgpLmFkZCgxLCAnbW9udGgnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwcmV2OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0ZSh0aGlzLmdldFByZXZEYXRlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKHRoaXMuZ2V0TmV4dERhdGUoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25QcmV2Q2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5wcmV2KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25OZXh0Q2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0NvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXy5lYWNoKHRoaXMuZ2V0Q2FsZW5kYXJXZWVrcygpLCBmdW5jdGlvbih3ZWVrLCBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLmdldFdlZWtNb2RlbCgpLCB0aGlzLmdldENoaWxkVmlldygpLCBpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXJDaGlsZHJlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lFbXB0eVZpZXcoKTtcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveUNoaWxkcmVuKCk7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0QnVmZmVyaW5nKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dDb2xsZWN0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmVuZEJ1ZmZlcmluZygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIE11c3Qgb3ZlcnJpZGUgY29yZSBtZXRob2QgdG8gZG8gbm90aGluZ1xuICAgICAgICBfaW5pdGlhbEV2ZW50czogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5JbmxpbmVFZGl0b3IgPSBUb29sYm94LkxheW91dFZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnaW5saW5lLWVkaXRvcicpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ2lubGluZS1lZGl0b3Itd3JhcHBlcicsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBhdHRyaWJ1dGUgaW4gdGhlIG1vZGVsIHRvIGVkaXRcbiAgICAgICAgICAgIGF0dHJpYnV0ZTogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBmb3JtIGlucHV0IHZpZXcgb2JqZWN0XG4gICAgICAgICAgICBmb3JtSW5wdXRWaWV3OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG9iamVjdCkgVGhlIGZvcm0gaW5wdXQgdmlldyBvYmplY3Qgb3B0aW9uc1xuICAgICAgICAgICAgZm9ybUlucHV0Vmlld09wdGlvbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoc3J0aW5nKSBUaGUgY2xhc3MgbmFtZSB0byBhZGQgdG8gdGhlIGZpZWxkIHdoaWxlIGl0IGlzIGJlaW5nIGVkaXR0ZWQuXG4gICAgICAgICAgICBlZGl0dGluZ0NsYXNzTmFtZTogJ2lubGluZS1lZGl0b3ItZWRpdHRpbmcnLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgQWxsb3cgdGhlIGZpZWxkIHRvIGhhdmUgYSBudWxsIHZhbHVlXG4gICAgICAgICAgICBhbGxvd051bGw6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUga2V5Y29kZSB0byBzYXZlIHRoZSBmaWVsZCBkYXRhXG4gICAgICAgICAgICBzYXZlS2V5Y29kZTogMTMsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBrZXljb2RlIHRvIGNhbmNlbCB0aGUgZmllbGQgZGF0YVxuICAgICAgICAgICAgY2FuY2VsS2V5Y29kZTogMjcsXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgaW5wdXQ6ICcuaW5saW5lLWVkaXRvci1maWVsZCcsXG4gICAgICAgICAgICBpbmRpY2F0b3I6ICcuaW5saW5lLWVkaXRvci1hY3Rpdml0eS1pbmRpY2F0b3InXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayAuaW5saW5lLWVkaXRvci1sYWJlbCc6ICdsYWJlbDpjbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVGb3JtSW5wdXRWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcywgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdmb3JtSW5wdXRWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guSW5wdXRGaWVsZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdhdHRyaWJ1dGUnKSksXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0T3B0aW9uKCdmb3JtSW5wdXRWaWV3T3B0aW9ucycpKTtcblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhvcHRpb25zKTtcblxuICAgICAgICAgICAgdmlldy5vbignYmx1cicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuYmx1cigpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZpZXcuJGVsLm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZihlLmtleUNvZGUgPT09IHQuZ2V0T3B0aW9uKCdzYXZlS2V5Y29kZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHQuZ2V0T3B0aW9uKCdhbGxvd051bGwnKSB8fCAhdC5nZXRPcHRpb24oJ2FsbG93TnVsbCcpICYmICF0LmlzTnVsbCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LmJsdXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmlldy4kZWwub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IHQuZ2V0T3B0aW9uKCdjYW5jZWxLZXljb2RlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd0FjdGl2aXR5SW5kaWNhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3Ioe1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3RpbnknXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3Iuc2hvdyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IuZW1wdHkoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc051bGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRWYWx1ZSgpID09PSAnJyA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRMYWJlbEh0bWw6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5pbmxpbmUtZWRpdG9yLWxhYmVsJykuaHRtbChodG1sKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1vZGVsVmFsdWUoKSAhPT0gdGhpcy5nZXRJbnB1dFZhbHVlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FuY2VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjYW5jZWwnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBibHVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuaGFzQ2hhbmdlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZWRpdHRpbmdDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnYmx1cicpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdlZGl0dGluZ0NsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuY3VycmVudFZpZXcuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZm9jdXMnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRNb2RlbFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignYXR0cmlidXRlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQuY3VycmVudFZpZXcuZ2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEZvcm1EYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0T3B0aW9uKCdhdHRyaWJ1dGUnKTtcblxuICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHRoaXMuZ2V0SW5wdXRWYWx1ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TGFiZWxIdG1sKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkJlZm9yZVNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaG93QWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkFmdGVyU2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVBY3Rpdml0eUluZGljYXRvcigpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignYWxsb3dOdWxsJykgfHwgIXRoaXMuZ2V0T3B0aW9uKCdhbGxvd051bGwnKSAmJiAhdGhpcy5pc051bGwoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdiZWZvcmU6c2F2ZScpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlKHRoaXMuZ2V0Rm9ybURhdGEoKSwge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihtb2RlbCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnc2F2ZTpzdWNjZXNzJywgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnYWZ0ZXI6c2F2ZScsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2NoYW5nZScsIHQuZ2V0SW5wdXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKG1vZGVsLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzYXZlOmVycm9yJywgbW9kZWwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnYWZ0ZXI6c2F2ZScsIG1vZGVsLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlJywgdGhpcy5nZXRJbnB1dFZhbHVlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uTGFiZWxDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRMYWJlbEh0bWwodGhpcy5nZXRNb2RlbFZhbHVlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNob3codGhpcy5jcmVhdGVGb3JtSW5wdXRWaWV3KCkpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guSW5wdXRGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0taW5wdXQtZmllbGQnKSxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCdcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5MaWdodFN3aXRjaEZpZWxkID0gVG9vbGJveC5CYXNlRmllbGQuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnZm9ybS1saWdodC1zd2l0Y2gtZmllbGQnKSxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB2YWx1ZTogMCxcblxuICAgICAgICAgICAgYWN0aXZlQ2xhc3NOYW1lOiAnb24nLFxuXG4gICAgICAgICAgICBvblZhbHVlOiAxLFxuXG4gICAgICAgICAgICBvZmZWYWx1ZTogMCxcblxuICAgICAgICAgICAgdHJpZ2dlclNlbGVjdG9yOiAnLmxpZ2h0LXN3aXRjaCcsXG5cbiAgICAgICAgICAgIGlucHV0Q2xhc3NOYW1lOiAnbGlnaHQtc3dpdGNoJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmxpZ2h0LXN3aXRjaC1jb250YWluZXInOiAnY2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAna2V5dXAnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmdldE9wdGlvbignb2ZmVmFsdWUnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5nZXRPcHRpb24oJ29uVmFsdWUnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkJhc2VGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMudmFsdWUgPT09IGZhbHNlIHx8IF8uaXNOYU4odGhpcy5vcHRpb25zLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy52YWx1ZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMuZ2V0T3B0aW9uKCd2YWx1ZScpKSA9PT0gMTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5nZXRJbnB1dEZpZWxkKCkudmFsKHZhbHVlKTtcblxuICAgICAgICAgICAgaWYodGhpcy5pc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVDbGFzcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBY3RpdmVDbGFzcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NoYW5nZScsIHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMaWdodFN3aXRjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZCgnLmxpZ2h0LXN3aXRjaCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmdldExpZ2h0U3dpdGNoKCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcubGlnaHQtc3dpdGNoLWNvbnRhaW5lcicpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICdtYXJnaW4tbGVmdCc6IDBcbiAgICAgICAgICAgIH0sIDEwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC5nZXRMaWdodFN3aXRjaCgpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0LmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0LmdldE9wdGlvbignZHJhZ2dpbmdDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVBY3RpdmVDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0TGlnaHRTd2l0Y2goKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZHJhZ2dpbmdDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5saWdodC1zd2l0Y2gtY29udGFpbmVyJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgJ21hcmdpbi1sZWZ0JzogLTExXG4gICAgICAgICAgICB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuZ2V0TGlnaHRTd2l0Y2goKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModC5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModC5nZXRPcHRpb24oJ2RyYWdnaW5nQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmlzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFZhbHVlKHRoaXMuZ2V0T3B0aW9uKCdvblZhbHVlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmdldE9wdGlvbignb2ZmVmFsdWUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpc1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5Ob0xpc3RHcm91cEl0ZW0gPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnbm8tbGlzdC1ncm91cC1pdGVtJyksXG5cblx0XHRjbGFzc05hbWU6ICdsaXN0LWdyb3VwLWl0ZW0nLFxuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHRtZXNzYWdlOiAnVGhlcmUgYXJlIG5vIGl0ZW1zIGluIHRoZSBsaXN0Lidcblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnM7XG5cdFx0fVxuXG5cdH0pO1xuXG5cdFRvb2xib3guTGlzdEdyb3VwSXRlbSA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdsaXN0LWdyb3VwLWl0ZW0nKSxcblxuXHRcdGNsYXNzTmFtZTogJ2xpc3QtZ3JvdXAtaXRlbScsXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBiYWRnZUF0dHJpYnV0ZTogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50QXR0cmlidXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGVkaXRGb3JtQ2xhc3M6IGZhbHNlLFxuICAgICAgICAgICAgZGVsZXRlRm9ybUNsYXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVkaXRCdXR0b246IHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4gYnRuLXdhcm5pbmcgYnRuLXhzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxuICAgICAgICAgICAgICAgIGljb246ICdmYSBmYS1lZGl0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWxldGVCdXR0b246IHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdidG4gYnRuLWRhbmdlciBidG4teHMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtdHJhc2gtbycsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZihlLnRhcmdldCA9PSB0aGlzLiRlbC5nZXQoMCkpIHtcbiAgICBcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2snLCBlKTtcbiAgICAgICAgICAgICAgICB9XG5cdFx0XHR9LFxuICAgICAgICAgICAgJ2NsaWNrIC5lZGl0LWl0ZW0nOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCdjbGljazplZGl0JywgZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NsaWNrIC5kZWxldGUtaXRlbSc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmRlbGV0ZScsIGUpO1xuICAgICAgICAgICAgfVxuXHRcdH0sXG5cbiAgICAgICAgZ2V0QmFkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdiYWRnZUF0dHJpYnV0ZScpID9cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmdldCh0aGlzLmdldE9wdGlvbignYmFkZ2VBdHRyaWJ1dGUnKSkgOlxuICAgICAgICAgICAgICAgIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50QXR0cmlidXRlJykgP1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0KHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50QXR0cmlidXRlJykpIDpcbiAgICAgICAgICAgICAgICBmYWxzZTtcbiAgICAgICAgfSxcblxuXHRcdHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYmFkZ2UsIGNvbnRlbnQsIGhlbHBlciA9IF8uZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBoYXNFZGl0Rm9ybTogdGhpcy5nZXRPcHRpb24oJ2VkaXRGb3JtQ2xhc3MnKSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBoYXNEZWxldGVGb3JtOiB0aGlzLmdldE9wdGlvbignZGVsZXRlRm9ybUNsYXNzJykgPyB0cnVlIDogZmFsc2VcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmKGJhZGdlID0gdGhpcy5nZXRCYWRnZSgpKSB7XG4gICAgICAgICAgICAgICAgaGVscGVyLmJhZGdlID0gYmFkZ2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKSkge1xuICAgICAgICAgICAgICAgIGhlbHBlci5jb250ZW50ID0gY29udGVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGhlbHBlcjtcblx0XHR9LFxuXG4gICAgICAgIG9uQ2xpY2tFZGl0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdlZGl0Rm9ybUNsYXNzJyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZpZXcub24oJ3N1Ym1pdDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgICAgIHZhciBtb2RhbCA9IG5ldyBUb29sYm94Lk1vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFZpZXc6IHZpZXdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIG1vZGFsLnNob3coKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2hvdzplZGl0JywgbW9kYWwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGlja0RlbGV0ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZGVsZXRlRm9ybUNsYXNzJyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZpZXcub24oJ3N1Ym1pdDpzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBtb2RhbCA9IG5ldyBUb29sYm94Lk1vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFZpZXc6IHZpZXdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIG1vZGFsLnNob3coKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnc2hvdzpkZWxldGUnLCBtb2RhbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG5cdH0pO1xuXG5cdFRvb2xib3guTGlzdEdyb3VwID0gVG9vbGJveC5Db2xsZWN0aW9uVmlldy5leHRlbmQoe1xuXG5cdFx0Y2hpbGRWaWV3OiBUb29sYm94Lkxpc3RHcm91cEl0ZW0sXG5cblx0XHRjbGFzc05hbWU6ICdsaXN0LWdyb3VwJyxcblxuXHRcdHRhZ05hbWU6ICd1bCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKGJvb2wpIEFjdGl2YXRlIGxpc3QgaXRlbSBvbiBjbGlja1xuXHRcdFx0YWN0aXZhdGVPbkNsaWNrOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgQWN0aXZlIGNsYXNzIG5hbWVcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIGxpc3QgaXRlbXNcblx0XHRcdGVtcHR5TWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nLFxuXG5cdFx0XHQvLyAob2JqZWN0KSBUaGUgdmlldyBvYmplY3QgdG8gdXNlIGZvciB0aGUgZW1wdHkgbWVzc2FnZVxuXHRcdFx0ZW1wdHlNZXNzYWdlVmlldzogVG9vbGJveC5Ob0xpc3RHcm91cEl0ZW0sXG5cblx0XHRcdC8vIChib29sKSBTaG93IHRoZSBlbXB0eSBtZXNzYWdlIHZpZXdcblx0XHRcdHNob3dFbXB0eU1lc3NhZ2U6IHRydWUsXG5cdFx0fSxcblxuXHRcdGNoaWxkRXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3LCBlKSB7XG5cdFx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmF0ZU9uQ2xpY2snKSkge1xuXHRcdFx0XHRcdGlmKHZpZXcuJGVsLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSkpIHtcblx0XHRcdFx0XHRcdHZpZXcuJGVsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0dmlldy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuXHRcdFx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCdhY3RpdmF0ZScsIHZpZXcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcsIGUpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgZ2V0RW1wdHlWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZih0aGlzLmdldE9wdGlvbignc2hvd0VtcHR5TWVzc2FnZScpKSB7XG5cdCAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZVZpZXcnKTtcblxuXHQgICAgICAgICAgICBWaWV3ID0gVmlldy5leHRlbmQoe1xuXHQgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuXHQgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2UnKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICByZXR1cm4gVmlldztcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKCQsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJykpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94Lk1vZGFsID0gVG9vbGJveC5MYXlvdXRWaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ21vZGFsLXdpbmRvdycpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ21vZGFsLXdpbmRvdy13cmFwcGVyJyxcblxuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBjb250ZW50OiAnLm1vZGFsLWNvbnRlbnQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayAubW9kYWwtY2xvc2UnOiAnY2xvc2U6Y2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQW4gYXJyYXkgb2YgYnV0dG9uIG9iamVjdHMgdG8gYWRkIHRvIHRoZSBtb2RhbCB3aW5kb3dcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbW9kYWwgd2luZG93IGhlYWRlciB0ZXh0XG4gICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB1c2VkIGZvciB0aGUgbW9kYWwgYW5pbWF0aW9uXG4gICAgICAgICAgICBjbG9zZUFuaW1hdGlvblJhdGU6IDUwMFxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5tb2RhbC1idXR0b25zIGEnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ1dHRvbnMgPSB0aGlzLmdldE9wdGlvbignYnV0dG9ucycpO1xuICAgICAgICAgICAgICAgIHZhciBpID0gJChlLnRhcmdldCkuaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKF8uaXNBcnJheShidXR0b25zKSAmJiBidXR0b25zW2ldLm9uQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5vbkNsaWNrLmNhbGwodGhpcywgJChlLnRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDb250ZW50VmlldzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdGhpcy5zZXRDb250ZW50Vmlldyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb250ZW50VmlldzogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNob3codmlldyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGVudFZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50VmlldycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCB2aWV3ID0gdGhpcy5nZXRDb250ZW50VmlldygpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdjYW5jZWw6Y2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LmhpZGUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJGVsKTtcblxuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNob3codmlldyk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC4kZWwuYWRkQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc2hvdycpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQuJGVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ2Nsb3NlQW5pbWF0aW9uUmF0ZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsb3NlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZ1bmN0aW9uKCQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgJCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guTm90aWZpY2F0aW9uID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0Y2xhc3NOYW1lOiAnbm90aWZpY2F0aW9uIGNsZWFyZml4JyxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoaW50KSBUaGUgZmx5LW91dCBhbmltYXRpb24gcmF0ZSBpbiBtaWxsaXNlY29uZHNcblx0XHRcdGFuaW1hdGlvbjogNTAwLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgY2xvc2UgY2xhc3MgbmFtZVxuXHRcdFx0Y2xvc2VDbGFzc05hbWU6ICdjbG9zZScsXG5cblx0XHRcdC8vIChpbnQpIENsb3NlIGFmdGVyIGEgZGVsYXkgaW4gbWlsbGVjb25kcy4gUGFzcyBmYWxzZSB0byBub3QgY2xvc2Vcblx0XHRcdGNsb3NlT25EZWxheTogNDAwMCxcblxuXHRcdFx0Ly8gKGJvb2wpIENsb3NlIHRoZSBub3RpZmljYXRpb24gd2hlbiBjbGlja2VkIGFueXdoZXJlXG5cdFx0XHRjbG9zZU9uQ2xpY2s6IHRydWUsXG5cblx0XHRcdC8vIChib29sKSBUaGUgaWNvbiBjbGFzcyB1c2VkIGluIHRoZSBhbGVydFxuXHRcdFx0aWNvbjogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmd8ZmFsc2UpIFRoZSBub3RpZmljYXRpb24gbWVzc2FnZVxuXHRcdFx0bWVzc2FnZTogZmFsc2UsXG5cblx0XHRcdC8vIChzdHJpbmd8ZmFsc2UpIFRoZSBub3RpZmljYXRpb24gdGl0bGVcblx0XHRcdHRpdGxlOiBmYWxzZSxcblxuXHRcdFx0Ly8gKHN0cmluZykgVHlwZSBvZiBub3RpZmljYXRpb24gKGFsZXJ0fHdhcm5pbmd8c3VjY2Vzcylcblx0XHRcdHR5cGU6ICdhbGVydCcsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBjbGFzcyBuYW1lIHRoYXQgbWFrZXMgdGhlIG5vdGlmaWNhdGlvbiB2aXNpYmxlXG5cdFx0XHR2aXNpYmxlQ2xhc3NOYW1lOiAndmlzaWJsZScsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBjbGFzcyBuYW1lIHRoYXQgaXMgdXNlZCBpbiB0aGUgd3JhcHBlciB0byB3aGljaFxuXHRcdFx0Ly8gbm90aWZpY2F0aW9uIGFyZSBhcHBlbmRlZFxuXHRcdFx0d3JhcHBlckNsYXNzTmFtZTogJ25vdGlmaWNhdGlvbnMnXG5cdFx0fSxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdub3RpZmljYXRpb24nKSxcblxuXHRcdG1vZGVsOiBmYWxzZSxcblxuXHRcdHRyaWdnZXJzOiB7XG5cdFx0XHQnY2xpY2snOiAnY2xpY2snLFxuXHRcdFx0J2NsaWNrIC5jbG9zZSc6ICdjbG9zZTpjbGljaydcblx0XHR9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0b25DbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbignY2xvc2VPbkNsaWNrJykpIHtcblx0XHRcdFx0dGhpcy5oaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uQ2xvc2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmhpZGUoKTtcblx0XHR9LFxuXG5cdFx0aXNWaXNpYmxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLiRlbC5oYXNDbGFzcyh0aGlzLmdldE9wdGlvbigndmlzaWJsZUNsYXNzTmFtZScpKTtcblx0XHR9LFxuXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdCA9IHRoaXM7XG5cblx0XHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCd2aXNpYmxlQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0LiRlbC5yZW1vdmUoKTtcblx0XHRcdH0sIHRoaXMuZ2V0T3B0aW9uKCdhbmltYXRpb24nKSk7XG5cblx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaGlkZScpO1xuXHRcdH0sXG5cblx0XHRjcmVhdGVOb3RpZmljYXRpb25zRG9tV3JhcHBlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgJHdyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwiJyt0aGlzLmdldE9wdGlvbignd3JhcHBlckNsYXNzTmFtZScpKydcIiAvPicpO1xuXG5cdFx0XHQkKCdib2R5JykuYXBwZW5kKCR3cmFwcGVyKTtcblxuXHRcdFx0cmV0dXJuICR3cmFwcGVyO1xuXHRcdH0sXG5cblx0XHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciB0ID0gdGhpcywgJHdyYXBwZXIgPSAkKCdib2R5JykuZmluZCgnLicgKyB0aGlzLmdldE9wdGlvbignd3JhcHBlckNsYXNzTmFtZScpKTtcblxuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblxuXHRcdFx0aWYoISR3cmFwcGVyLmxlbmd0aCkge1xuXHRcdFx0XHQkd3JhcHBlciA9IHRoaXMuY3JlYXRlTm90aWZpY2F0aW9uc0RvbVdyYXBwZXIoKTtcblx0XHRcdH1cblxuXHRcdFx0JHdyYXBwZXIuYXBwZW5kKHRoaXMuJGVsKTtcblxuXHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ3R5cGUnKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHQuJGVsLmFkZENsYXNzKHQuZ2V0T3B0aW9uKCd2aXNpYmxlQ2xhc3NOYW1lJykpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdjbG9zZU9uRGVsYXknKSAhPT0gZmFsc2UpIHtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZih0LmlzVmlzaWJsZSgpKSB7XG5cdFx0XHRcdFx0XHR0LmhpZGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHRoaXMuZ2V0T3B0aW9uKCdjbG9zZU9uRGVsYXknKSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnc2hvdycpO1xuXHRcdH1cblxuXHR9KTtcblxuXHRyZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94Lk5vT3JkZXJlZExpc3RJdGVtID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ25vLW9yZGVyZWQtbGlzdC1pdGVtJyksXG5cblx0XHR0YWdOYW1lOiAnbGknLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdG1lc3NhZ2U6ICdUaGVyZSBhcmUgbm8gaXRlbXMgaW4gdGhlIGxpc3QuJ1xuXHRcdH0sXG5cblx0XHR0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9ucztcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5PcmRlcmVkTGlzdEl0ZW0gPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnb3JkZXJlZC1saXN0LWl0ZW0nKSxcblxuXHRcdGNsYXNzTmFtZTogJ29yZGVyZWQtbGlzdC1pdGVtJyxcblxuXHRcdHRhZ05hbWU6ICdsaScsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayc6IGZ1bmN0aW9uKGUsIG9iaikge1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrJywgb2JqKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNcblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5PcmRlcmVkTGlzdCA9IFRvb2xib3guQ29sbGVjdGlvblZpZXcuZXh0ZW5kKHtcblxuXHRcdGNoaWxkVmlldzogVG9vbGJveC5PcmRlcmVkTGlzdEl0ZW0sXG5cbiAgICBcdGVtcHR5VmlldzogVG9vbGJveC5Ob1Vub3JkZXJlZExpc3RJdGVtLFxuXG5cdFx0Y2xhc3NOYW1lOiAnb3JkZXJlZC1saXN0JyxcblxuXHRcdHRhZ05hbWU6ICdvbCcsXG5cblx0XHRkZWZhdWx0T3B0aW9uczoge1xuXHRcdFx0Ly8gKG9iamVjdCkgVGhlIHZpZXcgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGVtcHR5IG1lc3NhZ2Vcblx0XHRcdGVtcHR5TWVzc2FnZVZpZXc6IFRvb2xib3guTm9PcmRlcmVkTGlzdEl0ZW0sXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlcmUgYXJlIG5vIGxpc3QgaXRlbXNcblx0XHRcdGVtcHR5TWVzc2FnZTogJ1RoZXJlIGFyZSBubyBpdGVtcyBpbiB0aGUgbGlzdC4nLFxuXG5cdFx0XHQvLyAoYm9vbCkgU2hvdyB0aGUgZW1wdHkgbWVzc2FnZSB2aWV3XG5cdFx0XHRzaG93RW1wdHlNZXNzYWdlOiB0cnVlXG5cdFx0fSxcblxuXHRcdGNoaWxkRXZlbnRzOiB7XG5cdFx0XHQnY2xpY2snOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnaXRlbTpjbGljaycsIHZpZXcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgZ2V0RW1wdHlWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZih0aGlzLmdldE9wdGlvbignc2hvd0VtcHR5TWVzc2FnZScpKSB7XG5cdCAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZVZpZXcnKTtcblxuXHQgICAgICAgICAgICBWaWV3ID0gVmlldy5leHRlbmQoe1xuXHQgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuXHQgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuZ2V0T3B0aW9uKCdlbXB0eU1lc3NhZ2UnKVxuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICByZXR1cm4gVmlldztcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guUGFnZXIgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncGFnZXInKSxcblxuXHRcdHRhZ05hbWU6ICduYXYnLFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayAubmV4dC1wYWdlJzogJ25leHQ6cGFnZTpjbGljaycsXG5cdFx0XHQnY2xpY2sgLnByZXYtcGFnZSc6ICdwcmV2OnBhZ2U6Y2xpY2snXG5cdFx0fSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgcGFnZXIgY2xhc3MgbmFtZVxuXHRcdFx0cGFnZXJDbGFzc05hbWU6ICdwYWdlcicsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBhY3RpdmUgY2xhc3MgbmFtZVxuXHRcdFx0YWN0aXZlQ2xhc3NOYW1lOiAnYWN0aXZlJyxcblxuXHRcdFx0Ly8gKHN0cmluZykgVGhlIGRpc2FibGVkIGNsYXNzIG5hbWVcblx0XHRcdGRpc2FibGVkQ2xhc3NOYW1lOiAnZGlzYWJsZWQnLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgcHJldmlvdXMgYnV0dG9uIGNsYXNzIG5hbWVcblx0XHRcdHByZXZDbGFzc05hbWU6ICdwcmV2aW91cycsXG5cblx0XHRcdC8vIChzdHJpbmcpIFRoZSBuZXh0IGJ1dHRvbiBjbGFzcyBuYW1lXG5cdFx0XHRuZXh0Q2xhc3NOYW1lOiAnbmV4dCcsXG5cblx0XHRcdC8vIChib29sKSBJbmNsdWRlIHRoZSBwYWdlIHRvdGFscyBiZXR3ZWVuIHRoZSBwYWdlciBidXR0b25zXG5cdFx0XHRpbmNsdWRlUGFnZVRvdGFsczogdHJ1ZSxcblxuXHRcdFx0Ly8gKGJvb2wpIEFsaWduIHBhZ2VyIGJ1dHRzb24gdG8gbGVmdCBhbmQgcmlnaHQgZWRnZVxuXHRcdFx0c25hcFRvRWRnZXM6IHRydWUsXG5cblx0XHRcdC8vIChpbnQpIFRoZSBjdXJyZW50IHBhZ2UgbnVtYmVyXG5cdFx0XHRwYWdlOiAxLFxuXG5cdFx0XHQvLyAoaW50KSBUaGUgdG90YWwgbnVtYmVyIG9mIHBhZ2VzXG5cdFx0XHR0b3RhbFBhZ2VzOiAxLFxuXG5cdFx0XHQvLyAoc3RyaW5nKSBOZXh0IGJ1dHRvbiBsYWJlbFxuXHRcdFx0bmV4dExhYmVsOiAnTmV4dCcsXG5cblx0XHRcdC8vIChzdHJpbmcpIFByZXZpb3VzIGJ1dHRvbiBsYWJlbFxuXHRcdFx0cHJldkxhYmVsOiAnUHJldmlvdXMnXG5cdFx0fSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdG5leHRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHRcdHZhciB0b3RhbCA9IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFBhZ2VzJyk7XG5cblx0XHRcdGlmKHBhZ2UgPCB0b3RhbCkge1xuXHRcdFx0XHRwYWdlKys7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25OZXh0UGFnZUNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubmV4dFBhZ2UoKTtcblx0XHR9LFxuXG5cdFx0cHJldlBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXG5cdFx0XHRpZihwYWdlID4gMSkge1xuXHRcdFx0XHRwYWdlLS07XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0QWN0aXZlUGFnZShwYWdlKTtcblx0XHR9LFxuXG5cdFx0b25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHRpZih0aGlzLmdldE9wdGlvbigncGFnZScpID09IDEpIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCgnLnByZXYtcGFnZScpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5uZXh0LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uUHJldlBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0fSxcblxuXHRcdHNldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3BhZ2luYXRlJywgcGFnZSk7XG5cdFx0fSxcblxuXHRcdGdldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ2JhY2tib25lJ10sIGZ1bmN0aW9uKCQsIEJhY2tib25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgQmFja2JvbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgnYmFja2JvbmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5CYWNrYm9uZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgQmFja2JvbmUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LlBhZ2luYXRpb25JdGVtID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGFnTmFtZTogJ2xpJyxcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdwYWdpbmF0aW9uLWl0ZW0nKSxcblxuXHRcdGRlZmF1bHRPcHRpb25zOiB7XG5cdFx0XHQvLyAoc3RyaW5nKSBUaGUgYWN0aXZlIHBhZ2UgY2xhc3MgbmFtZVxuXHRcdFx0ZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCdcblx0XHR9LFxuXG5cdFx0dHJpZ2dlcnM6IHtcblx0XHRcdCdjbGljayBhJzogJ2NsaWNrJ1xuXHRcdH0sXG5cblx0XHRvblJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCgnZGl2aWRlcicpID09PSB0cnVlKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG5cblx0VG9vbGJveC5QYWdpbmF0aW9uID0gVG9vbGJveC5Db21wb3NpdGVWaWV3LmV4dGVuZCh7XG5cblx0XHRjaGlsZFZpZXdDb250YWluZXI6ICd1bCcsXG5cblx0XHRjaGlsZFZpZXc6IFRvb2xib3guUGFnaW5hdGlvbkl0ZW0sXG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgncGFnaW5hdGlvbicpLFxuXG5cdFx0dGFnTmFtZTogJ25hdicsXG5cblx0XHRjaGlsZEV2ZW50czoge1xuXHRcdFx0J3BhZ2U6bmV4dCc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLm5leHRQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J3BhZ2U6cHJldic6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLnByZXZQYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0J2NsaWNrJzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHRpZighdmlldy4kZWwuaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXRBY3RpdmVQYWdlKHZpZXcubW9kZWwuZ2V0KCdwYWdlJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIC5uZXh0LXBhZ2UnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5uZXh0UGFnZSgpO1xuXHRcdFx0fSxcblx0XHRcdCdjbGljayAucHJldi1wYWdlJzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMucHJldlBhZ2UoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdHBhZ2luYXRpb25DbGFzc05hbWU6ICdwYWdpbmF0aW9uJyxcblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cdFx0XHRkaXNhYmxlZENsYXNzTmFtZTogJ2Rpc2FibGVkJyxcblx0XHRcdHRvdGFsUGFnZXM6IDEsXG5cdFx0XHRzaG93UGFnZXM6IDYsXG5cdFx0XHRwYWdlOiAxXG5cdFx0fSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0VG9vbGJveC5Db21wb3NpdGVWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuICAgICAgICAgICAgfVxuXHRcdH0sXG5cblx0XHRhdHRhY2hCdWZmZXI6IGZ1bmN0aW9uKGNvbGxlY3Rpb25WaWV3LCBidWZmZXIpIHtcblx0XHRcdCQoYnVmZmVyKS5pbnNlcnRBZnRlcihjb2xsZWN0aW9uVmlldy4kZWwuZmluZCgnbGk6Zmlyc3QtY2hpbGQnKSk7XG5cdFx0fSxcblxuXHRcdG9uQmVmb3JlUmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuXG5cdFx0XHR2YXIgY3VycmVudFBhZ2UgPSB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdFx0dmFyIHRvdGFsUGFnZXMgPSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpO1xuXHRcdFx0dmFyIHNob3dQYWdlcyA9IHRoaXMuZ2V0T3B0aW9uKCdzaG93UGFnZXMnKTtcblxuXHRcdFx0aWYoc2hvd1BhZ2VzICUgMikge1xuXHRcdFx0XHRzaG93UGFnZXMrKzsgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlclxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3RhcnRQYWdlID0gKGN1cnJlbnRQYWdlIDwgc2hvd1BhZ2VzKSA/IDEgOiBjdXJyZW50UGFnZSAtIChzaG93UGFnZXMgLyAyKTtcblxuXHRcdFx0dmFyIGVuZFBhZ2UgPSBzaG93UGFnZXMgKyBzdGFydFBhZ2U7XG5cblx0XHRcdGVuZFBhZ2UgPSAodG90YWxQYWdlcyA8IGVuZFBhZ2UpID8gdG90YWxQYWdlcyA6IGVuZFBhZ2U7XG5cblx0XHRcdHZhciBkaWZmID0gc3RhcnRQYWdlIC0gZW5kUGFnZSArIHNob3dQYWdlcztcblxuXHRcdFx0c3RhcnRQYWdlIC09IChzdGFydFBhZ2UgLSBkaWZmID4gMCkgPyBkaWZmIDogMDtcblxuXHRcdFx0aWYgKHN0YXJ0UGFnZSA+IDEpIHtcblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZCh7cGFnZTogMX0pO1xuXG5cdFx0XHRcdGlmKHN0YXJ0UGFnZSA+IDIpIHtcblx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtkaXZpZGVyOiB0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Zm9yKHZhciBpID0gc3RhcnRQYWdlOyBpIDw9IGVuZFBhZ2U7IGkrKykge1xuXHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtwYWdlOiBpfSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xuXHRcdFx0XHRpZih0b3RhbFBhZ2VzIC0gMSA+IGVuZFBhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb24uYWRkKHtkaXZpZGVyOiB0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5jb2xsZWN0aW9uLmFkZCh7cGFnZTogdG90YWxQYWdlc30pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRuZXh0UGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyk7XG5cdFx0XHR2YXIgdG90YWwgPSB0aGlzLmdldE9wdGlvbigndG90YWxQYWdlcycpO1xuXG5cdFx0XHRpZihwYWdlIDwgdG90YWwpIHtcblx0XHRcdFx0cGFnZSsrO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldEFjdGl2ZVBhZ2UocGFnZSk7XG5cdFx0fSxcblxuXHRcdG9uTmV4dFBhZ2VDbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm5leHRQYWdlKCk7XG5cdFx0fSxcblxuXHRcdHByZXZQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYWdlID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblxuXHRcdFx0aWYocGFnZSA+IDEpIHtcblx0XHRcdFx0cGFnZS0tO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldEFjdGl2ZVBhZ2UocGFnZSk7XG5cdFx0fSxcblxuXHRcdG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCdbZGF0YS1wYWdlPVwiJyt0aGlzLmdldE9wdGlvbigncGFnZScpKydcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG5cdFx0XHR0aGlzLiRlbC5maW5kKCcucHJldi1wYWdlJykucGFyZW50KCkucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0dGhpcy4kZWwuZmluZCgnLm5leHQtcGFnZScpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcblxuXHRcdFx0aWYodGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSA9PSAxKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoJy5wcmV2LXBhZ2UnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHRoaXMuZ2V0T3B0aW9uKCdwYWdlJykgPT0gdGhpcy5nZXRPcHRpb24oJ3RvdGFsUGFnZXMnKSkge1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCcubmV4dC1wYWdlJykucGFyZW50KCkuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvblByZXZQYWdlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5wcmV2UGFnZSgpO1xuXHRcdH0sXG5cblx0XHRzZXRTaG93UGFnZXM6IGZ1bmN0aW9uKHNob3dQYWdlcykge1xuXHRcdFx0dGhpcy5vcHRpb25zLnNob3dQYWdlcyA9IHNob3dQYWdlcztcblx0XHR9LFxuXG5cdFx0Z2V0U2hvd1BhZ2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbignc2hvd1BhZ2VzJyk7XG5cdFx0fSxcblxuXHRcdHNldFRvdGFsUGFnZXM6IGZ1bmN0aW9uKHRvdGFsUGFnZXMpIHtcblx0XHRcdHRoaXMub3B0aW9ucy50b3RhbFBhZ2VzID0gdG90YWxQYWdlcztcblx0XHR9LFxuXG5cdFx0Z2V0VG90YWxQYWdlczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2dldFRvdGFsUGFnZXMnKTtcblx0XHR9LFxuXG5cdFx0c2V0UGFnZTogZnVuY3Rpb24ocGFnZSkge1xuXHRcdFx0dGhpcy5vcHRpb25zLnBhZ2UgPSBwYWdlO1xuXHRcdH0sXG5cblx0XHRnZXRQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE9wdGlvbigncGFnZScpO1xuXHRcdH0sXG5cblx0XHRzZXRQYWdpbmF0aW9uTGlua3M6IGZ1bmN0aW9uKHBhZ2UsIHRvdGFsUGFnZXMpIHtcblx0XHRcdHRoaXMuc2V0UGFnZShwYWdlKTtcblx0XHRcdHRoaXMuc2V0VG90YWxQYWdlcyh0b3RhbFBhZ2VzKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSxcblxuXHRcdHNldEFjdGl2ZVBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblx0XHRcdGlmKHRoaXMub3B0aW9ucy5wYWdlICE9IHBhZ2UpIHtcblx0XHRcdFx0dGhpcy5vcHRpb25zLnBhZ2UgPSBwYWdlO1xuXHRcdFx0XHR0aGlzLnJlbmRlcigpO1xuXG5cdFx0XHRcdHZhciBxdWVyeSA9IHRoaXMuY29sbGVjdGlvbi53aGVyZSh7cGFnZTogcGFnZX0pO1xuXG5cdFx0XHRcdGlmKHF1ZXJ5Lmxlbmd0aCkge1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgncGFnaW5hdGUnLCBwYWdlLCB0aGlzLmNoaWxkcmVuLmZpbmRCeU1vZGVsKHF1ZXJ5WzBdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0QWN0aXZlUGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3BhZ2UnKTtcblx0XHR9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LlByb2dyZXNzQmFyID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3Byb2dyZXNzLWJhcicpLFxuXG5cdFx0Y2xhc3NOYW1lOiAncHJvZ3Jlc3MnLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdC8vIChzdHJpbmcpIFRoZSBwcm9ncmVzcyBiYXIgY2xhc3MgbmFtZVxuXHRcdFx0cHJvZ3Jlc3NCYXJDbGFzc05hbWU6ICdwcm9ncmVzcy1iYXInLFxuXG5cdFx0XHQvLyAoaW50KSBUaGUgcHJvZ3Jlc3MgcGVyY2VudGFnZVxuXHRcdFx0cHJvZ3Jlc3M6IDBcblx0XHR9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9LFxuXG5cdFx0c2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uKHByb2dyZXNzKSB7XG5cdFx0XHRpZihwcm9ncmVzcyA8IDApIHtcblx0XHRcdFx0cHJvZ3Jlc3MgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihwcm9ncmVzcyA+IDEwMCkge1xuXHRcdFx0XHRwcm9ncmVzcyA9IDEwMDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vcHRpb25zLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG5cdFx0XHR0aGlzLnRyaWdnZXJNZXRob2QoJ3Byb2dyZXNzJywgcHJvZ3Jlc3MpO1xuXG5cdFx0XHRpZihwcm9ncmVzcyA9PT0gMTAwKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlck1ldGhvZCgnY29tcGxldGUnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdwcm9ncmVzcycpO1xuXHRcdH0sXG5cblx0XHRvblByb2dyZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94KSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBUb29sYm94LlJhZGlvRmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLXJhZGlvLWZpZWxkJyksXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgb3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgICAgICAgaW5wdXRDbGFzc05hbWU6ICdyYWRpbycsXG4gICAgICAgICAgICBjaGVja2JveENsYXNzTmFtZTogJ3JhZGlvJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJzpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCdbdmFsdWU9XCInK3ZhbHVlKydcIl0nKS5hdHRyKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnbm91aXNsaWRlciddLCBmdW5jdGlvbihub1VpU2xpZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsIG5vVWlTbGlkZXIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdub3Vpc2xpZGVyJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuVG9vbGJveCA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByb290Lm5vVWlTbGlkZXIpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsIG5vVWlTbGlkZXIpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guUmFuZ2VTbGlkZXIgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3JhbmdlLXNsaWRlcicpLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyAoYm9vbCkgU2hvdWxkIHRoZSBzbGlkZXIgYmUgYW5pbWF0ZVxuICAgICAgICAgICAgYW5pbWF0ZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgQ2xpY2sgZWZmZWN0cyBmb3IgbWFuaXB1bGF0aW5nIHRoZSBzbGlkZXIuXG4gICAgICAgICAgICAvLyBQb3NzaWJsZSB2YWx1ZXM6IFwiZHJhZ1wiLCBcInRhcFwiLCBcImZpeGVkXCIsIFwic25hcFwiIG9yIFwibm9uZVwiXG4gICAgICAgICAgICBiZWhhdmlvcjogJ3RhcCcsXG5cbiAgICAgICAgICAgIC8vIChtaXhlZCkgU2hvdWxkIHRoZSBoYW5kbGVzIGJlIGNvbm5lY3RlZC5cbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIHZhbHVlczogdHJ1ZSwgZmFsc2UsIFwidXBwZXJcIiwgb3IgXCJsb3dlclwiXG4gICAgICAgICAgICBjb25uZWN0OiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIGRpcmVjdGlvbiBvZiB0aGUgc2xpZGVyLiBcImx0clwiIG9yIFwicnRsXCJcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ2x0cicsXG5cbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBtYXhpbXVtIGRpc3RhbmNlIHRoZSBoYW5kbGVzIGNhbiBiZSBmcm9tIGVhY2ggb3RoZXJcbiAgICAgICAgICAgIC8vIGZhbHNlIGRpc2FibGVzIHRoaXMgb3B0aW9uLlxuICAgICAgICAgICAgbGltaXQ6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgbWluaW11bSBkaXN0YW5jZSB0aGUgaGFuZGxlcyBjYW4gYmUgZnJvbSBlYWNoIG90aGVyXG4gICAgICAgICAgICAvLyBmYWxzZSBkaXNhYmxlZCB0aGlzIG9wdGlvblxuICAgICAgICAgICAgbWFyZ2luOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG9yaWVudGF0aW9uIG9mIHRoZSBzbGlkZXIuIFwiaG9yaXpvbnRhbFwiIG9yIFwidmVydGljYWxcIlxuICAgICAgICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBzdGFydGluZyBwb3NzaXRpb24gb2YgdGhlIHNsaWRlciBoYW5kbGVzXG4gICAgICAgICAgICBzdGFydDogWzBdLFxuXG4gICAgICAgICAgICAvLyAoaW50KSBUaGUgc3RlcCBpbnRlZ2VyXG4gICAgICAgICAgICBzdGVwOiAwLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSB0aGUgcmFuZ2Ugb2JqZWN0IGRlZmluZWQgdGhlIG1pbi9tYXggdmFsdWVzXG4gICAgICAgICAgICByYW5nZToge1xuICAgICAgICAgICAgICAgIG1pbjogWzBdLFxuICAgICAgICAgICAgICAgIG1heDogWzEwMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGU6IHRoaXMuZ2V0T3B0aW9uKCdhbmltYXRlJyksXG4gICAgICAgICAgICAgICAgYmVoYXZpb3I6IHRoaXMuZ2V0T3B0aW9uKCdiZWhhdmlvcicpLFxuICAgICAgICAgICAgICAgIGNvbm5lY3Q6IHRoaXMuZ2V0T3B0aW9uKCdjb25uZWN0JyksXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmdldE9wdGlvbignZGlyZWN0aW9uJyksXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246IHRoaXMuZ2V0T3B0aW9uKCdvcmllbnRhdGlvbicpLFxuICAgICAgICAgICAgICAgIHJhbmdlOiB0aGlzLmdldE9wdGlvbigncmFuZ2UnKSxcbiAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5nZXRPcHRpb24oJ3N0YXJ0JyksXG4gICAgICAgICAgICAgICAgc3RlcDogdGhpcy5nZXRPcHRpb24oJ3N0ZXAnKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ21hcmdpbicpICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubWFyZ2luID0gdGhpcy5nZXRPcHRpb24oJ21hcmdpbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbGltaXQnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxpbWl0ID0gdGhpcy5nZXRPcHRpb24oJ2xpbWl0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzbGlkZXIgPSB0aGlzLiRlbC5maW5kKCcuc2xpZGVyJykuZ2V0KDApO1xuXG4gICAgICAgICAgICBzbGlkZXIgPSBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBzbGlkZXIub24oJ3NsaWRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdzbGlkZScsIHQuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVyLm9uKCdzZXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ3NldCcsIHQuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2NoYW5nZScsIHQuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTbGlkZXJFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcuc2xpZGVyJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2xpZGVyRWxlbWVudCgpLnZhbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5nZXRTbGlkZXJFbGVtZW50KCkudmFsKHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2xpZGVyRWxlbWVudCgpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2xpZGVyRWxlbWVudCgpLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guU2VsZWN0RmllbGQgPSBUb29sYm94LkJhc2VGaWVsZC5leHRlbmQoe1xuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdmb3JtLXNlbGVjdC1maWVsZCcpLFxuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RvcjogJ3NlbGVjdCcsXG4gICAgICAgICAgICBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICBvcHRpb25zOiBbXVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2hhbmdlIC5mb3JtLWNvbnRyb2wnOiAnY2hhbmdlJ1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoJ3NlbGVjdCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldElucHV0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbigndmFsdWUnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0SW5wdXRGaWVsZCgpLnZhbCh0aGlzLmdldE9wdGlvbigndmFsdWUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldElucHV0RmllbGQoKS52YWwodGhpcy5nZXRJbnB1dEZpZWxkKCkuZmluZCgnb3B0aW9uOmZpcnN0JykudmFsKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeScsICd1bmRlcnNjb3JlJywgJ2ludGVyYWN0LmpzJ10sIGZ1bmN0aW9uKCQsIF8sIGludGVyYWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8sIGludGVyYWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgICAgICAgICByZXF1aXJlKCdpbnRlcmFjdC5qcycpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fLCByb290LmludGVyYWN0KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCAkLCBfLCBpbnRlcmFjdCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgZnVuY3Rpb24gZmluZChpZCwgY29sbGVjdGlvbikge1xuICAgICAgICB2YXIgd2hlcmUgPSBnZXRXaGVyZShpZCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmluZCh3aGVyZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0V2hlcmUoaWQpIHtcbiAgICAgICAgdmFyIHdoZXJlID0ge307XG5cbiAgICAgICAgd2hlcmVbZ2V0SWRBdHRyaWJ1dGUoaWQpXSA9IGlkO1xuXG4gICAgICAgIHJldHVybiB3aGVyZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJZEF0dHJpYnV0ZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gXy5pc051bGwobmV3IFN0cmluZyh2YWx1ZSkubWF0Y2goL15jXFxkKyQvKSkgPyAnaWQnIDogJ2NpZCc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGVsZW1lbnQsIHZpZXcpIHtcbiAgICAgICAgdmFyICRwYXJlbnQgPSAkKGVsZW1lbnQpO1xuXG4gICAgICAgIGlmKCEkcGFyZW50Lmhhc0NsYXNzKCdkcm9wcGFibGUtcG9vbCcpKSB7XG4gICAgICAgICAgICAkcGFyZW50ID0gJHBhcmVudC5wYXJlbnRzKCcuZHJvcHBhYmxlLXBvb2wnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkcGFyZW50Lmhhc0NsYXNzKCdhdmFpbGFibGUtcG9vbCcpID9cbiAgICAgICAgICAgIHZpZXcuYXZhaWxhYmxlLmN1cnJlbnRWaWV3IDpcbiAgICAgICAgICAgIHZpZXcuc2VsZWN0ZWQuY3VycmVudFZpZXc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNmZXJOb2RlQWZ0ZXIoZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgdmFyIGZyb21XaGVyZSA9IHt9LCB0b1doZXJlID0ge307XG4gICAgICAgIHZhciBmcm9tID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnJlbGF0ZWRUYXJnZXQsIHZpZXcpO1xuICAgICAgICB2YXIgdG8gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0LCB2aWV3KTtcblxuICAgICAgICBmcm9tV2hlcmVbZ2V0SWRBdHRyaWJ1dGUoJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gICAgICAgIHRvV2hlcmVbZ2V0SWRBdHRyaWJ1dGUoJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpO1xuXG4gICAgICAgIHZhciBmcm9tTW9kZWwgPSBmcm9tLmNvbGxlY3Rpb24uZmluZFdoZXJlKGZyb21XaGVyZSk7XG4gICAgICAgIHZhciB0b01vZGVsID0gdG8uY29sbGVjdGlvbi5maW5kV2hlcmUodG9XaGVyZSk7XG5cbiAgICAgICAgZnJvbS5jb2xsZWN0aW9uLnJlbW92ZU5vZGUoZnJvbU1vZGVsKTtcbiAgICAgICAgdG8uY29sbGVjdGlvbi5hcHBlbmROb2RlQWZ0ZXIoZnJvbU1vZGVsLCB0b01vZGVsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zlck5vZGVCZWZvcmUoZXZlbnQsIHZpZXcpIHtcbiAgICAgICAgdmFyIGZyb21XaGVyZSA9IHt9LCB0b1doZXJlID0ge307XG4gICAgICAgIHZhciBmcm9tID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnJlbGF0ZWRUYXJnZXQsIHZpZXcpO1xuICAgICAgICB2YXIgdG8gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0LCB2aWV3KTtcblxuXG4gICAgICAgIGZyb21XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICAgICAgdG9XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgdmFyIGZyb21Nb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUoZnJvbVdoZXJlKTtcbiAgICAgICAgdmFyIHRvTW9kZWwgPSB0by5jb2xsZWN0aW9uLmZpbmRXaGVyZSh0b1doZXJlKTtcblxuICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShmcm9tTW9kZWwpO1xuICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGVCZWZvcmUoZnJvbU1vZGVsLCB0b01vZGVsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zlck5vZGVDaGlsZHJlbihldmVudCwgdmlldykge1xuICAgICAgICB2YXIgZnJvbVdoZXJlID0ge30sIHRvV2hlcmUgPSB7fTtcbiAgICAgICAgdmFyIGZyb20gPSBnZXRTZWxlY3Rpb25Qb29sRnJvbUVsZW1lbnQoZXZlbnQucmVsYXRlZFRhcmdldCwgdmlldyk7XG4gICAgICAgIHZhciB0byA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC50YXJnZXQsIHZpZXcpO1xuXG4gICAgICAgIGlmKCQoZXZlbnQudGFyZ2V0KS5maW5kKCcuY2hpbGRyZW4nKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImNoaWxkcmVuXCIgLz4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyb21XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJykpXSA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICAgICAgdG9XaGVyZVtnZXRJZEF0dHJpYnV0ZSgkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSldID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgdmFyIGZyb21Nb2RlbCA9IGZyb20uY29sbGVjdGlvbi5maW5kV2hlcmUoZnJvbVdoZXJlKTtcbiAgICAgICAgdmFyIHRvTW9kZWwgPSB0by5jb2xsZWN0aW9uLmZpbmRXaGVyZSh0b1doZXJlKTtcblxuICAgICAgICBmcm9tLmNvbGxlY3Rpb24ucmVtb3ZlTm9kZShmcm9tTW9kZWwpO1xuICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGUoZnJvbU1vZGVsLCB0b01vZGVsLCB7XG4gICAgICAgICAgICBhdDogMFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBUb29sYm94LlNlbGVjdGlvblBvb2wgPSBUb29sYm94LkxheW91dFZpZXcuZXh0ZW5kKHtcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnc2VsZWN0aW9uLXBvb2wnKSxcblxuICAgICAgICBjbGFzc05hbWU6ICdzZWxlY3Rpb24tcG9vbCcsXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgYXZhaWxhYmxlOiAnLmF2YWlsYWJsZS1wb29sJyxcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnLnNlbGVjdGVkLXBvb2wnLFxuICAgICAgICAgICAgLy9hY3Rpdml0eTogJy5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtYWN0aXZpdHknXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuZXN0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlOiBbXSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlldzogVG9vbGJveC5TZWxlY3Rpb25Qb29sVHJlZVZpZXcsXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVUcmVlVmlld1RlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCdzZWxlY3Rpb24tcG9vbC10cmVlLW5vZGUnKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWU6IFtdLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXc6IFRvb2xib3guU2VsZWN0aW9uUG9vbFRyZWVWaWV3LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVHJlZVZpZXdPcHRpb25zOiB7fSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFRyZWVWaWV3VGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3NlbGVjdGlvbi1wb29sLXRyZWUtbm9kZScpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwaW5nU3RvcHBlZFRocmVzaG9sZDogNTAwLFxuICAgICAgICAgICAgICAgIGxpa2VuZXNzVGhyZXNob2xkOiA3NSxcbiAgICAgICAgICAgICAgICBzY3JvbGxCb3R0b21UaHJlc2hvbGQ6IDEwLFxuICAgICAgICAgICAgICAgIHNlYXJjaEluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAndGlueSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5zZWxlY3Rpb24tcG9vbC1zZWFyY2gtY2xlYXInOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyU2VhcmNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vZmYoJ2RldGVjdGlvbjp0eXBpbmc6c3RhcnRlZCcsIGZhbHNlLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5vZmYoJ2RldGVjdGlvbjp0eXBpbmc6c3RvcHBlZCcsIGZhbHNlLCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guTGF5b3V0Vmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwub24oJ2RldGVjdGlvbjp0eXBpbmc6c3RhcnRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgndHlwaW5nOnN0YXJ0ZWQnKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwub24oJ2RldGVjdGlvbjp0eXBpbmc6c3RvcHBlZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTWV0aG9kKCd0eXBpbmc6c3RvcHBlZCcsIHZhbHVlKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dTZWFyY2hBY3Rpdml0eTogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoJykuYXBwZW5kKFtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInNlbGVjdGlvbi1wb29sLXNlYXJjaC1hY3Rpdml0eVwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2VsZWN0aW9uLXBvb2wtc2VhcmNoLWFjdGl2aXR5LWxhYmVsXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIChtZXNzYWdlIHx8ICdMb2FkaW5nLi4uJyksXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nLFxuICAgICAgICAgICAgICAgICc8L2Rpdj4nXG4gICAgICAgICAgICBdLmpvaW4oJycpKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLiRlbC5hZGRDbGFzcygnc2hvdy1hY3Rpdml0eScpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGVTZWFyY2hBY3Rpdml0eTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzaG93LWFjdGl2aXR5Jyk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi4kZWwuZmluZCgnLnNlbGVjdGlvbi1wb29sLXNlYXJjaC1hY3Rpdml0eScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSwgMjUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QXZhaWxhYmxlUG9vbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIFZpZXcgPSB0aGlzLmdldE9wdGlvbignYXZhaWxhYmxlVHJlZVZpZXcnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICBcdFx0dmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuZ2V0T3B0aW9uKCdhdmFpbGFibGVUcmVlJyksXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld09wdGlvbnM6IF8uZXh0ZW5kKHt9LCBWaWV3LnByb3RvdHlwZS5jaGlsZFZpZXdPcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0YWJsZTogdGhpcy5nZXRPcHRpb24oJ25lc3RhYmxlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3VGVtcGxhdGUnKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICBcdFx0fSwgdGhpcy5nZXRPcHRpb24oJ2F2YWlsYWJsZVRyZWVWaWV3T3B0aW9ucycpKSk7XG5cbiAgICAgICAgICAgICAgICB2aWV3LmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVzZXRTY3JvbGxCb3R0b20uY2FsbChzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dTZWxlY3Rpb25Qb29sVmlldyh0aGlzLmF2YWlsYWJsZSwgdmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1NlbGVjdGVkUG9vbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdzZWxlY3RlZFRyZWVWaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgXHRcdHZhciB2aWV3ID0gbmV3IFZpZXcoXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlJyksXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld09wdGlvbnM6IF8uZXh0ZW5kKHt9LCBWaWV3LnByb3RvdHlwZS5jaGlsZFZpZXdPcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0YWJsZTogdGhpcy5nZXRPcHRpb24oJ25lc3RhYmxlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRPcHRpb24oJ3NlbGVjdGVkVHJlZVZpZXdUZW1wbGF0ZScpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIFx0XHR9LCB0aGlzLmdldE9wdGlvbignc2VsZWN0ZWRUcmVlVmlld09wdGlvbnMnKSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93U2VsZWN0aW9uUG9vbFZpZXcodGhpcy5zZWxlY3RlZCwgdmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1NlbGVjdGlvblBvb2xWaWV3OiBmdW5jdGlvbihyZWdpb24sIHZpZXcpIHtcbiAgICAgICAgICAgIHZpZXcub24oJ2Ryb3AnLCBmdW5jdGlvbihldmVudCwgdmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZHJvcCcsIGV2ZW50LCB2aWV3KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdkcm9wOmJlZm9yZScsIGZ1bmN0aW9uKGV2ZW50LCB2aWV3KSB7XG4gICAgICAgICAgICAgICAgdHJhbnNmZXJOb2RlQmVmb3JlKGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YmVmb3JlJywgZXZlbnQsIHZpZXcpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ2Ryb3A6YWZ0ZXInLCBmdW5jdGlvbihldmVudCwgdmlldykge1xuICAgICAgICAgICAgICAgIHRyYW5zZmVyTm9kZUFmdGVyKGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgdmlldyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgdmlldy5vbignZHJvcDpjaGlsZHJlbicsIGZ1bmN0aW9uKGV2ZW50LCB2aWV3KSB7XG4gICAgICAgICAgICAgICAgdHJhbnNmZXJOb2RlQ2hpbGRyZW4oZXZlbnQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZHJvcDpjaGlsZHJlbicsIGV2ZW50LCB2aWV3KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZWdpb24uc2hvdyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb2RlbENvbnRhaW5zOiBmdW5jdGlvbihtb2RlbCwgcXVlcnkpIHtcbiAgICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gbW9kZWwgPSBtb2RlbC50b0pTT04oKSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG1vZGVsW2ldO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jb250YWlucy5jYWxsKHRoaXMsIHZhbHVlLCBxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29udGFpbnM6IGZ1bmN0aW9uKHN1YmplY3QsIHF1ZXJ5KSB7XG4gICAgICAgICAgICBpZighXy5pc1N0cmluZyhzdWJqZWN0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHF1ZXJ5ID0gcXVlcnkuc3BsaXQoJyAnKSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHF1ZXJ5W2ldO1xuXG4gICAgICAgICAgICAgICAgaWYoc3ViamVjdC50b1VwcGVyQ2FzZSgpLmluY2x1ZGVzKHZhbHVlLnRvVXBwZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjb21wYXJpc29uID0gbmV3IFRvb2xib3guTGV2ZW5zaHRlaW4odmFsdWUudG9VcHBlckNhc2UoKSwgc3ViamVjdC50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgICAgICAgICB2YXIgcGVyY2VudCA9IGNvbXBhcmlzb24uZGlzdGFuY2UgLyBzdWJqZWN0Lmxlbmd0aCAqIDEwMCAtIDEwMDtcblxuICAgICAgICAgICAgICAgIGlmKHBlcmNlbnQgPiB0aGlzLmdldE9wdGlvbignbGlrZW5lc3NUaHJlc2hvbGQnKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWFyY2g6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHF1ZXJ5KSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kZWxDb250YWlucyhtb2RlbCwgcXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldCgnaGlkZGVuJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdoaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmF2YWlsYWJsZS5jdXJyZW50Vmlldy5yZW5kZXIoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXJTZWFyY2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNlbGVjdGlvbi1wb29sLXNlYXJjaC1maWVsZCBpbnB1dCcpLnZhbCgnJykuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZUNsZWFyU2VhcmNoQnV0dG9uKCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3R5cGluZzpzdG9wcGVkJywgJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDbGVhclNlYXJjaEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuc2VsZWN0aW9uLXBvb2wtc2VhcmNoLWNsZWFyJykuYWRkQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQ2xlYXJTZWFyY2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNlbGVjdGlvbi1wb29sLXNlYXJjaC1jbGVhcicpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25UeXBpbmdTdGFydGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NlYXJjaEFjdGl2aXR5KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25UeXBpbmdTdG9wcGVkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlU2VhcmNoQWN0aXZpdHkoKTtcblxuICAgICAgICAgICAgaWYodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDbGVhclNlYXJjaEJ1dHRvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlQ2xlYXJTZWFyY2hCdXR0b24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5hdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaCh0aGlzLmF2YWlsYWJsZS5jdXJyZW50Vmlldy5jb2xsZWN0aW9uLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXRTY3JvbGxCb3R0b206IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsQXRCb3R0b20gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbEhlaWdodCA9IHRoaXMuYXZhaWxhYmxlLmN1cnJlbnRWaWV3LiRlbC5wYXJlbnQoKS5wcm9wKCdzY3JvbGxIZWlnaHQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCBkZXRlY3Rpb24gPSBuZXcgVG9vbGJveC5UeXBpbmdEZXRlY3Rpb24oXG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLnNlbGVjdGlvbi1wb29sLXNlYXJjaCBpbnB1dCcpLFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd0eXBpbmdTdG9wcGVkVGhyZXNob2xkJyksXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB2YXIgJGF2YWlsYWJsZVBvb2wgPSB0aGlzLmF2YWlsYWJsZS5jdXJyZW50Vmlldy4kZWwucGFyZW50KCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2xhc3RTY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsQXRCb3R0b20gPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYuX3Njcm9sbEhlaWdodCA9ICRhdmFpbGFibGVQb29sLnByb3AoJ3Njcm9sbEhlaWdodCcpO1xuXG4gICAgICAgICAgICAkYXZhaWxhYmxlUG9vbC5zY3JvbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNjcm9sbFRvcCA9ICQodGhpcykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVzaG9sZCA9IHNlbGYuZ2V0T3B0aW9uKCdzY3JvbGxCb3R0b21UaHJlc2hvbGQnKTtcblxuICAgICAgICAgICAgICAgIHNlbGYuX2lzU2Nyb2xsaW5nRG93biA9IHNjcm9sbFRvcCA+IHNlbGYuX2xhc3RTY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNQYXN0VGhyZXNob2xkID0gc2Nyb2xsVG9wICsgJCh0aGlzKS5oZWlnaHQoKSA+PSBzZWxmLl9zY3JvbGxIZWlnaHQgLSB0aHJlc2hvbGQ7XG5cbiAgICAgICAgICAgICAgICBpZihzZWxmLl9pc1Njcm9sbGluZ0Rvd24gJiYgc2VsZi5faXNQYXN0VGhyZXNob2xkICYmICFzZWxmLl9zY3JvbGxBdEJvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zY3JvbGxBdEJvdHRvbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgnc2Nyb2xsOmJvdHRvbScsIHNjcm9sbFRvcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFzZWxmLl9pc1Njcm9sbGluZ0Rvd24gJiYgIXNlbGYuX2lzUGFzdFRocmVzaG9sZCl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Njcm9sbEF0Qm90dG9tID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fbGFzdFNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuZHJvcHBhYmxlLXBvb2wnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciAkcG9vbCA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpbnRlcmFjdCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAuZHJvcHpvbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXB0OiAkKHRoaXMpLmRhdGEoJ2FjY2VwdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25kcm9wOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aGVyZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcm9tID0gZ2V0U2VsZWN0aW9uUG9vbEZyb21FbGVtZW50KGV2ZW50LnJlbGF0ZWRUYXJnZXQsIHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0byA9IGdldFNlbGVjdGlvblBvb2xGcm9tRWxlbWVudChldmVudC50YXJnZXQsIHNlbGYpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmVbZ2V0SWRBdHRyaWJ1dGUoJChldmVudC5yZWxhdGVkVGFyZ2V0KS5kYXRhKCdpZCcpKV0gPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmRhdGEoJ2lkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBmcm9tLmNvbGxlY3Rpb24uZmluZFdoZXJlKHdoZXJlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20uY29sbGVjdGlvbi5yZW1vdmVOb2RlKG1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0by5jb2xsZWN0aW9uLmFwcGVuZE5vZGUobW9kZWwsIG51bGwsIHthdDogJChldmVudC5yZWxhdGVkVGFyZ2V0KS5pbmRleCgpfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLiRlbC5yZW1vdmVDbGFzcygnZHJvcHBpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcG9vbC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdwb29sOmRyb3AnLCBldmVudCwgbW9kZWwsIGZyb20sIHRvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmRyYWdlbnRlcjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi4kZWwuYWRkQ2xhc3MoJ2Ryb3BwaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHBvb2wucGFyZW50KCkuYWRkQ2xhc3MoJ2Ryb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlck1ldGhvZCgncG9vbDpkcmFnOmVudGVyJywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZHJhZ2xlYXZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLiRlbC5yZW1vdmVDbGFzcygnZHJvcHBpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcG9vbC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyTWV0aG9kKCdwb29sOmRyYWc6bGVhdmUnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TaG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0F2YWlsYWJsZVBvb2woKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NlbGVjdGVkUG9vbCgpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnanF1ZXJ5J10sIGZ1bmN0aW9uKF8sICQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXywgJCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgICAgIHJvb3QuVG9vbGJveCxcbiAgICAgICAgICAgIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJ2pxdWVyeScpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXywgcm9vdC4kKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfLCAkKSB7XG5cbiAgICBUb29sYm94LlNlbGVjdGlvblBvb2xUcmVlTm9kZSA9IFRvb2xib3guRHJhZ2dhYmxlVHJlZU5vZGUuZXh0ZW5kKHtcblxuICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBUb29sYm94LkRyb3B6b25lcyhldmVudC5kcmFnRXZlbnQsIGV2ZW50LnRhcmdldCwge1xuICAgICAgICAgICAgICAgIGJlZm9yZTogZnVuY3Rpb24oJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpiZWZvcmUnLCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhZnRlcjogZnVuY3Rpb24oJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDphZnRlcicsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignbmVzdGFibGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290KCkudHJpZ2dlck1ldGhvZCgnZHJvcDpjaGlsZHJlbicsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBpZigkdGFyZ2V0Lmhhc0NsYXNzKCdkcm9wLWJlZm9yZScpKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGVCZWZvcmUobm9kZSwgcGFyZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wOmJlZm9yZScsIGV2ZW50LCBzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoJHRhcmdldC5oYXNDbGFzcygnZHJvcC1hZnRlcicpKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzLnJvb3QoKS5jb2xsZWN0aW9uLmFwcGVuZE5vZGVBZnRlcihub2RlLCBwYXJlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCR0YXJnZXQuaGFzQ2xhc3MoJ2Ryb3AtY2hpbGRyZW4nKSkge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCduZXN0YWJsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5yb290KCkuY29sbGVjdGlvbi5hcHBlbmROb2RlKG5vZGUsIHBhcmVudCwge2F0OiAwfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6Y2hpbGRyZW4nLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL3RoaXMucm9vdCgpLmNvbGxlY3Rpb24uYXBwZW5kTm9kZUFmdGVyKG5vZGUsIHBhcmVudCwge2F0OiAwfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdCgpLnRyaWdnZXJNZXRob2QoJ2Ryb3A6YWZ0ZXInLCBldmVudCwgc2VsZik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJvb3QoKS50cmlnZ2VyTWV0aG9kKCdkcm9wJywgZXZlbnQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRG9tUmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBUb29sYm94LkRyYWdnYWJsZVRyZWVOb2RlLnByb3RvdHlwZS5vbkRvbVJlZnJlc2guY2FsbCh0aGlzKTtcblxuICAgICAgICAgICAgaWYodGhpcy5tb2RlbC5nZXQoJ2hpZGRlbicpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgndW5kZXJzY29yZScpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgVG9vbGJveC5TZWxlY3Rpb25Qb29sVHJlZVZpZXcgPSBUb29sYm94LkRyYWdnYWJsZVRyZWVWaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgY2hpbGRWaWV3OiBUb29sYm94LlNlbGVjdGlvblBvb2xUcmVlTm9kZVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydiYWNrYm9uZScsICdiYWNrYm9uZS5tYXJpb25ldHRlJywgJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oQmFja2JvbmUsIE1hcmlvbmV0dGUsIF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgQmFja2JvbmUsIE1hcmlvbmV0dGUsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdiYWNrYm9uZScpLCByZXF1aXJlKCdiYWNrYm9uZS5tYXJpb25ldHRlJyksIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuQmFja2JvbmUsIHJvb3QuTWFyaW9uZXR0ZSwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgVG9vbGJveC5TdG9yYWdlID0gTWFyaW9uZXR0ZS5PYmplY3QuZXh0ZW5kKHtcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgc3RvcmFnZUVuZ2luZTogbG9jYWxTdG9yYWdlLFxuICAgICAgICAgICAgZGF0YUNsYXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAgICAgTWFyaW9uZXR0ZS5PYmplY3QucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gVG9vbGJveC5PcHRpb25zKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucywgdGhpcyk7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLnRhYmxlTmFtZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIFxcJ3RhYmxlXFwnIG9wdGlvbiBtdXN0IGJlIHNldCB3aXRoIGEgdmFsaWQgdGFibGUgbmFtZS4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWJsZSgpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZGF0YScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ2RhdGEnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGVuZ2luZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0b3JhZ2VFbmdpbmUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0YWJsZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCd0YWJsZScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgZG9lc1RhYmxlRXhpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICFfLmlzTnVsbCh0aGlzLmVuZ2luZSgpLmdldEl0ZW0odGhpcy50YWJsZU5hbWUoKSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVRhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmRvZXNUYWJsZUV4aXN0KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95VGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUoKS5yZW1vdmVJdGVtKHRoaXMudGFibGVOYW1lKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHRoaXMuZW5naW5lKCkuZ2V0SXRlbSh0aGlzLnRhYmxlTmFtZSgpKSk7XG4gICAgICAgICAgICB2YXIgRGF0YUNsYXNzID0gXy5pc0FycmF5KGRhdGEpID8gQmFja2JvbmUuQ29sbGVjdGlvbiA6IEJhY2tib25lLk1vZGVsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZGF0YUNsYXNzJykpIHtcbiAgICAgICAgICAgICAgICBEYXRhQ2xhc3MgID0gdGhpcy5nZXRPcHRpb24oJ2RhdGFDbGFzcycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmRhdGEgPSBuZXcgRGF0YUNsYXNzKGRhdGEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2RhdGEnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lKCkuc2V0SXRlbSh0aGlzLnRhYmxlTmFtZSgpLCBKU09OLnN0cmluZ2lmeSh0aGlzLmdldE9wdGlvbignZGF0YScpLnRvSlNPTigpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgLy8gVE9ETzogQWRkIEtleVN0b3JlXG4gICAgLypcbiAgICBUb29sYm94LktleVN0b3JlID0gVG9vbGJveC5TdG9yYWdlLmV4dGVuZCh7XG5cbiAgICB9KTtcbiAgICAqL1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnLCAnYmFja2JvbmUnLCAnYmFja2JvbmUubWFyaW9uZXR0ZSddLCBmdW5jdGlvbigkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ2pxdWVyeScpLCByZXF1aXJlKCd1bmRlcnNjb3JlJyksIHJlcXVpcmUoJ2JhY2tib25lJyksIHJlcXVpcmUoJ2JhY2tib25lLm1hcmlvbmV0dGUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuJCwgcm9vdC5fLCBCYWNrYm9uZSwgTWFyaW9uZXR0ZSk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgJCwgXywgQmFja2JvbmUsIE1hcmlvbmV0dGUpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVGFibGVOb0l0ZW1zUm93ID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRhZ05hbWU6ICd0cicsXG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYmxlLW5vLWl0ZW1zJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnbm8tcmVzdWx0cycsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChhcnJheSkgQXJyYXkgb2YgYXJyYXkgb2YgY29sdW1uXG4gICAgICAgICAgICBjb2x1bW5zOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGVyZSBhcmUgbm8gdGFibGUgcm93c1xuICAgICAgICAgICAgbWVzc2FnZTogJ05vIHJvd3MgZm91bmQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5UYWJsZVZpZXdSb3cgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGFnTmFtZTogJ3RyJyxcblxuICAgICAgICB0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgndGFibGUtdmlldy1yb3cnKSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyAobWl4ZWQpIElmIG5vdCBmYWxzZSwgcGFzcyBhIHZhbGlkIFZpZXcgcHJvdG90eXBlXG4gICAgICAgICAgICBlZGl0Rm9ybUNsYXNzOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gKG1peGVkKSBJZiBub3QgZmFsc2UsIHBhc3MgYSB2YWxpZCBWaWV3IHByb3RvdHlwZVxuICAgICAgICAgICAgZGVsZXRlRm9ybUNsYXNzOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmVkaXQnOiAnY2xpY2s6ZWRpdCcsXG4gICAgICAgICAgICAnY2xpY2sgLmRlbGV0ZSc6ICdjbGljazpkZWxldGUnXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGlja0VkaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSB0aGlzLmdldE9wdGlvbignZWRpdEZvcm1DbGFzcycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyh7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2aWV3Lm9uKCdzdWJtaXQ6c3VjY2VzcycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Vmlld0luTW9kYWwodmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGlja0RlbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdkZWxldGVGb3JtQ2xhc3MnKTtcblxuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoe1xuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Vmlld0luTW9kYWwodmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1ZpZXdJbk1vZGFsOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICB2YXIgbW9kYWwgPSBuZXcgVG9vbGJveC5Nb2RhbCh7XG4gICAgICAgICAgICAgICAgY29udGVudFZpZXc6IHZpZXdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2aWV3Lm9uKCdzdWJtaXQ6c3VjY2VzcycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG1vZGFsLmhpZGUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBtb2RhbC5zaG93KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RhbDtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBUb29sYm94LlRhYmxlVmlld0Zvb3RlciA9IFRvb2xib3guTGF5b3V0Vmlldy5leHRlbmQoe1xuXG4gICAgICAgIHRhZ05hbWU6ICd0cicsXG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYmxlLXZpZXctZm9vdGVyJyksXG5cbiAgICAgICAgbW9kZWxFdmVudHM6IHtcbiAgICAgICAgICAgICdjaGFuZ2UnOiAncmVuZGVyJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlZ2lvbnM6IHtcbiAgICAgICAgICAgIGNvbnRlbnQ6ICd0ZCdcbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgLy8gKGFycmF5KSBBcnJheSBvZiBhcnJheSBvZiBjb2x1bW5cbiAgICAgICAgICAgIGNvbHVtbnM6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGVtcGxhdGVIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgVG9vbGJveC5UYWJsZVZpZXcgPSBUb29sYm94LkNvbXBvc2l0ZVZpZXcuZXh0ZW5kKHtcblxuXHRcdGNsYXNzTmFtZTogJ3RhYmxlLXZpZXcnLFxuXG4gICAgICAgIGNoaWxkVmlldzogVG9vbGJveC5UYWJsZVZpZXdSb3csXG5cbiAgICAgICAgY2hpbGRWaWV3Q29udGFpbmVyOiAndGJvZHknLFxuXG4gICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS12aWV3LWdyb3VwJyksXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIChpbnQpIFRoZSBzdGFydGluZyBwYWdlXG4gICAgICAgICAgICBwYWdlOiAxLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgb3JkZXIgb2YgdGhlIGRhdGUgYmVpbmcgcmV0dXJuZWRcbiAgICAgICAgICAgIG9yZGVyOiBudWxsLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBFaXRoZXIgYXNjIG9yIGRlc2Mgc29ydGluZyBvcmRlclxuICAgICAgICAgICAgc29ydDogbnVsbCxcblxuICAgICAgICAgICAgLy8gKGludCkgVGhlIG51bWJlcnMgb2Ygcm93cyBwZXIgcGFnZVxuICAgICAgICAgICAgbGltaXQ6IDIwLFxuXG4gICAgICAgICAgICAvLyAoYm9vbCkgU2hvdWxkIHNob3cgdGhlIHBhZ2luYXRpb24gZm9yIHRoaXMgdGFibGVcbiAgICAgICAgICAgIHBhZ2luYXRlOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyAoYXJyYXkpIEFycmF5IG9mIGFycmF5IG9mIGNvbHVtblxuICAgICAgICAgICAgY29sdW1uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChib29sKSBGZXRjaCB0aGUgZGF0YSB3aGVuIHRhYmxlIGlzIHNob3duXG4gICAgICAgICAgICBmZXRjaE9uU2hvdzogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBBbiBhcnJheSBvZiBoZWFkZXJzIGFwcGVuZGVkIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICByZXF1ZXN0SGVhZGVyczogW10sXG5cbiAgICAgICAgICAgIC8vIChhcnJheSkgVGhlIGRlZmF1bHQgb3B0aW9ucyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBxdWVyeSBzdHJpbmdcbiAgICAgICAgICAgIGRlZmF1bHRSZXF1ZXN0RGF0YU9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAncGFnZScsXG4gICAgICAgICAgICAgICAgJ2xpbWl0JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdzb3J0J1xuICAgICAgICAgICAgXSxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBBZGRpdGlvbmFsIG9wdGlvbnMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgICAgICByZXF1ZXN0RGF0YU9wdGlvbnM6IFtdLFxuXG4gICAgICAgICAgICAvLyAob2JqZWN0KSBUaGUgcGFnaW5hdGlvbiB2aWV3IGNsYXNzXG4gICAgICAgICAgICBwYWdpbmF0aW9uVmlldzogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBwYWdpbmF0aW9uIHZpZXcgb3B0aW9ucyBvYmplY3RcbiAgICAgICAgICAgIHBhZ2luYXRpb25WaWV3T3B0aW9uczogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXJcbiAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXIgdGFnIG5hbWVcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMycsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBoZWFkZXIgY2xhc3MgbmFtZVxuICAgICAgICAgICAgaGVhZGVyQ2xhc3NOYW1lOiAndGFibGUtaGVhZGVyJyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIHRhYmxlIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBkZXNjcmlwdGlvbiB0YWdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uVGFnOiAncCcsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSB0YWJsZSBkZXNjcmlwdGlvbiB0YWdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uQ2xhc3NOYW1lOiAnZGVzY3JpcHRpb24gcm93IGNvbC1zbS02JyxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIHRhYmxlIGNsYXNzIG5hbWVcbiAgICAgICAgICAgIHRhYmxlQ2xhc3NOYW1lOiAndGFibGUnLFxuXG4gICAgICAgICAgICAvLyAoc3RyaW5nKSBUaGUgbG9hZGluZyBjbGFzcyBuYW1lXG4gICAgICAgICAgICBsb2FkaW5nQ2xhc3NOYW1lOiAnbG9hZGluZycsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbW9kZWwgc3RvcmluZyB0aGUgY29sdW1uc1xuICAgICAgICAgICAgY2hpbGRWaWV3Q29sdW1uc1Byb3BlcnR5OiAnY29sdW1ucycsXG5cbiAgICAgICAgICAgIC8vIChvYmplY3QpIFRoZSBhY3Rpdml0eSBpbmRpY2F0b3Igb3B0aW9uc1xuICAgICAgICAgICAgaW5kaWNhdG9yT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ3NtYWxsJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gKHN0cmluZykgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGVyZSBhcmUgbm8gdGFibGUgcm93c1xuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiAnTm8gcm93cyBmb3VuZCcsXG5cbiAgICAgICAgICAgIC8vIChzdHJpbmcpIFRoZSBuYW1lIG9mIHRoZSBjbGFzcyBhcHBlbmRlZCB0byB0aGUgYnV0dG9uc1xuICAgICAgICAgICAgYnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcblxuICAgICAgICAgICAgLy8gKGFycmF5KSBBbiBhcnJheSBvZiBidXR0b24gb2JqZWN0c1xuICAgICAgICAgICAgLy8ge2hyZWY6ICd0ZXN0LTEyMycsIGxhYmVsOiAnVGVzdCAxMjMnfVxuICAgICAgICAgICAgYnV0dG9uczogW11cbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayAuc29ydCc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3NvcnQ6Y2xpY2snLCBlKTtcblxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY2xpY2sgLmJ1dHRvbnMtd3JhcHBlciBhJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciBidXR0b25zID0gdGhpcy5nZXRPcHRpb24oJ2J1dHRvbnMnKTtcbiAgICAgICAgICAgICAgICB2YXIgaSA9ICQoZS50YXJnZXQpLmluZGV4KCk7XG5cbiAgICAgICAgICAgICAgICBpZihfLmlzQXJyYXkoYnV0dG9ucykgJiYgYnV0dG9uc1tpXS5vbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnNbaV0ub25DbGljay5jYWxsKHRoaXMsICQoZS50YXJnZXQpKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFbXB0eVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIFZpZXcgPSBUb29sYm94LlRhYmxlTm9JdGVtc1Jvdy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5nZXRPcHRpb24oJ2VtcHR5TWVzc2FnZScpLFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldE9wdGlvbignY29sdW1ucycpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBWaWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignZmV0Y2hPblNob3cnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblNvcnRDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBvcmRlckJ5ID0gJChlLnRhcmdldCkuZGF0YSgnaWQnKTtcblxuICAgICAgICAgICAgaWYodC5nZXRPcHRpb24oJ29yZGVyJykgPT09IG9yZGVyQnkpIHtcbiAgICAgICAgICAgICAgICBpZighdC5nZXRPcHRpb24oJ3NvcnQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0Lm9wdGlvbnMuc29ydCA9ICdhc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHQuZ2V0T3B0aW9uKCdzb3J0JykgPT09ICdhc2MnKSB7XG4gICAgICAgICAgICAgICAgICAgIHQub3B0aW9ucy5zb3J0ID0gJ2Rlc2MnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdC5vcHRpb25zLm9yZGVyQnkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdC5vcHRpb25zLnNvcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0Lm9wdGlvbnMub3JkZXIgPSBvcmRlckJ5O1xuICAgICAgICAgICAgICAgIHQub3B0aW9ucy5zb3J0ID0gJ2FzYyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuJGVsLmZpbmQoJy5zb3J0JykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ3NvcnQtYXNjJykucmVtb3ZlQ2xhc3MoJ3NvcnQtZGVzYycpO1xuXG4gICAgICAgICAgICBpZih0LmdldE9wdGlvbignc29ydCcpKSB7XG4gICAgICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50KCkuYWRkQ2xhc3MoJ3NvcnQtJyt0LmdldE9wdGlvbignc29ydCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5mZXRjaCh0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93UGFnaW5hdGlvbjogZnVuY3Rpb24ocGFnZSwgdG90YWxQYWdlcykge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLCBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ3BhZ2luYXRpb25WaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKCFWaWV3KSB7XG4gICAgICAgICAgICAgICAgVmlldyA9IFRvb2xib3guUGFnZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwYWdpbmF0aW9uVmlld09wdGlvbnMgPSB0aGlzLmdldE9wdGlvbigncGFnaW5hdGlvblZpZXdPcHRpb25zJyk7XG5cbiAgICAgICAgICAgIGlmKCFfLmlzT2JqZWN0KHBhZ2luYXRpb25WaWV3T3B0aW9ucykpIHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uVmlld09wdGlvbnMgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgICAgICAgICB0b3RhbFBhZ2VzOiB0b3RhbFBhZ2VzLFxuICAgICAgICAgICAgfSwgcGFnaW5hdGlvblZpZXdPcHRpb25zKSk7XG5cbiAgICAgICAgICAgIHZpZXcub24oJ3BhZ2luYXRlJywgZnVuY3Rpb24ocGFnZSwgdmlldykge1xuICAgICAgICAgICAgICAgIGlmKHBhZ2UgIT0gdC5nZXRPcHRpb24oJ3BhZ2UnKSkge1xuICAgICAgICAgICAgICAgICAgICB0Lm9wdGlvbnMucGFnZSA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgICAgIHQuZmV0Y2godHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBmb290ZXJWaWV3ID0gbmV3IFRvb2xib3guVGFibGVWaWV3Rm9vdGVyKHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldE9wdGlvbignY29sdW1ucycpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uID0gbmV3IE1hcmlvbmV0dGUuUmVnaW9uKHtcbiAgICAgICAgICAgICAgICBlbDogdGhpcy4kZWwuZmluZCgndGZvb3QnKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbi5zaG93KGZvb3RlclZpZXcpO1xuXG4gICAgICAgICAgICBmb290ZXJWaWV3LmNvbnRlbnQuc2hvdyh2aWV3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lDaGlsZHJlbigpO1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95RW1wdHlWaWV3KCk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ3RhYmxlJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2xvYWRpbmdDbGFzc05hbWUnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5tb2RlbCwgVG9vbGJveC5BY3Rpdml0eUluZGljYXRvci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWJsZS1hY3Rpdml0eS1pbmRpY2F0b3Itcm93JyksXG4gICAgICAgICAgICAgICAgdGFnTmFtZTogJ3RyJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIGFjdGl2aXR5IGluZGljYXRvciBvcHRpb25zXG4gICAgICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMub3B0aW9ucywgdC5nZXRPcHRpb24oJ2luZGljYXRvck9wdGlvbnMnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNvbHVtbnMgPSB0LmdldE9wdGlvbignY29sdW1ucycpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgYWN0aXZpdHkgaW5kaWNhdG9yIGluc3RhbmNlIHRvIGJlIHJlbW92ZWQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgdC5fYWN0aXZpdHlJbmRpY2F0b3IgPSB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlQWN0aXZpdHlJbmRpY2F0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICB0aGlzLiRlbC5maW5kKCd0YWJsZScpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdsb2FkaW5nQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9hY3Rpdml0eUluZGljYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGRWaWV3KHRoaXMuX2FjdGl2aXR5SW5kaWNhdG9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpdml0eUluZGljYXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2hpbGR2aWV3QmVmb3JlUmVuZGVyOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgY2hpbGQub3B0aW9ucy5jb2x1bW5zID0gdGhpcy5nZXRPcHRpb24oJ2NvbHVtbnMnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZXF1ZXN0RGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbigncmVxdWVzdERhdGFPcHRpb25zJyk7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbignZGVmYXVsdFJlcXVlc3REYXRhT3B0aW9ucycpO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3REYXRhID0gdGhpcy5nZXRPcHRpb24oJ3JlcXVlc3REYXRhJyk7XG5cbiAgICAgICAgICAgIGlmKHJlcXVlc3REYXRhKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHJlcXVlc3REYXRhO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmVhY2goKFtdKS5jb25jYXQoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYoIV8uaXNOdWxsKHRoaXMuZ2V0T3B0aW9uKG5hbWUpKSAmJiAhXy5pc1VuZGVmaW5lZCh0aGlzLmdldE9wdGlvbihuYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHRoaXMuZ2V0T3B0aW9uKG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZldGNoOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95RW1wdHlWaWV3KCk7XG4gICAgICAgICAgICB0aGlzLnNob3dBY3Rpdml0eUluZGljYXRvcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hTdWNjZXNzOiBmdW5jdGlvbihjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLmdldEN1cnJlbnRQYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHZhciB0b3RhbFBhZ2VzID0gdGhpcy5nZXRMYXN0UGFnZShyZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmKGNvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RW1wdHlWaWV3KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYWdlID0gcGFnZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50b3RhbFBhZ2VzID0gdG90YWxQYWdlcztcblxuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3BhZ2luYXRlJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQYWdpbmF0aW9uKHBhZ2UsIHRvdGFsUGFnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRmV0Y2hDb21wbGV0ZTogZnVuY3Rpb24oc3RhdHVzLCBjb2xsZWN0aW9uLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZpdHlJbmRpY2F0b3IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXJyZW50UGFnZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5jdXJyZW50X3BhZ2UgfHwgcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGFzdFBhZ2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UubGFzdF9wYWdlIHx8IHJlc3BvbnNlLmxhc3RQYWdlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZldGNoOiBmdW5jdGlvbihyZXNldCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZihyZXNldCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goe1xuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZ2V0UmVxdWVzdERhdGEoKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbih4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodC5nZXRPcHRpb24oJ3JlcXVlc3RIZWFkZXJzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZWFjaCh0LmdldE9wdGlvbigncmVxdWVzdEhlYWRlcnMnKSwgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oY29sbGVjdGlvbiwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpjb21wbGV0ZScsIHRydWUsIGNvbGxlY3Rpb24sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgdC50cmlnZ2VyTWV0aG9kKCdmZXRjaDpzdWNjZXNzJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHQudHJpZ2dlck1ldGhvZCgnZmV0Y2g6Y29tcGxldGUnLCBmYWxzZSwgY29sbGVjdGlvbiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB0LnRyaWdnZXJNZXRob2QoJ2ZldGNoOmVycm9yJywgY29sbGVjdGlvbiwgcmVzcG9uc2UpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnZmV0Y2gnKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbihfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVGFiQ29udGVudCA9IFRvb2xib3guSXRlbVZpZXcuZXh0ZW5kKHtcblxuXHRcdHRlbXBsYXRlOiBUb29sYm94LlRlbXBsYXRlKCd0YWItY29udGVudCcpLFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdG5hbWU6IGZhbHNlLFxuXG5cdFx0XHRpZDogZmFsc2UsXG5cblx0XHRcdGNvbnRlbnQ6IGZhbHNlXG5cdFx0fSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cdFRvb2xib3guVGFicyA9IFRvb2xib3guTGF5b3V0Vmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3RhYnMnKSxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIFtkYXRhLXRvZ2dsZT1cInRhYlwiXSc6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0dGhpcy50cmlnZ2VyTWV0aG9kKCd0YWI6Y2xpY2snLCAkKGUudGFyZ2V0KS5hdHRyKCdocmVmJykpO1xuXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZGVmYXVsdE9wdGlvbnM6IHtcblx0XHRcdGNvbnRlbnRWaWV3OiBUb29sYm94LlRhYkNvbnRlbnQsXG5cblx0XHRcdGFjdGl2ZUNsYXNzTmFtZTogJ2FjdGl2ZScsXG5cbiAgICAgICAgICAgIHRhYkNsYXNzTmFtZTogJ25hdiBuYXYtdGFicycsXG5cblx0XHRcdHRhYlBhbmVDbGFzc05hbWU6ICd0YWItcGFuZScsXG5cblx0XHRcdGNvbnRlbnQ6IFtdXG5cdFx0fSxcblxuXHRcdHRhYlZpZXdzOiBbXSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWaWV3TmFtZTogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcuZ2V0T3B0aW9uKCd0YWJOYW1lJykgPyB2aWV3LmdldE9wdGlvbigndGFiTmFtZScpIDogKFxuICAgICAgICAgICAgICAgIHZpZXcuZ2V0T3B0aW9uKCduYW1lJykgPyB2aWV3LmdldE9wdGlvbignbmFtZScpIDogbnVsbFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWaWV3TGFiZWw6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgIHJldHVybiB2aWV3LmdldE9wdGlvbigndGFiTGFiZWwnKSA/IHZpZXcuZ2V0T3B0aW9uKCd0YWJMYWJlbCcpIDogKFxuICAgICAgICAgICAgICAgIHZpZXcuZ2V0T3B0aW9uKCdsYWJlbCcpID8gdmlldy5nZXRPcHRpb24oJ2xhYmVsJykgOiBudWxsXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVRhYjogZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldFZpZXdOYW1lKHZpZXcpO1xuXG4gICAgICAgIFx0dGhpcy4kZWwuZmluZCgnLm5hdi10YWJzJykuZmluZCgnW2hyZWY9XCIjJytuYW1lKydcIl0nKS5wYXJlbnQoKS5yZW1vdmUoKTtcblxuICAgICAgICBcdHRoaXMucmVnaW9uTWFuYWdlci5yZW1vdmVSZWdpb24obmFtZSk7XG5cbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcjJytuYW1lKS5yZW1vdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRUYWI6IGZ1bmN0aW9uKHZpZXcsIHNldEFjdGl2ZSkge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldFZpZXdOYW1lKHZpZXcpO1xuICAgICAgICBcdHZhciB0YWIgPSAnPGxpIHJvbGU9XCJwcmVzZW50YXRpb25cIj48YSBocmVmPVwiIycrbmFtZSsnXCIgYXJpYS1jb250cm9scz1cIicrbmFtZSsnXCIgcm9sZT1cInRhYlwiIGRhdGEtdG9nZ2xlPVwidGFiXCI+Jyt0aGlzLmdldFZpZXdMYWJlbCh2aWV3KSsnPC9hPjwvbGk+JztcblxuICAgICAgICBcdHZhciBodG1sID0gJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCInK3RoaXMuZ2V0T3B0aW9uKCd0YWJQYW5lQ2xhc3NOYW1lJykrJ1wiIGlkPVwiJytuYW1lKydcIiAvPic7XG5cbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcubmF2LXRhYnMnKS5hcHBlbmQodGFiKTtcbiAgICAgICAgXHR0aGlzLiRlbC5maW5kKCcudGFiLWNvbnRlbnQnKS5hcHBlbmQoaHRtbCk7XG5cdFx0XHR0aGlzLnJlZ2lvbk1hbmFnZXIuYWRkUmVnaW9uKG5hbWUsICcjJytuYW1lKTtcblx0XHRcdHRoaXNbbmFtZV0uc2hvdyh2aWV3KTtcblxuXHRcdFx0aWYoc2V0QWN0aXZlKSB7XG5cdFx0XHRcdHRoaXMuc2V0QWN0aXZlVGFiKHZpZXcpO1xuXHRcdFx0fVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0Xy5lYWNoKHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50JyksIGZ1bmN0aW9uKG9iaiwgaSkge1xuICAgICAgICBcdFx0aWYob2JqLmNpZCkge1xuICAgICAgICBcdFx0XHR0aGlzLmFkZFRhYihvYmopO1xuICAgICAgICBcdFx0fVxuICAgICAgICBcdFx0ZWxzZSB7XG4gICAgICAgIFx0XHRcdHZhciBjb250ZW50VmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50VmlldycpO1xuXG5cdFx0XHRcdFx0aWYoXy5pc09iamVjdChvYmoudmlldykpIHtcblx0XHRcdFx0XHRcdGNvbnRlbnRWaWV3ID0gb2JqLnZpZXc7XG5cblx0XHRcdFx0XHRcdGRlbGV0ZSBvYmoudmlldztcblx0XHRcdFx0XHR9XG5cblx0ICAgICAgICBcdFx0dGhpcy5hZGRUYWIobmV3IGNvbnRlbnRWaWV3KG9iaikpO1xuICAgICAgICBcdFx0fVxuICAgICAgICBcdH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEFjdGl2ZVRhYjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgXHRpZihfLmlzT2JqZWN0KGlkKSkge1xuICAgICAgICBcdFx0aWQgPSBpZC5nZXRPcHRpb24oJ25hbWUnKTtcbiAgICAgICAgXHR9XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy4nK3RoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2FjdGl2ZUNsYXNzTmFtZScpKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnW2hyZWY9XCInK2lkKydcIl0nKVxuICAgICAgICAgICAgICAgIC5wYXJlbnQoKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKGlkKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3NldDphY3RpdmU6dGFiJywgaWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRlbnRWaWV3OiBmdW5jdGlvbihpZCkge1xuICAgICAgICBcdGlmKHRoaXNbaWRdICYmIHRoaXNbaWRdLmN1cnJlbnRWaWV3KSB7XG4gICAgICAgIFx0XHRyZXR1cm4gdGhpc1tpZF0uY3VycmVudFZpZXc7XG4gICAgICAgIFx0fVxuXG4gICAgICAgIFx0cmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRpZighdGhpcy5nZXRPcHRpb24oJ2FjdGl2ZVRhYicpKSB7XG5cdCAgICAgICAgXHR0aGlzLiRlbC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl06Zmlyc3QnKS5jbGljaygpO1xuXHQgICAgICAgIH1cblx0ICAgICAgICBlbHNlIHtcblx0ICAgICAgICBcdHRoaXMuc2V0QWN0aXZlVGFiKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVUYWInKSk7XG5cdCAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uVGFiQ2xpY2s6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIFx0dGhpcy5zZXRBY3RpdmVUYWIoaWQpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIFRvb2xib3guVGV4dEFyZWFGaWVsZCA9IFRvb2xib3guQmFzZUZpZWxkLmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ2Zvcm0tdGV4dGFyZWEtZmllbGQnKSxcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB0cmlnZ2VyU2VsZWN0b3I6ICd0ZXh0YXJlYSdcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbnB1dEZpZWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCd0ZXh0YXJlYScpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmQgPSBUb29sYm94LkxheW91dFZpZXcuZXh0ZW5kKHtcblxuICAgICAgICBjbGFzc05hbWU6ICd3aXphcmQnLFxuXG4gICAgICAgIGNoYW5uZWxOYW1lOiAndG9vbGJveC53aXphcmQnLFxuXG4gICAgXHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkJyksXG5cbiAgICAgICAgcmVnaW9uczoge1xuICAgICAgICAgICAgcHJvZ3Jlc3M6ICcud2l6YXJkLXByb2dyZXNzJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcud2l6YXJkLWNvbnRlbnQnLFxuICAgICAgICAgICAgYnV0dG9uczogJy53aXphcmQtYnV0dG9ucydcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdrZXl1cCc6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3N1Ym1pdEZvcm1PbkVudGVyJykgJiYgZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnZm9ybScpLnN1Ym1pdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGhlYWRlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgaGVhZGVyVGFnTmFtZTogJ2gyJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJDbGFzc05hbWU6ICd3aXphcmQtaGVhZGVyJyxcbiAgICAgICAgICAgICAgICBmaW5pc2hlZENsYXNzTmFtZTogJ3dpemFyZC1maW5pc2hlZCcsXG4gICAgICAgICAgICAgICAgZml4ZWRIZWlnaHRDbGFzc05hbWU6ICdmaXhlZC1oZWlnaHQnLFxuICAgICAgICAgICAgICAgIGhhc1BhbmVsQ2xhc3NOYW1lOiAnd2l6YXJkLXBhbmVsJyxcbiAgICAgICAgICAgICAgICBwYW5lbENsYXNzTmFtZTogJ3BhbmVsIHBhbmVsLWRlZmF1bHQnLFxuICAgICAgICAgICAgICAgIGJ1dHRvblZpZXc6IFRvb2xib3guV2l6YXJkQnV0dG9ucyxcbiAgICAgICAgICAgICAgICBidXR0b25WaWV3T3B0aW9uczoge30sXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NWaWV3OiBUb29sYm94LldpemFyZFByb2dyZXNzLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzVmlld09wdGlvbnM6IHt9LFxuICAgICAgICAgICAgICAgIGhpZ2hlc3RTdGVwOiAxLFxuICAgICAgICAgICAgICAgIHN0ZXA6IDEsXG4gICAgICAgICAgICAgICAgc3RlcHM6IFtdLFxuICAgICAgICAgICAgICAgIGZpbmlzaGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzVmlldzogVG9vbGJveC5XaXphcmRTdWNjZXNzLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NWaWV3T3B0aW9uczoge30sXG4gICAgICAgICAgICAgICAgZXJyb3JWaWV3OiBUb29sYm94LldpemFyZEVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yVmlld09wdGlvbnM6IHt9LFxuICAgICAgICAgICAgICAgIHNob3dCdXR0b25zOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhbmVsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250ZW50SGVpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzdWJtaXRGb3JtT25FbnRlcjogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFRvb2xib3guTGF5b3V0Vmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVwbHkoJ2NvbXBsZXRlOnN0ZXAnLCBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcy5jdXJyZW50Vmlldy5zZXRDb21wbGV0ZShzdGVwIHx8IHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXBseSgnc2V0OnN0ZXAnLCBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHN0ZXApO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXBseSgnd2l6YXJkOmVycm9yJywgZnVuY3Rpb24ob3B0aW9ucywgZXJyb3JWaWV3KSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbignZXJyb3JWaWV3T3B0aW9ucycpLCBvcHRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgIHdpemFyZDogdGhpc1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b25zLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93VmlldyhlcnJvclZpZXcgfHwgdGhpcy5nZXRPcHRpb24oJ2Vycm9yVmlldycpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVwbHkoJ3dpemFyZDpzdWNjZXNzJywgZnVuY3Rpb24ob3B0aW9ucywgc3VjY2Vzc1ZpZXcpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe30sIHRoaXMuZ2V0T3B0aW9uKCdzdWNjZXNzVmlld09wdGlvbnMnKSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICAgICAgICB3aXphcmQ6IHRoaXNcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5lbXB0eSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoc3VjY2Vzc1ZpZXcgfHwgdGhpcy5nZXRPcHRpb24oJ3N1Y2Nlc3NWaWV3JyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXRSZWdpb25zOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICBpZih2aWV3LnJlZ2lvbnMgJiYgdmlldy5yZWdpb25NYW5hZ2VyKSB7XG4gICAgICAgICAgICAgICAgdmlldy5yZWdpb25NYW5hZ2VyLmVtcHR5UmVnaW9ucygpO1xuICAgICAgICAgICAgICAgIHZpZXcucmVnaW9uTWFuYWdlci5hZGRSZWdpb25zKHZpZXcucmVnaW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q29udGVudEhlaWdodDogZnVuY3Rpb24oaGVpZ2h0KSB7XG4gICAgICAgICAgICBoZWlnaHQgfHwgKGhlaWdodCA9IDQwMCk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtY29udGVudCcpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdmaXhlZEhlaWdodENsYXNzTmFtZScpKVxuICAgICAgICAgICAgICAgIC5jc3MoJ2hlaWdodCcsIGhlaWdodCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0U3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgdmFyIHZpZXcgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN0ZXAgPSBwYXJzZUludChzdGVwKTtcblxuICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLnN0ZXAgPCAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN0ZXAgPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignc3RlcCcpID4gdGhpcy5nZXRPcHRpb24oJ2hpZ2hlc3RTdGVwJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGlnaGVzdFN0ZXAgPSB0aGlzLmdldE9wdGlvbignc3RlcCcpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MuY3VycmVudFZpZXcucmVuZGVyKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodmlldyA9IHRoaXMuZ2V0U3RlcCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q29udGVudCh2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93VmlldzogZnVuY3Rpb24oVmlldywgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYoVmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NvbnRlbnQobmV3IFZpZXcob3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dBY3Rpdml0eUluZGljYXRvcjogZnVuY3Rpb24ob3B0aW9ucywgcmVnaW9uKSB7XG4gICAgICAgICAgICByZWdpb24gfHwgKHJlZ2lvbiA9IHRoaXMuY29udGVudCk7XG5cbiAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFRvb2xib3guQWN0aXZpdHlJbmRpY2F0b3IoXy5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ21lZGl1bScsXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0OiAnNDAwcHgnXG4gICAgICAgICAgICB9LCBvcHRpb25zKSk7XG5cbiAgICAgICAgICAgIHJlZ2lvbi5zaG93KHZpZXcsIHtcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVzdHJveTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvd1Byb2dyZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBWaWV3ID0gdGhpcy5nZXRPcHRpb24oJ3Byb2dyZXNzVmlldycpO1xuXG4gICAgICAgICAgICBpZihWaWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVmlldyhfLmV4dGVuZCh7fSwgdGhpcy5nZXRPcHRpb24oJ3Byb2dyZXNzVmlld09wdGlvbnMnKSwge1xuICAgICAgICAgICAgICAgICAgICB3aXphcmQ6IHRoaXNcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzLnNob3codmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBidXR0b24gdmlldyBpcyBub3QgYSB2YWxpZCBjbGFzcy4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93QnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgVmlldyA9IHRoaXMuZ2V0T3B0aW9uKCdidXR0b25WaWV3Jyk7XG5cbiAgICAgICAgICAgIGlmKFZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBWaWV3KF8uZXh0ZW5kKHt9LCB0aGlzLmdldE9wdGlvbignYnV0dG9uVmlld09wdGlvbnMnKSwge1xuICAgICAgICAgICAgICAgICAgICB3aXphcmQ6IHRoaXNcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbnMuc2hvdyh2aWV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGJ1dHRvbiB2aWV3IGlzIG5vdCBhIHZhbGlkIGNsYXNzLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3dDb250ZW50OiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICBpZih2aWV3KSB7XG4gICAgICAgICAgICAgICAgdmlldy5vcHRpb25zLndpemFyZCA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnQuc2hvdyh2aWV3LCB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZXN0cm95OiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2aWV3Lm9uY2UoJ2F0dGFjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0UmVnaW9ucyh2aWV3KTtcbiAgICAgICAgICAgICAgICAgICAgdmlldy50cmlnZ2VyTWV0aG9kKCd3aXphcmQ6YXR0YWNoJyk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICB2aWV3LnRyaWdnZXJNZXRob2QoJ3dpemFyZDpzaG93OnN0ZXAnLCB0aGlzLmdldE9wdGlvbignc3RlcCcpLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ3Nob3c6c3RlcCcsIHRoaXMuZ2V0T3B0aW9uKCdzdGVwJyksIHZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignc3RlcHMnKVsoc3RlcCB8fCB0aGlzLmdldE9wdGlvbignc3RlcCcpKSAtIDFdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFRvdGFsU3RlcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdzdGVwcycpLmxlbmd0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXF1ZXN0KCdjb21wbGV0ZTpzdGVwJyk7XG4gICAgICAgICAgICB0aGlzLnNldFN0ZXAodGhpcy5nZXRPcHRpb24oJ3N0ZXAnKSArIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgLSAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5pc2g6IGZ1bmN0aW9uKHN1Y2Nlc3MsIG9wdGlvbnMsIFZpZXcpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSAoXy5pc1VuZGVmaW5lZChzdWNjZXNzKSB8fCBzdWNjZXNzKSA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICAgICAgaWYoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2ZpbmlzaGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5yZXF1ZXN0KCdjb21wbGV0ZTpzdGVwJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0VG90YWxTdGVwcygpICsgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsLnJlcXVlc3QoJ3dpemFyZDpzdWNjZXNzJywgb3B0aW9ucywgVmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVxdWVzdCgnd2l6YXJkOmVycm9yJywgb3B0aW9ucywgVmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Eb21SZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdjb250ZW50SGVpZ2h0JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldENvbnRlbnRIZWlnaHQodGhpcy5nZXRPcHRpb24oJ2NvbnRlbnRIZWlnaHQnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93UHJvZ3Jlc3MnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1Byb2dyZXNzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdzaG93QnV0dG9ucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93QnV0dG9ucygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbigncGFuZWwnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdoYXNQYW5lbENsYXNzTmFtZScpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGVwKHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldy5kaXNhYmxlQnV0dG9ucygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVOZXh0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldy5kaXNhYmxlTmV4dEJ1dHRvbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVCYWNrQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldy5kaXNhYmxlQmFja0J1dHRvbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVGaW5pc2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5idXR0b25zLmN1cnJlbnRWaWV3LmRpc2FibGVGaW5pc2hCdXR0b24oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5jdXJyZW50Vmlldy5lbmFibGVCdXR0b25zKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlTmV4dEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbnMuY3VycmVudFZpZXcuZW5hYmxlTmV4dEJ1dHRvbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUJhY2tCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5idXR0b25zLmN1cnJlbnRWaWV3LmVuYWJsZUJhY2tCdXR0b24oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVGaW5pc2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5idXR0b25zLmN1cnJlbnRWaWV3LmVuYWJsZUZpbmlzaEJ1dHRvbigpO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAndW5kZXJzY29yZSddLCBmdW5jdGlvbigkLCBfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyb290LlRvb2xib3gsICQsIF8pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdC5Ub29sYm94LCByZXF1aXJlKCdqcXVlcnknKSwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LldpemFyZEJ1dHRvbnMgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cbiAgICAgICAgdGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3dpemFyZC1idXR0b25zJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLWJ1dHRvbnMtd3JhcHBlciBjbGVhcmZpeCcsXG5cbiAgICAgICAgY2hhbm5lbE5hbWU6ICd0b29sYm94LndpemFyZCcsXG5cbiAgICAgICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN0ZXA6IGZhbHNlLFxuICAgICAgICAgICAgdG90YWxTdGVwczogZmFsc2UsXG4gICAgICAgICAgICB3aXphcmQ6IGZhbHNlLFxuICAgICAgICAgICAgYnV0dG9uU2l6ZUNsYXNzTmFtZTogJ2J0bi1tZCcsXG4gICAgICAgICAgICBkZWZhdWx0QnV0dG9uQ2xhc3NOYW1lOiAnYnRuIGJ0bi1kZWZhdWx0JyxcbiAgICAgICAgICAgIHByaW1hcnlCdXR0b25DbGFzc05hbWU6ICdidG4gYnRuLXByaW1hcnknLFxuICAgICAgICAgICAgZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICBsZWZ0QnV0dG9uczogW3tcbiAgICAgICAgICAgICAgICBpY29uOiAnZmEgZmEtbG9uZy1hcnJvdy1sZWZ0JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0JhY2snLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5nZXRDdXJyZW50U3RlcCgpID09IDEgPyAnZGlzYWJsZWQgJyA6ICcnXG4gICAgICAgICAgICAgICAgICAgICkgKyB0aGlzLnBhcmVudC5nZXREZWZhdWx0QnV0dG9uQ2xhc3NlcygnYmFjaycpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmJhY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHJpZ2h0QnV0dG9uczogW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0ZpbmlzaCcsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5wYXJlbnQuZ2V0Q3VycmVudFN0ZXAoKSAhPSB0aGlzLnBhcmVudC5nZXRUb3RhbFN0ZXBzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnaGlkZSc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuZ2V0UHJpbWFyeUJ1dHRvbkNsYXNzZXMoJ2ZpbmlzaCcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNZXRob2QoJ2NsaWNrOmZpbmlzaCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGljb246ICdmYSBmYS1sb25nLWFycm93LXJpZ2h0JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ05leHQnLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMucGFyZW50LmdldEN1cnJlbnRTdGVwKCkgPT0gdGhpcy5wYXJlbnQuZ2V0VG90YWxTdGVwcygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2hpZGUnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldERlZmF1bHRCdXR0b25DbGFzc2VzKCduZXh0Jyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck1ldGhvZCgnY2xpY2s6bmV4dCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLndpemFyZC1sZWZ0LWJ1dHRvbnMgYnV0dG9uJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciAkYnV0dG9uID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICRidXR0b24uaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKCRidXR0b24uaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggdGhpcy5nZXRPcHRpb24oJ2xlZnRCdXR0b25zJylbaW5kZXhdICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdsZWZ0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdsZWZ0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdjbGljayAud2l6YXJkLXJpZ2h0LWJ1dHRvbnMgYnV0dG9uJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciAkYnV0dG9uID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICRidXR0b24uaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmKCRidXR0b24uaGFzQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggdGhpcy5nZXRPcHRpb24oJ3JpZ2h0QnV0dG9ucycpW2luZGV4XSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbigncmlnaHRCdXR0b25zJylbaW5kZXhdLm9uQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3JpZ2h0QnV0dG9ucycpW2luZGV4XS5vbkNsaWNrLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVG9vbGJveC5JdGVtVmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBfLmVhY2godGhpcy5vcHRpb25zLnJpZ2h0QnV0dG9ucywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIGl0ZW0ucGFyZW50ID0gdGhpcztcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICBfLmVhY2godGhpcy5vcHRpb25zLmxlZnRCdXR0b25zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlUmlnaHRCdXR0b246IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZihfLmlzT2JqZWN0KGluZGV4KSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh0aGlzLm9wdGlvbnMucmlnaHRCdXR0b25zLCBmdW5jdGlvbihidXR0b24sIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoYnV0dG9uID09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVJpZ2h0QnV0dG9uKGkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoXy5pc051bWJlcihpbmRleCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucmlnaHRCdXR0b25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhZGRSaWdodEJ1dHRvbjogZnVuY3Rpb24oYnV0dG9uLCBhdCkge1xuXHRcdFx0dmFyIGJ1dHRvbnMgPSBfLmNsb25lKHRoaXMub3B0aW9ucy5yaWdodEJ1dHRvbnMpO1xuXG4gICAgICAgICAgICBpZihfLmlzVW5kZWZpbmVkKGF0KSkge1xuICAgICAgICAgICAgICAgIGF0ID0gYnV0dG9ucy5sZW5ndGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJ1dHRvbi5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgYnV0dG9ucy5zcGxpY2UoYXQsIDAsIGJ1dHRvbik7XG5cblx0XHRcdHRoaXMub3B0aW9ucy5yaWdodEJ1dHRvbnMgPSBidXR0b25zO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVMZWZ0QnV0dG9uOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgaWYoXy5pc09iamVjdChpbmRleCkpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2godGhpcy5vcHRpb25zLmxlZnRCdXR0b25zLCBmdW5jdGlvbihidXR0b24sIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoYnV0dG9uID09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxlZnRCdXR0b24oaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5sZWZ0QnV0dG9ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkTGVmdEJ1dHRvbjogZnVuY3Rpb24oYnV0dG9uLCBhdCkge1xuXHRcdFx0dmFyIGJ1dHRvbnMgPSBfLmNsb25lKHRoaXMub3B0aW9ucy5sZWZ0QnV0dG9ucyk7XG5cbiAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQoYXQpKSB7XG4gICAgICAgICAgICAgICAgYXQgPSBidXR0b25zLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnV0dG9uLnBhcmVudCA9IHRoaXM7XG4gICAgICAgICAgICBidXR0b25zLnNwbGljZShhdCwgMCwgYnV0dG9uKTtcblxuXHRcdFx0dGhpcy5vcHRpb25zLmxlZnRCdXR0b25zID0gYnV0dG9ucztcblx0XHRcdHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUJ1dHRvbjogZnVuY3Rpb24oYnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuJytidXR0b24pLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdGVwczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3N0ZXBzJykgPyB0aGlzLmdldE9wdGlvbignc3RlcHMnKSA6IChcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykgPyB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdzdGVwcycpIDogW11cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q3VycmVudFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdzdGVwJykgPyB0aGlzLmdldE9wdGlvbignc3RlcCcpIDogKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKSA/IHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKSA6IDFcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VG90YWxTdGVwczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3RvdGFsU3RlcHMnKSA/IHRoaXMuZ2V0T3B0aW9uKCd0b3RhbFN0ZXBzJykgOiAoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpID8gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGggOiAxXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IHRoaXMuZ2V0Q3VycmVudFN0ZXAoKTtcbiAgICAgICAgICAgIHZhciB0b3RhbCA9IHRoaXMuZ2V0VG90YWxTdGVwcygpO1xuXG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywge1xuICAgICAgICAgICAgICAgIGlzRmlyc3RTdGVwOiBzdGVwID09IDEsXG4gICAgICAgICAgICAgICAgaXNMYXN0U3RlcDogc3RlcCA9PSB0b3RhbCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0ZXBzOiB0b3RhbFxuICAgICAgICAgICAgfSwgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLm9wdGlvbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tCYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzdGVwID0gdGhpcy5nZXRDdXJyZW50U3RlcCgpO1xuICAgICAgICAgICAgdmFyIHN0ZXBzID0gdGhpcy5nZXRTdGVwcygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignd2l6YXJkJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0U3RlcCgpLnRyaWdnZXJNZXRob2QoJ3dpemFyZDpjbGljazpiYWNrJywgc3RlcHNbc3RlcCAtIDFdKTtcblxuICAgICAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQocmVzcG9uc2UpIHx8IHJlc3BvbnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5iYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN0ZXAtLTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tOZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzdGVwID0gdGhpcy5nZXRDdXJyZW50U3RlcCgpO1xuICAgICAgICAgICAgdmFyIHN0ZXBzID0gdGhpcy5nZXRTdGVwcygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmdldE9wdGlvbignd2l6YXJkJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0U3RlcCgpLnRyaWdnZXJNZXRob2QoJ3dpemFyZDpjbGljazpuZXh0Jywgc3RlcHNbc3RlcCArIDFdKTtcblxuICAgICAgICAgICAgICAgIGlmKF8uaXNVbmRlZmluZWQocmVzcG9uc2UpIHx8IHJlc3BvbnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN0ZXArKztcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2tGaW5pc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0ZXAgPSB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0U3RlcCgpO1xuICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9IHN0ZXAudHJpZ2dlck1ldGhvZCgnd2l6YXJkOmNsaWNrOmZpbmlzaCcsIHN0ZXApO1xuXG4gICAgICAgICAgICAgICAgaWYoXy5pc1VuZGVmaW5lZChyZXNwb25zZSkgfHwgcmVzcG9uc2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmZpbmlzaCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGVwID0gdGhpcy5nZXRUb3RhbFN0ZXBzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXREZWZhdWx0QnV0dG9uQ2xhc3NlczogZnVuY3Rpb24oYXBwZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2RlZmF1bHRCdXR0b25DbGFzc05hbWUnKSArICcgJyArIHRoaXMuZ2V0T3B0aW9uKCdidXR0b25TaXplQ2xhc3NOYW1lJykgKyAnICcgKyAoYXBwZW5kIHx8ICcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRQcmltYXJ5QnV0dG9uQ2xhc3NlczogZnVuY3Rpb24oYXBwZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ3ByaW1hcnlCdXR0b25DbGFzc05hbWUnKSArICcgJyArIHRoaXMuZ2V0T3B0aW9uKCdidXR0b25TaXplQ2xhc3NOYW1lJykgKyAnICcgKyAoYXBwZW5kIHx8ICcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdidXR0b24nKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZU5leHRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLm5leHQnKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUJhY2tCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmJhY2snKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUZpbmlzaEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuZmluaXNoJykuYWRkQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUJ1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnYnV0dG9uJykucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZU5leHRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLm5leHQnKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlQmFja0J1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuYmFjaycpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVGaW5pc2hCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmZpbmlzaCcpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyd1bmRlcnNjb3JlJ10sIGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHJvb3QuVG9vbGJveCwgXyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5Ub29sYm94ID0gZmFjdG9yeShyb290LlRvb2xib3gsIHJvb3QuXyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoVG9vbGJveCwgXykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG5cdFRvb2xib3guV2l6YXJkRXJyb3IgPSBUb29sYm94Lkl0ZW1WaWV3LmV4dGVuZCh7XG5cblx0XHR0ZW1wbGF0ZTogVG9vbGJveC5UZW1wbGF0ZSgnd2l6YXJkLWVycm9yJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLWVycm9yJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgICAgIGhlYWRlclRhZ05hbWU6ICdoMycsXG4gICAgICAgICAgICBoZWFkZXI6ICdFcnJvciEnLFxuICAgICAgICAgICAgZXJyb3JJY29uOiAnZmEgZmEtdGltZXMnLFxuICAgICAgICAgICAgbWVzc2FnZTogZmFsc2UsXG4gICAgICAgICAgICBzaG93QmFja0J1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJhY2tCdXR0b25DbGFzc05hbWU6ICdidG4gYnRuLWxnIGJ0bi1wcmltYXJ5JyxcbiAgICAgICAgICAgIGJhY2tCdXR0b25MYWJlbDogJ0dvIEJhY2snLFxuICAgICAgICAgICAgYmFja0J1dHRvbkljb246ICdmYSBmYS1sb25nLWFycm93LWxlZnQnLFxuICAgICAgICAgICAgb25DbGlja0JhY2s6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICdjbGljayBidXR0b24nOiAnY2xpY2s6YmFjaydcbiAgICAgICAgfSxcblxuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrQmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiggdGhpcy5nZXRPcHRpb24oJ29uQ2xpY2tCYWNrJykgJiYgXy5pc0Z1bmN0aW9uKHRoaXMuZ2V0T3B0aW9uKCdvbkNsaWNrQmFjaycpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3B0aW9uKCdvbkNsaWNrQmFjaycpLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuc2hvd0J1dHRvbnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignd2l6YXJkJykuc2V0U3RlcCh0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdzdGVwJykgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cdH0pO1xuXG4gICAgcmV0dXJuIFRvb2xib3g7XG5cbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5JywgJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oJCwgXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCAkLCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcm9vdC5Ub29sYm94LFxuICAgICAgICAgICAgcmVxdWlyZSgnanF1ZXJ5JyksXG4gICAgICAgICAgICByZXF1aXJlKCd1bmRlcnNjb3JlJylcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC4kLCByb290Ll8pO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKFRvb2xib3gsICQsIF8pIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuXHRUb29sYm94LldpemFyZFByb2dyZXNzID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3dpemFyZC1wcm9ncmVzcycpLFxuXG4gICAgICAgIGNsYXNzTmFtZTogJ3dpemFyZC1wcm9ncmVzcy13cmFwcGVyJyxcblxuICAgICAgICBjaGFubmVsTmFtZTogJ3Rvb2xib3gud2l6YXJkJyxcblxuICAgICAgICBkZWZhdWx0T3B0aW9uczoge1xuICAgICAgICAgICAgd2l6YXJkOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IHt9LFxuICAgICAgICAgICAgYWN0aXZlQ2xhc3NOYW1lOiAnYWN0aXZlJyxcbiAgICAgICAgICAgIGNvbXBsZXRlQ2xhc3NOYW1lOiAnY29tcGxldGUnLFxuICAgICAgICAgICAgZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCdcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayAud2l6YXJkLXN0ZXAnOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciAkc3RlcCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgdmFyIHN0ZXAgPSAkc3RlcC5kYXRhKCdzdGVwJyk7XG5cbiAgICAgICAgICAgICAgICBpZiggISRzdGVwLmhhc0NsYXNzKHRoaXMuZ2V0T3B0aW9uKCdkaXNhYmxlZENsYXNzTmFtZScpKSAmJlxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignZmluaXNoZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWwucmVxdWVzdCgnc2V0OnN0ZXAnLCBzdGVwKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKSwgZnVuY3Rpb24oc3RlcCwgaSkge1xuICAgICAgICAgICAgICAgIHN0ZXAub3B0aW9ucy5sYWJlbCA9IHN0ZXAuZ2V0T3B0aW9uKCdsYWJlbCcpIHx8IHN0ZXAubGFiZWw7XG4gICAgICAgICAgICAgICAgc3RlcC5vcHRpb25zLnRpdGxlID0gc3RlcC5nZXRPcHRpb24oJ3RpdGxlJykgfHwgc3RlcC50aXRsZTtcbiAgICAgICAgICAgICAgICBzdGVwLm9wdGlvbnMuc3RlcCA9IGkgKyAxO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB0aGlzLmdldE9wdGlvbignd2l6YXJkJykub3B0aW9ucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RGlzYWJsZWQ6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcDpsdCgnK3N0ZXArJyknKS5yZW1vdmVDbGFzcyh0aGlzLmdldE9wdGlvbignZGlzYWJsZWRDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q29tcGxldGU6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldFN0ZXAoc3RlcCk7XG5cbiAgICAgICAgICAgIHZpZXcub3B0aW9ucy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcDpsdCgnKyhzdGVwIC0gMSkrJyknKS5hZGRDbGFzcyh0aGlzLmdldE9wdGlvbignY29tcGxldGVDbGFzc05hbWUnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0QWN0aXZlOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcuJyt0aGlzLmdldE9wdGlvbignYWN0aXZlQ2xhc3NOYW1lJykpLnJlbW92ZUNsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCcud2l6YXJkLXN0ZXA6bnRoLWNoaWxkKCcrc3RlcCsnKScpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMuZ2V0T3B0aW9uKCdhY3RpdmVDbGFzc05hbWUnKSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5nZXRPcHRpb24oJ2Rpc2FibGVkQ2xhc3NOYW1lJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFdpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy53aXphcmQtc3RlcCcpLmNzcygnd2lkdGgnLCAoMTAwIC8gdGhpcy5nZXRPcHRpb24oJ3dpemFyZCcpLmdldE9wdGlvbignc3RlcHMnKS5sZW5ndGgpICsgJyUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRvbVJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRXaWR0aCgpO1xuICAgICAgICAgICAgdGhpcy5zZXREaXNhYmxlZCh0aGlzLmdldE9wdGlvbignd2l6YXJkJykuZ2V0T3B0aW9uKCdoaWdoZXN0U3RlcCcpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlKHRoaXMuZ2V0T3B0aW9uKCd3aXphcmQnKS5nZXRPcHRpb24oJ3N0ZXAnKSk7XG4gICAgICAgIH1cblxuXHR9KTtcblxuICAgIHJldHVybiBUb29sYm94O1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnXSwgZnVuY3Rpb24oXykge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkocm9vdC5Ub29sYm94LCBfKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcmVxdWlyZSgndW5kZXJzY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlRvb2xib3ggPSBmYWN0b3J5KHJvb3QuVG9vbGJveCwgcm9vdC5fKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChUb29sYm94LCBfKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0VG9vbGJveC5XaXphcmRTdWNjZXNzID0gVG9vbGJveC5JdGVtVmlldy5leHRlbmQoe1xuXG5cdFx0dGVtcGxhdGU6IFRvb2xib3guVGVtcGxhdGUoJ3dpemFyZC1zdWNjZXNzJyksXG5cbiAgICAgICAgY2xhc3NOYW1lOiAnd2l6YXJkLXN1Y2Nlc3MnLFxuXG4gICAgICAgIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgICAgICAgICBoZWFkZXJUYWdOYW1lOiAnaDMnLFxuICAgICAgICAgICAgaGVhZGVyOiAnU3VjY2VzcyEnLFxuICAgICAgICAgICAgc3VjY2Vzc0ljb246ICdmYSBmYS1jaGVjaycsXG4gICAgICAgICAgICBtZXNzYWdlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIHRlbXBsYXRlSGVscGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgICAgICB9XG5cblx0fSk7XG5cbiAgICByZXR1cm4gVG9vbGJveDtcblxufSkpO1xuIl19
