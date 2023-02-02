const { schema } = require("../src/schema");
const { validate } = require("../src/validate");

// Loop through JSON schemas
for (const [key, value] of Object.entries(schema)) {
  test(`${key} schema has one or more examples`, () => {
    // Schema needs one or more examples
    expect(value.examples).toBeTruthy();
    expect(value.examples.length).toBeGreaterThanOrEqual(1);
  });
  // Loop through and validate schema examples
  value.examples.forEach((example, index) => {
    test(`${key} example with index ${index} passes validation`, () => {
      expect(validate(key, example).valid).toBe(true);
    });
  });
}
