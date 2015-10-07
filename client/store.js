'use strict';

import { createStore } from 'redux';
import reducers from './reducers';

import Immutable from 'immutable';
import { addInstance } from './backend/instance';
import { getFavorites } from './backend/favorite';

const emptyInstance = addInstance();
const state = Immutable.Map({
  instances: Immutable.List.of(emptyInstance),
  activeInstanceKey: emptyInstance.get('key'),

  favorites: getFavorites()
});

export default createStore(reducers, state);
