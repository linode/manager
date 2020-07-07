import {
  makeVolumeLabel,
  deleteAllTestVolumes,
  createVolume,
  clickVolumeActionMenu
} from '../../support/api/volumes';
import { createLinode, deleteLinodeById } from '../../support/api/linodes';
import { assertToast } from '../../support/ui/events';
import { loadAppNoLogin } from '../../support/ui/constants';

const urlExtention = '/volumes/create';
const tag = 'cy-test';

const createBasicVolume = (withLindode: boolean, linodeLabel?: string) => {
  const title = makeVolumeLabel();
  cy.visitWithLogin(urlExtention);
  cy.url().should('endWith', urlExtention);
  cy.findByText('volumes');
  cy.findByLabelText('Label (required)').type(title);
  cy.findByText('Regions')
    .click()
    .type('new {enter}');
  if (linodeLabel != undefined) {
    cy.findByText('Select a Linode')
      .click()
      .type(`${linodeLabel} {enter}`);
    cy.findByText('My Debian 10 Disk Profile');
  }
  cy.findByText('Type to choose or create a tag.')
    .click()
    .type(`${tag} {enter}`);
  cy.get('[data-qa-deploy-linode]').click();
  return title;
};

const validateBasicVolume = (title: string) => {
  assert.exists('Volume Configuration');
  cy.findByDisplayValue(`mkdir "/mnt/${title}"`);
  cy.contains('Close')
    .should('be.visible')
    .click();
  assertToast(`Volume ${title} successfully created.`);
  cy.findByText(title);
};

describe('volumes', () => {
  it('creates a volume without linode', () => {
    const title = createBasicVolume(false);
    validateBasicVolume(title);
    clickVolumeActionMenu(title);
    cy.findByText('Delete').should('be.visible');
    deleteAllTestVolumes();
  });

  it('creates volume with linode then detaches', () => {
    cy.visitWithLogin('/volumes');
    createLinode().then(linode => {
      const linodeId = linode.id;
      const linodeLabel = linode.label;
      createVolume(linodeId).then(volume => {
        assertToast('Volume ' + volume.label + ' successfully created.');
        assert.exists(linodeId);
        cy.findByText(volume.label);
        clickVolumeActionMenu(volume.label);
        assert.exists('Detach');

        cy.server();
        cy.route({
          method: 'POST',
          url: '*/volumes/' + volume.id + '/detach'
        }).as('volumeDetached');
        cy.route({
          method: 'POST',
          url: '**/events/**'
        }).as('event');

        cy.findByText('Detach').click();
        assert.exists(
          `Are you sure you want to detach this Volume from ${linodeLabel}?`
        );

        cy.findByText('Detach').click();
        cy.wait('@volumeDetached')
          .its('status')
          .should('eq', 200);
        assertToast('Volume detachment started', 1);
        cy.wait('@event');
        assertToast('Volume ' + volume.label + ' successfully detached.', 2);
        clickVolumeActionMenu(volume.label);
        assert.exists('Delete');
        deleteLinodeById(linode.id);
        deleteAllTestVolumes();
      });
    });
  });

  it('volume not created without region or label', () => {
    const title = makeVolumeLabel();
    cy.visitWithLogin(urlExtention);
    cy.url().should('endWith', urlExtention);
    assert.exists('volumes');
    cy.get('[data-qa-deploy-linode]').click();
    assert.exists('Label is required.');
    cy.findByLabelText('Label (required)').type(title);
    cy.get('[data-qa-deploy-linode]').click();
    assert.exists('Must provide a region or a Linode ID.');
    cy.findByText('Regions')
      .click()
      .type('new {enter}');
    cy.get('[data-qa-deploy-linode]').click();
    validateBasicVolume(title);
    deleteAllTestVolumes();
  });

  it('volume not created without either region or linode attached', () => {
    cy.visitWithLogin(urlExtention);
    const title = makeVolumeLabel();
    createLinode().then(linode => {
      const linodeLabel = linode.label;
      cy.url().should('endWith', urlExtention);
      assert.exists('volumes');
      cy.get('[data-qa-volume-label] [data-testid="textfield-input"]').type(
        title
      );
      cy.get('[data-qa-deploy-linode]').click();
      assert.exists('Must provide a region or a Linode ID.');
      loadAppNoLogin(urlExtention);
      cy.get('[data-qa-volume-label] [data-testid="textfield-input"]').type(
        title
      );
      cy.findByText('Select a Linode')
        .click()
        .type(`${linodeLabel}{enter}`);
      cy.findByText('My Debian 10 Disk Profile');
      cy.get('[data-qa-deploy-linode]').click();
      validateBasicVolume(title);
      deleteLinodeById(linode.id);
      deleteAllTestVolumes();
    });
  });
});
