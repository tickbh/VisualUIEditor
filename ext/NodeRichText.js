let NodeRichText = ccui.RichText.extend({
  _originConfig: null,
  _curConfig: null,
  _text: '',
  _font: '',
  ctor: function (text, size, config) {
    ccui.RichText.prototype.ctor.call(this)
    this.initWithConfig(config || {})
    this.setContentSize(size.width || 100, size.height || 100)
    this.ignoreContentAdaptWithSize(false)
    this.setText(text)
  },

  initWithConfig: function (config) {
    this._originConfig = merge({color: cc.color.WHITE, fontSize: 20, ocolor: cc.color.BLACK, osize: 0}, config)
    this._curConfig = dup(this._originConfig)
  },

  setText: function (text) {
    this._elementRenderersContainer.removeAllChildren()
    this._elementRenders.length = 0
    this._richElements = []

    this._curConfig = dup(this._originConfig)
    this._text = text || ''
    this.parseText(this._text)
  },

  addNewLineElement: function() {
    var re = ccui.RichElementNewLine.create(1, this._curConfig.color, 255)
    this.pushBackElement(re)
  },


  addRichElement: function (str) {

//     cc.FontDefinition = function (properties) {
//     var _t = this;
//     _t.fontName = "Arial";
//     _t.fontSize = 12;
//     _t.textAlign = cc.TEXT_ALIGNMENT_CENTER;
//     _t.verticalAlign = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
//     _t.fillStyle = cc.color(255, 255, 255, 255);
//     _t.boundingWidth = 0;
//     _t.boundingHeight = 0;

//     _t.strokeEnabled = false;
//     _t.strokeStyle = cc.color(255, 255, 255, 255);
//     _t.lineWidth = 1;
//     _t.lineHeight = "normal";
//     _t.fontStyle = "normal";
//     _t.fontWeight = "normal";

//     _t.shadowEnabled = false;
//     _t.shadowOffsetX = 0;
//     _t.shadowOffsetY = 0;
//     _t.shadowBlur = 0;
//     _t.shadowOpacity = 1.0;

//     //properties mapping:
//     if(properties && properties instanceof Object){
//          for(var key in properties){
//              _t[key] = properties[key];
//          }
//     }
// };

    //  * var rtEl  = new ccui.RichElementText("tag", new cc.FontDefinition({
    //  *                              fillStyle: cc.color.BLACK,
    //  *                              fontName: "Arial",
    //  *                              fontSize: 12,
    //  *                              fontWeight: "bold",
    //  *                              fontStyle: "normal",
    //  *                              lineHeight: 14
    //  *                          }), 255, "Some Text");

    //     _t.strokeEnabled = false;
    // _t.strokeStyle = cc.color(255, 255, 255, 255);
    // _t.lineWidth = 1;
    var font = new cc.FontDefinition({
                                      fillStyle: this._curConfig.color,
                                      fontName: this._font,
                                      fontSize: this._curConfig.fontSize,
                                      strokeEnabled: this._curConfig.osize > 0,
                                      strokeStyle: this._curConfig.ocolor,
                                      lineWidth: this._curConfig.osize,
                                  });
    let re = ccui.RichElementText.create(1, font, 255, str)
    this.pushBackElement(re)
  },

  forceUpdate: function () {
    this.setText(this._text)
  },

  // "c200:200:200"
  richTextGetRGB: function (value) {
    let reg = /c(\d{1,3}):(\d{1,3}):(\d{1,3})/g
    var arr = reg.exec(value)
    if (arr == null) {
      return null
    }
    return new cc.Color(parseInt(arr[1]), parseInt(arr[2]), parseInt(arr[3]))
  },

  parseConfig: function (value) {
    let len = value.length
    let fontSize = 0
    if (value == '/c') {
      this._curConfig.color = this._originConfig.color
    } else if (value == 'cr') {
      this._curConfig.color = cc.color.RED
    } else if (value == 'cw') {
      this._curConfig.color = cc.color.WHITE
    } else if (value == 'cg') {
      this._curConfig.color = cc.color.GREEN
    } else if (value == 'co') {
      this._curConfig.color = cc.color.ORANGE
    } else if (value == 'cb') {
      this._curConfig.color = cc.color.BLUE
    } else if (value == 'cy') {
      this._curConfig.color = cc.color.YELLOW
    } else if (value.charAt(0) == 'c') {
      let color = this.richTextGetRGB(value)
      if (color) {
        this._curConfig.color = color
      }
    } else if (value == 'ocr') {
      this._curConfig.ocolor = cc.color.RED
    } else if (value == 'ocw') {
      this._curConfig.ocolor = cc.color.WHITE
    } else if (value == 'ocg') {
      this._curConfig.ocolor = cc.color.GREEN
    } else if (value == 'co') {
      this._curConfig.ocolor = cc.color.ORANGE
    } else if (value == 'ocb') {
      this._curConfig.ocolor = cc.color.BLUE
    } else if (value == 'ocy') {
      this._curConfig.ocolor = cc.color.YELLOW
    } else if (value.indexOf('oc') == 0) {
      let color = this.richTextGetRGB(value.substring(1))
      if (color) {
        this._curConfig.color = color
      }
    } else if (value.indexOf('f') == 0) {
      this._curConfig.fontSize = parseInt(value.substring(1))
    } else if (value.indexOf('of') == 0) {
      this._curConfig.osize = parseInt(value.substring(2))
    } else if (value == '/f') {
      this._curConfig.fontSize = this._originConfig.fontSize
    } else if (value == '/of') {
      this._curConfig.osize = this._originConfig.osize
    } else if (value == 'br') {
      this.addNewLineElement()
    }
  },

  parseText: function (text) {
    let inSerch = false
    let idx = 0, pre = 0
    while(idx < text.length) {
      let char = text.charAt(idx)
      let preIsConvert = idx > 0 && text.charAt(idx - 1) == '\\'
      if (char == '[' && !preIsConvert) {
        if (idx > pre) {
          this.addRichElement(text.substring(pre, idx))
          pre = idx
        }
        inSerch = true
        let findNext = function (str, index) {
          index = text.indexOf(']', index)
          while(index > 0 && text.charAt(index - 1) == '\\') {
            index = text.indexOf(']', index)
          }
          return index
        }
        let index = findNext(text, idx + 1)
        if (index < 0) {
          break
        }
        this.parseConfig(text.substring(idx + 1, index))
        idx = index
        pre = index + 1
        inSerch = false
      }
      inSerch = false
      idx = idx + 1
    }

    if (!inSerch) {
      this.addRichElement(text.substring(pre))
    }
  }
})
