import { defaultRules } from "./rules.js";

export class Validator {
  constructor(rules, db) {
    this.rules = rules;
    this.db = db;
  }

  async validate(data) {
    const errors = {};

    for (const field in this.rules) {
      const fieldRules = this.rules[field];

      for (const rule of fieldRules) {
        const { validator, message, options } = rule;
        let isValid = true;

        if (typeof validator === "function") {
          isValid = await validator(data[field], options, this.db);
        } else {
          // built-in rule
          isValid = await defaultRules[validator](
            data[field],
            options,
            this.db
          );
        }

        if (!isValid) {
          errors[field] = message;
          break;
        }
      }
    }

    return Object.keys(errors).length ? errors : null;
  }
}
