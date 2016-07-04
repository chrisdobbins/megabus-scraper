'use strict';
const requestPromise = require('request-promise'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    getAllOriginIds = require('./get-all-origins.js'),
    getAvailableDestinations = require('./get-available-destinations.js');

function main() {
    getAllOriginIds().then( allOrigins => {
        // need to sanitize input rather than blindly trusting.
        const originCity = process.argv[2];
        const destinationCity = process.argv[3];
        // const outboundDepartureDate =


        // gets the destinations available for the desired origin
        getAvailableDestinations(originCity, allOrigins).
        then(availableDestinations => {
            const destination = verifyDestinationInput(availableDestinations, destinationCity),
                  origin = availableDestinations.origin,
                  inboundDepartureDate = sanitizeDate(process.argv[5]),
                  outboundDepartureDate = sanitizeDate(process.argv[4]);
            getTripInfo(origin, destination, outboundDepartureDate, inboundDepartureDate).
            then(tripInfo => {
                const allTrips = {
                      outbound: parseTripInfo(tripInfo, 'Outbound'),
                      inbound: parseTripInfo(tripInfo, 'Inbound')
                    };
                    console.log(JSON.stringify(allTrips, null, 2));
            });
        });
    });
}

function sanitizeDate(dateString) {
    let dirtyDate = new Date(dateString);
    const options = {
        year: 'numeric',
        day: '2-digit',
        month: '2-digit'
    };
    try {
        return dirtyDate.toLocaleDateString('en-US', options);
    } catch (e) {
        return e;
    }
}

function verifyDestinationInput(availableDestinations, destinationInput) {
    let verifiedDestination = null,
        validDestinationCities = availableDestinations.destinations.map(destination => {
            return ` ${destination.city}`;
        });
    availableDestinations.destinations.forEach((destination) => {
        if (destination.city === destinationInput) {
            verifiedDestination = destination;
        }
        return;
    });

    if (!verifiedDestination) {
        console.error(`invalid destination. valid destinations are:${validDestinationCities}`);
        return;
    }
    return verifiedDestination;
}

function parseTripInfo(tripInfo, direction) {
    const $ = cheerio.load(tripInfo);
    let i = 0,
        gridNum = 'l00',
        trips = [];
    while ($(`#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.five`).children().eq(0).text()) {
        gridNum = (i < 10) ? `l0${i}` : `l${i}`;
        let gridLineId = `#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.five`;
        let trip = {};
        if ($(gridLineId).children().eq(0).text()) {
            // TODO: DRY this up
            const departureDetails = eliminateWhiteSpace($(`#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.two`).children().eq(0).text()),
                  departure = processDetails(departureDetails);
            buildTripObj(departure.time, departure.city, departure.state, departure.location, 'departure', trip);

            // if trip allows seat reservations, fare descriptions will start with 'From'
            const priceInfoArr = eliminateWhiteSpace($('p', gridLineId).text()),
                  tripDuration = eliminateWhiteSpace($('p', `#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.three`).text()).join(' ');

            getPrice(priceInfoArr, trip);
            trip.duration = tripDuration;
            // ARRIVALS
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
      return tripObj;
    }
    return trips;
}

function getPrice(priceInfoArr, trip) {
  priceInfoArr[0] === 'From' ?
      trip.price = priceInfoArr[1] : trip.price = priceInfoArr[0];
  return trip;
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

function getTripInfo(origin, destination, outboundDepartureDate, inboundDepartureDate) {
    let journeyOptions = {
        uri: 'http://us.megabus.com/JourneyResults.aspx',
        qs: {
            originCode: origin.id,
            destinationCode: destination.id,
            outboundDepartureDate: outboundDepartureDate,
            inboundDepartureDate: ((inboundDepartureDate) ? inboundDepartureDate : ''),
            passengerCount: 1,
            transportType: 0,
            concessionCount: 0,
            nusCount: 0,
            outboundWheelchairSeated: 0,
            outboundOtherDisabilityCount: 0,
            outboundPcaCount: 0,
            promotionCode: '',
            withReturn: ((inboundDepartureDate) ? 1 : 0)
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0'
        }
    };
    return requestPromise(journeyOptions);
}


main();
