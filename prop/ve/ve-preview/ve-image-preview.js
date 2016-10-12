'use strict'
Polymer({
  properties: {
    info: {
      type: String,
      value: 'Unknown'
    },
    path: {
      type: String,
      value: '',
      observer: '_pathChanged'
    },
    mtime: {
      type: Number,
      value: 0
    }
  },
  _getSize: function () {
    return {
      width: this._image.width,
      height: this._image.height
    }
  },

  ready: function () {

  },
  _pathChanged: function () {
    if (!this.path) {
      return
    }
    var self = this
    this._image = new Image
    this._image.onload = function () {
      var size = self._getSize()
      self.info = size.width + ' x ' + size.height, self.resize()
    }
    this._image.src = fullPath(this.path)

  },

  fitSize: function (srcWidth, srcHeight, destWidth, destHeight) {
    let width, height
    if (srcWidth > destWidth && srcHeight > destHeight) {
      width = destWidth
      height = srcHeight * destWidth / srcWidth

      if (height > destHeight) {
        height = destHeight
        width = srcWidth * destHeight / srcHeight
      }
    } else if (srcWidth > destWidth) {
      width = destWidth
      height = srcHeight * destWidth / srcWidth
    } else if (srcHeight > destHeight) {
      width = srcWidth * destHeight / srcHeight
      height = destHeight
    } else {
      width = srcWidth
      height = srcHeight
    }

    return [width, height]
  },
  resize: function () {
    var contentRect = this.$.content.getBoundingClientRect(),
      imageSize = this._getSize(),
      size = this.fitSize(imageSize.width, imageSize.height, contentRect.width, contentRect.height)

    this.$.canvas.width = Math.ceil(size[0])
    this.$.canvas.height = Math.ceil(size[1])
    this.repaint()
  },
  repaint: function () {
    var canvas = this.$.canvas.getContext('2d')
    canvas.imageSmoothingEnabled = false

    var w = this.$.canvas.width,
      h = this.$.canvas.height
    canvas.drawImage(this._image, 0, 0, w, h)
  }
})
