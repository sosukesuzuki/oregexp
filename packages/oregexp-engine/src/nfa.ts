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
  private currentStates: NfaState[];

  constructor(private states: NfaState[], private transition: Transition) {
    if (process.env.NODE_ENV !== "production") {
      validateStates(states);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validateStates で検証してあるため
    const initialState = states.find((state) => state.initial)!;
    this.currentStates = [initialState];
  }

  public read(char: string | typeof e) {
    if (process.env.NODE_ENV !== "production") {
      assert(char === e || /\w/.test(char));
    }
    const transitionRules: TransitionRule[] = [];

    // TODO: report to Prettier
    for (const [stateLabel, transitionRule] of Object.entries(
      this.transition
    )) {
      const rules = this.currentStates
        .map((currentState) => {
          if (currentState.label === stateLabel) {
            return transitionRule;
          }
        })
        .filter(Boolean) as TransitionRule[];
      transitionRules.push(...rules);
    }

    const nextStateLabels: StateLabel[] = [];
    for (const transitionRule of transitionRules) {
      const labels = transitionRule[char];
      nextStateLabels.push(...labels);
    }
    const nextStates = this.states.filter((state) =>
      nextStateLabels.includes(state.label)
    );

    this.currentStates = nextStates;
  }

  public get accepted(): boolean {
    return this.currentStates.some((currentState) => currentState.accepted);
  }
}
