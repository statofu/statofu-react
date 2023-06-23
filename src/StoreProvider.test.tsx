import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import React, { FC, StrictMode } from 'react';
import { createStatofuStore, type StatofuStore } from 'statofu';

import { useSnapshot } from './Snapshot';
import { StoreProvider, useStore } from './Store';

jest.mock('statofu', () => {
  const _statofu = jest.requireActual<typeof import('statofu')>('statofu');
  return {
    ..._statofu,
    createStatofuStore: jest.fn(() => {
      const store = _statofu.createStatofuStore();
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

const trackRender = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StoreProvider', () => {
  describe('when no store is provided outside, a managed store is created inside', () => {
    test('the managed store is accessable by useStore', () => {
      const SomeChild: FC = jest.fn(() => {
        expect(useStore()).toBe(lastCreatedStore);

        return null;
      });

      render(
        <StoreProvider>
          <SomeChild />
        </StoreProvider>
      );

      expect(createStatofuStore).toHaveBeenCalledOnce();
      expect(SomeChild).toHaveBeenCalledOnce();
    });

    describe('when onCreate is present', () => {
      test(
        'onCreate is called with the managed store passed in only once ' +
          'right after the managed store is created',
        () => {
          const onCreate = jest.fn();

          const { rerender } = render(<StoreProvider onCreate={onCreate} />);
          expect(createStatofuStore).toHaveBeenCalledOnce();
          expect(onCreate).toHaveBeenCalledOnce();
          expect(onCreate).toHaveBeenLastCalledWith(lastCreatedStore);

          onCreate.mockClear();
          rerender(<StoreProvider onCreate={onCreate} />);
          expect(onCreate).not.toHaveBeenCalled();
        }
      );

      test(
        'state changes that happen in onCreate ' +
          'directly change the result of useSnapshot on the initial render and ' +
          'do not result in any rerender',
        () => {
          const onCreate: (store: StatofuStore) => void = jest.fn((store) => {
            store.operate($a, { a: 'a+' });
          });

          const SomeChild: FC = jest.fn(() => {
            const a = useSnapshot($a);

            trackRender();

            return (
              <div>
                <div role="result-of-useSnapshot">{a.a}</div>
              </div>
            );
          });

          render(
            <StoreProvider onCreate={onCreate}>
              <SomeChild />
            </StoreProvider>
          );

          expect(createStatofuStore).toHaveBeenCalledOnce();
          expect(screen.getByRole('result-of-useSnapshot')).toHaveTextContent('a+');
          expect(trackRender).toHaveBeenCalledTimes(1);
        }
      );

      test('state changes that happen in onCreate make the equivalent effects in the strict mode', () => {
        const onCreate: (store: StatofuStore) => void = jest.fn((store) => {
          store.operate($a, { a: 'a+' });
        });

        const SomeChild: FC = jest.fn(() => {
          const a = useSnapshot($a);

          trackRender();

          return (
            <div>
              <div role="result-of-useSnapshot">{a.a}</div>
            </div>
          );
        });

        render(
          <StrictMode>
            <StoreProvider onCreate={onCreate}>
              <SomeChild />
            </StoreProvider>
          </StrictMode>
        );

        expect(createStatofuStore).toHaveBeenCalledTimes(2);
        expect(screen.getByRole('result-of-useSnapshot')).toHaveTextContent('a+');
        expect(trackRender).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('when a store is provided outside, no managed store is created inside', () => {
    test('the provided store is accessable by useStore', () => {
      const store = createStatofuStore();
      mocked(createStatofuStore).mockClear();

      const SomeChild: FC = jest.fn(() => {
        expect(useStore()).toBe(store);

        return null;
      });

      render(
        <StoreProvider store={store}>
          <SomeChild />
        </StoreProvider>
      );

      expect(createStatofuStore).not.toHaveBeenCalled();
      expect(SomeChild).toHaveBeenCalledOnce();
    });

    test('when onCreate is present, onCreate is not called', () => {
      const store = createStatofuStore();
      mocked(createStatofuStore).mockClear();

      const onCreate = jest.fn();

      render(<StoreProvider store={store} onCreate={onCreate} />);

      expect(createStatofuStore).not.toHaveBeenCalled();
      expect(onCreate).not.toHaveBeenCalled();
    });

    describe('when the provided store becomes undefined, a managed store gets created inside', () => {
      test(
        'the provided store is accessible by useStore before that, ' +
          'the managed store becomes accessible by useStore after that',
        () => {
          const store = createStatofuStore();
          mocked(createStatofuStore).mockClear();

          const SomeChildBeforeThat: FC = jest.fn(() => {
            expect(useStore()).toBe(store);

            return null;
          });

          const { rerender } = render(
            <StoreProvider store={store}>
              <SomeChildBeforeThat />
            </StoreProvider>
          );

          expect(createStatofuStore).not.toHaveBeenCalled();
          expect(SomeChildBeforeThat).toHaveBeenCalledOnce();

          const SomeChildAfterThat: FC = jest.fn(() => {
            expect(useStore()).toBe(lastCreatedStore);

            return null;
          });

          rerender(
            <StoreProvider store={undefined}>
              <SomeChildAfterThat />
            </StoreProvider>
          );

          expect(createStatofuStore).toHaveBeenCalledOnce();
          expect(SomeChildAfterThat).toHaveBeenCalledOnce();
        }
      );
    });
  });

  test('when StoreProvider is absent, useStore throws an error', () => {
    const SomeComponent: FC = jest.fn(() => {
      expect(() => useStore()).toThrow();
      return null;
    });

    render(<SomeComponent />);

    expect(SomeComponent).toHaveBeenCalledOnce();
  });
});
