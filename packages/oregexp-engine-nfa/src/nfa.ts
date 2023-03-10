import assert from "node:assert/strict";

// ε遷移を表す
export const e = "__e__";

type StateLabel = string;

export type NfaState = {
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

function isSameArray<T>(arr1: Array<T>, arr2: Array<T>) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

export class Nfa {
  #currentStates: NfaState[] = [];
  #states: NfaState[];

  static #counter = 0;

  constructor(states: NfaState[]) {
    if (process.env.NODE_ENV !== "production") {
      validateStates(states);
    }
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

  #readEpsilon() {
    let shouldLoop = true;
    const getNextEStates = (label: string): string[] => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validateStates で検証してあるため
      const state = this.#states.find((state) => state.label === label)!;
      const eStates = state.transitionRules[e];
      if (eStates && eStates.length > 0) {
        shouldLoop = true;
        return eStates;
      }
      return [label];
    };
    while (shouldLoop) {
      const nextStateLabels: string[] = [];
      const currentStateLabels: string[] = [];
      for (const currentState of this.#currentStates) {
        nextStateLabels.push(...getNextEStates(currentState.label));
        currentStateLabels.push(currentState.label);
      }
      if (isSameArray(currentStateLabels, nextStateLabels)) {
        shouldLoop = false;
      }
      this.#currentStates = this.#getStatesFromLabel(nextStateLabels);
    }
  }

  public read(char: string) {
    if (process.env.NODE_ENV !== "production") {
      assert(char === "" || /\w/.test(char));
    }

    this.#readEpsilon();

    if (char !== "") {
      const nextStateLabels = this.#currentStates
        .flatMap((state) => {
          return state.transitionRules[char];
        })
        .filter(Boolean);

      const nextStates = this.#getStatesFromLabel(nextStateLabels);
      this.#currentStates = nextStates;
    }

    this.#readEpsilon();
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

  public static concat(nfa1: Nfa, nfa2: Nfa): Nfa {
    const q1 = nfa1.#acceptedState;
    const q2 = nfa2.#initialState;
    const newQ: NfaState = {
      label: q1.label,
      transitionRules: { ...q2.transitionRules },
    };
    const states1 = [...nfa1.#states];
    const states2 = [...nfa2.#states];
    states1.pop();
    states2.shift();
    return new Nfa([...states1, newQ, ...states2]);
  }

  public static select(nfa1: Nfa, nfa2: Nfa): Nfa {
    const m3LabelPrefix = `star-${Nfa.#counter++}`;
    const m3Accepted: NfaState = {
      label: `${m3LabelPrefix}-accepted`,
      accepted: true,
      transitionRules: {},
    };

    const q0 = nfa1.#initialState;
    const q1 = nfa1.#acceptedState;
    const m1Initial: NfaState = {
      label: q0.label,
      transitionRules: q0.transitionRules,
    };
    const m1Accepted: NfaState = {
      label: q1.label,
      transitionRules: {
        [e]: [m3Accepted.label],
      },
    };

    const q2 = nfa2.#initialState;
    const q3 = nfa2.#acceptedState;
    const m2Initial: NfaState = {
      label: q2.label,
      transitionRules: q2.transitionRules,
    };
    const m2Accepted: NfaState = {
      label: q3.label,
      transitionRules: {
        [e]: [m3Accepted.label],
      },
    };

    const m3Initial: NfaState = {
      label: `${m3LabelPrefix}-initial`,
      initial: true,
      transitionRules: {
        [e]: [m1Initial.label, m2Initial.label],
      },
    };

    const state1 = [...nfa1.#states];
    const state2 = [...nfa2.#states];
    state1.shift();
    state1.pop();
    state2.shift();
    state2.pop();

    return new Nfa([
      m3Initial,
      m1Initial,
      ...state1,
      m1Accepted,
      m2Initial,
      ...state2,
      m2Accepted,
      m3Accepted,
    ]);
  }

  public static star(nfa: Nfa) {
    const q0 = nfa.#initialState;
    const q1 = nfa.#acceptedState;

    const m1Initial: NfaState = {
      label: q0.label,
      transitionRules: q0.transitionRules,
    };

    const m2LabelPrefix = `star-${Nfa.#counter++}`;
    const m2Accepted: NfaState = {
      label: `${m2LabelPrefix}-accepted`,
      accepted: true,
      transitionRules: {},
    };

    const m1Accepted: NfaState = {
      label: q1.label,
      transitionRules: {
        [e]: [m1Initial.label, m2Accepted.label],
      },
    };

    const m2Initial: NfaState = {
      label: `${m2LabelPrefix}-initial`,
      initial: true,
      transitionRules: {
        [e]: [m1Initial.label, m2Accepted.label],
      },
    };

    const states = [...nfa.#states];
    states.shift();
    states.pop();

    return new Nfa([m2Initial, m1Initial, ...states, m1Accepted, m2Accepted]);
  }
}
