export default {
  dialect: "sqlite",
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dbCredentials: { url: "./data/app.db" },
};
