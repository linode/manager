import type { Image, Linode, Disk } from '@linode/api-v4/types';
import { imageFactory } from 'src/factories/images';
import { createLinode, deleteLinodeById } from 'support/api/linodes';
import { interceptCreateImage, mockGetImages } from 'support/intercepts/images';
import { mockGetLinodeDisks } from 'support/intercepts/linodes';
import { randomLabel, randomNumber, randomPhrase } from 'support/util/random';

const diskLabel = 'Debian 10 Disk';

const mockDisks: Disk[] = [
  {
    id: 44311273,
    status: 'ready',
    label: diskLabel,
    created: '2020-08-21T17:26:14',
    updated: '2020-08-21T17:26:30',
    filesystem: 'ext4',
    size: 81408,
  },
  {
    id: 44311274,
    status: 'ready',
    label: '512 MB Swap Image',
    created: '2020-08-21T17:26:14',
    updated: '2020-08-21T17:26:31',
    filesystem: 'swap',
    size: 512,
  },
];

describe('create image', () => {
  it('captures image from Linode and mocks create image', () => {
    const imageLabel = randomLabel();
    const imageDescription = randomPhrase();
    const diskLabel = 'Debian 10 Disk';
    const mockNewImage = imageFactory.build({
      id: `private/${randomNumber(1000, 99999)}`,
      label: imageLabel,
      description: imageDescription,
      type: 'manual',
      is_public: false,
      vendor: null,
      expiry: null,
      eol: null,
      status: 'creating',
    });

    // stub incoming response
    const mockImages = imageFactory.buildList(2);
    mockGetImages(mockImages).as('getImages');
    interceptCreateImage(mockNewImage).as('createImage');
    createLinode().then((linode: Linode) => {
      // stub incoming disks response
      mockGetLinodeDisks(linode.id, mockDisks).as('getDisks');
      cy.visitWithLogin('/images');
      cy.get('[data-qa-header]')
        .should('be.visible')
        .within(() => {
          cy.findByText('Images').should('be.visible');
        });

      cy.get('[data-qa-header]')
        .should('be.visible')
        .within(() => {
          cy.findByText('Images').should('be.visible');
        });

      cy.wait('@getImages');
      cy.findByText('Create Image').click();
      cy.findByText('Select a Linode').click().type(`${linode.label}{enter}`);
      cy.wait('@getDisks');
      cy.contains('Select a Disk').click().type(`${diskLabel}{enter}`);
      cy.findAllByLabelText('Label', { exact: false }).type(
        `${imageLabel}{enter}`
      );
      cy.findAllByLabelText('Description').type(imageDescription);
      cy.get('[data-qa-submit]').click();
      cy.wait('@createImage');
      cy.url().should('endWith', 'images');
      deleteLinodeById(linode.id);
    });
  });
});
