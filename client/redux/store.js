import {compose, createStore, applyMiddleware} from 'redux'
import persistEnhancer from './persistEnhancer'
import {createThunkReplyMiddleware} from 'Redux/middlewares'
import reducers from './reducers'

const store = window.store = createStore(
  reducers,
  applyMiddleware(createThunkReplyMiddleware())
)

persistEnhancer(store)

export default store
