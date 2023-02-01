const { schema } = require("../src/schema");
const { validate } = require("../src/validate");

// Loop through JSON schemas
for (const [key, value] of Object.entries(schema)) {
  test(`${key} schema examples pass validation`, () => {
    // Schema needs one or more examples
    expect(value.examples).toBeTruthy();
    expect(value.examples.length).toBeGreaterThanOrEqual(1);
    // Loop through and validate schema examples
    value.examples.forEach((example) => {
      expect(validate(key, example)).toBe(true);
    });
  });
}
