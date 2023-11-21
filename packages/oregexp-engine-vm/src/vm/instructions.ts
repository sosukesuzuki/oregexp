const instructionCodes = {
  char: 0b00,
  match: 0b01,
  jmp: 0b10,
  split: 0b11,
} as const;

type InstructionChar = {
  code: typeof instructionCodes.char;
  char: string;
};

type InstructionMatch = {
  code: typeof instructionCodes.match;
};

type InstructionJmp = {
  code: typeof instructionCodes.jmp;
  offset: number;
};

type InstructionSplit = {
  code: typeof instructionCodes.split;
  offset1: number;
  offset2: number;
};

type Instruction =
  | InstructionChar
  | InstructionMatch
  | InstructionJmp
  | InstructionSplit;

export {
  Instruction,
  instructionCodes,
  InstructionChar,
  InstructionMatch,
  InstructionJmp,
  InstructionSplit,
};
