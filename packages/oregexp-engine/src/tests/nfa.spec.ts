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

  it("works for /abc/", () => {
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

  it("works for /(ab)*c/", () => {
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
    nfa.read("a");
    assert(!nfa.accepted);
    nfa.read("b");
    nfa.read("a");
    nfa.read("b");
    nfa.read("c");
    assert(nfa.accepted);

    nfa.reset();

    assert(!nfa.accepted);
    nfa.read("c");
    assert(nfa.accepted);

    nfa.reset();

    assert(!nfa.accepted);
    assert(nfa.run("c"));
    assert(nfa.run("abababababababc"));
  });

  it("works for ε-ε-a", () => {
    const nfa = new Nfa([
      {
        label: "q0",
        initial: true,
        transitionRules: {
          [e]: ["q1"],
        },
      },
      {
        label: "q1",
        transitionRules: {
          [e]: ["q2"],
        },
      },
      {
        label: "q2",
        transitionRules: {
          a: ["q3"],
        },
      },
      {
        label: "q3",
        transitionRules: {},
        accepted: true,
      },
    ]);
    assert(!nfa.accepted);
    nfa.read("a");
    assert(nfa.accepted);
  });

  it("works for /(a|b)c/", () => {
    const nfa = new Nfa([
      {
        label: "q0",
        initial: true,
        transitionRules: {
          [e]: ["q1", "q2"],
        },
      },
      {
        label: "q1",
        transitionRules: {
          a: ["q3"],
        },
      },
      {
        label: "q2",
        transitionRules: {
          b: ["q4"],
        },
      },
      {
        label: "q3",
        transitionRules: {
          [e]: ["q5"],
        },
      },
      {
        label: "q4",
        transitionRules: {
          [e]: ["q5"],
        },
      },
      {
        label: "q5",
        transitionRules: {
          c: ["q6"],
        },
      },
      {
        label: "q6",
        accepted: true,
        transitionRules: {},
      },
    ]);
    assert(!nfa.accepted);
    assert(nfa.run("ac"));
    assert(nfa.run("bc"));
    assert(!nfa.run("abc"));
  });

  it("works for concat", () => {
    const nfa1 = new Nfa([
      {
        label: "q0",
        initial: true,
        transitionRules: {
          a: ["q1"],
        },
      },
      {
        label: "q1",
        accepted: true,
        transitionRules: {},
      },
    ]);
    const nfa2 = new Nfa([
      {
        label: "q2",
        initial: true,
        transitionRules: {
          b: ["q3"],
        },
      },
      {
        label: "q3",
        accepted: true,
        transitionRules: {},
      },
    ]);
    const nfa3 = Nfa.concat(nfa1, nfa2);
    assert(!nfa3.accepted);
    nfa3.read("a");
    assert(!nfa3.accepted);
    nfa3.read("b");
    assert(nfa3.accepted);
  });

  it("works for select", () => {
    const nfa1 = new Nfa([
      {
        label: "q0",
        initial: true,
        transitionRules: {
          a: ["q1"],
        },
      },
      {
        label: "q1",
        accepted: true,
        transitionRules: {},
      },
    ]);
    const nfa2 = new Nfa([
      {
        label: "q2",
        initial: true,
        transitionRules: {
          b: ["q3"],
        },
      },
      {
        label: "q3",
        accepted: true,
        transitionRules: {},
      },
    ]);
    const nfa3 = Nfa.select(nfa1, nfa2);

    assert(!nfa3.accepted);
    nfa3.read("a");
    assert(nfa3.accepted);
    nfa3.reset();

    assert(!nfa3.accepted);
    nfa3.read("b");
    assert(nfa3.accepted);
    nfa3.reset();

    assert(!nfa3.accepted);
    nfa3.read("c");
    assert(!nfa3.accepted);
    nfa3.reset();
  });
});
