import { apiMatcher } from 'support/util/intercepts';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { mockGetAllImages } from 'support/intercepts/images';
import { imageFactory, linodeFactory } from '@src/factories';
import { chooseRegion } from 'support/util/regions';
import { ui } from 'support/ui';

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
    cy.findByPlaceholderText('Choose an image')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(mockImage.label)
      .should('be.visible')
      .should('be.enabled')
      .click();
  }

  ui.regionSelect.find().click();
  ui.regionSelect.findItemByRegionId(region.id).click();

  cy.findByText('Shared CPU').click();
  cy.get('[id="g6-nanode-1"][type="radio"]').click();
  cy.get('[id="root-password"]').type(randomString(32));

  ui.button
    .findByTitle('Create Linode')
    .scrollIntoView()
    .should('be.visible')
    .should('be.enabled')
    .click();

  cy.wait('@mockLinodeRequest');

  cy.findByText(mockLinode.label).should('be.visible');
  cy.findByText(region.label).should('be.visible');
  cy.findByText(`${mockLinode.id}`).should('be.visible');
};

describe('create linode from image, mocked data', () => {
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
