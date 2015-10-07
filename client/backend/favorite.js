'use strict';

import Immutable from 'immutable';
import id from './id';

export function addFavorite(data) {
  const favorite = Object.assign({}, { key: id('favorite') }, data || {});
  console.log('get list', getFavorites().toJSON());
  console.log('item', favorite);
  const favorites = getFavorites().push(favorite);
  console.log('push', favorites.toJSON());
  localStorage.setItem('favorites', JSON.stringify(favorites.toJSON()));

  return favorites;
}

export function getFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  return Immutable.List.of.apply(Immutable.List, favorites);
}
