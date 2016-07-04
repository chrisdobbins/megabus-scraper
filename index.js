'use strict';
(function() {
const requestPromise = require('request-promise'),
    getAllOriginIds = require('./get-all-origins.js'),
    getAvailableDestinations = require('./get-available-destinations.js'),
    getTripInfo = require('./get-trip-info.js'),
    parseTripInfo = require('./parse-trip-info.js');

function main() {
    const originCity = process.argv[2];
    const destinationCity = process.argv[3];
    getAllOriginIds().then( allOrigins => {
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
    const dirtyDate = new Date(dateString),
          options = {
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
main();
})();
