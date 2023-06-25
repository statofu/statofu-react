const ReactDOMClient = ReactDOM;
const { StoreProvider, useOperate, useSnapshot } = statofuReact;

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
