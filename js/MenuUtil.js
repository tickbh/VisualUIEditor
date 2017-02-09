const Ipc = require('../main/ipc')

let MenuUtil = {}

MenuUtil.createFileMenu = function() {
    return [{
            label: '创建文件夹',
            click() {
                Ipc.sendToAll('ui:create_folder')
            }
        },
        { type: 'separator' },
        {
            label: '创建Scene',
            click() {
                Ipc.sendToAll('ui:create_scene')
            }
        }
    ]
}

MenuUtil.createNodeMenu = function() {
    return [{
            label: '创建空节点',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UIWidget')
            }
        },
        { type: 'separator' },
        {
            label: '创建Sprite(精灵)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UIImage')
            }
        },
        {
            label: '创建LabelTTF(文字)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UIText')
            }
        },
        {
            label: '创建Scale9(九宫)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'ExtScale9')
            }
        },
        {
            label: '创建EditBox(输入框)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UIInput')
            }
        },
        {
            label: '创建Slider(滑动条)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UISlider')
            }
        },
        {
            label: '创建Button(按钮)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UIButton')
            }
        },
        {
            label: '创建CheckBox(选中框)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UICheckBox')
            }
        },
        {
            label: '创建ScrollView(滚动示图)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UIScrollView')
            }
        },
        {
            label: '创建ListView(列表示图)',
            click() {
                Ipc.sendToAll('ui:create_render_node', 'UIListView')
            }
        }
    ]
}

MenuUtil.createPosition = function() {
    return [{
            label: '移至顶层',
            click() {
                Ipc.sendToAll('ui:move_position_top')
            }
        },
        {
            label: '移至上一层',
            click() {
                Ipc.sendToAll('ui:move_position_up')
            }
        },
        {
            label: '移至下一层',
            click() {
                Ipc.sendToAll('ui:move_position_down')
            }
        },
        {
            label: '移至底层',
            click() {
                Ipc.sendToAll('ui:move_position_bottom')
            }
        }
    ]
}

MenuUtil.createOperateNodeMenu = function() {
    return [{
            label: '新建',
            params: [],
            submenu: MenuUtil.createNodeMenu()
        },
        { type: 'separator' },
        {
            label: '拷贝',
            params: [],
            click() {
                Ipc.sendToAll('node:copy_item')
            }
        },
        {
            label: '粘贴',
            params: [],
            click() {
                Ipc.sendToAll('node:paste_item')
            }
        },
        {
            label: '复制节点',
            params: [],
            click() {
                Ipc.sendToAll('node:copy_paste_item')
            }
        },
        {
            label: '删除节点',
            params: [],
            click() {
                Ipc.sendToAll('node:delete_item')
            }
        },
        { type: 'separator' },
        {
            label: '位置移动',
            params: [],
            submenu: MenuUtil.createPosition()
        }
    ]
}

MenuUtil.createOpenFileOperate = function() {
    return [{
            label: '新建',
            params: [],
            submenu: MenuUtil.createFileMenu()
        },
        { type: 'separator' },
        {
            label: '重命名',
            params: [],
            click() {
                Ipc.sendToAll('ui:rename-file-or-folder')
            }
        },
        {
            label: '删除',
            params: [],
            click() {
                Ipc.sendToAll('ui:delete-file-or-folder')
            }
        },
        {
            label: '在资源浏览器中显示',
            params: [],
            click() {
                Ipc.sendToAll('ui:show-in-explorer')
            }
        }
    ]
}

module.exports = MenuUtil