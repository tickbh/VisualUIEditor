function NodeData (node) {
  this._node = node
}

function WidgetData (node) {
  this._node = node
}

function TouchData (node) {
  this._node = node
}

function FixNodeHor (node, step) {
  step = fixFloatValue(step)
  node.x += step
  if (isNum(node.left)) {
    node.left += step
  }
  if (isNum(node.right)) {
    node.right -= step
  }
  if (isNum(node.horizontal)) {
    node.horizontal += step
  }
}

function FixNodeVer (node, step) {
  step = fixFloatValue(step)
  node.y += step
  if (isNum(node.top)) {
    node.top -= step
  }
  if (isNum(node.bottom)) {
    node.bottom += step
  }
  if (isNum(node.vertical)) {
    node.vertical += step
  }
}

function NodePropChange (node, prop, newValue) {
  if (prop == 'x') {
    let step = newValue - node[prop]
    FixNodeHor(node, step)
  } else if (prop == 'y') {
    let step = newValue - node[prop]
    FixNodeVer(node, step)
  } else if (prop == 'touchEnabled') {
    node._touchEnabled = newValue
  } else {
    node[prop] = newValue
  }
}

function AddPropChange (node, uuid, newValue) {
  // delete
  if (!newValue || Object.keys(newValue).length == 0) {
    let childNode = cocosGetItemByUUID(node, uuid)
    if (childNode) {
      childNode.removeFromParent(true)
      Ipc.sendToAll('ui:scene_items_change', {})
    }
  } else {
    let subNode = cocosGenNodeByData(newValue, node)
    if (subNode) {
      InsertAfterUUID(subNode, node, newValue['preuuid'])
      Ipc.sendToAll('ui:scene_item_add', {uuid: uuid})
    }
  }
}

function setSizeChange (node, prop, newValue) {
  if (prop == 'width') {
    let setFn = node.setPreferredSize ? node.setPreferredSize : node.setContentSize
    let perfer = node.setPreferredSize
    setFn.call(node, cc.size(newValue, node.height))
  } else {
    let setFn = node.setPreferredSize ? node.setPreferredSize : node.setContentSize
    setFn.call(node, cc.size(node.width, newValue))
  }
}

