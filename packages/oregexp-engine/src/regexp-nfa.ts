import crypto from "node:crypto";
import type {
  ConcatExpression,
  Expression,
  LiteralExpression,
  SelectExpression,
  StarExpression,
} from "@sosukesuzuki/oregexp-parser";
import { Nfa } from "./nfa.js";

export function createNfaFromAst(expression: Expression): Nfa {
  if (expression.type === "LiteralExpression") {
    return createLiteralNfa(expression);
  } else if (expression.type === "ConcatExpression") {
    return createConcatNfa(expression);
  } else if (expression.type === "StarExpression") {
    return createStarNfa(expression);
  } else if (expression.type === "SelectExpression") {
    return createSelectNfa(expression);
  }
  throw new Error(`Invalid expression type : '${JSON.stringify(expression)}'`);
}

export function createLiteralNfa(literalExpr: LiteralExpression): Nfa {
  const id = crypto.randomUUID();
  const nfa = new Nfa([
    {
      label: `${id}-0`,
      initial: true,
      transitionRules: { [literalExpr.value]: [`${id}-1`] },
    },
    {
      label: `${id}-1`,
      accepted: true,
      transitionRules: {},
    },
  ]);
  return nfa;
}

export function createConcatNfa(concatExpr: ConcatExpression): Nfa {
  const left = createNfaFromAst(concatExpr.left);
  const right = createNfaFromAst(concatExpr.right);
  const concatNfa = Nfa.concat(left, right);
  return concatNfa;
}

export function createStarNfa(starExpr: StarExpression): Nfa {}

export function createSelectNfa(selectExpr: SelectExpression): Nfa {}
