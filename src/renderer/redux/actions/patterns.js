import {createAction} from 'Utils'
import {Patterns} from '../../storage'


export const createPattern = createAction('CREATE_PATTERN', (conn) => {
  const key = `pattern-${Math.round(Math.random() * 100000)}`
  return Object.assign({key, conn})
})

export const reloadPatterns = createAction('RELOAD_PATTERNS', Patterns.get)
export const removePattern = createAction('REMOVE_PATTERN', (conn, index) => ({conn, index}))
export const updatePattern = createAction('UPDATE_PATTERN', (conn, index, data) => ({conn, index, data}))
