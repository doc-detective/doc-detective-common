const { validate, schemas } = require("../src/index");

// Loop through JSON schemas
for (const [key, value] of Object.entries(schemas)) {
  test(`${key} schema has one or more examples`, () => {
    // Schema needs one or more examples
    expect(value.examples).toBeTruthy();
    expect(value.examples.length).toBeGreaterThanOrEqual(1);
  });
  // Loop through and validate schema examples
  value.examples.forEach((example, index) => {
    test(`${key} example with index ${index} passes validation`, () => {
      const validityCheck = validate(key, example);
      if (validityCheck.errors != "") {
        console.log(key);
        console.log(validityCheck.errors);
      }
      expect(validityCheck.valid).toBe(true);
    });
  });
}