NodeData.prototype = {
  __displayName__: 'Node',
  get uuid() {
    return this._node.uuid
  },
  get position() {
    return {
      path: 'position',
      type: 'vec2',
      name: 'Position',
      attrs: {
        step: 5,
        precision: 0,
        min: -1000,
        max: 10000
      },
      value: {
        x: this._node.getPositionX(),
        y: this._node.getPositionY()
      }
    }
  },

  get rotation() {
    return {
      path: 'rotation',
      type: 'unit-input',
      name: 'Rotation',
      attrs: {
        expand: true,
        step: 5,
        precision: 0,
        min: 0,
        max: 360
      },
      value: this._node.getRotation()
    }
  },

  get scale() {
    return {
      path: 'scale',
      type: 'vec2',
      name: 'Scale',
      attrs: {
        step: 0.2,
        precision: 2,
        min: -100,
        max: 100
      },
      value: {
        x: this._node.getScaleX(),
        y: this._node.getScaleY()
      }
    }
  },

  get anchor() {
    return {
      path: 'anchor',
      type: 'vec2',
      name: 'Anchor',
      attrs: {
        step: 0.1,
        precision: 2,
        min: 0,
        max: 1
      },
      value: {
        x: this._node.anchorX,
        y: this._node.anchorY
      }
    }
  },

  get size() {
    let parent = this._node.getParent()
    let heightPer = 100
    let widthPer = 100
    if (parent && parent.width) {
      widthPer = this._node.width / parent.width * 100
    }
    if (parent && parent.height) {
      heightPer = this._node.height / parent.height * 100
    }
    return {
      path: 'size',
      type: 'size',
      name: 'Size',
      attrs: {
        hasParent: parent != null,
        min: 0,
        step: 5,
        precision: 0
      },
      value: {
        isWidthPer: this._node.isWidthPer,
        width: this._node.width,
        widthPer: widthPer,
        isHeightPer: this._node.isHeightPer,
        height: this._node.height,
        heightPer: heightPer
      }
    }
  },

  get tag() {
    return {
      path: 'tag',
      type: 'input',
      name: 'Tag',
      attrs: {},
      value: this._node._name
    }
  },

  get opacity() {
    return {
      path: 'opacity',
      type: 'unit-input',
      name: 'Opacity',
      attrs: {
        expand: true,
        step: 5,
        precision: 0,
        min: 0,
        max: 255
      },
      value: this._node.opacity
    }
  },

  get skew() {
    return {
      path: 'skew',
      type: 'vec2',
      name: 'Skew',
      attrs: {
        step: 5,
        precision: 0,
        min: 0,
        max: 360
      },
      value: {
        x: this._node.skewX,
        y: this._node.skewY
      }
    }
  },

  get color() {
    return {
      path: 'color',
      type: 'color',
      name: 'Color',
      attrs: {},
      value: {
        r: this._node.color.r,
        g: this._node.color.g,
        b: this._node.color.b,
        a: this._node.color.a
      }
    }
  },

  get visible() {
    return {
      path: 'visible',
      type: 'checkbox',
      name: 'visible',
      attrs: {},
      value: this._node.isVisible()
    }
  },


  get __props__() {
    return [
      this.tag,
      this.visible,
      this.position,
      this.size,
      this.anchor,
      this.scale,
      this.rotation,
      this.opacity,
      this.color,
      this.skew
    ]
  },

  get __comps__() {
    let extControl = GetExtNodeControl(this._node._className)
    if (extControl) {
      return extControl.PropComps(this._node)
    }
    let datas = [ new WidgetData(this._node) ]
    datas.push(new TouchData(this._node))
    if (this._node._path) {
      extControl = GetExtNodeControl(this._node._path)
      if (extControl) {
        return extControl.PropComps(this._node)
      }
    }
    return datas
  },

  setSpriteFrame(path, value, defRes, fn) {
    let url = getFullPathForName(value)
    let exist = checkTextureExist(url)
    value = exist ? value : defRes
    let newPath = '_' + path
    this._node[newPath] = value
    fn.call(this._node, getFullPathForName(value))
  },

  setAttrib(path, value, target) {
    let extControl = GetExtNodeControl(this._node._className)
    if (this._node._path && !extControl) {
      extControl = GetExtNodeControl(this._node._path)
    }
    if (path == 'tag') {
      addNodeCommand(this._node, '_name', this._node._name, value)
      this._node._name = value
    } else if (path == 'position.x') {
      addNodeCommand(this._node, 'x', this._node.x, parseFloat(value.toFixed(0)))
      this._node.x = parseFloat(value.toFixed(0))
      this._node.left = null
      this._node.right = null
    } else if (path == 'position.y') {
      addNodeCommand(this._node, 'y', this._node.y, value)
      this._node.y = value
      this._node.top = null
      this._node.bottom = null
    } else if (path == 'rotation') {
      addNodeCommand(this._node, 'rotation', this._node.rotation, value)
      this._node.rotation = value
    } else if (path == 'scale.x') {
      addNodeCommand(this._node, 'scaleX', this._node.scaleX, value)
      this._node.scaleX = value
    } else if (path == 'scale.y') {
      addNodeCommand(this._node, 'scaleY', this._node.scaleY, value)
      this._node.scaleY = value
    } else if (path == 'anchor.x') {
      addNodeCommand(this._node, 'anchorX', this._node.anchorX, value)
      this._node.anchorX = value
    } else if (path == 'anchor.y') {
      addNodeCommand(this._node, 'anchorY', this._node.anchorY, value)
      this._node.anchorY = value
    } else if (path == 'skew.x') {
      addNodeCommand(this._node, 'skewX', this._node.skewX, value)
      this._node.skewX = value
    } else if (path == 'skew.y') {
      addNodeCommand(this._node, 'skewY', this._node.skewY, value)
      this._node.skewY = value
    } else if (path == 'size.width') {
      addNodeCommand(this._node, 'width', this._node.width, value, setSizeChange)
      setSizeChange(this._node, 'width', value)
    } else if (path == 'size.height') {
      addNodeCommand(this._node, 'height', this._node.height, value, setSizeChange)
      setSizeChange(this._node, 'height', value)
    } else if (path == 'opacity') {
      addNodeCommand(this._node, 'opacity', this._node.opacity, value)
      this._node.opacity = value
    } else if (path == 'color') {
      addNodeCommand(this._node, 'color', this._node.color, new cc.Color(value.r, value.g, value.b, value.a))
      this._node.color = new cc.Color(value.r, value.g, value.b, value.a)
    } else if (path == 'size.isWidthPer') {
      addNodeCommand(this._node, 'isWidthPer', this._node.isWidthPer, !this._node.isWidthPer)
      this._node.isWidthPer = !this._node.isWidthPer
    } else if (path == 'size.isHeightPer') {
      addNodeCommand(this._node, 'isHeightPer', this._node.isHeightPer, !this._node.isHeightPer)
      this._node.isHeightPer = !this._node.isHeightPer
    } else if (path == 'size.widthPer') {
      let parent = this._node.getParent()
      if (parent && parent.width) {
        let val = value * parent.width / 100
        val = parseFloat(val.toFixed(0))
        addNodeCommand(this._node, 'width', this._node.width, val, setSizeChange)
        setSizeChange(this._node, 'width', val)
      }
    } else if (path == 'size.heightPer') {
      let parent = this._node.getParent()
      if (parent && parent.height) {
        let val = value * parent.height / 100
        val = parseFloat(val.toFixed(0))
        addNodeCommand(this._node, 'height', this._node.height, val, setSizeChange)
        setSizeChange(this._node, 'height', val)
      }
    } else if (path == 'relativePosition.checkTop') {
      if (!value) {
        this._node.top = null
      }
    } else if (path == 'relativePosition.checkLeft') {
      if (!value) {
        this._node.left = null
      }
    } else if (path == 'relativePosition.checkRight') {
      if (!value) {
        this._node.right = null
      }
    } else if (path == 'relativePosition.checkBottom') {
      if (!value) {
        this._node.bottom = null
      }
    } else if (path == 'relativePosition.checkHorizontal') {
      if (!value) {
        this._node.horizontal = null
      }
    } else if (path == 'relativePosition.checkVertical') {
      if (!value) {
        this._node.vertical = null
      }
    } else if (path == 'relativePosition.top') {
      value = parseFloat(value)
      let parent = this._node.getParent()
      if (parent && parent.height) {
        addNodeCommand(this._node, 'y', this._node.y, parent.height - value)
        this._node.y = parent.height - value
        this._node.top = value
        this._node.bottom = null
      }
    } else if (path == 'relativePosition.bottom') {
      value = parseFloat(value)
      addNodeCommand(this._node, 'y', this._node.y, value)
      this._node.y = value
      this._node.bottom = value
      this._node.top = null
    } else if (path == 'relativePosition.left') {
      value = parseFloat(value)
      addNodeCommand(this._node, 'x', this._node.x, value)
      this._node.x = value
      this._node.left = value
      this._node.right = null
    } else if (path == 'relativePosition.right') {
      value = parseFloat(value)
      let parent = this._node.getParent()
      if (parent && parent.width) {
        addNodeCommand(this._node, 'x', this._node.x, parent.width - value)
        this._node.x = parent.width - value
        this._node.right = value
        this._node.left = null
      }
    } else if (path == 'relativePosition.horizontal') {
      this._node.left = null
      this._node.right = null

      value = parseFloat(value)
      let parent = this._node.getParent()
      if (parent && parent.width) {
        this._node.x = parent.width / 2 + value
        this._node.horizontal = value
      }
    } else if (path == 'relativePosition.vertical') {
      this._node.bottom = null
      this._node.top = null

      value = parseFloat(value)
      let parent = this._node.getParent()
      if (parent && parent.width) {
        this._node.y = parent.height / 2 + value
        this._node.vertical = value
      }
    } else if (path == 'visible') {
      addNodeCommand(this._node, 'visible', this._node.visible, value)
      this._node.visible = value
    } else if (path == 'touchEnabled') {
      addNodeCommand(this._node, 'touchEnabled', this._node._touchEnabled, value)
      this._node._touchEnabled = value
    } else if (path == 'touchListener') {
      addNodeCommand(this._node, 'touchListener', this._node.touchListener, value)
      this._node.touchListener = value
    } else if (extControl) {
      extControl.SetPropChange(this, path, value, target)
    } else {
      return
    }

    if (this._node._className == 'Scene') {
      Ipc.sendToAll('ui:scene_prop_change', {})
    }

    Ipc.sendToAll('ui:has_item_change', {uuid: this._node.uuid})
  }
}

