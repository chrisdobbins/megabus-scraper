'use strict';
const requestPromise = require('request-promise');

function getAvailableDestinations(originCity, allOrigins) {
    let destinationOptions = {
            uri: 'http://us.megabus.com/support/journeyplanner.svc/GetDestinations',
            qs: {
                originId: null
            },
            json: true
        },
        allAvailableDestinations = {
            origin: {},
            destinations: []
        };

    allOrigins.forEach(currCity => {
        if (currCity.city === originCity) {
            destinationOptions.qs.originId = parseInt(currCity.id);
            allAvailableDestinations.origin.id = destinationOptions.qs.originId;
            allAvailableDestinations.origin.city = currCity.city;
            return
        }
    });
    if (!destinationOptions.qs.originId) {
        console.error('invalid origin id; please check the destination name');
        return;
    }
    // promise that will return the names ('descriptionField') and
    // ids ('idField') of the destinations available for the city (originName)
    return requestPromise(destinationOptions).then(data => {
        allAvailableDestinations.destinations = data.d.map(currVal => {
            let destination = {};
            destination.city = currVal.descriptionField;
            destination.id = currVal.idField;
            return destination;
        });
        return allAvailableDestinations;
    });
}

module.exports = getAvailableDestinations;
