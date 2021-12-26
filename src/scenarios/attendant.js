const io = require('socket.io-client')
const delay = require('lodash/delay')

const utils = require('../../utils')
const log = require('../../utils/logReport')
const api = require('../controllers')

const Attendant = require('../models/attendant')
const Report = require('../models/report')

const attendants = []

// Scenarios: Attendants check-in then connecting to socketIO
const runScenarioA = ({ minClients = 0, maxClients, delay = 0 }) => {
  utils.readLine(`./attendants.${process.env.NODE_ENV}.csv`, (results) => {
    // get all attendants data from file
    const arr = results.slice(minClients, maxClients)

    // check-in attendant
    arr.map((item, index) => {
      setTimeout(() => {
        const response = api
          .checkInAttendant(item.attendantEmail, item.pinCode)
          .then((response) => {
            Report.push(
              new Report(
                'Check-in attendant ' + `("${response.config.url}")`,
                response.ok,
                response.status,
                response.problem
              )
            )

            if (response.ok && response.data) {
              const item = response.data

              const attendant = new Attendant(
                item._id,
                item.attendantName,
                item.attendantEmail,
                item.attendantAccessToken,
                item.event,
                item.totalScore,
                response.status
              )

              attendant.connect()

              // store all active attendants
              attendants.push(attendant)
            }
          })
          .catch((error) => console.log('Error: ', error))
      }, index * delay)
    })
  })

  log.logHttpReport()
  log.logSocketReport()
}

// Scenarios: Attendant connect to socketIO
const runScenarioB = ({ minClients = 0, maxClients }) => {
  utils.readLine(`./attendants.${process.env.NODE_ENV}.csv`, (results) => {
    // get all attendants data from file
    const arr = results.slice(minClients, maxClients)

    // check-in attendant
    arr.map((item, index) => {
      const attendant = new Attendant(
        undefined,
        index,
        item.attendantEmail,
        '',
        item.eventId,
        0,
        null
      )

      attendant.connect()

      // store all active attendants
      attendants.push(attendant)
    })
  })

  log.logSocketReport()
}

module.exports = { runScenarioA, runScenarioB }
