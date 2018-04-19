import { convertESResponse } from "./responses/convertESResponse";
import { ESSearchResponse } from "./structures/ESSearchResponse";

const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const elasticsearch = require('elasticsearch');

const env = require('./env.json');
const config = require('../config.json');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');

const flash = require('connect-flash');
const session = require('express-session')

const client = new elasticsearch.Client({
  host: env.elasticsearch.host
});

const app = express();

app.set('superSecret', config.secret); // secret variable

app.use(session({ secret: 'er5cvtybnumiuhytd5fr6t7gy8u4567vbbntyu' }));
app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

// app.get('/login', (req, res) => {
//   res.setHeader('Content-Type', 'text/html');
//   res.sendfile(path.join(__dirname, 'views/login.html'));
// });

const ensureAuthenticated = function(req, res, next) {

  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ ok: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        console.log('decoded', decoded);
        next();
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      ok: false,
      message: 'No token provided.'
    });

  }
};

app.post('/api/auth', function(req, res) {

  console.log(req.body);

  if (req.body.email === 'elmccd@gmail.com' && req.body.password === 'maciej') {
    const payload = {
      email: req.body.email
    };

    const token = jwt.sign(payload, app.get('superSecret'), {
      expiresIn: "24h"
    });

    // return the information including token as JSON
    res.json({
      ok: true,
      token: token,
      user: {
        email: req.body.email,
        name: 'Jerry'
      }
    });
  } else {
    res.json({ ok: false, message: 'Authentication failed. User not found.' });
  }
});

app.get('/api/auth', ensureAuthenticated, function(req, res) {
  console.log(req.decoded);
  res.send({
    ok: true,
    user: {
      email: req.decoded.email,
    }
  });
});

app.get('/api/search', ensureAuthenticated, (req, res) => {
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

  const esQuery = {
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
  };

  client.search({
    index: 'measure',
    size: 0,
    body: esQuery
  }, function (error, response: ESSearchResponse) {
    console.log('error', error);

    res.json(convertESResponse(response, {
        interval, gt, lt, round
    }, esQuery));
  });

});


app.get('*', express.static('../dashboard/dist'));

app.get('*', (req, res) => {
  res.sendfile(path.join(__dirname, '../dashboard/dist/index.html'));
});

app.listen(env.port, () => console.log(`Perfeto API listening on port ${env.port}!`));

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