import { regionFactory } from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockCreateLinode } from 'support/intercepts/linodes';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { randomLabel, randomString } from 'support/util/random';

import { linodeFactory } from 'src/factories';

describe('Create Linode in a Core Region', () => {
  /*
   * - Confirms Linode create flow can be completed with a core region
   * - Creates a basic Nanode and confirms interactions succeed and outgoing request contains expected data.
   */
  it('should be able to select a core region', () => {
    // create mocks
    const mockRegion1 = regionFactory.build({
      capabilities: ['Linodes'],
      site_type: 'core',
    });
    const mockRegion2 = regionFactory.build({
      capabilities: ['Linodes', 'Distributed Plans'],
      site_type: 'distributed',
    });
    const mockRegions = [mockRegion1, mockRegion2];
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: mockRegion1.id,
    });
    const rootPass = randomString(32);

    mockAppendFeatureFlags({
      gecko2: {
        enabled: true,
        la: true,
      },
    }).as('getFeatureFlags');
    mockGetRegions(mockRegions).as('getRegions');
    mockGetRegionAvailability(mockRegion1.id, []).as('getRegionAvailability');
    mockCreateLinode(mockLinode).as('createLinode');

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getRegions']);

    // Pick a region from the core region list
    cy.findByTestId('region').within(() => {
      ui.tabList.findTabByTitle('Core').should('be.visible').click();
      linodeCreatePage.selectRegionById(mockRegion1.id);
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
