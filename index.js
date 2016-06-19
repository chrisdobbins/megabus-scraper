'use strict';
const requestPromise = require('request-promise'),
cheerio = require('cheerio'),
fs = require('fs'),
allOrigins = mapOriginIds();

let mainPageOptions = {
  uri: 'http://us.megabus.com/Default.aspx',
   headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0'
    }
};

// options for GET request to http://us.megabus.com/support/journeyplanner.svc/GetDestinations?originId=<someId>


let journeyOptions = {
    uri: 'http://us.megabus.com/JourneyResults.aspx',
    qs: {
      originCode: 289,
      destinationCode: 290,
      outboundDepartureDate: '7/03/2016',
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

function main() {
//requestPromise(mainPageOptions)
//.then( (data) => {
  let originCity = process.argv[2];
  let destinationCity = process.argv[3];
  let outboundDepartureDate = process.argv[4];
  getAvailableDestinations(originCity).then(destinations => {
    console.log(destinations);
    journeyOptions.originCode = ;
    let testDestination = destinations[0];


  });


  // following lines of code calls the JourneyResults method
  // on Megabus's backend
  // requestPromise(journeyOptions)
  // .then( (data) => {
  //   let $ = cheerio.load(data);
  //   prints price of ticket in '$xx.xx' format
  //   console.log($('#JourneyResylts_OutboundList_GridViewResults_ctl00_row_item li.five').children().eq(0).text().split(/[\s]+/)[2]);
  // } );
}

function getAvailableDestinations(originName) {
  let destinationOptions = {
    uri: 'http://us.megabus.com/support/journeyplanner.svc/GetDestinations',
    qs: {
      originId: null
    },
    json: true
  },
  allAvailableDestinations = [];

  allOrigins.forEach( currCity => {
    if (currCity.city == process.argv[2]) {
      destinationOptions.qs.originId = parseInt(currCity.id);
      console.log(destinationOptions.qs.originId);
      return
    }
  });
  if (!destinationOptions.qs.originId) {
    console.error('invalid origin id; please check the destination name');
    return;
  }
  return requestPromise(destinationOptions).then( data => {
    //console.log(data); // stopped here @ 1600 on Sunday,
                                    // 6/19
     allAvailableDestinations = data.d.map( currVal => {
       let destination = {};
       destination.city = currVal.descriptionField;
       destination.id = currVal.idField;
       return destination;
      });
     return allAvailableDestinations;
  });
}

function mapOriginIds() {
  let data = fs.readFileSync('/home/cj/megabus-crawler/megabus-home.html');
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


// http://us.megabus.com/JourneyResults.aspx?originCode=289&destinationCode=290&outboundDepartureDate=7%2f1%2f2016&inboundDepartureDate=&passengerCount=1&transportType=0&concessionCount=0&nusCount=0&outboundWheelchairSeated=0&outboundOtherDisabilityCount=0&inboundWheelchairSeated=0&inboundOtherDisabilityCount=0&outboundPcaCount=0&inboundPcaCount=0&promotionCode=&withReturn=0
