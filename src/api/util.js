import moment from 'moment';

import * as api from './';

// Extra cruft involving constructor / prototypes is for any `new Error404`s  to be shown as
// instanceof Error404:
// http://stackoverflow.com/a/38020283/1507139
export function Error404() {
  this.status = 404;
}

Error404.prototype = new Error();


export function objectFromMapByLabel(map, label, labelName = 'label') {
  const mapValues = Object.values(map);
  if (!mapValues.length) {
    return null;
  }

  return mapValues.reduce(
    (match, object) => {
      // This == is explicit because some ids are ints some are strings.
      // eslint-disable-next-line eqeqeq
      return object[labelName] == label ? object : match;
    }, undefined);
}

export function getObjectByLabelLazily(pluralName, label, labelName = 'label') {
  return async (dispatch, getState) => {
    const oldResources = getState().api[pluralName][pluralName];
    const oldResource = objectFromMapByLabel(oldResources, label, labelName);

    if (oldResource && oldResource.id) {
      return oldResource;
    }

    // The API doesn't allow filtering with X-Filter on 'id'.
    if (labelName === 'id') {
      const response = await dispatch(api[pluralName].one([label]));
    } else {
      const response = await dispatch(api[pluralName].all([], undefined, {
        headers: {
          'X-Filter': { [labelName]: label },
        },
      }));

      if (!response.total_results) {
        throw new Error404();
      }

      return response[pluralName][0];
    }
  };
}

export function selectObjectByLabel({ collection, paramField, resultField, labelName }) {
  return (state, props) => {
    const object = objectFromMapByLabel(
      state.api[collection][collection],
      props.params[paramField],
      labelName);
    return { [resultField]: object };
  };
}

export function lessThanDatetimeFilter(key, datetime) {
  return {
    [key]: {
      '+lte': datetime,
    },
  };
}

export function greaterThanDatetimeFilter(key, datetime) {
  return {
    [key]: {
      '+gte': datetime,
    },
  };
}

export function lessThanNowFilter(key) {
  return lessThanDatetimeFilter(key, moment().toISOString());
}

export function createHeaderFilter(filter) {
  return {
    headers: {
      'X-Filter': filter,
    },
  };
}
