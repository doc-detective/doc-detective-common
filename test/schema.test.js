const { schema } = require("..");
const Ajv = require("ajv");
const ajv = new Ajv();
const validate = ajv.compile(schema.v1.actions.runShell);

test("schema examples pass validation", () => {
  expect(validate(schema.v1.actions.runShell.examples[0])).toBe(true);
});