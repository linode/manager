/* eslint-disable sonarjs/no-duplicate-string */
import { clickVolumeActionMenu } from '../../support/api/volumes';
import { assertToast } from '../../support/ui/events';
import { createMockLinodeList } from '../../support/api/linodes';
import { selectRegionString } from '../../support/ui/constants';
import {
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from '../../support/helpers';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { tagFactory, volumeFactory } from '@src/factories';
import { getRandomNumber, interceptOnce } from 'cypress/support/ui/common';

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
  cy.get('[aria-label="View Details"]').within(() => {
    getVisible(`[data-qa-volume-cell-label="${volLabel}"]`);
    containsVisible(region);
    containsVisible(attached);
  });
};

const tagList = makeResourcePage(tagFactory.buildList(5));
const tag = tagList.data[getRandomNumber(0, 4)];
const tagLabel = tag.label;
const linodeList = createMockLinodeList({ region: 'us-southeast' }, 3);
const linode = linodeList.data[1];
const linodeLabel = linode.label;
const linodeId = linode.id;
const volumeList = makeResourcePage(volumeFactory.buildList(2));
const volume = volumeList.data[1];
const volumeLabel = volume.label;
const volumeId = volume.id;
const attachedVolumeList = makeResourcePage(
  volumeFactory.buildList(1, {
    label: volumeLabel,
    linode_id: linodeId,
  })
);
const attachedVolume = attachedVolumeList.data[0];
const attachedVolumeLabel = attachedVolume.label;
const attachedVolumeId = attachedVolume.id;

describe('volumes', () => {
  beforeEach(() => {
    interceptOnce('GET', '*/profile/preferences*', {
      linodes_view_style: 'list',
      linodes_group_by_tag: false,
      volumes_group_by_tag: false,
      desktop_sidebar_open: false,
      sortKeys: {
        'linodes-landing': { order: 'asc', orderBy: 'label' },
        volume: { order: 'desc', orderBy: 'label' },
      },
    }).as('getProfilePreferences');
  });

  it('creates a volume with tag but without linode from volumes page', () => {
    cy.intercept('POST', `*/volumes`, (req) => {
      req.reply(volume);
    }).as('createVolume');
    cy.intercept('GET', `*/tags`, (req) => {
      req.reply(tagList);
    }).as('getTags');
    cy.visitWithLogin('/volumes');
    cy.wait('@getProfilePreferences');
    fbtClick('Create Volume');
    cy.wait('@getTags');
    cy.findByText('volumes');
    fbtClick('Create Volume');
    fbtVisible('Label is required.');
    getClick('[id="label"][data-testid="textfield-input"]').type(volumeLabel);
    fbtClick('Create Volume');
    fbtVisible('Must provide a region or a Linode ID.');
    fbtClick(selectRegionString).type('new {enter}');
    getClick('[data-qa-multi-select="Type to choose or create a tag."]');
    fbtClick(tagLabel);
    fbtClick('Create Volume');
    cy.wait('@createVolume');
    validateBasicVolume(volumeLabel, volumeId);
    clickVolumeActionMenu(volumeLabel);
    getVisible('[data-qa-action-menu-item="Delete"]');
  });

  it('creates volume with tag from linode with block storage support (Atlanta)', () => {
    interceptOnce('GET', '*/volumes*', volumeList).as('getVolumes');
    cy.intercept('POST', `*/volumes`, (req) => {
      req.reply(attachedVolume);
    }).as('createVolume');
    cy.intercept('GET', '*/linode/instances/*', (req) => {
      req.reply(linodeList);
    }).as('getLinodes');
    cy.intercept('GET', `*/linode/instances/${linodeId}*`, (req) => {
      req.reply(linode);
    }).as('getLinodeDetail');
    cy.intercept('GET', `*/tags`, (req) => {
      req.reply(tagList);
    }).as('getTags');
    cy.visitWithLogin('/linodes');
    cy.wait('@getProfilePreferences');
    cy.wait('@getLinodes');
    fbtClick(linodeLabel);
    cy.wait('@getVolumes');
    cy.wait('@getLinodeDetail');
    getVisible(
      '[href="https://www.linode.com/products/block-storage/"]'
    ).within(() => {
      fbtVisible('NVMe Block Storage');
    });
    fbtClick('Create a Volume');
    getClick('[value="creating_for_linode"]');
    cy.wait('@getTags');
    getVisible(`[data-qa-drawer-title="Create Volume for ${linodeLabel}"]`);
    getClick('[data-qa-volume-label="true"]').type('cy-test-volume');
    getClick('[data-qa-multi-select="Type to choose or create a tag."]');
    fbtClick(tagLabel);
    getClick('[data-qa-submit="true"]');
    cy.wait('@createVolume');
    containsVisible('Volume Configuration');
    cy.findByDisplayValue(`mkdir "/mnt/${volumeLabel}"`);
    getClick('[data-qa-close-drawer="true"][aria-label="Close drawer"]');
    fbtVisible('1 Volume');
  });

  it('Detaches attached volume', () => {
    interceptOnce('GET', `*/volumes*`, attachedVolumeList).as(
      'getAttachedVolumes'
    );
    cy.intercept('GET', '*/linode/instances/*', (req) => {
      req.reply(linodeList);
    }).as('getLinodes');
    cy.visitWithLogin('/volumes');
    cy.wait('@getProfilePreferences');
    cy.wait('@getLinodes');
    cy.wait('@getAttachedVolumes');
    cy.intercept('POST', '*/volumes/' + attachedVolumeId + '/detach', (req) => {
      req.reply({ statusCode: 200 });
    }).as('volumeDetached');
    containsVisible(linodeLabel);
    containsVisible(attachedVolumeLabel);
    clickVolumeActionMenu(attachedVolumeLabel);
    // getVisible('[data-qa-action-menu-item="Detach"]')
    fbtClick('Detach');
    fbtClick('Detach Volume');
    cy.contains(`Detach Volume ${attachedVolumeLabel}?`);
    getClick('[data-qa-confirm="true"]');
    cy.wait('@volumeDetached').its('response.statusCode').should('eq', 200);
    assertToast('Volume detachment started', 2);
  });
});
