const { schemas } = require("./schemas");
const Ajv = require("ajv");
// Ajv extra formats: https://ajv.js.org/packages/ajv-formats.html
const addFormats = require("ajv-formats");
// Ajv extra keywords: https://ajv.js.org/packages/ajv-keywords.html
const addKeywords = require("ajv-keywords");
// Ajv custom errors: https://ajv.js.org/packages/ajv-errors.html
const addErrors = require("ajv-errors");
const uuid = require("uuid");

// Configure base Ajv
const ajv = new Ajv({ strictSchema: false, useDefaults: true, allErrors: true, allowUnionTypes: true, coerceTypes: true });

// Enable `uuid` dynamic defult
const def = require("ajv-keywords/dist/definitions/dynamicDefaults");
def.DEFAULTS.uuid = () => uuid.v4;

// Enhance Ajv
addFormats(ajv);
addKeywords(ajv);
addErrors(ajv);

// Exports
exports.validate = validate;

// Add all schemas from `schema` object.
for (const [key, value] of Object.entries(schemas)) {
  ajv.addSchema(value, key);
}

// Validate that `object` matches the specified JSON schema
function validate(schemaKey = "", object = {}, addDefaults = true) {
  const result = {};
  let validationObject;
  check = ajv.getSchema(schemaKey);
  if (!check) {
    result.valid = false;
    result.errors = `Schema not found: ${schemaKey}`;
    result.object = object;
    return result;
  }
  if (addDefaults) {
    validationObject = object;
  } else {
    validationObject = JSON.parse(JSON.stringify(object));
  }
  result.valid = check(validationObject);
  result.errors = "";
  if (check.errors) {
    const errors = check.errors.map((error) => `${error.instancePath} ${error.message} (${JSON.stringify(error.params)})`);
    result.errors = errors.join(", ");
  }
  result.object = object;

  return result;
}
