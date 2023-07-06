import { authenticate } from 'support/api/authentication';
import { describeRegions } from 'support/util/regions';
import { createLinode, Region } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { randomLabel, randomString } from 'support/util/random';
import { interceptGetLinodeDetails } from 'support/intercepts/linodes';
import type { Linode } from '@linode/api-v4';

authenticate();
describeRegions('Can update Linodes', (region: Region) => {
  // const  linodePayload = createLinodeRequestFactory.build({

  // })
  let linode: Linode;
  before(() => {
    const payload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: region.id,
      password: randomString(32),
    });

    cy.defer(createLinode(payload), 'creating Linode').then((createdLinode) => {
      linode = createdLinode;
    });
  });

  it('can update a Linode label', () => {
    const newLabel = randomLabel();
    const oldLabel = linode.label;

    // Navigate to Linode details page.
    interceptGetLinodeDetails(linode.id).as('getLinode');
    cy.visitWithLogin(`/linodes/${linode.id}`);
    cy.wait('@getLinode');

    // Click on 'Settings' tab.
    cy.findByText('Settings').should('be.visible').click();

    cy.findByLabelText('Label')
      .should('be.visible')
      .click()
      .clear()
      .type(newLabel);
  });

  it('can update a Linode root password', () => {});
});
