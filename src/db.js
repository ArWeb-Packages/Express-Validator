const cache = new Map(); // simple in-memory cache
const batchQueues = new Map(); // batching per collection-field

const generateCacheKey = (type, value, collection, field, exclude) =>
  `${type}:${collection}:${field}:${value}:${
    exclude ? `${exclude.field}-${exclude.value}` : ""
  }`;

const executeBatch = async (dbType, collection, field, queries, dbClient) => {
  if (dbType === "mongo") {
    const results = {};
    await Promise.all(
      queries.map(async ({ value, exclude }) => {
        const query = { [field]: value };
        if (exclude) query[exclude.field] = { $ne: exclude.value };
        const count = await dbClient
          .db()
          .collection(collection)
          .countDocuments(query);
        results[value] = count;
      })
    );
    return results;
  }

  if (dbType === "mysql") {
    const results = {};
    await Promise.all(
      queries.map(async ({ value, exclude }) => {
        let sql = `SELECT COUNT(*) as cnt FROM ?? WHERE ?? = ?`;
        const params = [collection, field, value];
        if (exclude) {
          sql += ` AND ?? != ?`;
          params.push(exclude.field, exclude.value);
        }
        const [rows] = await dbClient.query(sql, params);
        results[value] = rows[0].cnt;
      })
    );
    return results;
  }

  return {};
};

export const dbChecks = {
  async exists(value, collection, field, db, exclude = null) {
    if (!value) return false;
    const cacheKey = generateCacheKey(
      "exists",
      value,
      collection,
      field,
      exclude
    );
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    // Batch queue key
    const queueKey = `${collection}-${field}`;
    if (!batchQueues.has(queueKey)) batchQueues.set(queueKey, []);
    const queue = batchQueues.get(queueKey);

    // Add current request to queue and return a promise
    return new Promise((resolve) => {
      queue.push({ value, exclude, resolve });

      // execute batch in next tick
      if (queue.length === 1) {
        setImmediate(async () => {
          const results = await executeBatch(
            db.type,
            collection,
            field,
            queue,
            db.client
          );
          queue.forEach(({ value, resolve }) => {
            const exists = results[value] > 0;
            cache.set(
              generateCacheKey("exists", value, collection, field, null),
              exists
            );
            resolve(exists);
          });
          batchQueues.delete(queueKey);
        });
      }
    });
  },

  async unique(value, collection, field, db, exclude = null) {
    const existsResult = await dbChecks.exists(
      value,
      collection,
      field,
      db,
      exclude
    );
    return !existsResult;
  },
};
