'use strict';

function sanitizeDate(dateString) {
    const dirtyDate = new Date(dateString),
        options = {
            year: 'numeric',
            day: '2-digit',
            month: '2-digit'
        },
        cleanDate = dirtyDate.toLocaleDateString('en-US', options);
    return (cleanDate.split(' ').indexOf('Invalid') === -1 ? cleanDate : '');
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
module.exports = {
    sanitizeDate,
    verifyDestinationInput
};
