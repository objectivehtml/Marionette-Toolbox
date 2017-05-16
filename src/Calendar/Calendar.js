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

        modelChanged: function() {
            this.render();
        },

       templateContext: function() {
            return {
                hasEvents: this.hasEvents()
            }
        },

        setCellHeight: function(width) {
            this.$el.css('height', width || this.$el.width());
        },

        getDate: function() {
            var date = this.model.get('date');

            if(!date instanceof moment) {
                date = moment(date);
            }

            return date;
        },

        hasEvents: function() {
            return this.model.get('events') && this.model.get('events').length > 0 ? true : false;
        },

        onRender: function() {
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

        childViewEvents: {
            click: function(view, event) {
                this.triggerMethod('day:click', view, this, event);
            }
        },

        defaultOptions: {
            days: false,
            events: false
        },

        initialize: function() {
            Toolbox.CollectionView.prototype.initialize.apply(this, arguments);

            if(!this.collection) {
                this.collection = new Backbone.Collection(this.model.get('days'));
            }
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
        }

    });

    Toolbox.MonthlyCalendar = Toolbox.View.extend({

        template: Toolbox.Template('calendar-monthly-view'),

        className: 'calendar',

        defaultOptions: {
            collection: false,
            alwaysShowSixWeeks: true,
            fetchOnRender: true,
            bodyView: Toolbox.CollectionView.extend({
                tagName: 'tbody',
                childView: Toolbox.MonthlyCalendarWeek,
                childViewEvents: {
                    'click': function(view, event) {
                        this.triggerMethod('week:click', view, event);
                    },
                    'day:click': function(view, week, event) {
                        this.getOption('calendar').triggerMethod('day:click', view, week, event);
                    }
                }
            }),
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

        regions: {
            body: {
                el: 'tbody',
                replaceElement: true
            }
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
            var self = this, params = this.getQueryVariables();

            if(this.getCacheResponse(params)) {
                this.restoreCacheResponse(params);
            }
            else {
                this.triggerMethod('fetch', params);
                this.collection.reset();
                this.collection.fetch({
                    data: params,
                    success: function(collection, response) {
                        self.setCacheResponse(params, collection);
                        self.triggerMethod('fetch:complete', true, collection, response);
                        self.triggerMethod('fetch:success', collection, response);
                    },
                    error: function(model, response) {
                        self.triggerMethod('fetch:complete', false, collection, response);
                        self.triggerMethod('fetch:error', collection, response);
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

        showBodyView: function() {
            var BodyView = this.getOption('bodyView');
            var bodyView = new BodyView(_.extend({}, {
                calendar: this
            }, this.getOption('bodyViewOptions')));

            this.showChildView('body', bodyView);

            _.each(this.getCalendarWeeks(), function(week, i) {
                bodyView.addChildView(bodyView.buildChildView(new Backbone.Model({
                    days: week
                }), bodyView.childView), i);
            }, this);
        },

        onDayClick: function(day, week, event) {
            this.setDate(day.getDate());
        },

        onRender: function() {
            this.showBodyView();

            this.$el.find('.calendar-header').html(this.getCalendarHeader());
            this.$el.find('.calendar-sub-header').html(this.getCalendarSubHeader());

            if(this.getOption('fetchOnRender')) {
                //this.fetch();
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

        renderCollection: function(collection) {
            this.triggerMethod('before:render:collection', collection);
            collection.each(function(model, i) {
                var event = this.createEvent(model);
                var view = this.getViewByDate(event.start);
                if(view) {
                    view.addEvent(event);
                }
            }, this);
            this.triggerMethod('after:render:collection', collection);
        },

        getViewByDate: function(date) {
            if(!date instanceof moment) {
                date = moment(date);
            }

            var view = null;

            this.getRegion('body').currentView.children.each(function(week, x) {
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
                this.addChildView(this.buildChildView(this.getWeekModel(), this.childView), i);
            }, this);
        }

    });

    return Toolbox;

}));
