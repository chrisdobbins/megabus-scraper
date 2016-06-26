'use strict';
const requestPromise = require('request-promise'),
    cheerio = require('cheerio'),
    fs = require('fs');

let mainPageOptions = {
    uri: 'http://us.megabus.com/Default.aspx',
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0'
    }
};

function main() {
    requestPromise(mainPageOptions) // crawls home page to get origin IDs
        .then(homePage => {
                const allOrigins = mapOriginIds(homePage); //creates array of city name and id objs
                let originCity = process.argv[2];
                let destinationCity = process.argv[3];
                let outboundDepartureDate = process.argv[4];

                // gets the destinations available for the desired origin
                getAvailableDestinations(originCity, allOrigins).
                then(availableDestinations => {
                            let testDestination = '';
                            // test block for functionality to pass in destination name
                            // TODO: refactor this
                            availableDestinations.destinations.forEach((destination) => {
                                if (destination.city === destinationCity) {
                                    testDestination = destination;
                                }
                                return;
                            });
                            let testDepartureDate = outboundDepartureDate;
                            let testOrigin = availableDestinations.origin;
                            getTripInfo(testOrigin, testDestination, testDepartureDate)
                                .then(tripInfo => {
                                  // TODO: Refactor this block into fn called parseTripInfo
                                  let trips = parseTripInfo(tripInfo);
                                  console.log(trips); // left off here 6/26, 0101
    });
  });
  });
}

function parseTripInfo(tripInfo) {
  let $ = cheerio.load(tripInfo);
  let i = 0;
  let gridNum = 'l00';
  let gridLineId = `#JourneyResylts_OutboundList_GridViewResults_ct${gridNum}_row_item li.five`;
  let trips = [];
  while ($(gridLineId).children().eq(0).text()) {
      gridNum = (i < 10) ? `l0${i}` : `l${i}`;
      gridLineId = `#JourneyResylts_OutboundList_GridViewResults_ct${gridNum}_row_item li.five`;
      // console.log(`${$(`#JourneyResylts_OutboundList_GridViewResults_ct${gridNum}_row_item li.two`).text().split(/[\s]+/)[2]} ${ampmFlag}`);
      let trip = {};
      if ($(gridLineId).children().eq(0).text()) {
        // TODO: DRY this up
          let departureDetails = eliminateWhiteSpace($(`#JourneyResylts_OutboundList_GridViewResults_ct${gridNum}_row_item li.two`).children().eq(0).text());
          let unparsedDepartureLocation = departureDetails.slice(5);
          let unparsedDepartureCity = departureDetails[3];
          trip.departuretime = `${departureDetails[1]} ${departureDetails[2]}`;
          // add'l procesing to get rid of trailing ',' character in city
          trip.departurecity = unparsedDepartureCity.slice(0, departureDetails[4].lastIndexOf(','));
          trip.departurestate = `${departureDetails[4]}`;
          // where price appears depends on availability of reserved seats.
          // reserved seats' fare descriptions will start with 'From'
          let priceInfoArr = eliminateWhiteSpace($('p', `#JourneyResylts_OutboundList_GridViewResults_ct${gridNum}_row_item li.five`).text());
          priceInfoArr[0] === 'From' ?
              trip.price = priceInfoArr[1] : departure.price = priceInfoArr[0];

          // additional processing to get rid of leading ',' character in location
          trip.departurelocation = unparsedDepartureLocation.slice(1).join(' ');
          let tripDuration = eliminateWhiteSpace($('p', `#JourneyResylts_OutboundList_GridViewResults_ct${gridNum}_row_item li.three`).text()).join(' ');
              trip.duration = tripDuration;

          // ARRIVALS
          let arrival = $('.arrive', `#JourneyResylts_OutboundList_GridViewResults_ct${gridNum}_row_item li.two`).text();
          let arrivalArr = eliminateWhiteSpace(arrival);
           trip.arrivaltime = `${arrivalArr[1]} ${arrivalArr[2]}`;
           trip.arrivalcity = `${arrivalArr[3].slice(0, arrivalArr[3].lastIndexOf(','))}`;
           trip.arrivalstate = `${arrivalArr[4]}`;
           trip.arrivallocation =`${arrivalArr.slice(arrivalArr.indexOf(',') + 1).join(' ')}`;
          trips.push(trip);
      }
      i++;
  }
  return trips;
}
function eliminateWhiteSpace(text) {
  return text.trim().split(/[\s]+/);
}

function getTripInfo(origin, destination, departureDate) {
  let journeyOptions = {
  uri: 'http://us.megabus.com/JourneyResults.aspx',
  qs: {
    originCode: origin.id,
    destinationCode: destination.id,
    outboundDepartureDate: departureDate,
    passengerCount: 1,
    transportType: 0,
    concessionCount: 0,
    nusCount: 0,
    outboundWheelchairSeated: 0,
    outboundOtherDisabilityCount: 0,
    outboundPcaCount: 0,
    promotionCode: '',
    withReturn: 0
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
    // console.log(`${origins.eq(i).text()}: ${origins.eq(i).attr('value')}`);
    origins.push(origin);
  }
  return origins;
}


main();

//  $(`.arrive`, `#JourneyResylts_OutboundList_GridViewResults_ct${gridNum}_row_item li.two`).text().trim().split(/[\s]+/)
