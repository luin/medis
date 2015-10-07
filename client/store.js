'use strict';

import { createStore } from 'redux';
import reducers from './reducers';

import Immutable from 'immutable';
import id from './id';

const emptyInstance = Immutable.Map({ key: id('instance') });
let state = Immutable.Map({ instances: Immutable.List.of(emptyInstance), activeInstanceKey: emptyInstance.get('key') });
const favorites = localStorage.getItem('favorites');
state = state.set('favorites', Immutable.List.of(favorites ? JSON.parse(favorites) : []));

export default createStore(reducers, state);
