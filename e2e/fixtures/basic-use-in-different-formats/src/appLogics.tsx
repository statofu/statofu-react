import { expect } from 'chai';
import React, { FC } from 'react';

globalThis.appLogics = {
  async test({
    ReactDOMClient: { createRoot },
    statofuReact: { StoreProvider, useOperate, useSnapshot },
    elRoot,
  }) {
    interface A {
      a: string;
    }

    const $a: A = { a: 'a' };

    function reduceA(a: A, p: string): A {
      return { ...a, a: p };
    }

    const ResultText: FC = () => {
      const s = useSnapshot($a, (a) => a.a);
      return <div role="result-text">{s}</div>;
    };

    const Action: FC = () => {
      const operateReduceA = useOperate($a, reduceA);

      return (
        <button
          role="action-click"
          onClick={() => {
            operateReduceA('a+');
          }}
        >
          Click
        </button>
      );
    };

    const reactRoot = createRoot(elRoot);
    reactRoot.render(
      <StoreProvider>
        <ResultText />
        <Action />
      </StoreProvider>
    );

    await tick();

    expect(elRoot.querySelector('[role="result-text"]')?.innerHTML).to.equal('a');

    elRoot.querySelector<HTMLButtonElement>('[role="action-click"]')?.click();

    await tick();

    expect(elRoot.querySelector('[role="result-text"]')?.innerHTML).to.equal('a+');

    reactRoot.unmount();
    elRoot.innerHTML = 'success';
  },

  async withJsdomWindow(jsdomWin, callback) {
    const assignedKeys: string[] = [];

    for (const [k, v] of Object.entries(jsdomWin)) {
      if (k in globalThis) continue;
      assignedKeys.push(k);
      (globalThis as Record<string, unknown>)[k] = v;
    }

    try {
      await callback();
    } finally {
      for (const k of assignedKeys) {
        delete globalThis[k as never];
      }
    }
  },
};

async function tick(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
