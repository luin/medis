'use strict';

import Immutable from 'immutable';

export function getPatternStore() {
  return Immutable.fromJS(JSON.parse(localStorage.getItem('patternStore')) || []);
}

export function savePatternStore(patternStore) {
  localStorage.setItem('patternStore', JSON.stringify(patternStore.toJSON()));
  return patternStore;
}
