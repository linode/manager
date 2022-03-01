import { createLinode } from '../../support/api/linodes';
import { makeTagLabel } from '../../support/api/tags';
import { makeTestLabel } from '../../support/api/common';

import { randomNumber, randomItem } from '../../support/util/random';
import { regions, regionsMap } from '../../support/constants/regions';
import {
  containsClick,
  fbtVisible,
  fbtClick,
  getClick,
} from '../../support/helpers';

describe('volumes', () => {
  /*
   * - Creates a volume that is not attached to a Linode.
   * - Assigns 3 tags to the volume.
   * - Confirms that volume is listed correctly on volumes landing page.
   * - Confirms that tags exist on volume.
   */
  it('creates an unattached volume', () => {
    const regionId = randomItem(regions);
    const tags = [makeTagLabel(), makeTagLabel(), makeTagLabel()];
    const volume = {
      label: makeTestLabel(),
      size: `${randomNumber(10, 250)}`,
      region: regionId,
      regionLabel: regionsMap[regionId],
    };

    cy.intercept('POST', '*/volumes').as('createVolume');
    cy.visitWithLogin('/volumes/create');

    // Fill out and submit volume create form.
    containsClick('Label').type(volume.label);
    containsClick('Size').type(`{selectall}{backspace}${volume.size}`);
    containsClick('Select a Region').type(`${volume.region}{enter}`);
    containsClick('Type to choose or create a tag.').type(
      tags.map((tag) => `${tag}{enter}`).join('')
    );

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
        fbtClick('Edit');
      });

    // Confirm that volume tags are set.
    cy.get('[data-qa-drawer="true"]').within(() => {
      fbtVisible('Edit Volume');
      cy.get(`input[value="${volume.label}"]`).should('be.visible');
      tags.forEach((tag) => {
        fbtVisible(tag);
      });
    });
  });

  /*
   * - Creates a volume that is attached to an existing Linode.
   * - Confirms that volume is listed correctly on Volumes landing page.
   * - Confirms that volume is listed correctly on Linode 'Storage' details page.
   */
  it('creates an attached volume', () => {
    const regionId = randomItem(regions);
    const volume = {
      label: makeTestLabel(),
      size: `${randomNumber(10, 250)}`,
      region: regionId,
      regionLabel: regionsMap[regionId],
    };

    // Create a Linode for volume.
    createLinode({ region: volume.region }).then((linode) => {
      cy.intercept('POST', '*/volumes').as('createVolume');
      cy.visitWithLogin('/volumes/create');

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
    createLinode().then((linode) => {
      const volume = {
        label: makeTestLabel(),
        size: `${randomNumber(10, 250)}`,
      };

      cy.visitWithLogin(`/linodes/${linode.id}/storage`);

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
      cy.visitWithLogin('/volumes');
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
