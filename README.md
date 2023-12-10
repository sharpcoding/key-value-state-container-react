React 18 bindings for `key-value-state-container`

### How to develop locally with `key-value-state-container`

- remove all `node_modules` folders manually
- make necessary changes to `key-value-state-container` 
- run `npm run pack` to create a tgz package locally
- change this dependencies in `package.json` to point to your local `key-value-state-container` tgz package

```
  "dependencies": {
    "key-value-state-container": "file:~/key-value-state-container-1.0.0.tgz",
    "lodash": "^4.17.4",
    "react": "^18.2.0"
  },
```

