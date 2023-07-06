export interface ItemPanelState {
  itemList: { id: string; text: string }[];
  selectedItemId: string | undefined;
}

export const $itemPanelState: ItemPanelState = {
  itemList: [],
  selectedItemId: undefined,
};

export function selectItem(state: ItemPanelState, itemIdToSelect: string): ItemPanelState {
  return { ...state, selectedItemId: itemIdToSelect };
}

export function unselectItem(state: ItemPanelState): ItemPanelState {
  return { ...state, selectedItemId: undefined };
}

export function getSelectedItem(
  state: ItemPanelState
): ItemPanelState['itemList'][number] | undefined {
  return state.itemList.find(({ id }) => id === state.selectedItemId);
}
