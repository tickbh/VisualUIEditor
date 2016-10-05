'use strict'

const Electron = require('electron')
const EventEmitter = require('events')

// ==========================
// Internal
// ==========================

/**
 * @class Command
 */
class Command {
  // {op=xx,scene=xx,uuid=xx,prop=xx,oldValue=xx,newValue=xx,time=xx}
  constructor (info) {
    this.info = info
  }
  undo () {
    let node = cocosGetItemByUUID(this.info.scene, this.info.uuid)
    if (this.info.op == 'prop') {
      if (!node) {
        return false
      }
      if (this.info.doPropChange) {
        this.info.doPropChange(node, this.info.prop, this.info.oldValue)
      } else {
        NodePropChange(node, this.info.prop, this.info.oldValue)
      }

      return true
    }
    console.warn('Please implement undo function in your command')
  }
  redo () {
    let node = cocosGetItemByUUID(this.info.scene, this.info.uuid)
    if (this.info.op == 'prop') {
      if (!node) {
        return false
      }

      if (this.info.doPropChange) {
        this.info.doPropChange(node, this.info.prop, this.info.newValue)
      } else {
        NodePropChange(node, this.info.prop, this.info.newValue)
      }
      return true
    }
    console.warn('Please implement redo function in your command')
  }

  isCanCombine (other) {
    if (!this.info || !other.info) {
      return false
    }

    if (this.info.op != other.info.op) {
      return false
    }

    if (this.info.uuid != other.info.uuid) {
      return false
    }

    if (this.info.op == 'prop' && (this.info.prop != other.info.prop)) {
      return false
    }

    if (Math.abs(this.info.time - other.info.time) >= 1000) {
      return false
    }
    return true
  }

  combineCommand (other) {
    if (!this.isCanCombine(other)) {
      return false
    }
    this.info.time = Math.max(this.info.time, other.info.time)
    this.info.newValue = other.info.newValue
    return true
  }

  dirty () { return true; }
}

/**
 * @class CommandGroup
 */
class CommandGroup {
  constructor () {
    this._commands = []
    this._time = null
    this.desc = ''
  }

  undo () {
    for ( let i = this._commands.length - 1; i >= 0; --i) {
      this._commands[i].undo()
    }
  }

  redo () {
    for ( let i = 0; i < this._commands.length; ++i) {
      this._commands[i].redo()
    }
  }

  dirty () {
    for ( let i = 0; i < this._commands.length; ++i) {
      if (this._commands[i].dirty()) {
        return true
      }
    }
    return false
  }

  add (cmd) {
    this._commands.push(cmd)
    this._time = cmd.info.time
  }

  clear () {
    this._commands = []
  }

  canCommit () {
    return this._commands.length
  }

  isCanCombine (other) {
    if (this._commands.length == 0) {
      return true
    }
    for ( let i = 0; i < this._commands.length; ++i) {
      if (this._commands[i].isCanCombine(other)) {
        return true
      }
    }
    if (this._time && Math.abs(this._time - other.info.time) < 1000) {
      return true
    }
    return false
  }

  combineCommand (other) {
    if (this._commands.length == 0) {
      this.add(other)
      return true
    }
    for ( let i = 0; i < this._commands.length; ++i) {
      if (this._commands[i].isCanCombine(other) && this._commands[i].combineCommand(other)) {
        this._time = other.info.time
        return true
      }
    }

    if (this._time && Math.abs(this._time - other.info.time) < 1000) {
      this.add(other)
      return true
    }
    return false
  }

}

/**
 * @class UndoList
 */
class UndoList extends EventEmitter {
  constructor (type) {
    super()
    // 是否变化时发送事件的变化
    this._silent = false
    // 分为local和global类型, local类型事件变化只会通知本地, global则会通常整个编辑器
    this._type = type

    // 当前的命令列表
    this._curGroup = new CommandGroup()
    // 操作过程的命令列表
    this._groups = []
    // 记录当前的位置信息
    this._position = -1
    // 上一次保存时的位置信息
    this._savePosition = -1
  }

  reset () {
    this.clear()
  }

