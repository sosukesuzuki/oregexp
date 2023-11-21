# `@sosukesuzuki/oregexp-engine-vm`

## API

```ts
import { createNewRegexp } from "@sosukesuzuki/oregexp-engine-vm";

const test = createNewRegexp("(a|b)*ccc");

test("hoge"); // false
test("ababababccc"); // true
```
