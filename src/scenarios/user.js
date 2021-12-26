const io = require("socket.io-client");

const users = new Array(10).fill();

const utils = require("../../utils");
const log = require("../../utils/logReport");
const api = require("../controllers");

const Report = require("../models/report");

const runScenarioC = () => {
  users.map((item, index) => {
    api
      .signInUser(`test+${index}@gmail.com`, "111111")
      .then((response) => {
        Report.push(
          new Report(
            "Sign in user " + `("${response.config.url}")`,
            response.ok,
            response.status,
            response.problem
          )
        );

        const data = response.data;

        utils.readLine("./test/questions.csv", (questions) => {
          //   const questions = JSON.parse(results);
          //   console.log("questions", questions);
          //   console.log("data", data);

          const question = questions.find((item) => {
            return item.userId == data.id;
          });

          //   if (index === 0) {
          if (true) {
            const socket = io(process.env.BASE_URL);

            const { userId, ...other } = question;

            socket.emit("eventId", question.event);
            socket.emit("questionData", other);

            setTimeout(() => {
              socket.emit("questionIdToShowAnswer", question._id);
            }, 10000);
          }
        });
      })
      .catch((error) => console.log("Error", error));
  });

  log.logHttpReport();
};

module.exports = { runScenarioC };
