import {
  makeVolumeLabel,
  deleteAllTestVolumes,
  clickVolumeActionMenu,
  createVolume
} from '../../support/api/volumes';
import { assertToast } from '../../support/ui/events';
import { createLinode } from '../../support/api/linodes';

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
  cy.findByText('Detach')
    .should('be.visible')
    .click();
};

const createBasicVolume = (withLinode: boolean, linodeLabel?: string) => {
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
    cy.findByText('Regions')
      .click()
      .type('new {enter}');
  }
  cy.findByText('Type to choose or create a tag.')
    .click()
    .type(`${tag} {enter}`);
  clickCreate();
  cy.wait('@volumeCreated')
    .its('status')
    .should('eq', 200);
  return volLabel;
};

const validateBasicVolume = (volLabel: string) => {
  cy.findByText('Volume Configuration').should('be.visible');
  cy.findByDisplayValue(`mkdir "/mnt/${volLabel}"`);
  cy.contains('Close')
    .should('be.visible')
    .click();
  assertToast(`Volume ${volLabel} successfully created.`);
  cy.findByText(volLabel).should('be.visible');
  cy.findByText(region).should('be.visible');
  cy.findByText('Unattached').should('be.visible');
};

describe('volumes', () => {
  it('creates a volume without linode', () => {
    const title = createBasicVolume(false);
    validateBasicVolume(title);
    clickVolumeActionMenu(title);
    cy.findByText('Delete').should('be.visible');
    deleteAllTestVolumes();
  });

  it('Detaches attached volume', () => {
    cy.visitWithLogin('/volumes');
    createLinode().then(linode => {
      const linodeId = linode.id;
      const linodeLabel = linode.label;
      createVolume(linodeId).then(volume => {
        cy.server();
        cy.route({
          method: 'POST',
          url: '*/volumes/' + volume.id + '/detach'
        }).as('volumeDetached');
        const volumeLabel = volume.label;
        cy.findByText(linodeLabel).should('be.visible');
        cy.findByText(volumeLabel).should('be.visible');
        clickVolumeActionMenu(volume.label);
        clickDetach();
        cy.findByText(
          `Are you sure you want to detach this Volume from ${linodeLabel}?`
        );
        clickDetach();
        cy.wait('@volumeDetached')
          .its('status')
          .should('eq', 200);
        assertToast('Volume detachment started', 2);
        deleteAllTestVolumes();
      });
    });
  });
});
