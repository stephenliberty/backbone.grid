/**
 * 
 */
define(['./_behavior'], function (base) {
    var selectable = function () {};
    selectable.prototype = new base();
    _.extend(selectable.prototype, {
        
        selection: 'single',
        
        selectedModels: {},
        
        selectedClass: 'selected',
        
        setGrid: function (grid) {
            this.grid = grid;
            this.grid.on('render:before', this.presortCollection, this);
            this.grid.on('rowClicked', this.handleRowClick, this);
            this.grid.on('collectionChanged', this.setCollection, this);
            this.grid.on('listUpdated', this.reapplySelection, this);
            this.addSelectionMethods();
        },
        
        reapplySelection: function () {
            var lastSelection = _.keys(this.selectedModels);
            this.clearSelections(true);
            for(var i = 0, l = lastSelection.length; i < l; i++) {
                var model = this.grid.collection.getByCid(lastSelection[i]);
                if(model) {
                    this.selectModel(model, true);
                }
            }
            this.grid.trigger('selectionChange', this.getSelectedModels());
        },
        
        setCollection: function (collection) {
            collection.off('remove', this.removeModelIfNeeded, this);
            collection.on('remove', this.removeModelIfNeeded, this);
        },
        
        removeModelIfNeeded: function (model) {
            if(this.selectedModels[model.cid]) {
                if(this.grid.getModelRow(model)) {
                    this.grid.getModelRow(model).removeClass(this.selectedClass);
                }
                delete this.selectedModels[model.cid];
                this.grid.trigger('selectionChange', this.getSelectedModels());
            }
        },
        
        addSelectionMethods: function () {
            this.grid.getSelectedModels = _.bind(this.getSelectedModels, this);
            this.grid.selectModels = _.bind(this.selectModels, this);
            this.grid.selectModel = _.bind(this.selectModel, this);
            this.grid.unselectModels = _.bind(this.unselectModels, this);
            this.grid.unselectModel = _.bind(this.unselectModel, this);
        },
        
        selectModel: function (model, silent) {
            return this.selectModels([model], silent);
        },
        
        unselectModel: function (model, silent) {
            return this.unselectModels([model], silent);
        },
        
        unselectModels: function (models, silent) {
            for(var i = 0, l = models.length; i < l; i++) {
                var model = models[i];
                if(this.selectedModels[model.cid]) {
                    this.selectedModels[model.cid] = model;
                    var $row = this.grid.getModelRow(model);
                    $row && $row.removeClass(this.selectedClass);
                }
            }
            !silent && this.grid.trigger('selectionChange', this.getSelectedModels());
        },
        
        selectModels: function (models, silent) {
            if(this.selection == 'single') {
                var lastModel = models[models.length - 1];
                this.clearSelections(true);
                this.selectedModels[lastModel.cid] = lastModel;
                var $row = this.grid.getModelRow(lastModel);
                $row && $row.addClass(this.selectedClass);
            } else {
                for(var i = 0, l = models.length; i < l; i++) {
                    this.selectedModels[models[i].cid] = models[i];
                    var $row = this.grid.getModelRow(models[i]);
                    $row && $row.addClass(this.selectedClass);
                }
            }
            !silent && this.grid.trigger('selectionChange', this.getSelectedModels());
        },
        
        clearSelections: function (silent) {
            this.selectedModels = {};
            this.grid.$tbody.find('.' + this.selectedClass).removeClass(this.selectedClass);
            !silent && this.grid.trigger('selectionChange', []);
        },
        
        handleRowClick: function ($row, model) {
            if(!this.selectedModels[model.cid]) {
                this.selectModel(model);
                $row.addClass(this.selectedClass);
            } else {
                if(this.selection == 'single') {
                    this.selectedModels = {};
                } else {
                    delete this.selectedModels[model.cid];
                }
                this.unselectModel(model);
                $row.removeClass(this.selectedClass);
            }
        },
        
        getSelectedModels: function () {
            return _.values(this.selectedModels);
        }
        
    });
    return selectable;
})