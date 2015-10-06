'use strict';

import { createStore } from 'redux';
import reducers from './reducers';

import Immutable from 'immutable';
import id from './id';

const emptyInstance = Immutable.Map({ key: id('instance') });
let state = Immutable.Map({ instances: Immutable.List.of(emptyInstance), activeInstance: emptyInstance });
const favourites = localStorage.getItem('favourites');
state = state.set('favourites', Immutable.List.of(favourites ? JSON.parse(favourites) : []));

export default createStore(reducers, state);
