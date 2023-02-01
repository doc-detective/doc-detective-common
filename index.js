const v1_analytics = require("./schema/v1/analytics.schema.json");
const v1_runShell = require("./schema/v1/actions/runShell.schema.json");

const schema = {
  checkLink_v1: require("./schema/v1/actions/checkLink.schema.json"),
  stopRecording_v1: require("./schema/v1/actions/stopRecording.schema.json"),
  runShell_v1: require("./schema/v1/actions/runShell.schema.json"),
  analytics_v1: require("./schema/v1/analytics.schema.json"),
};

exports.schema = schema;
