import { createLinode, Linode } from '@linode/api-v4/lib/linodes';
import { createLinodeRequestFactory } from 'src/factories/linodes';
import { authenticate } from 'support/api/authentication';
import { regions, regionsMap } from 'support/constants/regions';
import { containsClick, fbtVisible, fbtClick, getClick } from 'support/helpers';
import {
  randomNumber,
  randomItem,
  randomString,
  randomLabel,
} from 'support/util/random';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

authenticate();
describe('volume create flow', () => {
  /*
   * - Creates a volume that is not attached to a Linode.
   * - Confirms that volume is listed correctly on volumes landing page.
   * - Confirms that tags exist on volume.
   */
  it('creates an unattached volume', () => {
    const regionId = randomItem(regions);
    const volume = {
      label: randomLabel(),
      size: `${randomNumber(10, 250)}`,
      region: regionId,
      regionLabel: regionsMap[regionId],
    };

    cy.intercept('POST', '*/volumes').as('createVolume');
    cy.visitWithLogin('/volumes/create', {
      localStorageOverrides: pageSizeOverride,
    });

    // Fill out and submit volume create form.
    containsClick('Label').type(volume.label);
    containsClick('Size').type(`{selectall}{backspace}${volume.size}`);
    containsClick('Select a Region').type(`${volume.region}{enter}`);

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
    const regionId = randomItem(regions);

    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: regionId,
      root_pass: randomString(16),
    });

    const volume = {
      label: randomLabel(),
      size: `${randomNumber(10, 250)}`,
      region: regionId,
      regionLabel: regionsMap[regionId],
    };

    cy.defer(createLinode(linodeRequest)).then((linode) => {
      cy.intercept('POST', '*/volumes').as('createVolume');
      cy.visitWithLogin('/volumes/create', {
        localStorageOverrides: pageSizeOverride,
      });

      // Fill out and submit volume create form.
      containsClick('Label').type(volume.label);
      containsClick('Size').type(`{selectall}{backspace}${volume.size}`);
      containsClick('Select a Region').type(`${volume.regionLabel}{enter}`);
      containsClick('Select a Linode').type(`${linode.label}{enter}`);

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
    });
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
    });

    cy.defer(createLinode(linodeRequest)).then((linode: Linode) => {
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
        fbtVisible('Volume scheduled for creation.');
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
    });
  });
});
