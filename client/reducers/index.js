'use strict';

import * as instance from './instance';
import * as favorite from './favorite';
import * as patternStore from './patternStore';

const handlers = {};
Object.assign(handlers, instance);
Object.assign(handlers, favorite);
Object.assign(handlers, patternStore);

export default function (state, action) {
  console.log(`* ACTION ${action.type}`);
  if (handlers[action.type]) {
    return handlers[action.type].call(state, action.data, action.callback || noop);
  }
  return state;
}

function noop() {}
