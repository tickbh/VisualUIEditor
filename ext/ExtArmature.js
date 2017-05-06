let ExtArmature = {}

ExtArmature.name = 'UIArmature'
ExtArmature.icon = 'app://res/control/Armature.png'
ExtArmature.tag = 10

ExtArmature.GenEmptyNode = function() {
    node = new ccs.Armature()
    node._className = ExtArmature.name
    return node
}

ExtArmature.SetBaseNodeProp = function(node, data) {
    data.actionName && (node.actionName = data.actionName)
    data.imagePath && (node.imagePath = data.imagePath)
    data.plistPath && (node.plistPath = data.plistPath)
    data.configFilePath && (node.configFilePath = data.configFilePath)
}

ExtArmature.GenNodeByData = function(data, parent) {
    // data.actionName = 'skill1'
    // data.imagePath = 'fla/skill1.png'
    // data.plistPath = 'fla/skill1.plist'
    // data.configFilePath = 'fla/skill1.xml'

    node = new ccs.Armature()
    node._className = ExtArmature.name
    ExtArmature.SetBaseNodeProp(node, data)
        // data.ignoreSetProp = true
    if (data.uuid) {
        node.uuid = data.uuid
    }
    var fullImagePath = getFullPathForName(data.imagePath)
    var fullPlistPath = getFullPathForName(data.plistPath)
    var fullConfigPath = getFullPathForName(data.configFilePath)
    if (!fullImagePath || !fullPlistPath || !fullConfigPath || !data.actionName) {
        return node
    }
    // cc.loader.load([fullImagePath, fullPlistPath, fullConfigPath],
    //   function (results, count, loadedCount) {
    //     if (count == loadedCount + 1) {
    //     }
    //   }, function () {
    ccs.armatureDataManager.addArmatureFileInfo(fullImagePath, fullPlistPath, fullConfigPath)
        // if(!node.getParent() && parent) {
        //   parent.addChild(node)
        // }
    node.init(data.actionName)
    if (node.getAnimation()) {
        node.getAnimation().play('stand', -1, 1)
    }
    return node
}

ExtArmature.ResetPropByData = function(control, data, parent) {
    if (data.ignoreSetProp) {
        return
    }
    let node = control._node
    parent = parent || node.getParent()

    data.ignoreSetProp = true
    data.uuid = node.uuid
    let newNode = cocosGenNodeByData(data, parent)
    node.ignoreAddToParent = true
    ReplaceNode(node, newNode, parent)
    control._node = newNode
}

ExtArmature.SetNodePropByData = function(node, data, parent) {
    ExtArmature.ResetPropByData({ _node: node }, data, parent)
}

ExtArmature.ExportNodeData = function(node, data) {
    node.actionName && (data.actionName = node.actionName)
    node.imagePath && (data.imagePath = node.imagePath)
    node.plistPath && (data.plistPath = node.plistPath)
    node.configFilePath && (data.configFilePath = node.configFilePath)

    data['anchorX'] = node.anchorX
    data['anchorY'] = node.anchorY

    // data['anchorX'] = null
    // data['anchorY'] = null
}

ExtArmature.PropCantChange = function(node, path, value, target) {
    // if(path == "anchor.x" || path == "anchor.y") {
    //   return true
    // }
    return false
}

ExtArmature.SetPropChange = function(control, path, value, target) {
    let data = cocosExportNodeData(control._node, { uuid: true })
    data[path] = value
    ExtArmature.ResetPropByData(control, data)
}

ExtArmature.GetLoadImages = function(data) {
    return [data['imagePath'], data['plistPath'], data['configFilePath']]
}

ExtArmature.NodifyPropChange = function(control) {
    SetNodifyPropChange(control)
}

function ExtArmatureData(node) {
    this._node = node
}

ExtArmatureData.prototype = {
    __displayName__: 'ExtArmature',
    __type__: 'ccui.ExtArmature',

    get actionName() {
        return {
            path: 'actionName',
            type: 'asset',
            name: 'actionName',
            attrs: {},
            value: this._node.actionName
        }
    },

    get imagePath() {
        return {
            path: 'imagePath',
            type: 'asset',
            name: 'imagePath',
            attrs: {},
            value: this._node.imagePath
        }
    },

    get plistPath() {
        return {
            path: 'plistPath',
            type: 'asset',
            name: 'plistPath',
            attrs: {},
            value: this._node.plistPath
        }
    },

    get configFilePath() {
        return {
            path: 'configFilePath',
            type: 'asset',
            name: 'configFilePath',
            attrs: {},
            value: this._node.configFilePath
        }
    },

    get __props__() {
        return [
            this.actionName,
            this.imagePath,
            this.plistPath,
            this.configFilePath
        ]
    }
}

ExtArmature.ExtArmatureData = ExtArmatureData

ExtArmature.PropComps = function(node) {
    let datas = [new WidgetData(node)]
    datas.push(new TouchData(node))
    datas.push(new ExtArmatureData(node))
    return datas
}

module.exports = ExtArmature

RegisterExtNodeControl(ExtArmature.name, ExtArmature)