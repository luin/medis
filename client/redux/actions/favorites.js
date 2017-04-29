import {createAction} from 'redux-actions'
import {fromJS} from 'immutable'
import {Favorites} from '../../storage'


export const createFavorite = createAction('CREATE_FAVORITE', (data) => {
  const key = `favorite-${Math.round(Math.random() * 100000)}`
  return Object.assign({key}, data)
})

export const reloadFavorites = createAction('RELOAD_FAVORITES', Favorites.get)
export const removeFavorite = createAction('REMOVE_FAVORITE')
export const reorderFavorite = createAction('REORDER_FAVORITE')
export const updateFavorite = createAction('UPDATE_FAVORITE', (key, data) => ({key, data}))
