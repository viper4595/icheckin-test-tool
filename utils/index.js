const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");

const ObjectID = require("bson-objectid");

const writeLine = (fileName = "fileName", data) => {
  const writeStream = fs.createWriteStream(`${fileName}`);

  writeStream.write(data);
  writeStream.end();
};

const readLine = (fileName, callback) => {
  const results = [];
  const readStream = fs.createReadStream(fileName);

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  rl.on("line", (line) => {
    results.push(JSON.parse(line));
  }).on("close", () => {
    callback(results);
  });
};

let events = [];

// generate attendants data to import to mongo
const generateAttendantDocuments = (eventId, userId, order = 1) => {
  let count = 0;
  let results = [];

  const sample = {
    _id: { $oid: "6134acdbbd56b2dda4e7dc41" },
    isEmailSent: {
      emailSent: true,
      sentTime: { $date: "1970-01-01T00:00:00.000Z" }
    },
    isComing: {
      isComing: true,
      confirmingTime: { $date: "1970-01-01T00:00:00.000Z" }
    },
    checkin: {
      checkinStatus: true,
      checkinOrCheckoutTime: { $date: "2021-09-05T17:15:59.280Z" }
    },
    pinCode: "ADMINS",
    shoppingCart: [],
    totalScore: 0,
    attendantName: "Attendant test_target 0",
    attendantEmail: "test+0+0@gmail.com",
    department: "AAA",
    event: { $oid: "6134acdbbd56b2dda4e7dc3d" },
    created: { createdBy: { $oid: "6134acd8bd56b2dda4e7dc33" } },
    attendantAccessToken: "123s"
  };

  while (count < 400) {
    const attendant = {
      ...sample,
      _id: { $oid: ObjectID() + "" },
      attendantName: `Attendant test_target ${order}`,
      attendantEmail: `test+${order}+${count}@gmail.com`,
      event: { $oid: eventId },
      created: { createdBy: { $oid: userId } },
      attendantAccessToken: crypto.randomBytes(128).toString("hex")
    };

    results.push(attendant);

    count++;
  }

  //   writeLine(
  //     `attendants_${order}_${results.length}.json`,
  //     JSON.stringify(results)
  //   );

  return results;
};

const createAttendantDocuments = (fileName) => {
  if (!fileName) {
    console.log(new Error("Please add a file name"));

    return;
  }

  let events = [];
  let attendants = [];

  readLine(fileName, (results) => {
    results.map((res, index) => {
      const { eventId, userId } = res;

      const result = generateAttendantDocuments(eventId, userId, index);

      attendants = [
        ...attendants,
        ...result.map(({ attendantEmail, pinCode }) =>
          JSON.stringify({
            eventId,
            attendantEmail,
            pinCode
          })
        )
      ];

      events = [...events, ...result];
    });

    writeLine(`attendants.${process.env.NODE_ENV}.csv`, attendants.join("\n"));
    writeLine(
      `attendants_${events.length}.${process.env.NODE_ENV}.json`,
      JSON.stringify(events)
    );
  });
};

module.exports = { writeLine, readLine, createAttendantDocuments };
