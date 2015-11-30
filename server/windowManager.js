'use strict';

const BrowserWindow = require('browser-window');
const EventEmitter = require('events');
const app = require('app');

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
    const option = {};
    if (type === 'main') {
      option.width = 960;
      option.height = 600;
      option.show = false;
      option.minWidth = 840;
      option.minHeight = 200;
    } else if (type === 'pattern-manager') {
      option.width = 600;
      option.height = 300;
      option.title = 'Manage Patterns';
      option.resizable = false;
      option.fullscreen = false;
      option.show = false;
    }

    const newWindow = new BrowserWindow(option);
    newWindow.loadURL(`file://${__dirname}/windows/${type}.html${arg ? '?arg=' + arg : ''}`);

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
