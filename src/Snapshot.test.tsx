import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FC } from 'react';
import type { StatofuStore } from 'statofu';

import { useOperate } from './Operate';
import { useSnapshot } from './Snapshot';
import { StoreProvider } from './Store';

jest.mock('statofu', () => {
  const _statofu = jest.requireActual<typeof import('statofu')>('statofu');
  return {
    ..._statofu,
    createStatofuStore: jest.fn(() => {
      const store = _statofu.createStatofuStore();
      jest.spyOn(store, 'subscribe');
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

const trackRender = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSnapshot', () => {
  describe('a component snapshotting one state with no selector', () => {
    test('renders the state with no error', () => {
      const ResultText: FC = () => {
        const a = useSnapshot($a);
        return <div role="result-text">{a.a}</div>;
      };

      const ToBeRendered: FC = () => (
        <StoreProvider>
          <ResultText />
        </StoreProvider>
      );

      expect(() => {
        const { rerender } = render(<ToBeRendered />);
        expect(screen.getByRole('result-text')).toHaveTextContent('a');

        rerender(<ToBeRendered />);
        expect(screen.getByRole('result-text')).toHaveTextContent('a');
      }).not.toThrow();
    });

    test('rerenders when the state goes referentially different by operate()', async () => {
      const user = userEvent.setup();

      const ResultText: FC = () => {
        const a = useSnapshot($a);
        trackRender();
        return <div role="result-text">{a.a}</div>;
      };

      const ActionList: FC = () => {
        const operate = useOperate();
        return (
          <div>
            <button
              onClick={() => {
                operate($a, { ...$a });
              }}
            >
              Reset
            </button>
            <button
              onClick={() => {
                operate($a, (a) => ({ ...a, a: `${a.a}+` }));
              }}
            >
              Alter
            </button>
          </div>
        );
      };

      render(
        <StoreProvider>
          <ResultText />
          <ActionList />
        </StoreProvider>
      );
      expect(trackRender).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('result-text')).toHaveTextContent('a');

      await user.click(screen.getByText('Reset'));
      expect(trackRender).toHaveBeenCalledTimes(2);
      expect(screen.getByRole('result-text')).toHaveTextContent('a');

      await user.click(screen.getByText('Alter'));
      expect(trackRender).toHaveBeenCalledTimes(3);
      expect(screen.getByRole('result-text')).toHaveTextContent('a+');
    });

    test('does not rerender when the state remains referentially identicial by operate()', async () => {
      const user = userEvent.setup();

      const ResultText: FC = () => {
        const a = useSnapshot($a);
        trackRender();
        return <div role="result-text">{a.a}</div>;
      };

      const Action: FC = () => {
        const operate = useOperate();
        return (
          <button
            onClick={() => {
              operate($a, (a) => a);
            }}
          >
            Click
          </button>
        );
      };

      render(
        <StoreProvider>
          <ResultText />
          <Action />
        </StoreProvider>
      );
      expect(trackRender).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('result-text')).toHaveTextContent('a');

      await user.click(screen.getByText('Click'));
      expect(trackRender).toHaveBeenCalledTimes(1);
    });
  });

  describe('a component snapshotting multi states with no selector', () => {
    test('renders the states with no error', () => {
      const ResultText: FC = () => {
        const [a, b] = useSnapshot([$a, $b]);
        return (
          <div role="result-text">
            {a.a}, {b.b}
          </div>
        );
      };

      const ToBeRendered: FC = () => (
        <StoreProvider>
          <ResultText />
        </StoreProvider>
      );

      expect(() => {
        const { rerender } = render(<ToBeRendered />);
        expect(screen.getByRole('result-text')).toHaveTextContent('a, b');

        rerender(<ToBeRendered />);
        expect(screen.getByRole('result-text')).toHaveTextContent('a, b');
      }).not.toThrow();
    });

    test(
      'subscribe() is not called ' +
        'when elements in the $states remain referentially identical on rerenders',
      () => {
        const ResultText: FC = () => {
          const [a, b] = useSnapshot([$a, $b]);
          return (
            <div role="result-text">
              {a.a}, {b.b}
            </div>
          );
        };

        const ToBeRendered: FC = () => (
          <StoreProvider>
            <ResultText />
          </StoreProvider>
        );

        const { rerender } = render(<ToBeRendered />);
        expect(screen.getByRole('result-text')).toHaveTextContent('a, b');
        expect(lastCreatedStore.subscribe).toHaveBeenCalledTimes(1);

        rerender(<ToBeRendered />);
        expect(lastCreatedStore.subscribe).toHaveBeenCalledTimes(1);
      }
    );
  });

  describe('a component snapshotting one state with a selector but no payload', () => {
    test('renders the selected value with no error', () => {
      const ResultText: FC = () => {
        const s = useSnapshot($a, (a) => a.a);
        return <div role="result-text">{s}</div>;
      };

      const ToBeRendered: FC = () => (
        <StoreProvider>
          <ResultText />
        </StoreProvider>
      );

      expect(() => {
        const { rerender } = render(<ToBeRendered />);
        expect(screen.getByRole('result-text')).toHaveTextContent('a');

        rerender(<ToBeRendered />);
        expect(screen.getByRole('result-text')).toHaveTextContent('a');
      }).not.toThrow();
    });

    test('does not rerender when the selected value remains referentially identical by operate()', async () => {
      const user = userEvent.setup();

      const ResultText: FC = () => {
        const s = useSnapshot($a, () => 'a');
        trackRender();
        return <div role="result-text">{s}</div>;
      };

      const Action: FC = () => {
        const operate = useOperate();
        return (
          <button
            onClick={() => {
              operate($a, (a) => ({ a: `${a}+` }));
            }}
          >
            Click
          </button>
        );
      };

      render(
        <StoreProvider>
          <ResultText />
          <Action />
        </StoreProvider>
      );
      expect(trackRender).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('result-text')).toHaveTextContent('a');

      await user.click(screen.getByText('Click'));
      expect(trackRender).toHaveBeenCalledTimes(1);
    });
  });

  describe('a component snapshotting one state with a selector and payloads', () => {
    test(
      'renders the selected value correctly with no error ' +
        'as the payloads change along with the props',
      () => {
        const ResultText: FC<{ p: string }> = ({ p }) => {
          const s = useSnapshot($a, (a, p: string) => `${a.a}, ${p}`, p);
          return <div role="result-text">{s}</div>;
        };

        const ToBeRendered: FC<{ p: string }> = ({ p }) => (
          <StoreProvider>
            <ResultText p={p} />
          </StoreProvider>
        );

        expect(() => {
          const { rerender } = render(<ToBeRendered p="p" />);
          expect(screen.getByRole('result-text')).toHaveTextContent('a, p');

          rerender(<ToBeRendered p="p+" />);
          expect(screen.getByRole('result-text')).toHaveTextContent('a, p+');
        }).not.toThrow();
      }
    );
  });
});
