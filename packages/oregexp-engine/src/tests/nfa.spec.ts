import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { e, Nfa } from "../nfa.js";

describe("nfa", () => {
  it("validates invalid nfa states", () => {
    assert.throws(() => {
      new Nfa([{ label: "foo" }, { label: "bar" }], /* transition */ {});
    });
    assert.throws(() => {
      new Nfa(
        [{ label: "foo", initial: true }, { label: "bar" }],
        /* transition */ {}
      );
    });
    assert.throws(() => {
      new Nfa(
        [{ label: "foo", accepted: true }, { label: "bar" }],
        /* transition */ {}
      );
    });
  });

  it("works with the simplest NFA", () => {
    // 正規表現 "abc" と等価の NFA
    const nfa = new Nfa(
      [
        { label: "q0", initial: true },
        { label: "q1" },
        { label: "q2" },
        { label: "q3", accepted: true },
      ],
      {
        q0: { a: ["q1"], [e]: [] },
        q1: { b: ["q2"], [e]: [] },
        q2: { c: ["q3"], [e]: [] },
      }
    );
    nfa.read("a");
    assert(!nfa.accepted);
    nfa.read("b");
    assert(!nfa.accepted);
    nfa.read("c");
    assert(nfa.accepted);
  });
});
