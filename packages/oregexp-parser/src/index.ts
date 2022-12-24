import { Parser } from "./parser.js";

export function parse(value: string) {
  const parser = new Parser(value);
  return parser.parse();
}

console.log(parse("(f)"));
