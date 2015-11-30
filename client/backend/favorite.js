'use strict';

import Immutable from 'immutable';
import { ipcRenderer } from 'electron';

export function getFavorites() {
  return Immutable.fromJS(JSON.parse(localStorage.getItem('favorites')) || []);
}

export function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites.toJSON()));

  ipcRenderer.send('dispatch', 'reloadFavorites');
  return favorites;
}
