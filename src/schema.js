const approot = require("app-root-path")
const fs = require("fs");

// Read files from schema directory
var files = fs.readdirSync(`${approot}/src/schema`);

const schema = {}

// Loop through all schema files
files.forEach(file => {
  // Exit early for files that don't match naming pattern
  if (!file.includes(".schema.json")) return;
  key = file.replace(".schema.json","");
  path = `./schema/${file}`;
  // Load into `schema` object
  schema[key] = require(path);
})

exports.schema = schema;