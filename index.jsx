'use strict';

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './components/App';
import Redis from 'ioredis';
import reducer from './reducer';
const redis = new Redis();
window.redis = redis;

require('./styles/global.scss');

const store = createStore(reducer);
React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('content')
);
