define(['./_behavior', 'underscore'], function (base, _) {
    var totals = function () {}
    totals.prototype = new base();
    _.extend(totals.prototype, {
        
        selector: 'tfoot',
        
        columnHandlers: {},
        
        defaultHandler: function (field) {
            return this.grid.collection.reduce(function(memo, model){ return memo + model.get(field); }, 0);
        },
        
        setGrid: function (grid) {
            this.grid = grid;
            this.grid.on('render listUpdated rowUpdated', this.updateTotals, this);
        },
        
        getHandlerForColumn: function (column) {
            if(this.columnHandlers[column]) {
                if(this.columnHandlers[column].handler) {
                    return this.columnHandlers[column].handler;
                } else {
                    return this.columnHandlers[column];
                }
            } else {
                return this.defaultHandler;
            }
        },
        
        updateTotals: function () {
            var self = this;
            this.grid.$tfoot.find("[data-column]").each(function () {
                var column = $(this).attr('data-column');
                var value = self.getHandlerForColumn(column).call(self, column);
                if(self.columnHandlers[column] && self.columnHandlers[column].template) {
                    $(this).html(self.columnHandlers[column].template({value: value}));
                } else {
                    $(this).text(value);
                }
            });
        }
    });
    return totals;
})