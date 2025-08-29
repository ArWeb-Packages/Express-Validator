export const dbChecks = {
  async exists(value, collection, field, db, exclude = null) {
    if (db.type === "mongo") {
      const query = { [field]: value };
      if (exclude) {
        query[exclude.field] = { $ne: exclude.value };
      }
      const count = await db.client
        .db()
        .collection(collection)
        .countDocuments(query);
      return count > 0;
    }

    if (db.type === "mysql") {
      let sql = `SELECT COUNT(*) as cnt FROM ?? WHERE ?? = ?`;
      const params = [collection, field, value];

      if (exclude) {
        sql += ` AND ?? != ?`;
        params.push(exclude.field, exclude.value);
      }

      const [rows] = await db.client.query(sql, params);
      return rows[0].cnt > 0;
    }

    return false;
  },

  async unique(value, collection, field, db, exclude = null) {
    if (db.type === "mongo") {
      const query = { [field]: value };
      if (exclude) {
        query[exclude.field] = { $ne: exclude.value };
      }
      const count = await db.client
        .db()
        .collection(collection)
        .countDocuments(query);
      return count === 0;
    }

    if (db.type === "mysql") {
      let sql = `SELECT COUNT(*) as cnt FROM ?? WHERE ?? = ?`;
      const params = [collection, field, value];

      if (exclude) {
        sql += ` AND ?? != ?`;
        params.push(exclude.field, exclude.value);
      }

      const [rows] = await db.client.query(sql, params);
      return rows[0].cnt === 0;
    }

    return false;
  },
};
