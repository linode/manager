/* eslint-disable sonarjs/no-duplicate-string */
import { linodeFactory } from '@linode/utilities';
import { volumeFactory, volumeTypeFactory } from '@src/factories';
import {
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
  mockGetLinodes,
} from 'support/intercepts/linodes';
import {
  mockCreateVolume,
  mockDetachVolume,
  mockGetVolume,
  mockGetVolumeTypes,
  mockGetVolumeTypesError,
  mockGetVolumes,
} from 'support/intercepts/volumes';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  PRICES_RELOAD_ERROR_NOTICE_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';

/**
 * Asserts that a volume is listed and has the expected config information.
 *
 * The "Volume Configuration" drawer should be open before this function is
 * called.
 *
 * @param volumeLabel - Label of Volume to validate.
 * @param attachedLinodeLabel - Label of attached Linode if applicable.
 */
const validateBasicVolume = (
  volumeLabel: string,
  regionLabel: string,
  attachedLinodeLabel?: string
) => {
  const attached = attachedLinodeLabel ?? 'Unattached';
  ui.drawer
    .findByTitle('Volume Configuration')
    .should('be.visible')
    .within(() => {
      cy.findByDisplayValue(`mkdir "/mnt/${volumeLabel}"`).should('be.visible');

      ui.drawerCloseButton.find().should('be.visible').click();
    });

  cy.findByText(volumeLabel)
    .closest('tr')
    .within(() => {
      cy.findByText(regionLabel).should('be.visible');
      cy.findByText(attached).should('be.visible');
    });
};

// Force Volume table to be organized and sorted in a specific way to reduce flake.
// This is a workaround for accounts that have volumes unrelated to tests.
// @TODO Remove preference override when volumes are removed from test accounts.
const preferenceOverrides = {
  desktop_sidebar_open: false,
  linodes_group_by_tag: false,
  linodes_view_style: 'list',
  sortKeys: {
    'linodes-landing': { order: 'asc', orderBy: 'label' },
    volume: { order: 'desc', orderBy: 'label' },
  },
  volumes_group_by_tag: false,
};

// Local storage override to force volume table to list up to 100 items.
// This is a workaround for accounts that have volumes unrelated to tests.
// @TODO Remove local storage override when volumes are removed from test accounts.
const localStorageOverrides = {
  PAGE_SIZE: 100,
};

