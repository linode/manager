import { makeImageLabel } from '../../support/api/images';
import { createLinode, deleteLinodeById } from '../../support/api/linodes';
import {
  containsClick,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible
} from '../../support/helpers';

describe('create image', () => {
  it('creates first image w/ drawer, and fail because POST is stubbed', () => {
    const diskLabel = 'Debian 10 Disk';
    // stub incoming response
    cy.intercept('/v4/images?page_size=100', {
      results: 0,
      data: [],
      page: 1,
      pages: 1
    }).as('getImages');
    cy.intercept('POST', '*/images', req => {
      req.reply(200);
    }).as('postImages');
    createLinode().then(linode => {
      // stub incoming disks response
      cy.intercept(`*/linode/instances/${linode.id}/disks*`, {
        results: 2,
        data: [
          {
            id: 44311273,
            status: 'ready',
            label: diskLabel,
            created: '2020-08-21T17:26:14',
            updated: '2020-08-21T17:26:30',
            filesystem: 'ext4',
            size: 81408
          },
          {
            id: 44311274,
            status: 'ready',
            label: '512 MB Swap Image',
            created: '2020-08-21T17:26:14',
            updated: '2020-08-21T17:26:31',
            filesystem: 'swap',
            size: 512
          }
        ],
        page: 1,
        pages: 1
      }).as('getDisks');
      cy.visitWithLogin('/images');
      getVisible('[data-qa-header]').within(() => {
        fbtVisible('Images');
      });
      const imageLabel = makeImageLabel();
      getVisible('[data-qa-header]').within(() => {
        fbtVisible('Images');
      });
      cy.wait('@getImages');
      fbtClick('Add an Image');
      fbtClick('Select a Linode').type(`${linode.label}{enter}`);
      cy.wait('@getDisks').then(() => {
        containsClick('Select a Disk').type(`${diskLabel}{enter}`);
      });
      cy.findAllByLabelText('Label').type(`${imageLabel}{enter}`);
      cy.findAllByLabelText('Description').type(
        `${imageLabel} is an amazing image`
      );
      // here we should also stubb the post to catch the call
      getClick('[data-qa-submit="true"]');
      cy.wait('@postImages');
      cy.url().should('endWith', 'images');
      deleteLinodeById(linode.id);
    });
  });
});
