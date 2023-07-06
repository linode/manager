import { accessFactory, appTokenFactory } from '@src/factories';
import 'cypress-file-upload';
import {
  mockGetPersonalAccessTokens,
  mockGetAppTokens,
  mockRevokeAppToken,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';
import { Token, Profile } from '@linode/api-v4/types';
import { getProfile } from '@linode/api-v4/lib/profile';
import { formatDate } from 'src/utilities/formatDate';
import { authenticate } from 'support/api/authentication';

authenticate();
describe('Third party access tokens', () => {
  let token: Token;

  beforeEach(() => {
    token = appTokenFactory.build({
      label: randomLabel(),
      token: randomString(64),
    });

    mockGetPersonalAccessTokens([]).as('getTokens');
    mockGetAppTokens([token]).as('getAppTokens');

    cy.visitWithLogin('/profile/tokens');
    cy.wait(['@getTokens', '@getAppTokens']);
  });

  /*
   * - List of third party access tokens
   * - Confirms that third party apps are listed with expected information.
   */
  it('Third party access tokens are listed with expected information', () => {
    cy.findByText(token.label)
      .closest('tr')
      .within(() => {
        cy.findByText(token.label).should('be.visible');
        cy.defer(getProfile()).then((profile: Profile) => {
          const dateFormatOptions = { timezone: profile.timezone };
          cy.findByText(formatDate(token.created, dateFormatOptions)).should(
            'be.visible'
          );
        });
        cy.findByText('never').should('be.visible');
      });
  });

  /*
   * - View scopes of a third party access token
   * - Confirms that 'View Scopes' opens a drawer and shows the correct information.
   */
  it('Views scopes of a third party access token', () => {
    const access = accessFactory.build({
      Linodes: 2,
    });

    cy.findByText(token.label)
      .closest('tr')
      .within(() => {
        ui.button.findByTitle('View Scopes').should('be.visible').click();
      });
    ui.drawer
      .findByTitle(token.label)
      .should('be.visible')
      .within(() => {
        Object.keys(access).forEach((key) => {
          cy.findByText(key)
            .closest('tr')
            .within(() => {
              cy.findByLabelText(
                `This token has ${access[key]} access for ${key.toLowerCase()}`
              ).should('be.visible');
            });
        });
      });
  });

  /*
   * - Revoke a third party access token
   * - Confirms that revoke works as expected and third party apps list updates accordingly.
   */
  it('Revokes a third party access token', () => {
    // Cancelling will keep the list unchanged.
    cy.findByText(token.label)
      .closest('tr')
      .within(() => {
        ui.button.findByTitle('Revoke').should('be.visible').click();
      });
    ui.dialog
      .findByTitle(`Revoke ${token.label}?`)
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirms revoke will remove the third party app.
    mockRevokeAppToken(token.id).as('deleteAppToken');
    cy.findByText(token.label)
      .closest('tr')
      .within(() => {
        ui.button.findByTitle('Revoke').should('be.visible').click();
      });
    ui.dialog
      .findByTitle(`Revoke ${token.label}?`)
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Revoke')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.wait('@deleteAppToken');

    mockGetPersonalAccessTokens([]).as('getTokens');
    mockGetAppTokens([]).as('getAppTokens');
    cy.visitWithLogin('/profile/tokens');
    cy.wait(['@getTokens', '@getAppTokens']);
    cy.findByText(token.label).should('not.exist');
  });
});
