import { makeImageLabel } from '../../support/api/images';
import { createLinode } from '../../support/api/linodes';
import { deleteLinodeById } from '../../support/api/linodes.ts';

describe('create linode', () => {
  it('creates first image', () => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/v4/images*',
      response: {
        results: 0,
        data: [],
        page: 1,
        pages: 1
      }
    }).as('getImages');
    cy.route({
      method: 'POST',
      url: '/v4/images*'
    }).as('postImages');
    createLinode().then(linode => {
      cy.route({
        method: 'GET',
        url: `/v4/linode/instances/${linode.id}/disks*`,
        response: {
          results: 2,
          data: [
            {
              id: 44311273,
              status: 'ready',
              label: 'Debian 10 Disk',
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
        }
      }).as('getDisks');
      cy.visitWithLogin('/images');
      cy.wait('@getImages');
      const imageLabel = makeImageLabel();
      cy.findAllByRole('button')
        .filter(':contains("Add an Image")')
        .click();

      cy.findByText('Select a Linode').type(`${linode.label}{enter}`);
      cy.findByText('Select a Disk')
        .click()
        .type(`Debian{enter}`);

      cy.findAllByLabelText('Label').type(`${imageLabel}{enter}`);
      // Line should be removed once bug fixed
      cy.findByText('Snap', { exact: false, timeout: 1000 }).should(
        'not.exist'
      );
      // here we should also stube the post to catch the call
      cy.findByText('Create')
        .should('be.visible')
        .click();
      cy.wait('@postImages')
        .its('status')
        .should('eq', 200);

      deleteLinodeById(linode.id);
      // do not need to delete images, as the post is stubbed
    });

  });
});
