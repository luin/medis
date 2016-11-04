'use strict';

const { app, ipcMain, Menu } = require('electron');
const windowManager = require('./windowManager');
const menu = require('./menu');

ipcMain.on('create pattern-manager', function (event, arg) {
  windowManager.create('pattern-manager', arg);
});

ipcMain.on('dispatch', function (event, action, arg) {
  windowManager.dispatch(action, arg);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  Menu.setApplicationMenu(menu);
  windowManager.create();
});
