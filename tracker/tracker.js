const bodyParser = require('body-parser');
const express = require('express');
const elasticsearch = require('elasticsearch');

const config = require('./env.json');

const client = new elasticsearch.Client({
  host: config.elasticsearch.host,
  log: 'trace'
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', (req, res) => res.send('Hello World!'));

app.get('/tracking.js', express.static('../tracking-script/src'));

app.post('/', (req, res) => {
  const date = (new Date()).toISOString();

  console.log({
    day: date.split('T')[0],
    date: date,
    timestamp: Date.now(),
  });

  const {
    id,
    host,
    path,
    domContentLoadedEventEnd: dom,
    loadEventEnd: load,
    responseEnd: response
  } = req.body;

  client.index({
    index: 'measure',
    type: 'measure',
    body: {
      id, host, path, dom, load, response,

      day: date.split('T')[0],
      date: date,
      timestamp: Date.now(),
    }
  }, function (error, response) {
    console.log('elastic');
    console.log('err', error);
    console.log('response', response);
    // ...
  });
  res.sendStatus(204);
});

app.listen(config.port, () => console.log(`Perfeto tracker listening on port ${config.port}!`));

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