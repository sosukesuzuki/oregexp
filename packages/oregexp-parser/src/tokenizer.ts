export const tokenTypes = {
  select: "select",
  star: "star",
  escape: "escape",
  open: "open",
  close: "close",
  char: "char",
} as const;

type TokenizerState =
  | { type: undefined; value: undefined }
  | {
      type: Exclude<keyof typeof tokenTypes, "char">;
      value: undefined;
    }
  | {
      type: typeof tokenTypes.char;
      value: string;
    };

export class Tokenizer {
  private value: string;
  private position = 0;

  public state: TokenizerState = {
    type: undefined,
    value: undefined,
  };

  constructor(value: string) {
    this.value = value;
    this.setState(this.value[this.position]);
  }

  private getNewState(value?: string): TokenizerState {
    if (value == null) {
      return {
        type: undefined,
        value: undefined,
      };
    }
    switch (value) {
      case "*": {
        return {
          type: tokenTypes.star,
          value: undefined,
        };
      }
      case "\\": {
        return {
          type: tokenTypes.escape,
          value: undefined,
        };
      }
      case "|": {
        return {
          type: tokenTypes.select,
          value: undefined,
        };
      }
      case "(": {
        return {
          type: tokenTypes.open,
          value: undefined,
        };
      }
      case ")": {
        return {
          type: tokenTypes.close,
          value: undefined,
        };
      }
    }
    if (/\W/.test(value)) {
      throw new Error(`oregexp doesn't support "${value}".`);
    }
    return {
      type: tokenTypes.char,
      value,
    };
  }

  private setState(value?: string) {
    this.state = this.getNewState(value);
  }

  match(tokenType: keyof typeof tokenTypes): boolean {
    return this.state.type === tokenType;
  }

  next(): void {
    const nextValue = this.value[++this.position];
    this.setState(nextValue);
  }
}