BlendData = {
  0: 'ZERO',
  1: 'ONE',
  770: 'SRC_ALPHA',
  776: 'SRC_ALPHA_SATURATE',
  768: 'SRC_COLOR',
  772: 'DST_ALPHA',
  774: 'DST_COLOR',
  771: 'ONE_MINUS_SRC_ALPHA',
  769: 'ONE_MINUS_SRC_COLOR',
  773: 'ONE_MINUS_DST_ALPHA',
  775: 'ONE_MINUS_DST_COLOR',
  32770: 'ONE_MINUS_CONSTANT_ALPHA',
  32772: 'ONE_MINUS_CONSTANT_ALPHA'
}

WidgetData.prototype = {
  __displayName__: 'Widget',

  get isRelativePos() {
    return {
      path: 'isRelativePos',
      type: 'check',
      name: 'RelativePos',
      attrs: {},
      value: this._node.isRelativePos || false
    }
  },

  get folded() {
    return isNull(this._node.left) && isNull(this._node.top) && isNull(this._node.right)
      && isNull(this._node.bottom) && isNull(this._node.horizontal) && isNull(this._node.vertical)
  },

  get relativePosition() {
    let parent = this._node.getParent()
    let left = this._node.x
    let right = 0
    let top = 0
    let bottom = this._node.y

    if (parent) {
      right = parent.width - this._node.x
      top = parent.height - this._node.y
    }
    return {
      path: 'relativePosition',
      type: 'relative',
      name: 'relativePosition',
      attrs: {
        step: 5,
        precision: 0
      },
      value: {
        isAlignLeft: 'number' == typeof this._node.left,
        isAlignTop: 'number' == typeof this._node.top,
        isAlignRight: 'number' == typeof this._node.right,
        isAlignBottom: 'number' == typeof this._node.bottom,
        isAlignHorizontalCenter: 'number' == typeof this._node.horizontal,
        isAlignVerticalCenter: 'number' == typeof this._node.vertical,
        left: this._node.left || left,
        top: this._node.top || top,
        right: this._node.right || right,
        bottom: this._node.bottom || bottom,
        horizontal: this._node.horizontal || 0,
        vertical: this._node.vertical || 0
      }
    }
  },

  get __props__() {
    return [
      this.relativePosition
    ]
  }
}

