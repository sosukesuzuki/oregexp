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

  private parseSelectExpression(): Expression {
    let node = this.parseConcatExpression();
    for (;;) {
      if (this.tokenizer.match(tokenTypes.select)) {
        this.tokenizer.next();
        node = selectExpr(node, this.parseConcatExpression());
      } else {
        return node;
      }
    }
  }

  private parseConcatExpression(): Expression {
    let node = this.parseStarExpression();
    for (;;) {
      if (this.tokenizer.match(tokenTypes.char)) {
        node = concatExpr(node, this.parseStarExpression());
      } else if (this.tokenizer.match(tokenTypes.open)) {
        const right = this.parseConcatExpression();
        node = concatExpr(node, right);
      } else {
        return node;
      }
    }
  }

  private parseStarExpression(): Expression {
    const expr = this.parseFactor();
    if (this.tokenizer.match(tokenTypes.star)) {
      this.tokenizer.next();
      return starExpr(expr);
    }
    return expr;
  }

  private parseFactor(): Expression {
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
    return this.parseLiteral();
  }

  private parseLiteral(): LiteralExpression {
    if (
      this.tokenizer.match(tokenTypes.char) &&
      this.tokenizer.state.type === tokenTypes.char
    ) {
      const value = this.tokenizer.state.value;
      this.tokenizer.next();
      return literalExpr(value);
    }
    throw new Error("Something wrong");
  }
}
