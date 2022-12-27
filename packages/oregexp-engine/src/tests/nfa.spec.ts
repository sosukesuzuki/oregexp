import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Nfa } from "../nfa.js";

describe("nfa", () => {
  it("validates invalid nfa states", () => {
    assert.throws(
      () => {
        new Nfa([{ label: "foo" }, { label: "bar" }], /* transition */ {});
      },
      {
        message:
          "The number of accepted states is invalid. Expected: 1, Actual: 0\n" +
          "The number of initial states is invalid. Expected: 1, Actual: 0\n",
      }
    );
  });

  assert.throws(
    () => {
      new Nfa(
        [{ label: "foo", initial: true }, { label: "bar" }],
        /* transition */ {}
      );
    },
    {
      message:
        "The number of accepted states is invalid. Expected: 1, Actual: 0\n",
    }
  );

  assert.throws(
    () => {
      new Nfa(
        [{ label: "foo", accepted: true }, { label: "bar" }],
        /* transition */ {}
      );
    },
    {
      message:
        "The number of initial states is invalid. Expected: 1, Actual: 0\n",
    }
  );
});