  undo () {
    // check if we have un-commit group
    if (this._curGroup.canCommit()) {
      this._curGroup.undo()
      this._changed('undo-cache')
      this._groups.push(this._curGroup)
      this._curGroup = new CommandGroup()
      return true
    }

    // check if can undo
    if (this._position < 0) {
      return false
    }

    let group = this._groups[this._position]
    group.undo()
    this._position--
    this._changed('undo')
    return true
  }

  redo () {
    // check if can redo
    if (this._position >= this._groups.length - 1) {
      return false
    }

    this._position++
    let group = this._groups[this._position]
    group.redo()

    this._changed('redo')
    return true
  }

  add (cmd) {
    this._clearRedo()
    if (this._curGroup.isCanCombine(cmd)) {
      this._curGroup.combineCommand(cmd)
    } else {
      this.commit()
      this._curGroup.add(cmd)
    }
    this._changed('add-command')
  }

  commit () {
    if (this._curGroup.canCommit()) {
      this._groups.push(this._curGroup)
      this._position++
      this._changed('commit')
    }
    this._curGroup = new CommandGroup()
  }

  cancel () {
    this._curGroup.clear()
  }

  save () {
    this.commit()
    this._savePosition = this._position
    this._changed('save')
  }

  isSaved () {
    return this._savePosition == this._position && !this._curGroup.canCommit()
  }

  clear () {
    this._curGroup = new CommandGroup()
    this._groups = []
    this._position = -1
    this._savePosition = -1

    this._changed('clear')
  }

  dirty () {
    if (this._savePosition !== this._position) {
      let min = Math.min(this._position, this._savePosition)
      let max = Math.max(this._position, this._savePosition)

      for ( let i = min + 1; i <= max; i++) {
        if (this._groups[i].dirty()) {
          return true
        }
      }
    }

    return false
  }

  setCurrentDescription (desc) {
    this._curGroup.desc = desc
  }

  _clearRedo () {
    if (this._position + 1 === this._groups.length) {
      return
    }

    this._groups = this._groups.slice(0, this._position + 1)
    this._curGroup.clear()

    if (this._savePosition > this._position) {
      this._savePosition = this._position
    }
    this._changed('clear-redo')
  }

  _changed (type) {
    if (this._silent) {
      return
    }

    if (this._type === 'local') {
      this.emit('changed', type)
      return
    }

    Ipc.sendToAll('undo:changed', type)
  }
}

// ==========================
// exports
// ==========================

class UndoObj {
  constructor () {
    this._undoList = new UndoList('local')
  }
  undo () {
    if (this._undoList.undo()) {
      Ipc.sendToAll('ui:has_item_change', {})
    }
  }

  redo () {
    if (this._undoList.redo()) {
      Ipc.sendToAll('ui:has_item_change', {})
    }
  }

  add (cmd) {
    this._undoList.add(cmd)
  }

  commit () {
    this._undoList.commit()
  }

  cancel () {
    this._undoList.cancel()
  }

  collapseTo (index) {
    this._undoList.collapseTo(index)
  }

  save () {
    this._undoList.save()
  }

  isSaved () {
    return this._undoList.isSaved()
  }

  clear () {
    this._undoList.clear()
  }

  reset () {
    return this._undoList.reset()
  }

  dirty () {
    return this._undoList.dirty()
  }

  setCurrentDescription (desc) {
    return this._undoList.setCurrentDescription(desc)
  }

  local () {
    return new UndoList('local')
  }

}

// {op=xx,scene=xx,uuid=xx,prop=xx,oldValue=xx,newValue=xx,time=xx, doPropChange=fn}
function newPropCommandChange (scene, uuid, prop, oldValue, newValue, doPropChange) {
  return new Command({op: 'prop', scene: getRootNode(scene), uuid: uuid, prop: prop, oldValue: oldValue, newValue: newValue, doPropChange: doPropChange, time: new Date().getTime()})
}

function tryAddCommand (undo, command) {
  // no change don't add
  if (command.info.oldValue == command.info.newValue) {
    return
  }
  undo.add(command)
}

function addNodeCommand (node, prop, oldValue, newValue, doPropChange) {
  let scene = getRootNode(node)
  if (!scene._undo) {
    return
  }

  tryAddCommand(scene._undo, newPropCommandChange(scene, node.uuid, prop, oldValue, newValue, doPropChange))
}
