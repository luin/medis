'use strict'

require('../../photon/css/photon.min.css')

import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import PatternManagerWindow from './'
import store from 'Redux/store'
import * as actions from 'Redux/actions'
import {remote, ipcRenderer} from 'electron'

require('../../styles/global.scss')

window.$ = window.jQuery = require('jquery');

ipcRenderer.on('action', (evt, action) => {
  if (type === 'delInstance') {
    remote.getCurrentWindow().close()
    return
  }

  store.skipPersist = true
  store.dispatch(actions[action]())
  store.skipPersist = false
})

ReactDOM.render(
  <Provider store={store}>
    <PatternManagerWindow/>
  </Provider>,
  document.body.appendChild(document.createElement('div'))
)
