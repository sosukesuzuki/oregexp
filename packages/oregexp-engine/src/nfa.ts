import assert from "node:assert/strict";

// ε遷移を表す
export const e = "__e__";

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

    let shouldLoopForE = true;
    while (shouldLoopForE) {
      const eStateLabels = this.#currentStates
        .flatMap((state) => {
          return state.transitionRules[e];
        })
        .filter(Boolean);
      if (eStateLabels.length > 0) {
        const eStates = this.#getStatesFromLabel(eStateLabels);
        this.#currentStates = eStates;
      } else {
        shouldLoopForE = false;
      }
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
}
