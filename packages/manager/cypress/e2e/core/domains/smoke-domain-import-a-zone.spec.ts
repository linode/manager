import { domainFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { mockGetDomains, mockImportDomain } from 'support/intercepts/domains';
import { ui } from 'support/ui';
import { randomDomainName, randomIp } from 'support/util/random';

import type { ImportZonePayload } from '@linode/api-v4';

authenticate();
describe('Import a Zone', () => {
  /*
   * - Clicks "Import A Zone" button and confirms operation.
   * - Confirms that Domain won't be imported when the domain is empty or invalid.
   * - Confirms that Domain won't be imported when the name server is empty or invalid.
   * - Confirms that Domain exists after imported operation.
   */
  it('imports a zone in the domain page', () => {
    const zone: ImportZonePayload = {
      domain: randomDomainName(),
      remote_nameserver: randomIp(),
    };

    const mockDomain = domainFactory.build({
      domain: zone.domain,
      group: 'test-group',
    });

    mockGetDomains([mockDomain]).as('getDomains');
    cy.visitWithLogin('/domains');
    cy.wait('@getDomains');

    ui.button
      .findByTitle('Import a Zone')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Import a Zone')
      .should('be.visible')
      .within(() => {
        // The button should be disabled before providing any values
        ui.buttonGroup
          .findButtonByTitle('Import')
          .should('be.visible')
          .should('be.disabled');

        // Verify only filling out Domain cannot import
        cy.findByLabelText('Domain').click();
        cy.focused().clear();
        cy.focused().type(zone.domain);
        ui.buttonGroup
          .findButtonByTitle('Import')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Remote nameserver is required.');

        // Verify invalid domain cannot import
        cy.findByLabelText('Domain').click();
        cy.focused().clear();
        cy.focused().type('1');
        cy.findByLabelText('Remote Nameserver').click();
        cy.focused().clear();
        cy.focused().type(zone.remote_nameserver);
        ui.buttonGroup
          .findButtonByTitle('Import')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Domain is not valid.');

        // Verify only filling out RemoteNameserver cannot import
        cy.findByLabelText('Domain').click();
        cy.focused().clear();
        cy.findByLabelText('Remote Nameserver').click();
        cy.focused().clear();
        cy.focused().type(zone.remote_nameserver);
        ui.buttonGroup
          .findButtonByTitle('Import')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Domain is required.');

        // Verify invalid remote nameserver cannot import
        cy.findByLabelText('Domain').click();
        cy.focused().clear();
        cy.focused().type(zone.domain);
        cy.findByLabelText('Remote Nameserver').click();
        cy.focused().clear();
        cy.focused().type('1');
        ui.buttonGroup
          .findButtonByTitle('Import')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText(`The nameserver '1' is not valid.`);

        // Fill out and import the zone.
        mockImportDomain(mockDomain).as('importDomain');
        mockGetDomains([mockDomain]).as('getDomains');
        cy.findByLabelText('Domain').click();
        cy.focused().clear();
        cy.focused().type(zone.domain);
        cy.findByLabelText('Remote Nameserver').click();
        cy.focused().clear();
        cy.focused().type(zone.remote_nameserver);
        ui.buttonGroup
          .findButtonByTitle('Import')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that zone is imported.
    cy.wait('@importDomain');
    cy.visitWithLogin('/domains');
    cy.wait('@getDomains');
    cy.findByText(zone.domain).should('be.visible');
  });
});
