import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetFeatureFlagClientstream } from 'support/intercepts/feature-flags';
import { chooseRegion } from 'support/util/regions';
import { linodeFactory } from 'src/factories';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { linodeCreatePage } from 'support/ui/pages';
import { mockCreateLinode } from 'support/intercepts/linodes';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { ui } from 'support/ui';

describe('Create Linode with user data', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeCreateRefactor: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
  });

  /*
   * - Confirms UI flow to create a Linode with cloud-init user data specified.
   * - Confirms that outgoing API request contains expected user data payload.
   */
  it('can specify user data during Linode Create flow', () => {
    const linodeRegion = chooseRegion({
      capabilities: ['Linodes', 'Metadata'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });
    const userDataFixturePath = 'user-data/user-data-config-basic.yml';

    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    ui.accordionHeading
      .findByTitle('Add User Data')
      .should('be.visible')
      .click();

    cy.fixture(userDataFixturePath).then((userDataContents) => {
      ui.accordion.findByTitle('Add User Data').within(() => {
        cy.findByText('User Data').click();

        cy.focused().type(userDataContents);
      });

      ui.button
        .findByTitle('Create Linode')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@createLinode').then((xhr) => {
        const requestPayload = xhr.request.body;
        expect(requestPayload['metadata']['user_data']).to.equal(
          btoa(userDataContents)
        );
      });
    });
  });

  it('cannot specify user data when selected region does not support it', () => {});

  it('cannot specify user data when selected image does not support it', () => {});
});
