var fs = require('fs')

cocosGetItemByUUID = function (node, uuid) {
  if (!uuid) {
    return null
  }
  function recursiveGetChild (node, uuid) {
    if (node.uuid == uuid) {
      return node
    }
    var children = node.getChildren()
    for (var i = 0; i < children.length; i++) {
      let subNode = recursiveGetChild(children[i], uuid)
      if (subNode) {
        return subNode
      }
    }
    return null
  }
  return recursiveGetChild(node, uuid)
}

function isBaseTypeByName (name) {
  if (startWith(name, 'SubPath:')) {
    return true
  }
  let index = name.indexOf(':')
  if (index >= 0) {
    name = name.substring(0, index)
  }
  if (name == 'UIButton' || name == 'UICheckBox' || name == 'UIImage'
    || name == 'UIInput' || name == 'UIScale9' || name == 'UISlider' || name == 'UIText' || name == 'UITextAtlas' || name == 'UIArmature') {
    return true
  }
  return false
}

function isBaseType (node) {
  if (node._path != null) {
    return true
  }
  let name = node._className
  return isBaseTypeByName(name)
}

function setNodeSpriteFrame (path, value, node, fn) {
  if (!value) {
    let newPath = '_' + path
    node[newPath] = ''
    fn.call(node, '')
    return
  }
  let url = getFullPathForName(value)
  let exist = checkTextureExist(url)
  if (!exist) {
    return
  }
  let newPath = '_' + path
  node[newPath] = value
  cc.textureCache.addImage(url, function () {
    fn.call(node, url)
  })
}

function cocosExportNodeBase (node, data) {
  if (!data) {
    data = {}
  }

  let parent = node.getParent()
  if (node.isWidthPer && parent) {
    let ratio = node.width / parent.width * 100
    data['width'] = ratio.toFixed(1) + '%'
  } else {
    data['width'] = node.width.toFixed(0)
  }

  if (node.isHeightPer && parent) {
    let ratio = node.height / parent.height * 100
    data['height'] = ratio.toFixed(1) + '%'
  } else {
    data['height'] = node.height.toFixed(0)
  }

  if (isNum(node.left) || isNum(node.right) || isNum(node.horizontal)) {
    isNum(node.left) && (data['left'] = fixFloatValue(node.left))
    isNum(node.right) && (data['right'] = fixFloatValue(node.right))
    isNum(node.horizontal) && (data['horizontal'] = fixFloatValue(node.horizontal))
  } else {
    data['x'] = fixFloatValue(node.x)
  }

  if (isNum(node.top) || isNum(node.bottom) || isNum(node.vertical)) {
    isNum(node.top) && (data['top'] = fixFloatValue(node.top))
    isNum(node.bottom) && (data['bottom'] = fixFloatValue(node.bottom))
    isNum(node.vertical) && (data['vertical'] = fixFloatValue(node.vertical))
  } else {
    data['y'] = fixFloatValue(node.y)
  }

  data['type'] = node._className
  if (!cc.colorEqual(node.color, cc.color.WHITE)) {
    data['color'] = [node.color.r, node.color.g, node.color.b, node.color.a]
  }

  if (node.scaleX != 1.0) {
    data['scaleX'] = node.scaleX
  }

  if (node.scaleY != 1.0) {
    data['scaleY'] = node.scaleY
  }

  if (node.rotation != 0) {
    data['rotation'] = node.rotation
  }

  if (node.opacity != 255) {
    data['opacity'] = node.opacity
  }

  if (node.anchorX != 0.5) {
    data['anchorX'] = node.anchorX
  }

  if (node.anchorY != 0.5) {
    data['anchorY'] = node.anchorY
  }

  return data
}

