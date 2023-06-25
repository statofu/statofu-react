import ReactDOMClient from 'react-dom/client';
import { StoreProvider, useOperate, useSnapshot } from 'statofu-react/umd';

import './appLogics';

(async () => {
  const elRoot = document.getElementById('root');

  if (!elRoot) {
    throw new Error('Root element not found');
  }

  await appLogics.test({
    ReactDOMClient,
    statofuReact: { StoreProvider, useOperate, useSnapshot },
    elRoot,
  });
})();
