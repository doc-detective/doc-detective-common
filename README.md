# Doc Detective Common

![Current version](https://img.shields.io/github/package-json/v/doc-detective/doc-detective-common?color=orange)
[![NPM Shield](https://img.shields.io/npm/v/doc-detective-common)](https://www.npmjs.com/package/doc-detective-common)
[![Discord Shield](https://img.shields.io/badge/chat-on%20discord-purple)](https://discord.gg/mSCCRAhH)

Shared resources for Doc Detective projects.

## Install

```bash
npm i doc-detective-common
```

## Init

```javascript
const common = require("doc-detective-common");
```

## Methods

### `.validate(schemaKey: string, object: object)`

Validate that `object` matches the specified [schema](#.schema) definition.

Returns an object with the following schema:

````json
{
  "valid": boolean,
  "errors": [
    {
      "instancePath": string,
      "schemaPath": string,
      "keyword": string,
      "params": [{Object}],
      "message": string
    }
  ]
}
``

#### Usage

```js
const schemaKey = "runShell_v1";
const object = {
  action: "runShell",
  command: "echo $username"
};
console.log(common.validate(schemaKey, object));
```

## Objects

### `.schema`

JSON schema definitions for various objects used throughout Doc Detective.

Schema objects are located in the [`/schema`](https://github.com/doc-detective/doc-detective-common/tree/schema/schema) directory and made available through the `common.schema` object.

```json
{
  "runShell": {Object},
  "analytics": {Object}
}
```
````
