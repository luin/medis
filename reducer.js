'use strict';

const Immutable = require('immutable');
const id = require('./id');

const handlers = {
  ADD_INSTANCE(data) {
    return this.withMutations(map => {
      return map.updateIn(['instances'], list => list.push(data)).setIn(['activeInstance'], data);
    });
  },
  DEL_INSTANCE(data) {
    return this.updateIn(['instances'], list => list.filterNot(tab => tab.key === data));
  }
};

export default function (state, action) {
  if (!state) {
    const emptyInstance = { key: id('instance'), host: 'localhost' };
    state = Immutable.Map({ instances: Immutable.List.of(emptyInstance), activeInstance: emptyInstance });
  }
  if (handlers[action.type]) {
    return handlers[action.type].call(state, action.data);
  }
  return state;
}
