/* eslint-disable sonarjs/no-duplicate-string */
import { volumeFactory, linodeFactory } from '@src/factories';
import {
  mockGetLinodes,
  mockGetLinodeDetails,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import {
  mockCreateVolume,
  mockGetVolumes,
  mockDetachVolume,
} from 'support/intercepts/volumes';
import { randomLabel, randomNumber } from 'support/util/random';
import { ui } from 'support/ui';

const region = 'Newark, NJ';

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
      cy.findByText(region).should('be.visible');
      cy.findByText(attached).should('be.visible');
    });
};

// Force Volume table to be organized and sorted in a specific way to reduce flake.
// This is a workaround for accounts that have volumes unrelated to tests.
// @TODO Remove preference override when volumes are removed from test accounts.
const preferenceOverrides = {
  linodes_view_style: 'list',
  linodes_group_by_tag: false,
  volumes_group_by_tag: false,
  desktop_sidebar_open: false,
  sortKeys: {
    'linodes-landing': { order: 'asc', orderBy: 'label' },
    volume: { order: 'desc', orderBy: 'label' },
  },
};

// Local storage override to force volume table to list up to 100 items.
// This is a workaround for accounts that have volumes unrelated to tests.
// @TODO Remove local storage override when volumes are removed from test accounts.
const localStorageOverrides = {
  PAGE_SIZE: 100,
};

describe('volumes', () => {
  it('creates a volume without linode from volumes page', () => {
    const mockVolume = volumeFactory.build({ label: randomLabel() });

    mockGetVolumes([]).as('getVolumes');
    mockCreateVolume(mockVolume).as('createVolume');

    cy.visitWithLogin('/volumes', {
      preferenceOverrides,
      localStorageOverrides,
    });

    ui.button.findByTitle('Create Volume').should('be.visible').click();

    cy.url().should('endWith', 'volumes/create');

    ui.button.findByTitle('Create Volume').should('be.visible').click();

    cy.findByText('Label is required.').should('be.visible');
    cy.findByLabelText('Label', { exact: false })
      .should('be.visible')
      .click()
      .type(mockVolume.label);

    ui.button.findByTitle('Create Volume').should('be.visible').click();

    cy.findByText('Must provide a region or a Linode ID.').should('be.visible');

    ui.regionSelect.find().click().type('newark{enter}');

    mockGetVolumes([mockVolume]).as('getVolumes');
    ui.button.findByTitle('Create Volume').should('be.visible').click();
    cy.wait(['@createVolume', '@getVolumes']);
    validateBasicVolume(mockVolume.label);

    ui.actionMenu
      .findByTitle(`Action menu for Volume ${mockVolume.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Delete').should('be.visible');
  });

  it('creates volume from linode details', () => {
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      id: randomNumber(),
    });
    const newVolume = volumeFactory.build({
      label: randomLabel(),
    });

    mockCreateVolume(newVolume).as('createVolume');
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinodeDetail');
    mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');

    cy.visitWithLogin('/linodes', {
      preferenceOverrides,
      localStorageOverrides,
    });

    // Visit a Linode's details page.
    cy.wait('@getLinodes');
    cy.findByText(mockLinode.label).should('be.visible').click();
    cy.wait('@getVolumes');
    cy.wait('@getLinodeDetail');

    // Create a new volume.
    cy.findByText('Storage').should('be.visible').click();

    ui.button.findByTitle('Create Volume').should('be.visible').click();

    mockGetLinodeVolumes(mockLinode.id, [newVolume]).as('getVolumes');
    ui.drawer
      .findByTitle(`Create Volume for ${mockLinode.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText('Create and Attach Volume').should('be.visible').click();
        cy.get('[data-qa-volume-label]').click().type(newVolume.label);
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

  it('Detaches attached volume', () => {
    const mockLinode = linodeFactory.build({ label: randomLabel() });
    const mockAttachedVolume = volumeFactory.build({
      label: randomLabel(),
      linode_id: mockLinode.id,
      linode_label: mockLinode.label,
    });

    mockDetachVolume(mockAttachedVolume.id).as('detachVolume');
    mockGetVolumes([mockAttachedVolume]).as('getAttachedVolumes');
    cy.visitWithLogin('/volumes', {
      preferenceOverrides,
      localStorageOverrides,
    });
    cy.wait('@getAttachedVolumes');

    cy.findByText(mockAttachedVolume.label).should('be.visible');
    cy.findByText(mockLinode.label).should('be.visible');

    ui.actionMenu
      .findByTitle(`Action menu for Volume ${mockAttachedVolume.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Detach').click();

    ui.dialog
      .findByTitle(`Detach Volume ${mockAttachedVolume.label}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Volume Label')
          .should('be.visible')
          .click()
          .type(mockAttachedVolume.label);

        ui.button
          .findByTitle('Detach')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@detachVolume').its('response.statusCode').should('eq', 200);
    ui.toast.assertMessage('Volume detachment started');
  });
});
