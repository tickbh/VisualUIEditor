$(document).ready(function() {

    // --------------------------------------------------------------------------------
    // Create an instance of our docker window and assign it to the document.
    var myDocker = new wcDocker('.dockerContainer', {
        allowDrawers: true,
        responseRate: 10,
        themePath: 'app://js/Themes',
        theme: 'default'
    })
    if (myDocker) {
        var _currentTheme = 'default'
        var _showingInfo = true
        var _savedLayout = null
        var _chatterIndex = 1

        myDocker.registerPanelType('NodePanel', {
            faicon: 'compass',
            onCreate: function(myPanel) {
                myPanel.title("节点面板")
                myPanel.initSize(200, 400)
                myPanel.maxSize(230, Infinity)
                var $node = $('<ve-nodeorder id="NodePanel" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-nodeorder>')
                myPanel._main = $node[0]
                myPanel.layout().addItem($node).stretch('', '100%')
            }
        })

        myDocker.registerPanelType('ResourcePanel', {
            faicon: 'plus-square',
            onCreate: function(myPanel) {
                myPanel.title("资源面板")
                var $node = $('<ve-resorder style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-resorder>')
                myPanel._main = $node[0]
                myPanel.layout().addItem($node).stretch('', '100%')
            }
        })

        myDocker.registerPanelType('ControlPanel', {
            faicon: 'cog',
            onCreate: function(myPanel) {
                myPanel.title("控件")
                myPanel.maxSize(125, Infinity)
                var $node = $('<ve-controlpanel style="position:absolute;top:0px;left:0px;right:0px;bottom:0px; "></ve-controlpanel>')
                myPanel._main = $node[0]
                myPanel.layout().addItem($node).stretch('', '100%')
            }
        })

        myDocker.registerPanelType('ConsolePanel', {
            faicon: 'archive',
            onCreate: function(myPanel) {
                myPanel.title("控制台面板")
                var $node = $('<ve-console style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-console>')
                myPanel._main = $node[0]
                myPanel.layout().addItem($node).stretch('', '100%')
            }
        })

        myDocker.registerPanelType('RenderPanel', {
            isPersistent: true,
            faicon: 'github',
            onCreate: function(myPanel) {
                myPanel.title("渲染面板")
                myPanel.closeable(false);

                var $tabArea = $('<div style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;">')
                myPanel.layout().addItem($tabArea)
                var tabFrame = new wcTabFrame($tabArea, myPanel)

                // var $node = $('<ve-renderpanel id="render" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-renderpanel>')
                // tabFrame.addTab('Unknow', -1, wcDocker.LAYOUT.SIMPLE).addItem($node)
                // myPanel._main = $node[0]

                // tabFrame.closeable(0, true) // 0 based index 3 is actually Custom Tab 4
                // tabFrame.faicon(0, 'gears')
                myPanel.on(wcDocker.EVENT.RESIZED, function(data) {
                    Ipc.sendToAll('panelResized')
                })

                let curActivePanel = null;

                myPanel.messages = {}
                myPanel.messages['ui:open_file'] = function(event, message) {
                    if (!endWith(message.path, ".ui")) {
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
                    tabFrame.closeable(0, true)
                    newLayout._main = $node[0]
                    myPanel._main = $node[0]
                    myPanel._layout = newLayout
                    curActivePanel = $node[0];
                    Ipc.sendToAll('ui:open_scene_file', message)
                }

                myPanel.messages['ui:new-ui-file'] = function(event, message) {
                    let name = ""
                    for (var j = 0; j < 100; j++) {
                        name = "Unknow" + j;
                        let isFind = false;
                        for (var i = 0; i < tabFrame.tabCount(); i++) {
                            let layout = tabFrame.layout(i)
                            if (layout.name == name || layout.name == name + '*') {
                                isFind = true;
                                break
                            }
                        }
                        if (!isFind) {
                            break
                        }
                    }

                    var $node = $('<ve-renderpanel id="render" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-renderpanel>')
                    let newLayout = tabFrame.addTab(name, 0, wcDocker.LAYOUT.SIMPLE)
                    newLayout.addItem($node)
                    tabFrame.tab(0, true)
                    newLayout._main = $node[0]
                    myPanel._main = $node[0]
                    myPanel._layout = newLayout
                    curActivePanel = $node[0];
                    Ipc.sendToAll('ui:open_scene_file', { path: name }, true)
                }

                myPanel.messages['ui:name-change'] = function(event, message) {
                    if (myPanel._layout.name != message) {
                        myPanel._layout.name = message
                        tabFrame.__updateTabs();
                    }
                }

                let tabChanged = function(index) {
                    let layout = tabFrame.layout(index)
                    myPanel._layout = layout
                    if (!layout) {
                        curActivePanel = null
                        Ipc.sendToAllPanel('ui:new-ui-file')
                        return
                    }
                    myPanel._main = layout._main
                    curActivePanel = layout._main;
                    Ipc.sendToAll('ui:cur_tab_select', { index: index })
                }

                let removeCallback = function(obj) {
                    if (myPanel._close_by_render == true) {
                        return true
                    }

                    obj.layout._main.ensureExitCurRender();
                    return false
                }

                myPanel.messages['ui:closeCurRender'] = function(event, message) {
                    myPanel._close_by_render = true
                    tabFrame.removeTab(tabFrame._curTab)
                    tabChanged(tabFrame._curTab)
                    myPanel._close_by_render = false
                }

                myPanel.on(wcDocker.EVENT.CUSTOM_TAB_CHANGED, function(data) {
                    tabChanged(data.index)
                })

                tabFrame.setRemoveCallback(removeCallback);

                setInterval(function() {
                    if (curActivePanel) {
                        let runScene = curActivePanel.$.scene.getRunScene()
                        if (!runScene) {
                            return;
                        }
                        if (runScene._undo.isSaved()) {
                            Ipc.sendToAllPanel("ui:name-change", curActivePanel._localName)
                        } else {
                            Ipc.sendToAllPanel("ui:name-change", curActivePanel._localName + "*")
                        }
                    }
                }, 1000);

            }
        })

        myDocker.registerPanelType('PropPanel', {
            faicon: 'arrows',
            onCreate: function(myPanel) {
                myPanel.title("属性面板")
                var $node = $('<ve-proppanel style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-proppanel>')
                myPanel._main = $node[0]
                myPanel.layout().addItem($node).stretch('', '100%')
            }
        })

        myDocker.registerPanelType('Theme Builder', {
            faicon: 'map',
            onCreate: wcThemeBuilder
        })

        global.myDocker = myDocker
        myDocker.startLoading('Loading...')

        myDocker.setInitLayout = function() {
            myDocker.clear()
            var nodePanel = myDocker.addPanel('NodePanel', wcDocker.DOCK.LEFT, null)
            var controlPanel = myDocker.addPanel('ControlPanel', wcDocker.DOCK.RIGHT, null, { w: '200px' })
            var renderPanel = myDocker.addPanel('RenderPanel', wcDocker.DOCK.RIGHT, controlPanel)
            var propPanel = myDocker.addPanel('PropPanel', wcDocker.DOCK.RIGHT, null, { w: '200px' })
            var consolePanel = myDocker.addPanel('ConsolePanel', wcDocker.DOCK.BOTTOM, wcDocker.COLLAPSED, { h: '20%' })
            var resourcePanel = myDocker.addPanel('ResourcePanel', wcDocker.DOCK.BOTTOM, nodePanel, { h: '60%' })
                // var gridPanel = myDocker.addPanel('GridPanel', wcDocker.DOCK.LEFT, wcDocker.COLLAPSED, {h: '20%'})
        }

        if (getSaveData('saveLayout')) {
            myDocker.restore(getSaveData('saveLayout'))
        } else {
            myDocker.setInitLayout()
        }

        myDocker.on(wcDocker.EVENT.LOADED, function() {
            myDocker.finishLoading(500)
        })

        document.body.addEventListener('keydown', function(event) {
            Ipc.sendToAll('ui:keydownEvent', { keyCode: event.keyCode, ctrlKey: isCtrlKey(event), shiftKey: event.shiftKey, altKey: event.altKey })
        })
    }
})