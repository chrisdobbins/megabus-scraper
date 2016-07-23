'use strict';
(function () {
    const requestPromise = require('request-promise'),
        getAllOriginIds = require('./get-all-origins.js'),
        getAvailableDestinations = require('./get-available-destinations.js'),
        getTripInfo = require('./get-trip-info.js'),
        parseTripInfo = require('./parse-trip-info.js'),
        processArgs = require('./process-args.js');

    function main() {
        // TODO: add logic to sanitize city input and check that there is always
        // an outbound city and date
        const origin = process.argv[2],
            destination = process.argv[3],
            inboundDeparture = processArgs.sanitizeDate(process.argv[5]),
            outboundDeparture = processArgs.sanitizeDate(process.argv[4]);
        mapOriginToDestinations(origin).then(destinations => {
            tripInfoForOriginAndDest(destination, destinations, outboundDeparture, inboundDeparture).then(fullTripInfo => {
                console.log(JSON.stringify(fullTripInfo, null, 2));
            });
        });
    }

    function mapOriginToDestinations(originCity) {
        return getAllOriginIds().then(allOrigins => {
            return getAvailableDestinations(originCity, allOrigins);
        });
    }

    function tripInfoForOriginAndDest(destination, availableDestinations, outboundDeparture, inboundDeparture) {
        const safeDestination = processArgs.verifyDestinationInput(availableDestinations, destination),
            safeOrigin = availableDestinations.origin;
        console.log(safeDestination);
        return getTripInfo(safeOrigin, safeDestination, outboundDeparture, inboundDeparture).then(tripInfo => {
            return {
                outbound: {
                    departuredate: outboundDeparture,
                    trips: parseTripInfo(tripInfo, 'Outbound')
                },
                inbound: {
                    departuredate: (inboundDeparture) ? inboundDeparture : '',
                    trips: parseTripInfo(tripInfo, 'Inbound')
                }
            };
        });
    }

    main();

})();
