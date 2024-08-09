import type { Linode } from '@linode/api-v4';
import { createTestLinode } from 'support/util/linodes';
import { createLinodeRequestFactory } from 'src/factories/linodes';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { containsClick, fbtVisible, fbtClick, getClick } from 'support/helpers';
import { interceptCreateVolume } from 'support/intercepts/volumes';
import { randomNumber, randomString, randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { ui } from 'support/ui';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { accountFactory } from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

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
    containsClick('Label').type(volume.label);
    containsClick('Size').type(`{selectall}{backspace}${volume.size}`);
    ui.regionSelect.find().click().type(`${volume.region}{enter}`);

    fbtClick('Create Volume');
    cy.wait('@createVolume');

    // Validate volume configuration drawer opens, then close it.
    fbtVisible('Volume scheduled for creation.');
    getClick('[data-qa-close-drawer="true"]');

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
        containsClick('Label').type(volume.label);
        containsClick('Size').type(`{selectall}{backspace}${volume.size}`);
        ui.regionSelect.find().click().type(`${volume.region}{enter}`);

        cy.findByLabelText('Linode')
          .should('be.visible')
          .click()
          .type(linode.label);

        ui.autocompletePopper
          .findByTitle(linode.label)
          .should('be.visible')
          .click();

        fbtClick('Create Volume');
        cy.wait('@createVolume');

        // Confirm volume configuration drawer opens, then close it.
        fbtVisible('Volume scheduled for creation.');
        getClick('[data-qa-close-drawer="true"]');

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
            fbtVisible(volume.label);
            fbtVisible(`${volume.size} GB`);
          });
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

        // Click "Create Volume" button, fill out and submit volume create drawer form.
        fbtClick('Create Volume');
        cy.get('[data-qa-drawer="true"]').within(() => {
          fbtVisible(`Create Volume for ${linode.label}`);
          containsClick('Create and Attach Volume');
          containsClick('Label').type(volume.label);
          containsClick('Size').type(`{selectall}{backspace}${volume.size}`);
          fbtClick('Create Volume');
        });

        // Confirm volume configuration drawer opens, then close it.
        cy.get('[data-qa-drawer="true"]').within(() => {
          getClick('[data-qa-close-drawer="true"]');
        });

        // Confirm that volume is listed on Linode 'Storage' details page.
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            fbtVisible(volume.label);
            fbtVisible(`${volume.size} GB`);
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

  it('should not have a "Volume Encryption" section visible if the feature flag is off and user does not have capability', () => {
    // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
    mockAppendFeatureFlags({
      blockStorageEncryption: false,
    }).as('getFeatureFlags');

    // Mock account response
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes'],
    });

    mockGetAccount(mockAccount).as('getAccount');

    // intercept request
    cy.visitWithLogin('/volumes/create', {
      localStorageOverrides: pageSizeOverride,
    });
    cy.wait(['@getFeatureFlags', '@getAccount']);

    // Check if section is visible
    cy.findByText('Encrypt Volume').should('not.exist');
  });

  it('should have a "Volume Encryption" section visible if feature flag is on and user has the capability', () => {
    // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
    mockAppendFeatureFlags({
      blockStorageEncryption: true,
    }).as('getFeatureFlags');

    // Mock account response
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Block Storage Encryption'],
    });

    mockGetAccount(mockAccount).as('getAccount');

    // intercept request
    cy.visitWithLogin('/volumes/create', {
      localStorageOverrides: pageSizeOverride,
    });
    cy.wait(['@getFeatureFlags', '@getAccount']);

    // Check if section is visible
    cy.findByText('Encrypt Volume').should('exist');
  });
});
