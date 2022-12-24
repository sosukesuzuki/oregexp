import { Parser } from "./parser.js";
export * from "./ast.js";

export function parse(value: string) {
  const parser = new Parser(value);
  return parser.parse();
}
