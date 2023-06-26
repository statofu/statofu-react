/**
 * @jest-environment node
 */
import { JSDOM } from 'jsdom';
import React, { FC } from 'react';
import { renderToString } from 'react-dom/server';
import { unfoldStates } from 'statofu/ssr';

import { useOperate } from './Operate';
import { useSnapshot } from './Snapshot';
import { StoreProvider } from './Store';

interface A {
  a: string;
}
const $a: A = { a: 'a' };

test(`gets SSR'd with no error`, () => {
  const ResultText: FC = () => {
    const a = useSnapshot($a);
    return <div role="result-text">{a.a}</div>;
  };

  const Action: FC = () => {
    const operateA = useOperate($a);
    return (
      <button
        onClick={() => {
          operateA((a) => ({ ...a, a: `${a.a}+` }));
        }}
      >
        Click
      </button>
    );
  };

  expect(() => {
    const a1: A = { a: 'a+' };

    const jsdom = new JSDOM(
      renderToString(
        <StoreProvider
          onCreate={(store) => {
            unfoldStates(store, { $a }, { $a: a1 });
          }}
        >
          <ResultText />
          <Action />
        </StoreProvider>
      )
    );

    expect(jsdom.window.document.querySelector('[role="result-text"]')).toHaveTextContent(a1.a);
  }).not.toThrow();
});
