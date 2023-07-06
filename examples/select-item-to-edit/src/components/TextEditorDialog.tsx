import { ChangeEvent, FC, useEffect } from 'react';
import { useOperate, useSnapshot } from 'statofu-react';

import { $itemPanelState } from '../states/ItemPanelState';
import {
  $textEditorState,
  hideWithTextCleared,
  setText,
  submitTextForNewItem,
  submitTextForSelectedItem,
} from '../states/TextEditorState';

export const TextEditorDialog: FC = () => {
  const { text, visible } = useSnapshot($textEditorState);
  const selectedItemId = useSnapshot($itemPanelState, (state) => state.selectedItemId);

  const op = useOperate();

  function handleTextareaChange(e: ChangeEvent<HTMLTextAreaElement>) {
    op($textEditorState, setText, e.target.value);
  }

  function handleSubmitClick() {
    op(
      [$textEditorState, $itemPanelState],
      selectedItemId ? submitTextForSelectedItem : submitTextForNewItem
    );
  }

  function handleCancelClick() {
    op($textEditorState, hideWithTextCleared);
  }

  useEffect(() => {
    op($textEditorState, hideWithTextCleared);
  }, [op, selectedItemId]);

  return (
    <>
      {visible && (
        <div>
          <div>
            <textarea value={text} onChange={handleTextareaChange} />
          </div>
          <div>
            <button onClick={handleSubmitClick}>Submit</button>
            <button onClick={handleCancelClick}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};
