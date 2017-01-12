let ExtTextAtlas = {}

ExtTextAtlas.name = 'UITextAtlas'
ExtTextAtlas.icon = 'app://res/control/Label.png'
ExtTextAtlas.tag = 2
ExtTextAtlas.defRes = 'res/default/AltasNum.png'
ExtTextAtlas.defStr = '453224679'

ExtTextAtlas.GenEmptyNode = function () {
  let node = new ccui.TextAtlas('453224679', getFullPathForName(ExtTextAtlas.defRes), 20, 27, '0')
  node._className = ExtTextAtlas.name
  return node
}

ExtTextAtlas.GenNodeByData = function (data, parent) {
  let node = new ccui.TextAtlas(data.string, getFullPathForName(data.charMapFile), data.itemWidth, data.itemHeight, data.mapStartChar)
  node._charMapFileName = data.charMapFile
  node._className = ExtTextAtlas.name
  return node
}

ExtTextAtlas.ResetPropByData = function (control, data, parent) {
  if (data.ignoreSetProp) {
    return
  }
  let node = control._node
  parent = parent || node.getParent()

  let fullpath = getFullPathForName(data.charMapFile)
  cc.textureCache.addImage(fullpath, function (atlas) {
    let size = node.getContentSize()
    if (atlas) {
      size = cc.size(atlas.width, atlas.height)
    }
    if (data.itemWidth > size.width || data.itemHeight > size.height) {
      data.itemWidth = size.width / 10
      data.itemHeight = size.height
    }
    data.ignoreSetProp = true
    data.uuid = node.uuid
    let newNode = cocosGenNodeByData(data, parent)
    node.ignoreAddToParent = true
    ReplaceNode(node, newNode, parent)
    control._node = newNode
  })
}

ExtTextAtlas.SetNodePropByData = function (node, data, parent) {
  ExtTextAtlas.ResetPropByData({_node: node}, data, parent)
}

ExtTextAtlas.ExportNodeData = function (node, data) {
  if (node._charMapFileName) {
    node._stringValue && (data['string'] = node._stringValue)
    data['charMapFile'] = node._charMapFileName
    data['itemWidth'] = node._itemWidth || 0
    data['itemHeight'] = node._itemHeight || 0
    data['mapStartChar'] = node._startCharMap || '0'
  }

  data['anchorX'] = node.anchorX
  data['anchorY'] = node.anchorY
}

// ExtTextAtlas.SetPropChange = function (control, path, value) {
//   let data = cocosExportNodeData(control._node, {uuid: true})
//   data[path] = value
//   ExtTextAtlas.ResetPropByData(control, data)
// }

ExtTextAtlas.GetLoadImages = function(data) {
  return [data['charMapFile']]
}

ExtTextAtlas.SetPropChange = function (control, path, value) {
  SetDefaultPropChange(control, path, value)
}

ExtTextAtlas.NodifyPropChange = function (control) {
  SetNodifyPropChange(control)
}


ExtTextAtlas.ExportData = function (node) {
  this._node = node
}

ExtTextAtlas.ExportData.prototype = {
  __displayName__: 'TextAtlas',
  __type__: 'ccui.TextAtlas',

  get string() {
    return {
      path: 'string',
      type: 'input',
      name: 'string',
      attrs: {
      },
      value: this._node._stringValue
    }
  },

  get charMapFile() {
    return {
      path: 'charMapFile',
      type: 'asset',
      name: 'charMapFile',
      attrs: {
      },
      value: this._node._charMapFileName
    }
  },

  get itemWidth() {
    return {
      path: 'itemWidth',
      type: 'unit-input',
      name: 'itemWidth',
      attrs: {
      },
      value: this._node._itemWidth
    }
  },

  get itemHeight() {
    return {
      path: 'itemHeight',
      type: 'unit-input',
      name: 'itemHeight',
      attrs: {
      },
      value: this._node._itemHeight
    }
  },

  get mapStartChar() {
    return {
      path: 'mapStartChar',
      type: 'input',
      name: 'mapStartChar',
      attrs: {
      },
      value: this._node._startCharMap
    }
  },

  get __props__() {
    return [
      this.string,
      this.charMapFile,
      this.itemWidth,
      this.itemHeight,
      this.mapStartChar
    ]
  }
}

ExtTextAtlas.PropComps = function (node) {
  let datas = [ new WidgetData(node) ]
  datas.push(new TouchData(node))
  datas.push(new ExtTextAtlas.ExportData(node))
  return datas
}

module.exports = ExtTextAtlas

RegisterExtNodeControl(ExtTextAtlas.name, ExtTextAtlas)
