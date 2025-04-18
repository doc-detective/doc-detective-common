const parser = require("@apidevtools/json-schema-ref-parser");
const path = require("path");
const fs = require("fs");

(async () => {
  await dereferenceSchemas();
})();

/**
 * Processes JSON schema files by updating reference paths, dereferencing all `$ref` pointers, and generating fully resolved schema outputs.
 *
 * For each schema in the input directory, this function updates reference paths, writes intermediate schemas to a build directory, dereferences all references, removes `$id` properties, and writes the final schemas to an output directory. It also creates a consolidated `schemas.json` file containing all dereferenced schemas keyed by filename.
 *
 * @remark The function assumes all schema files listed exist in the input directory and does not handle missing files or invalid JSON beyond throwing synchronous errors.
 */
async function dereferenceSchemas() {
  const inputDir = path.resolve(`${__dirname}/src_schemas`);
  const buildDir = path.resolve(`${__dirname}/build`);
  fs.mkdir(buildDir, { recursive: true }, (err) => {
    if (err) throw err;
  });
  const outputDir = path.resolve(`${__dirname}/output_schemas`);
  const files = [
    // v3 schemas
    "checkLink_v3.schema.json",
    "click_v3.schema.json",
    "config_v3.schema.json",
    "context_v3.schema.json",
    "find_v3.schema.json",
    "goTo_v3.schema.json",
    "loadVariables_v3.schema.json",
    "httpRequest_v3.schema.json",
    "openApi_v3.schema.json",
    "record_v3.schema.json",
    "report_v3.schema.json",
    "runCode_v3.schema.json",
    "runShell_v3.schema.json",
    "screenshot_v3.schema.json",
    "spec_v3.schema.json",
    "step_v3.schema.json",
    "stopRecord_v3.schema.json",
    "test_v3.schema.json",
    "type_v3.schema.json",
    "wait_v3.schema.json",
    // v2 schemas
    "checkLink_v2.schema.json",
    "config_v2.schema.json",
    "context_v2.schema.json",
    "find_v2.schema.json",
    "goTo_v2.schema.json",
    "httpRequest_v2.schema.json",
    "moveTo_v2.schema.json",
    "openApi_v2.schema.json",
    "runShell_v2.schema.json",
    "runCode_v2.schema.json",
    "saveScreenshot_v2.schema.json",
    "setVariables_v2.schema.json",
    "startRecording_v2.schema.json",
    "stopRecording_v2.schema.json",
    "spec_v2.schema.json",
    "test_v2.schema.json",
    "typeKeys_v2.schema.json",
    "wait_v2.schema.json",
  ];
  // Update schema reference paths
  for (const file of files) {
    // console.log(`File: ${file}`)
    const filePath = path.resolve(`${inputDir}/${file}`);
    // Load from file
    let schema = fs.readFileSync(filePath).toString();
    // Convert to JSON
    schema = JSON.parse(schema);
    // Set ID
    schema.$id = `${filePath}`;
    // Update references to current relative path
    schema = updateRefPaths(schema);
    // Write to file
    fs.writeFileSync(`${buildDir}/${file}`, JSON.stringify(schema, null, 2));
  }
  // Dereference schemas
  for await (const file of files) {
    const filePath = path.resolve(`${buildDir}/${file}`);
    // Load from file
    let schema = fs.readFileSync(filePath).toString();
    // Convert to JSON
    schema = JSON.parse(schema);
    // Dereference schema
    schema = await parser.dereference(schema);
    // Delete $id attributes
    schema = deleteDollarIds(schema);
    // Write to file
    fs.writeFileSync(`${outputDir}/${file}`, JSON.stringify(schema, null, 2));
  }
  // Build final schemas.json file
  const schemas = {};
  files.forEach(async (file) => {
    const key = file.replace(".schema.json", "");
    // Load schema from file
    let schema = require(`${outputDir}/${file}`);
    // Load into `schema` object
    schemas[key] = schema;
  });
  fs.writeFileSync(
    `${__dirname}/schemas.json`,
    JSON.stringify(schemas, null, 2)
  );

  // Clean up build dir
  // fs.rm(buildDir, { recursive: true }, (err) => {
  //   if (err) throw err;
  // });
}

// Prepend app-root path to referenced relative paths
function updateRefPaths(schema) {
  for (let [key, value] of Object.entries(schema)) {
    if (typeof value === "object") {
      updateRefPaths(value);
    }
    if (key === "$ref" && !value.startsWith("#")) {
      // File name of the referenced schema
      valueFile = value.split("#")[0];
      // Attribute path in the referenced schema
      valueAttribute = value.split("#")[1];
      valuePath = path.resolve(`${__dirname}/build/${valueFile}`);
      schema[key] = `${valuePath}#${valueAttribute}`;
      // console.log({value, valueFile, valueAttribute, final: schema[key]})
    }
  }
  return schema;
}

/**
 * Recursively removes all `$id` properties from a JSON schema object.
 *
 * @param {object} schema - The JSON schema object to process.
 * @returns {object} The schema object with all `$id` properties deleted.
 */
function deleteDollarIds(schema) {
  for (let [key, value] of Object.entries(schema)) {
    if (typeof value === "object") {
      deleteDollarIds(value);
    }
    if (key === "$id") {
      delete schema[key];
    }
  }
  return schema;
}
