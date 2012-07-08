/**
 * 
 */
define(['./_behavior'], function (base) {
    var sortable = function () {};
    sortable.prototype = new base();
    _.extend(sortable.prototype, {
        
        defaultSortSelector: null,
        
        defaultSortDirection: "ASC",
        
        sortCallbacks: {
            
        },
        
        setGrid: function (grid) {
            this.grid = grid;
            this.grid.on('eventsDelegated', this.delegateSortingEvents, this);
            this.grid.on('render:before', this.presortCollection, this);
        },
        
        delegateSortingEvents: function () {
            this.delegateOnGrid('th.sortable', 'click', this.sortCollection)
        },
        
        sortCollection: function (e) {
            var el = $(e.currentTarget);
            var column = el.attr('data-column');
            var direction = el.hasClass('asc') ? 'DESC' : 'ASC';
            this.grid.$thead.find('.asc,.desc').removeClass('asc').removeClass('desc');
            this.sortOn(direction, column);
            this.updateColumnClass(el, direction);
        },
        
        getSortCallback: function (column) {
            
            return this.sortCallbacks[column] || function (a, b) {
                if(a.get(column) > b.get(column)) {return 1;}
                if(a.get(column) < b.get(column)) {return -1;}
                return 0;
            };
        },
        
        sortOn: function (direction, column) {
            var sorter = this.getSortCallback(column);
            var collection = this.grid.collection;
            var models = collection.models.sort(sorter);
            if(direction != 'ASC') {
                models = models.reverse();
            }
            collection.reset(models);
        },
        
        presortCollection: function () {
            if(this.defaultSortSelector) {
                var column = this.grid.$thead.find('[data-column="'.concat(this.defaultSortSelector, '"]')).attr('data-column');
                this.sortOn(this.defaultSortDirection, column);
                this.updateColumnClass(this.grid.$thead.find('[data-column="'.concat(this.defaultSortSelector, '"]')), this.defaultSortDirection);
            }
        },
        
        updateColumnClass: function ($row, direction) {
            if(direction == 'ASC') {
                $row.removeClass('desc').addClass('asc');
            } else {
                $row.addClass('desc').removeClass('asc');
            }
        }
    });
    return sortable;
})