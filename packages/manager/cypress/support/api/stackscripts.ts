import { deleteById, getAll, isTestEntity } from './common';

export const getStackscripts = (page = 1) =>
  getAll(`/linode/stackscripts?page=${page}`);

export const deleteStackscriptById = (stackscriptId: number) =>
  deleteById('linode/stackscripts', stackscriptId);

export const deleteAllTestStackscripts = () => {
  getStackscripts().then(resp => {
    const pages = resp.body.pages;
    for (let page = 1; page <= pages; page++) {
      getStackscripts(page).then(resp => {
        resp.body.data.forEach(stackscript => {
          if (isTestEntity(stackscript)) {
            deleteStackscriptById(stackscript.id);
          }
        });
      });
    }
  });
};
