'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import store from './store';
import Redis from 'ioredis';
const redis = new Redis();
window.redis = redis;

require('./styles/global.scss');

require('ipc').on('action', function (type, data) {
  store.dispatch({ type, data });
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.body
);
