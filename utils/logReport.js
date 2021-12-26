const Report = require("../src/models/report");

const logHttpReport = (interval = 5000) => {
  setInterval(() => {
    const now = new Date();

    console.log("");
    console.log(now, now.getSeconds() + "(sec)");
    console.log("------------");
    console.log("HTTP Report:");
    console.log(Report.createReport());
  }, interval);
};

const logSocketReport = (interval = 5000) => {
  setInterval(() => {
    const now = new Date();

    console.log("");
    console.log(now, now.getSeconds() + "(sec)");
    console.log("------------");
    console.log("WS Report:");
    console.log(Report.createSocketReport());
  }, interval);
};

module.exports = { logHttpReport, logSocketReport };
