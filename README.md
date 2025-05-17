## How to use
```shell
npm install env-auth
```

```shell
bun install env-auth
```

## Example
```ts
import fs from "fs";
import dotenv from "dotenv";
import { EnvAuth } from "env-auth";
import crypto from "crypto";

const env = dotenv.parse(fs.readFileSync(".env"));

await EnvAuth.builder()
  .clientId(env.GITHUB_CLIENT_ID)
  .clientSecret(env.GITHUB_CLIENT_SECRET)
  .uniqueToken(crypto.randomUUID())
  .url(env.GITHUB_ENV_REPOSITORY)
  .loader();

// load from github to your environment
console.log(process.env.STRIPE_CLIENT_ID);
console.log(process.env.STRIPE_CLIENT_SECRET);
```