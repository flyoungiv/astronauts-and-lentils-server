const express = require('express')
const app = express()

const cors = require('cors');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/flights', function (req, res) {
    const { landSuccess, reused, withReddit } = req.query
    console.log(landSuccess)
    console.log(reused)
    console.log(withReddit)

    const checkFlightCriteria = flight => {
        const landSuccessCheck = landSuccess === 'true'
            ? flight.rocket.first_stage.cores[0].land_success
            : true
        const reusedCheck = reused === 'true'
            ? flight.rocket.first_stage.cores[0].reused
            : true
        const withRedditCheck = withReddit === 'true'
            ? (flight.links.reddit_campaign || flight.links.reddit_launch || flight.links.reddit_recovery || flight.links.reddit_media)
            : true
        return landSuccessCheck && reusedCheck && withRedditCheck
    }

    const data = db.get('flights')
        .filter(flight => checkFlightCriteria(flight))
        .value()
    data
        ? res.send(data)
        : res.sendStatus(404)
})

app.get('/flights/:flightNumber', function (req, res) {
    const { flightNumber } = req.params
    res.send(
        db.get('flights')
            .find({ flight_number: parseInt(flightNumber) })
            .value()
    )
})

app.get('/flights/year/:year', function (req, res) {
    const { year } = req.params
    res.send(
        db.get('flights')
            .filter({ launch_year: year })
            .value()
    )
})

app.listen(PORT)