describe('volumes', () => {
  it('creates a volume without linode from volumes page', () => {
    const mockRegion = chooseRegion({ capabilities: ['Block Storage'] });
    const mockVolume = volumeFactory.build({
      label: randomLabel(),
      region: mockRegion.id,
    });
    const mockVolumeTypes = volumeTypeFactory.buildList(1);

    mockGetVolumes([]).as('getVolumes');
    mockCreateVolume(mockVolume).as('createVolume');
    mockGetVolume(mockVolume).as('getVolume');
    mockGetVolumeTypes(mockVolumeTypes).as('getVolumeTypes');

    cy.visitWithLogin('/volumes', {
      localStorageOverrides,
      preferenceOverrides,
    });

    ui.button.findByTitle('Create Volume').should('be.visible').click();

    cy.url().should('endWith', 'volumes/create');

    cy.wait('@getVolumeTypes');

    ui.button.findByTitle('Create Volume').should('be.visible').click();

    cy.findByText('Label is required.').should('be.visible');
    cy.findByLabelText('Label', { exact: false }).should('be.visible').click();
    cy.focused().type(mockVolume.label);

    ui.button.findByTitle('Create Volume').should('be.visible').click();

    cy.findByText('Must provide a region or a Linode ID.').should('be.visible');

    ui.regionSelect.find().click().type(`${mockRegion.label}`);
    ui.regionSelect
      .findItemByRegionId(mockRegion.id)
      .should('be.visible')
      .click();

    mockGetVolumes([mockVolume]).as('getVolumes');
    ui.button.findByTitle('Create Volume').should('be.visible').click();
    cy.wait(['@createVolume', '@getVolume', '@getVolumes']);
    validateBasicVolume(mockVolume.label, mockRegion.label);

    ui.actionMenu
      .findByTitle(`Action menu for Volume ${mockVolume.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Delete').should('be.visible');
  });

  it('creates volume from linode details', () => {
    const mockRegion = chooseRegion({ capabilities: ['Block Storage'] });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockRegion.id,
    });
    const newVolume = volumeFactory.build({
      label: randomLabel(),
      linode_id: mockLinode.id,
      region: mockRegion.id,
    });

    mockCreateVolume(newVolume).as('createVolume');
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinodeDetail');
    mockGetLinodeDisks(mockLinode.id, []);
    mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');

    cy.visitWithLogin('/linodes', {
      localStorageOverrides,
      preferenceOverrides,
    });

    // Visit a Linode's details page.
    cy.wait('@getLinodes');
    cy.findByText(mockLinode.label).should('be.visible').click();
    cy.wait('@getVolumes');
    cy.wait('@getLinodeDetail');

    // Create a new volume.
    cy.get('main').within(() => {
      cy.findByText('Storage').should('be.visible').click();
    });

    ui.button.findByTitle('Add Volume').should('be.visible').click();

    mockGetLinodeVolumes(mockLinode.id, [newVolume]).as('getVolumes');
    ui.drawer
      .findByTitle(`Create Volume for ${mockLinode.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText('Create and Attach Volume').should('be.visible').click();
        cy.get('[data-qa-volume-label]').click();
        cy.focused().type(newVolume.label);
        ui.button.findByTitle('Create Volume').should('be.visible').click();
      });

    cy.wait(['@createVolume', '@getVolumes']);
    ui.drawer
      .findByTitle('Volume Configuration')
      .should('be.visible')
      .within(() => {
        cy.findByDisplayValue(`mkdir "/mnt/${newVolume.label}"`).should(
          'be.visible'
        );
        ui.drawerCloseButton.find().click();
      });

    // Confirm that new volume is shown.
    cy.findByText('1 Volume').should('be.visible');
  });

  it('detaches attached volume', () => {
    const mockRegion = chooseRegion({ capabilities: ['Block Storage'] });
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: mockRegion.id,
    });
    const mockAttachedVolume = volumeFactory.build({
      label: randomLabel(),
      linode_id: mockLinode.id,
      linode_label: mockLinode.label,
      region: mockRegion.id,
    });

    mockDetachVolume(mockAttachedVolume.id).as('detachVolume');
    mockGetVolumes([mockAttachedVolume]).as('getAttachedVolumes');
    mockGetVolume(mockAttachedVolume).as('getVolume');
    cy.visitWithLogin('/volumes', {
      localStorageOverrides,
      preferenceOverrides,
    });
    cy.wait('@getAttachedVolumes');

    cy.findByText(mockAttachedVolume.label).should('be.visible');
    cy.findByText(mockLinode.label).should('be.visible');

    ui.actionMenu
      .findByTitle(`Action menu for Volume ${mockAttachedVolume.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Detach').click();

    cy.wait('@getVolume');

    ui.dialog
      .findByTitle(`Detach Volume ${mockAttachedVolume.label}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Volume Label').should('be.visible').click();
        cy.focused().type(mockAttachedVolume.label);

        ui.button
          .findByTitle('Detach')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@detachVolume').its('response.statusCode').should('eq', 200);
    ui.toast.assertMessage('Volume detachment started');
  });

  it('does not allow creation of a volume with invalid pricing from volumes landing', () => {
    const mockRegion = chooseRegion({ capabilities: ['Block Storage'] });
    const mockVolume = volumeFactory.build({
      label: randomLabel(),
      region: mockRegion.id,
    });

    mockGetVolumes([]).as('getVolumes');
    mockCreateVolume(mockVolume).as('createVolume');
    // Mock an error response to the /types endpoint so prices cannot be calculated.
    mockGetVolumeTypesError().as('getVolumeTypesError');

    cy.visitWithLogin('/volumes', {
      localStorageOverrides,
      preferenceOverrides,
    });

    ui.button.findByTitle('Create Volume').should('be.visible').click();

    cy.url().should('endWith', 'volumes/create');

    ui.regionSelect.find().click().type(mockRegion.label);
    ui.regionSelect
      .findItemByRegionId(mockRegion.id)
      .should('be.visible')
      .click();

    cy.wait(['@getVolumeTypesError']);

    // Confirm that unknown pricing placeholder text displays, create button is disabled, and error tooltip displays.
    cy.findByText(`$${UNKNOWN_PRICE}/month`).should('be.visible');
    ui.button
      .findByTitle('Create Volume')
      .should('be.visible')
      .should('be.disabled')
      .trigger('mouseover');
    ui.tooltip.findByText(PRICES_RELOAD_ERROR_NOTICE_TEXT).should('be.visible');
  });

  it('does not allow creation of a volume with invalid pricing from linode details', () => {
    const mockRegion = chooseRegion({ capabilities: ['Block Storage'] });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockRegion.id,
    });
    const newVolume = volumeFactory.build({
      label: randomLabel(),
      region: mockRegion.id,
    });

    mockCreateVolume(newVolume).as('createVolume');
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinodeDetail');
    mockGetLinodeDisks(mockLinode.id, []);
    mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');
    // Mock an error response to the /types endpoint so prices cannot be calculated.
    mockGetVolumeTypesError().as('getVolumeTypesError');

    cy.visitWithLogin('/linodes', {
      localStorageOverrides,
      preferenceOverrides,
    });

    // Visit a Linode's details page.
    cy.wait('@getLinodes');
    cy.findByText(mockLinode.label).should('be.visible').click();
    cy.wait(['@getVolumes', '@getLinodeDetail']);

    // Open the Add Volume drawer.
    cy.get('main').within(() => {
      cy.findByText('Storage').should('be.visible').click();
    });
    ui.button.findByTitle('Add Volume').should('be.visible').click();
    cy.wait(['@getVolumeTypesError']);

    mockGetLinodeVolumes(mockLinode.id, [newVolume]).as('getVolumes');
    ui.drawer
      .findByTitle(`Create Volume for ${mockLinode.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText('Create and Attach Volume').should('be.visible').click();

        // Confirm that unknown pricing placeholder text displays, create button is disabled, and error tooltip displays.
        cy.contains(`$${UNKNOWN_PRICE}/mo`).should('be.visible');
        ui.button
          .findByTitle('Create Volume')
          .should('be.visible')
          .should('be.disabled')
          .trigger('mouseover');
        ui.tooltip
          .findByText(PRICES_RELOAD_ERROR_NOTICE_TEXT)
          .should('be.visible');
      });
  });
});
