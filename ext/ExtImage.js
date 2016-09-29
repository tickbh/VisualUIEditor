let ExtImage = {}

ExtImage.name = 'UIImage'
ExtImage.icon = 'app://res/control/Sprite.png'
ExtImage.tag = 1
ExtImage.defRes = 'res/default/Sprite.png'

ExtImage.GenEmptyNode = function () {
  let node = new ccui.ImageView(getFullPathForName(ExtImage.defRes))
  node._spriteFrame = ExtImage.defRes
  node._className = ExtImage.name
  return node
}

ExtImage.GenNodeByData = function (data, parent) {
  return this.GenEmptyNode()
}

ExtImage.SetSpriteFrame = function (node, spriteFrame) {
  if (spriteFrame && getFullPathForName(spriteFrame)) {
    let fullpath = getFullPathForName(spriteFrame)
    cc.textureCache.addImage(fullpath, function () {
      let anchor = node.getAnchorPoint()
      node.loadTexture(fullpath)
      node.setAnchorPoint(anchor)
      node._spriteFrame = spriteFrame
    })
  }
}

ExtImage.SetNodePropByData = function (node, data, parent) {
  ExtImage.SetSpriteFrame(node, data.spriteFrame)
}

ExtImage.ExportNodeData = function (node, data) {
  node._spriteFrame && (data['spriteFrame'] = node._spriteFrame)
}

ExtImage.SetPropChange = function (control, path, value) {
  if (path == 'spriteFrame') {
    ExtImage.SetSpriteFrame(control._node, value)
  }
}

function ImageData (node) {
  this._node = node
}

ImageData.prototype = {
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

ExtImage.ImageData = ImageData

ExtImage.PropComps = function (node) {
  let datas = [ new WidgetData(node) ]
  datas.push(new TouchData(node))
  datas.push(new ImageData(node))
  return datas
}

module.exports = ExtImage

RegisterExtNodeControl(ExtImage.name, ExtImage)
