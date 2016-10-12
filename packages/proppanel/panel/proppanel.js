;(() => {
  'use strict'

  Polymer({
    properties: {
      filterText: {
        type: String,
        value: ''
      }
    },

    addFunc: function (data) {},

    ready: function () {
      this._scene = null
      this._opnode = null

      this.addEventListener('end-editing', function (e) {
        if (e.detail.cancel) {
          return
        }
        let path = e.target.path, value = e.target.value
        if (!path || !this._opnode) {
          return
        }
        this._opnode.setAttrib(path, value, e.target)
      })
    },

    messages: {
      'ui:scene_change'(event, message) {
        this._scene = window.runScene
        this._opnode = new NodeData(this._scene)
        this.$.node.target = this._opnode
      },
      'ui:item_prop_change'(event, message) {
        if (this._opnode && this._opnode.uuid == message.uuid) {
          //   initNodeData(this._opnode)
          if (this._propUpdateTimeId) {
            return
          }
          this._propUpdateTimeId = setTimeout((() => {
            if (this._opnode) {
              this._opnode = new NodeData(this._opnode._node)
              this.$.node.target = this._opnode
            }
            this._propUpdateTimeId = null
          }).bind(this), 200)
        }
      },
      'ui:select_items_change'(event, message) {
        let node = cocosGetItemByUUID(this._scene, message.select_items[0])
        if (node == null) {
          node = this._scene
        }
        this._opnode = new NodeData(node)
        this.$.node.target = this._opnode
        this.$.node.hidden = false
        this.$.spritePreview.hidden = true
      },
      'ui:item_path_click'(event, message) {
        let path = message.path
        if (!endWith(path, '.png')) {
          return
        }
        this.$.node.hidden = true
        this.$.spritePreview.hidden = false
        this.$.spritePreview.path = path
      }
    }

  })
})()
