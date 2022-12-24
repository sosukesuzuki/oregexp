import { Expression } from "@sosukesuzuki/oregexp-parser";

export function traverse(
  expression: Expression,
  callback: (expression: Expression) => void
): void {
  callback(expression);
  if (expression.type === "ConcatExpression") {
    traverse(expression.left, callback);
    traverse(expression.right, callback);
  } else if (expression.type === "SelectExpression") {
    traverse(expression.left, callback);
    traverse(expression.right, callback);
  } else if (expression.type === "StarExpression") {
    traverse(expression.expression, callback);
  }
}
