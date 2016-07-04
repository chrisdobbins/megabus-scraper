'use strict'
const requestPromise = require('request-promise');

function getTripInfo(origin, destination, outboundDepartureDate, inboundDepartureDate) {
    const journeyOptions = {
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
    console.log(inboundDepartureDate);
    return requestPromise(journeyOptions);
}

module.exports = getTripInfo;
