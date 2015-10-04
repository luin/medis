'use strict';

export const slideArray = (array, a, b) => {
  let retArr;
  const _array = array.slice(0);

  if (a < b) {
    retArr = _array.map((v, idx) => {
      if (idx < a) {
        return v;
      }
      if (a <= idx && idx < b) {
        return array[idx + 1];
      }
      if (idx === b) {
        return array[a];
      }
      return v;
    });
  } else {
    retArr = _array.map((v, idx) => {
      if (idx < b) {
        return v;
      }
      if (b === idx) {
        return array[a];
      }
      if (b < idx && idx <= a) {
        return array[idx - 1];
      }
      return v;
    });
  }
  return retArr;
};
