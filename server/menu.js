'use strict';

const app = require('app');
const windowManager = require('./windowManager');
const Menu = require('menu');

const menu = Menu.buildFromTemplate([{
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
    role: 'hideothers'
  }, {
    label: 'Show All',
    role: 'unhide'
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'Command+Q',
    click() {
      app.quit();
    }
  }]
}, {
  label: 'File',
  submenu: [{
    label: 'New Connection Window',
    accelerator: 'CmdOrCtrl+N',
    click() {
      windowManager.create();
    }
  }, {
    label: 'New Connection Tab',
    accelerator: 'CmdOrCtrl+T',
    click() {
      windowManager.current.webContents.send('action', 'addInstance');
    }
  }, {
    type: 'separator'
  }, {
    label: 'Close Window',
    accelerator: 'Shift+CmdOrCtrl+W',
    click() {
      windowManager.current.close();
    }
  }, {
    label: 'Close Tab',
    accelerator: 'CmdOrCtrl+W',
    click() {
      windowManager.current.webContents.send('action', 'delInstance');
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
    role: 'selectall'
  }]
}, {
  label: 'View',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.reload();
      }
    }
  }, {
    label: 'Toggle Full Screen',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F';
      }
      return 'F11';
    })(),
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    }
  }, {
    label: 'Toggle Developer Tools',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I';
      }
      return 'Ctrl+Shift+I';
    })(),
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools();
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
    label: 'Learn More',
    click() {
      require('shell').openExternal('http://medisapp.com');
    }
  }]
}]);

if (process.env.NODE_ENV !== 'debug') {
  menu.items[3].submenu.items[0].visible = false;
  menu.items[3].submenu.items[2].visible = false;
}

windowManager.on('blur', function () {
  menu.items[1].submenu.items[3].enabled = false;
  menu.items[1].submenu.items[4].enabled = false;
});

windowManager.on('focus', function () {
  menu.items[1].submenu.items[3].enabled = true;
  menu.items[1].submenu.items[4].enabled = true;
});

module.exports = menu;
