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
        
        _modelRowRefs: {},
        
        events: {
            'click tbody tr': 'rowClicked'
        },
        
        rowClicked: function (e) {
            var row = $(e.currentTarget);
            var cid = row.attr('data-model-cid');
            if(cid) {
                this.trigger('rowClicked', row, this.collection.getByCid(cid));
            }
        },
        
        initialize: function () {
            this.collectionEvents = {
                'add remove reset': this.updateList,
                'change': this.updateRow
            };
            
            _.each(this.options.behaviors, function (behavior) {
                var b;
                if(_.isFunction(behavior)) {
                    b = new behavior();
                } else {
                    b = new behavior.behavior();
                    _.extend(b, behavior.options);
                }
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
            if(!this.$tbody.length) {
                this.$tbody = $("<tbody>");
            }
            this.$tfoot = this.$table.find('tfoot');
            
            if(!this.$table || this.$table.length == 0) {
                logger.warn("Creating grid with no table")
            }
            this.trigger('referencesSetUp');
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
            
            if(!this.rowTemplate) {
                throw "Grid has no idea how to construct itself";
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
        
        getModelRow: function (model) {
            return this._modelRowRefs[model.cid];
        },
        
        updateList: function () {
            this._modelRowRefs = {};
            var models = [].concat(this.collection.models);
            this.trigger('prepareModels', models);
            this.$tbody.empty();
            for(var i = 0, l = models.length; i < l; i++) {
                var model = models[i];
                var tr = this.addRow(model);
                this.$tbody.append(tr);
            }
            this.trigger('listUpdated');
        },
        
        addRow: function (model) {
            var rowTemplate = this.getRowTemplate();
            var tr = $(this.callTemplate(rowTemplate, model[this.modelDataCall]()));
            this._modelRowRefs[model.cid] = tr;
            tr.attr({
                'data-model-id': model.id,
                'data-model-cid': model.cid
            });
            return tr;
        },
        
        updateRow: function (model) {
            var $row = this._modelRowRefs[model.cid];
            var rowTemplate = this.getRowTemplate();
            $row.replaceWith(this.callTemplate(rowTemplate, model[this.modelDataCall]()));
            this.trigger('rowUpdated', $row, model)
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
            _.each(this.collectionEvents, function (callback, key) {
                this.collection.off(key, callback, this);
                this.collection.on(key, callback, this);
            }, this);
            this.trigger('collectionChanged', collection);
        },
        
        remove: function () {
            _.each(this.collectionEvents, function (callback, key) {
                this.collection.off(key, callback, this);
            }, this);
            this.trigger('remove');
            Backbone.View.prototype.remove.apply(this, arguments);
        },
        
        render: function (collection) {
            if(collection) {
                this.setCollection(collection);
            }
            this.setupReferences();
            this.trigger('render:before');
            this.updateList();
            this.trigger('render');
        }
    });
});