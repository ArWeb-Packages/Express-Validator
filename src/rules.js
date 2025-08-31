import { dbChecks } from "./db.js";
import sharp from "sharp";

export const defaultRules = {
  /**************************************** BASIC RULES **************************************** */
  required: (value) => value !== undefined && value !== null && value !== "",

  email: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  alpha: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return /^[A-Za-z]+$/.test(value);
  },

  alphanumeric: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return /^[A-Za-z0-9]+$/.test(value);
  },

  no_spaces: (value) => {
    if (!value) return true;
    return !/\s/.test(value);
  },

  equal: (value, { allow }) => {
    if (!value) return true;
    return value == allow;
  },

  not_equal: (value, { disallow }) => {
    if (!value) return true;
    return value != disallow;
  },

  uuid: (value) => {
    if (!value) return true;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  },

  slug: (value) => {
    if (!value) return true;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  },

  regex: (value, { pattern, flags }) => {
    if (value === undefined || value === null || value === "") return true;
    if (!(pattern instanceof RegExp)) {
      try {
        pattern = new RegExp(pattern, flags);
      } catch {
        throw new Error("Invalid regex pattern");
      }
    }
    return pattern.test(value);
  },

  contain: (value, { element }) => {
    if (!value) return true;
    return value.includes(element);
  },

  not_contain: (value, { element }) => {
    if (!value) return true;
    return !value.includes(element);
  },

  /**************************************** BASIC RULES **************************************** */

  /**************************************** STRING RULES **************************************** */

  lowercase: (value) => {
    if (!value) return true;
    return value === value.toLowerCase();
  },

  uppercase: (value) => {
    if (!value) return true;
    return value === value.toUpperCase();
  },

  min_length: (value, { length }) => {
    if (value === undefined || value === null || value === "") return true;
    return value.length >= length;
  },
  max_length: (value, { length }) => {
    if (value === undefined || value === null || value === "") return true;
    return value.length <= length;
  },
  exact_length: (value, { length }) => {
    if (value === undefined || value === null || value === "") return true;
    return value.length === length;
  },
  starts_with: (value, { prefix }) => {
    if (!value) return true;
    return value.startsWith(prefix);
  },
  ends_with: (value, { suffix }) => {
    if (!value) return true;
    return value.endsWith(suffix);
  },

  /**************************************** STRING RULES **************************************** */

  /*********************************** ARRAY AND JSON RULES *********************************** */

  json: (value) => {
    if (!value) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },

  array: (value) => {
    if (!value) return true;
    return Array.isArray(value);
  },

  /*********************************** ARRAY AND JSON RULES *********************************** */

  /**************************************** NUMERIC RULES **************************************** */

  gt: (value, { val }) => {
    if (value === undefined || value === null || value === "") return true;
    return +value > val;
  },

  gte: (value, { val }) => {
    if (value === undefined || value === null || value === "") return true;
    return +value >= val;
  },

  lt: (value, { val }) => {
    if (value === undefined || value === null || value === "") return true;
    return +value < val;
  },

  lte: (value, { val }) => {
    if (value === undefined || value === null || value === "") return true;
    return +value <= val;
  },

  number_between: (value, { min, max }) => {
    if (value === undefined || value === null || value === "") return true;
    if (!isNaN(value)) return +value >= min && +value <= max;
    return false;
  },

  integer: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return Number.isInteger(+value);
  },

  positive: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return +value > 0;
  },

  negative: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return +value < 0;
  },

  float: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return /^-?\d+(\.\d+)?$/.test(value);
  },

  numeric: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return !isNaN(value);
  },

  /**************************************** NUMERIC RULES **************************************** */

  /**************************************** BOOLEAN RULES **************************************** */

  boolean: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return typeof value === "boolean";
  },

  is_true: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return value === true;
  },

  is_false: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return value === false;
  },

  /**************************************** BOOLEAN RULES **************************************** */

  /**************************************** DATE AND TIME RULES **************************************** */

  date: (value) => {
    if (!value) return true;
    return !isNaN(Date.parse(value));
  },

  before_date: (value, { date_val }) => {
    if (!value) return true;
    return new Date(value) < new Date(date_val);
  },

  after_date: (value, { date_val }) => {
    if (!value) return true;
    return new Date(value) > new Date(date_val);
  },

  between_dates: (value, { start_date, end_date }) => {
    if (!value) return true;
    const d = new Date(value);
    return d >= new Date(start_date) && d <= new Date(end_date);
  },

  future_date: (value) => {
    if (!value) return true;
    return new Date(value) > new Date();
  },

  past_date: (value) => {
    if (!value) return true;
    return new Date(value) < new Date();
  },

  iso_date: (value) => {
    if (!value) return true;
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value);
  },

  /**************************************** DATE AND TIME RULES **************************************** */

  /**************************************** WEB AND NETWORK RULES **************************************** */
  url: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  ip: (value, { type } = {}) => {
    if (!value) return true;

    const ipv4Regex =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:))|(([0-9a-fA-F]{1,4}:){1,7}:)|(::([0-9a-fA-F]{1,4}:){0,5}([0-9a-fA-F]{1,4}))$/;

    if (type === "ip4") {
      return ipv4Regex.test(value);
    }

    if (type === "ip6") {
      return ipv6Regex.test(value);
    }

    return ipv4Regex.test(value) || ipv6Regex.test(value);
  },

  domain: (value) => {
    if (!value) return true;
    return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
  },

  mac_address: (value) => {
    if (!value) return true;
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value);
  },

  /**************************************** WEB AND NETWORK RULES **************************************** */

  /**************************************** DATABASE RULES **************************************** */

  exists: async (value, { collection, field, exclude }, databaseConnection) => {
    if (value === undefined || value === null || value === "") return true;
    if (!dbChecks) throw new Error("Database not configured");
    return dbChecks.exists(
      value,
      collection,
      field,
      databaseConnection,
      exclude
    );
  },

  unique: async (value, { collection, field, exclude }, databaseConnection) => {
    if (value === undefined || value === null || value === "") return true;
    if (!dbChecks) throw new Error("Database not configured");
    return dbChecks.unique(
      value,
      collection,
      field,
      databaseConnection,
      exclude
    );
  },

  /**************************************** DATABASE RULES **************************************** */

  /**************************************** FILE RULES **************************************** */

  file_required: (file) => file !== undefined && file !== null,

  file_mime: (file, { types }) => {
    if (!file) return true;
    return types.includes(file.mimetype);
  },

  file_max_size: (file, { size_bytes }) => {
    if (!file) return true;
    return file.size <= size_bytes;
  },

  file_min_size: (file, { size_bytes }) => {
    if (!file) return true;
    return file.size >= size_bytes;
  },

  file_extension: (file, { extension }) => {
    if (!file) return true;
    return extension.some((ext) =>
      file.originalname.toLowerCase().endsWith(ext)
    );
  },

  file_dimensions: async (file, { width, height }) => {
    if (!file) return true;
    if (!file.mimetype.startsWith("image/")) return true;
    try {
      const metadata = await sharp(file.buffer).metadata();
      if (width && metadata.width < width) return false;
      if (height && metadata.height < height) return false;
      return true;
    } catch (err) {
      return false;
    }
  },

  /**************************************** FILE RULES **************************************** */
};
