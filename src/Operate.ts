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
import { useStableStates } from './utils';

export interface StatofuOperateBoundWithStates<TStates extends OneOrMulti<StatofuState>> {
  <TFn extends StatofuStatesGetter<TStates>>(statesOrStatesGetter: TStates | TFn): TStates;
  <TPayloads extends [...any[]], TFn extends StatofuStatesReducer<TStates, TPayloads>>(
    statesReducer: TFn,
    ...payloads: TPayloads
  ): TStates;
}

export interface StatofuOperateBoundWithStatesAndStatesGetter<
  TStates extends OneOrMulti<StatofuState>
> {
  (): TStates;
}

export interface StatofuOperateBoundWithStatesAndStatesReducer<
  TStates extends OneOrMulti<StatofuState>,
  TPayloads extends [...any[]]
> {
  (...payloads: TPayloads): TStates;
}

export function useOperate(): StatofuOperate;
export function useOperate<TStates extends OneOrMulti<StatofuState>>(
  $states: TStates
): StatofuOperateBoundWithStates<TStates>;
export function useOperate<
  TStates extends OneOrMulti<StatofuState>,
  TFn extends StatofuStatesGetter<TStates>
>($states: TStates, statesGetter: TFn): StatofuOperateBoundWithStatesAndStatesGetter<TStates>;
export function useOperate<
  TStates extends OneOrMulti<StatofuState>,
  TFn extends StatofuStatesReducer<TStates, any>
>(
  $states: TStates,
  statesReducer: TFn
): StatofuOperateBoundWithStatesAndStatesReducer<
  TStates,
  TFn extends StatofuStatesReducer<TStates, [...infer P]> ? P : any
>;
export function useOperate<TStates extends OneOrMulti<StatofuState>, TFn extends AnyFn>(
  $states?: TStates,
  statesGetterOrStatesReducer?: TFn
): AnyFn {
  const store = useStore();
  const $stableStates = useStableStates($states);

  return useMemo(() => {
    return $stableStates && statesGetterOrStatesReducer
      ? store.operate.bind(store, $stableStates, statesGetterOrStatesReducer)
      : $stableStates
      ? store.operate.bind(store, $stableStates)
      : store.operate.bind(store);
  }, [$stableStates, statesGetterOrStatesReducer, store]);
}
