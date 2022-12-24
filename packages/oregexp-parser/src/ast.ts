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
