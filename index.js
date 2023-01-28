const v1_analytics = require("./schema/v1/analytics.schema.json");
const v1_runShell = require("./schema/v1/actions/runShell.schema.json");

const schema = {
  v1: {
    actions: {
      runShell: v1_runShell,
    },
    analytics: v1_analytics,
  },
};

exports.schema = schema;
