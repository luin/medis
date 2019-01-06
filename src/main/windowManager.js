'use strict';

const {app, BrowserWindow} = require('electron');
const path = require('path')
const EventEmitter = require('events');

class WindowManager extends EventEmitter {
  constructor() {
    super();
    this.windows = new Set();
    app.on('browser-window-blur', this.emit.bind(this, 'blur'));
    app.on('browser-window-focus', this.emit.bind(this, 'focus'));
  }

  get current() {
    return BrowserWindow.getFocusedWindow() || this.create();
  }

  create(type, arg) {
    if (!type) {
      type = 'main';
    }
    const option = {
      backgroundColor: '#ececec',
      webPreferences: {
        nodeIntegration: true
      }
    };
    if (type === 'main') {
      option.width = 960;
      option.height = 600;
      option.show = false;
      option.minWidth = 840;
      option.minHeight = 400;
    } else if (type === 'patternManager') {
      option.width = 600;
      option.height = 300;
      option.title = 'Manage Patterns';
      option.resizable = true;
      option.fullscreen = false;
    }

    let start
    const newWindow = new BrowserWindow(option);
    if (!option.show) {
      newWindow.once('ready-to-show', () => {
        console.log('start time: ', Date.now() - start)
        newWindow.show()
      })
    }

    start = Date.now()
    newWindow.loadFile(path.resolve(__dirname, `../renderer/${type}.html`), {query: {arg}});

    this._register(newWindow);

    return newWindow;
  }

  _register(win) {
    this.windows.add(win);
    win.on('closed', () => {
      this.windows.delete(win);
      if (!BrowserWindow.getFocusedWindow()) {
        this.emit('blur');
      }
    });
    this.emit('focus');
  }

  dispatch(action, args) {
    this.windows.forEach(win => {
      if (win && win.webContents) {
        win.webContents.send('action', action, args);
      }
    });
  }
}

module.exports = new WindowManager();
