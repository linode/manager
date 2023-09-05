import {
  mockGetVPC,
  mockGetVPCs,
  mockDeleteVPC,
  mockUpdateVPC,
} from 'support/intercepts/vpc';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { vpcFactory } from '@src/factories';
import { randomLabel, randomNumber, randomPhrase } from 'support/util/random';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import type { VPC } from '@linode/api-v4';
import { getRegionById } from 'support/util/regions';
import { ui } from 'support/ui';

describe('VPC details page', () => {
  /**
   * - Confirms that VPC details pages can be visited.
   * - Confirms that VPC details pages show VPC information.
   * - Confirms UI flow when editing a VPC from details page.
   * - Confirms UI flow when deleting a VPC from details page.
   */
  it('can edit and delete a VPC from the VPC details page', () => {
    const mockVPC: VPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockVPCUpdated = {
      ...mockVPC,
      label: randomLabel(),
      description: randomPhrase(),
    };

    const vpcRegion = getRegionById(mockVPC.region);

    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetVPC(mockVPC).as('getVPC');
    mockUpdateVPC(mockVPC.id, mockVPCUpdated).as('updateVPC');
    mockDeleteVPC(mockVPC.id).as('deleteVPC');

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getVPC']);

    // Confirm that VPC details are displayed.
    cy.findByText(mockVPC.label).should('be.visible');
    cy.findByText(vpcRegion.label).should('be.visible');

    // Confirm that VPC can be updated and that page reflects changes.
    ui.button
      .findByTitle('Edit')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Edit VPC')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label')
          .should('be.visible')
          .click()
          .clear()
          .type(mockVPCUpdated.label);

        cy.findByLabelText('Description')
          .should('be.visible')
          .click()
          .clear()
          .type(mockVPCUpdated.description);

        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@updateVPC');
    cy.findByText(mockVPCUpdated.label).should('be.visible');
    cy.findByText(mockVPCUpdated.description).should('be.visible');

    // Confirm that VPC can be deleted and user is redirected to landing page.
    ui.button
      .findByTitle('Delete')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle(`Delete VPC ${mockVPCUpdated.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('VPC Label')
          .should('be.visible')
          .click()
          .type(mockVPCUpdated.label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    mockGetVPCs([]).as('getVPCs');
    cy.wait(['@deleteVPC', '@getVPCs']);

    // Confirm that user is redirected to VPC landing page.
    cy.url().should('endWith', '/vpcs');
    cy.findByText('Create a private and isolated network.');
  });
});
