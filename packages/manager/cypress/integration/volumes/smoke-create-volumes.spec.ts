import {
  makeVolumeLabel,
  deleteAllTestVolumes,
  clickVolumeActionMenu
} from '../../support/api/volumes';
import { assertToast } from '../../support/ui/events';

const urlExtension = '/volumes/create';
const tag = 'cy-test';
const region = 'Newark, NJ';
const clickCreate = () => {
  cy.get('[data-qa-deploy-linode]').click();
};
const getVolumeLabelInput = () => {
  return cy.findAllByLabelText('Label (required)');
};

const createBasicVolume = (withLinode: boolean, linodeLabel?: string) => {
  const volLabel = makeVolumeLabel();
  cy.visitWithLogin(urlExtension);
  cy.url().should('endWith', urlExtension);
  cy.findByText('volumes');
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
});
