let ExtInput = {}

ExtInput.name = 'UIInput'
ExtInput.icon = 'app://res/control/Input.png'
ExtInput.tag = 5
ExtInput.defRes = 'res/default/shurukuang.png'

ExtInput.SetSpriteFrame = function (node, spriteFrame) {
  if (spriteFrame && getFullPathForName(spriteFrame)) {
    let fullpath = getFullPathForName(spriteFrame)
    cc.textureCache.addImage(fullpath, function () {
      let anchor = node.getAnchorPoint()
      let pos = node.getPosition()
      let size = node.getContentSize()
      node.initWithSizeAndBackgroundSprite(size, new cc.Scale9Sprite(fullpath))
      node.setPosition(pos)
      node.setAnchorPoint(anchor)
      // node.setContentSize(size)
      node._spriteFrame = spriteFrame
    })
  }
}

ExtInput.GenEmptyNode = function () {
  node = new cc.EditBox(cc.size(100, 20), new cc.Scale9Sprite())
  node.placeHolder = 'VisualUI'
  node.placeholderFontName = 'Arial'
  node.placeholderFontColor = cc.Color.GRAY
  ExtInput.SetSpriteFrame(node, ExtInput.defRes)
  node._className = ExtInput.name
  return node
}

ExtInput.GenNodeByData = function (data, parent) {
  node = new cc.EditBox(cc.size(data.width || 100, data.height || 20), new cc.Scale9Sprite())
  ExtInput.SetNodePropByData(node, data, parent)
  node._className = ExtInput.name
  return node
}

ExtInput.SetNodePropByData = function (node, data, parent) {
  data.string && (node.string = data.string)
  data.fontSize && (node.fontSize = data.fontSize)
  data.fontName && (node.fontName = data.fontName)
  ;(covertToColor(data.fontColor)) && (node.fontColor = covertToColor(data.fontColor))
  data.maxLength && (node.maxLength = data.maxLength)
  data.placeHolder && (node.placeHolder = data.placeHolder)
  data.placeHolderFontName && (node.placeHolderFontName = data.placeHolderFontName)
  data.placeHolderFontSize && (node.placeHolderFontSize = data.placeHolderFontSize)
  ;(covertToColor(data.placeholderFontColor)) && (node.placeholderFontColor = covertToColor(data.placeholderFontColor))
  !isNull(data.inputFlag) && (node.inputFlag = data.inputFlag)
  !isNull(data.inputMode) && (node.inputMode = data.inputMode)
  !isNull(data.returnType) && (node.returnType = data.returnType)

  ExtInput.SetSpriteFrame(node, data.spriteFrame)
}

ExtInput.ExportNodeData = function (node, data) {
  (node.string.length > 0) && (data['string'] = node.string)
  let value = null
  value = node._edFontName
  ;(value.length > 0) && (data['fontName'] = value)
  value = node._edFontSize
  ;(value != 14) && (data['fontSize'] = value)
  value = node._textColor
  ;(!cc.colorEqual(value, cc.color.BLACK)) && (data['fontColor'] = [value.r, value.g, value.b, value.a])
  ;(node._editBoxInputFlag != cc.EDITBOX_INPUT_FLAG_SENSITIVE) && (data['inputFlag'] = node._editBoxInputFlag)
  ;(node._editBoxInputMode != cc.EDITBOX_INPUT_MODE_ANY) && (data['inputMode'] = node._editBoxInputMode)
  ;(node._keyboardReturnType != cc.KEYBOARD_RETURNTYPE_DEFAULT) && (data['returnType'] = node._keyboardReturnType)
  ;(node.maxLength != 50) && (data['maxLength'] = node.maxLength)
  ;(node.placeHolder && node.placeHolder.length > 0) && (data['placeHolder'] = node.placeHolder)
  value = node._placeholderFontName
  ;(value.length > 0) && (data['placeHolderFontName'] = value)
  value = node._placeholderFontSize
  ;(value != 14) && (data['placeholderFontSize'] = value)
  value = node._placeholderColor || cc.color.GRAY
  ;(!cc.colorEqual(value, cc.color.GRAY)) && (data['placeholderFontColor'] = [value.r, value.g, value.b, value.a])
  value = node._spriteFrame
  ;(value && value.length > 0) && (data['spriteFrame'] = value)
}

