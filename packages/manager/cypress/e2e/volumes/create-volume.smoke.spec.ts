/* eslint-disable sonarjs/no-duplicate-string */
import { volumeFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { interceptOnce } from 'support/ui/common';
import { createMockLinodeList } from 'support/api/linodes';
import {
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from 'support/helpers';
import { randomLabel } from 'support/util/random';
import { selectRegionString } from 'support/ui/constants';
import { apiMatcher } from 'support/util/intercepts';
import { ui } from 'support/ui';

const region = 'Newark, NJ';

const validateBasicVolume = (
  volLabel: string,
  volId: number,
  isAttached: boolean = false
) => {
  const attached = isAttached ? linodeLabel : 'Unattached';
  containsVisible('Volume Configuration');
  cy.findByDisplayValue(`mkdir "/mnt/${volLabel}"`);
  getClick('[data-qa-close-drawer="true"]');

  cy.findByText(volLabel)
    .closest('tr')
    .within(() => {
      cy.findByText(region).should('be.visible');
      cy.findByText(attached).should('be.visible');
    });
};

const linodeList = createMockLinodeList({ region: 'us-southeast' }, 3);
const linode = linodeList.data[1];
const linodeLabel = linode.label;
const linodeId = linode.id;

const emptyVolumeList = makeResourcePage([]);

const volumeList = makeResourcePage([
  volumeFactory.build({
    label: randomLabel(),
  }),
  volumeFactory.build({
    label: randomLabel(),
  }),
]);

const volume = volumeList.data[1];
const volumeLabel = volume.label;
const volumeId = volume.id;
const attachedVolumeList = makeResourcePage(
  volumeFactory.buildList(1, {
    label: volumeLabel,
    linode_id: linodeId,
    linode_label: linodeLabel,
  })
);
const attachedVolume = attachedVolumeList.data[0];
const attachedVolumeLabel = attachedVolume.label;
const attachedVolumeId = attachedVolume.id;

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
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const localStorageOverrides = {
  PAGE_SIZE: 100,
};

describe('volumes', () => {
  it('creates a volume without linode from volumes page', () => {
    cy.intercept('POST', apiMatcher('volumes'), (req) => {
      req.reply(volume);
    }).as('createVolume');
    cy.visitWithLogin('/volumes', {
      preferenceOverrides,
      localStorageOverrides,
    });
    fbtClick('Create Volume');
    cy.findByText('volumes');
    fbtClick('Create Volume');
    fbtVisible('Label is required.');
    getClick('[id="label"][data-testid="textfield-input"]').type(volumeLabel);
    fbtClick('Create Volume');
    fbtVisible('Must provide a region or a Linode ID.');
    fbtClick(selectRegionString).type('new {enter}');
    cy.intercept('GET', apiMatcher('volumes*'), (req) => {
      req.reply(makeResourcePage([volume]));
    }).as('createVolume');
    fbtClick('Create Volume');
    cy.wait('@createVolume');
    validateBasicVolume(volumeLabel, volumeId);

    ui.actionMenu
      .findByTitle(`Action menu for Volume ${volumeLabel}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Delete').should('be.visible');
  });

  it('creates volume from linode details', () => {
    const newVolumeLabel = randomLabel();
    const newVolume = volumeFactory.build({
      label: newVolumeLabel,
    });
    const newVolumeList = makeResourcePage([newVolume]);

    cy.intercept('POST', apiMatcher('volumes'), (req) => {
      req.reply(newVolume);
    }).as('createVolume');
    cy.intercept('GET', apiMatcher('linode/instances/*'), (req) => {
      req.reply(linodeList);
    }).as('getLinodes');
    cy.intercept('GET', apiMatcher(`linode/instances/${linodeId}*`), (req) => {
      req.reply(linode);
    }).as('getLinodeDetail');
    cy.intercept(
      'GET',
      apiMatcher(`linode/instances/${linodeId}/volumes*`),
      emptyVolumeList
    ).as('getEmptyVolumes');

    cy.visitWithLogin('/linodes', {
      preferenceOverrides,
      localStorageOverrides,
    });

    // Visit a Linode's details page.
    cy.wait('@getLinodes');
    fbtClick(linodeLabel);
    cy.wait('@getEmptyVolumes');
    cy.wait('@getLinodeDetail');

    // Create a new volume.
    fbtClick('Storage');
    fbtClick('Create Volume');
    getClick('[value="creating_for_linode"]');
    cy.intercept(
      'GET',
      apiMatcher(`linode/instances/${linodeId}/volumes*`),
      newVolumeList
    ).as('getNewVolumes');
    getVisible(`[data-qa-drawer-title="Create Volume for ${linodeLabel}"]`);
    getClick('[data-qa-volume-label="true"]').type(newVolumeLabel);
    getClick('[data-qa-submit="true"]');

    // Confirm that new volume is shown.
    cy.wait(['@createVolume', '@getNewVolumes']);
    containsVisible('Volume Configuration');
    cy.findByDisplayValue(`mkdir "/mnt/${newVolumeLabel}"`);
    getClick('[data-qa-close-drawer="true"][aria-label="Close drawer"]');
    fbtVisible('1 Volume');
  });

  it('Detaches attached volume', () => {
    interceptOnce('GET', apiMatcher('volumes*'), attachedVolumeList).as(
      'getAttachedVolumes'
    );
    cy.visitWithLogin('/volumes', {
      preferenceOverrides,
      localStorageOverrides,
    });
    cy.wait('@getAttachedVolumes');
    cy.intercept(
      'POST',
      apiMatcher(`volumes/${attachedVolumeId}/detach`),
      (req) => {
        req.reply({ statusCode: 200 });
      }
    ).as('volumeDetached');
    containsVisible(attachedVolume.linode_label);
    containsVisible(attachedVolumeLabel);

    ui.actionMenu
      .findByTitle(`Action menu for Volume ${attachedVolumeLabel}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Detach').click();

    ui.dialog
      .findByTitle(`Detach Volume ${attachedVolumeLabel}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Volume Label')
          .should('be.visible')
          .click()
          .type(attachedVolumeLabel);

        ui.button
          .findByTitle('Detach')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@volumeDetached').its('response.statusCode').should('eq', 200);
    ui.toast.assertMessage('Volume detachment started');
  });
});
