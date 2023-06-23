import React, {
  ComponentType,
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useRef,
} from 'react';
import { createStatofuStore, type StatofuStore } from 'statofu';

const StoreContext = createContext<StatofuStore | undefined>(undefined);

export type StoreProviderProps = PropsWithChildren<{
  store?: StatofuStore;
  onCreate?: (store: StatofuStore) => void;
}>;

export const StoreProvider: FC<StoreProviderProps> = ({
  store: providedStore,
  onCreate,
  children,
}) => {
  const refManagedStore = useRef<StatofuStore>();

  if (!providedStore && !refManagedStore.current) {
    const managedStore = createStatofuStore();
    onCreate?.(managedStore);
    refManagedStore.current = managedStore;
  }

  return (
    <StoreContext.Provider value={providedStore ?? refManagedStore.current}>
      {children}
    </StoreContext.Provider>
  );
};

export function withStore(hocProps: Pick<StoreProviderProps, 'store' | 'onCreate'> = {}) {
  return <AComponentProps extends {}>(AComponent: ComponentType<AComponentProps>) => {
    const AComponentWithStore: FC<
      typeof hocProps & Omit<AComponentProps, keyof typeof hocProps>
    > = ({ store, onCreate, ...aComponentProps }) => {
      return (
        <StoreProvider store={store ?? hocProps.store} onCreate={onCreate ?? hocProps.onCreate}>
          <AComponent {...(aComponentProps as AComponentProps)} />
        </StoreProvider>
      );
    };
    return AComponentWithStore;
  };
}

export function useStore(): StatofuStore {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error('Statofu store not found');
  }

  return store;
}
