const fs = require("fs");
const path = require("path");
const { validate } = require("./validate");

exports.resolvePaths = resolvePaths;

/**
 * Resolves relative paths in configuration and specification objects to absolute paths.
 * 
 * This function traverses an object (either a config or spec) and converts all path properties
 * to absolute paths based on the provided configuration and file path. It can handle nested objects
 * and special path relationships like path/directory and savePath/saveDirectory.
 *
 * @async
 * @param {Object} options - The options object.
 * @param {Object} options.config - The configuration object containing settings like relativePathBase.
 * @param {Object} options.object - The object whose paths need to be resolved.
 * @param {string} options.filePath - The reference file path for resolving relative paths.
 * @param {boolean} [options.nested=false] - Flag indicating if this is a recursive call for a nested object.
 * @param {string} [options.objectType] - The type of object ('config' or 'spec'). Required for nested objects.
 * @returns {Promise<Object>} The object with all paths resolved to absolute paths.
 * @throws {Error} Throws an error if the object isn't a valid config or spec, or if objectType is missing for nested objects.
 */
async function resolvePaths({
  config,
  object,
  filePath,
  nested = false,
  objectType,
}) {
  // Config properties that contain paths
  const configPaths = [
    "input",
    "output",
    "envVariables",
    "setup",
    "cleanup",
    "mediaDirectory",
    "downloadDirectory",
    "descriptionPath",
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
    "descriptionPath",
    "workingDirectory",
  ];
  // Spec objects that are configurable by the user and shouldn't be resolved
  const specNoResolve = [
    "requestData",
    "responseData",
    "requestHeaders",
    "responseHeaders",
    "requestParams",
    "responseParams",
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
    const validation = validate({
      schemaKey: "config_v3",
      object: { ...object },
    });
    if (validation.valid) {
      pathProperties = configPaths;
      objectType = "config";
    } else {
      // Check if object matches the spec schema
      const validation = validate({
        schemaKey: "spec_v3",
        object: { ...object },
      });
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
    if (
      typeof object[property] === "object" &&
      ((objectType === "spec" && !specNoResolve.includes(property)) ||
        objectType === "config")
    ) {
      // If the property is an object, recursively call resolvePaths to resolve paths within the object
      object[property] = await resolvePaths({
        config: config,
        object: object[property],
        filePath: filePath,
        nested: true,
        objectType: objectType
      }
      );
    } else if (typeof object[property] === "string") {
      // If the property is a string, check if it matches any of the path properties and resolve it if it does
      pathProperties.forEach((pathProperty) => {
        if (object[pathProperty]) {
          if (pathProperty === "path" && object.directory) {
            if (path.isAbsolute(object.directory)) {
              object[pathProperty] = resolve(
                relativePathBase,
                object[pathProperty],
                object.directory
              );
            } else {
              object[pathProperty] = path.join(
                object.directory,
                object[pathProperty]
              );
            }
          } else if (pathProperty === "savePath" && object.saveDirectory) {
            if (path.isAbsolute(object.saveDirectory)) {
              object[pathProperty] = resolve(
                relativePathBase,
                object[pathProperty],
                object.saveDirectory
              );
            } else {
              object[pathProperty] = path.join(
                object.saveDirectory,
                object[pathProperty]
              );
            }
          } else {
            object[pathProperty] = resolve(
              relativePathBase,
              object[pathProperty],
              filePath
            );
          }
        }
      });
    }
  }
  return object;
}
