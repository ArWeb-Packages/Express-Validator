import { defaultRules } from "./rules.js";

export class Validator {
  /**
   * @param {Object} rules - Validation rules per field
   * @param {Object} db - Database connection
   * @param {Object} options - Global options like { errorStrategy: 'first' | 'all' }
   */
  constructor(rules, { type, client }, options = {}) {
    this.rules = rules;
    this.db = { type, client };
    this.options = {
      errorStrategy: options.errorStrategy || "first", // 'first' | 'all'
      ...options,
    };
    this.customRules = {}; // developers can add custom rules
  }

  /**
   * Add custom validator dynamically
   */
  addRule(name, fn) {
    if (typeof fn !== "function") {
      throw new Error("Custom validator must be a function");
    }
    this.customRules[name] = fn;
  }

  /**
   * Main validation function
   */
  async validate(data) {
    const errors = {};

    for (const field in this.rules) {
      const fieldRules = this.rules[field];

      for (const rule of fieldRules) {
        const { validator, message, options: ruleOptions = {} } = rule;
        let isValid = true;

        if (typeof validator === "function") {
          isValid = await validator(data[field], ruleOptions, this.db);
        } else if (this.customRules[validator]) {
          isValid = await this.customRules[validator](
            data[field],
            ruleOptions,
            this.db
          );
        } else if (defaultRules[validator]) {
          isValid = await defaultRules[validator](
            data[field],
            ruleOptions,
            this.db
          );
        } else {
          throw new Error(`Validator "${validator}" not found`);
        }

        if (!isValid) {
          if (this.options.errorStrategy === "first") {
            errors[field] = message;
            break;
          } else if (this.options.errorStrategy === "all") {
            if (!errors[field]) errors[field] = [];
            errors[field].push(message);
          }
        }
      }
    }

    return Object.keys(errors).length ? errors : null;
  }
}
