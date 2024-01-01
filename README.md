React 18 bindings for `key-value-state-container`

### How to use

First, register container with either with [`registerStateContainer`](https://sharpcoding.github.io/key-value-state-container/functions/registerStateContainer-1.html) or `<ContainerRoot />` component. `<ContainerRoot />` has all the props exact to `registerStateContainer` function attributes.

Then [`dispatchAction`](https://sharpcoding.github.io/key-value-state-container/functions/dispatchAction.html) or `useDispatchAction` hook is used to dispatch actions to the container.

Then [`registerStateChangedCallback`](https://sharpcoding.github.io/key-value-state-container/functions/registerStateChangedCallback-1.html) or `useSelector` in your React code to refresh components when some attributes changed.

### Advanced use-cases

It is totally perfect to use [`registerActionDispatchedCallback`](https://sharpcoding.github.io/key-value-state-container/functions/registerActionDispatchedCallback.html) in component code like this:

```tsx
import {
  registerActionDispatchedCallback,
  getUniqueId,
} from "key-value-state-container";

useEffect(() => {
  const listenerId = getUniqueId();
  registerActionDispatchedCallback({
    callback: ({ action }) => { },
    listenerId,
    //...
  });
  return () => {
    unregisterActionDispatchedCallback({ listenerId });
  };
}, []);
```

### Common pitfall: not listening to an attribute changes

Let's say there is a state like this:

```ts
type Car = {
  engine: {
    horsepower: number;
    cylinders: number;
  };
  body: {
    type: "sedan" | "coupe";
    color: "black" | "red" | "white";
  };
  status: "working" | "broken";
  year: number;
};

type State = Car;
```

- `useSelector` will not refresh a React component for `status` attribute change, if used this way:

```tsx
const { body, engine, status } = useSelector<Car, Action>({
  containerId,
  statePath: ["body", "engine"],
});
```

as `statePath` is not including `status` attribute.

### How to develop locally with `key-value-state-container`

- remove all `node_modules` folders manually
- make necessary changes to `key-value-state-container` and bump the version temporarily up (e.g. `1.0.5` -> `1.0.6`)
- run `npm run pack` to create a tgz package locally
- don't forget to bump the version back to the original one (e.g. `1.0.6` -> `1.0.3`)
