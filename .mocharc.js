module.exports = {
  require: ["ts-node/register", "source-map-support/register"],
  reporters: "mochawesome",
  recursive: true,
  spec: "lib/**/*.spec.ts",
  extension: [".spec.ts"]
};
