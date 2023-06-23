import { useCallback, useRef, useSyncExternalStore } from 'react';
import { AnyFn, OneOrMulti, StatofuSnapshot, StatofuState } from 'statofu';

import { useStore } from './Store';
import { shouldStablize, useStablized } from './utils';

export const useSnapshot: StatofuSnapshot = <
  TStates extends OneOrMulti<StatofuState>,
  TFn extends AnyFn
>(
  $states: TStates,
  statesGetterOrValueSelector?: TFn,
  ...payloads: any[]
): any => {
  const store = useStore();
  const $stableStates = useStablized($states);
  const refStableSnapshotResult = useRef<any>();

  const subscribeToStateChanges = useCallback(
    (listener: () => void) => store.subscribe($stableStates, listener),
    [$stableStates, store]
  );

  function snapshotStates() {
    const snapshotResult = statesGetterOrValueSelector
      ? store.snapshot($stableStates, statesGetterOrValueSelector, ...(payloads as []))
      : store.snapshot($stableStates);

    if (shouldStablize(refStableSnapshotResult.current, snapshotResult)) {
      refStableSnapshotResult.current = snapshotResult;
    }

    return refStableSnapshotResult.current;
  }

  return useSyncExternalStore(subscribeToStateChanges, snapshotStates, snapshotStates);
};
