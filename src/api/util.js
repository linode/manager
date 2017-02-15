import * as api from '~/api';

class Error404 extends Error {
  statusCode = 404
}

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
        'X-Filter': JSON.stringify({ [labelName]: label }),
      },
    })))[pluralName][0];

    if (!response) {
      throw new Error404();
    }

    return response;
  };
}
