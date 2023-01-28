# Doc Detective Common

![Current version](https://img.shields.io/github/package-json/v/doc-detective/doc-detective-common?color=orange)
[![NPM Shield](https://img.shields.io/npm/v/doc-detective-common)](https://www.npmjs.com/package/doc-detective)
[![Discord Shield](https://img.shields.io/badge/chat-on%20discord-purple)](https://discord.gg/mSCCRAhH)

Shared resources for Doc Detective projects.

## Install

```
npm i doc-detective-common
```

## Init

```
const common = require("doc-detective-common");
```

## Objects

### `common.schema`

JSON schema definitions for various objects used throughout Doc Detective.

Schema files are located in the [`/schema`](https://github.com/doc-detective/doc-detective-common/tree/schema/schema) directory and made available through the `common.schema` object.

```json
{
  "v1": {
    "actions": {
      "runShell": {Object}
    },
    "analytics": {Object}
  }
}
```
