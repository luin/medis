'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/pattern-manager/App';
import store from './store';
import remote from 'remote';
import { ipcRenderer } from 'electron';

require('./styles/global.scss');

ipcRenderer.on('action', function (type, data) {
  if (type === 'delInstance') {
    remote.getCurrentWindow().close();
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
