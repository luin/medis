'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/main/App';
import store from './store';
import { ipcRenderer, remote } from 'electron';

require('./styles/global.scss');

ipcRenderer.on('action', function (evt, type, data) {
  if ($('.Modal').length && type.indexOf('Instance') !== -1) {
    return;
  }
  store.dispatch({ type, data });
});

document.addEventListener('DOMContentLoaded', function () {
  remote.getCurrentWindow().show();
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('content')
);
