import type { Linode } from '@linode/api-v4/types';
import { imageFactory } from 'src/factories/images';
import { createLinode, deleteLinodeById } from 'support/api/linodes';
import {
  containsClick,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from 'support/helpers';
import { apiMatcher } from 'support/util/intercepts';
import { randomLabel, randomNumber, randomPhrase } from 'support/util/random';

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
    cy.intercept(apiMatcher('images?page_size=100'), {
      results: 0,
      data: [],
      page: 1,
      pages: 1,
    }).as('getImages');
    cy.intercept('POST', apiMatcher('images'), mockNewImage).as('createImage');
    createLinode().then((linode: Linode) => {
      // stub incoming disks response
      cy.intercept(apiMatcher(`linode/instances/${linode.id}/disks*`), {
        results: 2,
        data: [
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
        ],
        page: 1,
        pages: 1,
      }).as('getDisks');
      cy.visitWithLogin('/images');
      getVisible('[data-qa-header]').within(() => {
        fbtVisible('Images');
      });

      getVisible('[data-qa-header]').within(() => {
        fbtVisible('Images');
      });
      cy.wait('@getImages');
      fbtClick('Create Image');
      fbtClick('Select a Linode').type(`${linode.label}{enter}`);
      cy.wait('@getDisks').then(() => {
        containsClick('Select a Disk').type(`${diskLabel}{enter}`);
      });
      cy.findAllByLabelText('Label', { exact: false }).type(
        `${imageLabel}{enter}`
      );
      cy.findAllByLabelText('Description').type(imageDescription);
      getClick('[data-qa-submit="true"]');
      cy.wait('@createImage');
      cy.url().should('endWith', 'images');
      deleteLinodeById(linode.id);
    });
  });
});
