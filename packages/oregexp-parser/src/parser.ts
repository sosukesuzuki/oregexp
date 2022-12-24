import type { Expression, LiteralExpression } from "./ast.js";
import { concatExpr, selectExpr, starExpr, literalExpr } from "./ast.js";
import { Tokenizer, tokenTypes } from "./tokenizer.js";

/**
 * <expr>   = <select>
 * <select> = <select> \| <concat> | <concat>
 * <concat> = <concat><star> | <star>
 * <star>   = <factor>* | <factor>
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
      const right = this.parseSelectExpression();
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
      const right = this.parseConcatExpression();
      return concatExpr(left, right);
    }
    return left;
  }

  parseStarExpression(): Expression {
    const expr = this.parseFactor();
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
    return this.parseEscapedLiteral();
  }

  parseEscapedLiteral(): Expression {
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
