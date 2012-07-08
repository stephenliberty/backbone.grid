define(['./_behavior'], function (base) {
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
                return this.columnHandlers[column]
            } else {
                return this.defaultHandler;
            }
        },
        
        updateTotals: function () {
            var self = this;
            this.grid.$tfoot.find("[data-column]").each(function () {
                var column = $(this).attr('data-column');
                $(this).text(self.getHandlerForColumn(column).call(self, column));
            });
        }
    });
    return totals;
})