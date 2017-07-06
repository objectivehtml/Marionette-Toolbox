(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'underscore',
            'backbone',
            'backbone.radio',
            'backbone.marionette',
            'mousetrap'
        ], function(_, Backbone, Radio, Marionette, Mousetrap) {
            return factory(root.Toolbox, _, Backbone, Radio, Marionette, Mousetrap);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(
            root.Toolbox,
            require('underscore'),
            require('backbone'),
            require('backbone.radio'),
            require('backbone.marionette'),
            require('mousetrap')
        );
    } else {
        root.Toolbox = factory(root.Toolbox, root._, root.Backbone, root.Radio, root.Marionette, root.Mousetrap);
    }
}(this, function (Toolbox, _, Backbone, Radio, Marionette, Mousetrap) {

    'use strict';

    Toolbox.TagField = Toolbox.BaseField.extend({

        className: 'tag-field',

        template: Toolbox.Template('form-tag-field'),

        regions: {
            tags: '.tags-container',
            activity: '.tag-field-activity',
            results: {
                el: '.tag-field-search-results',
                replaceElement: true
            }
        },

        defaultOptions: {

            // (mixed) A view class to override the default ActivityIndicator view
            activityIndicatorView: false,

            // (object) An object of options to pass to the view
            activityIndicatorOptions: {
                indicator: 'tiny'
            },

            // (mixed) The current value of the field. Should be array if multiple
            // or a object if not multiple. False if no value.
            value: false,

            // (bool) Does the field allow for multiple tags
            multiple: true,

            // (bool) Should the field search for tags using ajax HTTP requests
            ajaxSearch: false,

            // (array) An array of headers appended to the request
            requestHeaders: [],

            // (array) The default options used to generate the query string
            defaultRequestDataOptions: [
                'page',
                'limit',
                'order',
                'sort'
            ],

            // (object) An option to pass an object with request data
            requestData: {},

            // (array) Additional options used to generate the query string
            requestDataOptions: [],

            // (string) The property in the search results model to search when typing
            searchProperty: false,

            // (string) The property from the search results model to display in the tag
            labelProperty: false,

            // (string) The property from the search results model to display in the tag
            valueProperty: false,

            // (string) The CSS selector to get the input DOM element
            triggerSelector: '.tag-field-input',

            // (int) Number of milliseconds used to determine when user quits typing
            typingStoppedThreshold: 150,

            // (mixed) A View class used to display the input field
            inputView: false,

            // (object) The input view options object
            inputViewOptions: {
                inputClassName: 'tag-field-input tag-focusable'
            },

            // (bool) Should show search results on focus
            showResultsOnFocus: false
        },

        // TODO: Need to create a Mixin for these methods that were taken from TableView
        getRequestData: function() {
            var data = {}, options = _.result(this.options, 'requestDataOptions');
            var defaultOptions = _.result(this.options, 'defaultRequestDataOptions');

            _.each(([]).concat(defaultOptions, options), function(name) {
                data[name] = _.result(this.options, name);
            }, this);

            data = _.filter(data, function(item) {
                return !(_.isUndefined(item) || _.isNull(item) || item === false)
            });

            return _.extend(data, _.result(this.options, 'requestData'));
        },
        //end mixin

        // TODO: Make a mixin to show/hide activity indicator views taken from Popover.js
        // Need to replace all over application showActivityIndicator() methods with mixin
        showActivityIndicator: function(options) {
            var ActivityView = this.getOption('activityIndicatorView') || Toolbox.ActivityIndicator;
            var activityViewOptions = options || this.getOption('activityIndicatorOptions');

            if(!activityViewOptions.minHeight && this.getContentHeight) {
                activityViewOptions.minHeight = this.getContentHeight();
            }

            var view = new ActivityView(activityViewOptions);

            this.showChildView('activity', view);
        },

        hideActivityIndicator: function() {
            if(this.getRegion('activity')) {
                this.getRegion('activity').empty();
            }
        },
        //end mixin

        cancelHttpRequest: function() {
            if(this._xhr) {
                this._xhr.abort();
                this._xhr = false;
            }
        },

        fetch: function() {
            var self = this, data = this.getRequestData(), deferred = Backbone.$.Deferred();

            deferred.notifyWith(self, [data]);

            this.collection.reset();

            this.triggerMethod('fetch', data);

            this.collection.fetch({
                data: data,
                beforeSend: function(xhr) {
                    self._xhr = xhr;

                    if(self.getOption('requestHeaders')) {
                        _.each(self.getOption('requestHeaders'), function(value, name) {
                            xhr.setRequestHeader(name, value);
                        });
                    }

                    self.triggerMethod('fetch:before:send', xhr);
                },
                success: function(collection, response) {
                    deferred.resolveWith(self, [collection, response]);
                    self.triggerMethod('fetch:complete', true, collection, response);
                    self.triggerMethod('fetch:success', collection, response);
                },
                error: function(collection, response) {
                    deferred.rejectWith(self, [collection, response]);
                    self.triggerMethod('fetch:complete', false, collection, response);
                    self.triggerMethod('fetch:error', collection, response)
                }
            });

            return deferred.promise();
        },
        // End mixin

        bindHotkeys: function() {
            var self = this;

            this._globalMousetrap = new Mousetrap(this.$el.get(0));
            this._inputMousetrap = new Mousetrap(this.$el.find('.tag-field-input').get(0));

            this._globalMousetrap.bind('mod+a', function(e) {
                if(!e.target.value) {
                    self.selectAll();
                    e.preventDefault();
                }
            });

            this._globalMousetrap.bind('left', function(e) {
                self.shiftFocusLeft();
            });

            this._globalMousetrap.bind('right', function(e) {
                self.shiftFocusRight();
            });

            this._globalMousetrap.bind('shift+left', function(e) {
                self.shiftFocusLeft(true);
            });

            this._globalMousetrap.bind('shift+right', function(e) {
                self.shiftFocusRight(true);
            });

            this._globalMousetrap.bind(['backspace'], function(e) {
                if(!e.target.value) {
                    self._backspaceHandler.call(self, e);
                }
            });

            this._inputMousetrap.bind(['esc'], function(e) {
                self.hideResultsElement();
                self.hidePredictionsElement();
                e.preventDefault();
            });

            this._inputMousetrap.bind(['enter'], function(e) {
                if(self.$el.find('.tag.has-focus').length) {
                    self._backspaceHandler.call(self, e);
                }
            });

            this._inputMousetrap.bind(['tab', 'enter'], function(e) {
                var resultsView = self.getRegion('results').currentView;

                if(e.target.value) {
                    self.addTag(self.findPrediction(e.target.value) || e.target.value);

                    if(!self.getOption('showResultsOnFocus')) {
                        self.hideResultsElement();
                        self._predictions.reset();
                    }

                    e.preventDefault();
                }
                else if(!resultsView.$el.hasClass('hide') && resultsView.getActiveText()) {
                    self.addTag(self.findPrediction(resultsView.getActiveText()));

                    e.preventDefault();
                }
            });

            this._globalMousetrap.bind('up', function(e) {
                if(self.getRegion('predictions').currentView.getActiveText()) {
                    self.getRegion('predictions').currentView.changePredictionUp(self.getInputValue());
                }
                else if(self.getOption('showResultsOnFocus')) {
                    var resultsView = self.getRegion('results').currentView;

                    if(resultsView.getActiveText()) {
                        resultsView.changePredictionUp(self.getInputValue());
                    }
                    else {
                        resultsView.activate(resultsView.children.last());
                    }
                }

                self._lastVerticalKeyPress = 'up';

                e.preventDefault();
            });

            this._globalMousetrap.bind('down', function(e) {
                if(self.getRegion('predictions').currentView.getActiveText()) {
                    self.getRegion('predictions').currentView.changePredictionDown(self.getInputValue());
                }
                else if(self.getOption('showResultsOnFocus')) {
                    var resultsView = self.getRegion('results').currentView;

                    if(resultsView.getActiveText()) {
                        resultsView.changePredictionDown(self.getInputValue());
                    }
                    else {
                        resultsView.activate(resultsView.children.first());
                    }
                }

                self._lastVerticalKeyPress = 'down';

                e.preventDefault();
            });
        },

        findPrediction: function(query) {
            var where = {}, activeText = this.getRegion('predictions').currentView.getActiveText();

            where[this.getOption('searchProperty')] = (activeText || query).trim();

            return this._predictions.findWhere(where);
        },

        unbindHotkeys: function() {
            if(this._globalMousetrap && this._inputMousetrap) {
                this._globalMousetrap.reset();
                this._inputMousetrap.reset();
            }
        },

        doesTagExist: function(tag) {
            if(!(tag instanceof Backbone.Model)) {
                tag = new Backbone.Model(tag);
            }

            var where = {};

            where[this.getOption('searchProperty')] = tag.get(this.getOption('searchProperty'));

            return !!this._tags.findWhere(tag.toJSON());
        },

        addTags: function(tags, options) {
            if(tags instanceof Array) {
                tags = new Backbone.Collection(tags);
            }

            if(!(tags instanceof Backbone.Collection)) {
                throw new Error('The argument must be an instance of Array or Backbone.Collection');
            }

            tags.each(function(tag) {
                this.addTag(tag, options);
            }, this);
        },

        addTag: function(tag, options) {
            if(!(tag instanceof Backbone.Model)) {
                var data = {};
                data[this.getOption('searchProperty')] = tag;
                tag = new Backbone.Model(data);
            }

            if(!this.doesTagExist(tag)) {
                this.triggerMethod('before:tag:add', tag);
                this.hidePredictionsElement();
                this.clearInputValue();
                this._predictions.remove(this._tags.add(tag, options), {
                    sort: false
                });
                this.triggerMethod('after:tag:add', tag);
            }
        },

        removeTags: function(tags) {
            if(tags instanceof Array) {
                tags = new Backbone.Collection(tags);
            }

            if(!(tags instanceof Backbone.Collection)) {
                throw new Error('The argument must be an instance of Array or Backbone.Collection');
            }

            tags.each(function(tag) {
                this.removeTag(tag);
            }, this);
        },

        removeTag: function(tag) {
            this.triggerMethod('before:tag:remove', tag);
            this._tags.remove(tag);
            this.triggerMethod('after:tag:remove', tag);
        },

        hideResultsElement: function() {
            this.getRegion('results').currentView.$el.addClass('hide');
        },

        showResultsElement: function() {
            this.getRegion('results').currentView.$el.removeClass('hide');
        },

        hidePredictionsElement: function() {
            this.getRegion('predictions').currentView.$el.addClass('hide');
        },

        showPredictionsElement: function() {
            this.getRegion('predictions').currentView.$el.removeClass('hide');
        },

        setFocusOnElement: function($el) {
            this.getRegion('tags').currentView.setFocusOnElement($el);
        },

        getElementWithNextFocus: function() {
            return this.getRegion('tags').currentView.getElementWithNextFocus();
        },

        getFocusedTags: function() {
            return this.getRegion('tags').currentView.getFocusedTags();
        },

        getTotalTags: function() {
            return this._tags.length;
        },

        getTotalFocusedTags: function() {
            return this.getRegion('tags').currentView.getTotalFocusedTags();
        },

        removeFocusedTags: function() {
            this.getFocusedTags().each(function(view) {
                this.removeTag(view.model);
            }, this);
        },

        selectAll: function() {
            this.getRegion('tags').currentView.selectAll();
        },

        unselectAll: function() {
            this.getRegion('tags').currentView.unselectAll();
        },

        shiftFocusLeft: function(multiple) {
            this.getRegion('tags').currentView.setFocusDirection('prev');
            this.getRegion('tags').currentView.shiftFocusLeft(multiple);
        },

        shiftFocusRight: function(multiple) {
            this.getRegion('tags').currentView.setFocusDirection('next');
            this.getRegion('tags').currentView.shiftFocusRight(multiple);
        },

        getCursorElement: function() {
            return this.$el.find('.tag-field-cursor');
        },

        getCursorValue: function() {
            this.$el.find('.tag-field-cursor').html();
        },

        setCursorValue: function(value) {
            this.$el.find('.tag-field-cursor').html(value);
        },

        getInputView: function() {
            var InputView = this.getOption('InputView') || Toolbox.InputField.extend({
                tagName: 'li',
                className: 'tag-field-input-wrapper'
            });

            return new InputView(this.getOption('inputViewOptions'));
        },

        getInputValue: function() {
            return this.getInputField().val();
        },

        getInputField: function() {
            return this.$el.find('.tag-field-input');
        },

        getInputWrapper: function() {
            return this.$el.find('.tag-field-input-wrapper')
        },

        clearInputValue: function() {
            this.getInputField().val('');
        },

        setInputFieldWidth: function(width) {
            var maxWidth = this.$el.find('.form-control').width();

            width || (width = this.getCursorElement().outerWidth() + this.em.width);

            if(width > maxWidth) {
                width = maxWidth;
            }

            this.$el.find('.tag-field-input').css({
                'width': width,
                'max-width': maxWidth,
                'min-width': maxWidth / 3
            });
        },

        rank: function(collection, subject, comparator) {
            var results = collection.each(function(model) {
                this.rankModel(model, subject);
            }, this);

            return new collection.constructor(results, {
                comparator: (comparator || function(a, b) {
                    return a.likeness > b.likeness;
                })
            });
        },

        rankModel: function(model, subject) {
            var data = model.get(this.getOption('searchProperty'));
            var value = _.isString(data) ? data.toUpperCase() : data;

            model.likeness = 0;
            model.isMatch = false;
            model.isAdded = this._tags.contains(model);

            if(value) {
                model.likeness = new Toolbox.Levenshtein(subject, value).likeness();
                model.isMatch = value.match(new RegExp('^'+subject, 'i')) ? true : false;
            }

            return model;
        },

        findLiteralMatches: function(collection, value) {
            var subject = value.toUpperCase();

            var results = this.rank(collection, value)
                .filter(function(model) {
                    return model.isMatch;
                })
                .filter(function(model) {
                    return !this.doesTagExist(model.toJSON());
                }, this);

            return new collection.constructor(results);
        },

        findLikeMatches: function(collection, value, likenessThreshold) {
            var subject = value.toUpperCase();

            likenessThreshold || (likenessThreshold = 60);

            var results = this.rank(collection, value).filter(function(model) {
                return model.isMatch || model.likeness >= likenessThreshold;
            });

            return new collection.constructor(results);
        },

        resetPredictions: function(collection) {
            collection || (collection = this.collection);

            // this.hideResultsElement();

            if(collection.length) {
                var models = collection.filter(function(model) {
                    return !this.doesTagExist(model.toJSON());
                }, this);

                this._predictions.set(models, {
                    sort: false
                });
            }

            this._lastVerticalKeyPress = false;
        },

        startTypingDetection: function() {
            this._detection = new Toolbox.TypingDetection(
                this.getInputField(),
                this.getOption('typingStoppedThreshold')
            );

            this._detection.on('typing:started', function() {
                this.triggerMethod('typing:started');
            }, this);

            this._detection.on('typing:stopped', function(newValue, oldValue, event) {
                if(newValue !== oldValue) {
                    this.triggerMethod('typing:stopped', newValue, oldValue);
                }
            }, this);

            return this._detection;
        },

        showTags: function() {
            this._tags = new Backbone.Collection;

            var view = new Toolbox.TagList({
                collection: this._tags,
                name: this.getOption('name'),
                multiple: this.getOption('multiple'),
                labelProperty: this.getOption('labelProperty'),
                valueProperty: this.getOption('valueProperty'),
                searchProperty: this.getOption('searchProperty')
            });

            view.on('click:clear', function(child, event) {
                this.removeTag(child.model);
            }, this);

            if(this.getOption('value')) {
                this._tags.add(this.getOption('value'));
            }

            this.showChildView('tags', view);

            view.addChildView(this.getInputView(), 1000);
        },

        getCursorPredictionElement: function() {
            return this.$el.find('.tag-field-cursor-prediction');
        },

        positionCursorPredictions: function(width) {
            var region = this.getRegion('predictions');

            if(region && region.currentView) {
                region.currentView.$el.css({
                    left: width || this.getCursorElement().width()
                });
            }
        },

        showSearchResults: function() {
            var self = this, view = new Toolbox.TagSearchResults({
                tags: this._tags,
                collection: this._predictions,
                labelProperty: this.getOption('labelProperty'),
                valueProperty: this.getOption('valueProperty'),
                searchProperty: this.getOption('searchProperty')
            });

            view.on('result:mouseenter', function(child, e) {
                this.activate(child);
            });

            view.on('result:mouseleave', function(child, e) {
                this.deactivate(child);
            });

            view.on('result:click', function(child, e) {
                var nextView = view.children.findByIndex(child.$el.next().index());

                this.addTag(child.model);

                if(nextView) {
                    view.activate(nextView);
                }
            }, this);

            view.on('activate', function(child) {
                if(this.getRegion('predictions').currentView) {
                    var predictionsView = this.getRegion('predictions').currentView;
                    var childView = predictionsView.children.findByModel(child.model);

                    if(childView) {
                        this.getRegion('predictions').currentView.deactivate();
                        childView.activate();
                        this.hideTextInPrediction();
                    }
                }
            }, this);

            this.showChildView('results', view);
        },

        showCursorPredictions: function() {
            if(!this.getRegion('predictions')) {
                var $el = Backbone.$('<div class="tag-field-cursor-predictions" />');
                this.$el.find('.tag-field-input-wrapper').append($el);
                this.addRegion('predictions', {
                    el: $el.get(0),
                    replaceElement: true
                });
            }

            var view = new Toolbox.TagPredictions({
                collection: this._predictions,
                searchProperty: this.getOption('searchProperty')
            });

            view.on('activate', function(child) {
                this.getRegion('results').currentView.activate(child);
            }, this);

            view.on('clear:prediction', function() {
                this.hidePredictionsElement();
                this.focus();
            }, this);

            this.showChildView('predictions', view);
        },

        hasReachedMaxLimit: function() {
            return (
                !this.getOption('multiple') && this.getTotalTags() > 0 ||
                this.getOption('maxTags') && this.getOption('maxTags') >= this.getTotalTags()
            );
        },

        hideTextInPrediction: function(value) {
            if(this.getRegion('predictions')) {
                this.getRegion('predictions').currentView.hideTextInPrediction(value || this.getInputValue());
            }
        },

        search: function(query) {
            var self = this, deferred = Backbone.$.Deferred();

            if(this.getOption('ajaxSearch')) {
                this.fetch().progress(function(data) {
                    deferred.notifyWith(self, [data]);
                }).done(function(collection, response) {
                    deferred.resolveWith(self, [query ? this.findLiteralMatches(collection, query): collection, response]);
                }).fail(function(collection, response) {
                    deferred.rejectWith(self, [collection, response]);
                });
            }
            else {
                deferred.resolveWith(self, [this.findLiteralMatches(this.collection, query)]);
            }

            return deferred.promise();
        },

        onBeforeTagAdd: function(tag) {
            this.cancelHttpRequest();
        },

        onAfterTagAdd: function(tag) {
            this._detection.clearTimer();
            this._detection.clearLastValue();

            if(this.hasReachedMaxLimit()) {
                this.$el.addClass('max-limit-reached');
                this.hideResultsElement();
            }

            if(!this._predictions.length) {
                this.resetPredictions();
            }
        },

        onAfterTagRemove: function(tag) {
            if(!this.hasReachedMaxLimit()) {
                this.$el.removeClass('max-limit-reached');
            }

            if(this._predictions.length) {
                this._predictions.add(tag);
            }
        },

        onFocus: function() {
            this.$el.find('.tag').removeClass('has-focus');
            this.$el.addClass('has-focus');

            if(this.getOption('showResultsOnFocus')) {
                this.hidePredictionsElement();
                this.showResultsElement();
                this.resetPredictions();
                //this.getRegion('results').currentView.ensureActiveElement();
            }
        },

        onBlur: function() {
            this.$el.removeClass('has-focus');
            this.hidePredictionsElement();
            this.hideResultsElement();

            if(!this.getOption('showResultsOnFocus')) {
                this._predictions.reset();
            }
        },

        onKeydown: function(child, event) {
            var value = this.getInputValue();

            if(event.keyCode === 8) {
                this.hideTextInPrediction(value.substr(0, value.length - 1));
            }
        },

        onKeypress: function(child, event) {
            if(this._isPrintableKeycode(event.keyCode)) {
                var charSize = this._getCharacterSize(String.fromCharCode(event.keyCode));
                this.positionCursorPredictions(this.getCursorElement().width() + charSize.width);
            }
        },

        onKeyup: function(child, event) {
            var ignoreKeyCodes = [9, 38, 40];

            this.setCursorValue(event.target.value);
            this.setInputFieldWidth();
            this.positionCursorPredictions();

            if(!event.target.value && ignoreKeyCodes.indexOf(event.keyCode) < 0) {
                this.hidePredictionsElement();
                this.resetPredictions();

                if(!this.getOption('showResultsOnFocus')) {
                    this.hideResultsElement();
                }
            }
            else if(event.target.value) {
                this.showResultsElement();
                this.showPredictionsElement();
                this.hideTextInPrediction(event.target.value);
            }
        },

        onFetchSuccess: function() {
            if(this.$el.hasClass('has-focus') && this.collection.length) {
                this.resetPredictions();
                this.showResultsElement();
            }
        },

        onTypingStopped: function(value) {
            var predictionsView = this.getRegion('predictions').currentView;

            if(value) {
                if(this.getOption('ajaxSearch') && this._predictions.length) {
                    this.showPredictionsElement();
                    this.getRegion('predictions').currentView.children.first().activate();
                    this.hideTextInPrediction();
                }

                this.search(value).progress(function(requestData) {
                    this.showActivityIndicator();
                })
                .fail(function() {
                    this.hideActivityIndicator();
                    this._predictions.reset();
                })
                .done(function(matches, response) {
                    this.hideActivityIndicator();

                    if(matches.length) {
                        if(!this._arraysEqual(
                            matches.pluck(this.getOption('searchProperty')),
                            this._predictions.pluck(this.getOption('searchProperty'))
                        )) {
                            this._predictions.reset();
                            this._predictions.add(matches.models, {
                                sort: false
                            });
                        }

                        if(!predictionsView.getActiveView()) {
                            predictionsView.activate(predictionsView.children.first());
                        }

                        this.hideTextInPrediction();
                    }
                    else {
                        this._predictions.reset();
                    }
                });
            }
        },

        onDomRefresh: function() {
            this._predictions = new Backbone.Collection([], {
                comparator: (
                    this.getOption('order') ||
                    this.getOption('labelProperty') ||
                    this.getOption('valueProperty') ||
                    this.getOption('searchProperty')
                )
            });

            this.em = this._getCharacterSize('M');
            this.showTags();
            this.setInputFieldWidth();
            this.startTypingDetection();
            this.showCursorPredictions();
            this.showSearchResults();
            this.hideResultsElement();
            this.unbindHotkeys();
            this.bindHotkeys();

            if(!this.getOption('multiple') ||
                this.getOption('maxLimit') && this.getOption('maxLimit') === 1) {
                this.$el.addClass('tag-field-single');
            }
        },

        onBeforeDestroy: function() {
            this.unbindHotkeys();
        },

        _arraysEqual: function(arr1, arr2) {
            if(arr1.length !== arr2.length) {
                return false;
            }

            for(var i = arr1.length; i--;) {
                if(arr1[i] !== arr2[i]) {
                    return false;
                }
            }

            return true;
        },

        _isPrintableKeycode: function(keyCode) {
            var valid =
                (keyCode > 47 && keyCode < 58)   || // number keys
                keyCode == 32 || keyCode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
                (keyCode > 64 && keyCode < 91)   || // letter keys
                (keyCode > 95 && keyCode < 112)  || // numpad keys
                (keyCode > 185 && keyCode < 193) || // ;=,-./` (in order)
                (keyCode > 218 && keyCode < 223);   // [\]' (in order)

            return valid;
        },

        _backspaceHandler: function(e) {
            if(this.getTotalFocusedTags()) {
                var $el = this.getElementWithNextFocus();
                this.removeFocusedTags();
                this.setFocusOnElement($el);
            }
            else {
                this.removeTag(this._tags.last());
            }

            e.preventDefault();
        },

        _getCharacterSize: function(char) {
            var div = document.createElement('div');

            div.style.cssText='display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em';
            div.appendChild(document.createTextNode(char));

            this.$el.append(div);

            var size = {
                width: div.offsetWidth,
                height: div.offsetHeight
            };

            this.$el.get(0).removeChild(div);

            return size;
        }

    });

    return Toolbox;

}));
