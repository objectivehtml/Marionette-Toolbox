(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], function(_, Backbone) {
            return factory(root.Toolbox, _, Backbone);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore'),
            require('backbone')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone);
    }
}(this, function (Toolbox, _, Backbone) {

    function transferNodeAfter(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = view.getSelectionPoolFromElement(event.relatedTarget);
        var to = view.getSelectionPoolFromElement(event.target);

        fromWhere[view.getIdAttribute(Backbone.$(event.relatedTarget).data('id'))] = Backbone.$(event.relatedTarget).data('id');
        toWhere[view.getIdAttribute(Backbone.$(event.target).data('id'))] = Backbone.$(event.target).data('id');

        var fromModel = from.collection.findWhere(fromWhere);
        var toModel = to.collection.findWhere(toWhere);

        from.collection.removeNode(fromModel);
        to.collection.appendNodeAfter(fromModel, toModel);
    }

    function transferNodeBefore(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = view.getSelectionPoolFromElement(event.relatedTarget);
        var to = view.getSelectionPoolFromElement(event.target);


        fromWhere[view.getIdAttribute(Backbone.$(event.relatedTarget).data('id'))] = Backbone.$(event.relatedTarget).data('id');
        toWhere[view.getIdAttribute(Backbone.$(event.target).data('id'))] = Backbone.$(event.target).data('id');

        var fromModel = from.collection.findWhere(fromWhere);
        var toModel = to.collection.findWhere(toWhere);

        from.collection.removeNode(fromModel);
        to.collection.appendNodeBefore(fromModel, toModel);
    }

    function transferNodeChildren(event, view) {
        var fromWhere = {}, toWhere = {};
        var from = view.getSelectionPoolFromElement(event.relatedTarget);
        var to = view.getSelectionPoolFromElement(event.target);

        if(Backbone.$(event.target).find('.children').length == 0) {
            Backbone.$(event.target).append('<div class="children" />');
        }

        fromWhere[view.getIdAttribute(Backbone.$(event.relatedTarget).data('id'))] = Backbone.$(event.relatedTarget).data('id');
        toWhere[view.getIdAttribute(Backbone.$(event.target).data('id'))] = Backbone.$(event.target).data('id');

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
