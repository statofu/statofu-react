import { render } from '@testing-library/react';
import React, { FC } from 'react';
import { createStatofuStore } from 'statofu';

import { StoreProvider, withStore } from './Store';

jest.mock('./Store', () => {
  const _Store = jest.requireActual<typeof import('./Store')>('./Store');
  jest.spyOn(_Store, 'StoreProvider');
  return _Store;
});

const someStr: string = '';
const someNum: number = 0;

const store1 = createStatofuStore();
function onCreate1() {}

const store2 = createStatofuStore();
function onCreate2() {}

interface SomeComponentProps {
  s?: string;
  n?: number;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('withStore', () => {
  test('HOC props are passed into StoreProvider, and given StoreProvider props override HOC props', () => {
    const SomeComponentWithStore = withStore({ store: store1, onCreate: onCreate1 })(() => null);

    const { rerender } = render(<SomeComponentWithStore />);
    expect(StoreProvider).toHaveBeenLastCalledWith(
      expect.objectContaining({ store: store1, onCreate: onCreate1 }),
      expect.anything()
    );

    rerender(<SomeComponentWithStore store={store2} onCreate={onCreate2} />);
    expect(StoreProvider).toHaveBeenLastCalledWith(
      expect.objectContaining({ store: store2, onCreate: onCreate2 }),
      expect.anything()
    );
  });

  test('given AComponent props are passed into AComponent, but given StoreProvider props are not', () => {
    const SomeComponent: FC<SomeComponentProps> = jest.fn(() => null);
    const SomeComponentWithStore = withStore()(SomeComponent);

    render(<SomeComponentWithStore store={store1} onCreate={onCreate1} s={someStr} n={someNum} />);
    expect(SomeComponent).toHaveBeenLastCalledWith(
      expect.objectContaining({ s: someStr, n: someNum }),
      expect.anything()
    );
    expect(SomeComponent).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ store: expect.anything() }),
      expect.anything()
    );
    expect(SomeComponent).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ onCreate: expect.anything() }),
      expect.anything()
    );
  });
});
