import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FC, useRef } from 'react';
import { StatofuStore } from 'statofu';

import { useOperate } from './Operate';
import { StoreProvider } from './Store';

jest.mock('statofu', () => {
  const _statofu = jest.requireActual<typeof import('statofu')>('statofu');
  return {
    ..._statofu,
    createStatofuStore: jest.fn(() => {
      const store = _statofu.createStatofuStore();
      jest.spyOn(store, 'operate');
      lastCreatedStore = store;
      return store;
    }),
  };
});

let lastCreatedStore: StatofuStore;

interface A {
  a: string;
}
const $a: A = { a: 'a' };

interface B {
  b: string;
}
const $b: B = { b: 'b' };

function reduceA(a: A, p: string): A {
  return { ...a, a: p };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useOperate', () => {
  describe('a component operating one state plainly', () => {
    test('the underlying store.operate() is called with the given params', async () => {
      const user = userEvent.setup();

      const Action: FC = () => {
        const operate = useOperate();
        return (
          <button
            onClick={() => {
              operate($a, reduceA, 'p');
            }}
          >
            Click
          </button>
        );
      };

      render(
        <StoreProvider>
          <Action />
        </StoreProvider>
      );

      await user.click(screen.getByText('Click'));
      expect(lastCreatedStore.operate).toHaveBeenCalledOnceWith($a, reduceA, 'p');
    });

    test('the same operate function is returned on rerenders', () => {
      const ResultText: FC = () => {
        const operate = useOperate();

        const refLastOperate = useRef<typeof operate>();

        const isTheSameAsTheLast = refLastOperate.current === operate;

        refLastOperate.current = operate;

        return <div role="result-text">{String(isTheSameAsTheLast)}</div>;
      };

      const ToBeRendered: FC = () => (
        <StoreProvider>
          <ResultText />
        </StoreProvider>
      );

      const { rerender } = render(<ToBeRendered />);
      expect(screen.getByRole('result-text')).toHaveTextContent('false');

      rerender(<ToBeRendered />);
      expect(screen.getByRole('result-text')).toHaveTextContent('true');
    });
  });

  describe('a component operating one state with the state bound', () => {
    test('the underlying store.operate() is called with the bound state and the given params', async () => {
      const user = userEvent.setup();

      const Action: FC = () => {
        const operateA = useOperate($a);
        return (
          <button
            onClick={() => {
              operateA(reduceA, 'p');
            }}
          >
            Click
          </button>
        );
      };

      render(
        <StoreProvider>
          <Action />
        </StoreProvider>
      );

      await user.click(screen.getByText('Click'));
      expect(lastCreatedStore.operate).toHaveBeenCalledOnceWith($a, reduceA, 'p');
    });

    test('the same operate function is returned on rerenders', () => {
      const ResultText: FC = () => {
        const operateA = useOperate($a);

        const refLastOperate = useRef<typeof operateA>();

        const isTheSameAsTheLast = refLastOperate.current === operateA;

        refLastOperate.current = operateA;

        return <div role="result-text">{String(isTheSameAsTheLast)}</div>;
      };

      const ToBeRendered: FC = () => (
        <StoreProvider>
          <ResultText />
        </StoreProvider>
      );

      const { rerender } = render(<ToBeRendered />);
      expect(screen.getByRole('result-text')).toHaveTextContent('false');

      rerender(<ToBeRendered />);
      expect(screen.getByRole('result-text')).toHaveTextContent('true');
    });
  });

  describe('a component operating one state with the state and the reducer bound', () => {
    test(
      'the underlying store.operate() is called with ' +
        'the bound state, the bound reducer, and the given params',
      async () => {
        const user = userEvent.setup();

        const Action: FC = () => {
          const operateReduceA = useOperate($a, reduceA);
          return (
            <button
              onClick={() => {
                operateReduceA('p');
              }}
            >
              Click
            </button>
          );
        };

        render(
          <StoreProvider>
            <Action />
          </StoreProvider>
        );

        await user.click(screen.getByText('Click'));
        expect(lastCreatedStore.operate).toHaveBeenCalledOnceWith($a, reduceA, 'p');
      }
    );

    test('the same operate function is returned on rerenders', () => {
      const ResultText: FC = () => {
        const operateReduceA = useOperate($a, reduceA);

        const refLastOperate = useRef<typeof operateReduceA>();

        const isTheSameAsTheLast = refLastOperate.current === operateReduceA;

        refLastOperate.current = operateReduceA;

        return <div role="result-text">{String(isTheSameAsTheLast)}</div>;
      };

      const ToBeRendered: FC = () => (
        <StoreProvider>
          <ResultText />
        </StoreProvider>
      );

      const { rerender } = render(<ToBeRendered />);
      expect(screen.getByRole('result-text')).toHaveTextContent('false');

      rerender(<ToBeRendered />);
      expect(screen.getByRole('result-text')).toHaveTextContent('true');
    });
  });

  describe('a component operating multi states with the states bound', () => {
    test('the same operate function is returned on rerenders', () => {
      const ResultText: FC = () => {
        const operateAandB = useOperate([$a, $b]);

        const refLastOperate = useRef<typeof operateAandB>();

        const isTheSameAsTheLast = refLastOperate.current === operateAandB;

        refLastOperate.current = operateAandB;

        return <div role="result-text">{String(isTheSameAsTheLast)}</div>;
      };

      const ToBeRendered: FC = () => (
        <StoreProvider>
          <ResultText />
        </StoreProvider>
      );

      const { rerender } = render(<ToBeRendered />);
      expect(screen.getByRole('result-text')).toHaveTextContent('false');

      rerender(<ToBeRendered />);
      expect(screen.getByRole('result-text')).toHaveTextContent('true');
    });
  });
});
