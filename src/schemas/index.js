// Load schemas from file
const schemas = {};
// Read files from schema directory
path = `${__dirname}/output_schemas`;
var files = [
  "checkLink_v2.schema.json",
  "config_v2.schema.json",
  "context_v2.schema.json",
  "find_v2.schema.json",
  "goTo_v2.schema.json",
  "httpRequest_v2.schema.json",
  "runShell_v2.schema.json",
  "saveScreenshot_v2.schema.json",
  "setVariables_v2.schema.json",
  "spec_v2.schema.json",
  "test_v2.schema.json",
  "typeKeys_v2.schema.json",
  "wait_v2.schema.json",
];
// Loop through all schema files
files.forEach(async (file) => {
  const key = file.replace(".schema.json", "");
  // Load schema from file
  let schema = require(`${path}/${file}`);
  // Load into `schema` object
  schemas[key] = schema;
});

// Exports
exports.schemas = schemas;

// console.log(schemas);