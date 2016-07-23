'use strict';

const char = require('chai'),
    assert = require('chai').assert,
    getAllOrigins = require('../get-all-origins.js'),
    getAvailableDestinations = require('../get-available-destinations.js'),
    getTripInfo = require('../get-trip-info.js'),
    parseTripInfo = require('../parse-trip-info.js'),
    chaiAsPromised = require('chai-as-promised'),
    should = require('should'),
    cities = [{
        city: 'Albany, NY',
        id: '89'
    }, {
        city: 'Amherst, MA',
        id: '90'
    }, {
        city: 'Anaheim, CA',
        id: '466'
    }, {
        city: 'Ann Arbor, MI',
        id: '91'
    }, {
        city: 'Athens, GA',
        id: '302'
    }, {
        city: 'Atlanta, GA',
        id: '289'
    }, {
        city: 'Austin, TX',
        id: '320'
    }, {
        city: 'Baltimore, MD',
        id: '143'
    }, {
        city: 'Baton Rouge, LA',
        id: '319'
    }, {
        city: 'Binghamton, NY',
        id: '93'
    }, {
        city: 'Birmingham, AL',
        id: '292'
    }, {
        city: 'Boston, MA',
        id: '94'
    }, {
        city: 'Buffalo Airport, NY',
        id: '273'
    }, {
        city: 'Buffalo, NY',
        id: '95'
    }, {
        city: 'Burbank, CA',
        id: '420'
    }, {
        city: 'Burlington, VT',
        id: '96'
    }, {
        city: 'Charlotte, NC',
        id: '99'
    }, {
        city: 'Chattanooga, TN',
        id: '290'
    }, {
        city: 'Chicago, IL',
        id: '100'
    }, {
        city: 'Christiansburg, VA',
        id: '101'
    }, {
        city: 'Cincinnati, OH',
        id: '102'
    }, {
        city: 'Cleveland, OH',
        id: '103'
    }, {
        city: 'Columbia, SC',
        id: '454'
    }, {
        city: 'Columbus, OH',
        id: '105'
    }, {
        city: 'Dallas/Fort Worth, TX',
        id: '317'
    }, {
        city: 'Dartmouth UMass, MA',
        id: '465'
    }, {
        city: 'Davenport, IA',
        id: '467'
    }, {
        city: 'Des Moines, IA',
        id: '106'
    }, {
        city: 'Detroit, MI',
        id: '107'
    }, {
        city: 'Durham, NC',
        id: '131'
    }, {
        city: 'East Lansing, MI',
        id: '330'
    }, {
        city: 'Fairhaven/New Bedford, MA',
        id: '316'
    }, {
        city: 'Fall River, MA',
        id: '469'
    }, {
        city: 'Fayetteville, NC',
        id: '455'
    }, {
        city: 'Fort Lauderdale, FL',
        id: '462'
    }, {
        city: 'Gainesville, FL',
        id: '296'
    }, {
        city: 'Grand Rapids, MI',
        id: '331'
    }, {
        city: 'Hampton, VA',
        id: '110'
    }, {
        city: 'Harrisburg, PA',
        id: '111'
    }, {
        city: 'Hartford, CT',
        id: '112'
    }, {
        city: 'Houston, TX',
        id: '318'
    }, {
        city: 'Indianapolis, IN',
        id: '115'
    }, {
        city: 'Iowa City, IA',
        id: '116'
    }, {
        city: 'Jacksonville, FL',
        id: '295'
    }, {
        city: 'Kingston URI, RI',
        id: '464'
    }, {
        city: 'Knoxville, TN',
        id: '118'
    }, {
        city: 'Las Vegas, NV',
        id: '417'
    }, {
        city: 'Little Rock, AR',
        id: '324'
    }, {
        city: 'Los Angeles, CA',
        id: '390'
    }, {
        city: 'Louisville, KY',
        id: '298'
    }, {
        city: 'Madison, U of Wisc, WI',
        id: '300'
    }, {
        city: 'Madison, WI',
        id: '119'
    }, {
        city: 'Memphis, TN',
        id: '120'
    }, {
        city: 'Miami, FL',
        id: '450'
    }, {
        city: 'Milwaukee, WI',
        id: '121'
    }, {
        city: 'Minneapolis, MN',
        id: '144'
    }, {
        city: 'Mobile, AL',
        id: '294'
    }, {
        city: 'Montgomery, AL',
        id: '293'
    }, {
        city: 'Montpelier, VT',
        id: '463'
    }, {
        city: 'Morgantown, WV',
        id: '299'
    }, {
        city: 'Nashville, TN',
        id: '291'
    }, {
        city: 'New Brunswick, NJ',
        id: '305'
    }, {
        city: 'New Haven, CT',
        id: '122'
    }, {
        city: 'New Orleans, LA',
        id: '303'
    }, {
        city: 'New York, NY',
        id: '123'
    }, {
        city: 'Newark, DE',
        id: '389'
    }, {
        city: 'Newport, RI',
        id: '457'
    }, {
        city: 'Newton, MA',
        id: '308'
    }, {
        city: 'Oakland, CA',
        id: '413'
    }, {
        city: 'Omaha, NE',
        id: '126'
    }, {
        city: 'Orlando, FL',
        id: '297'
    }, {
        city: 'Philadelphia, PA',
        id: '127'
    }, {
        city: 'Pittsburgh, PA',
        id: '128'
    }, {
        city: 'Portland, ME',
        id: '129'
    }, {
        city: 'Princeton, NJ',
        id: '304'
    }, {
        city: 'Providence, RI',
        id: '130'
    }, {
        city: 'Reno, NV',
        id: '418'
    }, {
        city: 'Richmond, VA',
        id: '132'
    }, {
        city: 'Ridgewood, NJ',
        id: '133'
    }, {
        city: 'Riverside, CA',
        id: '416'
    }, {
        city: 'Rochester, NY',
        id: '134'
    }, {
        city: 'Sacramento, CA',
        id: '415'
    }, {
        city: 'San Antonio, TX',
        id: '321'
    }, {
        city: 'San Francisco, CA',
        id: '414'
    }, {
        city: 'San Jose, CA',
        id: '412'
    }, {
        city: 'Secaucus, NJ',
        id: '135'
    }, {
        city: 'Sparks, NV',
        id: '419'
    }, {
        city: 'St Louis, MO',
        id: '136'
    }, {
        city: 'St. Paul, MN',
        id: '430'
    }, {
        city: 'State College, PA',
        id: '137'
    }, {
        city: 'Syracuse, NY',
        id: '139'
    }, {
        city: 'Tallahassee, FL',
        id: '453'
    }, {
        city: 'Tampa, FL',
        id: '451'
    }, {
        city: 'Tampa\\Mango (P&R), FL',
        id: '470'
    }, {
        city: 'Toledo, OH',
        id: '140'
    }, {
        city: 'Toronto, ON',
        id: '145'
    }, {
        city: 'Washington, DC',
        id: '142'
    }];

describe('get all origins', (done) => {
    it('should return all origin cities and IDs', (done) => {
        getAllOrigins().should.eventually.deepEqual(cities);
        done();
    });
});
