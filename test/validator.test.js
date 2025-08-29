import test from "node:test";
import assert from "node:assert";
import mysql from "mysql2/promise";
import { Validator } from "../src/index.js";

let db;

test("setup MySQL connection", async () => {
  db = {
    type: "mysql",
    client: await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "", // adjust to your local password
      database: "test",
    }),
  };

  // Create table fresh for testing
  await db.client.query(`DROP TABLE IF EXISTS users`);
  await db.client.query(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      email VARCHAR(255) UNIQUE
    )
  `);

  // Insert sample user
  await db.client.query(`INSERT INTO users (username, email) VALUES (?, ?)`, [
    "takenuser",
    "taken@example.com",
  ]);
});

test("should catch unique username in MySQL", async () => {
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

test("should allow new username in MySQL", async () => {
  const validator = new Validator(
    {
      username: [
        {
          validator: "unique",
          message: "Username already exists",
          options: {
            collection: "users",
            field: "username",
            exclude: { field: "id", value: 5 },
          },
        },
      ],
    },
    db
  );

  const errors = await validator.validate({ username: "newuser" });
  assert.strictEqual(errors, null);
});

test("should catch existing email in MySQL", async () => {
  const validator = new Validator(
    {
      email: [
        {
          validator: "exists",
          message: "Email already registered",
          options: {
            collection: "users",
            field: "email",
            exclude: { field: "id", value: 5 },
          },
        },
      ],
    },
    db
  );

  const errors = await validator.validate({ email: "taken@example.com" });
  assert.deepStrictEqual(errors, { email: "Email already registered" });
});

test("teardown MySQL connection", async () => {
  await db.client.end();
});
