'use strict';

import Immutable from 'immutable';
import id from './id';

export function addFavorite(data) {
  const favorite = Object.assign({}, { key: id('favorite') }, data);
  const favorites = getFavorites().push(favorites);

  localStorage.setItem('favorites', JSON.stringify(favorites.toJS()));

  return favorite;
}

export function getFavorites() {
  const favorites = localStorage.getItem('favorites');

  return Immutable.List.of(favorites ? JSON.parse(favorites) : []);
}
