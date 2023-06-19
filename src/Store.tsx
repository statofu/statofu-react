import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { createStatofuStore, type StatofuStore } from 'statofu';

const StoreContext = createContext<StatofuStore | undefined>(undefined);

export type StoreProviderProps = PropsWithChildren<{
  store?: StatofuStore;
  onCreate?: (store: StatofuStore) => void;
}>;

export function StoreProvider({
  store: providedStore,
  onCreate,
  children,
}: StoreProviderProps): ReactNode {
  const refManagedStore = useRef<StatofuStore>();

  const refMakeManagedStoreIfNeeded = useRef(() => {
    if (!providedStore && !refManagedStore.current) {
      const managedStore = createStatofuStore();
      onCreate?.(managedStore);
      refManagedStore.current = managedStore;
    }
  });

  refMakeManagedStoreIfNeeded.current();

  useEffect(() => {
    refMakeManagedStoreIfNeeded.current();
    return () => {
      if (refManagedStore.current) {
        const managedStore = refManagedStore.current;
        managedStore.clear();
        refManagedStore.current = undefined;
      }
    };
  }, []);

  return (
    <StoreContext.Provider value={providedStore ?? refManagedStore.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StatofuStore {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error('Statofu store not found');
  }

  return store;
}
