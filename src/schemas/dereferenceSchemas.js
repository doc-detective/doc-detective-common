const parser = require("@apidevtools/json-schema-ref-parser");
const path = require("path");
const fs = require("fs");

(async () => {
  await dereferenceSchemas();
})();

/*
 * Walks through all schema in src/src_schema
 * For each schema, dereferences it and writes it to src/schema
 */
async function dereferenceSchemas() {
  const inputDir = path.resolve(`${__dirname}/src_schemas`);
  const buildDir = path.resolve(`${__dirname}/build`);
  fs.mkdir(buildDir, { recursive: true }, (err) => {
    if (err) throw err;
  });
  const outputDir = path.resolve(`${__dirname}/output_schemas`);
  var files = [
    "checkLink_v2.schema.json",
    "config_v2.schema.json",
    "context_v2.schema.json",
    "find_v2.schema.json",
    "goTo_v2.schema.json",
    "httpRequest_v2.schema.json",
    "moveTo_v2.schema.json",
    "runShell_v2.schema.json",
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
  fs.writeFileSync(`${__dirname}/schemas.json`, JSON.stringify(schemas,null,2));
  
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

// Prepend app-root path to referenced relative paths
function deleteDollarIds(schema) {
  for (let [key, value] of Object.entries(schema)) {
    if (typeof value === "object") {
      deleteDollarIds(value);
    }
    if (key === "$id") {
      delete schema[key]
    }
  }
  return schema;
}
