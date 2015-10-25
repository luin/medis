'use strict';

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers';

import Immutable from 'immutable';
import { addInstance } from './backend/instance';
import { getFavorites } from './backend/favorite';
import { getPatternStore } from './backend/patternStore';

const emptyInstance = addInstance();
const state = Immutable.Map({
  instances: Immutable.List.of(emptyInstance),
  activeInstanceKey: emptyInstance.get('key'),
  favorites: getFavorites(),
  patternStore: getPatternStore()
});

export default applyMiddleware(thunkMiddleware)(createStore)(reducers, state);
