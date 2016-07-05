'use strict';
const cheerio = require('cheerio');

function parseTripInfo(tripInfo, direction) {
    const $ = cheerio.load(tripInfo);
    let i = 0,
        gridNum = 'l00',
        trips = [];
    while ($(`#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.five`).children().eq(0).text()) {
        gridNum = (i < 10) ? `l0${i}` : `l${i}`;
        const gridLineId = `#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.five`;
        let trip = {};
        if ($(gridLineId).children().eq(0).text()) {
            // DEPARTURE
            const departureDetails = eliminateWhiteSpace($(`#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.two`).children().eq(0).text()),
                departure = processDetails(departureDetails);
            buildTripObj(departure.time, departure.city, departure.state, departure.location, 'departure', trip);
            // PRICE
            const priceInfoArr = eliminateWhiteSpace($('p', gridLineId).text());
            trip.price = getPrice(priceInfoArr);
            trip.duration = eliminateWhiteSpace($('p', `#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.three`).text()).join(' ');
            // ARRIVAL
            const arrivalDetails = eliminateWhiteSpace($('.arrive', `#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.two`).text()),
                  arrival = processDetails(arrivalDetails);
            buildTripObj(arrival.time, arrival.city, arrival.state, arrival.location, 'arrival', trip);
            trips.push(trip);
        }
        i++;
    }

    function buildTripObj(time, city, state, location, tripType, tripObj) {
        tripObj[`${tripType}city`] = city;
        tripObj[`${tripType}time`] = time;
        tripObj[`${tripType}state`] = state;
        tripObj[`${tripType}location`] = location;
    }
    return trips;
}

function getPrice(priceInfoArr) {
    // if trip allows seat reservations, fare descriptions will start with 'From'
    return ((priceInfoArr[0] === 'From') ? priceInfoArr[1] : priceInfoArr[0]);
}


function processDetails(details) {
    let trip = {};
    let cityState = details[2].split(', ');
    trip.time = details[1];
    trip.city = cityState[0];
    trip.state = cityState[1];
    trip.location = details[4];
    return trip;
}

function eliminateWhiteSpace(text) {
    return text.trim().split(/\s\s+/g);
}

module.exports = parseTripInfo;
