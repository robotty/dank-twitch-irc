module.exports = {
  require: ["ts-node/register", "source-map-support/register"],
  reporter: ["mochawesome", "mocha-junit-reporter"],
  reporterOptions: "output=./mocha-report/test-results.xml",
  recursive: true,
  spec: "lib/**/*.spec.ts",
  extension: [".spec.ts"]
};
