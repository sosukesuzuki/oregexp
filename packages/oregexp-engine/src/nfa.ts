import assert from "node:assert/strict";

// ε遷移を表す
export const e = Symbol("epsilon");

type StateLabel = string;

type NfaState = {
  label: StateLabel;
  accepted?: boolean;
  initial?: boolean;
  transitionRules: Record<string | symbol, string[]>;
};

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
  #currentStates: NfaState[] = [];
  #states: NfaState[];

  constructor(states: NfaState[]) {
    if (process.env.NODE_ENV !== "production") {
      validateStates(states);
    }
    this.#states = states;
    this.reset();
  }

  public reset() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validateStates で検証してあるため
    const initialState = this.#states.find((state) => state.initial)!;
    this.#currentStates = [initialState];
  }

  #getStatesFromLabel(stateLabels: string[]): NfaState[] {
    return this.#states.filter((state) => stateLabels.includes(state.label));
  }

  public read(char: string) {
    if (process.env.NODE_ENV !== "production") {
      assert(/\w/.test(char));
    }

    const eStateLabels = this.#currentStates
      .flatMap((state) => {
        return state.transitionRules[e];
      })
      .filter(Boolean);
    if (eStateLabels.length > 0) {
      const eStates = this.#getStatesFromLabel(eStateLabels);
      this.#currentStates = eStates;
    }

    const nextStateLabels = this.#currentStates
      .flatMap((state) => {
        return state.transitionRules[char];
      })
      .filter(Boolean);

    const nextStates = this.#getStatesFromLabel(nextStateLabels);
    this.#currentStates = nextStates;
  }

  public run(str: string): boolean {
    try {
      for (const char of str) {
        this.read(char);
      }
      return this.accepted;
    } finally {
      this.reset();
    }
  }

  public get accepted(): boolean {
    return this.#currentStates.some((currentState) => currentState.accepted);
  }

  // nfa1 の accepted と nfa2 の initial をそのまま重ねた新しい NFA を返す
  public static concat(nfa1: Nfa, nfa2: Nfa): Nfa {
    const nfa1States = nfa1.#states;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validateStates で検証してあるため
    const nfa1Accepted = nfa1States.find((state) => state.accepted)!;
    nfa1Accepted.accepted = undefined;

    const nfa2States = nfa2.#states;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validateStates で検証してあるため
    const nfa2Initial = nfa2States.find((state) => state.initial)!;
    nfa2Initial.initial = undefined;

    for (const state of nfa1States) {
      const mapper = (stateLabel: string) =>
        stateLabel === nfa1Accepted.label ? nfa2Initial.label : stateLabel;
      state.transitionRules[e] = state.transitionRules[e]?.map(mapper);
      for (const key of Object.keys(state.transitionRules)) {
        state.transitionRules[key] = state.transitionRules[key]?.map(mapper);
      }
    }
    // nfa1Accepted を取り除く
    nfa1States.pop();
    return new Nfa([...nfa1States, ...nfa2States]);
  }
}
