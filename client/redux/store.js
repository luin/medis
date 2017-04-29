import {createStore, applyMiddleware} from 'redux';
import reducers from './reducers';
import {createThunkReplyMiddleware} from 'Redux/middlewares'

export default applyMiddleware(createThunkReplyMiddleware())(createStore)(reducers);
