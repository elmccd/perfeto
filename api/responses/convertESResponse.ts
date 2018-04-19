import {get, mapValues} from 'lodash';
import {ESSearchResponse, SearchResponse} from "../structures/ESSearchResponse";

export function processData(data) {
  return data.map(item => {
    return {
      key_as_string: item.key_as_string,
      key: item.key,
      count: item.doc_count,
      measure: {
        dom: {
          avg: ~~item.domAvg.value,
          percentiles: mapValues(item.domPercentiles.values, v => ~~v)
        },
        load: {
          avg: ~~item.loadAvg.value,
          percentiles: mapValues(item.loadPercentiles.values, v => ~~v)
        }
      }
    }
  });
}

export function convertESResponse(response: ESSearchResponse, query, esQuery): SearchResponse {

  const bucketData = get(response, 'aggregations.measure.buckets');

  if (!bucketData) {
    return generateErrorResponse(query);
  }

  return {
    query,
    esQuery,
    raw: bucketData,
    ok: true,
    data: processData(bucketData)
  };
}

export function generateErrorResponse(query): SearchResponse {

  return {
    query,
    error: 'Invalid DB response'
  };
}