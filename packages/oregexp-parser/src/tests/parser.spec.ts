import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Parser } from "../parser.js";
import { concatExpr, literalExpr, selectExpr, starExpr } from "../ast.js";

function parse(value: string) {
  const parser = new Parser(value);
  return parser.parse();
}

describe("parser", () => {
  const testCases = [
    ["f", literalExpr("f")],
    ["fo", concatExpr(literalExpr("f"), literalExpr("o"))],
    ["f|o", selectExpr(literalExpr("f"), literalExpr("o"))],
    [
      "a|bc",
      selectExpr(
        literalExpr("a"),
        concatExpr(literalExpr("b"), literalExpr("c"))
      ),
    ],
    ["f*", starExpr(literalExpr("f"))],
    ["(a)", literalExpr("a")],
    ["(a)*", starExpr(literalExpr("a"))],
    [
      "abc",
      concatExpr(
        concatExpr(literalExpr("a"), literalExpr("b")),
        literalExpr("c")
      ),
    ],
    [
      "a|b|c",
      selectExpr(
        selectExpr(literalExpr("a"), literalExpr("b")),
        literalExpr("c")
      ),
    ],
    [
      "(ab)(cd)",
      concatExpr(
        concatExpr(literalExpr("a"), literalExpr("b")),
        concatExpr(literalExpr("c"), literalExpr("d"))
      ),
    ],
    [
      "(ab)*f",
      concatExpr(
        starExpr(concatExpr(literalExpr("a"), literalExpr("b"))),
        literalExpr("f")
      ),
    ],
    [
      "(ab)(cd)*",
      concatExpr(
        concatExpr(literalExpr("a"), literalExpr("b")),
        starExpr(concatExpr(literalExpr("c"), literalExpr("d")))
      ),
    ],
    [
      "a(b|c)*d",
      concatExpr(
        literalExpr("a"),
        concatExpr(
          starExpr(selectExpr(literalExpr("b"), literalExpr("c"))),
          literalExpr("d")
        )
      ),
    ],
    ["(a|b)*", starExpr(selectExpr(literalExpr("a"), literalExpr("b")))],
  ] as const;
  testCases.map(([value, expected]) => {
    it(`regexp: ${value}`, () => {
      const actual = parse(value);
      assert.deepEqual(actual, expected);
    });
  });
});
