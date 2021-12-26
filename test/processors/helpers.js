const dotenv = require("dotenv");

if (process.env.NODE_ENV == "staging") {
  dotenv.config({ path: ".env.staging" });
} else {
  dotenv.config();
}

const utils = require("../../utils");

module.exports = {
  configEnv,
  generateDate,
  generateQuestions,
  saveEvent,
  saveAttendant,
  saveQuestion
};

const MAX_CLIENTS = 4000;
const MAX_EVENTS = 10;

// run before scenario
function configEnv(context, ee, next) {
  context.vars["$processEnvironment"].URL = process.env.BASE_URL + "/api";
  context.vars["$processEnvironment"].SECRET = process.env.SECRET;
  context.vars["$processEnvironment"].MAX_CLIENTS = MAX_CLIENTS;

  return next();
}

// run before request
function generateDate(requestParams, context, ee, next) {
  context.vars.startDate = new Date();
  context.vars.endDate = new Date();

  return next();
}

// run before request
function generateQuestions(requestParams, context, ee, next) {
  context.vars.questionOne = "How many eyes do you have?";
  context.vars.optionsOne = ["1", "2", "3", "4"];
  context.vars.answerOne = ["2"];

  context.vars.questionTwo = "Which animal is the king of jungle?";
  context.vars.optionsTwo = ["Tiger", "Monkey", "Lion", "Elephant"];
  context.vars.answerTwo = ["Lion"];

  return next();
}

let events = [];

function saveEvent(requestParams, response, context, ee, next) {
  const data = JSON.parse(response.body);

  events.push(
    JSON.stringify({
      eventId: data._id,
      userId: data.createdBy
    })
  );

  if (events.length === MAX_EVENTS) {
    console.log("events", events);

    utils.writeLine("test/events.csv", events.join("\n"));
  }

  return next();
}

let attendants = [];

// run after request
function saveAttendant(requestParams, response, context, ee, next) {
  const data = JSON.parse(response.body);

  attendants.push(data);

  if (attendants.length === MAX_CLIENTS) {
    const pinCodes = attendants.map(({ attendantEmail, pinCode }) =>
      JSON.stringify({
        attendantEmail,
        pinCode
      })
    );

    utils.writeLine("test/attendants.csv", pinCodes.join("\n"));
  }

  return next();
}

let questions = [];

function saveQuestion(requestParams, response, context, ee, next) {
  const data = JSON.parse(response.body);

  questions.push(
    JSON.stringify({
      userId: context.vars.userId,
      ...data
    })
  );

  if (questions.length === 10) {
    utils.writeLine("test/questions.csv", questions.join("\n"));
  }

  return next();
}
