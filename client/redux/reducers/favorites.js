import {handleActions} from 'Utils'
import {
  createFavorite,
  removeFavorite,
  updateFavorite,
  reorderFavorites,
  reloadFavorites
} from 'Redux/actions'
import {Favorites} from '../../storage'
import {Map, fromJS} from 'immutable'

function FavoriteFactory(data) {
  return Map(Object.assign({name: 'New Favorite'}, data))
}

export const favorites = handleActions(fromJS(Favorites.get()), {
  [createFavorite](state, data) {
    return state.push(FavoriteFactory(data))
  },
  [removeFavorite](state, key) {
    return state.filterNot(item => item.get('key') === key)
  },
  [updateFavorite](state, {key, data}) {
    return state.map(item => item.get('key') === key ? item.merge(data) : item)
  },
  [reorderFavorites](state, {from, to}) {
    const target = state.get(from);
    return state.splice(from, 1).splice(to, 0, target);
  },
  [reloadFavorites](state, data) {
    return fromJS(data)
  }
})
