'use strict';
// crawls home page to get origin IDs
const requestPromise = require('request-promise'),
      cheerio = require('cheerio');
function getAllOriginIds() {
  const mainPageOptions = {
      uri: 'http://us.megabus.com/Default.aspx',
      headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0'
      }
  };
  return requestPromise(mainPageOptions).then(homePageData => {
      return mapOriginIds(homePageData);
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
};

module.exports = getAllOriginIds;
