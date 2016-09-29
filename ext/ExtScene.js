let ExtScene = {}

ExtScene.name = 'Scene'
ExtScene.icon = 'app://res/control/Node.png'
ExtScene.tag = -1

ExtScene.GenEmptyNode = function () {
  let node = new cc.Scene()
  node.setContentSize(cc.size(1136, 640))
  node._className = ExtScene.name
  return node
}

ExtScene.GenNodeByData = function (data, parent) {
  return this.GenEmptyNode()
}

ExtScene.SetNodePropByData = function (node, data, parent) {
  (data['autoLayout']) && (node.autoLayout = data['autoLayout'])
}

ExtScene.ExportNodeData = function (node, data) {
  data['autoLayout'] = node.autoLayout
}

ExtScene.SetPropChange = function (control, path, value) {
  control._node[path] = value
}

ExtScene.ExportData = function (node) {
  this._node = node
}

ExtScene.ExportData.prototype = {
  __displayName__: 'Scene',
  __type__: 'Scene',
  get isAutoLayout() {
    return {
      path: 'autoLayout',
      type: 'checkbox',
      name: 'autoLayout',
      attrs: {
      },
      value: this._node.autoLayout
    }
  },

  get __props__() {
    return [this.isAutoLayout]
  }
}

ExtScene.PropComps = function (node) {
  let datas = [ new WidgetData(node) ]
  datas.push(new ExtScene.ExportData(node))
  return datas
}

module.exports = ExtScene

RegisterExtNodeControl(ExtScene.name, ExtScene)
