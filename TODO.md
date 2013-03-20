# todo list for getting link level data pushed out

## program flow

1. magically know which id to get
2. translate id into db
3. get data from db
4. reduce
5. dump to browser

6. browser employs that cross filter library
7. each unique id is loaded as it comes in

8. do it per id because otherwise the json documents will get too big
to handle without a streaming parser.


9. Make tests

## done so far

created reducer.  takes output from couchdb, reduces according to agg
level. dumps aggregated values to a hash feature thing

created couchCacher.  gets data from couchdb, given a reducing level
in time (month, day, hour) and space (freeway or detector)

created calling program.  Accepts input with a feature (not yet
implemented properly).  instantiates couchCacher, reducer. Gets data
from couchdb.  spits out JSON object to res.

## note

Mostly this is a refactoring and of stuff in geo_bbox.  necessary
refactor, so as to make "smaller modules"

