import assert from "node:assert/strict";

// ステートの集合
//   初期状態
//   受理状態
// 遷移関数

// ε遷移を表す
export const e = Symbol("epsilon");

type StateLabel = string;

type NfaState = {
  label: StateLabel;
  accepted?: boolean;
  initial?: boolean;
};

type TransitionRule = Record<
  /* 入力文字(length=0) もしくは ε */ string | typeof e,
  StateLabel[]
>;

type Transition = Record<StateLabel, TransitionRule>;

function validateStates(states: NfaState[]) {
  let acceptedCount = 0;
  let initialCount = 0;
  for (const state of states) {
    if (state.accepted) {
      acceptedCount++;
    }
    if (state.initial) {
      initialCount++;
    }
  }
  assert(acceptedCount === 1);
  assert(initialCount === 1);
}

export class Nfa {
  constructor(private states: NfaState[], private transition: Transition) {
    if (process.env.NODE_ENV !== "production") {
      validateStates(states);
    }
  }
}
