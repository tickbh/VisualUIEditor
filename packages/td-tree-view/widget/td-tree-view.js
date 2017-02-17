(() => {
    'use strict'

    function _getLastChildRecursively(childItem) {
        if (childItem.foldable && !childItem.folded) {
            return _getLastChildRecursively(Polymer.dom(childItem).lastElementChild)
        }
        return childItem
    }

    function _checkFoldable(item) {
        return Polymer.dom().childNodes.length > 0
    }

    Polymer({
        properties: {
            enableDrag: Boolean
        },

        ready() {
            this._id2el = {}
            this._activeElement = null
        },

        created: function() {},

        addItem(parentItem, childItem) {
            let uuid = childItem._uuid = childItem._uuid || gen_uuid()
            Polymer.dom(parentItem).appendChild(childItem)
            if (parentItem !== this) {
                parentItem.foldable = true
            }
            // add to id table
            this._id2el[uuid] = childItem
            return uuid
        },

        removeItem(childItem) {
            // children
            let children = Polymer.dom(childItem).children
            for (let i = 0; i < children.length; ++i) {
                removeItem(children[i])
            }
            let parentItem = Polymer.dom(childItem).parentNode
            Polymer.dom(parentItem).removeChild(childItem)

            if (parentItem !== this) {
                parentItem.foldable = _checkFoldable(parentItem)
            }
            delete this._id2el[childItem._uuid]
        },

        removeItemById(id) {
            let el = this._id2el[id]
            if (el) {
                this.removeItem(el)
            }
        },

        setItemParent(childItem, parentItem) {
            if (IsSelfOrAncient(parentItem, childItem)) {
                throw new Error('Failed to set item parent to its child')
            }

            let oldparentItem = Polymer.dom(childItem).parentNode
            Polymer.dom(parentItem).appendChild(childItem)
            parentItem.foldable = _checkFoldable(parentItem)

            if (oldparentItem !== this) {
                oldparentItem.foldable = _checkFoldable(oldparentItem)
            }
        },

        setItemBefore(sourceItem, compareItem) {
            if (IsSelfOrAncient(compareItem, sourceItem)) {
                throw new Error('Failed to set item parent to its child')
            }

            let oldparentItem = Polymer.dom(sourceItem).parentNode
            let compareParentItem = Polymer.dom(compareItem).parentNode

            Polymer.dom(compareParentItem).insertBefore(sourceItem, compareItem)
            compareParentItem.foldable = _checkFoldable(compareParentItem)
            if (oldparentItem !== this) {
                oldparentItem.foldable = _checkFoldable(oldparentItem)
            }
        },

        setItemAfter(sourceItem, compareItem) {
            if (IsSelfOrAncient(sourceItem, compareItem)) {
                throw new Error('Failed to set item parent to its child')
            }

            let oldparentItem = Polymer.dom(sourceItem).parentNode
            let compareParentItem = Polymer.dom(compareItem).parentNode
            let nextItem = this.nextItem(compareItem, true)
            if (nextItem == sourceItem) {
                return
            }
            Polymer.dom(compareParentItem).insertBefore(sourceItem, nextItem)
            compareParentItem.foldable = _checkFoldable(compareParentItem)
            if (oldparentItem !== this) {
                oldparentItem.foldable = _checkFoldable(oldparentItem)
            }
        },

        setItemParentById(id, parentId) {
            let childItem = this._id2el[id]
            if (!childItem) {
                return
            }

            let parentItem = parentId ? this._id2el[parentId] : this
            if (!parentItem) {
                return
            }
            this.setItemParent(childItem, parentItem)
        },

        nextItem(curItem, skipChildren) {
            let curItemDOM = Polymer.dom(curItem)
            if (!skipChildren && curItem.foldable && !curItem.folded) {
                return curItemDOM.firstElementChild
            }

            if (curItemDOM.nextElementSibling) {
                return curItemDOM.nextElementSibling
            }

            return null
        },

        prevItem(curItem) {
            let curItemDOM = Polymer.dom(curItem)

            let prevSiblingEL = curItemDOM.previousSibling
            if (prevSiblingEL) {
                if (prevSiblingEL.foldable && !prevSiblingEL.folded) {
                    return _getLastChildRecursively(prevSiblingEL)
                }

                return prevSiblingEL
            }

            let parentItem = curItemDOM.parentNode
            if (parentItem === this) {
                return null
            }

            return parentItem
        },

        lastItem() {
            let lastChildEL = Polymer.dom(this).lastElementChild
            if (lastChildEL && lastChildEL.foldable && !lastChildEL.folded) {
                return _getLastChildRecursively(lastChildEL)
            }
            return lastChildEL
        },

        clear() {
            let thisDOM = Polymer.dom(this)
            let children = thisDOM.children
            for (var i = 0; i < children.length; i++) {
                thisDOM.removeChild(thisDOM.firstChild)
            }
            this._id2el = {}
        },

        expand(id, expand) {
            let childItem = this._id2el[id]
            let parentItem = Polymer.dom(childItem).parentNode
            while (parentItem) {
                if (parentItem === this) {
                    break
                }

                parentItem.folded = !expand
                parentItem = Polymer.dom(parentItem).parentNode
            }
        },

        scrollToItem(el) {
            window.requestAnimationFrame(() => {
                this.scrollTop = el.offsetTop + 16 - this.offsetHeight / 2
            })
        },

        selectItemById(id) {
            let childItem = this._id2el[id]
            if (childItem) {
                childItem.selected = true
            }
        },

        unselectItemById(id) {
            let childItem = this._id2el[id]
            if (childItem) {
                childItem.selected = false
            }
        },

        activeItemById(id) {
            let childItem = this._id2el[id]
            if (childItem) {
                this._activeElement = childItem
            }
        },

        deactiveItemById(id) {
            if (this._activeElement && this._activeElement._userId === id) {
                this._activeElement = null
            }
        },

        activeItem(childItem) {
            this._activeElement = childItem
        },

        deactiveItem(childItem) {
            if (childItem && this._activeElement === childItem) {
                this._activeElement = null
            }
        },

        getItemById(uuid) {
            return this._id2el[uuid]
        },

        dumpItemStates() {
            let states = []

            for (let id in this._id2el) {
                if (this._id2el[id].foldable) {
                    states.push({
                        uuid: this._id2el[id]._uuid,
                        folded: this._id2el[id].folded
                    })
                }
            }

            return states
        },

        restoreItemStates(states) {
            if (!states) {
                return
            }

            states.forEach(state => {
                let childItem = this._id2el[state.uuid]
                if (childItem) {
                    childItem.folded = state.folded
                }
            })
        },

        getToplevelElements(ids) {
            let elements = new Array(ids.length)
            for (let i = 0; i < ids.length; ++i) {
                elements[i] = this._id2el[ids[i]]
            }

            let resultELs = ArrayCmpFilter(elements, (elA, elB) => {
                if (elA.contains(elB)) {
                    return 1
                }

                if (elB.contains(elA)) {
                    return -1
                }

                return 0
            })
            return resultELs
        }
    })
})()