import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parse } from "@sosukesuzuki/oregexp-parser";
import { createNfaFromAst } from "../regexp-nfa.js";

const prepare = (regexp: string) => {
  const ast = parse(regexp);
  const nfa = createNfaFromAst(ast);
  return (value: string) => nfa.run(value);
};

describe("regexp nfa", () => {
  it(`regexp /ab/`, () => {
    const check = prepare("ab");
    assert(check("ab"));
    assert(!check("a"));
    assert(!check("abc"));
  });
  it(`regexp /abcdefg/`, () => {
    const check = prepare("abcdefg");
    assert(check("abcdefg"));
    assert(!check("afffff"));
    assert(!check("abasdlfkjlc"));
  });
});
