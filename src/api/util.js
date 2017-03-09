import * as api from '~/api';

import moment from 'moment';

// Extra cruft involving constructor / prototypes is for any `new Error404`s  to be shown as
// instanceof Error404:
// http://stackoverflow.com/a/38020283/1507139
export function Error404() {
  this.statusCode = 404;
}

Error404.prototype = new Error();


export function objectFromMapByLabel(map, label, labelName = 'label') {
  return Object.values(map).length && Object.values(map).reduce(
    (match, object) => object[labelName] === label ? object : match, undefined);
}

export function getObjectByLabelLazily(pluralName, label, labelName = 'label') {
  return async (dispatch, getState) => {
    const oldResources = getState().api[pluralName][pluralName];
    const oldResource = objectFromMapByLabel(oldResources, label, labelName);

    if (oldResource && oldResource.id) {
      return oldResource;
    }

    const response = (await dispatch(api[pluralName].all([], undefined, {
      headers: {
        'X-Filter': { [labelName]: label },
      },
    })));

    if (!response.total_results) {
      throw new Error404();
    }

    return response[pluralName][0];
  };
}

export function lessThanDatetimeFilter(key, datetime) {
  return {
    [key]: {
      '+lte': datetime,
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
