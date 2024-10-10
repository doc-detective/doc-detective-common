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
      content = await fs.promises.readFile(fileURL, "utf8");  
    } catch (error) {  
      if (error.code === 'ENOENT') {  
        console.warn(`File not found: ${fileURL}`);  
      } else {  
        console.warn(`Error reading file: ${error.message}`);  
      }  
      return null;  
    }  
  }

  // Parse based on file content, and return either object or string
  try {
    // Try to parse as JSON
    return JSON.parse(content);
  } catch (error) {
    try {
      // Try to parse as YAML
      return YAML.parse(content);
    } catch (error) {
      // Return raw content if not JSON or YAML
      return content;
    }
  }

}

module.exports = { readFile };
