'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import MainWindow from './';
import {ipcRenderer} from 'electron';
import store from '../../store';

require('../../styles/global.scss');

ipcRenderer.on('action', function (evt, type, data) {
  if ($('.Modal').length && type.indexOf('Instance') !== -1) {
    return;
  }
  store.dispatch({ type, data });
});

ReactDOM.render(MainWindow, document.getElementById('content'));
