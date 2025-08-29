# 🚀 express-validator-custom

A lightweight **custom validator for Express.js** that supports:

- ✅ Simple rules
- ✅ Stops at the **first error per field**
- ✅ Works with **MongoDB** or **MySQL**
- ✅ Async database checks
- ✅ Exclude current row on updates (edit case)
- ✅ ESM-first (`import/export`)

---

## 📦 Installation

```bash
npm install @arweb/express-validator
```

---

### Validation Rules

| Rule            | Database | Use                                                                                                                                    |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| required        | ❌ No    | { validator: "required", message: "Your message" }                                                                                     |
| email           | ❌ No    | { validator: "email", message: "Your message" }                                                                                        |
| alpha           | ❌ No    | { validator: "alpha", message: "Your message" }                                                                                        |
| alphanumeric    | ❌ No    | { validator: "alphanumeric", message: "Your message" }                                                                                 |
| no_spaces       | ❌ No    | { validator: "no_spaces", message: "Your message" }                                                                                    |
| equal           | ❌ No    | { validator: "equal", message: "Your message", options: { allow: "Some Text" } }                                                       |
| not_equal       | ❌ No    | { validator: "not_equal", message: "Your message", options: { disallow: "Some Text" } }                                                |
| uuid            | ❌ No    | { validator: "uuid", message: "Your message" }                                                                                         |
| slug            | ❌ No    | { validator: "slug", message: "Your message" }                                                                                         |
| regex           | ❌ No    | { validator: "regex", message: "Your message", options: { pattern: "Pattern", flags: "i" } }                                           |
| min_length      | ❌ No    | { validator: "min_length", message: "Your message", options: { length: 3 } }                                                           |
| max_length      | ❌ No    | { validator: "max_length", message: "Your message", options: { length: 15 } }                                                          |
| starts_with     | ❌ No    | { validator: "starts_with", message: "Your message", options: { prefix: "Some Text" } }                                                |
| ends_with       | ❌ No    | { validator: "ends_with", message: "Your message", options: { suffix: "Some Text" } }                                                  |
| contains        | ❌ No    | { validator: "contains", message: "Your message", options: { substr: "Some Text" } }                                                   |
| in              | ❌ No    | { validator: "in", message: "Your message", options: { list: ["A","B","C"] } }                                                         |
| not_in          | ❌ No    | { validator: "not_in", message: "Your message", options: { list: ["A","B","C"] } }                                                     |
| gt              | ❌ No    | { validator: "gt", message: "Your message", options: { val: 3 } }                                                                      |
| gte             | ❌ No    | { validator: "gte", message: "Your message", options: { val: 3 } }                                                                     |
| lt              | ❌ No    | { validator: "lt", message: "Your message", options: { val: 3 } }                                                                      |
| lte             | ❌ No    | { validator: "lte", message: "Your message", options: { val: 3 } }                                                                     |
| between         | ❌ No    | { validator: "between", message: "Your message", options: { min: 5, max: 9 } }                                                         |
| integer         | ❌ No    | { validator: "integer", message: "Your message" }                                                                                      |
| positive        | ❌ No    | { validator: "positive", message: "Your message" }                                                                                     |
| negetive        | ❌ No    | { validator: "negetive", message: "Your message" }                                                                                     |
| float           | ❌ No    | { validator: "float", message: "Your message" }                                                                                        |
| numeric         | ❌ No    | { validator: "numeric", message: "Your message" }                                                                                      |
| digit           | ❌ No    | { validator: "digit", message: "Your message" }                                                                                        |
| json            | ❌ No    | { validator: "json", message: "Your message" }                                                                                         |
| date            | ❌ No    | { validator: "date", message: "Your message" }                                                                                         |
| before_date     | ❌ No    | { validator: "before_date", message: "Your message", options: { date_val: "yyyy-mm-dd" } }                                             |
| after_date      | ❌ No    | { validator: "after_date", message: "Your message", options: { date_val: "yyyy-mm-dd" } }                                              |
| between_dates   | ❌ No    | { validator: "between_dates", message: "Your message", options: { start_date: "yyyy-mm-dd", end_date: "yyyy-mm-dd" } }                 |
| url             | ❌ No    | { validator: "url", message: "Your message" }                                                                                          |
| ip              | ❌ No    | { validator: "ip", message: "Your message" }                                                                                           |
| domain          | ❌ No    | { validator: "domain", message: "Your message" }                                                                                       |
| mac_address     | ❌ No    | { validator: "mac_address", message: "Your message" }                                                                                  |
| file_required   | ❌ No    | { validator: "file_required", message: "Your message" }                                                                                |
| file_mime       | ❌ No    | { validator: "file_mime", message: "Your message", options: { types: ["image/jpeg","image/png"] } }                                    |
| file_max_size   | ❌ No    | { validator: "file_max_size", message: "Your message", options: { size_bytes: 100000 } }                                               |
| file_min_size   | ❌ No    | { validator: "file_min_size", message: "Your message", options: { size_bytes: 100000 } }                                               |
| file_extension  | ❌ No    | { validator: "file_extension", message: "Your message", options: { extension: [".jpg",".png"] } }                                      |
| file_dimensions | ❌ No    | { validator: "file_dimensions", message: "Your message", options: { width: 200, height: 100 } }                                        |
| exists          | ✅ Yes   | { validator: "exists", message: "Your message", options: { collection: "users", field: "email", exclude: { field: "id", value: 1 } } } |
| unique          | ✅ Yes   | { validator: "unique", message: "Your message", options: { collection: "users", field: "email", exclude: { field: "id", value: 1 } } } |

