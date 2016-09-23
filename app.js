const {app, BrowserWindow, Menu, ipcMain} = require('electron');

const Protocol = require("./main/protocol");
const Ipc = require("./main/ipc");
const MenuUtil = require("./js/MenuUtil");

let mainWindow;
let gridWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  Protocol.init();
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1600, height: 900, webPreferences: {webSecurity: false}});
  // and load the index.html of the app.
  mainWindow.loadURL('app://index.html');
  mainWindow.maximize()
  global.mainWindow = mainWindow;
  
  function getMenu() {
      let fileSubMenu = [
        {
          label: '打开项目',
          click () {
            Ipc.sendToWinsDirect('ui:open-project-folder');
          }
        },
      ];

      let otherFileMenu = MenuUtil.createFileMenu();
      otherFileMenu.forEach(function(v) {
        fileSubMenu.push(v)
      });   

      // createFileMenu
      return [
        {
          label: 'VisualUIEditor',
          role: 'about',
          id: 'about',
          params: [],
          submenu: [
            {
              label: '关于',
              click () {
                var menu = Menu.buildFromTemplate([]);
                Menu.setApplicationMenu(menu);
                let win = new BrowserWindow({ width: 700, height: 500 })
                win.on('closed', function () { win = null })
                win.loadURL("app://html/about.html")//指定渲染的页面
                win.show()//打开一个窗口
                
              }
            },
            { type: 'separator' },
            {
              label: 'Quit',
              accelerator: 'CmdOrCtrl+Q',
              click () {
                mainWindow.close();
              }
            },
          ]
        },
        //File
        {
          label: '文件(&F)',
          role: 'file',
          id: 'file',
          params: [],
          submenu: fileSubMenu,
        },
              
        // Layout
        {
          label: '布局',
          id: 'layout',
          submenu: [
            {
              label: '保存布局',
              click () {
                Ipc.sendToAll( 'ui:store-layout', null);
              }
            },
            {
              label: '重置布局',
              dev: true,
              click () {
                Ipc.sendToAll( 'ui:reset-layout', null);
              }
            },
            {
              label: '初始化布局',
              dev: true,
              click () {
                Ipc.sendToAll( 'ui:reset-init-layout', null);
              }
            },
          ]
        },
        // {
        //   label: '控制面板',
        //   id: 'control',
        //   submenu: [
        //     {
        //         label: 'NodePanel',
        //         click () {
        //             Ipc.sendToWinsDirect('ui:openPanel', "NodePanel");
        //         }
        //     },
        //     {
        //         label: 'ControlPanel',
        //         click () {
        //             Ipc.sendToWinsDirect('ui:openPanel', "ControlPanel");
        //         }
        //     },
        //     {
        //         label: 'RenderPanel',
        //         click () {
        //             Ipc.sendToWinsDirect('ui:openPanel', "RenderPanel");
        //         }
        //     },
        //     {
        //         label: 'PropPanel',
        //         click () {
        //             Ipc.sendToWinsDirect('ui:openPanel', "PropPanel");
        //         }
        //     },
        //     {
        //         label: 'ConsolePanel',
        //         click () {
        //             Ipc.sendToWinsDirect('ui:openPanel', "ConsolePanel");
        //         }
        //     },
        //     {
        //         label: 'ResourcePanel',
        //         click () {
        //             Ipc.sendToWinsDirect('ui:openPanel', "ResourcePanel");
        //         }
        //     },
        //   ]
        // },
        {
          label: '编辑(&E)',
          id: 'editor',
          submenu: [
            {
              label: '撤消',
              accelerator: 'CmdOrCtrl+Z',
              click () {
                Ipc.sendToAll( 'ui:scene-undo' );
              }
            },
            {
              label: '重做',
              accelerator: 'CmdOrCtrl+Y',
              click () {
                Ipc.sendToAll( 'ui:scene-redo' );
              }
            },
            { type: 'separator' },
            {
              label: '复制',
              accelerator: 'CmdOrCtrl+C',
              click () {
                Ipc.sendToAll( 'ui:scene-copy' );
              }
            },
            {
              label: '粘贴',
              accelerator: 'CmdOrCtrl+V',
              click () {
                Ipc.sendToAll( 'ui:scene-paste' );
              }
            },
            {
              label: '选择全部',
              accelerator: 'CmdOrCtrl+A',
              click () {
                Ipc.sendToAll( 'ui:scene-copyall' );
              }
            },
          ]
        },
        // Developer
        {
          label: '开发者',
          id: 'developer',
          submenu: [
            {
              label: '重新加载',
              accelerator: 'CmdOrCtrl+R',
              click ( item, focusedWindow ) {
                // DISABLE: Console.clearLog();
                focusedWindow.webContents.reload();
              }
            },
            {
              label: '重新加载并清理缓存',
              accelerator: 'CmdOrCtrl+Shift+R',
              click ( item, focusedWindow ) {
                // DISABLE: Console.clearLog();
                focusedWindow.webContents.reloadIgnoringCache();
              }
            },
            { type: 'separator' },
            {
              label: '检查页面元素',
              accelerator: 'CmdOrCtrl+Shift+C',
              click () {
                let nativeWin = BrowserWindow.getFocusedWindow();
                mainWindow.send( 'editor:window-inspect' );
              }
            },
            {
              label: '开发者工具',
              accelerator: (() => {
                if (process.platform === 'darwin') {
                  return 'Alt+Command+I';
                } else {
                  return 'Ctrl+Shift+I';
                }
              })(),
              click ( item, focusedWindow ) {
                if ( focusedWindow ) {
                  focusedWindow.openDevTools();
                  if ( focusedWindow.devToolsWebContents ) {
                    focusedWindow.devToolsWebContents.focus();
                  }
                }
              }
            },
            { type: 'separator' },
          ]
        },
      ];
  }


  ipcMain.on('ipc-render2main', function(event, message, a, b, c) {
    let editorMenu = null;
    if(message == "popup-create-node-menu") {
      let menuTmpl = MenuUtil.createOperateNodeMenu();
      editorMenu = new Menu.buildFromTemplate(menuTmpl);
    } else if(message == "open-file-operate-menu") {
      let menuTmpl = MenuUtil.createOpenFileOperate();
      editorMenu = new Menu.buildFromTemplate(menuTmpl);
    }

    if(editorMenu) {
      let x = a, y = b;
      x = Math.floor(x);
      y = Math.floor(y);
      editorMenu.popup(BrowserWindow.fromWebContents(event.sender), x, y);
    }
  });

  ipcMain.on('ipc-showgrid', function(event, folder) {

      if(gridWindow) {
        gridWindow.loadURL("app://html/grid.html");
      } else {
        gridWindow = new BrowserWindow({ width: 1280, height: 800 })
        // gridWindow.setMenuBarVisibility(false);
        gridWindow.setAutoHideMenuBar(true);
        gridWindow.on('closed', function () { gridWindow = null })
        gridWindow.loadURL("app://html/grid.html")//指定渲染的页面
        gridWindow.show()//打开一个窗口
      }
  });

  var menu = Menu.buildFromTemplate(getMenu());
  Menu.setApplicationMenu(menu);
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
