import { parse } from "@sosukesuzuki/oregexp-parser";
import { createNfaFromAst } from "./regexp-nfa.js";

export function createNewRegex(regexp: string) {
  const ast = parse(regexp);
  const nfa = createNfaFromAst(ast);
  return (value: string) => nfa.run(value);
}
