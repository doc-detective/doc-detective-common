const { schema } = require("./schema");
const Ajv = require("ajv");
const ajv = new Ajv();

// Exports
exports.validate = validate;

// Add all schemas from `schema` object.
for (const [key, value] of Object.entries(schema)) {
  ajv.addSchema(value, key);
}

// Validate that `object` matches the specified JSON schema
function validate(schemaKey, object) {
  const result = {};
  check = ajv.getSchema(schemaKey);
  result.valid = check(object);
  if (!result.valid) {
    result.valid = false;
    result.errors = check.errors;
  }
  return result;
}