function cocosExportNodeData (node, ext) {
  let data = {}
  cocosExportNodeBase(node, data)
  if (node._name.length > 0) {
    data['id'] = node._name
  }
  if (typeof (node._touchEnabled) == 'boolean') {
    data['touchEnabled'] = node._touchEnabled
  }

  if (node.touchListener) {
    data['touchListener'] = node.touchListener
  }

  // 适用于删除及添加的撤消操作
  if (ext && ext.uuid) {
    data['uuid'] = node.uuid
    data['preuuid'] = CalcPreUUID(node)
  }

  (!node.isVisible()) && (data['visible'] = node.isVisible())

  let extControl = GetExtNodeControl(node._className)

  if (extControl) {
    extControl.ExportNodeData(node, data)
  } else if (startWith(node._className, 'SubPath')) {
    data['path'] = node._path
    data['anchorX'] = node.anchorX
    data['anchorY'] = node.anchorY
    extControl = GetExtNodeControl(node._path)
    extControl && extControl.ExportNodeData(node, data)
  } else if (node._className == 'Layout') {
    (node._backGroundImageFileName && node._backGroundImageFileName.length > 0) && (data['bkImg'] = node._backGroundImageFileName)
    ;(node._backGroundScale9Enabled) && (node['bkScaleEnable'] = node._backGroundScale9Enabled)
    let backgroupColorType = node.getBackGroundColorType()
    if (backgroupColorType != ccui.Layout.BG_COLOR_NONE) {
      data['bkColorType'] = backgroupColorType
      if (backgroupColorType == ccui.Layout.BG_COLOR_SOLID) {
        let color = node.getBackGroundColor()
        data['bkColor'] = [color.r, color.g, color.b, color.a]
      } else if (backgroupColorType == ccui.Layout.BG_COLOR_GRADIENT) {
        let color = node.getBackGroundStartColor()
        data['bkStartColor'] = [color.r, color.g, color.b, color.a]
        color = node.getBackGroundEndColor()
        data['bkEndColor'] = [color.r, color.g, color.b, color.a]
      }
    }
    data['layoutType'] = node.layoutType
    if (node.clippingEnabled) {
      data['clippingEnabled'] = node.clippingEnabled
      data['clippingType'] = node.clippingType
    }
  }

  if (!isBaseType(node)) {
    let childrenData = []
    let children = node.getChildren()
    for (var i = 0; i < children.length; i++) {
      childrenData.push(cocosExportNodeData(children[i], ext))
    }

    if (childrenData.length > 0) {
      data['children'] = childrenData
    }
  }

  return data
}

function saveSceneToFile (filename, scene, ext) {
  let data = cocosExportNodeData(scene, ext)
  fs.writeFileSync(filename, JSON.stringify(data, null, 4))
}

function saveFileByContent (filename, content) {
  fs.writeFileSync(filename, content)
}

function covertToColor (value) {
  if (value && !isNull(value.r)) {
    return value
  }
  if (!value || !isNum(value[0]) || !isNum(value[3])) {
    return null
  }
  return new cc.color(value[0], value[1], value[2], value[3])
}

function checkPathRepeat (node, path) {
  let parent = node
  while(parent) {
    if (path == parent._path || path == parent._sceneSubPath) {
      return true
    }
    parent = parent.getParent()
  }
  return false
}

function calcWidth (node, width, parent) {
  let ret = {width: 0, isWidthPer: false}
  if (isNull(width)) {
    width = node.width
  }
  width = width.toString()
  let index = width.indexOf('%')
  if (!parent || index < 0) {
    ret.width = parseFloat(width)
    return ret
  }

  ret.isWidthPer = true
  ret.width = parent.getContentSize().width * parseFloat(width) / 100
  return ret
}

function calcHeight (node, height, parent) {
  let ret = {height: 0, isHeightPer: false}
  if (isNull(height)) {
    height = node.height
  }
  height = height.toString()
  let index = height.indexOf('%')
  if (!parent || index < 0) {
    ret.height = parseFloat(height)
    return ret
  }

  ret.isHeightPer = true
  ret.height = parent.getContentSize().height * parseFloat(height) / 100
  return ret
}

function cocosGenSubUINode (path, parent) {
  let node = new cc.Node()
  node._path = path
  if (checkPathRepeat(parent, path)) {
    return null
  }
  cocosGenNodeByData(getPathData(path), parent, node)
  node._className = 'SubPath:' + path
  return node
}

