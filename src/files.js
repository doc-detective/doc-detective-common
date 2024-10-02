const fs = require("fs");
const YAML = require("yaml");
const axios = require("axios");

/**
 * Reads a file from a given URL or local file path and returns its content.
 * Supports JSON and YAML file formats.
 *
 * @param {string} fileURL - The URL or local file path of the file to read.
 * @returns {Promise<Object|string|null>} - The parsed content of the file if it's JSON or YAML, 
 *                                          the raw content if it's another format, 
 *                                          or null if an error occurs.
 */
async function readFile(fileURL) {

  let content;
  if (fileURL.match(/^(https:\/\/|http:\/\/)/)) {
    try {
      const response = await axios.get(fileURL);
      content = response.data;
    } catch (error) {
      console.warn(`Error reading file: ${error}`);
      return null;
    }
  } else {
    try {
      content = fs.readFileSync(fileURL, "utf8");
    } catch (error) {
      console.warn(`Error reading file: ${error}`);
      return null;
    }
  }

  // Parse JSON or YAML content
  if (fileURL.endsWith(".json")) {
    return JSON.parse(content);
  } else if (fileURL.endsWith(".yaml") || fileURL.endsWith(".yml")) {
    return YAML.parse(content);
  } else {
    // Return raw content for other file formats
    return content;
  }
}

module.exports = { readFile };
