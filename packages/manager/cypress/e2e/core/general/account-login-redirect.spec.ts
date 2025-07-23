import { loginBaseUrl } from 'support/constants/login';
import { mockApiRequestWithError } from 'support/intercepts/general';
import { mockGetSSHKeysError } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { getOrigin } from 'support/util/local-storage';

const tokenLocalStorageKey = 'authentication/token';

describe('account login redirect', () => {
  /**
   * The API will return 401 with the body below for all the endpoints if
   * - Their token is expired
   * - Their token is non-existant
   * - Their token is invalid
   *
   * { "errors": [ { "reason": "Invalid Token" } ] }
   */
  it('should redirect to the login page when the API responds with a 401', () => {
    mockApiRequestWithError(401, 'Invalid Token');

    cy.visitWithLogin('/linodes/create');

    cy.url().should('contain', `${loginBaseUrl}/login?`, { exact: false });
  });

  it('should remove the authentication token from local storage when the API responds with a 401', () => {
    cy.visitWithLogin('/profile');

    cy.getAllLocalStorage().then((localStorageData) => {
      const origin = getOrigin();
      expect(localStorageData[origin][tokenLocalStorageKey]).to.exist;
      expect(localStorageData[origin][tokenLocalStorageKey]).to.be.a('string');
    });

    mockGetSSHKeysError('Invalid Token', 401);

    ui.tabList.findTabByTitle('SSH Keys').click();

    cy.url().should('contain', `${loginBaseUrl}/login?`, { exact: false });

    cy.getAllLocalStorage().then((localStorageData) => {
      const origin = getOrigin();
      expect(localStorageData[origin][tokenLocalStorageKey]).to.be.undefined;
    });
  });

  /**
   * This test validates that the encoded redirect param is valid and can be properly decoded when the user is redirected to our application.
   */
  it('should redirect the user to the page they were on if the redirect param is present and valid', () => {
    cy.visitWithLogin('/linodes/create/images');
    cy.url().should('contain', '/linodes/create/images');

    cy.clearLocalStorage(tokenLocalStorageKey);
    cy.reload();
    cy.url().should(
      'contain',
      'returnTo%253D%252Flinodes%252Fcreate%252Fimages'
    );
    cy.url().then((url) => {
      // We need to decode the URL twice to get the original redirect URL.
      // The first decoding is done by the browser, the second by Cypress.
      const decodedOnce = decodeURIComponent(url);
      const decodedTwice = decodeURIComponent(decodedOnce);

      expect(decodedTwice).to.contain('/linodes/create/images');
    });
  });
});
