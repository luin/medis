'use strict';

export function addInstance(data) {
  return { type: 'ADD_INSTANCE', data };
}

export function delInstance(data) {
  return { type: 'DEL_INSTANCE', data };
}

export function selectInstance(data) {
  return { type: 'SELECT_INSTANCE', data };
}

export function moveInstance(data) {
  return { type: 'MOVE_INSTANCE', data };
}
