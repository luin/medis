import {createStore, applyMiddleware} from 'redux'
import reducers from './reducers'
import {createThunkReplyMiddleware} from 'Redux/middlewares'

export default createStore(
  reducers,
  applyMiddleware(createThunkReplyMiddleware())
)
