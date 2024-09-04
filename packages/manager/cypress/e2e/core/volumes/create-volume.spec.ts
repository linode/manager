import type { Linode, Region } from '@linode/api-v4';
import { createTestLinode } from 'support/util/linodes';
import { createLinodeRequestFactory } from 'src/factories/linodes';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { interceptCreateVolume } from 'support/intercepts/volumes';
import { randomNumber, randomString, randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { ui } from 'support/ui';
import { accountFactory, regionFactory } from 'src/factories';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetRegions } from 'support/intercepts/regions';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes', 'Block Storage', 'Block Storage Encryption'],
    id: 'us-east',
    label: 'Newark, NJ',
    site_type: 'core',
  }),
];

const CLIENT_LIBRARY_UPDATE_COPY =
  'This Linode requires a client library update and will need to be rebooted prior to attaching an encrypted volume.';

authenticate();
describe('volume create flow', () => {
  before(() => {
    cleanUp(['volumes', 'linodes']);
  });

  /*
   * - Creates a volume that is not attached to a Linode.
   * - Confirms that volume is listed correctly on volumes landing page.
   */
  it('creates an unattached volume', () => {
    cy.tag('purpose:syntheticTesting');

    const region = chooseRegion();
    const volume = {
      label: randomLabel(),
      size: `${randomNumber(10, 250)}`,
      region: region.id,
      regionLabel: region.label,
    };

    interceptCreateVolume().as('createVolume');

    cy.visitWithLogin('/volumes/create', {
      localStorageOverrides: pageSizeOverride,
    });

    // Fill out and submit volume create form.
    cy.contains('Label').click().type(volume.label);
    cy.contains('Size').click().type(`{selectall}{backspace}${volume.size}`);
    ui.regionSelect.find().click().type(`${volume.region}{enter}`);

    cy.findByText('Create Volume').click();
    cy.wait('@createVolume');

    // Validate volume configuration drawer opens, then close it.
    cy.findByText('Volume scheduled for creation.').should('be.visible');
    cy.get('[data-qa-close-drawer="true"]').click();

    // Confirm that volume is listed on landing page with expected configuration.
    cy.findByText(volume.label)
      .closest('tr')
      .within(() => {
        cy.findByText(volume.label).should('be.visible');
        cy.findByText(`${volume.size} GB`).should('be.visible');
        cy.findByText(volume.regionLabel).should('be.visible');
        cy.findByText('Unattached');
      });
  });

  /*
   * - Creates a volume that is attached to an existing Linode.
   * - Confirms that volume is listed correctly on Volumes landing page.
   * - Confirms that volume is listed correctly on Linode 'Storage' details page.
   */
  it('creates an attached volume', () => {
    const region = chooseRegion();

    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: region.id,
      root_pass: randomString(16),
      booted: false,
    });

    const volume = {
      label: randomLabel(),
      size: `${randomNumber(10, 250)}`,
      region: region.id,
      regionLabel: region.label,
    };

    cy.defer(() => createTestLinode(linodeRequest), 'creating Linode').then(
      (linode) => {
        interceptCreateVolume().as('createVolume');

        cy.visitWithLogin('/volumes/create', {
          localStorageOverrides: pageSizeOverride,
        });

        // Fill out and submit volume create form.
        cy.contains('Label').click().type(volume.label);
        cy.contains('Size')
          .click()
          .type(`{selectall}{backspace}${volume.size}`);
        ui.regionSelect.find().click().type(`${volume.region}{enter}`);

        cy.findByLabelText('Linode')
          .should('be.visible')
          .click()
          .type(linode.label);

        ui.autocompletePopper
          .findByTitle(linode.label)
          .should('be.visible')
          .click();

        // @TODO BSE: once BSE is fully rolled out, check for the notice (selected linode doesn't have
        // blockstorage_encryption capability + user checked "Encrypt Volume" checkbox) instead of the absence of it
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');

        cy.findByText('Create Volume').click();
        cy.wait('@createVolume');

        // Confirm volume configuration drawer opens, then close it.
        cy.findByText('Volume scheduled for creation.').should('be.visible');
        cy.get('[data-qa-close-drawer="true"]').click();

        // Confirm that volume is listed on landing page with expected configuration.
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText(`${volume.size} GB`).should('be.visible');
            cy.findByText(volume.regionLabel).should('be.visible');
            cy.findByText(linode.label).should('be.visible');
          });

        // Confirm that volume is listed on Linode 'Storage' details page.
        cy.visitWithLogin(`/linodes/${linode.id}/storage`);
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText(`${volume.size} GB`).should('be.visible');
          });
      }
    );
  });

  /*
   * - Checks for Block Storage Encryption notices on the Volume Create page.
   */
  it('displays a warning notice on Volume Create page re: rebooting for client library updates under the appropriate conditions', () => {
    // Conditions: Block Storage encryption feature flag is on; user has Block Storage Encryption capability; volume being created is encrypted and the
    // selected Linode does not support Block Storage Encryption

    // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
    mockAppendFeatureFlags({
      blockStorageEncryption: true,
    }).as('getFeatureFlags');

    // Mock account response
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Block Storage Encryption'],
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetRegions(mockRegions).as('getRegions');

    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      root_pass: randomString(16),
      region: mockRegions[0].id,
      booted: false,
    });

    cy.defer(() => createTestLinode(linodeRequest), 'creating Linode').then(
      (linode: Linode) => {
        cy.visitWithLogin('/volumes/create');
        cy.wait(['@getFeatureFlags', '@getAccount']);

        // Select a linode without the BSE capability
        cy.findByLabelText('Linode')
          .should('be.visible')
          .click()
          .type(linode.label);

        ui.autocompletePopper
          .findByTitle(linode.label)
          .should('be.visible')
          .click();

        // Check the "Encrypt Volume" checkbox
        cy.get('[data-qa-checked]').should('be.visible').click();
        // });

        // Ensure warning notice is displayed
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
      }
    );
  });

  /*
   * - Creates a volume from the 'Storage' details page of an existing Linode.
   * - Confirms that volume is listed correctly on Linode 'Storage' details page.
   * - Confirms that volume is listed correctly on Volumes landing page.
   */
  it('creates a volume from an existing Linode', () => {
    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      root_pass: randomString(16),
      region: chooseRegion().id,
      booted: false,
    });

    cy.defer(() => createTestLinode(linodeRequest), 'creating Linode').then(
      (linode: Linode) => {
        const volume = {
          label: randomLabel(),
          size: `${randomNumber(10, 250)}`,
        };

        cy.visitWithLogin(`/linodes/${linode.id}/storage`, {
          localStorageOverrides: pageSizeOverride,
        });

        // Click "Add Volume" button, fill out and submit volume create drawer form.
        cy.findByText('Add Volume').click();
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.findByText(`Create Volume for ${linode.label}`).should(
            'be.visible'
          );
          cy.contains('Create and Attach Volume').click();
          cy.contains('Label').click().type(volume.label);
          cy.contains('Size').type(`{selectall}{backspace}${volume.size}`);
          cy.findByText('Create Volume').click();
        });

        // Confirm volume configuration drawer opens, then close it.
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.get('[data-qa-close-drawer="true"]').click();
        });

        // Confirm that volume is listed on Linode 'Storage' details page.
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText(`${volume.size} GB`).should('be.visible');
          });

        // Confirm that volume is listed on landing page with expected configuration.
        cy.visitWithLogin('/volumes', {
          localStorageOverrides: pageSizeOverride,
        });
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText(`${volume.size} GB`).should('be.visible');
            cy.findByText(linode.label).should('be.visible');
          });
      }
    );
  });
});
