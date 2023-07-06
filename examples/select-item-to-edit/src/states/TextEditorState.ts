import { nanoid } from 'nanoid';

import type { ItemPanelState } from './ItemPanelState';

export interface TextEditorState {
  text: string;
  visible: boolean;
}

export const $textEditorState: TextEditorState = {
  text: '',
  visible: false,
};

export function setText(state: TextEditorState, text: string): TextEditorState {
  return { ...state, text };
}

export function showWithTextCleared(state: TextEditorState): TextEditorState {
  return { ...setText(state, ''), visible: true };
}

export function showWithTextSet(state: TextEditorState, text: string): TextEditorState {
  return { ...setText(state, text), visible: true };
}

export function hideWithTextCleared(state: TextEditorState): TextEditorState {
  return { ...setText(state, ''), visible: false };
}

export function submitTextForNewItem([textEditor, itemPanel]: [TextEditorState, ItemPanelState]): [
  TextEditorState,
  ItemPanelState
] {
  return [
    { ...textEditor, visible: false },
    {
      ...itemPanel,
      itemList: [
        ...itemPanel.itemList,
        {
          id: nanoid(),
          text: textEditor.text,
        },
      ],
    },
  ];
}

export function submitTextForSelectedItem([textEditor, itemPanel]: [
  TextEditorState,
  ItemPanelState
]): [TextEditorState, ItemPanelState] {
  return [
    { ...textEditor, visible: false },
    {
      ...itemPanel,
      itemList: itemPanel.itemList.map((item) => {
        if (item.id === itemPanel.selectedItemId) {
          return { ...item, text: textEditor.text };
        } else {
          return item;
        }
      }),
      selectedItemId: undefined,
    },
  ];
}
