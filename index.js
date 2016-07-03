'use strict';
const requestPromise = require('request-promise'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    mainPageOptions = {
      uri: 'http://us.megabus.com/Default.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0'
      }
   };

function main() {
    requestPromise(mainPageOptions). // crawls home page to get origin IDs
        then(homePage => {
            const allOrigins = mapOriginIds(homePage); //creates array of city name and id objs
            // need to sanitize input rather than blindly trusting.
            const originCity = process.argv[2];
            const destinationCity = process.argv[3];
            const outboundDepartureDate = sanitizeDate(process.argv[4]);
            const inboundDepartureDate = sanitizeDate(process.argv[5]);

            // gets the destinations available for the desired origin
            getAvailableDestinations(originCity, allOrigins).
                then(availableDestinations => {
                    let destination = verifyDestinationInput(availableDestinations, destinationCity);
                    let departureDate = outboundDepartureDate;
                    let origin = availableDestinations.origin;
                    getTripInfo(origin, destination, outboundDepartureDate, inboundDepartureDate).
                        then(tripInfo => {
                          if (inboundDepartureDate) {
                              let inboundTrips = parseTripInfo(tripInfo, 'Inbound');
                              let outboundTrips = parseTripInfo(tripInfo, 'Outbound');
                              let allTrips = {outbound: outboundTrips,
                                              inbound: inboundTrips};
                              console.log(JSON.stringify(allTrips, null, 2));
                          }
                    });
                });
    });
}

function sanitizeDate(dateString) {
  let dirtyDate = new Date(dateString);
  const options = {year: 'numeric', day: '2-digit', month: '2-digit'};
  try {
    let cleanDate = dirtyDate.toLocaleDateString('en-US', options);
    return cleanDate
  } catch(e) {
    return e;
  }

}

function verifyDestinationInput(availableDestinations, destinationInput) {
  let verifiedDestination = null,
      validDestinationCities = availableDestinations.destinations.map(destination => { return ` ${destination.city}`; });
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
  let $ = cheerio.load(tripInfo),
      i = 0,
      gridNum = 'l00',
      trips = [];
      while ($(`#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.five`).children().eq(0).text()) {
          gridNum = (i < 10) ? `l0${i}` : `l${i}`;
          let gridLineId = `#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.five`;
          let trip = {};
          if ($(gridLineId).children().eq(0).text()) {
            // TODO: DRY this up
              let departureDetails = eliminateWhiteSpace($(`#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.two`).children().eq(0).text());
              let departure = processDetails(departureDetails);
              trip.departuretime = departure.time;
              trip.departurecity = departure.city;
              trip.departurestate = departure.state;
              trip.departurelocation = departure.location;
              // where price appears depends on availability of reserved seats.
              // reserved seats' fare descriptions will start with 'From'
              let priceInfoArr = eliminateWhiteSpace($('p', gridLineId).text());
              priceInfoArr[0] === 'From' ?
                  trip.price = priceInfoArr[1] : trip.price = priceInfoArr[0];

              let tripDuration = eliminateWhiteSpace($('p', `#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.three`).text()).join(' ');
              trip.duration = tripDuration;

              // ARRIVALS
              let arrivalDetails =  eliminateWhiteSpace($('.arrive', `#JourneyResylts_${direction}List_GridViewResults_ct${gridNum}_row_item li.two`).text());
              let arrival = processDetails(arrivalDetails);
              trip.arrivaltime = arrival.time;
              trip.arrivalcity = arrival.city;
              trip.arrivalstate = arrival.state;
              trip.arrivallocation = arrival.location;
              trips.push(trip);
          }
          i++;
      }
      return trips;

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

function getAvailableDestinations(originName, allOrigins) {
  let destinationOptions = {
    uri: 'http://us.megabus.com/support/journeyplanner.svc/GetDestinations',
    qs: {
      originId: null
    },
    json: true
  },
  allAvailableDestinations = {
    origin: {},
    destinations: []};

  allOrigins.forEach( currCity => {
    if (currCity.city === process.argv[2]) {
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
  return requestPromise(destinationOptions).then( data => {
     allAvailableDestinations.destinations = data.d.map( currVal => {
       let destination = {};
       destination.city = currVal.descriptionField;
       destination.id = currVal.idField;
       return destination;
      });
     return allAvailableDestinations;
  });
}

function mapOriginIds(data) {
  let $ = cheerio.load(data);
  let origins = [];
  let originElements = $('#JourneyPlanner_ddlOrigin').find('option');
  for (let i = 1; i < originElements.length; i++) {
    let origin = {
      city: originElements.eq(i).text(),
      id: originElements.eq(i).attr('value')
    };
    origins.push(origin);
  }
  return origins;
}


main();
