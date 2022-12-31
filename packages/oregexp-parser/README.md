# `@sosukesuzuki/oregexp-parser`

## API

```ts
import { parse } from "@sosukesuzuki/oregexp-parser";

const ast = parse("(ab)*c");
```

## Supported syntax & AST spec

### `LiteralExpression`

value:

```
a
```

AST:

```json
{
  "type": "LiteralExpression",
  "value": "a"
}
```

### `ConcatExpression`

value:

```
ab
```

AST:

```json
{
  "type": "ConcatExpression",
  "left": {
    "type": "LiteralExpression",
    "value": "a"
  },
  "right": {
    "type": "LiteralExpression",
    "value": "b"
  }
}
```

### `SelectExpression`

value:

```
a|b
```

AST:

```json
{
  "type": "SelectExpression",
  "left": {
    "type": "LiteralExpression",
    "value": "a"
  },
  "right": {
    "type": "LiteralExpression",
    "value": "b"
  }
}
```

### `StarExpression`

value:

```
a*
```

AST:

```json
{
  "type": "StarExpression",
  "expression": {
    "type": "LiteralExpression",
    "value": "a"
  }
}
```
