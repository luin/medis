'use strict';

import Immutable from 'immutable';
import id from './id';

export function addFavorite(data) {
  const favorite = Immutable.Map(Object.assign({}, { key: id('favorite'), name: 'New Favorite' }, data || {}));
  const favorites = getFavorites().push(favorite);
  saveFavorites(favorites);

  return favorites;
}

export function getFavorites() {
  return Immutable.fromJS(JSON.parse(localStorage.getItem('favorites')) || []);
}

export function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites.toJSON()));
}
