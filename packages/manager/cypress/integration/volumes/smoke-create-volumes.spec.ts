/* eslint-disable sonarjs/no-duplicate-string */
import {
  makeVolumeLabel,
  deleteAllTestVolumes,
  clickVolumeActionMenu,
  createVolume,
  deleteVolumeById
} from '../../support/api/volumes';
import { assertToast } from '../../support/ui/events';
import {
  createLinode,
  deleteAllTestLinodes,
  deleteLinodeById
} from '../../support/api/linodes';
import { selectRegionString } from '../../support/ui/constants';
import { containsVisible } from '../../support/helpers';

const urlExtension = '/volumes/create';
const tag = 'cy-test';
const region = 'Newark, NJ';
const clickCreate = () => {
  cy.get('[data-qa-deploy-linode]').click();
};
const getVolumeLabelInput = () => {
  return cy.findAllByLabelText('Label (required)');
};
const clickDetach = () => {
  cy.get('[data-qa-action-menu-item="Detach"]:visible').click();
};

const createBasicVolume = (linodeLabel?: string) => {
  const volLabel = makeVolumeLabel();
  cy.server();
  cy.route({
    method: 'POST',
    url: '*/volumes'
  }).as('volumeCreated');
  cy.visitWithLogin(urlExtension);
  cy.findByText('volumes');
  clickCreate();
  cy.findByText('Label is required.').should('be.visible');
  getVolumeLabelInput().type(volLabel);
  /* validating that volume won't create without region.
       region not necessary if attaching linode */
  clickCreate();
  cy.findByText('Must provide a region or a Linode ID.').should('be.visible');
  if (linodeLabel) {
    cy.findByText('Select a Linode')
      .click()
      .type(`${linodeLabel} {enter}`);
    cy.findByText('My Debian 10 Disk Profile');
  } else {
    cy.findByText(selectRegionString)
      .click()
      .type('new {enter}');
  }
  cy.findByText('Type to choose or create a tag.')
    .click()
    .type(`${tag} {enter}`);
  clickCreate();
  return cy.wait('@volumeCreated').then(xhr => {
    expect(xhr.status).to.equal(200);
    return { label: volLabel, id: xhr.responseBody['id'] };
  });
};

const validateBasicVolume = (volLabel: string, volId: string) => {
  containsVisible('Volume Configuration');
  cy.findByDisplayValue(`mkdir "/mnt/${volLabel}"`);
  cy.contains('Close')
    .should('be.visible')
    .click();
  // assertToast(`Volume ${volLabel} successfully created.`);
  cy.findByText(volLabel).should('be.visible');
  cy.get(`[data-qa-volume-cell="${volId}"]`).within(() => {
    cy.findByText(region).should('be.visible');
  });
  cy.get(`[data-qa-volume-cell="${volId}"]`).within(() => {
    cy.findByText('Unattached').should('be.visible');
  });
};

describe('volumes', () => {
  it('creates a volume without linode', () => {
    createBasicVolume().then(({ label, id }) => {
      validateBasicVolume(label, id);
      clickVolumeActionMenu(label);
      cy.get('[data-qa-action-menu-item="Delete"]').should('be.visible');
      deleteAllTestLinodes();
      deleteAllTestVolumes();
    });
  });

  it('Detaches attached volume', () => {
    cy.visitWithLogin('/volumes');
    createLinode().then(linode => {
      const linodeId = linode.id;
      const linodeLabel = linode.label;
      createVolume(linodeId).then(volume => {
        const volumeId = volume.id;
        cy.server();
        cy.route({
          method: 'POST',
          url: '*/volumes/' + volume.id + '/detach'
        }).as('volumeDetached');
        const volumeLabel = volume.label;
        cy.reload();
        containsVisible(linodeLabel);
        containsVisible(volumeLabel);
        clickVolumeActionMenu(volume.label);
        clickDetach();
        cy.findByText(
          `Are you sure you want to detach this Volume from ${linodeLabel}?`
        );
        cy.get('[data-qa-confirm="true"]').click();
        cy.wait('@volumeDetached')
          .its('status')
          .should('eq', 200);
        assertToast('Volume detachment started', 2);
        deleteLinodeById(linodeId);
        deleteVolumeById(volumeId);
        deleteAllTestLinodes();
        deleteAllTestVolumes();
      });
    });
  });
});
