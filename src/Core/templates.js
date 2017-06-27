(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['activity-indicator'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "dimmed";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "position:"
    + container.escapeExpression(((helper = (helper = helpers.position || (depth0 != null ? depth0.position : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"position","hash":{},"data":data}) : helper)))
    + ";";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return "background-color: "
    + container.escapeExpression(((helper = (helper = helpers.dimmedBgColor || (depth0 != null ? depth0.dimmedBgColor : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"dimmedBgColor","hash":{},"data":data}) : helper)))
    + ";";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<span class=\"activity-indicator-label\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.labelFontSize : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"><span class=\"activity-indicator-label-text\">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span></span>";
},"8":function(container,depth0,helpers,partials,data) {
    var helper;

  return "font-size:"
    + container.escapeExpression(((helper = (helper = helpers.labelFontSize || (depth0 != null ? depth0.labelFontSize : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"labelFontSize","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"activity-indicator-dimmer "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.dimmed : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.position : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.dimmedBgColor : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n\n	<span class=\"activity-indicator\">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</span>\n\n</div>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-error'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['breadcrumb'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['no-breadcrumbs'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['button-dropdown-menu'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['button-group-item'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i> ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['no-button-group-item'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['calendar-monthly-day-view'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "	<span class=\"calendar-has-events\"><i class=\"fa fa-circle\"></i></span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "<span class=\"calendar-date\">"
    + container.escapeExpression(((helper = (helper = helpers.day || (depth0 != null ? depth0.day : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"day","hash":{},"data":data}) : helper)))
    + "</span>\n\n"
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || alias2).call(alias1,((stack1 = (depth0 != null ? depth0.events : depth0)) != null ? stack1.length : stack1),">","0",{"name":"is","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['calendar-monthly-view'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"calendar-masthead\">\n	<nav class=\"calendar-navigation\">\n		<a href=\"#\" class=\"calendar-navigation-prev\"><i class=\"fa fa-angle-left\"></i></a>\n		<a href=\"#\" class=\"calendar-navigation-next\"><i class=\"fa fa-angle-right\"></i></a>\n	</nav>\n\n	<div class=\"calendar-header\"></div>\n	<div class=\"calendar-sub-header\"></div>\n</div>\n\n<div class=\"calendar-view\">\n	<div class=\"indicator\"></div>\n\n	<table class=\"calendar-monthly-view\">\n		<thead>\n			<tr>\n				<th>Sun</th>\n				<th>Mon</th>\n				<th>Tue</th>\n				<th>Wed</th>\n				<th>Thur</th>\n				<th>Fri</th>\n				<th>Sat</th>\n			</tr>\n		</thead>\n		<tbody></tbody>\n	</table>\n</div>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-checkbox-field'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['dropdown-menu-item'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['dropdown-menu-no-items'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['dropdown-menu'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['inline-editor'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"inline-editor-label\"></div>\n\n<i class=\"fa fa-pencil inline-editor-edit-icon\"></i>\n\n<div class=\"inline-editor-field\"></div>\n\n<div class=\"inline-editor-activity-indicator\"></div>";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-input-field'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-light-switch-field'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['list-group-item'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"list-group-item-actions\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasEditForm : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasDeleteForm : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "        <a href=\"#\" class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.editButton : depth0)) != null ? stack1.className : stack1), depth0))
    + "\"><i class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.editButton : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\"></i> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.editButton : depth0)) != null ? stack1.label : stack1), depth0))
    + "</a>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "        <a href=\"#\" class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.deleteButton : depth0)) != null ? stack1.className : stack1), depth0))
    + "\"><i class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.deleteButton : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\"></i> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.deleteButton : depth0)) != null ? stack1.label : stack1), depth0))
    + "</a>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "	<span class=\"badge\">"
    + container.escapeExpression(((helper = (helper = helpers.badge || (depth0 != null ? depth0.badge : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"badge","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.showActionButtons : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.badge : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['no-list-group-item'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "    "
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "    No items found.\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.message : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['modal-window'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['notification'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['no-ordered-list-item'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['ordered-list-item'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['pager'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['pagination-item'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['pagination'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<ul class=\"pagination "
    + container.escapeExpression(((helper = (helper = helpers.paginationClassName || (depth0 != null ? depth0.paginationClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"paginationClassName","hash":{},"data":data}) : helper)))
    + "\">\n	<li>\n		<a href=\"#\" class=\"prev-page\" aria-label=\"Previous\">\n			<span aria-hidden=\"true\">&laquo;</span>\n		</a>\n	</li>\n    <li>\n		<a href=\"#\" class=\"next-page\" aria-label=\"Next\">\n			<span aria-hidden=\"true\">&raquo;</span>\n		</a>\n    </li>\n</ul>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['popover'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <a href=\"#\" class=\"popover-close\"><i class=\"fa fa-times-circle\"></i></a>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + " class=\""
    + alias4(((helper = (helper = helpers.headerClassName || (depth0 != null ? depth0.headerClassName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerClassName","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper)))
    + "</"
    + alias4(((helper = (helper = helpers.headerTagName || (depth0 != null ? depth0.headerTagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"headerTagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.showCloseButton : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<div class=\"arrow\"></div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<div class=\"popover-content\"></div>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['progress-bar'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-radio-field'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['range-slider'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"slider\"></div>";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-select-field'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['selection-pool-tree-node'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <ul class=\"children\"></ul>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<i class=\"fa fa-bars drag-handle\"></i>\n\n<span class=\"node-name\">"
    + container.escapeExpression(((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper)))
    + "</span>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasChildren : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['selection-pool'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['table-activity-indicator-row'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['table-no-items'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression;

  return "<td colspan=\""
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.columns : depth0)) != null ? stack1.length : stack1), depth0))
    + "\">\n	"
    + alias1(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper)))
    + "\n</td>";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['table-view-footer'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['table-view-group'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
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
    + "<table class=\""
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['table-view-pagination'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div></div>";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['table-view-row'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return "	<td data-id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3((helpers.propertyOf || (depth0 && depth0.propertyOf) || alias2).call(alias1,depths[1],(depth0 != null ? depth0.id : depth0),{"name":"propertyOf","hash":{},"data":data}))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.columns || (depth0 != null ? depth0.columns : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"columns","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.columns) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['tab-content'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['tabs'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<!-- Nav tabs -->\n<ul class=\""
    + container.escapeExpression(((helper = (helper = helpers.tabClassName || (depth0 != null ? depth0.tabClassName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"tabClassName","hash":{},"data":data}) : helper)))
    + "\" role=\"tablist\"></ul>\n\n<!-- Tab panes -->\n<div class=\"tab-content\"></div>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-tag-field'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<label class=\"tag-field-label\">\n    "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n    <div class=\"form-control\">\n        <div class=\"tag-field-cursor\"></div>\n        <div class=\"tags-container\"></div>\n        <div class=\"tag-field-activity\"></div>\n    </div>\n\n    <div class=\"tag-field-search-results\"></div>\n</label>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-tag-list-item'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\"#\" class=\"tag-clear tag-focusable\">\n    <span class=\"tag-label\">"
    + alias4(((helper = (helper = helpers.__label__ || (depth0 != null ? depth0.__label__ : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"__label__","hash":{},"data":data}) : helper)))
    + "</span>\n    <i class=\"fa fa-times-circle\"></i>\n    <input type=\"hidden\" name=\""
    + alias4(((helper = (helper = helpers.__name__ || (depth0 != null ? depth0.__name__ : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"__name__","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.__value__ || (depth0 != null ? depth0.__value__ : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"__value__","hash":{},"data":data}) : helper)))
    + "\">\n</a>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-tag-prediction-item'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<span class=\"tag-prediction-label\">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper)))
    + "</span> <a href=\"#\" class=\"tag-clear-prediction\"><i class=\"fa fa-times-circle\"></i></a>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-tag-result-item'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<a href=\"#\" class=\"tag-result-label\">"
    + container.escapeExpression(((helper = (helper = helpers.__label__ || (depth0 != null ? depth0.__label__ : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"__label__","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['draggable-tree-view-node'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <ul class=\"children\"></ul>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<i class=\"fa fa-bars drag-handle\"></i>\n\n<div class=\"node-name\">\n    <span>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>\n</div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasChildren : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['no-tree-view-nodes'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<p>This tree has no nodes.</p>\n";
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['tree-view-node'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <ul class=\"children\"></ul>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasChildren : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['form-textarea-field'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['no-unordered-list-item'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['unordered-list-item'] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "");
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['wizard-buttons'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['wizard-error'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['wizard-progress'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
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
},"useData":true,"useDepths":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['wizard-success'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));
(function (root, factory) {
   if (typeof define === 'function' && define.amd) {
       define(['handlebars'], function(Handlebars) {
           return factory(root.Toolbox, Handlebars)
       });
   } else if (typeof exports === 'object') {
       module.exports = factory(root.Toolbox, require('handlebars'));
   } else {
       factory(root.Toolbox, root.Handlebars);
   }
}(this, function (Toolbox, Handlebars) {
   Toolbox.templates['wizard'] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
}));