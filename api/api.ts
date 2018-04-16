import { convertESResponse } from "./responses/convertESResponse";
import { ESSearchResponse } from "./structures/ESSearchResponse";

const bodyParser = require('body-parser');
const express = require('express');
const elasticsearch = require('elasticsearch');

const config = require('./env.json');


const client = new elasticsearch.Client({
  host: config.elasticsearch.host
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/search', (req, res) => {
  const interval = {
    minute: 'minute',
    hour: 'hour',
    day: 'day',
  }[req.query.i] || 'day';

  const gt = req.query.gt || '7d';
  const lt = req.query.lt || '0d';

  const round = {
      minute: 'm',
      hour: 'h',
      day: 'd',
  }[req.query.i] || 'd';

  client.search({
    index: 'measure',
    size: 0,
    body: {
      "query": {
        "range" : {
          "date" : {
            "gte" : `now-${gt}/${round}`,
            "lte" : `now-${lt}/${round}`
          }
        }
      },
      "aggs" : {
        "measure" : {
          "date_histogram" : {
            "field" : "date",
            "interval" : interval
          },
          "aggs" : {
            "domAvg" : { "avg" : { "field" : "dom" } },
            "domPercentiles" : { "percentiles" : { "field" : "dom" } },
            "loadAvg" : { "avg" : { "field" : "load" } },
            "loadPercentiles" : { "percentiles" : { "field" : "load" } }
          }
        }
      }
    }
  }, function (error, response: ESSearchResponse) {
    console.log('error', error);

    res.json(convertESResponse(response, {
        interval, gt, lt, round
    }));
  });

});

app.listen(config.port, () => console.log(`Perfeto API listening on port ${config.port}!`));

client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});