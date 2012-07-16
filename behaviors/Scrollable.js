/**
 * 
 */
define(['./_behavior', 'mousewheel'], function (base) {
    var scrollable = function () {};
    scrollable.prototype = new base();
    _.extend(scrollable.prototype, {
        
        columnWidthFrom: 'content',
        
        maxRows: 5,
        
        setGrid: function (grid) {
            this.grid = grid;
            this.grid.on('prepareModels', this.spliceModels, this);
            this.grid.on('render', this.updateScroller, this);
            this.grid.on('render', this.setupScrollEvents, this);
        },
        
        setupScrollEvents: function () {
            var self = this;
            this.scroller.on('scroll', function () {
                self.updateData();
            });
            this.grid.$el.bind('mousewheel', function (e, delta) {
                if(delta > 0) {
                    self.scroller.scrollTop(self.scroller.scrollTop() - self._heightPerRow);
                } else {
                    self.scroller.scrollTop(self.scroller.scrollTop() + self._heightPerRow);
                }
            });
        },
        
        updateData: function () {
            this.grid.updateList();
        },
        
        updateScroller: function () {
            if(!this.scroller) {
                this.scroller = $("<div>").addClass('scroller');
            }
            var height = this.grid.$tbody.height();
            if(height > 0) {
                if(this.grid.$el.find('tbody').position()) {
                    this.scroller.css({
                        top: this.grid.$el.find('tbody').position().top,
                        right: this.grid.$el.outerWidth() - this.grid.$tbody.width()
                    });
                }
                if(this.scroller.children().length == 0) {
                    this._heightPerRow = height / this.maxRows;
                    var size = $("<div>").css({
                        height: (height / this.maxRows) * this._collectionSize,
                        width: this.getScrollbarWidth()
                    });
                    this.scroller.css({height: this.grid.$tbody.innerHeight()})
                    this.scroller.append(size);
                }
            }
        },
        
        spliceModels: function (models) {
            this._collectionSize = models.length;
            this.updateScroller();
            if(models.length > this.maxRows) {
                this.showScroller();
            }
            var modelsToShow = models.slice(Math.round(models.length * this.getDataPosition()), Math.round(models.length * this.getDataPosition()) + this.maxRows);
            models.splice.apply(models, [0, models.length].concat(modelsToShow));
        },
        
        showScroller: function () {
            this.grid.$el.find('.scrollSizer').remove();
            var self = this;
            this.grid.$thead.find('tr').each(function () {
                $(this).append($("<th>").addClass('scrollSizer').width(self.getScrollbarWidth()).html("&nbsp;"));
            });
            this.grid.$tbody.find('tr').each(function () {
                $(this).append($("<td>").addClass('scrollSizer').width(self.getScrollbarWidth()).text(" "));
            });
            this.grid.$tfoot.find('tr').each(function () {
                $(this).append($("<td>").addClass('scrollSizer').width(self.getScrollbarWidth()).text(" "));
            });
            
            if(this.scroller.parents('body').length == 0) {
                this.grid.$el.append(this.scroller);
                this.grid.$el.css({position: 'relative'});
            }
        },
        
        
        
        getDataPosition: function () {
            if(!this.scroller) {return 0;}
            var position = this.scroller.scrollTop() / this.scroller.children().height();
            if(_.isNaN(position)) {position = 0;}
            return position;
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
        }
        
    });
    return scrollable;
})