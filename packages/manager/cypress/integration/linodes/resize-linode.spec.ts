// create linode with helper
// go to http://localhost:3000/linodes/<linodeID>?resize=true
// select contains text 'Linode 2GB' id="g6-standard-1"
// type linode name into data-testid="textfield-input" or id="linode-label" or both
// click button data-qa-resize="true" or contains 'Resize'
// wait for POST "https://api.linode.com/v4/linode/instances/<linodeID>/resize"
// look for text Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).
// look for text 'OFFLINE'
// wait for 'RESIZING'?

import { createLinode } from '../../support/api/linodes';
import { containsVisible, fbtVisible, getClick } from '../../support/helpers';

describe('resize linode', () => {
  it('resizes a linode', () => {
    createLinode().then(linode => {
      cy.intercept('POST', `*/linode/instances/${linode.id}/resize`).as(
        'linodeResize'
      );
      cy.visitWithLogin(`/linodes/${linode.id}?resize=true`);
      containsVisible('Linode 2GB');
      getClick('[id="g6-standard-4"]');
      cy.get('[data-testid="textfield-input"]').type(linode.label);
      cy.get('[data-qa-resize="true"]').click();
      cy.wait('@linodeResize');
      fbtVisible(
        'Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).'
      );
    });
  });
});
