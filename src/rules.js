import { dbChecks } from "./db.js";
import sharp from "sharp";

// Helper: consistent empty check
const isEmpty = (value) =>
  value === undefined || value === null || value === "";

const wrapAsync =
  (fn) =>
  async (...args) =>
    fn(...args);

export const defaultRules = {
  /**************************************** BASIC RULES **************************************** */
  required: wrapAsync((value) => !isEmpty(value)),

  required_if: wrapAsync((value, { other, val }, data = {}) => {
    if (!data || typeof data !== "object") {
      throw new Error("required_if validator needs full data context");
    }

    const otherValue = data[other];
    const shouldRequire =
      val !== undefined ? otherValue == val : !isEmpty(otherValue);

    // custom check for string OR array
    const isValueEmpty = (val) => {
      if (val === null || val === undefined) return true;
      if (typeof val === "string") return val.trim().length === 0;
      if (Array.isArray(val)) return val.length === 0;
      return isEmpty(val); // fallback for objects, numbers, etc.
    };

    if (shouldRequire) {
      return !isValueEmpty(value);
    }

    return true;
  }),

  email: wrapAsync(
    (value) => isEmpty(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ),

  alpha: wrapAsync((value) => isEmpty(value) || /^[A-Za-z]+$/.test(value)),

  alphanumeric: wrapAsync(
    (value) => isEmpty(value) || /^[A-Za-z0-9]+$/.test(value)
  ),

  no_special_chars: wrapAsync(
    (value) => isEmpty(value) || /^[A-Za-z0-9 ]+$/.test(value)
  ),

  no_spaces: wrapAsync((value) => isEmpty(value) || !/\s/.test(value)),

  equal: wrapAsync((value, { allow }) => isEmpty(value) || value == allow),

  not_equal: wrapAsync(
    (value, { disallow }) => isEmpty(value) || value != disallow
  ),

  uuid: wrapAsync((value, { type = "any" }) => {
    if (isEmpty(value)) return true;

    const uuidAny =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const regexMap = {
      v1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v2: /^[0-9a-f]{8}-[0-9a-f]{4}-2[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v6: /^[0-9a-f]{8}-[0-9a-f]{4}-6[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v7: /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v8: /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      any: uuidAny,
    };
    return regexMap[type]?.test(value) ?? false;
  }),

  slug: wrapAsync(
    (value) => isEmpty(value) || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  ),

  regex: wrapAsync((value, { pattern, flags = "i" }) => {
    if (isEmpty(value)) return true;
    if (!(pattern instanceof RegExp)) {
      try {
        pattern = new RegExp(pattern, flags);
      } catch {
        throw new Error("Invalid regex pattern");
      }
    }
    return pattern.test(value);
  }),

  contain: wrapAsync((value, { element }) => {
    if (isEmpty(value)) return true;
    if (Array.isArray(element)) {
      return element.includes(value);
    }
    return value.includes(element);
  }),

  not_contain: wrapAsync((value, { element }) => {
    if (isEmpty(value)) return true;

    if (Array.isArray(element)) {
      return !element.includes(value);
    }
    return !value.includes(element);
  }),

  /**************************************** STRING RULES **************************************** */
  string_case: wrapAsync((value, { case_type = "lower" }) => {
    if (isEmpty(value)) return true;
    if (case_type === "lower") return value === value.toLowerCase();
    if (case_type === "upper") return value === value.toUpperCase();
    return /^[A-Z][a-z]*(?: [A-Z][a-z]*)*$/.test(value);
  }),

  string_length: wrapAsync((value, { length, length_type = "min" }) => {
    if (isEmpty(value)) return true;
    if (length_type === "min") return value.length >= length;
    if (length_type === "max") return value.length <= length;
    return value.length === length;
  }),

  starts_with: wrapAsync(
    (value, { prefix }) => isEmpty(value) || value.startsWith(prefix)
  ),

  ends_with: wrapAsync(
    (value, { suffix }) => isEmpty(value) || value.endsWith(suffix)
  ),

  ascii: wrapAsync((value) => isEmpty(value) || /^[\x00-\x7F]+$/.test(value)),

  /*********************************** ARRAY AND JSON RULES *********************************** */
  json: wrapAsync(
    (value) =>
      isEmpty(value) ||
      (() => {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      })()
  ),

  array: wrapAsync((value) => isEmpty(value) || Array.isArray(value)),

  /**************************************** NUMERIC RULES **************************************** */
  gt: wrapAsync((value, { val }) => isEmpty(value) || +value > val),
  gte: wrapAsync((value, { val }) => isEmpty(value) || +value >= val),
  lt: wrapAsync((value, { val }) => isEmpty(value) || +value < val),
  lte: wrapAsync((value, { val }) => isEmpty(value) || +value <= val),

  number_between: wrapAsync((value, { min, max }) => {
    if (isEmpty(value)) return true;
    if (!isNaN(value)) return +value >= min && +value <= max;
    return false;
  }),

  integer: wrapAsync((value) => isEmpty(value) || Number.isInteger(+value)),
  positive: wrapAsync((value) => isEmpty(value) || +value >= 0),
  negative: wrapAsync((value) => isEmpty(value) || +value < 0),
  float: wrapAsync((value) => isEmpty(value) || /^-?\d+(\.\d+)?$/.test(value)),
  numeric: wrapAsync((value) => isEmpty(value) || !isNaN(value)),
  even: wrapAsync((value) => isEmpty(value) || +value % 2 === 0),
  odd: wrapAsync((value) => isEmpty(value) || +value % 2 === 1),

  /**************************************** BOOLEAN RULES **************************************** */
  boolean: wrapAsync((value) => isEmpty(value) || typeof value === "boolean"),
  is_true: wrapAsync((value) => isEmpty(value) || value === true),
  is_false: wrapAsync((value) => isEmpty(value) || value === false),

  /**************************************** DATABASE RULES **************************************** */
  exists: async (value, { collection, field, exclude }, db) => {
    if (isEmpty(value)) return true;
    if (!dbChecks) throw new Error("Database not configured");
    return dbChecks.exists(value, collection, field, db, exclude);
  },

  unique: async (value, { collection, field, exclude }, db) => {
    if (isEmpty(value)) return true;
    if (!dbChecks) throw new Error("Database not configured");
    return dbChecks.unique(value, collection, field, db, exclude);
  },

  /**************************************** FILE RULES **************************************** */
  file_required: wrapAsync((files) => {
    if (!files) return false;

    if (Array.isArray(files)) {
      return files.length > 0;
    }

    return false;
  }),

  file_mime: wrapAsync((file, { types }) => {
    if (isEmpty(file)) return true;

    if (Array.isArray(file)) {
      return file.every((f) => types.includes(f.mimetype));
    }

    return types.includes(file.mimetype);
  }),

  file_storage_size: wrapAsync((file, { size_bytes, size_type = "min" }) => {
    if (isEmpty(file)) return true;

    const checkSize = (f) => {
      if (size_type === "min") return f.size >= size_bytes;
      if (size_type === "max") return f.size <= size_bytes;
      return f.size === size_bytes;
    };

    if (Array.isArray(file)) {
      return file.every(checkSize);
    }

    return checkSize(file);
  }),

  file_extension: wrapAsync((file, { extension }) => {
    if (isEmpty(file)) return true;

    const checkExt = (f) =>
      extension.some((ext) => f.originalname.toLowerCase().endsWith(ext));

    if (Array.isArray(file)) {
      return file.every(checkExt);
    }

    return checkExt(file);
  }),

  image_dimensions: async (
    file,
    { width, height, width_type = "min", height_type = "min" } = {}
  ) => {
    if (isEmpty(file)) return true;

    const checkDimensions = async (f) => {
      if (!f.mimetype.startsWith("image/")) return true;
      const metadata = await sharp(f.buffer).metadata();

      let valid = true;
      if (width) {
        if (width_type === "min") valid = valid && metadata.width >= width;
        if (width_type === "max") valid = valid && metadata.width <= width;
        if (width_type === "exact") valid = valid && metadata.width === width;
      }
      if (height) {
        if (height_type === "min") valid = valid && metadata.height >= height;
        if (height_type === "max") valid = valid && metadata.height <= height;
        if (height_type === "exact")
          valid = valid && metadata.height === height;
      }
      return valid;
    };

    if (Array.isArray(file)) {
      const results = await Promise.all(file.map(checkDimensions));
      return results.every(Boolean);
    }

    return checkDimensions(file);
  },
};
