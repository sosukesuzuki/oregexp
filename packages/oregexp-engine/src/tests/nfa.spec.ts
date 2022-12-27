import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { e, Nfa } from "../nfa.js";

describe("nfa", () => {
  it("validates invalid nfa states", () => {
    assert.throws(() => {
      new Nfa([
        { label: "foo", transitionRules: {} },
        { label: "bar", transitionRules: {} },
      ]);
    });
    assert.throws(() => {
      new Nfa([
        { label: "foo", initial: true, transitionRules: {} },
        { label: "bar", transitionRules: {} },
      ]);
    });
    assert.throws(() => {
      new Nfa([
        { label: "foo", accepted: true, transitionRules: {} },
        { label: "bar", transitionRules: {} },
      ]);
    });
  });

  it("works with the simplest NFA", () => {
    // 正規表現 "abc" と等価の NFA
    const nfa = new Nfa([
      {
        label: "q0",
        initial: true,
        transitionRules: {
          a: ["q1"],
        },
      },
      {
        label: "q1",
        transitionRules: {
          b: ["q2"],
        },
      },
      {
        label: "q2",
        transitionRules: {
          c: ["q3"],
        },
      },
      { label: "q3", accepted: true, transitionRules: {} },
    ]);
    nfa.read("a");
    assert(!nfa.accepted);
    nfa.read("b");
    assert(!nfa.accepted);
    nfa.read("c");
    assert(nfa.accepted);
    nfa.read("d");
    assert(!nfa.accepted);
  });

  it("foo", () => {
    const nfa = new Nfa([
      {
        label: "q0",
        initial: true,
        transitionRules: { [e]: ["q1", "q4"] },
      },
      {
        label: "q1",
        transitionRules: { a: ["q2"] },
      },
      {
        label: "q2",
        transitionRules: { b: ["q3"] },
      },
      {
        label: "q3",
        transitionRules: { [e]: ["q1", "q4"] },
      },
      {
        label: "q4",
        transitionRules: { c: ["q5"] },
      },
      {
        label: "q5",
        transitionRules: {},
        accepted: true,
      },
    ]);
    assert(!nfa.accepted);
    nfa.read("a");
    nfa.read("b");
    nfa.read("c");
    assert(nfa.accepted);
  });
});
