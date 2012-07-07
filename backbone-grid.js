define([
    'backbone',
    'jquery'
], function (Backbone, $) {
    var logger = {
        log: console && console.log ? console.log : function () {},
        warn: console && console.warn ? console.warn : function () {},
        error: console && console.error ? console.error : function () {}
    }
    return Backbone.View.extend({
        
        behaviors: [],
        
        modelDataCall: 'toJSON',
        
        columns: [],
        
        initialize: function () {
            _.each(this.options.behaviors, function (behavior) {
                var b = new behavior();
                b.setGrid(this);
                this.behaviors.push(b);
            }, this);
            if(this.options.collection) {
                this.setCollection(this.options.collection);
            }
            
            if(this.options.columns) {
                this.columns = this.options.columns;
            }
            
            if(this.options.rowTemplate) {
                this.rowTemplate = this.options.rowTemplate;
            }
            
            this.trigger('initialized');
        },
        
        setupReferences: function () {
            if(this.options.$table) {
                this.$table = this.options.$table;
            } else {
                if(!this.$el.is('table')) {
                    if(this.options.tableSelector) {
                        this.$table = this.$el.find(this.options.tableSelector);
                    } else {
                        this.$table = this.$el.find('table:first');
                    }
                }
            }
            
            this.$thead = this.$table.find('thead');
            
            this.$tbody = this.$table.find('tbody');
            
            this.$tfoot = this.$table.find('tfoot');
            
            if(!this.$table || this.$table.length == 0) {
                logger.warn("Creating grid with no table")
            }
        },
        
        setElement: function () {
            Backbone.View.prototype.setElement.apply(this, arguments);
            this.setupReferences();
        },
        
        getRowTemplate: function () {
            if(this.rowTemplate) {
                return this.rowTemplate;
            }
            if(!this.rowTemplate) {
                this.trigger('templateNeeded:row');
            }
            
            if(!this.rowTemplate && this.columns.length) {
                this.rowTemplate = this.createTemplateFromColumnDefinition();
            }
            return this.rowTemplate;
        },
        
        createTemplateFromColumnDefinition: function () {
            var templateString = ["<tr>"];
            _.each(this.columns, function () {
                for(var i = 0, l = this.columns.length; i < l; i++) {
                    templateString[i + 1] = "<td class='".concat(this.columns[i], "'><%- ", this.columns[i], " %></td>");
                }
            }, this)
            templateString.push("</tr>");
            return _.template(templateString.join("\n"));
        },
        
        callTemplate: function (template, data) {
            return template(data);
        },
        
        updateList: function () {
            this.$tbody.empty();
            this.$tbody.detach();
            var rowTemplate = this.getRowTemplate();
            
            this.collection.each(function (model) {
                this.$tbody.append(this.callTemplate(rowTemplate, model[this.modelDataCall]()));
            }, this);
            this.$tbody.appendTo(this.$table);
            this.trigger('listUpdated');
        },
        
        updateRow: function () {
            
        },
        
        undelegateEvents: function () {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            this.trigger('eventsUndelegated');
        },
        
        delegateEvents: function () {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            this.trigger('eventsDelegated');
        },
        
        setCollection: function (collection) {
            this.collection = collection;
            var events = {
                'add remove reset': this.updateList,
                'change': this.updateRow
            };
            _.each(events, function (callback, key) {
                this.collection.off(key, callback);
                this.collection.on(key, callback);
            }, this);
            this.trigger('collectionChanged', collection);
        },
        
        render: function (collection) {
            if(collection) {
                this.setCollection(collection);
            }
            this.setupReferences();
            this.updateList();
            this.trigger('render');
        }
    })
})