import { convertESResponse } from "./responses/convertESResponse";
import { ESSearchResponse } from "./structures/ESSearchResponse";

const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const elasticsearch = require('elasticsearch');

const env = require('./env.json');
const config = require('../config.json');

const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(function(username, password, done) {
  console.log(username, password, config);
    if (username === config.user && password === config.password) {
      console.log('done ij');
      return done(null, {
        user: {
          username
        }
      });
    }

    return done(null, false, { message: 'Incorrect username or password' });
  }
));

const client = new elasticsearch.Client({
  host: env.elasticsearch.host
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const app = express();

app.use(session({ secret: 'er5cvtybnumiuhytd5fr6t7gy8u4567vbbntyu' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get('/login', (req, res) => {
//   res.setHeader('Content-Type', 'text/html');
//   res.sendfile(path.join(__dirname, 'views/login.html'));
// });

const ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(403);
};

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/');
});

app.get('/search', ensureAuthenticated, (req, res) => {
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