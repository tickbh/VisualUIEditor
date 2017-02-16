let ExtCheckBox = {}

ExtCheckBox.name = 'UICheckBox'
ExtCheckBox.icon = 'app://res/control/CheckBox.png'
ExtCheckBox.tag = 8
ExtCheckBox.defNormal = 'res/default/ButtonNormal.png'

ExtCheckBox.GenEmptyNode = function() {
    let back = 'res/default/CheckBoxNormal.png'
    let backSelect = 'res/default/CheckBoxSelect.png'
    let active = 'res/default/CheckBoxNodeNormal.png'
    let backDisable = 'res/default/CheckBoxDisable.png'
    let activeDisable = 'res/default/CheckBoxNodeDisable.png'
    node = new ccui.CheckBox(getFullPathForName(back), getFullPathForName(backSelect), getFullPathForName(active), getFullPathForName(backDisable), getFullPathForName(activeDisable))
    node._back = back
    node._backSelect = backSelect
    node._active = active
    node._backDisable = backDisable
    node._activeDisable = activeDisable
    node._className = ExtCheckBox.name
    node.setSelected(true)
    return node
}

ExtCheckBox.GenNodeByData = function(data, parent) {
    node = new ccui.CheckBox();
    node._className = ExtCheckBox.name;
    ExtCheckBox.SetNodePropByData(node, data, parent);
    return node
}

ExtCheckBox.SetNodePropByData = function(node, data, parent) {
    setNodeSpriteFrame('back', data['back'], node, node.loadTextureBackGround);
    setNodeSpriteFrame('backSelect', data['backSelect'], node, node.loadTextureBackGroundSelected);
    setNodeSpriteFrame('active', data['active'], node, node.loadTextureFrontCross);
    setNodeSpriteFrame('backDisable', data['backDisable'], node, node.loadTextureBackGroundDisabled);
    setNodeSpriteFrame('activeDisable', data['activeDisable'], node, node.loadTextureFrontCrossDisabled);
    (!isNull(data['select'])) && (node.setSelected(data['select']));
}

ExtCheckBox.ExportNodeData = function(node, data) {
    (node._back) && (data['back'] = node._back);
    (node._backSelect) && (data['backSelect'] = node._backSelect);
    (node._active) && (data['active'] = node._active);
    (node._backDisable) && (data['backDisable'] = node._backDisable);
    (node._activeDisable) && (data['activeDisable'] = node._activeDisable)
    data['select'] = node.isSelected()
}

ExtCheckBox.SetPropChange = function(control, path, value) {
    SetDefaultPropChange(control, path, value)
}

ExtCheckBox.GetLoadImages = function(data) {
    return [data['back'], data['backSelect'], data['active'], data['backDisable'], data['activeDisable']]
}

ExtCheckBox.NodifyPropChange = function(control) {
    SetNodifyPropChange(control)
}

ExtCheckBox.ExportData = function(node) {
    this._node = node
}

ExtCheckBox.ExportData.prototype = {
    __displayName__: 'CheckBox',
    get back() {
        return {
            path: 'back',
            type: 'asset',
            name: 'back',
            attrs: {},
            value: this._node._back
        }
    },

    get backSelect() {
        return {
            path: 'backSelect',
            type: 'asset',
            name: 'backSelect',
            attrs: {},
            value: this._node._backSelect
        }
    },

    get active() {
        return {
            path: 'active',
            type: 'asset',
            name: 'active',
            attrs: {},
            value: this._node._active
        }
    },

    get backDisable() {
        return {
            path: 'backDisable',
            type: 'asset',
            name: 'backDisable',
            attrs: {},
            value: this._node._backDisable
        }
    },

    get activeDisable() {
        return {
            path: 'activeDisable',
            type: 'asset',
            name: 'activeDisable',
            attrs: {},
            value: this._node._activeDisable
        }
    },

    get select() {
        return {
            path: 'select',
            type: 'checkbox',
            name: 'select',
            attrs: {},
            value: this._node.isSelected()
        }
    },

    get __props__() {
        return [
            this.back,
            this.backSelect,
            this.active,
            this.backDisable,
            this.activeDisable,
            this.select
        ]
    }
}

ExtCheckBox.PropComps = function(node) {
    let datas = [new WidgetData(node)]
    datas.push(new TouchData(node))
    datas.push(new ExtCheckBox.ExportData(node))
    return datas
}

module.exports = ExtCheckBox

RegisterExtNodeControl(ExtCheckBox.name, ExtCheckBox)