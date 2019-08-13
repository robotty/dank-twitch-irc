module.exports = {
  all: true,
  exclude: ["**/*.spec.ts"],
  extension: [".ts"],
  include: ["lib/**/*.ts"],
  instrument: true,
  reporter: ["text-summary", "html", "json"],
  sourceMap: true
};
