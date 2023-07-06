import { FC } from 'react';
import { useOperate, useSnapshot } from 'statofu-react';

import { $itemPanelState, getSelectedItem, unselectItem } from '../states/ItemPanelState';
import { $textEditorState, showWithTextCleared, showWithTextSet } from '../states/TextEditorState';

export const ItemListHeader: FC = () => {
  const selectedItem = useSnapshot($itemPanelState, getSelectedItem);

  const op = useOperate();

  function handleNewItemClick() {
    op($textEditorState, showWithTextCleared);
  }

  function handleEditClick() {
    if (selectedItem) {
      op($textEditorState, showWithTextSet, selectedItem.text);
    }
  }

  function handleQuitClick() {
    op($itemPanelState, unselectItem);
  }

  return (
    <div>
      {selectedItem ? (
        <>
          <button onClick={handleEditClick}>Edit</button>
          <button onClick={handleQuitClick}>Quit</button>
        </>
      ) : (
        <button onClick={handleNewItemClick}>New item</button>
      )}
    </div>
  );
};
