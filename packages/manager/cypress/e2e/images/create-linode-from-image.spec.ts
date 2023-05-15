import { containsClick, fbtClick, fbtVisible, getClick } from 'support/helpers';
import { apiMatcher } from 'support/util/intercepts';
import {
  randomLabel,
  randomNumber,
  randomString,
  randomItem,
} from 'support/util/random';
import { mockGetAllImages } from 'support/intercepts/images';
import { imageFactory, linodeFactory } from '@src/factories';
import { regions, regionsMap } from 'support/constants/regions';

const mockLinode = linodeFactory.build({
  region: randomItem(regions),
});

const mockImage = imageFactory.build({
  label: randomLabel(),
  is_public: false,
  eol: null,
  id: `private/${randomNumber()}`,
});

const createLinodeWithImageMock = (preselectedImage: boolean) => {
  mockGetAllImages([mockImage]).as('mockImage');

  cy.intercept('POST', apiMatcher('linode/instances'), (req) => {
    req.reply({
      body: mockLinode,
      headers: { image: mockImage.id },
    });
  }).as('mockLinodeRequest');

  cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${mockLinode.id}`),
    (req) => {
      req.reply(mockLinode);
    }
  ).as('mockLinodeResponse');

  cy.wait('@mockImage');
  if (!preselectedImage) {
    cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
      containsClick('Choose an image');
    });
    cy.get(`[data-qa-image-select-item="${mockImage.id}"]`).within(() => {
      cy.get('span').should('have.class', 'fl-tux');
      fbtClick(mockImage.label);
    });
  }

  getClick('[data-qa-enhanced-select="Select a Region"]').within(() => {
    containsClick('Select a Region');
  });
  containsClick(regionsMap[mockLinode.region]);
  fbtClick('Shared CPU');
  getClick('[id="g6-nanode-1"][type="radio"]');
  cy.get('[id="root-password"]').type(randomString(32));
  getClick('[data-qa-deploy-linode="true"]');

  cy.wait('@mockLinodeRequest');
  cy.wait('@mockLinodeResponse');

  fbtVisible(mockLinode.label);
  fbtVisible(regionsMap[mockLinode.region]);
  fbtVisible(mockLinode.id);
};

describe('create linode from image, mocked data', () => {
  it('creates linode from image on images tab', () => {
    cy.visitWithLogin('/linodes/create?type=Images');
    createLinodeWithImageMock(false);
  });

  it('creates linode from preselected image on images tab', () => {
    cy.visitWithLogin(`/linodes/create/?type=Images&imageID=${mockImage.id}`);
    createLinodeWithImageMock(true);
  });
});
