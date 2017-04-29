import {createStore, applyMiddleware} from 'redux'
import {createThunkReplyMiddleware} from 'Redux/middlewares'
import reducers from './reducers'

export default createStore(
  reducers,
  applyMiddleware(createThunkReplyMiddleware())
)
