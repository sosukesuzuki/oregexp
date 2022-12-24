import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Parser } from "../parser.js";
import { concatExpr, literalExpr } from "../ast.js";

function parse(value: string) {
  const parser = new Parser(value);
  return parser.parse();
}

describe("parser", () => {
  const testCases = [
    ["f", literalExpr("f")],
    ["fo", concatExpr(literalExpr("f"), literalExpr("o"))],
  ] as const;
  testCases.map(([value, expected]) => {
    it(`regexp: ${value}`, () => {
      const actual = parse(value);
      assert.deepEqual(actual, expected);
    });
  });
});
