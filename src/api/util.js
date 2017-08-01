import _ from 'lodash';
import moment from 'moment';

import * as api from './';
import { fullyLoadedObject } from './apiActionReducerGenerator';
import { reduceErrors } from './errors';

// Extra cruft involving constructor / prototypes is for any `new Error404`s  to be shown as
// instanceof Error404:
// http://stackoverflow.com/a/38020283/1507139
export function Error404() {
  this.status = 404;
}

Error404.prototype = new Error();

export function dispatchOrStoreErrors(apiCalls, extraWholeFormFields = []) {
  return async (dispatch) => {
    this.setState({ loading: true, errors: {} });

    const results = [];
    for (let i = 0; i < apiCalls.length; i++) {
      const nextCall = apiCalls[i];

      try {
        const nextDispatch = nextCall(...results);
        if (nextDispatch) {
          results[i] = await dispatch(nextDispatch);
        }
      } catch (response) {
        if (!response.json) {
          throw response;
        }

        const errors = await reduceErrors(response);
        errors._ = errors._.concat(extraWholeFormFields.reduce((flattenedErrors, field) => {
          const error = errors[field];
          if (Array.isArray(error)) {
            return [...flattenedErrors, ...error];
          }

          return [...flattenedErrors, error];
        }, [])).filter(Boolean);
        this.setState({ errors, loading: false });
        return null;
      }
    }

    this.setState({ loading: false, errors: { _: [] } });

    return results;
  };
}

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

    // API doesn't support X-Filter on 'id', so look it up directly.
    if (labelName === 'id') {
      return await dispatch(api[pluralName].one([label]));
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

    return { [resultField]: fullyLoadedObject(object) ? object : null };
  };
}

export function lessThanDatetimeFilter(key, datetime) {
  return {
    [key]: {
      '+lt': datetime,
    },
  };
}

export function greaterThanDatetimeFilter(key, datetime) {
  return {
    [key]: {
      '+gt': datetime,
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

export function transform(objects, options = {}) {
  const {
    filterBy,
    filterOn = 'label',
    sortBy = 'label',
    groupOn = 'group',
  } = options;

  const filterOnFn = _.isFunction(filterOn) ? filterOn : o => o[filterOn];
  const filtered = filterBy.length ? _.pickBy(objects, o =>
    filterOnFn(o).toLowerCase().indexOf(filterBy.toLowerCase()) !== -1) : objects;
  const sorted = _.sortBy(Object.values(filtered), sortBy);

  const groupOnFn = _.isFunction(groupOn) ? groupOn : o => o[groupOn];
  let groups = _.sortBy(
    _.map(_.groupBy(sorted, groupOnFn), (objectsInGroup, groupName) => ({
      name: groupName,
      data: objectsInGroup,
    })), group => group.name);

  if (!groups.length) {
    groups = [{ name: '', data: [] }];
  }

  return { filtered, sorted, groups };
}
