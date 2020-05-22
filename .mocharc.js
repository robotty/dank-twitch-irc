module.exports = {
  require: ["ts-node/register", "source-map-support/register"],
  reporter: "mochawesome",
  recursive: true,
  spec: "lib/**/*.spec.ts",
  extension: [".spec.ts"],
};
