import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parse } from "@sosukesuzuki/oregexp-parser";
import { createNfaFromAst } from "../regexp-nfa.js";

function createMatcher(regexpStr: string): (value: string) => boolean {
  const ast = parse(regexpStr);
  const nfa = createNfaFromAst(ast);
  return (value: string) => nfa.run(value);
}

type TestCases = {
  regexp: string;
  valid: string[];
  invalid: string[];
}[];

const testCases: TestCases = [
  {
    regexp: "a|b",
    valid: ["a", "b"],
    invalid: ["ab", "ba"],
  },
  {
    regexp: "a*",
    // TODO: support empty char
    valid: ["aaaaaaaa", "a"],
    invalid: ["b", "aaaabaaaaa"],
  },
  {
    regexp: "aaaaaa",
    valid: ["aaaaaa"],
    invalid: ["cababab", "ddd"],
  },
  {
    regexp: "(a|b)*",
    valid: ["abababababab", "a", "b"],
    invalid: ["cc"],
  },
  {
    regexp: "(a|b)*ccc",
    valid: ["ababababccc", "accc", "bccc"],
    invalid: ["abababababc"],
  },
  {
    regexp: "suzuki(d|k|t|s|n)osuke",
    valid: [
      "suzukisosuke",
      "suzukidosuke",
      "suzukikosuke",
      "suzukitosuke",
      "suzukinosuke",
    ],
    invalid: ["suzukihosuke"],
  },
  {
    regexp: "suzuki(d|k|t|s|n)oo*suke",
    valid: [
      "suzukisosuke",
      "suzukidoooooosuke",
      "suzukikooooooooosuke",
      "suzukitosuke",
      "suzukinosuke",
    ],
    invalid: ["suzukihosuke", "suzukinsuke"],
  },
];

describe("regexp", () => {
  for (const testCase of testCases) {
    it(`${testCase.regexp}`, () => {
      const matcher = createMatcher(testCase.regexp);
      for (const valid of testCase.valid) {
        assert(matcher(valid));
      }
      for (const invalid of testCase.invalid) {
        assert(!matcher(invalid));
      }
    });
  }
});
