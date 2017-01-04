(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jQuery', 'backbone.marionette', 'interact.js'], function(_, $, Marionette, interact) {
            return factory(root.Toolbox, _, $, Marionette, interact);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore'),
            require('jQuery'),
            require('backbone.marionette'),
            require('interact.js')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.$, root.Marionette, root.interact);
    }
}(this, function (Toolbox, _, $, Marionette, interact) {

    Toolbox.DraggableTreeNode = Toolbox.TreeViewNode.extend({

        className: 'draggable-tree-node',

        defaultOptions: function() {
            return _.extend({}, Toolbox.TreeViewNode.prototype.defaultOptions, {
                menuClassName: 'menu',
                menuView: Toolbox.DropdownMenu,
                menuViewOptions: {
                    tagName: 'div'
                },
                menuItems: []
            });
        },

        initialize: function() {
            Toolbox.CompositeView.prototype.initialize.apply(this, arguments);

            this.collection = this.model.children;

            var options = _.extend({}, this.options);

            delete options.model;

            this.childViewOptions = _.extend({}, options, this.getOption('childViewOptions') || {});
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

            Dropzones(event.dragEvent, event.target, {
                before: function($element) {
                    $(event.relatedTarget).insertBefore($element);
                    self.root().triggerMethod('drop:before', event, self);
                },
                after: function($element) {
                    $(event.relatedTarget).insertAfter($element);
                    self.root().triggerMethod('drop:after', event, self);
                },
                children: function($element) {
                    var $children = $element.find('.children').first();
                    if(!$children.length) {
                        $element.prepend($children = $('<ul/>').addClass('children'));
                    }
                    $children.prepend(event.relatedTarget);
                    self.root().triggerMethod('drop:children', event, self);
                }
            });

            self.root().triggerMethod('drop', event, this);
        },

        onDropMove: function(event) {
            Dropzones(event, event.dropzone.element(), {
                before: function($element) {
                    $element.addClass('droppable drop-before')
                        .removeClass('drop-after drop-children');
                },
                after: function($element) {
                    $(event.dropzone.element())
                        .addClass('droppable drop-after')
                        .removeClass('drop-before drop-children');
                },
                children: function($element) {
                    $(event.dropzone.element())
                        .addClass('droppable drop-children')
                        .removeClass('drop-after drop-before')
                }
            });
        },

        onDragMove: function(event) {
            this.$el.addClass('dragging');

            var target = event.target;

            var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // translate the element
            target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);

            this.root().triggerMethod('drag:move', event, this);
        },

        onDragStart: function() {
            this.root().triggerMethod('drag:start', event, this);
        },

        onDragEnd: function(event) {
            this.$el.removeClass('dragging');

            $(event.target).attr({
                'data-x': false,
                'data-y': false,
                'style': false
            });

            this.root().triggerMethod('drag:end', event, this);
        },

        onDragEnter: function() {
            this.root().triggerMethod('drag:enter', event, this);
        },

        onDragLeave: function(event) {
            $(event.target).removeClass('droppable drop-before drop-after drop-children');

            this.root().triggerMethod('drag:leave', event, this);
        },

        onDropDeactivate: function(event) {
            $(event.target).removeClass('droppable drop-before drop-after drop-children');

            this.root().triggerMethod('drop:deactivate', event, this);
        },

        onDomRefresh: function() {
            var self = this, $el = this.$el;

            interact(this.$el.get(0))
                .allowFrom('.drag-handle')
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
                });

            interact(this.$el.get(0))
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

    Toolbox.DraggableTreeView = Toolbox.TreeView.extend({

        childView: Toolbox.DraggableTreeNode,

        className: 'draggable-tree'

    });

    var ViewOffset = function(node, singleFrame) {
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

                if (node.scrollLeft)
                    coords.x += node.scrollLeft;
                if (node.scrollTop)
                    coords.y += node.scrollTop;

                var win = node.ownerDocument.defaultView;

                if (win && (!singleFrame && win.frameElement))
                    addOffset(win.frameElement, coords, win);
            }
        }

        var coords = { x: 0, y: 0 };

        if (node)
            addOffset(node, coords, node.ownerDocument.defaultView);

        return coords;
    }

    var Dropzones = function(event, element, callbacks) {
        var offset = ViewOffset(element);
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
            callbacks.before ? callbacks.before.call(self, $(element)) : null;
        }
        else if(event.pageY > bottom - heightThreshold || event.pageX < left + widthThreshold) {
            callbacks.after ? callbacks.after.call(self, $(element)) : null;
        }
        else {
            callbacks.children ? callbacks.children.call(self, $(element)) : null;
        }
    };

    return Toolbox;

}));
