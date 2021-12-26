const { groupBy, prop } = require("ramda");

let reports = [];
let socketReports = {};

let min = 0;
let max = 0;
let avg = 0;
let durations = {};

class Report {
  constructor(reportName, connectSuccess, code, problem) {
    this.reportName = reportName;
    this.createdTime = new Date();
    this.connectSuccess = !!connectSuccess;
    // this.connectFailed = false;
    this.code = code || 0;
    this.problem = problem;
  }

  static push(report) {
    reports.push(report);
  }

  static pushSocketReport(report) {
    socketReports = { ...socketReports, ...report };
  }

  static getReport() {
    return reports;
  }

  static getSocketReport() {
    return socketReports;
  }

  static createReport() {
    let collection = {};

    reports.map((report) => {
      const { reportName, createdTime, connectSuccess, code, problem } = report;

      if (collection.hasOwnProperty(reportName)) {
        const current = collection[reportName];

        if (connectSuccess) {
          current.success += 1;
        } else {
          current.failed += 1;
        }

        if (current.code.hasOwnProperty(code)) {
          current.code[code] += 1;
        } else {
          current.code[report.code] = 1;
        }

        if (current.problem.hasOwnProperty(problem)) {
          current.problem[problem] += 1;
        } else {
          current.problem[problem] = 1;
        }
      } else {
        const current = {
          success: 0,
          failed: 0,
          code: {
            [`${code}`]: 1
          },
          problem: {
            [problem]: 1
          }
        };

        if (connectSuccess) {
          current.success = 1;
        } else {
          current.failed = 1;
        }

        collection = { ...collection, [`${reportName}`]: current };
      }
    });

    return collection;
  }

  static createSocketReport() {
    let aloha = {};
    let results = {};

    let total = 0;
    let totalRoom = 0;

    for (const prop in socketReports) {
      const report = socketReports[prop];
      const { eventId } = report;

      total++;

      if (aloha.hasOwnProperty(eventId)) {
        aloha[eventId].push(report);
      } else {
        const current = {};
        aloha = { ...aloha, [eventId]: [report] };

        totalRoom++;
      }
    }

    let totalConnected = 0;
    let totalDisConnected = 0;
    let totalReconnecting = 0;

    let totalListenedQuestion = 0;
    let totalListenedAnswer = 0;
    let totalCallUpdateScoreSuccess = 0;

    for (const prop in aloha) {
      const arr = aloha[prop];

      arr.map((item, index) => {
        durations = { ...durations, [item.name]: item.durationSinceLastTime };

        if (min === 0) {
          min = item.durationSinceLastTime;
        } else if (min > item.durationSinceLastTime) {
          min = item.durationSinceLastTime;
        }

        if (max === 0) {
          max = item.durationSinceLastTime;
        } else if (max < item.durationSinceLastTime) {
          max = item.durationSinceLastTime;
        }
      });

      avg =
        Object.values(durations).reduce((total, item) => (total += +item), 0) /
        Object.values(durations).length;

      const connected = arr.reduce((total, item) => {
        if (item.socketConnected) {
          return (total += 1);
        }

        return total;
      }, 0);

      totalConnected += connected;

      const disconnectedAttendants = [];

      const disconnected = arr.reduce((total, item) => {
        if (!item.socketConnected) {
          //   disconnectedAttendants.push(item.email);

          return (total += 1);
        }

        return total;
      }, 0);

      totalDisConnected += disconnected;

      const reconnecting = arr.reduce((total, item) => {
        if (item.socketReconnecting) {
          return (total += 1);
        }

        return total;
      }, 0);

      totalReconnecting += reconnecting;

      const listenedQuestion = arr.reduce((total, item) => {
        if (item.listenedQuestion) {
          //   disconnectedAttendants.push(item.email);

          return (total += 1);
        }

        return total;
      }, 0);

      totalListenedQuestion += listenedQuestion;

      const listenedAnswer = arr.reduce((total, item) => {
        if (item.listenedAnswer) {
          //   disconnectedAttendants.push(item.email);

          return (total += 1);
        }

        return total;
      }, 0);

      totalListenedAnswer += listenedAnswer;

      const callUpdateScoreSuccess = arr.reduce((total, item) => {
        if (item.callUpdateScoreSuccess) {
          //   disconnectedAttendants.push(item.email);

          return (total += 1);
        }

        return total;
      }, 0);

      totalCallUpdateScoreSuccess += callUpdateScoreSuccess;

      const result = {
        [`Room: ${prop}`]: {
          total: arr.length,
          connected,
          disconnected,
          reconnecting,
          listenedQuestion,
          listenedAnswer,
          callUpdateScoreSuccess,
          disconnectedAttendants
        }
      };

      results = {
        ...results,
        ...result
      };
    }

    results = {
      Summary: {
        total,
        totalRoom,
        totalConnected,
        totalDisConnected,
        totalReconnecting,
        totalListenedQuestion,
        totalListenedAnswer,
        totalCallUpdateScoreSuccess,
        min: +min.toFixed(2),
        max: +max.toFixed(2),
        avg: +avg.toFixed(2)
      },
      ...results
    };

    return results;
  }
}

module.exports = Report;
