const fs = require("fs");
const path = require("path");
const { validate } = require("./validate");

exports.resolvePaths = resolvePaths;

/**
 * Resolves paths in config and spec objects based on the provided configuration, object type, object, and source file path.
 *
 * @param {object} config - The configuration object.
 * @param {object} object - The object containing the paths to resolve.
 * @param {string} filePath - The path of the file that contains the relative paths.
 * @param {boolean} [nested=false] - Whether the object is nested within another object.
 * @param {string} [objectType] - The type of object to resolve paths in ("config" or "spec"). Required if the object is nested.
 * @returns {object} - The object with resolved paths.
 */
async function resolvePaths(
  config,
  object,
  filePath,
  nested = false,
  objectType
) {
  // Config properties that contain paths
  const configPaths = [
    "input",
    "output",
    "envVariables",
    "setup",
    "cleanup",
    "mediaDirectory",
    "downloadDirectory",
    "path",
  ];
  // Spec properties that contain paths
  const specPaths = [
    "file",
    "path",
    "directory",
    "setup",
    "cleanup",
    "savePath",
    "saveDirectory",
    "workingDirectory",
  ];

  /**
   * Resolves a path based on the provided base type, relative path, and file path.
   *
   * @param {string} baseType - The base type of the path ("file" or "cwd").
   * @param {string} relativePath - The relative path to resolve.
   * @param {string} filePath - The file path to use as a reference.
   * @returns {string} - The resolved path.
   */
  function resolve(baseType, relativePath, filePath) {
    // If path is already absolute, return it
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }
    // If filePath is a file, use its directory as the base path
    filePath = fs.lstatSync(filePath).isFile()
      ? path.dirname(filePath)
      : filePath;
    // Resolve the path based on the base type
    return baseType === "file"
      ? path.resolve(filePath, relativePath)
      : path.resolve(relativePath);
  }

  const relativePathBase = config.relativePathBase;
  
  let pathProperties;
  if (!nested && !objectType) {
    // Check if object matches the config schema
    const validation = validate("config_v2", object);
    if (validation.valid) {
      pathProperties = configPaths;
      objectType = "config";
    } else {
      // Check if object matches the spec schema
      const validation = validate("spec_v2", object);
      if (validation.valid) {
        pathProperties = specPaths;
        objectType = "spec";
      } else {
        throw new Error("Object isn't a valid config or spec.");
      }
    }
  } else if (nested && !objectType) {
    // If the object is nested, the object type is required
    throw new Error("Object type is required for nested objects.");
  } else if (objectType === "config") {
    // If the object type is config, use configPaths
    pathProperties = configPaths;
  } else if (objectType === "spec") {
    // If the object type is spec, use specPaths
    pathProperties = specPaths;
  }

  for (const property of Object.keys(object)) {
    if (typeof object[property] === "object") {
      // If the property is an object, recursively call resolvePaths to resolve paths within the object
      object[property] = await resolvePaths(
        config,
        object[property],
        filePath,
        true,
        objectType
      );
    } else if (typeof object[property] === "string") {
      // If the property is a string, check if it matches any of the path properties and resolve it if it does
      pathProperties.forEach((path) => {
        if (object[path]) {
          object[path] = resolve(relativePathBase, object[path], filePath);
        }
      });
    }
  }
  return object;
}
