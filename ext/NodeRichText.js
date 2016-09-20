
NodeRichText = ccui.RichText.extend({
    _originConfig : null,
    _curConfig : null,
    _text: "",
    _font: "",
    ctor: function (text, size, config) {
        ccui.RichText.prototype.ctor.call(this);
        this.setContentSize(size.width || 100, size.height || 100)
        this.ignoreContentAdaptWithSize(false);
        this.setText(text)
    },

    initWithConfig: function(config) {
        this._originConfig = merge({color: cc.color.WHITE, fontSize: 20, ocolor: cc.color.BLACK, osize: 0}, config);
        this._curConfig = dup(self._originConfig);
    },

    setText: function(text) {
        this.clearAllElement();
        this._curConfig = dup(self._originConfig);
        this.text = text || "";
        this.parseText(this.text);
    },

    addRichElement: function(str) {
        let re = ccui.RichElementText.create(1, this._curConfig.color, 255, str, this._font, this._curConfig.fontSize);
        this.pushBackElement(re);
    },

// -- "c200:200:200"
// function UI_RICHTEXT_CLASS:richTextGetRGB(value)
//     local r, g, b = string.match(value, "(%d+):(%d+):(%d+)")
//     --print("richTextGetRGB", value, r, g, b)
//     local function checkNum(ss)
//         if not is_number(ss) then
//             return 0
//         end
//         return math.max(math.min(ss, 255), 0)
//     end
//     return cc.c3b(checkNum(tonumber(r)), checkNum(tonumber(g)), checkNum(tonumber(b)))
// end

    //"c200:200:200"
    richTextGetRGB: function(value) {
        let reg = /c(\d{1,3}):(\d{1,3}):(\d{1,3})/g;
        var arr = reg.exec(value);
        if(arr == null) {
            return null;
        }
        return new cc.Color(parseInt(arr[1]), parseInt(arr[2]), parseInt(arr[3]));
    },

    parseConfig: function(value) {
        let len = value.length;
        let fontSize = 0;
        if(value == "/c") {
            this._curConfig.color = this._originConfig.color;
        } else if(value == "cr") {
            this._curConfig.color = cc.color.RED;
        } else if(value == "cw") {
            this._curConfig.color = cc.color.WHITE;
        } else if(value == "cg") {
            this._curConfig.color = cc.color.GREEN;
        } else if(value == "co") {
            this._curConfig.color = cc.color.ORANGE;
        } else if(value == "cb") {
            this._curConfig.color = cc.color.BLUE;
        } else if(value == "cy") {
            this._curConfig.color = cc.color.YELLOW;
        } else if(value.charAt(0) == "c") {
            let color = this.richTextGetRGB(value);
            if(color) {
                this._curConfig.color = color;
            }
        } else if(value == "ocr") {
            this._curConfig.ocolor = cc.color.RED;
        } else if(value == "ocw") {
            this._curConfig.ocolor = cc.color.WHITE;
        } else if(value == "ocg") {
            this._curConfig.ocolor = cc.color.GREEN;
        } else if(value == "co") {
            this._curConfig.ocolor = cc.color.ORANGE;
        } else if(value == "ocb") {
            this._curConfig.ocolor = cc.color.BLUE;
        } else if(value == "ocy") {
            this._curConfig.ocolor = cc.color.YELLOW;
        } else if(value.indexOf("oc") == 0) {
            let color = this.richTextGetRGB(value.substring(1));
            if(color) {
                this._curConfig.color = color;
            }
        } else if(value == "f") {
            this._curConfig.fontSize = parseInt(value.substring(1));
        } else if(value == "of") {
            this._curConfig.osize = parseInt(value.substring(1));
        } else if(value == "/f") {
            this._curConfig.fontSize = this._originConfig.fontSize;
        } else if(value == "/of") {
            this._curConfig.osize = this._originConfig.osize;
        }
    },

    parseText: function(text) {
        let inSerch = false;
        let idx = 0, pre = 0;
        while(idx < text.length) {
            let char = text.charAt(idx);
            let preIsConvert = idx > 0 && text.charAt(idx - 1) == '\\';
            if(char == '[' && !preIsConvert) {
                if(idx > pre) {
                    this.addRichElement(text.substring(pre, idx - 1))
                    pre = idx
                }
            }
            inSerch = true
            let findNext = function(str, index) {
                index = text.indexOf("]", index)
                while(index > 0 && text.charAt(index - 1) == '\\') {
                    index = text.indexOf("]", index)
                }
                return index
            }
            this.parseConfig(text.substring(i + 1, index - 1))
            let index = findNext(text, i + 1);
            inSerch = false;
        }

        if(!inSerch) {
            this.addRichElement(text.substring(pre));
        }
    },
});
