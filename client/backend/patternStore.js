'use strict';

import Immutable from 'immutable';

export function getPatternStore() {
  return Immutable.fromJS(JSON.parse(localStorage.getItem('patternStore')) || {});
}

export function savePatternStore(store, patterns) {
  const patternStore = getPatternStore().set(store, patterns);
  localStorage.setItem('patternStore', JSON.stringify(patternStore.toJSON()));

  require('ipc').send('dispatch', 'reloadPatternStore');
  return patterns;
}
