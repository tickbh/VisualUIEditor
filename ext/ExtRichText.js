let ExtRichText = {}

ExtRichText.name = 'UIRichText'
ExtRichText.icon = 'app://res/control/Label.png'
ExtRichText.tag = 2

ExtRichText.GenEmptyNode = function () {
  let node = new NodeRichText('V[cr]i[f30]su[/c]al[/f]UI', {}, {})
  node._className = ExtRichText.name
  return node
}

ExtRichText.GenNodeByData = function (data, parent) {
  return this.GenEmptyNode()
}

ExtRichText.SetNodeString = function (node, string) {
  if (!string) {
    return
  }
  let analyse = tryAnalyseLang(string)
  if (analyse.isKey) {
    node._text = analyse.value
    node._key = analyse.key
  } else {
    node._text = string
    node._key = undefined
  }
}

ExtRichText.SetNodePropByData = function (node, data, parent) {
  data.textAlign && (node.setTextHorizontalAlignment(data.textAlign))
  data.verticalAlign && (node.setTextVerticalAlignment(data.verticalAlign))
  data.lineBreakOnSpace && (node.setLineBreakOnSpace(data.lineBreakOnSpace))
  if (covertToColor(data.oriColor)) {
    node._originConfig.color = covertToColor(data.oriColor)
  }

  if (covertToColor(data.oriOColor)) {
    node._originConfig.ocolor = covertToColor(data.oriOColor)
  }
  data.oriFontSize && (node._originConfig.oriFontSize = data.oriFontSize)
  data.oriOSize && (node._originConfig.osize = data.oriOSize)
  ExtRichText.SetNodeString(node, data.text)
  node.forceUpdate()
}

ExtRichText.ExportNodeData = function (node, data) {
  node._textHorizontalAlignment != cc.TEXT_ALIGNMENT_LEFT && (data['textAlign'] = node._textHorizontalAlignment)
  node._textVerticalAlignment != cc.VERTICAL_TEXT_ALIGNMENT_TOP && (data['verticalAlign'] = node._textVerticalAlignment)
  node._lineBreakOnSpace && (data['lineBreakOnSpace'] = node._lineBreakOnSpace)
  if (!cc.colorEqual(node._originConfig.color, cc.color.WHITE)) {
    data['oriColor'] = [node._originConfig.color.r, node._originConfig.color.g, node._originConfig.color.b, node._originConfig.color.a]
  }
  data['oriFontSize'] = node._originConfig.fontSize
  data['oriOSize'] = node._originConfig.osize
  if (!cc.colorEqual(node._originConfig.ocolor, cc.color.BLACK)) {
    data['oriOColor'] = [node._originConfig.ocolor.r, node._originConfig.ocolor.g, node._originConfig.ocolor.b, node._originConfig.ocolor.a]
  }
  data['text'] = node._key ? ('@' + node._key) : node._text
}

ExtRichText.SetPropChange = function (control, path, value) {
  let node = control._node
  if (path == 'text') {
    ExtRichText.SetNodeString(node, value)
    node.forceUpdate()
  } else if (path == 'textAlign') {
    node.setTextHorizontalAlignment(parseFloat(value))
  } else if (path == 'verticalAlign') {
    node.setTextVerticalAlignment(parseFloat(value))
  } else if (path == 'oriFontSize') {
    node._originConfig.fontSize = value
    node.forceUpdate()
  }
  //  else if(path == "fontName") {
  //     node.fontName = value
  // }
  else if (path == 'oriOColor') {
    node._originConfig.ocolor = new cc.Color(value.r, value.g, value.b, value.a)
    node.forceUpdate()
  } else if (path == 'oriOSize') {
    node._originConfig.osize = value
    node.forceUpdate()
  } else if (path == 'oriColor') {
    node._originConfig.color = new cc.Color(value.r, value.g, value.b, value.a)
    node.forceUpdate()
  }
}

function RichTextData (node) {
  this._node = node
}

RichTextData.prototype = {
  __displayName__: 'UIRichText',
  __type__: 'UIRichText',

  get text() {
    return {
      path: 'text',
      type: 'textarea',
      name: 'text',
      attrs: {
      },
      value: this._node._key ? ('@' + this._node._key) : this._node._text
    }
  },

  get oriFontSize() {
    return {
      path: 'oriFontSize',
      type: 'unit-input',
      name: 'oriFontSize',
      attrs: {
        expand: true,
        step: 1,
        precision: 0,
        min: 0,
        max: 72
      },
      value: this._node._originConfig.fontSize
    }
  },

  get horizontalAlign() {
    return {
      path: 'textAlign',
      type: 'select',
      name: 'HorAlign',
      attrs: {
        selects: {
          0: 'LEFT',
          1: 'CENTER',
          2: 'RIGHT'
        }
      },
      value: this._node._textHorizontalAlignment
    }
  },

  get verticalAlign() {
    return {
      path: 'verticalAlign',
      type: 'select',
      name: 'VerAlign',
      attrs: {
        selects: {
          0: 'TOP',
          1: 'CENTER',
          2: 'BOTTOM'
        }
      },
      value: this._node._textVerticalAlignment
    }
  },

  get oriOSize() {
    return {
      path: 'oriOSize',
      type: 'unit-input',
      name: 'oriOSize',
      attrs: {
      },
      value: this._node._originConfig.osize
    }
  },

  get oriColor() {
    let color = this._node._originConfig.color || cc.color.WHITE
    return {
      path: 'oriColor',
      type: 'color',
      name: 'oriColor',
      attrs: {
      },
      value: {
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a
      }
    }
  },

  get oriOColor() {
    let color = this._node._originConfig.ocolor || cc.color.WHITE
    return {
      path: 'oriOColor',
      type: 'color',
      name: 'oriOColor',
      attrs: {
      },
      value: {
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a
      }
    }
  },

  get __props__() {
    return [
      this.text,
      // this.fontName,
      this.oriFontSize,
      this.horizontalAlign,
      this.verticalAlign,
      this.oriColor,
      this.oriOSize,
      this.oriOColor
    ]
  }
}

ExtRichText.RichTextData = RichTextData

ExtRichText.PropComps = function (node) {
  let datas = [ new WidgetData(node) ]
  datas.push(new TouchData(node))
  datas.push(new RichTextData(node))
  return datas
}

module.exports = ExtRichText

RegisterExtNodeControl(ExtRichText.name, ExtRichText)
