'use strict';

export function addInstance(data) {
  return { type: 'ADD_INSTANCE', data };
}

export function delInstance(data) {
  return { type: 'DEL_INSTANCE', data };
}
