'use strict';

import Immutable from 'immutable';

export function getFavorites() {
  return Immutable.fromJS(JSON.parse(localStorage.getItem('favorites')) || []);
}

export function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites.toJSON()));

  require('ipc').send('dispatch', 'reloadFavorites');
  return favorites;
}
