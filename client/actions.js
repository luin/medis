'use strict';

export default function (type, data, callback) {
  if (typeof data === 'function') {
    return { type, callback: data };
  }
  return { type, data, callback };
}
