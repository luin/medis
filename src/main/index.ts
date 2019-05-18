import {app, Menu, ipcMain} from 'electron'
import windowManager from './windowManager'
import menu from './menu'
const contextMenu = require('electron-context-menu');

contextMenu({
  // showInspectElement: true,
})

ipcMain.on('create patternManager', function (event, arg) {
  windowManager.create('patternManager', arg)
})

ipcMain.on('dispatch', function (event, action, arg) {
  windowManager.dispatch(action, arg)
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  Menu.setApplicationMenu(menu)
  windowManager.create()

  app.on('activate', function (_, hasVisibleWindows) {
    if (!hasVisibleWindows) {
      windowManager.create()
    }
  })
})
