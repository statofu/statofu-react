<h1 align="center">
  <img src="./assets/fa668bd880860a5790b4a5bc0d1d0f40adebd47d.jpg" alt="Statofu React" />
</h1>

[![Coverage](https://img.shields.io/codecov/c/github/statofu/statofu-react/latest)](https://codecov.io/gh/statofu/statofu-react)
[![Verify and release](https://img.shields.io/github/actions/workflow/status/statofu/statofu-react/verify-and-release.yml?branch=latest&label=verify%20and%20release)](https://github.com/statofu/statofu-react/actions/workflows/verify-and-release.yml)
[![Npm Version](https://img.shields.io/npm/v/statofu-react)](https://npmjs.com/package/statofu-react)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/statofu-react)](https://bundlephobia.com/package/statofu-react)
[![License](https://img.shields.io/github/license/statofu/statofu-react)](./LICENSE)

English | [中文](./README.zh-Hans.md)

## Why Statofu React?

One big problem with today's widely accepted state management libraries is that predictable state changes have to come at a high cost. [A detailed article](https://github.com/statofu/statofu-blog/blob/main/20230525/README.en.md) was written for the explanation:

> ...
>
> Though, Redux is not perfect and has a drawback. If we take a closer look at its unidirectional data flow, `event -> action -> reducer -> state`, it's lengthy. No matter how simple a state change is, always at least one action and at least one reducer are involved. In comparison, a state change in either Recoil or MobX goes much easier. The lengthiness dramatically increases the cost of use in Redux.
>
> ...

Statofu is a state management library built to achieve **predictable state changes at a low cost** 🌈. It's framework-agnostic, small and fast. Statofu React is the library of the React integration.

## Installation

```sh
npm i -S statofu statofu-react # yarn or pnpm also works
```

The state management library, [`statofu`](https://github.com/statofu/statofu), is required as the peer dependency of the React integration, `statofu-react`.

## Essentials

In Statofu, each kind of state change directly involves a different reducer that accepts one or multiple old states along with zero or more payloads and produces one or multiple new corresponding states. As reducers are pure functions, state changes are predictable. As reducers are directly involved, state changes come at a low cost. The usage is described as follows. (Or, [an runnable example is available here](./examples/select-item-to-edit).)

### Setting up the store

First of all, a Statofu store needs to be set up for child components, for which `StoreProvider` is used. It can wrap either the whole app or only some components:

```tsx
import { StoreProvider } from 'statofu-react';

// ..., either:

root.render(
  <StoreProvider>
    <App />
  </StoreProvider>
);

// ..., or:

const SomeComponentsWithStore: React.FC = () => {
  return (
    <StoreProvider>
      <SomeComponents />
    </StoreProvider>
  );
};
```

Besides, `withStore` can be used as an alternative to `StoreProvider`:

```tsx
import { withStore } from 'statofu-react';

// ..., either:

const AppWithStore = withStore()(App);

root.render(<AppWithStore />);

// ..., or:

const SomeComponentsWithStore = withStore()(SomeComponents);
```

### Defining states

Next, states need to be defined, which is simply done by Plain Old JavaScript Object(POJO)s. A POJO, as a state definition, simultaneously, for a state, (1) holds the default state value, (2) declares the state type, and (3) indexes the current state value in a store. Here are two example state definitions, one for a selectable item panel, and the other for a hideable text editor:

```tsx
interface ItemPanelState {
  itemList: { id: string; text: string }[];
  selectedItemId: string | undefined;
}

const $itemPanelState: ItemPanelState = {
  itemList: [],
  selectedItemId: undefined,
};

interface TextEditorState {
  text: string;
  visible: boolean;
}

const $textEditorState: TextEditorState = {
  text: '',
  visible: false,
};
```

Usually, to distinguish state definitions from state values by names, `$` is prefixed to state definition names.

### Getting states

Then, to get state values in components, `useSnapshot` is used. It accepts one or multiple state definitions and returns the current one or multiple corresponding state values indexed by the state definitions:

```tsx
import { useSnapshot } from 'statofu-react';

// ...

const SomeComponent1: React.FC = () => {
  const { itemList, selectedItemId } = useSnapshot($itemPanelState);
  const { text, visible } = useSnapshot($textEditorState);

  // ...
};

// ...

const SomeComponent2: React.FC = () => {
  const [itemPanelState, textEditorState] = useSnapshot([$itemPanelState, $textEditorState]);

  // ...
};
```

By the way, before a state is changed, its state value is the shallow copy of the default state value held by its state definition.

### Changing states

Now, let's dive into state changes. In Statofu, each kind of state change directly involves a different reducer. For changing one state, a reducer that accepts one old state along with zero or more payloads and produces one new corresponding state is involved. Here are three example reducers, two for changing `$itemPanelState`, and one for changing `$textEditorState`:

```tsx
function selectItem(state: ItemPanelState, itemIdToSelect: string): ItemPanelState {
  return { ...state, selectedItemId: itemIdToSelect };
}

function unselectItem(state: ItemPanelState): ItemPanelState {
  return { ...state, selectedItemId: undefined };
}

function setText(state: TextEditorState, text: string): TextEditorState {
  return { ...state, text };
}
```

For changing multiple states, a reducer that accepts multiple old states along with zero or more payloads and produces multiple new corresponding states is involved. Here is an example reducer for changing `$itemPanelState` and `$textEditorState`:

```tsx
function submitTextForSelectedItem([textEditor, itemPanel]: [TextEditorState, ItemPanelState]): [
  TextEditorState,
  ItemPanelState
] {
  return [
    { ...textEditor, visible: false },
    {
      ...itemPanel,
      itemList: itemPanel.itemList.map((item) => {
        if (item.id === itemPanel.selectedItemId) {
          return { ...item, text: textEditor.text };
        } else {
          return item;
        }
      }),
      selectedItemId: undefined,
    },
  ];
}
```

With reducers ready, to involve them to change states in components, the operating function returned by `useOperate` is used:

```tsx
import { useOperate } from 'statofu-react';

// ...

const SomeComponent3: React.FC = () => {
  const op = useOperate();

  function handleItemClick(itemId: string) {
    op($itemPanelState, selectItem, itemId);
  }

  function handleQuitClick() {
    op($itemPanelState, unselectItem);
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    op($textEditorState, setText, e.target.value);
  }

  function handleSubmitClick() {
    op([$textEditorState, $itemPanelState], submitTextForSelectedItem);
  }

  return <>{/* attaches event handlers */}</>;
};
```

Inside a call of an operating function, the current state values indexed by the state definitions are passed into the reducer to produce the next state values which are, in turn, saved to the store.

### Deriving data

Furthurmore, to derive data from states, a selector that accepts one or multiple states along with zero or more payloads and calculates a value can be passed in while using `useSnapshot`. Selectors can be named functions:

```tsx
function getSelectedItem(state: ItemPanelState): ItemPanelState['itemList'][number] | undefined {
  return state.itemList.find(({ id }) => id === state.selectedItemId);
}

function getRelatedItems([itemPanel, textEditor]: [
  ItemPanelState,
  TextEditorState
]): ItemPanelState['itemList'] {
  return itemPanel.itemList.filter(({ text }) => text.includes(textEditor.text));
}

function getTextWithFallback(state: TextEditorState, fallback: string): string {
  return state.text || fallback;
}

function isVisible(state: TextEditorState): boolean {
  return state.visible;
}

const SomeComponent5: React.FC = () => {
  const selectedItem = useSnapshot($itemPanelState, getSelectedItem);
  const relatedItems = useSnapshot([$itemPanelState, $textEditorState], getRelatedItems);
  const textWithFallback = useSnapshot($textEditorState, getTextWithFallback, 'Not Available');
  const visible = useSnapshot($textEditorState, isVisible);

  // ...
};
```

Also, selectors can be anonymous functions:

```tsx
const SomeComponent6: React.FC = () => {
  const selectedItemId = useSnapshot($itemPanelState, (state) => state.selectedItemId);

  // ...
};
```

Note that, given the same inputs to a selector, the non-array outputs or the elements of the array outputs should remain referentially identical across separate calls so unnecessary rerenders are avoided.

## Recipes

### Code Structure

In Statofu, the management of a state consists of (1) a state definition, (2) zero or more reducers, and (3) zero or more selectors. So, a recommended practice is to place the three parts of a state sequentially into one file, which leads to good maintainability. (In addition, as there are only POJOs and pure functions in each file, this code structure also leads to good portability.) Let's reorganize the states in Essentials for an example:

```tsx
// states/ItemPanelState.ts
import type { TextEditorState } from './TextEditorState';

export interface ItemPanelState {
  itemList: { id: string; text: string }[];
  selectedItemId: string | undefined;
}

export const $itemPanelState: ItemPanelState = {
  itemList: [],
  selectedItemId: undefined,
};

export function selectItem(state: ItemPanelState, itemIdToSelect: string): ItemPanelState {
  // ...
}

export function unselectItem(state: ItemPanelState): ItemPanelState {
  // ...
}

export function getSelectedItem(
  state: ItemPanelState
): ItemPanelState['itemList'][number] | undefined {
  // ...
}

export function getRelatedItems([itemPanel, textEditor]: [
  ItemPanelState,
  TextEditorState
]): ItemPanelState['itemList'] {
  // ...
}
```

```tsx
// states/TextEditorState.ts
import type { ItemPanelState } from './ItemPanelState';

export interface TextEditorState {
  text: string;
  visible: boolean;
}

export const $textEditorState: TextEditorState = {
  text: '',
  visible: false,
};

export function setText(state: TextEditorState, text: string): TextEditorState {
  // ...
}

export function submitTextForSelectedItem([textEditor, itemPanel]: [
  TextEditorState,
  ItemPanelState
]): [TextEditorState, ItemPanelState] {
  // ...
}

export function getTextWithFallback(state: TextEditorState, fallback: string): string {
  // ...
}

export function isVisible(state: TextEditorState): boolean {
  // ...
}
```

### Server-side rendering(SSR)

In general, SSR needs 2 steps. (1) On the server side, states are prepared as per a page request, an HTML body is rendered with the states, and the states are serialized afterward. Then, the two are piped into the response. (2) On the client side, the server-serialized states are deserialized, then components are rendered with the states to properly hydrate the server-rendered HTML body.

To help with SSR, Statofu provides helpers of bulk reading to-serialize states from a store and bulk writing deserialized states to a store. But, serialization/deserialization is beyond the scope because it's easily doable via a more specialized library such as `serialize-javascript` or some built-in features of a full-stack framework such as data fetching of `next`.

Here is a semi-pseudocode example for SSR with Statofu. Firstly, `serialize-javascript` is installed for serialization/deserialization:

```sh
npm i -S serialize-javascript
```

Next, on the server side:

```tsx
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';
import { createStatofuState } from 'statofu';
import { StoreProvider } from 'statofu-react';
import { foldStates } from 'statofu/ssr';

// ...

app.get('/some-page', (req, res) => {
  const store = createStatofuState();

  const itemPanelState = prepareItemPanelState(req);
  store.operate($itemPanelState, itemPanelState);

  const textEditorState = prepareItemPanelState(req);
  store.operate($textEditorState, textEditorState);

  const htmlBody = renderToString(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  );

  const stateFolder = foldStates(store, { $itemPanelState, $textEditorState });

  res.send(`
...
<script>window.SERIALIZED_STATE_FOLDER='${serialize(stateFolder)}'</script>
...
<div id="root">${htmlBody}</div>
...`);
});
```

Afterward, on the client side:

```tsx
import { hydrateRoot } from 'react-dom/client';
import { StoreProvider } from 'statofu-react';
import { unfoldStates } from 'statofu/ssr';

// ...

const stateFolder = eval(`(${window.SERIALIZED_STATE_FOLDER})`);

delete window.SERIALIZED_STATE_FOLDER;

hydrateRoot(
  elRoot,
  <StoreProvider
    onCreate={(store) => {
      unfoldStates(store, { $itemPanelState, $textEditorState }, stateFolder);
    }}
  >
    <App />
  </StoreProvider>
);
```

Note that, this example can be optimized in different ways like rendering the HTML body as a stream. When using it in the real world, we should tailor it to real-world needs.

## APIs

### `StoreProvider`

The component to set up a Statofu store for child components:

```tsx
<StoreProvider>
  <App />
</StoreProvider>
```

Options:

- `store?: StatofuStore`: The store provided outside.
- `onCreate?: (store: StatofuStore) => void`: The callback invoked on a store created inside. If `store` is present, the callback is not called.

### `withStore`

The higher-order component(HOC) version of `StoreProvider`:

```tsx
const AppWithStore = withStore(/* options */)(App);
```

Options: same as `StoreProvider`'s.

### `useStore`

The hook to get the store:

```tsx
const store = useStore();
```

### `useSnapshot`

The hook to get state values:

```tsx
const { itemList, selectedItemId } = useSnapshot($itemPanelState);
const { text, visible } = useSnapshot($textEditorState);
const [itemPanelState, textEditorState] = useSnapshot([$itemPanelState, $textEditorState]);
```

It can accept selectors:

```tsx
const selectedItem = useSnapshot($itemPanelState, getSelectedItem);
const relatedItems = useSnapshot([$itemPanelState, $textEditorState], getRelatedItems);
const textWithFallback = useSnapshot($textEditorState, getTextWithFallback, 'Not Available');
const visible = useSnapshot($textEditorState, isVisible);
const selectedItemId = useSnapshot($itemPanelState, (state) => state.selectedItemId);
```

### `useOperate`

The hook to return the operating function for changing states by involving reducers:

```tsx
const op = useOperate();

function handleItemClick(itemId: string) {
  op($itemPanelState, selectItem, itemId);
}

function handleQuitClick() {
  op($itemPanelState, unselectItem);
}

function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
  op($textEditorState, setText, e.target.value);
}

function handleSubmitClick() {
  op([$textEditorState, $itemPanelState], submitTextForSelectedItem);
}
```

## Contributing

For any bugs or any thoughts, welcome to [open an issue](https://github.com/statofu/statofu-react/issues), or just DM me on [Twitter](https://twitter.com/licg9999) / [Wechat](https://github.com/statofu/statofu/blob/main/assets/ed0458952a4930f1aeebd01da0127de240c85bbf.jpg).

## License

MIT, details in the [LICENSE](./LICENSE) file.
