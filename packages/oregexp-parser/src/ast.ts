export interface StarExpression {
  type: "StarExpression";
  expression: Expression;
}

export interface SelectExpression {
  type: "SelectExpression";
  left: Expression;
  right: Expression;
}

export interface ConcatExpression {
  type: "ConcatExpression";
  left: Expression;
  right: Expression;
}

export interface LiteralExpression {
  type: "LiteralExpression";
  value: string;
}

export type Expression =
  | StarExpression
  | SelectExpression
  | ConcatExpression
  | LiteralExpression;

export function starExpr(expression: Expression): StarExpression {
  return {
    type: "StarExpression",
    expression,
  };
}

export function selectExpr(
  left: Expression,
  right: Expression
): SelectExpression {
  return {
    type: "SelectExpression",
    left,
    right,
  };
}

export function concatExpr(
  left: Expression,
  right: Expression
): ConcatExpression {
  return {
    type: "ConcatExpression",
    left,
    right,
  };
}

export function literalExpr(value: string): LiteralExpression {
  return {
    type: "LiteralExpression",
    value,
  };
}
