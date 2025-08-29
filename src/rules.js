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

  /**************************************** BASIC RULES **************************************** */

  /**************************************** STRING RULES **************************************** */
  min_length: (value, { length }) => {
    if (value === undefined || value === null || value === "") return true;
    return typeof value === "string" && value.length >= length;
  },
  max_length: (value, { length }) => {
    if (value === undefined || value === null || value === "") return true;
    return typeof value === "string" && value.length <= length;
  },
  starts_with: (value, { prefix }) => {
    if (!value) return true;
    return value.startsWith(prefix);
  },
  ends_with: (value, { suffix }) => {
    if (!value) return true;
    return value.endsWith(suffix);
  },
  contains: (value, { substr }) => {
    if (!value) return true;
    return value.includes(substr);
  },
  in: (value, { list }) => {
    if (!value) return true;
    return list.includes(value);
  },
  not_in: (value, { list }) => {
    if (!value) return true;
    return !list.includes(value);
  },

  /**************************************** STRING RULES **************************************** */

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

  between: (value, { min, max }) => {
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

  digit: (value) => {
    if (value === undefined || value === null || value === "") return true;
    return /^\d+$/.test(value);
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

  /**************************************** TYPE RULES **************************************** */

  json: (value) => {
    if (!value) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },

  /**************************************** TYPE RULES **************************************** */

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

  ip: (value) => {
    if (!value) return true;
    return (
      /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.([0-9]{1,3}\.){2}[0-9]{1,3}$/.test(
        value
      ) || /^[a-fA-F0-9:]+$/.test(value)
    ); // IPv6
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
