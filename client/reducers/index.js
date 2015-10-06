'use strict';

import * as instance from './instance';

const handlers = {};
Object.assign(handlers, instance);

export default function (state, action) {
  if (handlers[action.type]) {
    return handlers[action.type].call(state, action.data);
  }
  return state;
}
