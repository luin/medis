'use strict'

import Immutable from 'immutable'
import {ipcRenderer} from 'electron'

export function get() {
  return JSON.parse(localStorage.getItem('patternStore')) || {}
}

export function set(patterns) {
  localStorage.setItem('patternStore', JSON.stringify(patterns))
  ipcRenderer.send('dispatch', 'reloadPatternStore')
  return patterns
}
