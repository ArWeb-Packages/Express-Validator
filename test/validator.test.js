import test from "node:test";
import assert from "node:assert";
import { Validator } from "../src/index.js";

// Mock DB client
const db = {
  type: "mock",
  client: {},
};

// Mock DB rules behavior
const mockDb = {
  exists: async (value, collection, field, db, exclude) => {
    // Pretend "taken@example.com" and "takenuser" exist
    if (
      (field === "username" && value === "takenuser") ||
      (field === "email" && value === "taken@example.com")
    ) {
      return true;
    }
    return false;
  },
  unique: async (value, collection, field, db, exclude) => {
    // Unique is just !exists
    return !(await mockDb.exists(value, collection, field, db, exclude));
  },
};

// Override defaultRules DB functions for testing
import { defaultRules } from "../src/rules.js";
defaultRules.exists = mockDb.exists;
defaultRules.unique = mockDb.unique;

test("should catch unique username", async () => {
  const validator = new Validator(
    {
      username: [
        {
          validator: "unique",
          message: "Username already exists",
          options: { collection: "users", field: "username" },
        },
      ],
    },
    db
  );

  const errors = await validator.validate({ username: "takenuser" });
  assert.deepStrictEqual(errors, { username: "Username already exists" });
});

test("should allow new username", async () => {
  const validator = new Validator(
    {
      username: [
        {
          validator: "unique",
          message: "Username already exists",
          options: { collection: "users", field: "username" },
        },
      ],
    },
    db
  );

  const errors = await validator.validate({ username: "newuser" });
  assert.strictEqual(errors, null);
});

test("should catch existing email", async () => {
  const validator = new Validator(
    {
      email: [
        {
          validator: "exists",
          message: "Email already registered",
          options: { collection: "users", field: "email" },
        },
      ],
    },
    db
  );

  const errors = await validator.validate({ email: "taken@example.com" });
  assert.deepStrictEqual(errors, { email: "Email already registered" });
});

test("should allow new email", async () => {
  const validator = new Validator(
    {
      email: [
        {
          validator: "exists",
          message: "Email already registered",
          options: { collection: "users", field: "email" },
        },
      ],
    },
    db
  );

  const errors = await validator.validate({ email: "new@example.com" });
  assert.strictEqual(errors, null);
});

test("should validate multiple rules per field with 'all' strategy", async () => {
  const validator = new Validator(
    {
      username: [
        { validator: "required", message: "Required" },
        { validator: "alpha", message: "Must be alphabetic" },
      ],
    },
    db,
    { errorStrategy: "all" }
  );

  const errors = await validator.validate({ username: "" });
  assert.deepStrictEqual(errors, { username: ["Must be alphabetic"] });
});

test("should validate custom rule", async () => {
  const validator = new Validator(
    {
      age: [{ validator: "isAdult", message: "Must be adult" }],
    },
    db
  );

  validator.addRule("isAdult", (value) => value >= 18);

  const errors = await validator.validate({ age: 16 });
  assert.deepStrictEqual(errors, { age: "Must be adult" });

  const noErrors = await validator.validate({ age: 21 });
  assert.strictEqual(noErrors, null);
});
