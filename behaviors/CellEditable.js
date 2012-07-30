define(['./_behavior', 'underscore'], function (base, _) {
    var editable = function () {}
    editable.prototype = new base();
    _.extend(editable.prototype, {
        
        columnHandlers: {},
        
        defaultTemplate: _.template("<td data-model-field-name='<%- fieldName %>'><input type='text' value='<%- value %>'></td>"),
        
        clicks: 1,
        
        _isEditing: false,
        
        defaultHandler: function ($el) {
            return $el.val();
        },
        
        setGrid: function (grid) {
            this.grid = grid;
            this.delegateOnGrid('tbody td', this.clicks == 1 ? 'click' : 'dblclick', this.startEditing);
            this.delegateOnGrid('input', 'keydown', this.keyPressed);
        },
        
        keyPressed: function (e) {
            if(e.which == 13) {
                this.stopEditing();
            }
        },
        
        getValueOfEditor: function (cell) {
            var field = cell.attr('data-model-field-name');
            if(this.editors && this.editors[field] && this.editors[field].evaluator) {
                console.log(cell)
                return this.editors[field].evaluator(cell);
            }
            return cell.find('input').val();
        },
        
        stopEditing: function () {
            var el = this._isEditing;
            var original = el.data('original');
            var cid = el.parent('tr').attr('data-model-cid');
            var model = this.grid.collection.getByCid(cid);
            if(model) {
                model.set(el.attr('data-model-field-name'), this.getValueOfEditor(el));
            }
            original.remove();
            el.remove();
            this._isEditing = false;
        },
        
        getEditorForCell: function (cell) {
            var field = cell.attr('data-model-field-name');
            if(this.editors && this.editors[field] && this.editors[field].editor) {
                return this.editors[field].editor;
            }
            return this.defaultTemplate;
        },
        
        startEditing: function (e) {
            var cell = $(e.currentTarget);
            if(cell.hasClass('editing')) {
                return;
            }
            if(this._isEditing) {
                this.stopEditing();
            }
            var editor = this.getEditorForCell(cell);
            var replacement = $(editor({
                value: cell.text(),
                originalCell: cell,
                fieldName: cell.attr('data-model-field-name'),
                grid: this
            }));
            replacement.attr('data-model-cid', cell.attr('data-model-cid'));
            replacement.data('original', cell);
            cell.replaceWith(replacement);
            replacement.addClass('editing');
            this._isEditing = replacement;
        }
    });
    return editable;
})