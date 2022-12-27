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
  private currentStates: NfaState[];

  constructor(private states: NfaState[]) {
    if (process.env.NODE_ENV !== "production") {
      validateStates(states);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validateStates で検証してあるため
    const initialState = states.find((state) => state.initial)!;
    this.currentStates = [initialState];
  }

  private getStatesFromLabel(stateLabels: string[]): NfaState[] {
    return this.states.filter((state) => stateLabels.includes(state.label));
  }

  public read(char: string) {
    if (process.env.NODE_ENV !== "production") {
      assert(/\w/.test(char));
    }

    const eStateLabels = this.currentStates
      .flatMap((state) => {
        return state.transitionRules[e];
      })
      .filter(Boolean);
    if (eStateLabels.length > 0) {
      const eStates = this.getStatesFromLabel(eStateLabels);
      this.currentStates = eStates;
    }

    const nextStateLabels = this.currentStates
      .flatMap((state) => {
        return state.transitionRules[char];
      })
      .filter(Boolean);

    const nextStates = this.getStatesFromLabel(nextStateLabels);
    this.currentStates = nextStates;
  }

  public get accepted(): boolean {
    return this.currentStates.some((currentState) => currentState.accepted);
  }
}
