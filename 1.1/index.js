'use strict';
const rp = require('request-promise'),
      clArgs = require('command-line-args'),
      Moment = require('moment'),
      momentRange = require('moment-range'),
      moment = momentRange.extendMoment(Moment);

// endpoint to get trip info: https://us.megabus.com/journey-planner/api/journeys?originId=123&destinationId=89&departureDate=2017-08-15&minDate=2017-08-14&totalPassengers=1&concessionCount=0&nusCount=0&days=1
// endpoint to get all origin cities: https://us.megabus.com/journey-planner/api/origin-cities
// endpoint to get all destinations for origin: https://us.megabus.com/journey-planner/api/destination-cities?originCityId=120
// usage: node index.js --destination 'Memphis, TN' --origin 'Atlanta, GA' --roundtrip true --departure 08/15/17 --return 09/17/17
//

// main();
//
getCheapestFromDateRange(moment(new Date('10-17-17')), moment(new Date('10-20-17')));
function main() {
	const cliOptionDefs = [
		{ name: 'origin', alias: 'o', type: String },
		{ name: 'destination', alias: 'd', type: String },
		{ name: 'roundtrip', type: Boolean },
		{ name: 'departure', type: String },
		{ name: 'return', type: String},
		{ name: 'cheapest', type: Boolean}
	];

	const options = clArgs(cliOptionDefs),
	      NUM_OF_PASSENGERS = 1;
 
	getAllOrigins().then(allOrigins => {
	        let originMatches = getMatchesForCity(options.origin, allOrigins);

		if (!originMatches.length) {
                        console.error(`${options.origin} is not a valid origin.`);
			return;
		}
		
		const originDetails = originMatches[0];
		getAllDestinationsForOrigin(originDetails.id).then(allDests => {
			let destinationMatches = getMatchesForCity(options.destination, allDests);
			if (!destinationMatches.length) {
				console.error(`No route exists between ${originDetails.name} and ${options.destination}`);
				return;
			}
			
			const destinationDetails = destinationMatches[0];
			
			if (options.roundtrip) {	
			        getRoundTrip(originDetails.id, destinationDetails.id, options).then(trips => { console.log('from main: ', trips); return trips;}).
					catch(err => {console.log('error getting round trip: ', err);
					});
			} else {
			        getOneWayTrip(originDetails.id, destinationDetails.id, options).then(trips => { console.log('from main: ', trips); return trips;}).
					catch(err => {console.log('error getting one way trips: ', err); });
			}

		}).catch(err => { console.log(2); throw err; });

	}).catch(err => { console.log(3); throw err; });

}

function generateDateRange(start, end) {
	let numOfDays = moment.range(start, end).diff('days');
	let dateRange = [];
	for (let i = 0; i < numOfDays; i++) {
		if (i == 0) {
			dateRange.push(start.clone());
		} else {
			dateRange.push(dateRange[dateRange.length-1].clone().add(1, 'd'));
		}
	}
	return dateRange;
}

function getCheapestFromDateRange(start, end) {
	console.log(start);
	let startDate = moment(start),
	    endDate = moment(end),
	    dateRange = [],
	    numOfDays; 
	generateDateRange(startDate, endDate).forEach((date) => {
	        console.log(formatDate(date));
                getOneWayTrip(289, 99, {departure: formatDate(date)}).then(data => {
			console.log(data);
		}).catch(err => {console.log(err);});
	});
}

function cleanResults(results) {
	if (!results) {
		return [];
	}

	return results.map((result) => {
	        return {
			departure: moment(result.departureDateTime).format('ddd, MMMM DD YYYY, h:mm a'),
			arrival: moment(result.arrivalDateTime).format('ddd, MMMM DD YYYY, h:mm a'),
			duration: moment.duration(result.duration).asHours(),
			price: result.price,
			start: result.origin.stopName,
			end: result.destination.stopName
		}
        });

}

function getCheapestFromRequest(trips) {
        return cleanResults(trips.dates[0].journeys.filter((journey) => {
					        return journey.cheapestPrice;
					}));
}

function getOneWayTrip(origin, destination, options) {
        let tripRequestOptions = {totalPassengers: options.totalPassengers,
		                  cheapest: options.cheapest};	
	return getTrip(origin,
		destination,
		options.departure,
                tripRequestOptions		
		);
}

function getRoundTrip(origin, destination, options) {
        let outboundTripOptions = {totalPassengers: options.totalPassengers,
        		           cheapest: options.cheapest,
        	                   departure: options.departure},
	inboundTripOptions = {totalPassengers: options.totalPassengers,
        	              cheapest: options.cheapest,
	                      departure: options.return};

	return Promise.all([
		getOneWayTrip(origin, destination,outboundTripOptions),
		getOneWayTrip(destination, origin, inboundTripOptions)
	       ]).then(vals => { return vals; });

}

function getAllOrigins() {
	let options = {
		uri: 'https://us.megabus.com/journey-planner/api/origin-cities',
		transform2xxOnly: true,
		transform: (data) => JSON.parse(data),
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' 
		}

       	};

	return rp(options);
}

function getTrip(originId, destinationId, departureDate, options) {
	let { totalPassengers, cheapest } = options;
	let requestOptions = {
		uri: 'https://us.megabus.com/journey-planner/api/journeys',
		transform2xxOnly: true,
		transform: (data) => { 
			return (cheapest ? 
			getCheapestFromRequest(JSON.parse(data)) : 
			cleanResults(JSON.parse(data).dates[0].journeys)) },
		qs: {
			originId,
			destinationId,
			departureDate: formatDate(departureDate),
			minDate: formatDate(departureDate),
			totalPassengers: totalPassengers || 1,
			concessionCount: 0,
			nusCount: 0,
			days: 1
		},
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' 
		}

	};
	return rp(requestOptions);
}

function formatDate(departureDate) {
	return moment(departureDate).format('YYYY[-]MM[-]DD'); 
}

function getAllDestinationsForOrigin(originId) {
	let options = {
		uri: 'https://us.megabus.com/journey-planner/api/destination-cities',
		transform: (data) => JSON.parse(data),
		transform2xxOnly: true,
		qs: {
			originCityId: originId
		},
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' 
		}
	};
	return rp(options);
}

function getMatchesForCity(cityName, cities) {
	return cities.filter((city) => {
		return city.name.match(cityName)
	})
}