function cocosGenNodeByDataBase (data, node, parent) {
  if (!isNull(data.width) || !isNull(data.height)) {
    let setFn = node.setPreferredSize ? node.setPreferredSize : node.setContentSize
    let widthRet = calcWidth(node, data.width, parent)
    let heightRet = calcHeight(node, data.height, parent)
    node.isWidthPer = widthRet.isWidthPer
    node.isHeightPer = heightRet.isHeightPer
    setFn.call(node, cc.size(widthRet.width, heightRet.height))
  }
  (!isNull(data.x)) && (node.x = parseFloat(data.x))
  ;(!isNull(data.y)) && (node.y = parseFloat(data.y))

  ;(!isNull(data.left)) && (node.x = parseFloat(data.left), node.left = data.left)
  ;(!isNull(data.right) && parent) && (node.x = parent.width - parseFloat(data.right), node.right = data.right)
  ;(!isNull(data.horizontal) && parent) && (node.x = parent.width / 2 + data.horizontal, node.horizontal = data.horizontal)

  ;(!isNull(data.bottom)) && (node.y = parseFloat(data.bottom), node.bottom = data.bottom)
  ;(!isNull(data.top) && parent) && (node.y = parent.height - parseFloat(data.top), node.top = data.top)
  ;(!isNull(data.vertical) && parent) && (node.y = parent.height / 2 + data.vertical, node.vertical = data.vertical)

  ;(!isNull(data.anchorX)) && (node.anchorX = parseFloat(data.anchorX))
  ;(!isNull(data.anchorY)) && (node.anchorY = parseFloat(data.anchorY))

  ;(!isNull(data.scaleX)) && (node.scaleX = parseFloat(data.scaleX))
  ;(!isNull(data.scaleY)) && (node.scaleY = parseFloat(data.scaleY))

  ;(!isNull(data.opacity)) && (node.opacity = parseFloat(data.opacity))
  ;(!isNull(data.rotation)) && (node.rotation = parseFloat(data.rotation))

  ;(!isNull(data.visible)) && node.setVisible(data.visible)

  ;(covertToColor(data.color)) && (node.color = covertToColor(data.color))
}

function cocosGenNodeByData (data, parent, outNode) {
  if (!data) {
    return
  }
  let node = null
  let extControl = GetExtNodeControl(data.type)
  if (outNode) {
    node = outNode
  } else if (data.path) {
    node = cocosGenSubUINode(data.path, parent)
  } else if (extControl) {
    node = extControl.GenNodeByData(data, parent)
  } else if (data.type == 'Scene' || !parent) {
    node = new cc.Scene()
    if (!parent) {
      node.width = 800
      node.height = 400
    }
  } else {
    node = new cc.Node()
    node._className = 'Node'
  }
  node._name = ''

  // if(parent && !node.getParent() && !node.ignoreAddToParent) {
  //     parent.addChild(node)
  // }

  node.uuid = data.uuid || gen_uuid()
  cocosGenNodeByDataBase(data, node, parent)
  ;(data.id) && (node._name = data.id)

  ;(!isNull(data.touchEnabled)) && (node._touchEnabled = data.touchEnabled)
  ;(!isNull(data.touchListener)) && (node.touchListener = data.touchListener)

  if (extControl) {
    extControl.SetNodePropByData(node, data, parent)
  } else if (node._path) {
    extControl = GetExtNodeControl(node._path)
    extControl && extControl.SetNodePropByData(node, data, parent)
  } else if (node._className == 'Layout') {
    setNodeSpriteFrame('backGroundImageFileName', data['bkImg'], node, node.setBackGroundImage)
    ;(data['bkScaleEnable']) && (node.setBackGroundImageScale9Enabled(data['bkScaleEnable']))

    ;(data['bkColorType']) && (node.setBackGroundColorType(data['bkColorType']))
    ;(covertToColor(data.bkColor)) && (node.setBackGroundColor(covertToColor(data.bkColor)))
    if (covertToColor(data.bkStartColor) && covertToColor(data.bkEndColor)) {
      node.setBackGroundColor(covertToColor(data.bkStartColor), covertToColor(data.bkEndColor))
    }

    (data['layoutType']) && (node.setLayoutType(data['layoutType']))
    ;(data['clippingEnabled']) && (node.setClippingEnabled(data['clippingEnabled']))
    ;(data['clippingType']) && (node.setClippingType(data['clippingType']))
  }

  data.children = data.children || []
  for (var i = 0; i < data.children.length; i++) {
    let child = cocosGenNodeByData(data.children[i], node)
    if (child && !child.ignoreAddToParent) {
      node.addChild(child)
    }
  }

  return node
}

function getPathData (path) {
  if (!path || !getFullPathForName(path)) {
    return JSON.parse('{}')
  }
  let content = fs.readFileSync(getFullRealPathForName(path))
  return JSON.parse(content || '{}')
}

function getMetaData (path) {
  let metaPath = path + '.meta'
  return getPathData(metaPath)
}

function setMetaData (path, data) {
  let metaPath = path + '.meta'
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 4))
}

function loadSceneFromFile (filename) {
  let content = fs.readFileSync(filename)
  let data = JSON.parse(content || '{}')
  data._sceneSubPath = calcRelativePath(window.projectFolder, filename)
  return cocosGenNodeByData(data, null)
}