### Usage

```bash
import express from "express";
import multer from "multer";
import mysql from "mysql2/promise"; // using MySQL as an example
import { Validator } from "./index.js"; // your Validator class

const app = express();
const upload = multer(); // memory storage for files
app.use(express.json());

// 🔹 Setup MySQL connection
const dbClient = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "testdb",
});
const db = { type: "mysql", client: dbClient };

// 🔹 Validation rules
const rules = {
  username: [
    { validator: "required", message: "Username is required" },
    { validator: "alpha", message: "Username must only contain letters" },
    { validator: "min_length", options: { length: 3 }, message: "Username must be at least 3 chars" },
    { validator: "max_length", options: { length: 15 }, message: "Username must be at most 15 chars" },
    { validator: "unique", options: { collection: "users", field: "username" }, message: "Username already taken" },
  ],

  email: [
    { validator: "required", message: "Email is required" },
    { validator: "email", message: "Email must be valid" },
    { validator: "unique", options: { collection: "users", field: "email" }, message: "Email already exists" },
  ],

  password: [
    { validator: "required", message: "Password is required" },
    { validator: "min_length", options: { length: 6 }, message: "Password must be at least 6 characters" },
  ],

  profilePic: [
    { validator: "file_required", message: "Profile picture is required" },
    { validator: "file_mime", options: { types: ["image/jpeg", "image/png"] }, message: "Only JPG or PNG allowed" },
    { validator: "file_max_size", options: { size_bytes: 2 * 1024 * 1024 }, message: "File must be under 2MB" },
    { validator: "file_dimensions", options: { width: 300, height: 300 }, message: "Image must be at least 300x300px" },
  ],
};

// 🔹 Register route
app.post("/register", upload.single("profilePic"), async (req, res) => {
  const data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    profilePic: req.file, // multer gives file here
  };

  const validator = new Validator(rules, db);
  const errors = await validator.validate(data);

  if (errors) {
    return res.status(400).json({ errors });
  }

  // If validation passes, insert user into DB
  await db.client.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [data.username, data.email, data.password]
  );

  res.json({ message: "User registered successfully ✅" });
});

// 🔹 Start server
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));

```
