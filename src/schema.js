const approot = require("app-root-path");
const fs = require("fs");

//// Init
const schemas = {};

//// Process
loadSchemas();
// console.log(schemas.find_v1)
//// Export
exports.schemas = schemas;

//// Functions

// Load schemas from file
function loadSchemas() {
  // Read files from schema directory
  path = `${__dirname}/schemas`;
  var files = fs.readdirSync(path);
  // Loop through all schema files
  files.forEach(async (file) => {
    // Exit early for files that don't match naming pattern
    if (!file.includes(".schema.json")) return;
    const key = file.replace(".schema.json", "");
    // Load schema from file
    let schema = require(`./schemas/${file}`);
    // Add dynamic ID based on file path
    schema.$id = `file://${__dirname}/schemas/${file}`;
    // Recursively update relative references with app root path
    schema = updateRefPaths(schema);
    // Load into `schema` object
    schemas[key] = schema;
  });
}

// Prepend app-root path to referenced relative paths
function updateRefPaths(schema) {
  for (let [key, value] of Object.entries(schema)) {
    if (typeof value === "object") {
      updateRefPaths(value);
    }
    if (key === "$ref") {
      schema[key] = `file://${__dirname}/schemas/${value}`;
    }
  }
  return schema;
}
