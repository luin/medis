'use strict';

import {combineReducers} from 'redux';
import {activeInstanceKey} from './activeInstanceKey'
import {instances} from './instances'
import {favorites} from './favorites'
import {patterns} from './patterns'

export default combineReducers({
  patterns,
  favorites,
  instances,
  activeInstanceKey
});
