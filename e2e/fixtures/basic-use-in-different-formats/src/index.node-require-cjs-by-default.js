const { JSDOM } = require('jsdom');
const ReactDOMClient = require('react-dom/client');
const { StoreProvider, useOperate, useSnapshot } = require('statofu-react');

require('../dist/appLogics.node');

(async () => {
  const theDom = new JSDOM(
    `
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
    { url: 'http://localhost:3030/' }
  );

  const elRoot = theDom.window.document.getElementById('root');

  if (!elRoot) {
    throw new Error('Root element not found');
  }

  await appLogics.withJsdomWindow(theDom.window, () =>
    appLogics.test({
      ReactDOMClient,
      statofuReact: { StoreProvider, useOperate, useSnapshot },
      elRoot,
    })
  );
  console.log(theDom.serialize());
})();
