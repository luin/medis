'use strict';

import id from '../id';
import remote from 'remote';

export function addInstance(data) {
  if (!data) {
    data = { key: id('instance') };
  }
  return this.withMutations(map => {
    map.update('instances', list => list.push(data)).set('activeInstance', data);
  });
}

export function selectInstance(data) {
  return this.set('activeInstance', this.get('instances').find(instance => instance.key === data));
}

export function moveInstance({ from, to }) {
  const [fromIndex, instance] = this.get('instances').findEntry(v => v.key === from);
  const toIndex = this.get('instances').findIndex(v => v.key === to);
  return this
  .update('instances', list => list.splice(fromIndex, 1)
          .splice(toIndex, 0, instance))
          .set('activeInstance', instance);
}

export function delInstance(data) {
  if (!data) {
    data = this.get('activeInstance').key;
  }
  return this.withMutations(map => {
    let deletedIndex;
    map.update('instances', list => list.filterNot((tab, index) => {
      if (tab.key === data) {
        deletedIndex = index;
        return true;
      }
    }));
    if (data === map.get('activeInstance').key) {
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
