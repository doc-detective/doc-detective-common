const approot = require("app-root-path")
const fs = require("fs");

// Read files from schema directory
var files = fs.readdirSync(`${approot}/src/schemas`);

const schemas = {}

// Loop through all schema files
files.forEach(file => {
  // Exit early for files that don't match naming pattern
  if (!file.includes(".schema.json")) return;
  key = file.replace(".schema.json","");
  path = `./schemas/${file}`;
  // Load into `schema` object
  schemas[key] = require(path);
})

exports.schemas = schemas;