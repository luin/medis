'use strict';

import Immutable from 'immutable';

export function getPatternStore() {
  return Immutable.fromJS(JSON.parse(localStorage.getItem('patternStore')) || {});
}

export function savePatternStore(store, patterns) {
  console.log('go', store, patterns.toJSON());
  const patternStore = getPatternStore().set(store, patterns);
  localStorage.setItem('patternStore', JSON.stringify(patternStore.toJSON()));
  return patterns;
}
