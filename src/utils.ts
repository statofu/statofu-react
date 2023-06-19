import { useRef } from 'react';
import type { OneOrMulti, StatofuState } from 'statofu';
import { areSameArrays } from 'statofu/src/utils';

const { isArray } = Array;

export function useStableStates<
  TNullableStates extends OneOrMulti<StatofuState> | null | undefined
>(states: TNullableStates): TNullableStates {
  const refStableStates = useRef<TNullableStates>(states);

  if (refStableStates.current !== states) {
    if (isArray(refStableStates.current) && isArray(states)) {
      if (!areSameArrays(refStableStates.current, states)) {
        refStableStates.current = states;
      }
    } else {
      refStableStates.current = states;
    }
  }

  return refStableStates.current;
}
