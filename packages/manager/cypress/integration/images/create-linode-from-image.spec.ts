import { createMockImage } from 'cypress/support/api/images';
import { createMockLinodeList } from 'cypress/support/api/linodes';
import {
  containsClick,
  fbtClick,
  fbtVisible,
  getClick,
} from 'cypress/support/helpers';
import { randomString } from 'support/util/random';

const mockImage = createMockImage().data[0];
const imageLabel = mockImage.label;
const linodeId = 99999999;
const rootpass = randomString(32);
const region = 'us-west';
const regionSelect = 'Fremont, CA';
const imageId = mockImage.id;
const type = 'g6-nanode-1';
const mockLinodeList = createMockLinodeList({
  id: linodeId,
  label: `${imageLabel}-${region}`,
  region,
  type,
});

const mockLinode = mockLinodeList.data[0];

const createLinodeWithImageMock = (preselectedImage: boolean) => {
  cy.intercept('*/images*', (req) => {
    req.reply(createMockImage());
  }).as('mockImage');

  cy.intercept('POST', '*/linode/instances', (req) => {
    req.reply({
      body: mockLinode,
      headers: { image: imageId },
    });
  }).as('mockLinodeRequest');
  cy.intercept('GET', `*/linode/instances/${linodeId}`, (req) => {
    req.reply(mockLinode);
  }).as('mockLinodeResponse');

  cy.wait('@mockImage');
  if (!preselectedImage) {
    cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
      containsClick('Choose an image');
    });
    cy.get(`[data-qa-image-select-item="${imageId}"]`).within(() => {
      cy.get('span').should('have.class', 'fl-tux');
      fbtClick(imageLabel);
    });
  }
  getClick('[data-qa-enhanced-select="Select a Region"]').within(() => {
    containsClick('Select a Region');
  });
  containsClick(regionSelect);
  fbtClick('Shared CPU');
  getClick('[id="g6-nanode-1"][type="radio"]');
  cy.get('[id="root-password"]').type(rootpass);
  getClick('[data-qa-deploy-linode="true"]');

  cy.wait('@mockLinodeRequest');
  cy.wait('@mockLinodeResponse');

  fbtVisible(mockLinode.label);
  fbtVisible(regionSelect);
  fbtVisible(linodeId);
};

describe('create linode from image, mocked data', () => {
  it('creates linode from image on images tab', () => {
    cy.visitWithLogin('/linodes/create?type=Images');
    createLinodeWithImageMock(false);
  });

  it('creates linode from preselected image on images tab', () => {
    cy.visitWithLogin(`/linodes/create/?type=Images&imageID=${imageId}`);
    createLinodeWithImageMock(true);
  });
});
