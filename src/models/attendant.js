const io = require("socket.io-client");
const api = require("../controllers/index");

const Report = require("./report");

class Attendant extends Report {
  constructor(id, name, email, token, eventId, totalScore, code) {
    super("Connect attendant socket", undefined, 0);

    this.id = id;
    this.name = name;
    this.email = email;
    this.token = token;
    this.eventId = eventId;
    this.totalScore = totalScore;
    this.socketConnected = false;
    this.socketReconnecting = false;
    this.listenedQuestion = false;
    this.listenedAnswer = false;
    this.lastTime = new Date().getTime();
    this.durationSinceLastTime = 0;
    this.callUpdateScoreSuccess = false;

    this.socket = null;
  }

  connect = () => {
    this.socket = io.connect(process.env.BASE_URL, {
      reconnection: true,
      upgrade: false,
      transports: ["websocket"]
    });

    if (this.socket) {
      this.socket.emit("eventId", this.eventId);

      this.socket.on("connect", () => {
        // console.log("connected", this.name);

        this.connectSuccess = true;
        this.socketConnected = true;

        const now = new Date().getTime();

        this.durationSinceLastTime = (now - this.lastTime) / 1000;

        Report.pushSocketReport({ [this.email]: this });
      });

      this.socket.io.on("reconnect", (attempt) => {
        this.socketConnected = true;
        this.socketReconnecting = false;

        const now = new Date().getTime();

        this.durationSinceLastTime = (now - this.lastTime) / 1000;
      });

      this.socket.io.on("reconnect_attempt", (attempt) => {
        this.socketConnected = false;
        this.socketReconnecting = true;
      });

      this.socket.on("");

      this.socket.on("connect_error", () => {
        // console.log("connect_error");

        this.socketConnected = false;

        Report.pushSocketReport({ [this.email]: this });
      });

      this.socket.on("disconnect", (reason) => {
        // console.log("disconnect", reason);
        this.socketConnected = false;
      });

      this.socket.on("Full Question Data", (question) => {
        this.socketConnected = true;
        this.listenedQuestion = true;

        Report.pushSocketReport({ [this.email]: this });

        setTimeout(() => {
          const index = Math.floor(Math.random() * (4 - 1 + 1) + 1);

          const answer = question.options[index];

          this.socket.emit("answerFromUser", {
            option: answer,
            questionId: question._id
          });
        }, 5000);
      });

      this.socket.on("SHOW ANSWER", (question) => {
        this.socketConnected = true;
        this.listenedQuestion = true;
        this.listenedAnswer = true;

        Report.pushSocketReport({ [this.email]: this });

        if (this.id) {
          api.updateAttendantScore(this.id, question.score).then((response) => {
            Report.push(
              new Report(
                "Attendant update score " + `("${response.config.url}")`,
                response.ok,
                response.status,
                response.problem
              )
            );

            if (response.status == 200 || response.ok) {
              this.callUpdateScoreSuccess = true;
            }
          });
        }
      });
    }
  };
}

module.exports = Attendant;
