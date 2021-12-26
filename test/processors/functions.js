const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  myFunction,
  configEnv,
  logResult
};

function configEnv(context, ee, next) {
  //   console.log("context", context);
  //   console.log("ee", ee);

  context.vars["$processEnvironment"].URL = process.env.BASE_URL + "/api";

  return next();
}

function logResult(requestParams, response, context, ee, next) {
  //   console.log("context", context);

  console.log("okokoko");

  return next();
}

function setJSONBody(requestParams, context, ee, next) {
  return next(); // MUST be called for the scenario to continue
}

function logHeaders(requestParams, response, context, ee, next) {
  console.log(response.headers);
  return next(); // MUST be called for the scenario to continue
}

function myBeforeRequestHandler(requestParams, context, ee, next) {
  return next(); // MUST be called for the scenario to continue
}

function myAfterRequestHandler(requestParams, context, ee, next) {
  return next(); // MUST be called for the scenario to continue
}

function myFunction(requestParams, context, ee, next) {
  console.log("requestParams", requestParams);
  console.log("context", context);
  console.log("ee", ee);

  return next();
}