TouchData.prototype = {
  __displayName__: 'Touch',

  get touchEnabled() {
    return {
      path: 'touchEnabled',
      type: 'checkbox',
      name: 'touchEnabled',
      attrs: {
      },
      value: this._node._touchEnabled
    }
  },

  get touchListener() {
    return {
      path: 'touchListener',
      type: 'input',
      name: 'touchListener',
      attrs: {
      },
      value: this._node.touchListener
    }
  },

  get __props__() {
    return [
      this.touchEnabled,
      this.touchListener
    ]
  }
}

// LayoutData.prototype = {
//     __displayName__: "Layout",

//     get spriteFrame() {
//         return this._node._backGroundImageFileName
//     },

//     set spriteFrame(value) {

//     },

//     get bkScaleEnable() {
//         return {
//             path: "bkScaleEnable",
//             type: "check",
//             name: "bkScaleEnable",
//             attrs: {
//             },
//             value: this._node.isBackGroundImageScale9Enabled(),
//         }
//     },

//     get colorType() {
//         return {
//             path: "colorType",
//             type: "select",
//             name: "colorType",
//             attrs: {
//                 selects: {
//                     0: "BG_COLOR_NONE",
//                     1: "BG_COLOR_SOLID",
//                     2: "BG_COLOR_GRADIENT",
//                 }
//             },
//             value: this._node.getBackGroundColorType(),
//         }
//     },

//     get bkColor() {
//         return {
//             path: "bkColor",
//             type: "color",
//             name: "bkColor",
//             attrs: {
//             },
//             value: this._node.getBackGroundColor(),
//         }
//     },

//     get bkStartColor() {
//         return {
//             path: "bkStartColor",
//             type: "color",
//             name: "bkStartColor",
//             attrs: {
//             },
//             value: this._node.getBackGroundStartColor(),
//         }
//     },

//     get bkEndColor() {
//         return {
//             path: "bkEndColor",
//             type: "color",
//             name: "bkEndColor",
//             attrs: {
//             },
//             value: this._node.getBackGroundEndColor(),
//         }
//     },

//     get layoutType() {
//         return {
//             path: "layoutType",
//             type: "select",
//             name: "layoutType",
//             attrs: {
//                 selects: {
//                     0: "ABSOLUTE",
//                     1: "LINEAR_VERTICAL",
//                     2: "LINEAR_HORIZONTAL",
//                     3: "RELATIVE",
//                 }
//             },
//             value: this._node.layoutType,
//         }
//     },

//     get clippingEnabled() {
//         return {
//             path: "clippingEnabled",
//             type: "check",
//             name: "clippingEnabled",
//             attrs: {
//             },
//             value: this._node.clippingEnabled,
//         }
//     },

//     get clippingType() {
//         return {
//             path: "clippingType",
//             type: "select",
//             name: "clippingType",
//             attrs: {
//                 selects: {
//                     0: "CLIPPING_STENCIL",
//                     1: "CLIPPING_SCISSOR",
//                 }
//             },
//             value: this._node.clippingType,
//         }
//     },


// }
