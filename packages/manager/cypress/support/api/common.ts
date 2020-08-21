import strings from '../cypresshelpers';
const apiroot = Cypress.env('REACT_APP_API_ROOT') + '/';
const oauthtoken = Cypress.env('MANAGER_OAUTH');
export const apiCheckErrors = (resp, failOnError = true) => {
  let errs = undefined;
  if (resp.body && resp.body.ERRORARRAY && resp.body.ERRORARRAY.length > 0) {
    errs = resp.body.ERRORARRAY;
  }
  if (failOnError) {
    if (errs) {
      expect(errs[0].ERRORMESSAGE).not.to.be.exist;
    } else {
      expect(!!errs).to.be.false;
    }
  }
  return errs;
};

export const getAll = (path: string) => {
  return cy.request({
    method: 'GET',
    url: `${apiroot}${path}`,
    auth: {
      bearer: oauthtoken
    }
  });
};
export const deleteById = (path: string, id: number) => {
  return cy.request({
    method: 'DELETE',
    url: `${apiroot}${path}/${id}`,
    auth: {
      bearer: oauthtoken
    }
  });
};

export const testTag = 'cy-test';
export const testNamePrefix = 'cy-test-';

// Images do not have tags
export const isTestEntity = entity =>
  entity.tags?.includes(testTag) || entity.label.startsWith(testNamePrefix);

export const makeTestLabel = () => testNamePrefix + strings.randomTitle(10);
