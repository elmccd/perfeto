const bodyParser = require('body-parser');
const express = require('express');
const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/search/:interval?', (req, res) => {
  const interval = {
    minute: 'minute',
    hour: 'hour',
    day: 'day',
  }[req.params.interval] || 'day';

  client.search({
    index: 'measure',
    size: 0,
    body: {
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
  }, function (error, response) {
    console.log('error', error);
    console.log('response', response);

    res.json(response);
  });

});

app.listen(3006, () => console.log('Example app listening on port 3000!'));

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