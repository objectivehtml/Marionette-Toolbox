(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('handlebars'));
    } else if (typeof define === 'function' && define.amd) {
        define(['handlebars'], factory);
    } else {
        root.HandlebarsHelpersRegistry = factory(root.Handlebars);
    }
}(this, function (Handlebars) {

    Handlebars.registerHelper('propertyOf', function(subject, prop) {
        console.log(subject, prop);

        if(subject.hasOwnProperty(prop)) {
            return new Handlebars.SafeString(subject[prop]);
        }

        return null;
    });

}));
