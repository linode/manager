import * as api from '~/api';

export function getObjectByLabelLazily(pluralName, label) {
  return async (dispatch, getState) => {
    const oldResources = Object.values(getState().api[pluralName][pluralName]);
    const oldResource = oldResources.length && oldResources.reduce(
      (match, resource) => resource.label === label ? resource : match, undefined);

    if (oldResource && oldResource.id) {
      return oldResource;
    }

    return (await dispatch(api[pluralName].all([], undefined, {
      headers: {
        'X-Filter': JSON.stringify({ label }),
      },
    })))[pluralName][0];
  };
}
