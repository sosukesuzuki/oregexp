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

  public read(char: string) {
    if (process.env.NODE_ENV !== "production") {
      assert(/\w/.test(char));
    }
    const nextStateLabels: string[] = [];

    // currentStates が持ってる ε    の結果の state 集合を nextStates に push する
    const eStateLabels = this.currentStates.flatMap((state) => {
      return state.transitionRules[e];
    });
    nextStateLabels.push(...eStateLabels);

    // currentStetes が持ってる char の結果の state 集合を nextStates に push する
    const charStateLabels = this.currentStates.flatMap((state) => {
      return state.transitionRules[char];
    });
    nextStateLabels.push(...charStateLabels);

    const nextStates = this.states.filter((state) =>
      nextStateLabels.includes(state.label)
    );
    this.currentStates = nextStates;
  }

  public get accepted(): boolean {
    return this.currentStates.some((currentState) => currentState.accepted);
  }
}
