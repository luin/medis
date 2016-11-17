'use strict';

import * as Instance from '../backend/instance';
import { remote } from 'electron';

export function addInstance(data) {
  const instance = Instance.addInstance(data);
  return this.update('instances', list => list.push(instance)).set('activeInstanceKey', instance.get('key'));
}

export function selectInstance(data) {
  return this.set('activeInstanceKey', data);
}

export function moveInstance({ from, to }) {
  const [fromIndex, instance] = this.get('instances').findEntry(v => v.get('key') === from);
  const toIndex = this.get('instances').findIndex(v => v.get('key') === to);
  return this.update('instances', list => list.splice(fromIndex, 1).splice(toIndex, 0, instance))
    .set('activeInstanceKey', instance.get('key'));
}

export function delInstance(data) {
  const activeInstanceKey = this.get('activeInstanceKey');
  if (!data) {
    data = activeInstanceKey;
  }
  return this.withMutations(map => {
    let deletedIndex;
    map.update('instances', list => list.filterNot((tab, index) => {
      if (tab.get('key') === data) {
        deletedIndex = index;
        return true;
      }
    }));
    if (data === activeInstanceKey) {
      let item = map.get('instances').get(deletedIndex);
      if (!item) {
        item = map.get('instances').get(deletedIndex - 1);
      }
      if (!item) {
        remote.getCurrentWindow().close();
        return;
      }
      map.set('activeInstanceKey', item.get('key'));
    }
  });
}
