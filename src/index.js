const { schemas } = require("./schemas");
const { validate } = require("./validate");
const { resolvePaths } = require("./resolvePaths");
const { readFile } = require("./files");

module.exports = {
  schemas,
  validate,
  resolvePaths,
  readFile,
};
