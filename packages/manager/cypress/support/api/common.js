import strings from '../cypresshelpers';

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

export const getAll = path => {
  return cy.request({
    method: 'GET',
    url: Cypress.env('apiroot') + '/v4/' + path,
    auth: {
      bearer: Cypress.env('oauthtoken')
    }
  });
};
export const deleteById = (path, id) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiroot')}/v4/${path}/${id}`,
    auth: {
      bearer: Cypress.env('oauthtoken')
    }
  });
};

export const testTag = 'cy-test';
export const testNamePrefix = 'cy-test-';

export const isTestEntity = entity =>
  entity.tags.includes(testTag) || entity.label.startsWith(testNamePrefix);

export const makeTestLabel = () => testNamePrefix + strings.randomTitle(10);
