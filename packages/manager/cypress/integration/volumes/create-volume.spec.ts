import { createLinode } from '../../support/api/linodes';
import { makeTestLabel } from '../../support/api/common';
import { randomNumber, randomItem } from '../../support/util/random';
import { regionsTypeahead } from '../../support/constants/regions';
import { waitForEvent } from '../../support/api/events';
import {
  containsClick,
  fbtVisible,
  fbtClick,
  getClick,
} from '../../support/helpers';

describe('volumes', () => {
  it('creates an unattached volume', () => {
    const volume = {
      label: makeTestLabel(),
      size: `${randomNumber(10, 250)}`,
      region: randomItem(regionsTypeahead),
    };

    cy.intercept('POST', '*/volumes').as('createVolume');

    cy.visitWithLogin('/volumes/create');

    containsClick('Label').type(volume.label);
    containsClick('Size').type(`{selectall}{backspace}${volume.size}`);
    containsClick('Select a Region').type(`${volume.region} {enter}`);

    fbtClick('Create Volume');
    cy.wait('@createVolume');

    // Validate volume configuration drawer opens, then close it.
    fbtVisible('Volume scheduled for creation.');
    getClick('[data-qa-close-drawer="true"]');

    // Validate that volume is listed on landing page with expected configuration.
    cy.findByText(volume.label)
      .closest('tr')
      .within(() => {
        cy.findByText(volume.label).should('be.visible');
        cy.findByText(`${volume.size} GB`).should('be.visible');
        cy.findByText(volume.region, { exact: false }).should('be.visible');
        cy.findByText('Unattached');
      });
  });

  // it('creates an attached volume', () => {
  //   const volume = {
  //     label: makeTestLabel(),
  //     size: `${randomNumber(10, 250)}`,
  //     region: randomItem(regionsTypeahead),
  //   };

  //   // Create a Linode for volume.
  //   createLinode().then((linode) => {
  //     //cy.intercept('POST', '*/volumes').as('createVolume');

  //     containsClick('Label').type(volume.label);
  //     containsClick('Size').type(`{selectall}{backspace}${volume.size}`);
  //     containsClick('Select a Region').type(`${volume.region}{enter}`);
  //     containsClick('Select a Linode').type(`${linode.label}{enter}`);
  //   });
  // });

  // it('creates a volume from an existing Linode', () => {

  // });
});
