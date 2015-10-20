'use strict';

import * as Favorite from '../backend/favorite';
import Immutable from 'immutable';

export function addFavorite(data, callback) {
  const favorite = Immutable.Map(Object.assign({}, {
    key: `favorite-${Math.round(Math.random() * 100000)}`,
    name: 'New Favorite'
  }, data || {}));
  const favorites = this.get('favorites').push(favorite);
  callback(favorite);
  return this.set('favorites', Favorite.saveFavorites(favorites));
}

export function removeFavorite({ key }) {
  const favorites = this.get('favorites').filterNot(item => item.get('key') === key);
  return this.set('favorites', Favorite.saveFavorites(favorites));
}

export function updateFavorite({ index, name }) {
  return this.update('favorites', favorites => {
    const updatedFavorites = favorites.update(index, item => item.set('name', name));
    Favorite.saveFavorites(updatedFavorites);
    return updatedFavorites;
  });
}

export function reorderFavorites({ from, to }) {
  const favorites = Favorite.getFavorites();
  const source = favorites.get(from);
  const updatedFavorites = favorites.splice(from, 1).splice(to, 0, source);
  Favorite.saveFavorites(updatedFavorites);
  return this.set('favorites', updatedFavorites);
}
