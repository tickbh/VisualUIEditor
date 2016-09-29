const ipcRenderer = Electron.ipcRenderer

let projectLangData = null
let currentLangSet = null
let projectLangReadTime = 0

function ChangeProjectFolder () {
  let newFolder = Electron.remote.dialog.showOpenDialog({properties: ['openFile', 'openDirectory']})
  if (newFolder) {
    window.projectFolder = newFolder[0]
    window.localStorage['projectFolder'] = newFolder[0]
    Ipc.sendToAll('ui:project_floder_change', {folder: newFolder[0]})
  }
}

ipcRenderer.on('ui:open-project-folder', (event, message, ...args) => {
  ChangeProjectFolder()
})

ipcRenderer.on('ui:openPanel', (event, panelName, a) => {
  console.log(panelName)
  ChangeProjectFolder()
})

function DealWithRenderMessage (message, ...args) {
}

function applyFilterByTree (tree, filter) {
  filter = (filter || '').toLowerCase()
  function recursiveFilter (item, filter) {
    let show = false
    if (!filter || filter.length == 0) {
      show = true
    } else if (item.name.toLowerCase().indexOf(filter) >= 0) {
      show = true
    }

    let children = Polymer.dom(item).children
    for (var i = 0; i < children.length; i++) {
      let childShow = recursiveFilter(children[i], filter)
      show = show || childShow
    }
    item.hidden = !show
    return show
  }
  let children = Polymer.dom(tree).children
  for (var i = 0; i < children.length; i++) {
    recursiveFilter(children[i], filter)
  }
}

function treeExpandAll (tree) {
  function recursiveExpand (item) {
    item.folded = false
    let children = Polymer.dom(item).children
    for (var i = 0; i < children.length; i++) {
      recursiveExpand(children[i])
    }
  }
  let children = Polymer.dom(tree).children
  for (var i = 0; i < children.length; i++) {
    recursiveExpand(children[i])
  }
}

function treeFoldedAll (tree) {
  function recursiveFolded (item) {
    item.folded = true
    let children = Polymer.dom(item).children
    for (var i = 0; i < children.length; i++) {
      recursiveFolded(children[i])
    }
  }
  let children = Polymer.dom(tree).children
  for (var i = 0; i < children.length; i++) {
    recursiveFolded(children[i])
  }
}

function calcRelativePath (parentPath, subPath) {
  parentPath = parentPath.replace(/\\/g, '/')
  subPath = subPath.replace(/\\/g, '/')
  let index = subPath.indexOf(parentPath)
  if (index < 0) {
    return subPath
  }
  return subPath.substr(index + parentPath.length)
}

function checkTextureExist (url) {
  if (!url) {
    return false
  }
  var tex = cc.textureCache.getTextureForKey(url)
  if (!tex) {
    tex = cc.textureCache.addImage(url)
    if (!tex) {
      return false
    }
  }
  return true
}

function openHtmlInNewWindow (url, width, height) {
  //   const modalPath = path.join(url)
  let win = new Electron.remote.BrowserWindow({ width: width || 400, height: height || 320 })
  win.on('closed', function () { win = null })
  win.loadURL(url) // 指定渲染的页面
  win.show() // 打开一个窗口
}

function ToHumanText (text) {
  let result = text.replace(/[-_]([a-z])/g, function (m) {
    return m[1].toUpperCase()
  })

  result = result.replace(/([a-z][A-Z])/g, function (g) {
    return g[0] + ' ' + g[1]
  })

  if (result.charAt(0) === ' ') {
    result.slice(1)
  }

  return result.charAt(0).toUpperCase() + result.slice(1)
}

function FocusParent (element) {
  let parent = element.parentElement
  while ( parent ) {
    if (
      parent.tabIndex !== null &&
      parent.tabIndex !== undefined &&
      parent.tabIndex !== -1
    ) {
      parent.focus()
      return
    }

    parent = parent.parentElement
  }
}

function IsSelfOrAncient (element, ancientEL) {
  let parent = element
  while ( parent ) {
    if (parent === ancientEL) {
      return true
    }

    parent = Polymer.dom(parent).parentNode
  }

  return false
}

function ArrayCmpFilter (items, func) {
  let results = []
  for ( let i = 0; i < items.length; ++i) {
    let item = items[i]
    let add = true

    for ( let j = 0; j < results.length; ++j) {
      let addedItem = results[j]

      if (item === addedItem) {
        // existed
        add = false
        break
      }

      let cmp = func(addedItem, item)
      if (cmp > 0) {
        add = false
        break
      } else if (cmp < 0) {
        results.splice(j, 1)
        --j
      }
    }

    if (add) {
      results.push(item)
    }
  }

  return results
}

function CustomAddListener (elem, type, callback) {
  if (elem.addEventListener) {
    return elem.addEventListener(type, callback, false)
  }
  if (elem.attachEvent) {
    var wrapper = function () {
      callback.call(elem, window.event)
    }
    callback._wrapper = wrapper
    elem.attachEvent('on' + type, wrapper)
  }
}

function OpenLangInfo (langPath) {
  AddOrModifyConfig('currentLangOpenPath', langPath, true)
  Ipc.sendToMainDirect('ipc-showgrid', window.projectFolder)
}

function getProjectLangData () {
  if (!window.projectFolder) {
    return {}
  }

  let file = getLangPath() + '/' + getLangFileName()
  if (!fs.existsSync(file)) {
    return {}
  }
  var stat = fs.statSync(file)
  if (stat.mtime.getTime() != projectLangReadTime) {
    projectLangData = null
  }

  if (projectLangData == null) {
    projectLangData = GetFileToData(file)
    currentLangSet = getCurLangSet()
    projectLangReadTime = stat.mtime.getTime()
  }
  return projectLangData
}

function getLangFromConfig (key) {
  let data = getProjectLangData()
  if (data[key] == null) {
    return null
  }
  return projectLangData[key][currentLangSet] || ''
}

function tryAnalyseLang (value) {
  let data = {isKey: false}
  if (value.indexOf('@') == 0) {
    let key = value.substring(1)
    let lang = getLangFromConfig(key)
    if (lang != null) {
      data.value = lang
      data.isKey = true
      data.key = key
    }
  }
  return data
}
