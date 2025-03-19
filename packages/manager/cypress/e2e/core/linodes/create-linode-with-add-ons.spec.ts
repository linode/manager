import {
  mockCreateLinode,
  mockGetLinodeDetails,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { linodeFactory } from 'src/factories';

describe('Create Linode with Add-ons', () => {
  /*
   * - Confirms UI flow to create a Linode with backups using mock API data.
   * - Confirms that backups is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the backups to be enabled.
   */
  it('can select Backups during Linode Create flow', () => {
    const linodeRegion = chooseRegion({ capabilities: ['Linodes'] });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));
    linodeCreatePage.checkBackups();
    linodeCreatePage.checkEUAgreements();

    // Confirm Backups assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      cy.findByText('Backups').should('be.visible');
    });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm property "backups_enabled" is "true" in the request payload.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const backupsEnabled = requestPayload['backups_enabled'];
      expect(backupsEnabled).to.equal(true);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * - Confirms UI flow to create a Linode with private IPs using mock API data.
   * - Confirms that Private IP is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the private IPs to be enabled.
   */
  it('can select private IP during Linode Create flow', () => {
    const linodeRegion = chooseRegion({ capabilities: ['Linodes'] });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));
    linodeCreatePage.checkEUAgreements();
    linodeCreatePage.checkPrivateIPs();

    // Confirm Private IP assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      cy.findByText('Private IP').should('be.visible');
    });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm property "private_ip" is "true" in the request payload.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const privateId = requestPayload['private_ip'];
      expect(privateId).to.equal(true);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });
});
