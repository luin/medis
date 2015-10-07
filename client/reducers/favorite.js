'use strict';

import * as Favorite from '../backend/favorite';

export function addFavorite(data) {
  return this.set('favorites', Favorite.addFavorite(data));
}
