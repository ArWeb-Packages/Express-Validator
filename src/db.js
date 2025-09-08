const executeExists = async (
  dbType,
  collection,
  field,
  value,
  exclude,
  dbClient
) => {
  if (dbType === "mongo") {
    const query = { [field]: value };
    if (exclude) query[exclude.field] = { $ne: exclude.value };
    try {
      const count = await dbClient
        .db()
        .collection(collection)
        .countDocuments(query);
      return count > 0;
    } catch (err) {
      console.error("❌ Mongo exists check failed:", err);
      throw new Error("Database error during exists check");
    }
  }

  if (dbType === "mysql") {
    let sql = `SELECT COUNT(*) as cnt FROM ?? WHERE ?? = ?`;
    const params = [collection, field, value];
    if (exclude) {
      sql += ` AND ?? != ?`;
      params.push(exclude.field, exclude.value);
    }

    try {
      const [rows] = await dbClient.query(sql, params);
      return rows[0].cnt > 0;
    } catch (err) {
      console.error("❌ MySQL exists check failed:", err);
      throw new Error("Database error during exists check");
    }
  }

  return false;
};

export const dbChecks = {
  async exists(value, collection, field, db, exclude = null) {
    if (!value) return false;
    return executeExists(db.type, collection, field, value, exclude, db.client);
  },

  async unique(value, collection, field, db, exclude = null) {
    if (!value) return true;
    const exists = await executeExists(
      db.type,
      collection,
      field,
      value,
      exclude,
      db.client
    );
    return !exists;
  },
};
