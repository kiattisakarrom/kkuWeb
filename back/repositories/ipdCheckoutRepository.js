const { sql, pool } = require("../models/db");
const { createCheckoutReader } = require("../services/ipdCheckout");
const { readCheckoutImages } = require("../services/ipdCheckoutImages");
const reader = createCheckoutReader(async (text, params) => {
  await pool.connect();
  const request = pool.request();
  for (const [key, value] of Object.entries(params))
    request.input(
      key,
      key === "completed" ? sql.Bit : sql.NVarChar(key === "search" ? 32 : 100),
      value,
    );
  return request.query(text);
});
module.exports = {
  ...reader,
  getCheckoutDetail: async (...args) => {
    const detail = await reader.getCheckoutDetail(...args);
    return detail
      ? {
          ...detail,
          images: await readCheckoutImages(detail.items, detail.packets),
        }
      : null;
  },
};
