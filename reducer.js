'use strict';

import Immutable from 'immutable';
import id from './id';
import remote from 'remote';
import { createStore } from 'redux';

const handlers = {
  ADD_INSTANCE(data) {
    if (!data) {
      data = {
        key: id('instance'),
        host: 'localhost'
      };
    }
    return this.withMutations(map => {
      map.update('instances', list => list.push(data)).set('activeInstance', data);
    });
  },
  SELECT_INSTANCE(data) {
    return this.set('activeInstance', this.get('instances').find(instance => instance.key === data));
  },
  DEL_INSTANCE(data) {
    if (!data) {
      data = this.get('activeInstance').key;
    }
    console.log(data);
    return this.withMutations(map => {
      let deletedIndex;
      map.update('instances', list => list.filterNot((tab, index) => {
        if (tab.key === data) {
          deletedIndex = index;
          return true;
        }
      }));
      if (data === map.get('activeInstance').key) {
        console.log('try', deletedIndex);
        let item = map.get('instances').get(deletedIndex);
        if (!item) {
          console.log('try2', deletedIndex - 1);
          item = map.get('instances').get(deletedIndex - 1);
        }
        if (!item) {
          console.log('TODO: close window');
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
