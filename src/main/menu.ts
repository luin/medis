import {app, Menu, MenuItemConstructorOptions} from 'electron'
import windowManager from './windowManager'

const menuTemplates: MenuItemConstructorOptions[] = [{
  label: '文件',
  submenu: [{
    label: '打开新的连接',
    accelerator: 'CmdOrCtrl+N',
    click() {
      windowManager.create()
    }
  }, {
    label: '打开新的标签页',
    accelerator: 'CmdOrCtrl+T',
    click() {
      windowManager.current.webContents.send('action', 'createInstance')
    }
  }, {
    type: 'separator'
  }, {
    label: '关闭窗口',
    accelerator: 'Shift+CmdOrCtrl+W',
    click() {
      windowManager.current.close()
    }
  }, {
    label: '关闭标签页',
    accelerator: 'CmdOrCtrl+W',
    click() {
      windowManager.current.webContents.send('action', 'delInstance')
    }
  }]
}, {
  label: '编辑',
  submenu: [{
    label: '撤销',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: '重做',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: '拷贝',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: '选择全部',
    accelerator: 'CmdOrCtrl+A',
    // role: 'selectall'
  }]
}, {
  label: '窗口',
  submenu: [{
    label: '重新加载此页',
    accelerator: 'CmdOrCtrl+R',
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.reload()
      }
    }
  }, {
    label: '切换全屏',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      }
      return 'F11'
    })(),
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }
  }, {
    label: '打开开发者工具',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      }
      return 'Ctrl+Shift+I'
    })(),
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.webContents.toggleDevTools()
      }
    }
  }]
},

//   {
//   label: 'Language',
//   submenu: [{
//     label: 'Chinese',
//     // role: ''
//   }, {
//     label: 'English',
//     // role: ''
//   }]
// },

  {
  label: '窗口',
  role: 'window',
  submenu: [{
    label: '最小号',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: '关闭',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
},
  // {
  // label: 'Help',
  // role: 'help',
  // submenu: [{
  //   label: 'Report an Issue...',
  //   click() {
  //     require('shell').openExternal('mailto:medis@zihua.li')
  //   }
  // },
  //   {
  //   label: 'Learn More',
  //   click() {
  //     require('shell').openExternal('http://getmedis.com')
  //   }
  // }
  // ]
// }
]

let baseIndex = 0
if (process.platform == 'darwin') {
  baseIndex = 1
  menuTemplates.unshift({
    label: app.getName(),
    submenu: [{
      label: 'About ' + app.getName(),
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: 'Hide ' + app.getName(),
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Shift+H',
      // role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click() {
        app.quit()
      }
    }]
  })
}

const menu = Menu.buildFromTemplate(menuTemplates)

if (process.env.NODE_ENV === 'production') {
  const {submenu} = (menu.items[baseIndex + 2] as any)
  submenu.items[0].visible = false
  submenu.items[2].visible = false
}

const {submenu} = (menu.items[baseIndex + 0] as any)
windowManager.on('blur', function () {
  submenu.items[3].enabled = false
  submenu.items[4].enabled = false
})

windowManager.on('focus', function () {
  const {submenu} = (menu.items[baseIndex + 0] as any)
  submenu.items[3].enabled = true
  submenu.items[4].enabled = true
})

export default menu
