'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import PatternManagerWindow from './';
import store from '../../store';
import { remote, ipcRenderer } from 'electron';

require('../../styles/global.scss');

ipcRenderer.on('action', function (evt, type, data) {
  if (type === 'delInstance') {
    remote.getCurrentWindow().close();
    return;
  }
  store.dispatch({ type, data });
});

ReactDOM.render(
  <Provider store={store}>
    <PatternManagerWindow />
  </Provider>,
  document.getElementById('content')
);
