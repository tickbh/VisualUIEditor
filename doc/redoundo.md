#VisualUIEditor项目讲解之撤消反撤消详解
撤消反撤消在UI编辑器里面必备的功能，它可以帮助我们在编辑过程中，无需害怕误操作，助您更好的使用编辑器

#在项目中使用
当您在项目中错误的移动位置，或者设置了错误的属性，这时候您可以用CTRL+Z来撤消刚才您进行的修改
当您在项目中撤消了刚才的操作，又想快速的回到刚才的状态，这时候您可以使用CTRL+R反撤消功能，来进行反撤消

#源码讲解
##源码路径
项目的实现源码，可参考[renderUndo](https://github.com/tickbh/VisualUIEditor/blob/master/js/renderUndo.js "renderUndo")

##源码详解
每个Scene实例化的时候都会创建一个UndoObj，UndoObj里面是一层UndoList的浅封装，差别是在Undo和Redo的时候通常编辑器有节点发生变更
```js
"ui:scene_change"(event, message) {
    let runScene = this.$.scene.getRunScene();
    if(!runScene._undo)
        runScene._undo =  new UndoObj();
}
```

UndoList维持着场景变更的记录，UndoList的构造函数如下
```js
class UndoList extends EventEmitter {
  constructor (type) {
    super()
    //是否变化时发送事件的变化
    this._silent = false
    //分为local和global类型, local类型事件变化只会通知本地, global则会通常整个编辑器
    this._type = type

    //当前的命令列表
    this._curGroup = new CommandGroup()
    //操作过程的命令列表
    this._groups = []
    //记录当前的位置信息
    this._position = -1
    //上一次保存时的位置信息
    this._savePosition = -1
  }
}
```
当有新的操作到达时, 比如节点移动位置发生变更, 这时候则会调用函数
```js
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

```
因为整个撤消反撤消操作是单线的, 所以当有新的操作, 之前保存的redo操作变成无意义, 这时候会先清除redo列表, 即当前位置后命令列表
这时候我们会判断该命令是否能够合并, 如果能合并, 我们会优先尝试合并
```js
  //CommandGroup的函数
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

  //Command的函数
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
```
在CommandGroup中, 我们会遍历所有的Command，看能否进行合并或者最后一条Command的时间距离现在的时间太短，我们则认为能够合并
在Command中，同一种操作类型，同一个节点，同一个属性操作，时间在一定的时间内方可认为能合并
如果判断能合并，则进行合并并更新属性值
>###为什么如此设计？
>>因为整个撤消系统中，都是假定对其它系统一无所知的，而其它系统除了有限的Add接口，并没有暴露其它的接口信息
>>下面列举两种情景
>>* 当在编辑器中，拖动某个节点移动的时候，每隔350ms会触发一次mousemove事件，这时候节点属性会频繁更改，而我们又认为这是一次操作，则我们应当在移动完成之后按一次撤消应该回到之前的状态，而不应该是移动过程中的任何状态，这时候用到同属性操作，在一定时间内合并操作
>>* 当在编辑器中，一次拖动或者更改多个节点的属性，这时候预期的撤消应该为这次修改的所有属性同时回到变更之前的状态，而不应该是一个个节点的属性变更，所以这时候会合并所有的操作，当成一个组别

当判断不能合并的时候，则会新起一条CommandGroup来记录新的Command，并更新位置信息

**撤消Undo**
```js
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
```
撤消时，存在以下三种情况
* 当前的Group可提交，即当前Group记录着一些操作信息，并且我们没有提交操作，这时直接对当前的Group执行Undo，并更新列表信息
* 无可撤消的内容，即位置信息小于0
* 可撤消，获取当前位置的Group进行撤消，并更新位置信息
```js
  //Command undo
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
```
每个命令列表，首先会先尝试获取节点，然后根据节点的属性变更，进行新旧值的设置

**反撤消Redo**
```js
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
```
存在以下两种情况
* 当前位置处理列表的最后一位，即无可反撤消的内容，此时不执行任何操作
* 获取该反撤消的Group，对其执行redo操作
```js
  //Command redo
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
```
每个命令列表，首先会先尝试获取节点，然后根据节点的属性变更，进行新旧值的设置

**在编辑器中添加Command**
```js
function addNodeCommand (node, prop, oldValue, newValue, doPropChange) {
  let scene = getRootNode(node)
  if (!scene._undo) {
    return
  }

  tryAddCommand(scene._undo, newPropCommandChange(scene, node.uuid, prop, oldValue, newValue, doPropChange))
}
```
当属性发生变更的时候，我们会调用addNodeCommand值进行相应的设置，来添加撤消反撤消功能的支持，以下的参数说明
* node即发生变化的节点
* prop即发生变化的属性值，值为x，width这种
* oldValue即当前node节点的值
* newValue为node属性将要变更的值
* doPropChange如果没有传该函数，则会调用NodePropChange进行修改，如果伴随属性变更，需调用相关函数，则可以传自定义函数，原型如下
```js
function(node, prop, newValue) {}
```
其它未列出的信息，可参考源码的实现细节

#其它信息
**VisualUIEditor开发QQ群欢迎您的加入: 453224679**
