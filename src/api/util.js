import * as api from '~/api';

import moment from 'moment';

// Extra cruft involving constructor / prototypes is for any `new Error404`s  to be shown as
// instanceof Error404:
// http://stackoverflow.com/a/38020283/1507139
export function Error404() {
  this.statusCode = 404;
}

Error404.prototype = new Error();

export function getObjectByLabelLazily(pluralName, label, labelName = 'label') {
  return async (dispatch, getState) => {
    const oldResources = Object.values(getState().api[pluralName][pluralName]);
    const oldResource = oldResources.length && oldResources.reduce(
        (match, resource) => resource.label === label ? resource : match, undefined);

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
