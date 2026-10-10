/**
 * Issues the next sequence number for a year atomically. LAST_INSERT_ID(expr)
 * stores the incremented value on the connection, so concurrent submissions
 * can never receive the same number.
 */
export const ReferenceModel = {
  async next(db, year) {
    await db.execute(
      `INSERT INTO reference_counters (year, last_value) VALUES (?, LAST_INSERT_ID(1))
       ON DUPLICATE KEY UPDATE last_value = LAST_INSERT_ID(last_value + 1)`,
      [year],
    );
    const [rows] = await db.query('SELECT LAST_INSERT_ID() AS value');
    return Number(rows[0].value);
  },
};
