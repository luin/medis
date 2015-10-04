'use strict';

const Immutable = require('immutable');

const handlers = {
  ADD_INSTANCE(action) {
    return this.updateIn(['tabs'], list => list.push(action.config));
  }
};

export default function (state, action) {
  if (!state) {
    state = Immutable.Map({ tabs: Immutable.List.of({ host: 'localhost' }) });
  }
  if (handlers[action.type]) {
    return handlers[action.type].call(state, action);
  }
  return state;
}
