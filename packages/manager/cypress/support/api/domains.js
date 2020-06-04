import { getAll, deleteById, makeTestLabel, testNamePrefix } from './common';

const relativeApiPath = '/domains';

export const makeDomainLabel = () => makeTestLabel() + '.net';

export const getDomains = () => getAll(relativeApiPath);

export const deleteDomainById = id => deleteById(relativeApiPath, id);

export const isTestDomain = label => label.startsWith(testNamePrefix);

export const deleteAllTestDomains = () => {
  getDomains().then(resp => {
    resp.body.data.forEach(domain => {
      if (isTestDomain(domain.domain)) {
        deleteDomainById(domain.id);
      }
    });
  });
};
