var React: typeof import('react');
var ReactDOM: typeof import('react-dom/client');
var statofuReact: typeof import('statofuReact');

var appLogics: {
  test(deps: {
    ReactDOMClient: typeof import('react-dom/client');
    statofuReact: Pick<
      typeof import('statofu-react'),
      'StoreProvider' | 'useOperate' | 'useSnapshot'
    >;
    elRoot: HTMLElement;
  }): Promise<void>;

  withJsdomWindow(
    jsdomWin: import('jsdom').DOMWindow,
    callback: () => Promise<void>
  ): Promise<void>;
};
