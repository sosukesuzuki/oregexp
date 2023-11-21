import {
  instructionCodes,
  Instruction,
  InstructionChar,
  InstructionMatch,
  InstructionJmp,
  InstructionSplit,
} from "./instructions.js";

class VMStack {
  constructor(
    private stack: {
      programCounter: number;
      stringPointer: number;
    }[] = []
  ) {}

  push(programCounter: number, stringPointer: number) {
    this.stack.push({ programCounter, stringPointer });
  }

  pop() {
    return this.stack.pop();
  }
}

class VM {
  private programCounter: number;
  private stringPointer: number;
  private value: string;
  private instructions: Instruction[];
  private stack: VMStack;

  constructor(value: string, instructions: Instruction[]) {
    this.programCounter = 0;
    this.stringPointer = 0;
    this.value = value;
    this.instructions = instructions;
    this.stack = new VMStack();
  }

  private get instruction() {
    return this.instructions[this.programCounter];
  }

  private get char() {
    return this.value[this.stringPointer];
  }

  public run(): boolean {
    while (this.programCounter < this.instructions.length) {
      let result = false;
      if (this.instruction.code === instructionCodes.match) {
        return true;
      } else if (this.instruction.code === instructionCodes.char) {
        result = this.instructionChar(this.instruction);
      } else if (this.instruction.code === instructionCodes.jmp) {
        result = this.instructionJmp(this.instruction);
      } else if (this.instruction.code === instructionCodes.split) {
        result = this.instructionSplit(this.instruction);
      }

      if (!result) {
        const stackValue = this.stack.pop();
        if (stackValue) {
          this.programCounter = stackValue.programCounter;
          this.stringPointer = stackValue.stringPointer;
        } else {
          return false;
        }
      }
    }
    return true;
  }

  private instructionChar(instruction: InstructionChar): boolean {
    if (instruction.char === this.char) {
      this.stringPointer++;
      this.programCounter++;
      return true;
    } else {
      return false;
    }
  }

  private instructionJmp(instruction: InstructionJmp): boolean {
    this.programCounter += instruction.offset;
    return true;
  }

  private instructionSplit(instruction: InstructionSplit): boolean {
    this.stack.push(
      this.programCounter + instruction.offset1,
      this.stringPointer
    );
    this.programCounter += instruction.offset2;
    return true;
  }
}

export { VM };
