import { FC } from 'react';

import { ItemList } from './components/ItemList';
import { ItemListHeader } from './components/ItemListHeader';
import { TextEditorDialog } from './components/TextEditorDialog';

export const App: FC = () => {
  return (
    <div className="p-3">
      <ItemListHeader />
      <ItemList />
      <TextEditorDialog />
    </div>
  );
};
