import {compose, createStore, applyMiddleware} from 'redux'
import persistEnhancer from './persistEnhancer'
import {createThunkReplyMiddleware} from 'Redux/middlewares'
import reducers from './reducers'
import logger from 'redux-logger'

const store = window.store = createStore(
  reducers,
  applyMiddleware(logger, createThunkReplyMiddleware())
)

persistEnhancer(store)

export default store
