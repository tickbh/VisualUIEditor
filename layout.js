$(document).ready(function () {

  // --------------------------------------------------------------------------------
  // Create an instance of our docker window and assign it to the document.
  var myDocker = new wcDocker('.dockerContainer', {
    allowDrawers: true,
    responseRate: 10,
    themePath: 'app://js/Themes',
    theme: 'default.min'
  })
  if (myDocker) {
    var _currentTheme = 'default.min'
    var _showingInfo = true
    var _savedLayout = null
    var _chatterIndex = 1

    myDocker.registerPanelType('NodePanel', {
      faicon: 'cubes',
      onCreate: function (myPanel) {
        myPanel.initSize(200, 400)
        myPanel.maxSize(500, Infinity)
        var $node = $('<ve-nodeorder id="NodePanel" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-nodeorder>')
        myPanel._main = $node[0]
        myPanel.layout().addItem($node).stretch('', '100%')
      }
    })

    myDocker.registerPanelType('ResourcePanel', {
      faicon: 'cubes',
      onCreate: function (myPanel) {
        var $node = $('<ve-resorder style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-resorder>')
        myPanel._main = $node[0]
        myPanel.layout().addItem($node).stretch('', '100%')
      }
    })

    myDocker.registerPanelType('ControlPanel', {
      faicon: 'cubes',
      onCreate: function (myPanel) {
        myPanel.maxSize(200, Infinity)
        var $node = $('<ve-controlpanel style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-controlpanel>')
        myPanel._main = $node[0]
        myPanel.layout().addItem($node).stretch('', '100%')
      }
    })

    myDocker.registerPanelType('ConsolePanel', {
      faicon: 'cubes',
      onCreate: function (myPanel) {
        var $node = $('<ve-console style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-console>')
        myPanel._main = $node[0]
        myPanel.layout().addItem($node).stretch('', '100%')
      }
    })

    myDocker.registerPanelType('RenderPanel', {
      isPersistent: true,
      faicon: 'cubes',
      onCreate: function (myPanel) {
        var $tabArea = $('<div style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;">')
        myPanel.layout().addItem($tabArea)
        var tabFrame = new wcTabFrame($tabArea, myPanel)

        // var $node = $('<ve-renderpanel id="render" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-renderpanel>')
        // tabFrame.addTab('Unknow', -1, wcDocker.LAYOUT.SIMPLE).addItem($node)
        // myPanel._main = $node[0]

        // tabFrame.closeable(0, true) // 0 based index 3 is actually Custom Tab 4
        // tabFrame.faicon(0, 'gears')
        myPanel.on(wcDocker.EVENT.RESIZED, function (data) {
          Ipc.sendToAll('panelResized')
        })

        myPanel.messages = {}
        myPanel.messages['ui:open_file'] = function (event, message) {
          if(!endWith(message.path, ".ui")) {
            return;
          }
          let subPath = calcRelativePath(window.projectFolder + '/', message.path)
          for (var i = 0; i < tabFrame.tabCount(); i++) {
            let layout = tabFrame.layout(i)
            if (layout.name == subPath || layout.name == subPath + '*') {
              tabFrame.tab(i, true)
              return
            }
          }

          var $node = $('<ve-renderpanel id="render" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-renderpanel>')
          let newLayout = tabFrame.addTab(subPath, 0, wcDocker.LAYOUT.SIMPLE)
          newLayout.addItem($node)
          tabFrame.tab(0, true)
          newLayout._main = $node[0]
          myPanel._main = $node[0]
          Ipc.sendToAll('ui:open_scene_file', message)
        }

        let tabChanged = function (index) {
          let layout = tabFrame.layout(index)
          if (!layout) {
            return
          }
          myPanel._main = layout._main
          Ipc.sendToAll('ui:cur_tab_select', {index: index})
        }

        myPanel.messages['ui:closeCurRender'] = function (event, message) {
          tabFrame.removeTab(tabFrame._curTab)
          tabChanged(tabFrame._curTab)
        }

        myPanel.on(wcDocker.EVENT.CUSTOM_TAB_CHANGED, function (data) {
          tabChanged(data.index)
        })

        // myPanel.on(wcDocker.EVENT.GAIN_FOCUS, function(data) {
        //   myPanel._main.focus()
        //   console.log("RenderPanel GAIN_FOCUS")
        // })

        // myPanel.on(wcDocker.EVENT.LOST_FOCUS, function(data) {
        //   console.log("RenderPanel lose focus")
        // })

      }
    })

    myDocker.registerPanelType('PropPanel', {
      faicon: 'cubes',
      onCreate: function (myPanel) {
        var $node = $('<ve-proppanel style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-proppanel>')
        myPanel._main = $node[0]
        myPanel.layout().addItem($node).stretch('', '100%')
      }
    })

    // myDocker.registerPanelType('GridPanel', {
    //   faicon: 'cubes',
    //   onCreate: function(myPanel) {

    //     var $node = $('<ve-gridpanel style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-gridpanel>')
    //     myPanel.initSize(600, Infinity)
    //     myPanel.minSize(200, Infinity)
    //     myPanel._main = $node[0]
    //     myPanel.layout().addItem($node).stretch('', '100%')
    //   },
    // })

    myDocker.registerPanelType('Theme Builder', {
      faicon: 'map',
      onCreate: wcThemeBuilder
    })

    global.myDocker = myDocker
    myDocker.startLoading('Loading...')

    myDocker.setInitLayout = function () {
      myDocker.clear()
      var nodePanel = myDocker.addPanel('NodePanel', wcDocker.DOCK.LEFT, null)
      var controlPanel = myDocker.addPanel('ControlPanel', wcDocker.DOCK.RIGHT, null, {w: '200px'})
      var renderPanel = myDocker.addPanel('RenderPanel', wcDocker.DOCK.RIGHT, controlPanel)
      var propPanel = myDocker.addPanel('PropPanel', wcDocker.DOCK.RIGHT, null, {w: '200px'})
      var consolePanel = myDocker.addPanel('ConsolePanel', wcDocker.DOCK.BOTTOM, wcDocker.COLLAPSED, {h: '20%'})
      var resourcePanel = myDocker.addPanel('ResourcePanel', wcDocker.DOCK.BOTTOM, nodePanel, {h: '60%'})
    // var gridPanel = myDocker.addPanel('GridPanel', wcDocker.DOCK.LEFT, wcDocker.COLLAPSED, {h: '20%'})
    }

    if (window.localStorage['saveLayout']) {
      myDocker.restore(window.localStorage['saveLayout'])
    } else {
      myDocker.setInitLayout()
    }

    myDocker.on(wcDocker.EVENT.LOADED, function () {
      myDocker.finishLoading(500)
    })

    document.body.addEventListener('keydown', function (event) {
      Ipc.sendToAll('ui:keydownEvent', {keyCode: event.keyCode, ctrlKey: isCtrlKey(event), shiftKey: event.shiftKey, altKey: event.altKey})
    })
  }
})
