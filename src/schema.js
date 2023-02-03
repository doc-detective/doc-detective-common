const approot = require("app-root-path");
const fs = require("fs");

//// Init
const schemas = {};

//// Process
loadSchemas();

//// Export
exports.schemas = schemas;

//// Functions

// Load schemas from file
function loadSchemas() {
  // Read files from schema directory
  if (require.main === module) {
    path = `${approot}/src/schemas`;
  } else {
    path = `${approot}/node_modules/doc-detective-common/src/schemas`;
  }
  var files = fs.readdirSync(path);
  // Loop through all schema files
  files.forEach(async (file) => {
    // Exit early for files that don't match naming pattern
    if (!file.includes(".schema.json")) return;
    const key = file.replace(".schema.json", "");
    // Load schema from file
    let schema = require(`./schemas/${file}`);
    // Add dynamic ID based on file path
    schema.$id = `file://${approot}/src/schemas/${file}`;
    // Recursively update relative references with app root path
    updateRefPaths(schema);
    // Load into `schema` object
    schemas[key] = schema;
  });
}

// Prepend app-root path to referenced relative paths
function updateRefPaths(schema) {
  for (const value of Object.values(schema)) {
    if (typeof value === "object") {
      updateRefPaths(value);
    } else if (typeof value === "string" && value.includes("$ref")) {
      value = `${approot}${value}`;
    }
  }
}
