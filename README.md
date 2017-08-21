# megabus-scraper
## How to Use ##
*Note*: Main functionality is commented out for now so I could build out a feature to get the cheapest bus ticket from a range of dates. I realize this should be on a feature branch, but ¯\\_(ツ)_/¯.

````npm install
cd megabus-scraper````

### Examples ###
#### Round Trip ####
`node index.js --destination 'Memphis, TN' --origin 'Atlanta, GA' --roundtrip --departure 08/15/17 --return 09/17/17`
`# get cheapest
node index.js --destination 'Memphis, TN' --origin 'Atlanta, GA' --cheapest --roundtrip --departure 08/15/17 --return 09/17/17`
#### One Way ####
`node index.js --destination 'Memphis, TN' --origin 'Atlanta, GA' --departure 08/15/17`
`node index.js --destination 'Memphis, TN' --origin 'Atlanta, GA' --cheapest --departure 08/15/17`
