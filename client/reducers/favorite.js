'use strict';

import * as Favorite from '../backend/favorite';
import Immutable from 'immutable';

export default (state ) => {
}

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

export function updateFavorite({ key, data }) {
  return this.update('favorites', favorites => {
    const updatedFavorites = favorites.map((item) => {
      if (item.get('key') === key) {
        return item.merge(data);
      }
      return item;
    });
    return Favorite.saveFavorites(updatedFavorites);
  });
}

export function reorderFavorites({ from, to }) {
  return this.update('favorites', favorites => {
    const source = favorites.get(from);
    const updatedFavorites = favorites.splice(from, 1).splice(to, 0, source);
    return Favorite.saveFavorites(updatedFavorites);
  });
}

export function reloadFavorites() {
  return this.set('favorites', Favorite.getFavorites());
}
