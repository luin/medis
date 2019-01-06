import {createAction as _createAction} from 'redux-actions'

export function handleActions(defaultState, handlers) {
  return function (state = defaultState, {type, payload}) {
    const handler = handlers[type]
    return handler ? handler(state, payload) : state
  }
}

export const getId = (function () {
  const ids = {}

  return function (item: string) {
    if (!ids[item]) {
      ids[item] = 0
    }

    return `${item}-${++ids[item] + (Math.random() * 100000 | 0)}`
  }
}())

export function createAction(type: string, payloadCreator, metaCreator) {
  type = `$SOS_${type}`
  const actionCreator = _createAction(type, payloadCreator, metaCreator)
  const creator = (...args) => {
    const action = actionCreator(...args)
    if (typeof action.payload === 'function') {
      return Object.assign(action, {args})
    }
    return action
  }

  return Object.assign(creator, {
    toString: actionCreator.toString,
    payload(payload) {
      return {type, payload}
    },
    reply(args, result) {
      return {type, payload: {args, result}}
    }
  })
}
