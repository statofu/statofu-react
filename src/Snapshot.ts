import { useCallback, useSyncExternalStore } from 'react';
import type { AnyFn, OneOrMulti, StatofuSnapshot, StatofuState } from 'statofu';

import { useStore } from './Store';
import { useStableStates } from './utils';

export const useSnapshot: StatofuSnapshot = <
  TStates extends OneOrMulti<StatofuState>,
  TFn extends AnyFn
>(
  $states: TStates,
  statesGetterOrValueSelector?: TFn,
  ...payloads: any[]
): any => {
  const store = useStore();
  const $stableStates = useStableStates($states);

  const subscribeToStateChanges = useCallback(
    (listener: () => void) => store.subscribe($stableStates, listener),
    [$stableStates, store]
  );

  function snapshotStates() {
    return statesGetterOrValueSelector
      ? store.snapshot($stableStates, statesGetterOrValueSelector, ...payloads)
      : store.snapshot($stableStates);
  }

  return useSyncExternalStore(subscribeToStateChanges, snapshotStates, snapshotStates);
};
