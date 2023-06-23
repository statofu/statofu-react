import { useRef } from 'react';
import { areSameArrays } from 'statofu/src/utils';

const { isArray } = Array;

export function useStablized<T>(value: T): T {
  const refStableValue = useRef(value);

  if (shouldStablize(refStableValue.current, value)) {
    refStableValue.current = value;
  }

  return refStableValue.current;
}

export function shouldStablize(a: any, b: any): boolean {
  if (a !== b) {
    if (isArray(a) && isArray(b)) {
      if (!areSameArrays(a, b)) {
        return true;
      }
    } else {
      return true;
    }
  }
  return false;
}
