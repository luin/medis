'use strict';

import Immutable from 'immutable';
import id from './id';
import remote from 'remote';
import { createStore } from 'redux';

const handlers = {
  ADD_INSTANCE(data) {
    if (!data) {
      data = { key: id('instance') };
    }
    return this.withMutations(map => {
      map.update('instances', list => list.push(data)).set('activeInstance', data);
    });
  },
  SELECT_INSTANCE(data) {
    return this.set('activeInstance', this.get('instances').find(instance => instance.key === data));
  },
  MOVE_INSTANCE({ from, to }) {
    const [fromIndex, instance] = this.get('instances').findEntry(v => v.key === from);
    const toIndex = this.get('instances').findIndex(v => v.key === to);
    return this
      .update('instances', list => list.splice(fromIndex, 1)
      .splice(toIndex, 0, instance))
      .set('activeInstance', instance);
  },
  DEL_INSTANCE(data) {
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
};

export default createStore(function (state, action) {
  if (!state) {
    const emptyInstance = { key: id('instance'), host: 'localhost' };
    state = Immutable.Map({ instances: Immutable.List.of(emptyInstance), activeInstance: emptyInstance });
  }
  if (handlers[action.type]) {
    return handlers[action.type].call(state, action.data);
  }
  return state;
});