function getFullRealPathForName (name) {
  let url = window.projectFolder + '/' + name
  if (fs.existsSync(url)) {
    return url
  }
  url = __dirname + '/' + name
  if (fs.existsSync(url)) {
    return url
  }
  if (fs.existsSync(name)) {
    return name
  }
  return null
}

function getFullPathForName (name) {
  let url = getFullRealPathForName(name)
  if (url) {
    return fullPath(url)
  }
  return null
}

function isFileExist (name) {
  if (fs.existsSync(name)) {
    return true
  }
  return false
}
function createEmptyNodeByType (type) {
  var node = null
  var extControl = GetExtNodeControl(type)
  if (extControl) {
    node = extControl.GenEmptyNode()
  }
  node._name = ''
  return node
}

function createDefaultNodeByType (type) {
  var node = null
  var extControl = GetExtNodeControl(type)
  if (extControl) {
    node = extControl.GenNodeByData()
  }
  node._name = ''
  return node
}

function getRootNode (node) {
  let root = node
  while(root.getParent()) {
    root = root.getParent()
  }
  return root
}

function CalcPreUUID (node) {
  let parent = node.getParent()
  if (!parent) {
    return null
  }
  let children = parent.getChildren()
  let index = children.indexOf(node)
  if (index == 0) {
    return null
  }
  return children[index - 1].uuid
}

function ReplaceNode (node, newNode, parent) {
  parent = parent || node.getParent()
  let afterNode = []
  let children = parent.getChildren()
  let index = children.indexOf(node)
  if (index < 0) {
    index = children.length
  }
  for (var i = index + 1; i < children.length; i++) {
    afterNode.push(children[i])
  }
  for (var i = 0; i < afterNode.length; i++) {
    afterNode[i].removeFromParent(false)
  }
  node.removeFromParent()
  parent.addChild(newNode)
  for (var i = 0; i < afterNode.length; i++) {
    parent.addChild(afterNode[i])
  }
}

function InsertBeforeUUID (node, parent, uuid) {
  let children = parent.getChildren()
  let index = 0
  for (var i = 0; i < children.length; i++) {
    if (children[i].uuid == uuid) {
      index = i
      break
    }
  }
  node.removeFromParent(false)
  let afterNode = []
  for (var i = index; i < children.length; i++) {
    afterNode.push(children[i])
  }
  for (var i = 0; i < afterNode.length; i++) {
    afterNode[i].removeFromParent(false)
  }
  parent.addChild(node)
  for (var i = 0; i < afterNode.length; i++) {
    parent.addChild(afterNode[i])
  }
}

function InsertAfterUUID (node, parent, uuid) {
  let children = parent.getChildren()
  let index = -1
  for (var i = 0; i < children.length; i++) {
    if (children[i].uuid == uuid) {
      index = i
      break
    }
  }
  node.removeFromParent(false)
  let afterNode = []
  for (var i = index + 1; i < children.length; i++) {
    afterNode.push(children[i])
  }
  for (var i = 0; i < afterNode.length; i++) {
    afterNode[i].removeFromParent(false)
  }
  parent.addChild(node)
  for (var i = 0; i < afterNode.length; i++) {
    parent.addChild(afterNode[i])
  }
}

function ClearCurrentGameStatus () {
  cc.game._prepareCalled = false
  cc.game._rendererInitialized = false
  cc.game._renderContext = null
}

function AddImages (images, callback) {
  let results = []
  let loadCount = 0
  let needLoadCount = images.length
  for (var i = 0; i < images.length; i++) {
    let fullpath = getFullPathForName(images[i])
    cc.textureCache.addImage(fullpath, function (atlas) {
      loadCount++
      results[i] = atlas
      if (loadCount == needLoadCount) {
        callback(results)
      }
    })
  }
}

function ResetNodePropByData (control, data, parent) {
  if (data.ignoreSetProp) {
    return
  }
  let node = control._node
  parent = parent || node.getParent()

  data.ignoreSetProp = true
  let newNode = cocosGenNodeByData(data, parent)
  node.ignoreAddToParent = true
  ReplaceNode(node, newNode, parent)
  control._node = newNode
}

function SetDefaultPropChange (control, path, value) {
  let data = cocosExportNodeData(control._node, {uuid: true})
  data[path] = value
  ResetNodePropByData(control, data)
}

function SetNodifyPropChange (control) {
  let data = cocosExportNodeData(control._node, {uuid: true})
  ResetNodePropByData(control, data)
}
