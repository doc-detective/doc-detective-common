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
const ajv = new Ajv({
  strictSchema: false,
  useDefaults: true,
  allErrors: true,
  allowUnionTypes: true,
  coerceTypes: true,
});

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

const compatibleSchemas = {
  step_v3: [
    "goTo_v2",
    "checkLink_v2",
    "runShell_v2",
    "runCode_v2",
    "typeKeys_v2",
    "stopRecording_v2",
    "wait_v2",
  ],
};

// Validate that `object` matches the specified JSON schema
function validate({ schemaKey = "", object = {}, addDefaults = true }) {
  const result = {};
  let validationObject;
  let check = ajv.getSchema(schemaKey);
  if (!check) {
    result.valid = false;
    result.errors = `Schema not found: ${schemaKey}`;
    result.object = object;
    return result;
  }

  // Clone the object to avoid modifying the original object
  validationObject = JSON.parse(JSON.stringify(object));

  // Check if the object is compatible with the schema
  result.valid = check(validationObject);
  result.errors = "";

  if (check.errors) {
    // Check if the object is compatible with another schema
    const matchedSchemaKey = compatibleSchemas[schemaKey].find((key) => {
      validationObject = JSON.parse(JSON.stringify(object));
      const check = ajv.getSchema(key);
      if (check(validationObject)) return key;
    });
    if (!matchedSchemaKey) {
      result.errors = `Schema not found.`;
      result.object = object;
      result.valid = false;
      return result;
    } else {
      const transformedObject = transformToSchemaKey({
        currentSchema: matchedSchemaKey,
        targetSchema: schemaKey,
        object: validationObject,
      });

      result.valid = check(transformedObject);
      if (result.valid) {
        validationObject = transformedObject;
        object = transformedObject;
      } else if (check.errors) {
        const errors = check.errors.map(
          (error) =>
            `${error.instancePath} ${error.message} (${JSON.stringify(
              error.params
            )})`
        );
        result.errors = errors.join(", ");
        return result;
      }
    }
  }
  if (addDefaults) {
    result.object = validationObject;
  } else {
    result.object = object;
  }

  return result;
}

function transformToSchemaKey({
  currentSchema = "",
  targetSchema = "",
  object = {},
}) {
  // Check if the current schema is the same as the target schema
  if (currentSchema === targetSchema) {
    return object;
  }
  // Check if the current schema is compatible with the target schema
  if (!compatibleSchemas[targetSchema].includes(currentSchema)) {
    throw new Error(
      `Can't transform from ${currentSchema} to ${targetSchema}.`
    );
  }
  // Transform the object
  const transformedObject = {};
  if (targetSchema === "step_v3") {
    transformedObject.stepId = object.id;
    transformedObject.description = object.description;
    if (currentSchema === "goTo_v2") {
      transformedObject.goTo = {
        url: object.url,
        origin: object.origin,
      };
    } else if (currentSchema === "checkLink_v2") {
      transformedObject.checkLink = {
        url: object.url,
        origin: object.origin,
        statusCodes: object.statusCodes,
      };
    } else if (currentSchema === "runShell_v2") {
      transformedObject.runShell = {
        command: object.command,
        args: object.args,
        workingDirectory: object.workingDirectory,
        exitCodes: object.exitCodes,
        stdio: object.output,
        path: object.savePath,
        directory: object.saveDirectory,
        maxVariation: object.maxVariation,
        overwrite: (object.overwrite = "byVariation"
          ? "aboveVariation"
          : object.overwrite),
        timeout: object.timeout,
      };
      transformedObject.variables = {};
      object.setVariables.forEach((variable) => {
        transformedObject.variables[variable.name] = variable.value;
      });
      // TODO: Handle v2 outputs
    } else if (currentSchema === "runCode_v2") {
      transformedObject.runCode = {
        language: object.language,
        code: object.code,
        args: object.args,
        workingDirectory: object.workingDirectory,
        exitCodes: object.exitCodes,
        stdio: object.output,
        path: object.savePath,
        directory: object.saveDirectory,
        maxVariation: object.maxVariation,
        overwrite: (object.overwrite = "byVariation"
          ? "aboveVariation"
          : object.overwrite),
        timeout: object.timeout,
      };
      transformedObject.variables = {};
      object.setVariables.forEach((variable) => {
        transformedObject.variables[variable.name] = variable.value;
      });
      // TODO: Handle v2 outputs
    } else if (currentSchema === "typeKeys_v2") {
      transformedObject.type = {
        keys: object.keys,
        inputDelay: object.delay,
      };
    } else if (currentSchema === "stopRecording_v2") {
      transformedObject.endRecord = true;
    } else if (currentSchema === "wait_v2") {
      transformedObject.wait = object;
    }
  }
  return transformedObject;
}

// If called directly, validate an example object
if (require.main === module) {
  const example = {
    action: "stopRecording",
  };
  result = validate({ schemaKey: "step_v3", object: example });
  console.log(result);
}
