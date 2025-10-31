const buildWhereClause = (conditions, params = [], negate = false) => {
  let sqlParts = [];

  for (let i = 0; i < conditions.length; i++) {
    const cond = conditions[i];
    const logic = i === 0 ? "" : (cond.logic || "AND").toUpperCase();

    if (cond.group && Array.isArray(cond.group)) {
      const groupClause = buildWhereClause(cond.group, params, negate);
      sqlParts.push(`${logic} (${groupClause})`);
    } else if (cond.field && cond.value !== undefined) {
      sqlParts.push(`${logic} ?? ${negate ? "!= ?" : "= ?"}`);
      params.push(cond.field, cond.value);
    } else {
      throw new Error("Invalid condition object: must have field/value or group");
    }
  }

  return sqlParts.join(" ").trim();
};

const buildMongoFilter = (conditions, negate = false) => {
  const andClauses = [];
  const orClauses = [];

  for (const cond of conditions) {
    const logic = (cond.logic || "AND").toUpperCase();

    if (cond.group && Array.isArray(cond.group)) {
      const subFilter = buildMongoFilter(cond.group, negate);
      if (logic === "OR") orClauses.push(subFilter);
      else andClauses.push(subFilter);
    } else if (cond.field && cond.value !== undefined) {
      const condition = { [cond.field]: negate ? { $ne: cond.value } : cond.value };
      if (logic === "OR") orClauses.push(condition);
      else andClauses.push(condition);
    }
  }

  if (andClauses.length && orClauses.length)
    return { $and: [...andClauses, { $or: orClauses }] };
  if (orClauses.length) return { $or: orClauses };
  if (andClauses.length) return { $and: andClauses };
  return {};
};

const executeExists = async (dbType, collection, conditions = [], exclude = [], dbClient) => {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    throw new Error("exists/unique: 'conditions' must be a non-empty array");
  }

  // ✅ MONGO
  if (dbType === "mongo") {
    const mongoFilter = buildMongoFilter(conditions);
    if (exclude && exclude.length > 0) {
      const excludeFilter = buildMongoFilter(exclude, true);
      mongoFilter.$and = mongoFilter.$and || [];
      mongoFilter.$and.push(excludeFilter);
    }

    try {
      const count = await dbClient.db().collection(collection).countDocuments(mongoFilter);
      return count > 0;
    } catch (err) {
      console.error("❌ Mongo exists check failed:", err);
      throw new Error("Database error during exists check");
    }
  }

  // ✅ MYSQL
  if (dbType === "mysql") {
    const params = [];
    const whereClause = buildWhereClause(conditions, params);

    let finalClause = whereClause || "1=1";

    if (exclude && exclude.length > 0) {
      const excludeClause = buildWhereClause(exclude, params, true);
      finalClause += ` AND (${excludeClause})`;
    }

    const sql = `SELECT COUNT(*) AS cnt FROM ?? WHERE ${finalClause}`;
    params.unshift(collection);

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
  async exists(value, { collection, conditions, exclude }, db) {
    if (!db) throw new Error("Database not configured");
    if (!Array.isArray(conditions) || conditions.length === 0) return false;
    return executeExists(db.type, collection, conditions, exclude || [], db.client);
  },

  async unique(value, { collection, conditions, exclude }, db) {
    if (!db) throw new Error("Database not configured");
    if (!Array.isArray(conditions) || conditions.length === 0) return true;
    const exists = await executeExists(
      db.type,
      collection,
      conditions,
      exclude || [],
      db.client
    );
    return !exists;
  },

  async not_exists(value, { collection, conditions, exclude }, db) {
    if (!db) throw new Error("Database not configured");
    if (!Array.isArray(conditions) || conditions.length === 0) return true;
    const exists = await executeExists(
      db.type,
      collection,
      conditions,
      exclude || [],
      db.client
    );
    return !exists; 
  },
};
