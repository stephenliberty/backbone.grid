define(['./_behavior', 'underscore'], function (base, _) {
    var editable = function () {}
    editable.prototype = new base();
    _.extend(editable.prototype, {
        
        columnHandlers: {},
        
        defaultTemplate: _.template("<input type='text'>"),
        
        clicks: 1,
        
        _isEditing: false,
        
        defaultHandler: function ($el) {
            return $el.val();
        },
        
        setGrid: function (grid) {
            this.grid = grid;
            this.delegateOnGrid('tbody td', this.clicks == 1 ? 'click' : 'dblclick', this.startEditing)
        },
        
        stopEditing: function () {
            var el = this._isEditing;
            
        },
        
        startEditing: function (e) {
            if(this._isEditing) {
                this.stopEditing();
            }
            var cell = $(e.currentTarget);
            
            console.log(arguments);
            
        }
    });
    return editable;
})