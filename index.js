const dotenv = require("dotenv");

if (process.env.NODE_ENV == "staging") {
  dotenv.config({ path: ".env.staging" });
} else {
  dotenv.config();
}

const utils = require("./utils");
const user = require("./src/scenarios/user");
const attendant = require("./src/scenarios/attendant");

// Generate test files related to attendants
const generateTestFiles = (enable) => {
  if (enable) {
    utils.createAttendantDocuments("./test/events.csv");
  }
};

generateTestFiles(false);

// user.runScenarioC();
// attendant.runScenarioA({ maxClients: 4000, delay: 80 });
attendant.runScenarioB({ maxClients: 4000 });
