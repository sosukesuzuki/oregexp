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
  const start = [];
  const end = [];
  const body = compileNode(value.expression);
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
  const left = compileNode(value.left);
  const right = compileNode(value.right);
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
