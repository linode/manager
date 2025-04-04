import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockGetAllImages, mockGetImage } from 'support/intercepts/images';
import {
  mockCreateLinode,
  mockGetLinodeDetails,
} from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { imageFactory } from 'src/factories';

describe('Create Linode with user data', () => {
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

    // Fill out create form, selecting a region and image that both have
    // cloud-init capabilities.
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Expand "Add User Data" accordion and enter user data config.
    ui.accordionHeading
      .findByTitle('Add User Data')
      .should('be.visible')
      .click();

    cy.fixture(userDataFixturePath).then((userDataContents) => {
      ui.accordion.findByTitle('Add User Data').within(() => {
        cy.findByText('User Data').click();
        cy.focused().type(userDataContents);
      });

      // Submit form to create Linode and confirm that outgoing API request
      // contains expected user data.
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

  /*
   * - Confirms UI flow when creating a Linode using a region that lacks cloud-init capability.
   * - Confirms that "Add User Data" section is hidden when selected region lacks cloud-init.
   */
  it('cannot specify user data when selected region does not support it', () => {
    const mockLinodeRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    mockGetRegions([mockLinodeRegion]);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');

    // Confirm that "Add User Data" section is hidden when selected region
    // lacks cloud-init capability.
    cy.findByText('Add User Data').should('not.exist');
  });

  /*
   * - Confirms UI flow when creating a Linode using an image that lacks cloud-init capability.
   * - Confirms that "Add User Data" section is hidden when selected image lacks cloud-init.
   */
  it('cannot specify user data when selected image does not support it', () => {
    const linodeRegion = chooseRegion({
      capabilities: ['Linodes', 'Metadata'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });
    const mockImage = imageFactory.build({
      // `cloud-init` is omitted from Image capabilities.
      capabilities: [],
      created_by: 'linode',
      // null eol so that the image is not deprecated
      eol: null,
      id: `linode/${randomLabel()}`,
      is_public: true,
      label: randomLabel(),
      vendor: 'Debian',
    });

    mockGetImage(mockImage.id, mockImage);
    mockGetAllImages([mockImage]);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage(mockImage.label);
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');

    // Confirm that "Add User Data" section is hidden when selected image
    // lacks cloud-init capability.
    cy.findByText('Add User Data').should('not.exist');
  });
});
