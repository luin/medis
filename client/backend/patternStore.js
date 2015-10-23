'use strict';

import Immutable from 'immutable';

export function getPatternStore() {
  return Immutable.fromJS(JSON.parse(localStorage.getItem('patternStore')) || {});
}

export function savePatternStore(store, patterns) {
  const patternStore = getPatternStore();
  patternStore.set(store, patterns);
  localStorage.setItem('patternStore', JSON.stringify(patternStore.toJSON()));
  return patternStore;
}
