define(['backbone', 'underscore'], function (Backbone, _) {
    var base = function () {};
    _.extend(base.prototype, Backbone.Events, {
        delegateOnGrid: function (selector, eventName, method) {
            this.grid.$el.delegate(selector, eventName.concat('.', this.grid.$el.cid), _.bind(method, this));
        }
    });
    return base;
})