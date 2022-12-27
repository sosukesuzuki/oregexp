import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parse } from "@sosukesuzuki/oregexp-parser";
import { createNfaFromAst } from "../regexp-nfa.js";

describe("regexp nfa", () => {
  it("concat of literals", () => {
    const regexp = "ab";
    const ast = parse(regexp);
    const nfa = createNfaFromAst(ast);
    assert(nfa.run("ab"));
    assert(!nfa.run("a"));
    assert(!nfa.run("abc"));
  });
});
