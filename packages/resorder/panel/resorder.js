;(() => {
  'use strict'

  var dragIdName = 'ResMoveUUID'
  var dragIdAsset = 'asset'

  Polymer({
    properties: {
      filterText: {
        type: String,
        value: '',
        observer: '_filterTextChanged'
      }
    },

    _filterTextChanged: function () {
      applyFilterByTree(this.$.tree, this.filterText)
    },

    _foldedAll: function () {
      treeFoldedAll(this.$.tree)
    },

    _expandAll: function () {
      treeExpandAll(this.$.tree)
    },

    ready: function () {
      this._dragprop = []
      this._curOpMode = 'center'
      this._curSelectItem = null
      this._curMouseOverItem = null

      this.addEventListener('mousedown', function (e) {
        if (e.button == '2') {
          e.preventDefault()
          e.stopPropagation()
          Ipc.sendToMain('open-file-operate-menu', e.clientX, e.clientY)
        }
      })

      let self = this;
      this.$.input.addEventListener("end-editing", function(e) {
          if (e.detail.cancel) {
            return
          }
          self.filterText = e.target.value;
      })

      global.setTimeout(() => {
        if (window.localStorage['projectFolder']) {
          let path = window.localStorage['projectFolder']
          window['projectFolder'] = path
          Ipc.sendToAll('ui:project_floder_change', {folder: path})
        }
      }, 1000)
    },

    _refreshAll: function () {
      this.showFolderTree()
    },

    build: function (data) {
      console.time('tree')
      this.$.tree.clear()

      data.forEach(function (entry) {
        var newEL = this.newEntryRecursively(entry)
        this.$.tree.addItem(this.$.tree, newEL)
        newEL.folded = false
      }.bind(this))

      console.timeEnd('tree')
    },

    newEntryRecursively: function (entry) {
      var el = this.newEntry(entry)

      if (entry.children) {
        entry.children.forEach(function (childEntry) {
          var childEL = this.newEntryRecursively(childEntry)
          this.$.tree.addItem(el, childEL)
          childEL.folded = true
        }.bind(this))
      }

      return el
    },
    dragStart: function (ev) {
      ev.stopPropagation()
      ev.dataTransfer.dropEffect = 'move'
      ev.dataTransfer.setData(dragIdName, ev.target._uuid)
      ev.dataTransfer.setData(dragIdAsset, ev.target.path)
      ev.target.style.opacity = '0.4'
    },
    dragEnd: function (ev) {
      ev.preventDefault()
      ev.target.style.opacity = '1'
    },
    dragEnter: function (ev) {
      ev.preventDefault()
      ev.stopPropagation()
      ev.target.style.background = 'blue'
    },
    dragOver: function (ev) {
      ev.dataTransfer.effectAllowed = 'all'
      ev.dataTransfer.dropEffect = 'all'; // drop it like it's hot
      ev.preventDefault()
      ev.stopPropagation()

      var rect = ev.currentTarget.getBoundingClientRect()
      let ratio = 4
      if (!ev.currentTarget.isDirectory) {
        ratio = 2
      }
      if (ev.clientY - rect.top < rect.height / ratio) {
        ev.target.style.background = 'red'
        this._curOpMode = 'top'
      } else if (rect.bottom - ev.clientY < rect.height / ratio) {
        ev.target.style.background = 'yellow'
        this._curOpMode = 'bottom'
      } else {
        ev.target.style.background = 'blue'
        this._curOpMode = 'center'
      }
    },
    dragLeave: function (ev) {
      ev.preventDefault()
      ev.stopPropagation()
      ev.target.style.removeProperty('background')
    },
    dragDrop: function (ev) {
      ev.preventDefault()
      ev.stopPropagation()
      ev.target.style.removeProperty('background')

      var data = ev.dataTransfer.getData(dragIdName)
      if (!data) {
        ev.dataTransfer.effectAllowed = 'none'
        ev.dataTransfer.dropEffect = 'none'; // drop it like it's hot
        return
      }

      var item = this.$.tree.getItemById(data)
      if (item === null || item == undefined) {
        return
      }
      this.tryChangeItemPosition(item, ev.currentTarget)
    },
    tryChangeItemPosition: function (sourceItem, parentItem) {
      if (IsSelfOrAncient(parentItem, sourceItem)) {
        return
      }
      let dest = parentItem.path
      if (this._curOpMode == 'top' || this._curOpMode == 'bottom') {
        let parentNode = Polymer.dom(parentItem).parentNode
        if (!parentNode || !parentNode.path) {
          return
        }
        dest = parentNode.path
      }
      dest = dest + '/' + sourceItem.name

      fs.rename(sourceItem.path, dest, (function (err) {
        if (err) {
          console.error(err)
          return
        }

        sourceItem.path = dest
        if (this._curOpMode == 'top') {
          this.$.tree.setItemBefore(sourceItem, parentItem)
        } else if (this._curOpMode == 'bottom') {
          this.$.tree.setItemAfter(sourceItem, parentItem)
        } else {
          this.$.tree.setItemParent(sourceItem, parentItem)
        }
      }).bind(this))
    },
    dblclickItem: function (e) {
      this.clearSelectInfo()

      if (!e.currentTarget.isDirectory) {
        if (e.currentTarget.doselect) {
          e.currentTarget.doselect(e)
        }
        if (endWith(e.currentTarget.path, 'lang.txt')) {
          OpenLangInfo(e.currentTarget.path)
        } else {
          Ipc.sendToAllPanel('ui:open_file', {path: e.currentTarget.path})
        }
      }
      e.stopPropagation()
      e.preventDefault()
    },
    clickItem: function (e) {
      if (e.currentTarget.isDirectory && e.currentTarget.foldable) {
        e.currentTarget.folded = !e.currentTarget.folded
      } else {
        if (!isCtrlKey(event)) {
          this.clearSelectInfo()
        }
        if (e.currentTarget.doselect) {
          e.currentTarget.doselect(e)
        }
      }

      e.stopPropagation()
      e.preventDefault()
    },
    clearSelectInfo: function () {
      function recursiveClearSelect (item) {
        if (item.dounselect) {
          item.dounselect()
        }
        let children = Polymer.dom(item).children
        for ( let i = 0; i < children.length; ++i) {
          recursiveClearSelect(children[i])
        }
      }
      recursiveClearSelect(this.$.tree)
    },
    newEntry: function (entry) {
      var item = document.createElement('td-tree-item')
      let file = 'fa fa-file'
      let color = 'gray'
      if (entry.isDirectory) {
        file = 'red fa fa-folder'
        color = 'CornflowerBlue'
      } else if (endWith(entry.name, '.png') || endWith(entry.name, '.jpg')) {
        file = 'fa fa-file-image-o'
        color = 'PaleTurquoise'
      } else if (endWith(entry.name, '.ui')) {
        file = 'fa fa-fire'
        color = 'LightPink'
      }
      item.$.icon.style.color = color
      item.$.icon.className = file
      item.$.icon.hidden = false
      item.draggable = true
      item['ondragstart'] = this.dragStart.bind(this)
      item['ondragend'] = this.dragEnd.bind(this)
      item['ondragenter'] = this.dragEnter.bind(this)
      item['ondragover'] = this.dragOver.bind(this)
      item['ondragleave'] = this.dragLeave.bind(this)
      item['ondrop'] = this.dragDrop.bind(this)

      item['onclick'] = this.clickItem.bind(this)
      item['ondblclick'] = this.dblclickItem.bind(this)

      item['onmouseover'] = (function (e) {
        this._curMouseOverItem = item
        if (!item._isSlected) {
          item.$.header.style.background = 'LightSkyBlue'
        }
        e.preventDefault()
        e.stopPropagation()
      }).bind(this)

      item['onmouseout'] = (function (e) {
        if (this._curMouseOverItem == item) {
          this._curMouseOverItem = null
          if (!item._isSlected) {
            item.$.header.style.removeProperty('background')
          }
          e.preventDefault()
          e.stopPropagation()
        }
      }).bind(this)

      item.addEventListener('end-editing', function (e) {
        item.$.input.hidden = true
        item.$.name.hidden = false
        if (e.detail.cancel) {
          return
        }
        let dir = getParentDir(item.path)
        item.value = e.target.value
        let dest = dir + '/' + item.value
        fs.rename(item.path, dest, (function (err) {
          if (err) {
            console.error(err)
            return
          }
          item.name = item.value
          item.path = dest
        }).bind(this))

        e.preventDefault()
        e.stopPropagation()
      })

      let _item = item
      item['doselect'] = ((e) => {
        if (_item._isSlected) {
          return
        }
        if (this._curSelectItem == null) {
          this._curSelectItem = _item
        }
        _item.$.header.style.background = 'blue'
        _item._isSlected = true
        Ipc.sendToAll('ui:item_path_click', {path: e.currentTarget.path})
      }).bind(this)

      item['dounselect'] = (() => {
        if (this._curSelectItem == _item) {
          this._curSelectItem = null
        }
        _item._isSlected = false
        _item.$.header.style.removeProperty('background')
      }).bind(this)

      item.name = entry.name
      item.path = entry.path
      item.isDirectory = entry.isDirectory
      return item
    },

    _onOpenFloder() {
      ChangeProjectFolder()
    },

    _addFileOrFolder() {
      let rect = this.$.addBtn.getBoundingClientRect()
      Ipc.sendToMain('open-file-operate-menu', rect.left, rect.bottom + 5)
    },

    createFolderOrFile(operateItem, isFile) {
      let operatePath = operateItem.path
      let operateNode = operateItem

      if (!fs.statSync(operateItem.path).isDirectory()) {
        operatePath = getParentDir(operateItem.path)
        operateNode = Polymer.dom(operateItem).parentNode
      }
      if (!operatePath || !operateNode) {
        return
      }

      operateNode.folded = false
      let entry = null
      if (isFile) {
        entry = getCanUseFile(operatePath)
        fs.writeFileSync(entry.path, '{}')
      } else {
        entry = getCanUseFolder(operatePath)
        fs.mkdirSync(entry.path)
      }

      let el = this.newEntry(entry)
      this.$.tree.addItem(operateNode, el)

      el.$.name.hidden = true
      el.$.input.hidden = false
      let input = el.$.input
      setTimeout(() => {
        input.$.input.focus()
      }, 1)
    },

    showFolderTree: function (folder) {
      folder = folder || window.projectFolder
      var files = getFileList(folder, function (file) {
        if (file.length > 0 && file.charAt(0) == '.') {
          return true
        }
        if (file.indexOf('bower_components') == 0 || file.indexOf('node_modules') == 0 || file.indexOf('.') == 0) {
          return true
        }
        return false
      })
      this.build(files)
    },

    messages: {
      'ui:project_floder_change'(event, message) {
        ensureLangExist()

        let last_open_ui = window.localStorage['last_open_ui']
        if (!startWith(last_open_ui, message.folder)) {
          last_open_ui = null
          window.localStorage['last_open_ui'] = null
        }
        AddLinkToScripte(message.folder + '/js/init.html', function () {
          if (last_open_ui) {
            Ipc.sendToAllPanel('ui:open_file', {path: last_open_ui})
          }
        })

        this.showFolderTree(message.folder)
      },
      'ui:create_folder'(event, message) {
        let operateItem = this._curMouseOverItem || this._curSelectItem
        if (operateItem == null) {
          return
        }
        this.createFolderOrFile(operateItem, false)
      },
      'ui:create_scene'(event, message) {
        let operateItem = this._curMouseOverItem || this._curSelectItem
        if (operateItem == null) {
          return
        }
        this.createFolderOrFile(operateItem, true)
      },
      'ui:rename-file-or-folder'(event, message) {
        let operateItem = this._curMouseOverItem || this._curSelectItem
        if (operateItem == null) {
          return
        }
        operateItem.$.name.hidden = true
        operateItem.$.input.hidden = false
        let input = operateItem.$.input
        setTimeout(() => {
          input.$.input.focus()
        }, 1)
      },
      'ui:delete-file-or-folder'(event, message) {
        let operateItem = this._curMouseOverItem || this._curSelectItem
        if (operateItem == null) {
          return
        }
        deleteFolderRecursive(operateItem.path)
        this.$.tree.removeItem(operateItem)
        this._curMouseOverItem = null
        this._curSelectItem = null
      },
      'ui:show-in-explorer'(event, message) {
        let operateItem = this._curMouseOverItem || this._curSelectItem
        if (operateItem == null) {
          return
        }
        Electron.shell.showItemInFolder(operateItem.path)
      }
    }

  })
})()
