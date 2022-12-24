import type { Expression, LiteralExpression } from "./ast.js";
import { concatExpr, selectExpr, starExpr, literalExpr } from "./ast.js";

const tokenTypes = {
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

class Tokenizer {
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

  lookahead(): TokenizerState {
    const newState = this.getNewState(this.value[this.position + 1]);
    return newState;
  }
}

/**
 * <select> = <concat> \| <concat> | <concat>
 * <concat> = <star><star> | <star>
 * <star>   = <escape>* | <escape>
 * <factor> = (<select>) | <escape>
 * <escape> = \<literal> | <literal>
 * <literal> = \w
 */

export class Parser {
  private tokenizer: Tokenizer;

  constructor(value: string) {
    this.tokenizer = new Tokenizer(value);
  }

  parse(): Expression {
    return this.parseSelectExpression();
  }

  parseSelectExpression(): Expression {
    const left = this.parseConcatExpression();
    if (this.tokenizer.match(tokenTypes.select)) {
      this.tokenizer.next();
      const right = this.parseConcatExpression();
      return selectExpr(left, right);
    }
    return left;
  }

  parseConcatExpression(): Expression {
    const left = this.parseStarExpression();
    if (
      this.tokenizer.match(tokenTypes.char) ||
      this.tokenizer.match(tokenTypes.open)
    ) {
      if (this.tokenizer.match(tokenTypes.open)) {
        this.tokenizer.next();
      }
      const right = this.parseStarExpression();
      return concatExpr(left, right);
    }
    return left;
  }

  parseStarExpression(): Expression {
    const expr = this.parseEscapeExpression();
    if (this.tokenizer.match(tokenTypes.star)) {
      this.tokenizer.next();
      return starExpr(expr);
    }
    return expr;
  }

  parseFactor(): Expression {
    if (this.tokenizer.match(tokenTypes.open)) {
      this.tokenizer.next();
      const expression = this.parseSelectExpression();
      if (this.tokenizer.match(tokenTypes.close)) {
        this.tokenizer.next();
        return expression;
      } else {
        throw new Error("Something wrong");
      }
    }
    return this.parseEscapeExpression();
  }

  parseEscapeExpression(): Expression {
    if (this.tokenizer.match(tokenTypes.escape)) {
      this.tokenizer.next();
      return this.parseLiteral();
    }
    return this.parseLiteral();
  }

  parseLiteral(): LiteralExpression {
    if (
      this.tokenizer.match(tokenTypes.char) &&
      this.tokenizer.state.type === tokenTypes.char
    ) {
      const value = this.tokenizer.state.value;
      this.tokenizer.next();
      return literalExpr(value);
    }
    console.error(JSON.stringify(this.tokenizer));
    throw new Error("Something wrong.");
  }
}
