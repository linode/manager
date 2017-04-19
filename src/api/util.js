import moment from 'moment';

import * as api from '~/api';
import { reduceErrors } from '~/errors';

// Extra cruft involving constructor / prototypes is for any `new Error404`s  to be shown as
// instanceof Error404:
// http://stackoverflow.com/a/38020283/1507139
export function Error404() {
  this.status = 404;
}

Error404.prototype = new Error();


export function objectFromMapByLabel(map, label, labelName = 'label') {
  if (!Object.values(map).length) {
    return null;
  }

  return Object.values(map).reduce(
    (match, object) => object[labelName] === label ? object : match, undefined);
}

export function getObjectByLabelLazily(pluralName, label, labelName = 'label') {
  return async (dispatch, getState) => {
    const oldResources = getState().api[pluralName][pluralName];
    const oldResource = objectFromMapByLabel(oldResources, label, labelName);

    if (oldResource && oldResource.id) {
      return oldResource;
    }

    const response = await dispatch(api[pluralName].all([], undefined, {
      headers: {
        'X-Filter': { [labelName]: label },
      },
    }));

    if (!response.total_results) {
      throw new Error404();
    }

    return response[pluralName][0];
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

export function dispatchOrStoreErrors(...apiCalls) {
  return async (dispatch) => {
    this.setState({ loading: true, errors: {} });

    const results = [];
    for (let i = 0; i < apiCalls.length; i++) {
      const nextCall = apiCalls[i];

      try {
        results[i] = await dispatch(nextCall(...results));
      } catch (response) {
        const errors = await reduceErrors(response);
        this.setState({ errors });
        return results;
      }
    }

    this.setState({ loading: false });

    return results;
  };
}
