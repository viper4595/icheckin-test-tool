const { create } = require("apisauce");

const api = create({
  baseURL: process.env.BASE_URL + "/api"
});

const signInUser = (email, password) => {
  return api.post("/login", { email, password });
};

const checkInAttendant = (attendantEmail, pinCode) => {
  return api.post("/checkin", { attendantEmail, pinCode });
};

const updateAttendantScore = (checkedinAttendantId, score) => {
  return api.post("/event/answerScore", { checkedinAttendantId, score });
};

module.exports = { checkInAttendant, signInUser, updateAttendantScore };