ExtInput.SetPropChange = function (control, path, value) {
  SetDefaultPropChange(control, path, value)
}

ExtInput.NodifyPropChange = function (control) {
  SetNodifyPropChange(control)
}

ExtInput.ExportData = function (node) {
  this._node = node
}

ExtInput.ExportData.prototype = {
  __displayName__: 'UIInput',
  __type__: 'cc.Input',

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

  get string() {
    return {
      path: 'string',
      type: 'input',
      name: 'string',
      attrs: {
      },
      value: this._node.string
    }
  },

  get fontName() {
    return {
      path: 'fontName',
      type: 'input',
      name: 'fontName',
      attrs: {
      },
      value: this._node._edFontName
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
      value: this._node._edFontSize
    }
  },

  get fontColor() {
    return {
      path: 'fontColor',
      type: 'color',
      name: 'fontColor',
      attrs: {
      },
      value: this._node._textColor
    }
  },

  get maxLength() {
    return {
      path: 'maxLength',
      type: 'unit-input',
      name: 'maxLength',
      attrs: {
        expand: true,
        step: 1,
        precision: 0,
        min: 0
      },
      value: this._node.maxLength
    }
  },

  get placeHolderString() {
    return {
      path: 'placeHolder',
      type: 'input',
      name: 'placeHolder',
      attrs: {
      },
      value: this._node.placeHolder
    }
  },

  get placeHolderFontName() {
    return {
      path: 'placeholderFontName',
      type: 'input',
      name: 'placeHolderFontName',
      attrs: {
      },
      value: this._node._placeholderFontName
    }
  },

  get placeHolderFontSize() {
    return {
      path: 'placeholderFontSize',
      type: 'unit-input',
      name: 'placeHolderFontSize',
      attrs: {
        expand: true,
        step: 1,
        precision: 0,
        min: 0,
        max: 72
      },
      value: this._node._placeholderFontSize
    }
  },

  get placeHolderFontColor() {
    return {
      path: 'placeholderFontColor',
      type: 'color',
      name: 'placeholderFontColor',
      attrs: {
      },
      value: this._node._placeholderColor || cc.Color.BLACK
    }
  },

  get inputFlag() {
    return {
      path: 'inputFlag',
      type: 'select',
      name: 'inputFlag',
      attrs: {
        selects: {
          0: 'PASSWORD',
          1: 'SENSITIVE',
          2: 'INITIAL_CAPS_WORD',
          3: 'INITIAL_CAPS_SENTENCE',
          4: 'INITIAL_CAPS_ALL_CHARACTERS'
        }
      },
      value: this._node._editBoxInputFlag
    }
  },

  get inputMode() {
    return {
      path: 'inputMode',
      type: 'select',
      name: 'inputMode',
      attrs: {
        selects: {
          0: 'ANY',
          1: 'EMAIL_ADDR',
          2: 'NUMERIC',
          3: 'PHONE_NUMBER',
          4: 'URL',
          5: 'DECIMAL',
          6: 'SINGLE_LINE'
        }
      },
      value: this._node._editBoxInputMode
    }
  },

  get returnType() {
    return {
      path: 'returnType',
      type: 'select',
      name: 'returnType',
      attrs: {
        selects: {
          0: 'DEFAULT',
          1: 'DONE',
          2: 'SEND',
          3: 'SEARCH',
          4: 'GO'
        }
      },
      value: this._node._keyboardReturnType
    }
  },

  get __props__() {
    return [
      this.spriteFrame,
      this.string,
      this.fontName,
      this.fontSize,
      this.fontColor,
      this.inputFlag,
      this.inputMode,
      this.returnType,
      this.maxLength,
      this.placeHolderString,
      this.placeHolderFontName,
      this.placeHolderFontSize,
      this.placeHolderFontColor
    ]
  }
}

ExtInput.PropComps = function (node) {
  let datas = [ new WidgetData(node) ]
  datas.push(new TouchData(node))
  datas.push(new ExtInput.ExportData(node))
  return datas
}

module.exports = ExtInput

RegisterExtNodeControl(ExtInput.name, ExtInput)
