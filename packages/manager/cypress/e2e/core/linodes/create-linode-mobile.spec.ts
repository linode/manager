/**
 * @file Smoke tests for Linode Create flow across common mobile viewport sizes.
 */

import { MOBILE_VIEWPORTS } from 'support/constants/environment';
import { mockCreateLinode } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { linodeFactory } from 'src/factories';

describe('Linode create mobile smoke', () => {
  MOBILE_VIEWPORTS.forEach((viewport) => {
    /*
     * - Confirms Linode create flow can be completed on common mobile screen sizes
     * - Creates a basic Nanode and confirms interactions succeed and outgoing request contains expected data.
     */
    it(`can create Linode (${viewport.label})`, () => {
      const mockLinodeRegion = chooseRegion();
      const mockLinode = linodeFactory.build({
        id: randomNumber(),
        label: randomLabel(),
        region: mockLinodeRegion.id,
      });

      mockCreateLinode(mockLinode).as('createLinode');

      cy.viewport(viewport.width, viewport.height);
      cy.visitWithLogin('/linodes/create');

      linodeCreatePage.selectImage('Ubuntu 24.04 LTS');
      linodeCreatePage.selectRegionById(mockLinodeRegion.id);
      linodeCreatePage.selectPlanCard('Shared CPU', 'Nanode 1 GB');
      linodeCreatePage.setLabel(mockLinode.label);
      linodeCreatePage.setRootPassword(randomString(32));

      cy.get('[data-qa-linode-create-summary]').scrollIntoView();
      cy.get('[data-qa-linode-create-summary]').within(() => {
        cy.findByText('Nanode 1 GB').should('be.visible');
        cy.findByText('Ubuntu 24.04 LTS').should('be.visible');
        cy.findByText(mockLinodeRegion.label).should('be.visible');
      });

      ui.button
        .findByTitle('Create Linode')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@createLinode').then((xhr) => {
        const requestBody = xhr.request.body;

        expect(requestBody['image']).to.equal('linode/ubuntu24.04');
        expect(requestBody['label']).to.equal(mockLinode.label);
        expect(requestBody['region']).to.equal(mockLinodeRegion.id);
        expect(requestBody['type']).to.equal('g6-nanode-1');
      });

      cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    });
  });
});
