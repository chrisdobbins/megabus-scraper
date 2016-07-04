# megabus-scraper
##How to Use##
Assuming you've cloned the repo and run npm install, this is how you run this:

one-way fares: `node index.js 'Chicago, IL' 'New York, NY' '1/1/2016'`

roundtrip fares: `node index.js 'New York, NY' '1/1/16' '2/5/16'`

Right now (7/4/16) this just logs the generated JSON to the console. 

Planned future functionality includes:
- enabling users to put in a range for inbound, outbound, or both and get the lowest fares for that range
- adding accessibility options
- allowing users to plan and price out multi-leg trips 
  - For instance, there's no direct route between Memphis and NYC, but one can go from Memphis to Atlanta, then Atlanta to NYC. I want to make it easier for the user to plan out such trips
