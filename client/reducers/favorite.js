'use strict';

import * as Favorite from '../backend/favorite';

export function addFavorite(data) {
  return this.set('favorites', Favorite.addFavorite(data));
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
  console.log(from, to);
  const updatedFavorites = favorites.splice(from, 1).splice(to, 0, source);
  console.log(updatedFavorites.toJS());
  Favorite.saveFavorites(updatedFavorites);
  return this.set('favorites', updatedFavorites);
}
