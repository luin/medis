'use strict';

const app = require('app');
const windowManager = require('./windowManager');
const menu = require('./menu');
const Menu = require('menu');

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
