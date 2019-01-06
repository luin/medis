import {app, BrowserWindow, BrowserWindowConstructorOptions} from 'electron'
import path from 'path'
import EventEmitter from 'events'

class WindowManager extends EventEmitter {
  windows = new Set<BrowserWindow>()

  constructor() {
    super()
    app.on('browser-window-blur', this.emit.bind(this, 'blur'))
    app.on('browser-window-focus', this.emit.bind(this, 'focus'))
  }

  get current() {
    return BrowserWindow.getFocusedWindow() || this.create()
  }

  create(type = 'main', arg?: any): BrowserWindow {
    const option: BrowserWindowConstructorOptions = {
      backgroundColor: '#ececec',
      webPreferences: {
        nodeIntegration: true
      }
    }
    if (type === 'main') {
      option.width = 960
      option.height = 600
      option.show = false
      option.minWidth = 840
      option.minHeight = 400
    } else if (type === 'patternManager') {
      option.width = 600
      option.height = 300
      option.title = 'Manage Patterns'
      option.resizable = true
      option.fullscreen = false
    }

    let start: number
    const newWindow = new BrowserWindow(option)
    if (!option.show) {
      newWindow.once('ready-to-show', () => {
        console.log('start time: ', Date.now() - start)
        newWindow.show()
      })
    }

    start = Date.now()
    newWindow.loadFile(path.resolve(__dirname, `../renderer/${type}.html`), {query: {arg}})

    this._register(newWindow)

    return newWindow
  }

  _register(win: BrowserWindow): void {
    this.windows.add(win)
    win.on('closed', () => {
      this.windows.delete(win)
      if (!BrowserWindow.getFocusedWindow()) {
        this.emit('blur')
      }
    })
    this.emit('focus')
  }

  dispatch(action: string, args: any) {
    this.windows.forEach(win => {
      if (win && win.webContents) {
        win.webContents.send('action', action, args)
      }
    })
  }
}

export default new WindowManager()
