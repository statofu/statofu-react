import { useMemo } from 'react';
import type {
  AnyFn,
  OneOrMulti,
  StatofuOperate,
  StatofuState,
  StatofuStatesGetter,
  StatofuStatesReducer,
} from 'statofu';

import { useStore } from './Store';
import { useStablized } from './utils';

export function useOperate(): StatofuOperate;
export function useOperate<TStates extends OneOrMulti<StatofuState>>(
  $states: TStates
): {
  <TFn extends StatofuStatesGetter<TStates>>(statesOrStatesGetter: TStates | TFn): TStates;
  <TFn extends StatofuStatesReducer<TStates, any>>(
    statesReducer: TFn,
    ...payloads: TFn extends StatofuStatesReducer<TStates, [...infer TPayloads]> ? TPayloads : any
  ): TStates;
};
export function useOperate<
  TStates extends OneOrMulti<StatofuState>,
  TFn extends StatofuStatesReducer<TStates, any>
>(
  $states: TStates,
  statesReducer: TFn
): (
  ...payloads: TFn extends StatofuStatesReducer<TStates, [...infer TPayloads]> ? TPayloads : any
) => TStates;
export function useOperate<TStates extends OneOrMulti<StatofuState>, TFn extends AnyFn>(
  $states?: TStates,
  statesReducer?: TFn
): AnyFn {
  const store = useStore();
  const $stableStates = useStablized($states);

  return useMemo(() => {
    return $stableStates && statesReducer
      ? store.operate.bind(store, $stableStates, statesReducer)
      : $stableStates
      ? store.operate.bind(store, $stableStates)
      : store.operate.bind(store);
  }, [$stableStates, statesReducer, store]);
}
