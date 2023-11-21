import { parse } from "@sosukesuzuki/oregexp-parser";
import { compile } from "./vm/compile.js";
import { VM } from "./vm/vm.js";

export function createNewRegex(regexp: string) {
  const expression = parse(regexp);
  const instructions = compile(expression);
  return (value: string) => {
    const vm = new VM(value, instructions);
    return vm.run();
  };
}
