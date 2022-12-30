import { table } from "table";
import { NfaState } from "./nfa.js";

export function printStateTable(states: NfaState[]) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("You cannot' use this in production env");
  }
  const chars = Array.from(
    new Set(states.flatMap((state) => Object.keys(state.transitionRules)))
  );
  const stateLabels = states.map((state) => state.label);
  const rows: string[][] = [];
  for (const stateLabel of stateLabels) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const state = states.find((state) => state.label === stateLabel)!;
    let stateLabelText = stateLabel;
    if (state.accepted) {
      stateLabelText += "(accepted)";
    } else if (state.initial) {
      stateLabelText += "(initial)";
    }
    const row: string[] = [stateLabelText];
    for (const char of chars) {
      if (state.transitionRules[char]) {
        const nextStateLabels = state.transitionRules[char].join(", ");
        row.push(nextStateLabels);
      } else {
        row.push("");
      }
    }
    rows.push(row);
  }
  const header = ["", ...chars];
  const data = [header, ...rows];
  console.log(table(data));
}
