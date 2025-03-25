import { authenticate } from 'support/api/authentication';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { interceptLinodeResize } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';

authenticate();
describe('resize linode', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
    cy.tag('method:e2e');
  });

  it('resizes a linode by increasing size: warm migration', () => {
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode) => {
      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);

      ui.dialog
        .findByTitle(`Resize Linode ${linode.label}`)
        .should('be.visible')
        .within(() => {
          // Click "Shared CPU" plan tab, and select 8 GB plan.
          ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();

          cy.contains('Linode 8 GB').should('be.visible').click();

          // Select warm resize option, and enter Linode label in type-to-confirm field.
          cy.findByText('Warm resize').as('qaWarmResize').scrollIntoView();
          cy.get('@qaWarmResize').should('be.visible').click();

          cy.findByLabelText('Linode Label').type(linode.label);

          // Click "Resize Linode".
          // The Resize Linode button remains disabled while the Linode is provisioning,
          // so we have to wait for that to complete before the button becomes enabled.
          ui.button
            .findByTitle('Resize Linode')
            .should('be.enabled', { timeout: LINODE_CREATE_TIMEOUT })
            .click();
        });

      cy.wait('@linodeResize');
      cy.contains(
        'Your linode will be warm resized and will automatically attempt to power off and restore to its previous state.'
      ).should('be.visible');
    });
  });

  it('resizes a linode by increasing size: cold migration', () => {
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode) => {
      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);

      ui.dialog
        .findByTitle(`Resize Linode ${linode.label}`)
        .should('be.visible')
        .within(() => {
          ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();

          cy.contains('Linode 8 GB').should('be.visible').click();

          cy.findByText('Cold resize').as('qaColdResize').scrollIntoView();
          cy.get('@qaColdResize').should('be.visible').click();

          cy.findByLabelText('Linode Label').type(linode.label);

          // Click "Resize Linode".
          // The Resize Linode button remains disabled while the Linode is provisioning,
          // so we have to wait for that to complete before the button becomes enabled.
          ui.button
            .findByTitle('Resize Linode')
            .should('be.enabled', { timeout: LINODE_CREATE_TIMEOUT })
            .click();
        });

      cy.wait('@linodeResize');
      cy.contains(
        'Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).'
      ).should('be.visible');
    });
  });

  it('resizes a linode by increasing size when offline: cold migration', () => {
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode(
        { booted: false },
        { securityMethod: 'vlan_no_internet' }
      )
    ).then((linode) => {
      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.findByText('OFFLINE', { timeout: LINODE_CREATE_TIMEOUT });

      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .click();

      ui.actionMenuItem
        .findByTitle('Resize')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.dialog
        .findByTitle(`Resize Linode ${linode.label}`)
        .should('be.visible')
        .within(() => {
          ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();

          cy.contains('Linode 8 GB').should('be.visible').click();

          // When a Linode is powered off, only cold resizes are available.
          // Confirm that the UI reflects this by ensuring the cold resize
          // option is checked and both radio buttons are disabled.
          cy.findByLabelText('Warm resize', { exact: false })
            .should('be.disabled')
            .should('not.be.checked');

          cy.findByLabelText('Cold resize')
            .should('be.disabled')
            .should('be.checked');

          // Enter Linode label in type-to-confirm field and proceed with resize.
          cy.findByLabelText('Linode Label').type(linode.label);

          ui.button.findByTitle('Resize Linode').should('be.enabled').click();
        });

      cy.wait('@linodeResize');
      cy.contains(
        'Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).'
      ).should('be.visible');
    });
  });

  it('resizes a linode by decreasing size', () => {
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode(
        { booted: true, type: 'g6-standard-2' },
        { securityMethod: 'vlan_no_internet' }
      )
    ).then((linode) => {
      const diskName = 'Ubuntu 24.04 LTS Disk';
      const size = '50000'; // 50 GB

      // Error flow when attempting to resize a linode to a smaller size without
      // resizing the disk to the requested size first.
      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);

      ui.dialog
        .findByTitle(`Resize Linode ${linode.label}`)
        .should('be.visible')
        .within(() => {
          ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();

          cy.contains('Linode 2 GB').should('be.visible').click();
          cy.findByLabelText('Linode Label').type(linode.label);

          // Click "Resize Linode".
          // The Resize Linode button remains disabled while the Linode is provisioning,
          // so we have to wait for that to complete before the button becomes enabled.
          ui.button
            .findByTitle('Resize Linode')
            .should('be.enabled', { timeout: LINODE_CREATE_TIMEOUT })
            .click();
        });

      // Confirm that API responds with an error message when attempting to
      // decrease the size of the Linode while its disk is too large.
      cy.wait('@linodeResize');
      cy.contains(
        'The current disk size of your Linode is too large for the new service plan. Please resize your disk to accommodate the new plan. You can read our Resize Your Linode guide for more detailed instructions.'
      )
        .as('qaTheCurrentDisk')
        .scrollIntoView();
      cy.get('@qaTheCurrentDisk').should('be.visible');

      // Normal flow when resizing a linode to a smaller size after first resizing
      // its disk.
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);

      // Power off the Linode to resize the disk
      ui.button.findByTitle('Power Off').should('be.visible').click();

      ui.dialog
        .findByTitle(`Power Off Linode ${linode.label}?`)
        .should('be.visible')
        .then(() => {
          ui.button
            .findByTitle(`Power Off Linode`)
            .should('be.visible')
            .click();
        });

      // Wait for Linode to power off, then resize the disk to 50 GB.
      cy.findByText('OFFLINE', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );
      cy.findByText(diskName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          ui.button
            .findByTitle('Resize')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      ui.drawer
        .findByTitle(`Resize ${diskName}`)
        .should('be.visible')
        .within(() => {
          cy.contains('Size (required)').should('be.visible').click();

          cy.focused().clear();
          cy.focused().type(size);

          ui.buttonGroup
            .findButtonByTitle('Resize')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Wait until the disk resize is done, then initiate another resize attempt.
      ui.toast.assertMessage(
        `Disk ${diskName} on Linode ${linode.label} has been resized.`
      );

      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .click();

      ui.actionMenuItem
        .findByTitle('Resize')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Resize Linode ${linode.label}`)
        .should('be.visible')
        .within(() => {
          ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();

          cy.contains('Linode 2 GB').should('be.visible').click();
          cy.findByLabelText('Linode Label').type(linode.label);

          // Click "Resize Linode".
          // The Resize Linode button remains disabled while the Linode is provisioning,
          // so we have to wait for that to complete before the button becomes enabled.
          ui.button
            .findByTitle('Resize Linode')
            .should('be.enabled', { timeout: LINODE_CREATE_TIMEOUT })
            .click();
        });

      // Confirm that the resize API request succeeds now that the Linode's disk
      // size has been decreased.
      cy.wait('@linodeResize');
      cy.contains(
        'Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).'
      ).should('be.visible');
    });
  });
});
