import React, { Component, FC, PropsWithChildren, ReactNode } from 'react';
import { StatofuStore } from 'statofu';

import { withStore } from './Store';

function render(children: ReactNode): void {}

const someStr = '';
const someNum = 0;

const store1 = {} as StatofuStore;
function onCreate1(store: StatofuStore): void {}

const store2 = {} as StatofuStore;
function onCreate2(store: StatofuStore): void {}

const SomeChild: FC = () => null;

interface SomeComponentProps {
  s?: string;
  n?: number;
}

(function _test_withStore() {
  const SomeFC: FC<SomeComponentProps> = () => null;
  const SomeFCWithStore1 = withStore({ store: store1, onCreate: onCreate1 })(SomeFC);
  render(<SomeFCWithStore1 store={store2} onCreate={onCreate2} s={someStr} n={someNum} />);
  render(
    // @ts-expect-error
    <SomeFCWithStore1>
      <SomeChild />
    </SomeFCWithStore1>
  );
  const SomeFCWithStore2 = withStore()(SomeFC);
  render(<SomeFCWithStore2 s={someStr} n={someNum} store={store1} onCreate={onCreate1} />);

  const SomeFCHavingChildren: FC<PropsWithChildren<SomeComponentProps>> = () => null;
  const SomeFCHavingChildrenWithStore = withStore()(SomeFCHavingChildren);
  render(
    <SomeFCHavingChildrenWithStore>
      <SomeChild />
    </SomeFCHavingChildrenWithStore>
  );

  const SomeFCHavingPropsOverlappingHocProps: FC<
    SomeComponentProps & { store: boolean; onCreate: boolean }
  > = () => null;
  const SomeFCHavingPropsOverlappingHocPropsWithStore = withStore()(
    SomeFCHavingPropsOverlappingHocProps
  );
  render(
    <SomeFCHavingPropsOverlappingHocPropsWithStore
      // @ts-expect-error
      store={false}
      // @ts-expect-error
      onCreate={false}
    />
  );
  render(<SomeFCHavingPropsOverlappingHocPropsWithStore store={store1} onCreate={onCreate1} />);

  class SomeCC extends Component<SomeComponentProps> {}
  const SomeCCWithStore = withStore({ store: store1, onCreate: onCreate1 })(SomeCC);
  render(<SomeCCWithStore store={store2} onCreate={onCreate2} s={someStr} n={someNum} />);
})();
