import {
  makeVolumeLabel,
  deleteAllTestVolumes
} from '../../support/api/volumes';
import { createLinode, deleteLinodeById } from '../../support/api/linodes';
import { assertToast } from '../../support/ui/events';
import { waitForAppLoad } from '../../support/ui/common';

const urlExtention = '/volumes/create';
const tag = 'cy-test';

const createBasicVolume = (withLindode: boolean, linodeLabel?: string) => {
  const title = makeVolumeLabel();
  cy.visitWithLogin(urlExtention);
  cy.url().should('endWith', urlExtention);
  cy.findByText('volumes');
  cy.get('[data-qa-volume-label] [data-testid="textfield-input"]').type(title);
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

describe('create volumes', () => {
  it.skip('creates a volume without linode', () => {
    const title = createBasicVolume(false, undefined);
    validateBasicVolume(title);
    cy.get('[data-qa-action-menu]').click();
    assert.exists('Delete');
    deleteAllTestVolumes();
  });

  it.skip('creates volume with linode', () => {
    cy.visitWithLogin(urlExtention);
    createLinode().then(linode => {
      const linodeLabel = linode.label;
      const title = createBasicVolume(true, linodeLabel);
      validateBasicVolume(title);
      assert.exists(linodeLabel);
      cy.get('[data-qa-action-menu]').click();
      assert.exists('Detach');
      cy.findByText('Detach').click();
      assert.exists(
        `Are you sure you want to detach this Volume from ${linodeLabel}?`
      );
      assert.exists('Detach');
      cy.findByText('Detach').click();
      cy.get('[data-qa-action-menu]').click();
      assert.exists('Delete');
      deleteAllTestVolumes();
      deleteLinodeById(linode.id);
    });
  });

  it.skip('volume not created without region or label', () => {
    const title = makeVolumeLabel();
    cy.visitWithLogin(urlExtention);
    cy.url().should('endWith', urlExtention);
    assert.exists('volumes');
    cy.get('[data-qa-deploy-linode]').click();
    assert.exists('Label is required.');
    cy.get('[data-qa-volume-label] [data-testid="textfield-input"]').type(
      title
    );
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
      waitForAppLoad();
      cy.findByText('Select a Linode')
        .click()
        .type(`${linodeLabel}{enter}`);
      cy.findByText('My Debian 10 Disk Profile');
      validateBasicVolume(title);
      deleteAllTestVolumes();
      deleteLinodeById(linode.id);
    });
  });
});
