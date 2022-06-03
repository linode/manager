import { createLinode } from '../../support/api/linodes';
import { containsVisible, fbtVisible, getClick } from '../../support/helpers';

describe('resize linode', () => {
  it('resizes a linode', () => {
    createLinode().then((linode) => {
      cy.intercept('POST', `*/linode/instances/${linode.id}/resize`).as(
        'linodeResize'
      );
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);
      cy.findByText('Shared CPU').click({ scrollBehavior: false });
      containsVisible('Linode 2 GB');
      getClick('[id="g6-standard-4"]');
      cy.get('[data-testid="textfield-input"]').type(linode.label);
      cy.get('[data-qa-resize="true"]').click();
      cy.wait('@linodeResize');
      cy.contains(
        'Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).'
      ).should('be.visible');
    });
  });
});
