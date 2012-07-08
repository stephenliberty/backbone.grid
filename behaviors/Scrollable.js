/**
 * 
 */
define(['./_behavior'], function (base) {
    var scrollable = function () {};
    scrollable.prototype = new base();
    _.extend(scrollable.prototype, {
        
        columnWidthFrom: 'content',
        
        setGrid: function (grid) {
            this.grid = grid;
            this.grid.on('referencesSetUp', this.createScrollingElements, this);
            this.grid.on('listUpdated', this.sizeColumns, this);
        },
        
        /**
         * from http://www.alexandre-gomes.com/?p=115
         */
        getScrollbarWidth: function () {
            var inner = document.createElement('p');
            inner.style.width = "100%";
            inner.style.height = "200px";

            var outer = document.createElement('div');
            outer.style.position = "absolute";
            outer.style.top = "0px";
            outer.style.left = "0px";
            outer.style.visibility = "hidden";
            outer.style.width = "200px";
            outer.style.height = "150px";
            outer.style.overflow = "hidden";
            outer.appendChild (inner);

            document.body.appendChild (outer);
            var w1 = inner.offsetWidth;
            outer.style.overflow = 'scroll';
            var w2 = inner.offsetWidth;
            if (w1 == w2) w2 = outer.clientWidth;

            document.body.removeChild (outer);

            return (w1 - w2);
        },

        
        isOverflowing: function () {
            return this.grid.$table.get(0).scrollHeight > this.grid.$el.find('.scroller').height();
        },
        
        sizeColumns: function () {
            var columns = [];
            if(this.columnWidthFrom == 'content') {
                
                this.grid.$table.find('tr:first td').each(function () {
                    var el = $(this);
                    columns.push(el.width());
                });
                this.grid.$thead.find('th').each(function (i) {
                    var el = $(this);
                    el.width(columns[i]);
                });
                this.grid.$tfoot.find('td').each(function (i) {
                    var el = $(this);
                    el.width(columns[i]);
                });
                if(this.isOverflowing()) {
                    this.grid.$el.find('.scrollSize').innerWidth(this.getScrollbarWidth())
                }
            } else if (this.columnWidthFrom == 'header') {
                if(this.isOverflowing()) {
                    this.grid.$el.find('.scrollSize').innerWidth(this.getScrollbarWidth())
                }
                this.grid.$thead.find('th').each(function (i) {
                    var el = $(this);
                    columns.push(el.width());
                });
                this.grid.$table.find('tr:first td').each(function (i) {
                    var el = $(this);
                    el.width(columns[i]);
                });
            }
        },
        
        createScrollingElements: function () {
            var originalTableHeader = this.grid.$thead.detach();
            var originalTableFooter = this.grid.$tfoot.detach();
            var originalTableBody = this.grid.$tbody.detach();
            var containingDiv = $("<div>").addClass('scrollingContainer');
            if(this.containingDiv) {
                var oldContainer = this.containingDiv;
                this.grid.$table = oldContainer;
            }
            this.containingDiv = containingDiv;
            var classes = this.grid.$table.attr('class');
            var id = this.grid.$table.attr('id');
            containingDiv.attr({'class': classes, id: id});
            
            this.grid.$table.replaceWith(containingDiv);
            var tht = $("<table>").append(originalTableHeader);
            var tft = $("<table>").append(originalTableFooter);
            var tbt = $("<table>").append(originalTableBody);
            var scrollingDiv = $("<div>").addClass('scroller').append(tbt);
            originalTableHeader.find("tr").append($("<th>").addClass('scrollSize'));
            originalTableFooter.find("tr").append($("<th>").addClass('scrollSize'));
            containingDiv.append(tht);
            containingDiv.append(scrollingDiv);
            containingDiv.append(tft);
            this.grid.$table = tbt;
        }
        
    });
    return scrollable;
})