'use strict';

import Immutable from 'immutable';
import id from './id';

export function addInstance(data) {
  return Immutable.Map(Object.assign({
    title: 'Medis',
    key: id('instance')
  }, data || {}));
}
