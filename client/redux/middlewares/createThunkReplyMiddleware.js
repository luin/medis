function isThunkReply(action) {
  return typeof action.payload === 'function' && action.args
}

export default function createThunkReplyMiddleware(extraArgument) {
  return function ({dispatch, getState}) {
    return _next => action => {
      if (!isThunkReply(action)) {
        return _next(action)
      }

      function next(payload) {
        dispatch({payload, type: action.type})
      }

      return action.payload(Object.assign({dispatch, getState, next}, extraArgument))
    }
  }
}
