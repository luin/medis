'use strict'

import {ipcRenderer} from 'electron'

export function get() {
  const data = localStorage.getItem('favorites')
  return data ? JSON.parse(data) : []
}

export function set(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites))

  ipcRenderer.send('dispatch', 'reloadFavorites')
  return favorites
}
