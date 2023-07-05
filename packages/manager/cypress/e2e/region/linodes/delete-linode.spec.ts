import { createLinodeRequestFactory } from '@src/factories';
import { testRegions, getTestableRegions } from 'support/util/regions';
import { randomLabel, randomString } from 'support/util/random';
import { getLinodes, Region } from '@linode/api-v4';
import { createLinode } from '@linode/api-v4';
import { poll } from 'support/util/polling';
import { depaginate } from 'support/util/paginate';
import type { Linode } from '@linode/api-v4';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { resolveInBatches } from 'support/util/promises';

/**
 * Creates a Linode for each testable region, and waits for each to boot.
 */
const createLinodesAndWait = async () => {
  const createLinodePromiseGenerators = getTestableRegions()
    .map((region: Region) => {
      const linodeRequest = createLinodeRequestFactory.build({
        label: randomLabel(),
        region: region.id,
        root_password: randomString(32),
      });

      return () => createLinode(linodeRequest);
    });

  //const newLinodes = await Promise.all(createLinodePromises);
  const newLinodes = await resolveInBatches(createLinodePromiseGenerators, 2, 6500);
  const checkLinodeStatuses = (allLinodes: Linode[]) => {
    return allLinodes
      .filter((linode) => newLinodes.some((newLinode) => newLinode.label === linode.label))
      .every((linode) => linode.status === 'running');
  };

  await poll<Linode[]>(
    async () => depaginate((page) => getLinodes({ page })),
    (linodes: Linode[]) => checkLinodeStatuses(linodes),
  );

  return newLinodes;
};

authenticate();
describe('Delete Linodes', () => {
  // Create Linodes to delete first.
  let linodes: Linode[];
  before(() => {
    const deferOptions = {
      label: 'creating Linodes to delete',
      timeout: 180000,
    };
    cy.defer(createLinodesAndWait(), deferOptions).then((newLinodes: Linode[]) => {
      linodes = newLinodes;
    });
  });

  testRegions('can delete a Linode', (region: Region) => {
    const linode = linodes.find((aLinode) => aLinode.region === region.id);
    if (!linode) {
      throw new Error(`Unable to find created Linode for region ${region.id}`);
    }
    cy.visitWithLogin(`/linodes/${linode.id}`);
    ui.actionMenu
      .findByTitle(`Action menu for Linode ${linode.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem
      .findByTitle('Delete')
      .should('be.visible')
      .click();

    ui.dialog
      .findByTitle(`Delete ${linode.label}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Linode Label')
          .should('be.visible')
          .click()
          .type(linode.label);

        ui.buttonGroup
          .findButtonByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Cloud currently does not navigate back to landing page.
    // Remove call to `cy.visitWithLogin()` once redirect is restored.
    cy.visitWithLogin('/linodes');
    cy.findByText(linode.label).should('not.exist');
  });
});
