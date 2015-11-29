'use strict';

import Immutable from 'immutable';
import { ipcRenderer } from 'electron';

export function getPatternStore() {
  return Immutable.fromJS(JSON.parse(localStorage.getItem('patternStore')) || {});
}

export function savePatternStore(store, patterns) {
  const patternStore = getPatternStore().set(store, patterns);
  localStorage.setItem('patternStore', JSON.stringify(patternStore.toJSON()));

  ipcRenderer.send('dispatch', 'reloadPatternStore');
  return patterns;
}
