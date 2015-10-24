'use strict';

import * as PatternStore from '../backend/patternStore.js';
import Immutable from 'immutable';

export function addPattern({ store, data }, callback) {
  const pattern = Immutable.Map(Object.assign({}, {
    key: `pattern-${Math.round(Math.random() * 100000)}`,
    value: '*',
    name: '*'
  }, data || {}));
  const patterns = (this.get('patternStore').get(store) || Immutable.List()).push(pattern);
  callback(pattern);
  return this.setIn(['patternStore', store], PatternStore.savePatternStore(store, patterns));
}

export function updatePattern({ store, index, data }) {
  return this.updateIn(['patternStore', store], patterns => {
    const updatedPatterns = patterns.update(index, pattern => pattern.merge(data));
    return PatternStore.savePatternStore(store, updatedPatterns);
  });
}

export function removePatternStore({ store, key }) {
  return this.updateIn(['patternStore', store], patterns => {
    const updatedPatterns = patterns.filterNot(item => item.get('key') === key);
    return PatternStore.savePatternStore(store, updatedPatterns);
  });
}

export function reorderPatternStores({ store, from, to }) {
  return this.updateIn(['patternStore', store], patterns => {
    const source = patterns.get(from);
    const updatedPatterns = patterns.splice(from, 1).splice(to, 0, source);
    return PatternStore.savePatternStore(store, updatedPatterns);
  });
}

export function reloadPatternStore() {
  return this.set('patternStore', PatternStore.getPatternStore());
}
