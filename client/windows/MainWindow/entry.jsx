'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import MainWindow from './'
import {ipcRenderer} from 'electron'
import store from 'Redux/store'
import * as actions from 'Redux/actions'

require('../../styles/global.scss')

ipcRenderer.on('action', (evt, action) => {
  if ($('.Modal').length && action.indexOf('Instance') !== -1) {
    return
  }

  store.dispatch(actions[action]())
})

ReactDOM.render(MainWindow, document.getElementById('content'))
