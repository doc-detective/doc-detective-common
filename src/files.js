const fs = require("fs");
const YAML = require("yaml");
const axios = require("axios");
const { URL } = require("url");

/**
 * Reads a file from a given URL or local file path and returns its content.
 * Supports JSON and YAML file formats.
 *
 * @param {string} fileURLOrPath - The URL or local file path of the file to read.
 * @returns {Promise<Object|string|null>} - The parsed content of the file if it's JSON or YAML,
 *                                          the raw content if it's another format,
 *                                          or null if an error occurs.
 */
async function readFile({ fileURLOrPath }) {
  if (!fileURLOrPath) {
    throw new Error("fileURLOrPath is required");
  }
  if (typeof fileURLOrPath !== "string") {
    throw new Error("fileURLOrPath must be a string");
  }
  if (fileURLOrPath.trim() === "") {
    throw new Error("fileURLOrPath cannot be an empty string");
  }

  let content;
  let isRemote = false;

  try {
    const parsedURL = new URL(fileURLOrPath);
    isRemote =
      parsedURL.protocol === "http:" || parsedURL.protocol === "https:";
  } catch (error) {
    // Not a valid URL, assume local file path
  }

  if (isRemote) {
    try {
      const response = await axios.get(fileURLOrPath);
      content = response.data;
    } catch (error) {
      console.warn(
        `Error reading remote file from ${fileURLOrPath}: ${error.message}`
      );
      return null;
    }
  } else {
    try {
      content = await fs.promises.readFile(fileURLOrPath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        console.warn(`File not found: ${fileURLOrPath}`);
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
