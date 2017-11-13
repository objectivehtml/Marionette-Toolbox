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

        childViewTriggers: {
            'drag:move': 'drag:move',
            'drag:end': 'drag:end',
            'drag:start': 'drag:start',
            'drag:enter': 'drag:enter',
            'drag:leave': 'drag:leave',
            'drop:deactivate': 'drop:deactivate',
            'drop:move': 'drop:move'
        },

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

            //this.root().triggerMethod('drop:move', event, this);
        },

        onDragMove: function(event) {
            var target = this._ghostElement.get(0);

            var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);

            //this.root().triggerMethod('drag:move', event, this);
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

            //this.root().triggerMethod('drag:start', event, this);
        },

        onDragEnd: function(event) {
            $(event.target).css('opacity', 100);

            this._ghostElement.remove();
            //this.root().triggerMethod('drag:end', event, this);
        },

        onDragEnter: function(event) {
            //this.root().triggerMethod('drag:enter', event, this);
        },

        onDragLeave: function(event) {
            $(event.target).removeClass('drop-before drop-after drop-children');

            //this.root().triggerMethod('drag:leave', event, this);
        },

        onDropDeactivate: function(event) {
            $(event.target).removeClass('drop-before drop-after drop-children');

            //this.root().triggerMethod('drop:deactivate', event, this);
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
