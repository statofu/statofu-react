import 'bootstrap/dist/css/bootstrap-utilities.css';
import { nanoid } from 'nanoid';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import type { StatofuStore } from 'statofu';
import { StoreProvider } from 'statofu-react';

import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { $itemPanelState, ItemPanelState } from './states/ItemPanelState';

const elRoot = document.getElementById('root');

if (!elRoot) {
  throw new Error('The element of root not found');
}

const root = ReactDOM.createRoot(elRoot);

root.render(
  <StrictMode>
    <StoreProvider onCreate={fakeInitialStates}>
      <App />
    </StoreProvider>
  </StrictMode>
);

function fakeInitialStates(store: StatofuStore) {
  const itemList: ItemPanelState['itemList'] = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Cras fringilla dictum mi, laoreet maximus est.',
    'Vivamus dignissim sem quis eros accumsan, in accumsan nulla elementum.',
    'Vivamus felis turpis, dapibus ut lobortis ultrices, luctus in ligula.',
    'Aliquam in ex non lacus congue maximus.',
  ].map((text) => ({ id: nanoid(), text }));

  store.operate($itemPanelState, (state) => ({ ...state, itemList }));
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
