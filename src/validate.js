const { schemas } = require("./schemas");
import Ajv from "ajv";
// Ajv extra formats: https://ajv.js.org/packages/ajv-formats.html
import addFormats from "ajv-formats";
// Ajv extra keywords: https://ajv.js.org/packages/ajv-keywords.html
import addKeywords from "ajv-keywords";
// Ajv custom errors: https://ajv.js.org/packages/ajv-errors.html
import addErrors from "ajv-errors";
const uuid = require("uuid");

// Configure base Ajv
const ajv = new Ajv({
  strictSchema: false,
  useDefaults: true,
  allErrors: true,
  allowUnionTypes: true,
  coerceTypes: true,
});

// Enable `uuid` dynamic default
const def = require("ajv-keywords/dist/definitions/dynamicDefaults").default;
def.DEFAULTS = {};
def.DEFAULTS.uuid = () => () => uuid.v4();

// Enhance Ajv
addFormats(ajv);
addKeywords(ajv);
addErrors(ajv);

// Add all schemas from `schema` object.
for (const [key, value] of Object.entries(schemas)) {
  ajv.addSchema(value, key);
}

// Validate that `object` matches the specified JSON schema
function validate(schemaKey = "", object = {}, addDefaults = true) {
  const result = {};
  let validationObject;
  const check = ajv.getSchema(schemaKey);
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
    const errors = check.errors.map(
      (error) =>
        `${error.instancePath} ${error.message} (${JSON.stringify(
          error.params
        )})`
    );
    result.errors = errors.join(", ");
  }
  result.object = object;

  return result;
}

// Exports
module.exports = { validate };
export { validate };

// If called directly, validate a sample object against a sample schema
if (require.main === module) {
  const sampleObject = { action: "wait" };
  const result = validate("wait_v2", sampleObject);
  console.log(result);
}