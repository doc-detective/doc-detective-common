const fs = require("fs");

exports.schemas = loadSchemas();

// Load schemas from file
function loadSchemas() {
  const schemas = {};
  // Read files from schema directory
  const path = `${__dirname}/output_schemas`;
  var files = fs.readdirSync(path);
  // Loop through all schema files
  files.forEach(async (file) => {
    // Exit early for files that don't match naming pattern
    if (!file.includes(".schema.json")) return;
    const key = file.replace(".schema.json", "");
    // Load schema from file
    let schema = require(`./output_schemas/${file}`);
    // Load into `schema` object
    schemas[key] = schema;
  });
  return schemas;
}