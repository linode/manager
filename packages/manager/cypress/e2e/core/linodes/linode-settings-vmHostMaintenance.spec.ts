import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockGetAccountSettings } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  interceptCreateLinode,
  mockGetLinodeDetails,
} from 'support/intercepts/linodes';
// import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomString } from 'support/util/random';
import { randomLabel, randomNumber } from 'support/util/random';

import { accountSettingsFactory } from 'src/factories';

describe('vmHostMaintenance feature flag', function () {
  beforeEach(() => {
    mockGetAccountSettings(
      accountSettingsFactory.build({
        maintenance_policy: 'linode/power_off_on',
      })
    ).as('getAccountSettings');
    const mockEnabledRegion = regionFactory.build({
      capabilities: ['Linodes', 'Maintenance Policy'],
    });
    const mockDisabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });
    const mockRegions = [mockEnabledRegion, mockDisabledRegion];
    cy.wrap(mockRegions).as('mockRegions');
    // mockGetRegions(mockRegions).as('getRegions');
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      // region: mockRegions[0].id,
    });
    cy.wrap(mockLinode).as('mockLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
  });

  it('Settings when vmHostMaintenance feature flag is enabled', function () {
    // const enabledRegion = this.mockRegions[0];
    // const disabledRegion = this.mockRegions[1];
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
    }).as('getFeatureFlags');

    interceptCreateLinode().as('createLinode');

    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/settings`);
    cy.wait(['@getAccountSettings', '@getFeatureFlags']);

    cy.contains('Maintenance Policy').should('be.visible');
    cy.get('[data-qa-panel="Maintenance Policy"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-panel-summary="Maintenance Policy"]').click();
      });
    // cy.get('[data-qa-autocomplete="Maintenance Policy"]')
    //   .should('be.visible')
    //   .within(() => {
    // 	cy.get('input[data-testid="textfield-input"]')
    // 	  .should('be.visible')
    // 	  .should('be.disabled');
    // cy.findByText('Select a region to choose a maintenance policy.').should(
    //   'be.visible'
    // );
    //   });

    // form prerequisites
    cy.get('[type="password"]').should('be.visible').scrollIntoView();
    cy.get('[id="root-password"]').type(randomString(12));
    cy.get('table[aria-label="List of Linode Plans"] tbody tr')
      .first()
      .within(() => {
        cy.get('td')
          .first()
          .within(() => {
            cy.get('input').should('be.enabled').click();
          });
      });

    cy.scrollTo('bottom');
    // save
    ui.button.findByTitle('Save').should('be.visible').should('be.enabled');
    //   .click();
    // POST payload should include maintenance_policy
    // cy.wait('@createLinode').then((intercept) => {
    //   expect(intercept.request.body['maintenance_policy']).to.eq(
    // 	'linode/migrate'
    //   );
    // });
  });

  xit('Settings when vmHostMaintenance feature flag is disabled', function () {
    const enabledRegion = this.mockRegions[0];
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: false,
      },
    }).as('getFeatureFlags');
    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/settings`);
    cy.wait(['@getAccountSettings', '@getFeatureFlags', '@getRegions']);

    ui.regionSelect.find().click();
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);

    // "Host Maintenance Policy" section is not present
    cy.get('[data-qa-panel="Host Maintenance Policy"]').should('not.exist');
  });
});
