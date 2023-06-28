import ReactDOMClient from 'react-dom/client';
import { StoreProvider, useOperate, useSnapshot } from 'statofu-react';

import './appLogics';

test('runs app logics', async () => {
  document.body.innerHTML = '<div id="root"></div>';

  const elRoot = document.getElementById('root');

  if (!elRoot) {
    throw new Error('Root element not found');
  }

  await expect(
    appLogics.test({
      ReactDOMClient,
      statofuReact: { StoreProvider, useOperate, useSnapshot },
      elRoot,
    })
  ).resolves.not.toThrow();

  console.log(document.documentElement.innerHTML);
});
