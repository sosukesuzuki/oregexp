import {
  ConcatExpression,
  Expression,
  LiteralExpression,
  StarExpression,
  SelectExpression,
} from "@sosukesuzuki/oregexp-parser";
import { Instruction, instructionCodes } from "./instructions.js";

function compileLiteral(value: LiteralExpression): Instruction[] {
  return [
    {
      code: instructionCodes.char,
      char: value.value,
    },
  ];
}

function compileConcat(value: ConcatExpression): Instruction[] {
  return [...compileNode(value.left), ...compileNode(value.right)];
}

// compile a*
function compileStar(value: StarExpression): Instruction[] {
  // L1: split L2, L3
  // L2: compileNode(value.expression)
  //     jmp L1
  // L3:

  const instructions: Instruction[] = [];

  const l2 = compileNode(value.expression);

  const l1 = {
    code: instructionCodes.split,
    offset1: 1,
    offset2: l2.length + 2,
  };

  instructions.push(l1);

  for (const instruction of l2) {
    instructions.push(instruction);
  }

  instructions.push({
    code: instructionCodes.jmp,
    offset: -(l2.length + 1),
  });

  return instructions;
}

function compileSelect(value: SelectExpression): Instruction[] {
  // split L1, L2
  // L1: compileNode(value.left)
  //     jmp L3
  // L2: compileNode(value.right)
  // L3:

  const instructions: Instruction[] = [];

  const l1 = compileNode(value.left);
  const l2 = compileNode(value.right);

  const l1Offset = 1;
  const l2Offset = l1Offset + l1.length + 1;

  instructions.push({
    code: instructionCodes.split,
    offset1: l1Offset,
    offset2: l2Offset,
  });

  for (const instruction of l1) {
    instructions.push(instruction);
  }

  instructions.push({
    code: instructionCodes.jmp,
    offset: l2.length + 1,
  });

  for (const instruction of l2) {
    instructions.push(instruction);
  }

  return instructions;
}

function compileNode(ast: Expression): Instruction[] {
  switch (ast.type) {
    case "LiteralExpression":
      return compileLiteral(ast);
    case "ConcatExpression":
      return compileConcat(ast);
    case "StarExpression":
      return compileStar(ast);
    case "SelectExpression":
      return compileSelect(ast);
  }
}

function compile(ast: Expression): Instruction[] {
  const result = compileNode(ast).concat({ code: instructionCodes.match });
  return result;
}

export { compile };
