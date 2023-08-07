import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetVPCs } from 'support/intercepts/vpc';
import { vpcFactory } from '@src/factories';
import { ui } from 'support/ui';
import { getRegionById } from 'support/util/regions';

// TODO Remove feature flag mocks when feature flag is removed from codebase.
describe('VPC landing page', () => {
  /*
   * - Confirms that VPCs are listed on the VPC landing page.
   */
  it('lists VPC instances', () => {
    const mockVPCs = vpcFactory.buildList(5);
    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetVPCs(mockVPCs).as('getVPCs');

    cy.visitWithLogin('/vpc');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getVPCs']);

    // Confirm each VPC is listed with expected data.
    mockVPCs.forEach((mockVPC) => {
      const regionLabel = getRegionById(mockVPC.region).label;
      cy.findByText(mockVPC.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(regionLabel).should('be.visible');

          ui.button
            .findByTitle('Edit')
            .should('be.visible')
            .should('be.enabled');

          ui.button
            .findByTitle('Delete')
            .should('be.visible')
            .should('be.enabled');
        });
    });
  });

  /*
   * - Confirms VPC landing page empty state is shown when no VPCs are present.
   */
  it('shows empty state when there are no VPCs', () => {
    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetVPCs([]).as('getVPCs');

    cy.visitWithLogin('/vpc');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getVPCs']);

    // Confirm that empty state is shown and that each section is present.
    cy.findByText('VPCs').should('be.visible');
    cy.findByText('Create a private and isolated network.').should(
      'be.visible'
    );
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Video Playlist').should('be.visible');

    // Create button exists and navigates user to create page.
    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/vpc/create');
  });

  /*
   * - Confirms that users cannot navigate to VPC landing page when feature is disabled.
   */
  it('cannot access VPC landing page when feature is disabled', () => {
    // TODO Remove this test once VPC feature flag is removed from codebase.
    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/vpc');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    cy.findByText('Not Found').should('be.visible');
  });
});
