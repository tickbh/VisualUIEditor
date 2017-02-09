let ExtListView = {}

ExtListView.name = 'UIListView'
ExtListView.icon = 'app://res/control/listview.png'
ExtListView.tag = 9

ExtListView.GenEmptyNode = function() {
    node = new ccui.ListView()
    node.setContentSize(cc.size(200, 100))
    node._className = ExtListView.name
    return node
}

ExtListView.GenNodeByData = function(data, parent) {
    node = new ccui.ListView()
    node.setContentSize(cc.size(data.width || 200, data.height || 100))
    ExtListView.SetNodePropByData(node, data, parent)
    node._className = ExtListView.name
    return node
}

ExtListView.SetNodePropByData = function(node, data, parent) {
    (isValue(data['gravity'])) && (node.setGravity(data['gravity']));
    (isValue(data['itemsMargin'])) && (node.setItemsMargin(data['itemsMargin']))
    ExtScrollView.SetNodePropByData(node, data, parent)
}

ExtListView.ExportNodeData = function(node, data) {
    data['gravity'] = node._gravity
    data['itemsMargin'] = node._itemsMargin
    ExtScrollView.ExportNodeData(node, data)
}

ExtListView.SetPropChange = function(control, path, value) {
    SetDefaultPropChange(control, path, value)
}

ExtListView.NodifyPropChange = function(control) {
    SetNodifyPropChange(control)
}

ExtListView.ExportData = function(node) {
    this._node = node
}

ExtListView.ExportData.prototype = {
    __displayName__: 'ListView',

    get gravity() {
        return {
            path: 'gravity',
            type: 'select',
            name: 'gravity',
            attrs: {
                selects: {
                    0: 'LEFT',
                    1: 'RIGHT',
                    2: 'CENTER_HORIZONTAL',
                    3: 'TOP',
                    4: 'BOTTOM',
                    5: 'CENTER_VERTICAL'
                }
            },
            value: this._node._gravity
        }
    },

    get itemsMargin() {
        return {
            path: 'itemsMargin',
            type: 'unit-input',
            name: 'itemsMargin',
            attrs: {},
            value: this._node._itemsMargin
        }
    },

    get __props__() {
        return [
            this.gravity,
            this.itemsMargin
        ]
    }
}

ExtListView.PropComps = function(node) {
    let datas = [new WidgetData(node)]
    datas.push(new TouchData(node))
    datas.push(new ExtListView.ExportData(node))
    datas.push(new ExtScrollView.ExportData(node))
    return datas
}

module.exports = ExtListView

RegisterExtNodeControl(ExtListView.name, ExtListView)