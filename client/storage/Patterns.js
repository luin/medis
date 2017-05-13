'use strict'

import {ipcRenderer} from 'electron'

export function get() {
  const data = localStorage.getItem('patternStore')
  return data ? JSON.parse(data) : {}
}

export function set(patterns) {
  localStorage.setItem('patternStore', JSON.stringify(patterns))
  ipcRenderer.send('dispatch', 'reloadPatterns')
  return patterns
}
