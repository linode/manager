import { containsClick, fbtClick, fbtVisible, getClick } from 'support/helpers';
import { apiMatcher } from 'support/util/intercepts';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { mockGetAllImages } from 'support/intercepts/images';
import { imageFactory, linodeFactory } from '@src/factories';
import { chooseRegion } from 'support/util/regions';
import { cleanUp } from 'support/util/cleanup';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';

const region = chooseRegion();

const mockLinode = linodeFactory.build({
  region: region.id,
  id: 123456,
});

const mockImage = imageFactory.build({
  label: randomLabel(),
  is_public: false,
  eol: null,
  id: `private/${randomNumber()}`,
});

const createLinodeWithImageMock = (url: string, preselectedImage: boolean) => {
  mockGetAllImages([mockImage]).as('mockImage');

  cy.intercept('POST', apiMatcher('linode/instances'), (req) => {
    req.reply({
      body: mockLinode,
      headers: { image: mockImage.id },
    });
  }).as('mockLinodeRequest');

  cy.visitWithLogin(url);

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

  ui.regionSelect.open();
  ui.regionSelect.findItemByRegionId(region.id).click();

  fbtClick('Shared CPU');
  getClick('[id="g6-nanode-1"][type="radio"]');
  cy.get('[id="root-password"]').type(randomString(32));
  getClick('[data-qa-deploy-linode="true"]');

  cy.wait('@mockLinodeRequest');

  console.log('mockLinode', mockLinode);

  fbtVisible(mockLinode.label);
  fbtVisible(region.label);
  fbtVisible(mockLinode.id);
};

authenticate();
describe('create linode from image, mocked data', () => {
  before(() => {
    cleanUp(['linodes']);
  });

  /*
   * - Confirms UI flow when user attempts to create a Linode from images without having any images.
   */
  it('cannot create a Linode when the user has no private images', () => {
    // Substrings of the message shown to ensure user is informed of why they
    // cannot create a Linode and guided towards creating an Image.
    const noImagesMessages = [
      'You don’t have any private Images.',
      'create an Image from one of your Linode’s disks.',
    ];

    mockGetAllImages([]).as('getImages');
    cy.visitWithLogin('/linodes/create?type=Images');
    cy.wait('@getImages');
    noImagesMessages.forEach((message: string) => {
      cy.findByText(message, { exact: false }).should('be.visible');
    });
  });

  it('creates linode from image on images tab', () => {
    createLinodeWithImageMock('/linodes/create?type=Images', false);
  });

  it('creates linode from preselected image on images tab', () => {
    createLinodeWithImageMock(
      `/linodes/create/?type=Images&imageID=${mockImage.id}`,
      true
    );
  });
});
