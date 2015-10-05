'use strict';

import React from 'react';
import { Provider } from 'react-redux';
import App from './components/App';
import Redis from 'ioredis';
import reducer from './reducer';
const redis = new Redis();
window.redis = redis;

require('./styles/global.scss');

require('ipc').on('action', function (type, data) {
  reducer.dispatch({ type, data });
});

React.render(
  <Provider store={reducer}>
    {() => <App />}
  </Provider>,
  document.getElementById('content')
);
