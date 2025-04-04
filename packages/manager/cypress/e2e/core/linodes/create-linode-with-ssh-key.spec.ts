import { linodeFactory } from '@linode/utilities';
import { mockGetUser, mockGetUsers } from 'support/intercepts/account';
import { mockCreateLinode } from 'support/intercepts/linodes';
import { mockCreateSSHKey } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountUserFactory, sshKeyFactory } from 'src/factories';

describe('Create Linode with SSH Key', () => {
  /*
   * - Confirms UI flow when creating a Linode with an authorized SSH key.
   * - Confirms that existing SSH keys are listed on page and can be selected.
   * - Confirms that outgoing Linode create API request contains authorized user for chosen key.
   */
  it('can add an existing SSH key during Linode create flow', () => {
    const linodeRegion = chooseRegion();
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    const mockSshKey = sshKeyFactory.build({
      label: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      ssh_keys: [mockSshKey.label],
      username: randomLabel(),
    });

    mockGetUsers([mockUser]);
    mockGetUser(mockUser);
    mockCreateLinode(mockLinode).as('createLinode');

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm that SSH key is listed, then select it.
    cy.findByText(mockSshKey.label).scrollIntoView();
    cy.findByText(mockSshKey.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(mockUser.username);
        cy.findByLabelText(`Enable SSH for ${mockUser.username}`).click();
      });

    // Click "Create Linode" button and confirm outgoing request data.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm that outgoing Linode create request contains authorized user that
    // corresponds to the selected SSH key.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload['authorized_users'][0]).to.equal(mockUser.username);
    });
  });

  /*
   * - Confirms UI flow when creating and selecting an SSH key during Linode create flow.
   * - Confirms that new SSH key is automatically shown in Linode create page.
   * - Confirms that outgoing Linode create API request contains authorized user for new key.
   */
  it('can add a new SSH key during Linode create flow', () => {
    const linodeRegion = chooseRegion();
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    const mockSshKey = sshKeyFactory.build({
      label: randomLabel(),
      ssh_key: `ssh-rsa ${randomString(16)}`,
    });

    const mockUser = accountUserFactory.build({
      ssh_keys: [],
      username: randomLabel(),
    });

    const mockUserWithKey = {
      ...mockUser,
      ssh_keys: [mockSshKey.label],
    };

    mockGetUser(mockUser);
    mockGetUsers([mockUser]);
    mockCreateLinode(mockLinode).as('createLinode');
    mockCreateSSHKey(mockSshKey).as('createSSHKey');

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm that no SSH keys are listed for the mocked user.
    cy.findByText(mockUser.username).scrollIntoView();
    cy.findByText(mockUser.username)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('None').should('be.visible');
        cy.findByLabelText(`Enable SSH for ${mockUser.username}`).should(
          'be.disabled'
        );
      });

    // Click "Add an SSH Key" and enter a label and the public key, then submit.
    ui.button
      .findByTitle('Add an SSH Key')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockGetUsers([mockUserWithKey]).as('refetchUsers');
    ui.drawer
      .findByTitle('Add SSH Key')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label').type(mockSshKey.label);
        cy.findByLabelText('SSH Public Key').type(mockSshKey.ssh_key);
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@createSSHKey', '@refetchUsers']);

    // Confirm that the new SSH key is listed, and select it to be added to the Linode.
    cy.findByText(mockSshKey.label).scrollIntoView();
    cy.findByText(mockSshKey.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByLabelText(`Enable SSH for ${mockUser.username}`).click();
      });

    // Click "Create Linode" button and confirm outgoing request data.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm that outgoing Linode create request contains authorized user that
    // corresponds to the new SSH key.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload['authorized_users'][0]).to.equal(mockUser.username);
    });
  });
});
