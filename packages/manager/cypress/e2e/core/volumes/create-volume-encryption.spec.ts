/**
 * @file UI tests involving Volume creation with Block Storage Encryption functionality.
 */
import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodes,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVolume, mockGetVolumes } from 'support/intercepts/volumes';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

import {
  accountFactory,
  linodeDiskFactory,
  volumeFactory,
} from 'src/factories';

import type { Linode } from '@linode/api-v4';

/**
 * Notice text that is expected to appear upon attempting to attach encrypted Volume to Linode without BSE capability.
 */
const CLIENT_LIBRARY_UPDATE_COPY =
  'This Linode requires a client library update and will need to be rebooted prior to attaching an encrypted volume.';

describe('Volume creation with Block Storage Encryption', () => {
  describe('Reboot notice', () => {
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Block Storage Encryption'],
    });

    const mockRegion = regionFactory.build({
      capabilities: ['Linodes', 'Block Storage Encryption', 'Block Storage'],
    });

    const mockLinodeWithoutCapability = linodeFactory.build({
      capabilities: [],
      label: randomLabel(),
      region: mockRegion.id,
    });

    const mockLinodeWithCapability: Linode = {
      ...mockLinodeWithoutCapability,
      capabilities: ['Block Storage Encryption'],
    };

    const mockVolumeEncrypted = volumeFactory.build({
      encryption: 'enabled',
      label: randomLabel(),
      region: mockRegion.id,
    });

    /*
     * Tests that confirm that the Linode reboot notice appears when expected.
     *
     * Some Linodes lack the capability to support Block Storage Encryption. The
     * capability can be added, however, by rebooting the affected Linode(s) to
     * allow a client library update to take place that enables support for
     * encryption.
     *
     * These tests confirm that users are informed of this requirement and
     * are prevented from completing Volume create/attach flows when this
     * requirement is not met.
     */
    describe('Notice is shown when expected', () => {
      beforeEach(() => {
        mockAppendFeatureFlags({
          blockStorageEncryption: true,
        });
        mockGetAccount(mockAccount);
        mockGetRegions([mockRegion]);
        mockGetLinodes([mockLinodeWithoutCapability]);
        mockGetLinodeDetails(
          mockLinodeWithoutCapability.id,
          mockLinodeWithoutCapability
        );
        mockGetLinodeVolumes(mockLinodeWithoutCapability.id, []);
        mockGetLinodeDisks(mockLinodeWithoutCapability.id, [
          linodeDiskFactory.build(),
        ]);
      });

      /*
       * - Confirms notice appears when creating and attaching a new Volume via the Volume create page.
       * - Confirms submit button is disabled while notice is present.
       */
      it('shows notice on Volume create page when attaching new Volume to Linode without BSE', () => {
        mockGetVolumes([]);
        cy.visitWithLogin('/volumes/create');

        // Select a region, then select a Linode that does not have the BSE capability.
        ui.autocomplete.findByLabel('Region').type(mockRegion.label);

        ui.regionSelect.findItemByRegionId(mockRegion.id, [mockRegion]).click();

        ui.autocomplete
          .findByLabel('Linode')
          .type(mockLinodeWithoutCapability.label);

        ui.autocompletePopper.find().within(() => {
          cy.findByText(mockLinodeWithoutCapability.label).click();
        });

        // Confirm that reboot notice is absent before clicking the "Encrypt Volume" checkbox.
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');

        cy.findByText('Encrypt Volume').should('be.visible').click();

        // Confirm that reboot notice appears after clicking the "Encrypt Volume" checkbox,
        // and that Volume create submit button remains disabled.
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');

        ui.button
          .findByTitle('Create Volume')
          .scrollIntoView()
          .should('be.visible')
          .should('be.disabled');
      });

      /*
       * - Confirms notice appears when attaching an existing Volume via the Linode details page.
       * - Confirms submit button is disabled while notice is present.
       */
      it('shows notice on Linode details page when attaching existing Volume to Linode without BSE', () => {
        mockGetVolumes([mockVolumeEncrypted]);
        mockGetVolume(mockVolumeEncrypted);
        cy.visitWithLogin(`/linodes/${mockLinodeWithoutCapability.id}/storage`);

        ui.button
          .findByTitle('Add Volume')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.drawer
          .findByTitle(`Create Volume for ${mockLinodeWithoutCapability.label}`)
          .should('be.visible')
          .within(() => {
            cy.findByText('Attach Existing Volume')
              .should('be.visible')
              .click();

            // Confirm that reboot notice is absent before Volume is selected.
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');

            ui.autocomplete
              .findByLabel('Volume')
              .type(mockVolumeEncrypted.label);

            ui.autocompletePopper.find().within(() => {
              cy.findByText(mockVolumeEncrypted.label)
                .should('be.visible')
                .click();
            });

            // Confirm that selecting an encrypted Volume triggers reboot notice to appear.
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
            ui.button
              .findByTitle('Attach Volume')
              .scrollIntoView()
              .should('be.disabled');
          });
      });

      /*
       * - Confirms notice appears when creating and attaching a new Volume via the Linode details page.
       * - Confirms submit button is disabled while notice is present.
       */
      it('shows notice on Linode details page when creating new Volume and attaching to Linode without BSE', () => {
        mockGetVolumes([]);
        cy.visitWithLogin(`/linodes/${mockLinodeWithoutCapability.id}/storage`);

        ui.button
          .findByTitle('Add Volume')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.drawer
          .findByTitle(`Create Volume for ${mockLinodeWithoutCapability.label}`)
          .should('be.visible')
          .within(() => {
            cy.findByLabelText('Create and Attach Volume').should('be.checked');

            // Confirm that reboot notice is absent before encryption is selected.
            cy.findByLabelText('Encrypt Volume').should('not.be.checked');
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');

            // Click the "Encrypt Volume" checkbox and confirm that notice appears.
            cy.findByText('Encrypt Volume').should('be.visible').click();

            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
            ui.button
              .findByTitle('Create Volume')
              .scrollIntoView()
              .should('be.disabled');
          });
      });
    });

    /*
     * Tests that confirm that the Linode reboot notice is not shown when it shouldn't be.
     *
     * These tests confirm that users are not shown the Linode reboot notice when attaching
     * encrypted Volumes to Linodes that already have the block storage encryption capability,
     * and they are not prevented from attaching Volumes to Linodes in these cases.
     */
    describe('Reboot notice is absent when expected', () => {
      beforeEach(() => {
        mockAppendFeatureFlags({
          blockStorageEncryption: true,
        });
        mockGetAccount(mockAccount);
        mockGetRegions([mockRegion]);
        mockGetLinodes([mockLinodeWithCapability]);
        mockGetLinodeDetails(
          mockLinodeWithCapability.id,
          mockLinodeWithCapability
        );
        mockGetLinodeVolumes(mockLinodeWithCapability.id, []);
        mockGetLinodeDisks(mockLinodeWithCapability.id, [
          linodeDiskFactory.build(),
        ]);
      });

      /*
       * - Confirms notice appears is absent when creating and attaching a new Volume via the Volume create page.
       */
      it('does not show notice on Volume create page when attaching new Volume to Linode with BSE', () => {
        mockGetVolumes([]);
        cy.visitWithLogin('/volumes/create');

        // Select a region, then select a Linode that has the BSE capability.
        ui.autocomplete.findByLabel('Region').type(mockRegion.label);

        ui.regionSelect.findItemByRegionId(mockRegion.id, [mockRegion]).click();

        ui.autocomplete
          .findByLabel('Linode')
          .type(mockLinodeWithCapability.label);

        ui.autocompletePopper.find().within(() => {
          cy.findByText(mockLinodeWithCapability.label).click();
        });

        cy.findByText('Encrypt Volume').should('be.visible').click();

        // Confirm that reboot notice is absent after checking "Encrypt Volume",
        // and the "Create Volume" button is enabled.
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');

        ui.button.findByTitle('Create Volume').should('be.enabled');
      });

      /*
       * - Confirms notice is absent when attaching an existing Volume via the Linode details page.
       */
      it('does not show notice on Linode details page when attaching existing Volume to Linode with BSE', () => {
        mockGetVolumes([mockVolumeEncrypted]);
        mockGetVolume(mockVolumeEncrypted);
        cy.visitWithLogin(`/linodes/${mockLinodeWithCapability.id}/storage`);

        ui.button
          .findByTitle('Add Volume')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.drawer
          .findByTitle(`Create Volume for ${mockLinodeWithCapability.label}`)
          .should('be.visible')
          .within(() => {
            cy.findByText('Attach Existing Volume')
              .should('be.visible')
              .click();

            ui.autocomplete
              .findByLabel('Volume')
              .type(mockVolumeEncrypted.label);

            ui.autocompletePopper.find().within(() => {
              cy.findByText(mockVolumeEncrypted.label)
                .should('be.visible')
                .click();
            });

            // Confirm that reboot notice is absent and submit button is enabled.
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');
            ui.button.findByTitle('Attach Volume').should('be.enabled');
          });
      });

      /*
       * - Confirms notice is absent when creating and attaching a new Volume via the Linode details page.
       */
      it('does not show notice on Linode details page when creating new Volume and attaching to Linode with BSE', () => {
        mockGetVolumes([]);
        cy.visitWithLogin(`/linodes/${mockLinodeWithCapability.id}/storage`);

        ui.button
          .findByTitle('Add Volume')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.drawer
          .findByTitle(`Create Volume for ${mockLinodeWithCapability.label}`)
          .should('be.visible')
          .within(() => {
            cy.findByLabelText('Create and Attach Volume').should('be.checked');

            // Confirm that reboot notice is absent before encryption is selected.
            cy.findByLabelText('Encrypt Volume').should('not.be.checked');
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');

            // Click the "Encrypt Volume" checkbox and confirm that notice appears.
            cy.findByText('Encrypt Volume').should('be.visible').click();

            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');
            ui.button.findByTitle('Create Volume').should('be.enabled');
          });
      });
    });
  });
});
