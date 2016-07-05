'use strict';
(function() {
    const requestPromise = require('request-promise'),
        getAllOriginIds = require('./get-all-origins.js'),
        getAvailableDestinations = require('./get-available-destinations.js'),
        getTripInfo = require('./get-trip-info.js'),
        parseTripInfo = require('./parse-trip-info.js'),
        processArgs = require('./process-args.js');

    function main() {
      // TODO: add logic to sanitize city input and check that there is always
      // an outbound city and date
        const originCity = process.argv[2],
            destinationCity = process.argv[3],
            inboundDepartureDate = processArgs.sanitizeDate(process.argv[5]),
            outboundDepartureDate = processArgs.sanitizeDate(process.argv[4]);
        getAllOriginIds().then(allOrigins => {
            getAvailableDestinations(originCity, allOrigins).
            then(availableDestinations => {
                const destination = processArgs.verifyDestinationInput(availableDestinations, destinationCity),
                    origin = availableDestinations.origin;
                getTripInfo(origin, destination, outboundDepartureDate, inboundDepartureDate).
                then(tripInfo => {
                    const allTrips = {
                        outbound: {
                            departuredate: outboundDepartureDate,
                            trips: parseTripInfo(tripInfo, 'Outbound')
                        },
                        inbound: {
                            departuredate: inboundDepartureDate ? inboundDepartureDate : '',
                            trips: parseTripInfo(tripInfo, 'Inbound')
                        }
                    };
                    console.log(JSON.stringify(allTrips, null, 2));
                });
            });
        });
    }


    main();

})();
