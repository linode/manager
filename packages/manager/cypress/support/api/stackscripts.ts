import { deleteById, getAll, isTestEntity } from './common';

const userSsFilter = {
  'X-Filter':
    '{"+and": [{ "label": {"+contains": "cy-test"}},{"is_public": false}] }',
};

export const getStackscripts = () =>
  getAll('linode/stackscripts', userSsFilter);

export const deleteStackscriptById = (stackscriptId: number) =>
  deleteById('linode/stackscripts', stackscriptId);

export const deleteAllTestStackscripts = () => {
  getStackscripts().then((resp) => {
    resp.body.data.forEach((stackscript) => {
      if (isTestEntity(stackscript)) {
        deleteStackscriptById(stackscript.id);
      }
    });
  });
};
