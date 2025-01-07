import { linodeFactory } from 'src/factories';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockCreateLinode } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

describe('Create Linode in Distributed Region', () => {
  /*
   * - Confirms Linode create flow can be completed with a distributed region
   * - Creates a basic Nanode and confirms interactions succeed and outgoing request contains expected data.
   */
  it('should be able to select a distributed region', () => {
    // create mocks
    const linodeRegion = chooseRegion({ capabilities: ['Distributed Plans'] });
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: linodeRegion.id,
    });
    const rootPass = randomString(32);

    mockAppendFeatureFlags({
      gecko2: {
        enabled: true,
        la: true,
      },
    }).as('getFeatureFlags');
    mockCreateLinode(mockLinode).as('createLinode');

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags']);

    // Pick a region from the distributed region list
    cy.get('[data-testid="region"]').within(() => {
      ui.tabList.findTabByTitle('Distributed').should('be.visible').click();
      linodeCreatePage.selectRegionById(mockLinode.region);
    });

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.setRootPassword(rootPass);

    cy.get('[data-qa-tp="Linode Plan"]').within(() => {
      cy.get('[data-qa-plan-row="Nanode 1 GB"]')
        .closest('tr')
        .should('be.visible')
        .click();
    });

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
