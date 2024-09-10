import { randomLabel } from 'support/util/random';
import { authenticate } from 'support/api/authentication';
import { createLinodeRequestFactory } from '@src/factories';
import { cleanUp } from 'support/util/cleanup';
import { chooseRegion } from 'support/util/regions';
import { interceptRebootLinode } from 'support/intercepts/linodes';
import { createTestLinode } from 'support/util/linodes';

import type { Linode } from '@linode/api-v4';

authenticate();
describe('reboot linode', () => {
  before(() => {
    cleanUp(['linodes']);
  });

  it('reboots a linode from its details page', () => {
    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    cy.defer(
      () => createTestLinode(linodeCreatePayload),
      'creating Linode'
    ).then((linode: Linode) => {
      interceptRebootLinode(linode.id).as('linodeReboot');

      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.findByText('RUNNING').should('be.visible');
      cy.findByText('Reboot').should('be.visible').click();
      cy.findByText(`Reboot Linode ${linode.label}?`).should('be.visible');
      // check that pressing the enter key also triggers the dialog
      cy.get('body').type('{enter}');
    });

    cy.wait('@linodeReboot');
    cy.findByText('Rebooting').should('be.visible');
    // cy.contains('REBUILDING').should('be.visible');
    // cy.findByText('Reboot').should('be.visible').click();
  });
});
