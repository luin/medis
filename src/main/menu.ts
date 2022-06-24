import {app, Menu, MenuItemConstructorOptions} from 'electron'
import windowManager from './windowManager'

const menuTemplates: MenuItemConstructorOptions[] = [{
  label: 'File',
  submenu: [{
    label: 'New Connection Window',
    accelerator: 'CmdOrCtrl+N',
    click() {
      windowManager.create()
    }
  }, {
    label: 'New Connection Tab',
    accelerator: 'CmdOrCtrl+T',
    click() {
      windowManager.current.webContents.send('action', 'createInstance')
    }
  }, {
    type: 'separator'
  }, {
    label: 'Close Window',
    accelerator: 'Shift+CmdOrCtrl+W',
    click() {
      windowManager.current.close()
    }
  }, {
    label: 'Close Tab',
    accelerator: 'CmdOrCtrl+W',
    click() {
      windowManager.current.webContents.send('action', 'delInstance')
    }
  }]
}, {
  label: 'Edit',
  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectAll'
  }]
}, {
  label: 'View',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.reload()
      }
    }
  }, {
    label: 'Toggle Full Screen',
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
    label: 'Toggle Developer Tools',
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
}, {
  label: 'Window',
  role: 'window',
  submenu: [{
    label: 'Minimize',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: 'Close',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
}, {
  label: 'Help',
  role: 'help',
  submenu: [{
    label: 'Report an Issue...',
    click() {
      require('shell').openExternal('mailto:medis@zihua.li')
    }
  }, {
    label: 'Learn More',
    click() {
      require('shell').openExternal('http://getmedis.com')
    }
  }]
}]

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
      role: 'hideOthers'
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
