'use strict'

import {ipcRenderer} from 'electron'

export function get() {
  return JSON.parse(localStorage.getItem('favorites')) || []
}

export function set(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites))

  ipcRenderer.send('dispatch', 'reloadFavorites')
  return favorites
}
