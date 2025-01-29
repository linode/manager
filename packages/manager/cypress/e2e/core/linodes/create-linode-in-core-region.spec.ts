import { Region } from '@linode/api-v4';
import { linodeFactory, regionFactory } from 'src/factories';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockCreateLinode } from 'support/intercepts/linodes';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { randomLabel, randomString } from 'support/util/random';
import { extendRegion } from 'support/util/regions';

describe('Create Linode in Distributed Region', () => {
  /*
   * - Confirms Linode create flow can be completed with a distributed region
   * - Creates a basic Nanode and confirms interactions succeed and outgoing request contains expected data.
   */
  it('should be able to select a distributed region', () => {
    // create mocks
    const mockRegionOptions: Partial<Region> = {
      capabilities: ['Linodes', 'Distributed Plans'],
      site_type: 'core',
    };
    const mockRegion = extendRegion(regionFactory.build(mockRegionOptions));
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: mockRegion.id,
    });
    const rootPass = randomString(32);

    mockAppendFeatureFlags({
      gecko2: {
        enabled: true,
        la: true,
      },
    }).as('getFeatureFlags');
    mockGetRegions([mockRegion]).as('getRegions');
    mockGetRegionAvailability(mockRegion.id, []).as('getRegionAvailability');
    mockCreateLinode(mockLinode).as('createLinode');

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getRegions']);

    // Pick a region from the distributed region list
    cy.findByTestId('region').within(() => {
      ui.tabList.findTabByTitle('Core').should('be.visible').click();
      linodeCreatePage.selectRegionById(mockRegion.id);
    });

    cy.wait(['@getRegionAvailability']);
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.setRootPassword(rootPass);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Submit form to create Linode and confirm that outgoing API request
    // contains expected user data.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const regionId = requestPayload['region'];
      expect(regionId).to.equal(mockLinode.region);
    });
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });
});
