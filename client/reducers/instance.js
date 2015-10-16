'use strict';

import id from '../id';
import remote from 'remote';
import Immutable from 'immutable';

export function addInstance(data) {
  if (!data) {
    data = { key: id('instance') };
  }
  const instance = Immutable.Map(data);
  return this.update('instances', list => list.push(instance)).set('activeInstance', instance);
}

export function selectInstance(data) {
  return this.set('activeInstance', this.get('instances').find(instance => instance.get('key') === data));
}

export function moveInstance({ from, to }) {
  const [fromIndex, instance] = this.get('instances').findEntry(v => v.get('key') === from);
  const toIndex = this.get('instances').findIndex(v => v.get('key') === to);
  return this
    .update('instances', list => list.splice(fromIndex, 1)
    .splice(toIndex, 0, instance))
    .set('activeInstance', instance);
}

export function delInstance(data) {
  if (!data) {
    data = this.get('activeInstance').get('key');
  }
  return this.withMutations(map => {
    let deletedIndex;
    map.update('instances', list => list.filterNot((tab, index) => {
      if (tab.get('key') === data) {
        deletedIndex = index;
        return true;
      }
    }));
    if (data === map.get('activeInstance').get('key')) {
      let item = map.get('instances').get(deletedIndex);
      if (!item) {
        item = map.get('instances').get(deletedIndex - 1);
      }
      if (!item) {
        remote.getCurrentWindow().close();
        return;
      }
      map.set('activeInstance', item);
    }
  });
}

import Redis from 'ioredis';
export function connect() {
  const redis = new Redis();
  const key = this.get('activeInstance').get('key');
  return this
    .update('activeInstance', activeInstance => activeInstance.set('redis', redis))
    .update('instances', list => list.map(instance => {
      if (instance.get('key') === key) {
        return instance.set('redis', redis);
      }
      return instance;
    }));
}
