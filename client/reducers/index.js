'use strict';

import {combineReducers} from 'redux';

import * as instance from './instance';
import * as favorite from './favorite';
import * as patternStore from './patternStore';
import * as connection from './connection';

export default combineReducers({
  theDefaultReducer,
  firstNamedReducer,
  secondNamedReducer
});
