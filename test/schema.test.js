const { validate, schemas } = require("../src/index");
const assert = require('assert');

// Loop through JSON schemas
for (const [key, value] of Object.entries(schemas)) {
  describe(`${key} schema`, function() {
    it('has one or more examples', function() {
      // Schema needs one or more examples
      assert(value.examples);
      assert(value.examples.length >= 1);
    });

    // Loop through and validate schema examples
    value.examples.forEach((example, index) => {
      it(`example with index ${index} passes validation`, function() {
        const validityCheck = validate(key, example);
        if (validityCheck.errors != "") {
          console.log(key);
          console.log(validityCheck.errors);
        }
        assert.strictEqual(validityCheck.valid, true);
      });
    });
  });
}
