import { createTestLinode } from 'support/util/linodes';
import { containsVisible, fbtVisible, getClick } from 'support/helpers';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';
import { mockGetFeatureFlagClientstream } from 'support/intercepts/feature-flags';
import { interceptLinodeResize } from 'support/intercepts/linodes';

authenticate();
describe('resize linode', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
  });

  it('resizes a linode by increasing size: warm migration', () => {
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode) => {
      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);
      cy.findByText('Shared CPU').click({ scrollBehavior: false });
      containsVisible('Linode 8 GB');
      getClick('[id="g6-standard-4"]');
      cy.get('[data-qa-radio="warm"]').find('input').should('be.checked');
      cy.get('[data-testid="textfield-input"]').type(linode.label);
      cy.get('[data-qa-resize="true"]').should('be.enabled').click();
      cy.wait('@linodeResize');

      // TODO: Unified Migration: [M3-7115] - Replace with copy from API '../notifications.py'
      cy.contains(
        "Your linode will be warm resized and will automatically attempt to power off and restore to it's previous state."
      ).should('be.visible');
    });
  });

  it('resizes a linode by increasing size: cold migration', () => {
    mockGetFeatureFlagClientstream().as('getClientStream');
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode) => {
      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);
      cy.findByText('Shared CPU').click({ scrollBehavior: false });
      containsVisible('Linode 8 GB');
      getClick('[id="g6-standard-4"]');
      cy.get('[data-qa-radio="cold"]').click();
      cy.get('[data-qa-radio="cold"]').find('input').should('be.checked');
      cy.get('[data-testid="textfield-input"]').type(linode.label);
      cy.get('[data-qa-resize="true"]').should('be.enabled').click();
      cy.wait('@linodeResize');

      // TODO: Unified Migration: [M3-7115] - Replace with copy from API '../notifications.py'
      cy.contains(
        'Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).'
      ).should('be.visible');
    });
  });

  it('resizes a linode by increasing size when offline: cold migration', () => {
    mockGetFeatureFlagClientstream().as('getClientStream');
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Turn off the linode to resize the disk
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

      containsVisible('OFFLINE');

      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);
      cy.findByText('Shared CPU').click({ scrollBehavior: false });
      containsVisible('Linode 8 GB');
      getClick('[id="g6-standard-4"]');
      // We disable the options if the linode is offline, and proceed with a
      // cold migration even though warm is selected by default.
      cy.get('[data-qa-radio="warm"]').find('input').should('be.disabled');
      cy.get('[data-qa-radio="cold"]')
        .find('input')
        .should('be.checked')
        .should('be.disabled');
      cy.get('[data-testid="textfield-input"]').type(linode.label);
      cy.get('[data-qa-resize="true"]').should('be.enabled').click();
      cy.wait('@linodeResize');

      // TODO: Unified Migration: [M3-7115] - Replace with copy from API '../notifications.py'
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
      const diskName = 'Debian 11 Disk';
      const size = '50000'; // 50 GB

      // Error flow when attempting to resize a linode to a smaller size without
      // resizing the disk to the requested size first.
      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);
      cy.findByText('Shared CPU').click({ scrollBehavior: false });
      containsVisible('Linode 2 GB');
      getClick('[id="g6-standard-1"]');
      cy.get('[data-testid="textfield-input"]').type(linode.label);
      cy.get('[data-qa-resize="true"]').should('be.enabled').click();
      cy.wait('@linodeResize');
      // Failed to reduce the size of the linode
      cy.contains(
        'The current disk size of your Linode is too large for the new service plan. Please resize your disk to accommodate the new plan. You can read our Resize Your Linode guide for more detailed instructions.'
      )
        .scrollIntoView()
        .should('be.visible');

      // Normal flow when resizing a linode to a smaller size after first resizing
      // its disk.
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Turn off the linode to resize the disk
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

      containsVisible('OFFLINE');

      cy.visitWithLogin(`linodes/${linode.id}/storage`);
      fbtVisible(diskName);

      cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
        cy.contains('Resize').should('be.enabled').click();
      });

      ui.drawer
        .findByTitle(`Resize ${diskName}`)
        .should('be.visible')
        .within(() => {
          cy.get('[id="size"]').should('be.visible').click().clear().type(size);

          ui.buttonGroup
            .findButtonByTitle('Resize')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Wait until the disk resize is done.
      ui.toast.assertMessage(`Disk ${diskName} successfully resized.`);

      interceptLinodeResize(linode.id).as('linodeResize');
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);
      cy.findByText('Shared CPU').click({ scrollBehavior: false });
      containsVisible('Linode 2 GB');
      getClick('[id="g6-standard-1"]');
      cy.get('[data-testid="textfield-input"]').type(linode.label);
      cy.get('[data-qa-resize="true"]').should('be.enabled').click();
      cy.wait('@linodeResize');
      cy.contains(
        'Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).'
      ).should('be.visible');
    });
  });
});
