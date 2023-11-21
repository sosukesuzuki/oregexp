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
  return [...compile(value.left), ...compile(value.right)];
}

// compile a*
function compileStar(value: StarExpression): Instruction[] {
  const start = [];
  const end = [];
  const body = compile(value.expression);
  const bodyLength = body.length;
  const startOffset = 1 + bodyLength + 2;
  const endOffset = 1 + bodyLength + 2;
  start.push({
    code: instructionCodes.split,
    offset1: startOffset,
    offset2: endOffset,
  });
  for (const instruction of body) {
    start.push(instruction);
  }
  start.push({
    code: instructionCodes.jmp,
    offset: -startOffset,
  });
  end.push({
    code: instructionCodes.jmp,
    offset: -endOffset,
  });
  return [...start, ...end];
}

function compileSelect(value: SelectExpression): Instruction[] {
  const start = [];
  const end = [];
  const left = compile(value.left);
  const right = compile(value.right);
  const leftLength = left.length;
  const rightLength = right.length;
  const startOffset = 1 + leftLength + 2;
  const endOffset = 1 + rightLength + 1;
  start.push({
    code: instructionCodes.split,
    offset1: startOffset,
    offset2: endOffset,
  });
  for (const instruction of left) {
    start.push(instruction);
  }
  start.push({
    code: instructionCodes.jmp,
    offset: -startOffset,
  });
  for (const instruction of right) {
    end.push(instruction);
  }
  end.push({
    code: instructionCodes.jmp,
    offset: -endOffset,
  });
  return [...start, ...end];
}

function compile(ast: Expression): Instruction[] {
  switch (ast.type) {
    case "LiteralExpression":
      return compileLiteral(ast).concat({ code: instructionCodes.match });
    case "ConcatExpression":
      return compileConcat(ast).concat({ code: instructionCodes.match });
    case "StarExpression":
      return compileStar(ast).concat({ code: instructionCodes.match });
    case "SelectExpression":
      return compileSelect(ast).concat({ code: instructionCodes.match });
  }
}

export { compile };
