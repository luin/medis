'use strict';

import { createStore } from 'redux';
import reducers from './reducers';

import Immutable from 'immutable';
import id from './id';

const emptyInstance = { key: id('instance') };
const state = Immutable.Map({ instances: Immutable.List.of(emptyInstance), activeInstance: emptyInstance });
const favourites = localStorage.getItem('favourites');
state.set('favourites', Immutable.List.of(favourites ? JSON.parse(favourites) : []));

export default createStore(reducers, state);
