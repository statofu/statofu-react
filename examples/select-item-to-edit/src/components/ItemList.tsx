import { FC } from 'react';
import { useOperate, useSnapshot } from 'statofu-react';

import { $itemPanelState, selectItem } from '../states/ItemPanelState';

export const ItemList: FC = () => {
  const { itemList, selectedItemId } = useSnapshot($itemPanelState);

  const op = useOperate();

  function handleItemClick(itemId: string) {
    op($itemPanelState, selectItem, itemId);
  }

  return (
    <ol>
      {itemList.map(({ id, text }) => {
        const isSelected = id === selectedItemId;
        return (
          <li
            key={id}
            className={`${isSelected ? 'fw-bold' : ''}`}
            onClick={() => handleItemClick(id)}
          >
            {text}
          </li>
        );
      })}
    </ol>
  );
};
