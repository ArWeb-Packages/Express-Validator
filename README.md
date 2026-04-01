# 🚀 Express-validator

A lightweight **custom validator for Express.js** that supports:

- ✅ Simple rules
- ✅ Stops at the **first error per field**
- ✅ Works with **MongoDB** or **MySQL** or **PostGreSQL**
- ✅ Async database checks

---

## 📦 Installation

```bash
npm install @arweb/express-validate-rules
```

## Validation Rules Reference

Below is the list of all supported validation rules with their usage format and behavior.

| Rule              | Database | Gives error when... | Use |
| ----------------- | -------- | ------------------- | --- |
| **required**          | ❌ No    | Value is null or empty | `{ validator: "required", message: "Your message" }` |
| **required_if**       | ❌ No    | Field is empty **when another field has a specific value** | `{ validator: "required_if", message: "Your message", options: { other: "field_name", val: "any / or not needed" } }` |
| **email**             | ❌ No    | Value is not a valid email | `{ validator: "email", message: "Your message" }` |
| **url**               | ❌ No    | Value is not a valid URL | `{ validator: "url", message: "Your message" }` |
| **alpha**             | ❌ No    | Value contains non-alphabetic characters | `{ validator: "alpha", message: "Your message" }` |
| **alphanumeric**      | ❌ No    | Value contains characters other than letters or numbers | `{ validator: "alphanumeric", message: "Your message" }` |
| **no_spaces**         | ❌ No    | Value contains spaces | `{ validator: "no_spaces", message: "Your message" }` |
| **no_special_chars**  | ❌ No    | Value contains special characters | `{ validator: "no_special_chars", message: "Your message" }` |
| **equal**             | ❌ No    | Value does not equal provided string | `{ validator: "equal", message: "Your message", options: { allow: "Some Text" } }` |
| **not_equal**         | ❌ No    | Value equals the disallowed string | `{ validator: "not_equal", message: "Your message", options: { disallow: "Some Text" } }` |
| **uuid**              | ❌ No    | Value is not a valid UUID (v1–v8 or any) | `{ validator: "uuid", message: "Your message", options: { type: "any" } }` |
| **slug**              | ❌ No    | Value is not a valid slug | `{ validator: "slug", message: "Your message" }` |
| **regex**             | ❌ No    | Value does not match the pattern | `{ validator: "regex", message: "Your message", options: { pattern: "Pattern", flags: "Flags" } }` |
| **contain**           | ❌ No    | Value does not contain given element | `{ validator: "contain", message: "Your message", options: { element: "Some text or array" } }` |
| **not_contain**       | ❌ No    | Value contains disallowed element | `{ validator: "not_contain", message: "Your message", options: { element: "Some text or array" } }` |
| **string_case**       | ❌ No    | Value is not in the required case (lower/upper/title) | `{ validator: "string_case", message: "Your message", options: { case_type: "lower" } }` |
| **string_length**     | ❌ No    | String length does not meet criteria (`min`/`max`/`exact`) | `{ validator: "string_length", message: "Your message", options: { length: 3, length_type: "min" } }` |
| **starts_with**       | ❌ No    | Value does not start with given prefix | `{ validator: "starts_with", message: "Your message", options: { prefix: "Some Text" } }` |
| **ends_with**         | ❌ No    | Value does not end with given suffix | `{ validator: "ends_with", message: "Your message", options: { suffix: "Some Text" } }` |
| **ascii**             | ❌ No    | Value is not valid ASCII | `{ validator: "ascii", message: "Your message" }` |
| **json**              | ❌ No    | Value is not valid JSON | `{ validator: "json", message: "Your message" }` |
| **array**             | ❌ No    | Value is not a valid array | `{ validator: "array", message: "Your message" }` |
| **gt**                | ❌ No    | Value is ≤ provided `val` | `{ validator: "gt", message: "Your message", options: { val: 3 } }` |
| **gte**               | ❌ No    | Value is < provided `val` | `{ validator: "gte", message: "Your message", options: { val: 3 } }` |
| **lt**                | ❌ No    | Value is ≥ provided `val` | `{ validator: "lt", message: "Your message", options: { val: 3 } }` |
| **lte**               | ❌ No    | Value is > provided `val` | `{ validator: "lte", message: "Your message", options: { val: 3 } }` |
| **number_between**    | ❌ No    | Value is not between min and max | `{ validator: "number_between", message: "Your message", options: { min: 5, max: 9 } }` |
| **integer**           | ❌ No    | Value is not an integer | `{ validator: "integer", message: "Your message" }` |
| **positive**          | ❌ No    | Value is not positive | `{ validator: "positive", message: "Your message" }` |
| **negative**          | ❌ No    | Value is not negative | `{ validator: "negative", message: "Your message" }` |
| **float**             | ❌ No    | Value is not float/double | `{ validator: "float", message: "Your message" }` |
| **numeric**           | ❌ No    | Value is not numeric | `{ validator: "numeric", message: "Your message" }` |
| **even**              | ❌ No    | Value is not even | `{ validator: "even", message: "Your message" }` |
| **odd**               | ❌ No    | Value is not odd | `{ validator: "odd", message: "Your message" }` |
| **boolean**           | ❌ No    | Value is not a valid boolean | `{ validator: "boolean", message: "Your message" }` |
| **is_true**           | ❌ No    | Value is not `true` | `{ validator: "is_true", message: "Your message" }` |
| **is_false**          | ❌ No    | Value is not `false` | `{ validator: "is_false", message: "Your message" }` |
| **file_required**     | ❌ No    | File is missing or empty | `{ validator: "file_required", message: "Your message" }` |
| **file_mime**         | ❌ No    | File MIME type does not match | `{ validator: "file_mime", message: "Your message", options: { types: ["image/jpeg", "image/png"] } }` |
| **file_storage_size** | ❌ No    | File size does not match rule (`min`/`max`/`exact`) | `{ validator: "file_storage_size", message: "Your message", options: { size_bytes: 100000, size_type: "max/min/exact" } }` |
| **file_extension**    | ❌ No    | File extension does not match allowed list | `{ validator: "file_extension", message: "Your message", options: { extension: [".jpg", ".png"] } }` |
| **image_dimensions**  | ❌ No    | Image dimensions are invalid | `{ validator: "image_dimensions", message: "Your message", options: { width: 200, height: 100, width_type: "max/min/exact", height_type: "max/min/exact" } }` |
| **exists**            | ✅ Yes   | Value **does not exist** in the specified database collection | `{ validator: "exists", message: "Your message", options: { collection: "users", field: "email", exclude: [{ field: "id", value: req.params.id, logic: "AND" }] } }` <br>Ensures the value **already exists** (useful for foreign key or reference checks). |
| **unique**            | ✅ Yes   | Value **already exists** (not unique) in the specified database collection | `{ validator: "unique", message: "Your message", options: { collection: "users", conditions: [{ field: "username", value: req.body.username, logic: "AND" }, { field: "email", value: req.body.email, logic: "OR" }], exclude: [{ field: "id", value: req.params.id, logic: "AND" }] } }` <br>Ensures values are **unique** across one or more fields. Supports logical operators (`AND` / `OR`) and multiple exclusions. |
| **not_exists**        | ✅ Yes   | Value **already exists** in the specified database collection | `{ validator: "not_exists", message: "Your message", options: { collection: "users", field: "email", exclude: [{ field: "id", value: req.params.id, logic: "AND" }] } }` <br>Ensures the value **does not exist** before inserting or updating. Commonly used for uniqueness checks during creation. |

---

### 🧠 Summary

| Rule | Validation Logic |
|------|------------------|
| **exists** | Must already exist in DB |
| **unique** | Must be unique (not duplicated) in DB |
| **not_exists** | Must not exist in DB at all |

---

✅ **Notes:**
- `exclude` supports an **array** of conditions with individual `logic` values.  
- Default logic between conditions is **AND** if not specified.  
- These database validations can be combined with non-database ones in the same validation set.


#### Issues

Facing bugs, please raise a [Issue](https://github.com/ArWeb-Packages/Express-Validator/issues)
