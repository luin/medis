import {createAction} from 'redux-actions'
import {fromJS} from 'immutable'
import {Patterns} from '../../storage'


export const createPattern = createAction('CREATE_pattern', (data) => {
  const key = `pattern-${Math.round(Math.random() * 100000)}`
  return Object.assign({key}, data)
})

export const reloadPatterns = createAction('RELOAD_patternS', Patterns.get)
export const removePattern = createAction('REMOVE_pattern')
export const reorderPattern = createAction('REORDER_pattern')
export const updatePattern = createAction('UPDATE_pattern', (conn, key, data) => ({conn, key, data}))
