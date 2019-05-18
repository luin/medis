'use strict'

require('../../photon/css/photon.min.css')
require('../../../../node_modules/fixed-data-table-contextmenu/dist/fixed-data-table.css')

import ReactDOM from 'react-dom'
import MainWindow from './'
import {ipcRenderer} from 'electron'
import store from 'Redux/store'
import * as actions from 'Redux/actions'

require('../../styles/global.scss')

window.$ = window.jQuery = require('jquery');
window.Buffer = global.Buffer;

ipcRenderer.on('action', (evt, action) => {
  if ($('.Modal').length && action.indexOf('Instance') !== -1) {
    return
  }

  store.skipPersist = true
  store.dispatch(actions[action]())
  store.skipPersist = false
})

ReactDOM.render(MainWindow, document.body.appendChild(document.createElement('div')))
