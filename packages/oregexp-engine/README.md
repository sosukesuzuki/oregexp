# `@sosukesuzuki/oregexp-engine`

## API

```ts
import { createNewRegexp } from "@sosukesuzuki/oregexp-engine";

const test = createNewRegexp("(a|b)*ccc");

test("hoge"); // false
test("ababababccc"); // true
```
