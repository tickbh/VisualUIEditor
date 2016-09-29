let ExtButton = {}

ExtButton.name = 'UIButton'
ExtButton.icon = 'app://res/control/Button.png'
ExtButton.tag = 7
ExtButton.defNormal = 'res/default/ButtonNormal.png'

ExtButton.GenEmptyNode = function () {
  node = new ccui.Button(getFullPathForName(ExtButton.defNormal))
  node._bgNormal = ExtButton.defNormal
  node._className = ExtButton.name
  return node
}

ExtButton.SetButtonSpriteFrame = function (path, value, node, func) {
  setNodeSpriteFrame(path, value, node, function (url) {
    func.call(node, url)
    let isEnable = node.isScale9Enabled()
    if (isEnable) {
      node.setScale9Enabled(false)
      node.setScale9Enabled(true)
    }
  })
}

ExtButton.GenNodeByData = function (data, parent) {
  return this.GenEmptyNode()
}

ExtButton.SetNodePropByData = function (node, data, parent) {
  (data['scale9Enable']) && (node.setScale9Enabled(data['scale9Enable']))
  ExtButton.SetButtonSpriteFrame('bgNormal', data['bgNormal'], node, node.loadTextureNormal)
  ExtButton.SetButtonSpriteFrame('bgSelect', data['bgSelect'], node, node.loadTexturePressed)
  ExtButton.SetButtonSpriteFrame('bgDisable', data['bgDisable'], node, node.loadTextureDisabled)

  ;(data['titleText']) && (node.setTitleText(data['titleText']))
  ;(data['fontName']) && (node.setTitleFontName(data['fontName']))
  ;(data['fontSize']) && (node.setTitleFontSize(data['fontSize']))
  ;(data['fontColor']) && (node.setTitleColor(covertToColor(data['fontColor'])))
}

ExtButton.ExportNodeData = function (node, data) {
  (node.isScale9Enabled()) && (data['scale9Enable'] = node.isScale9Enabled())
  ;(node._bgNormal) && (data['bgNormal'] = node._bgNormal)
  ;(node._bgSelect) && (data['bgSelect'] = node._bgSelect)
  ;(node._bgDisable) && (data['bgDisable'] = node._bgDisable)
  ;(node.getTitleText().length > 0) && (data['titleText'] = node.getTitleText())
  ;(node.getTitleFontName().length > 0) && (data['fontName'] = node.getTitleFontName())
  ;(node.getTitleFontSize() > 0) && (data['fontSize'] = node.getTitleFontSize())
  if (!cc.colorEqual(node.getTitleColor(), cc.color.WHITE)) {
    let color = node.getTitleColor()
    data['fontColor'] = [color.r, color.g, color.b, color.a]
  }
}

ExtButton.SetPropChange = function (control, path, value) {
  if (path == 'isScale9Enabled') {
    control._node.setScale9Enabled(value)
  } else if (path == 'bgNormal') {
    ExtButton.SetButtonSpriteFrame(path, value, control._node, control._node.loadTextureNormal)
  } else if (path == 'bgSelect') {
    ExtButton.SetButtonSpriteFrame(path, value, control._node, control._node.loadTexturePressed)
  } else if (path == 'bgDisable') {
    ExtButton.SetButtonSpriteFrame(path, value, control._node, control._node.loadTextureDisabled)
  } else if (path == 'titleText') {
    control._node.setTitleText(value)
    control._node.getTitleRenderer()._setUpdateTextureDirty()
  } else if (path == 'fontName') {
    control._node.setTitleFontName(value)
    control._node.getTitleRenderer()._setUpdateTextureDirty()
  } else if (path == 'fontSize') {
    control._node.setTitleFontSize(value)
    control._node.getTitleRenderer()._setUpdateTextureDirty()
  } else if (path == 'fontColor') {
    control._node.setTitleColor(new cc.Color(value.r, value.g, value.b, value.a))
    control._node.getTitleRenderer()._setUpdateTextureDirty()
  } else {
    control._node[path] = value
  }
}

ExtButton.ExportData = function (node) {
  this._node = node
}

ExtButton.ExportData.prototype = {
  __displayName__: 'Button',
  __type__: 'cc.Button',

  get isScale9Enabled() {
    return {
      path: 'isScale9Enabled',
      type: 'checkbox',
      name: 'isScale9Enabled',
      attrs: {
      },
      value: this._node.isScale9Enabled()
    }
  },

  get bgNormal() {
    return {
      path: 'bgNormal',
      type: 'asset',
      name: 'bgNormal',
      attrs: {
      },
      value: this._node._bgNormal
    }
  },

  get bgSelect() {
    return {
      path: 'bgSelect',
      type: 'asset',
      name: 'bgSelect',
      attrs: {
      },
      value: this._node._bgSelect
    }
  },

  get bgDisable() {
    return {
      path: 'bgDisable',
      type: 'asset',
      name: 'bgDisable',
      attrs: {
      },
      value: this._node._bgDisable
    }
  },

  get titleText() {
    return {
      path: 'titleText',
      type: 'input',
      name: 'titleText',
      attrs: {
      },
      value: this._node.getTitleText()
    }
  },

  get fontName() {
    return {
      path: 'fontName',
      type: 'input',
      name: 'fontName',
      attrs: {
      },
      value: this._node.getTitleFontName()
    }
  },

  get fontSize() {
    return {
      path: 'fontSize',
      type: 'unit-input',
      name: 'fontSize',
      attrs: {
        expand: true,
        step: 1,
        precision: 0,
        min: 0,
        max: 72
      },
      value: this._node.getTitleFontSize()
    }
  },

  get fontColor() {
    return {
      path: 'fontColor',
      type: 'color',
      name: 'fontColor',
      attrs: {
      },
      value: this._node.getTitleColor()
    }
  },

  get __props__() {
    return [
      this.isScale9Enabled,
      this.bgNormal,
      this.bgSelect,
      this.bgDisable,
      this.titleText,
      this.fontName,
      this.fontSize,
      this.fontColor
    ]
  }
}

ExtButton.PropComps = function (node) {
  let datas = [ new WidgetData(node) ]
  datas.push(new TouchData(node))
  datas.push(new ExtButton.ExportData(node))
  return datas
}

module.exports = ExtButton

RegisterExtNodeControl(ExtButton.name, ExtButton)
