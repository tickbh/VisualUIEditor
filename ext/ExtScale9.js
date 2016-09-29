let ExtScale9 = {}

ExtScale9.name = 'UIScale9'
ExtScale9.icon = 'app://res/control/Scale9.png'
ExtScale9.tag = 4
ExtScale9.defRes = 'res/default/Scale9.png'

ExtScale9.GenEmptyNode = function () {
  node = new ccui.Scale9Sprite(getFullPathForName(ExtScale9.defRes))
  node._spriteFrame = ExtScale9.defRes
  node._className = ExtScale9.name
  return node
}

ExtScale9.GenNodeByData = function (data, parent) {
  let fullpath = getFullPathForName(data.spriteFrame)
  node = new ccui.Scale9Sprite(fullpath)
  node._className = ExtScale9.name
  node._spriteFrame = data.spriteFrame
  data.insetLeft && (node.insetLeft = data.insetLeft)
  data.insetTop && (node.insetTop = data.insetTop)
  data.insetRight && (node.insetRight = data.insetRight)
  data.insetBottom && (node.insetBottom = data.insetBottom)
  return node
}

ExtScale9.ResetPropByData = function (control, data, parent) {
  if (data.ignoreSetProp) {
    return
  }
  let node = control._node
  parent = parent || node.getParent()

  let fullpath = getFullPathForName(data.spriteFrame)
  cc.textureCache.addImage(fullpath, function (atlas) {
    data.ignoreSetProp = true
    data.uuid = node.uuid
    let newNode = cocosGenNodeByData(data, parent)
    node.ignoreAddToParent = true
    ReplaceNode(node, newNode, parent)
    control._node = newNode
  })
}

ExtScale9.SetNodePropByData = function (node, data, parent) {
  ExtScale9.ResetPropByData({_node: node}, data, parent)
}

ExtScale9.ExportNodeData = function (node, data) {
  node._spriteFrame && (data['spriteFrame'] = node._spriteFrame)
  node.insetLeft && (data.insetLeft = node.insetLeft)
  node.insetTop && (data.insetTop = node.insetTop)
  node.insetRight && (data.insetRight = node.insetRight)
  node.insetBottom && (data.insetBottom = node.insetBottom)
}

ExtScale9.SetPropChange = function (control, path, value) {
  let data = cocosExportNodeData(control._node, {uuid: true})
  data[path] = value
  ExtScale9.ResetPropByData(control, data)
}

function Scale9Data (node) {
  this._node = node
}

Scale9Data.prototype = {
  __displayName__: 'Image',
  __type__: 'ccui.ImageView',

  get spriteFrame() {
    return {
      path: 'spriteFrame',
      type: 'asset',
      name: 'spriteFrame',
      attrs: {
      },
      value: this._node._spriteFrame
    }
  },

  get __props__() {
    return [
      this.spriteFrame
    ]
  }
}

ExtScale9.Scale9Data = Scale9Data

ExtScale9.PropComps = function (node) {
  let datas = [ new WidgetData(node) ]
  datas.push(new TouchData(node))
  datas.push(new Scale9Data(node))
  return datas
}

module.exports = ExtScale9

RegisterExtNodeControl(ExtScale9.name, ExtScale9)
