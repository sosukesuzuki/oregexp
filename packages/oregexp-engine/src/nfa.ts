import crypto from "node:crypto";
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
    console.log("=============");
    this.#states = states;
    this.reset();
  }

  public reset() {
    this.#currentStates = [this.#initialState];
  }

  get #initialState() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validateStates で検証してあるため
    return this.#states.find((state) => state.initial)!;
  }

  get #acceptedState() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validateStates で検証してあるため
    return this.#states.find((state) => state.accepted)!;
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
    const nfa1Accepted = nfa1.#acceptedState;
    nfa1Accepted.accepted = undefined;

    const nfa2States = nfa2.#states;
    const nfa2Initial = nfa2.#initialState;
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

  //   public static select(nfa1: Nfa, nfa2: Nfa): Nfa {
  //     const baseId = crypto.randomUUID();
  //     const initialState: NfaState = {
  //       initial: true,
  //       label: `${baseId}-0`,
  //       transitionRules: {
  //         [e]: [nfa1.#initialState.label, nfa2.#initialState.label],
  //       },
  //     };
  //     const finalStateLabel = `${baseId}-1`;
  //     const finalState: NfaState = {
  //       accepted: true,
  //       label: finalStateLabel,
  //       transitionRules: {},
  //     };

  //     nfa1.#acceptedState.transitionRules = {
  //       [e]: [finalStateLabel],
  //     };
  //     nfa2.#acceptedState.transitionRules = {
  //       [e]: [finalStateLabel],
  //     };

  //     nfa1.#initialState.initial = undefined;
  //     nfa2.#initialState.initial = undefined;
  //     nfa1.#acceptedState.accepted = undefined;
  //     nfa2.#acceptedState.accepted = undefined;

  //     return new Nfa([
  //       initialState,
  //       ...nfa1.#states,
  //       ...nfa2.#states,
  //       finalState,
  //     ]);
  //   }
}
