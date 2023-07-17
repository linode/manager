import { describeRegions } from 'support/util/regions';
import { ui } from 'support/ui';
import { randomLabel, randomPhrase } from 'support/util/random';
import type { Region } from '@linode/api-v4';

describeRegions('Upload Machine Images', (region: Region) => {
  it('can upload a machine image', () => {
    const imageLabel = randomLabel();
    const imageDescription = randomPhrase();

    cy.visitWithLogin('/images/create/upload');
    cy.findByText('Label').should('be.visible').click().type(imageLabel);

    cy.findByText('Description')
      .should('be.visible')
      .click()
      .type(imageDescription);

    cy.contains('Select a Region').should('be.visible').click();

    ui.regionSelect.findItemByRegionId(region.id).should('be.visible').click();
  });
});
