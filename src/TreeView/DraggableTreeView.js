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
