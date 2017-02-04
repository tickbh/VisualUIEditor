(() => {
    'use strict'

    var dragIdName = 'NodeMoveUUID'

    Polymer({
        properties: {
            filterText: {
                type: String,
                value: '',
                observer: '_filterTextChanged'
            }
        },

        _filterTextChanged: function() {
            applyFilterByTree(this.$.tree, this.filterText)
        },

        ready: function() {
            this._dragprop = []
            this._curOpMode = 'center'
            this._scene = null

            this._preSceneInfo = {}

            this.addEventListener('mousedown', function(e) {
                if (e.button == '2') {
                    e.preventDefault()
                    e.stopPropagation()
                    Ipc.sendToMain('popup-create-node-menu', e.clientX, e.clientY)
                }
            })

            let self = this
            this.$.input.addEventListener('end-editing', function(e) {
                if (e.detail.cancel) {
                    return
                }
                self.filterText = e.target.value
            })

            this.addEventListener('keydown', function(event) {
                if (event.keyCode == KeyCodes('left') || event.keyCode == KeyCodes('right') || event.keyCode == KeyCodes('up') || event.keyCode == KeyCodes('down')) {
                    this._doItemMove(event)
                    event.stopPropagation()
                    event.preventDefault()
                }
            }.bind(this), true)
        },

        _addNode: function() {
            let rect = this.$.addBtn.getBoundingClientRect()
            Ipc.sendToMain('popup-create-node-menu', rect.left, rect.bottom + 5)
        },

        build: function(data) {
            console.time('tree')
            var status = this.$.tree.dumpItemStates()
            this.$.tree.clear()
            if (!this._scene) {
                return
            }

            var newEL = this.newEntryRecursively(this._scene)
            this.$.tree.addItem(this.$.tree, newEL)
            this.$.tree.restoreItemStates(status)
            newEL.folded = false

            console.timeEnd('tree')
        },

        newEntryRecursively: function(entry) {
            var el = this.newEntry(entry)
            if (isBaseTypeByName(el.name)) {
                return el
            }
            let children = entry.getChildren()
            if (children) {
                children.forEach(function(childEntry) {
                    var childEL = this.newEntryRecursively(childEntry)
                    this.$.tree.addItem(el, childEL)
                    childEL.folded = true
                }.bind(this))
            }

            return el
        },
        dragStart: function(ev) {
            ev.stopPropagation()
            ev.dataTransfer.dropEffect = 'move'
            ev.dataTransfer.setData(dragIdName, ev.target._uuid)
            ev.target.style.opacity = '0.4'
        },
        dragEnd: function(ev) {
            ev.preventDefault()
            ev.target.style.opacity = '1'
        },
        dragEnter: function(ev) {
            ev.preventDefault()
            ev.stopPropagation()
            var data = ev.dataTransfer.getData(dragIdName)
            if (!data) {
                ev.dataTransfer.effectAllowed = 'none'
                ev.dataTransfer.dropEffect = 'none'; // drop it like it's hot
                return
            }
            ev.target.style.background = 'blue'
        },
        dragOver: function(ev) {
            ev.preventDefault()
            ev.stopPropagation()

            ev.dataTransfer.effectAllowed = 'all'
            ev.dataTransfer.dropEffect = 'all'; // drop it like it's hot

            var rect = ev.currentTarget.getBoundingClientRect()
            let ratio = 4
            if (isBaseTypeByName(ev.currentTarget.name)) {
                ratio = 2
            }
            if (ev.clientY - rect.top <= rect.height / ratio) {
                ev.target.style.background = 'red'
                this._curOpMode = 'top'
            } else if (rect.bottom - ev.clientY <= rect.height / ratio) {
                ev.target.style.background = 'yellow'
                this._curOpMode = 'bottom'
            } else {
                ev.target.style.background = 'blue'
                this._curOpMode = 'center'
            }

            var data = ev.dataTransfer.getData(dragIdName)
        },
        dragLeave: function(ev) {
            ev.preventDefault()
            ev.stopPropagation()
            ev.target.style.removeProperty('background')
        },
        dragDrop: function(ev) {
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
        clickItem: function(e) {
            if (!isCtrlKey(e)) {
                this.clearSelectInfo()
            }
            if (e.currentTarget.doselect) {
                e.currentTarget.doselect(e)
            }
            e.stopPropagation()
            e.preventDefault()
        },
        clearSelectInfo: function() {
            function recursiveClearSelect(item) {
                if (item.dounselect) {
                    item.dounselect()
                }
                let children = Polymer.dom(item).children
                for (let i = 0; i < children.length; ++i) {
                    recursiveClearSelect(children[i])
                }
            }
            recursiveClearSelect(this.$.tree)
        },
        selectItemsByData: function(select_items) {
            this.clearSelectInfo()

            function recursiveItemSelect(item, select_items) {
                if (select_items.indexOf(item._uuid) >= 0 && item.doselect) {
                    item.doselect()
                }
                let children = Polymer.dom(item).children
                for (let i = 0; i < children.length; ++i) {
                    recursiveItemSelect(children[i], select_items)
                }
            }
            recursiveItemSelect(this.$.tree, select_items)
        },
        getItemByUUID: function(uuid) {
            function recursiveGetItemByUUID(item, uuid) {
                if (uuid === item._uuid) {
                    return item
                }
                let children = Polymer.dom(item).children
                for (let i = 0; i < children.length; ++i) {
                    let selectItem = recursiveItemSelect(children[i], uuid)
                    if (selectItem) {
                        return selectItem
                    }
                }
                return null
            }
            return recursiveGetItemByUUID(this.$.tree, uuid)
        },
        sceneItemAdd: function(uuid) {
            let child = cocosGetItemByUUID(this._scene, uuid)
            if (!child) {
                return
            }
            if (this.$.tree.getItemById(uuid)) {
                return
            }
            let parent = child.getParent()
            let parentItem = this.$.tree
            if (parent) {
                parentItem = this.$.tree.getItemById(parent.uuid) || this.$.tree
            }
            let item = this.newEntryRecursively(child)
            this.$.tree.addItem(parentItem, item)
        },
        sceneItemDelete: function(uuid) {
            function recursiveItemDelete(item, delete_items) {
                if (delete_items.indexOf(item._uuid) >= 0) {
                    let parentItem = Polymer.dom(item).parentNode
                    Polymer.dom(parentItem).removeChild(item)
                }
            }
            recursiveItemDelete(this.$.tree, [uuid])
        },
        tryChangeItemPosition: function(sourceItem, parentItem) {
            if (IsSelfOrAncient(parentItem, sourceItem)) {
                return
            }
            let uuid = { sourceUUID: sourceItem._uuid, compareUUID: parentItem._uuid, mode: this._curOpMode }
            Ipc.sendToAll('ui:change_item_position', uuid)
            if (this._curOpMode == 'top') {
                this.$.tree.setItemBefore(sourceItem, parentItem)
            } else if (this._curOpMode == 'bottom') {
                this.$.tree.setItemAfter(sourceItem, parentItem)
            } else {
                this.$.tree.setItemParent(sourceItem, parentItem)
            }
        },
        newEntry: function(entry) {
            let _this = this
            var item = document.createElement('td-tree-item')
            item.draggable = true
            item['ondragstart'] = this.dragStart.bind(this)
            item['ondragend'] = this.dragEnd.bind(this)
            item['ondragenter'] = this.dragEnter.bind(this)
            item['ondragover'] = this.dragOver.bind(this)
            item['ondragleave'] = this.dragLeave.bind(this)
            item['ondrop'] = this.dragDrop.bind(this)
            item['onclick'] = this.clickItem.bind(this)

            item['onmouseover'] = (function(e) {
                this._curMouseOverItem = item
                if (!item._isSlected) {
                    item.$.header.style.background = 'LightSkyBlue'
                }
                e.preventDefault()
                e.stopPropagation()
            }).bind(this)

            item['onmouseout'] = (function(e) {
                if (this._curMouseOverItem == item) {
                    this._curMouseOverItem = null
                    if (!item._isSlected) {
                        item.$.header.style.removeProperty('background')
                    }
                    e.preventDefault()
                    e.stopPropagation()
                }
            }).bind(this)

            let _item = item
            item['doselect'] = (e) => {
                if (_item._isSlected) {
                    return
                }
                _item.$.header.style.background = 'blue'
                _item._isSlected = true

                let parentNode = Polymer.dom(_item).parentNode
                while (parentNode) {
                    parentNode.folded = false
                    parentNode = Polymer.dom(parentNode).parentNode
                }
                _this.$.tree.scrollToItem(_item)
                if (e)
                    Ipc.sendToAll('ui:select_item', { uuid: _item._uuid, ctrlKey: isCtrlKey(e) })
            }

            item['dounselect'] = () => {
                _item._isSlected = false
                _item.$.header.style.removeProperty('background')
            }
            let name = entry._className || 'Node'
            if (entry._name && entry._name.length > 0) {
                name = name + ':' + entry._name
            }
            item.name = name
            item._uuid = entry.uuid
            return item
        },

        messages: {
            'ui:scene_change' (event, message) {
                this._scene = window.runScene
                this.build()
            },
            'ui:select_items_change' (event, message) {
                this.selectItemsByData(message.select_items)
            },
            'ui:scene_item_add' (event, message) {
                this.sceneItemAdd(message.uuid)
            },
            'ui:scene_items_change' (event, message) {
                this.build()
            },
            'ui:has_item_change' (event, message) {
                let item = this.$.tree.getItemById(message.uuid)
                let child = cocosGetItemByUUID(this._scene, message.uuid)
                if (item && child) {
                    let name = child._className || 'Node'
                    if (child._name && child._name.length > 0) {
                        name = name + ':' + child._name
                    }
                    item.name = name
                }
            },
            'ui:move_position_top' (event, message) {
                if (!this._curMouseOverItem) {
                    return
                }
                let parentItem = Polymer.dom(this._curMouseOverItem).parentNode
                if (!parentItem) {
                    return
                }
                let firstChild = Polymer.dom(parentItem).firstElementChild
                this._curOpMode = 'top'
                this.tryChangeItemPosition(this._curMouseOverItem, firstChild)
            },
            'ui:move_position_up' (event, message) {
                if (!this._curMouseOverItem) {
                    return
                }
                let parentItem = Polymer.dom(this._curMouseOverItem).previousElementSibling
                if (!parentItem) {
                    return
                }
                this._curOpMode = 'top'
                this.tryChangeItemPosition(this._curMouseOverItem, parentItem)
            },
            'ui:move_position_down' (event, message) {
                if (!this._curMouseOverItem) {
                    return
                }
                let parentItem = Polymer.dom(this._curMouseOverItem).nextElementSibling
                if (!parentItem) {
                    return
                }
                this._curOpMode = 'bottom'
                this.tryChangeItemPosition(this._curMouseOverItem, parentItem)
            },
            'ui:move_position_bottom' (event, message) {
                if (!this._curMouseOverItem) {
                    return
                }
                let parentItem = Polymer.dom(this._curMouseOverItem).parentNode
                if (!parentItem) {
                    return
                }
                let firstChild = Polymer.dom(parentItem).lastElementChild
                this._curOpMode = 'bottom'
                this.tryChangeItemPosition(this._curMouseOverItem, firstChild)
            },
            'ui:global_time_update' (event, message) {
                if (!this._scene) {
                    return
                }
                var scene_info = GetNodeUuids(this._scene)
                if (!CheckDeepSame(scene_info, this._preSceneInfo)) {
                    this.build()
                    this._preSceneInfo = scene_info
                }
            }
        }

    })
})()