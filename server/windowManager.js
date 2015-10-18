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

  create() {
    const newWindow = new BrowserWindow({ width: 800, height: 600 });
    newWindow.loadUrl(`file://${__dirname}/../index.html`);

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
}

module.exports = new WindowManager();
