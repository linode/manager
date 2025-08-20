import { createLinodeRequestFactory, linodeFactory } from '@linode/utilities';
import { linodeTypeFactory, regionFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeDetails,
  mockGetLinodeStatsError,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';
import { extendRegion } from 'support/util/regions';

import {
  MAINTENANCE_POLICY_NOT_AVAILABLE_IN_REGION_TEXT,
  MAINTENANCE_POLICY_NOT_AVAILABLE_IN_REGION_TEXT_DETAILS,
  MAINTENANCE_POLICY_SELECT_REGION_TEXT,
} from 'src/components/MaintenancePolicySelect/constants';

import type { Region } from '@linode/api-v4';

authenticate();

describe('maintenance policy region support - Create Linode', () => {
  it('should disable maintenance policy for core regions if no region is selected', () => {
    // Create mocks for a distributed region that doesn't support maintenance policies
    const mockRegionOptions: Partial<Region> = {
      capabilities: ['Linodes'], // Note: no 'Maintenance Policy' capability
      site_type: 'core',
    };
    const mockRegion = extendRegion(regionFactory.build(mockRegionOptions));
    const mockLinodeTypes = [
      linodeTypeFactory.build({
        class: 'nanode',
        label: 'Nanode 1GB',
      }),
    ];

    mockAppendFeatureFlags({
      gecko2: {
        enabled: true,
        la: true,
      },
    }).as('getFeatureFlags');
    mockGetRegions([mockRegion]).as('getRegions');
    mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
    mockGetRegionAvailability(mockRegion.id, []).as('getRegionAvailability');

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinodeTypes']);

    // Look for the Host Maintenance Policy section and open accordion
    cy.findByText('Host Maintenance Policy').should('be.visible').click();

    // Find the maintenance policy selector and verify it's disabled
    cy.findByLabelText('Maintenance Policy')
      .should('be.visible')
      .should('be.disabled');

    // Verify the helper text appears explaining why it's disabled
    cy.findByText(MAINTENANCE_POLICY_SELECT_REGION_TEXT).should('be.visible');
  });
  it('should disable maintenance policy selector in distributed regions', () => {
    // Create mocks for a distributed region that doesn't support maintenance policies
    const mockRegionOptions: Partial<Region> = {
      capabilities: ['Linodes', 'Distributed Plans'], // Note: no 'Maintenance Policy' capability
      site_type: 'distributed',
    };
    const mockRegion = extendRegion(regionFactory.build(mockRegionOptions));
    const mockLinodeTypes = [
      linodeTypeFactory.build({
        class: 'nanode',
        id: 'nanode-edge-1',
        label: 'Nanode 1GB',
      }),
    ];

    mockAppendFeatureFlags({
      gecko2: {
        enabled: true,
        la: true,
      },
    }).as('getFeatureFlags');
    mockGetRegions([mockRegion]).as('getRegions');
    mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
    mockGetRegionAvailability(mockRegion.id, []).as('getRegionAvailability');

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinodeTypes']);

    // Pick a region from the distributed region list
    cy.findByTestId('region').within(() => {
      ui.tabList.findTabByTitle('Distributed').should('be.visible').click();
      linodeCreatePage.selectRegionById(mockRegion.id);
    });

    cy.wait(['@getRegionAvailability']);

    // Look for the Host Maintenance Policy section and open accordion
    cy.findByText('Host Maintenance Policy').should('be.visible').click();

    // Find the maintenance policy selector and verify it's disabled
    cy.findByLabelText('Maintenance Policy')
      .should('be.visible')
      .should('be.disabled');

    // Verify the helper text appears explaining why it's disabled
    cy.findByText(MAINTENANCE_POLICY_NOT_AVAILABLE_IN_REGION_TEXT).should(
      'be.visible'
    );
  });
});

describe('maintenance policy region support - Linode Details > Settings', () => {
  before(() => {
    cleanUp(['linodes', 'lke-clusters']);
  });

  beforeEach(() => {
    mockAppendFeatureFlags({
      iamRbacPrimaryNavChanges: false,
    }).as('getFeatureFlags');
  });

  it('disables maintenance policy selector when region does not support it', () => {
    // Mock a linode in a region that doesn't support maintenance policies
    const mockRegion = regionFactory.build({
      capabilities: [
        // The 'Maintenance Policy' capability should be absent.
        'Linodes',
      ],
    });

    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: mockRegion.id,
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode);
    mockGetLinodeStatsError(
      mockLinode.id,
      'Stats for this Linode are not available yet',
      400
    );
    mockGetRegions([mockRegion]);

    // cy.defer(() => createTestLinode(linodeCreatePayload)).then((linode) => {
    // Visit the linode details page
    cy.visitWithLogin(`/linodes/${mockLinode.id}`);

    // Wait for content to load
    cy.findByText('Stats for this Linode are not available yet');

    // Navigate to the Settings tab
    cy.findByText('Settings').should('be.visible').click();

    // Look for the Host Maintenance Policy section
    cy.findByText('Host Maintenance Policy').should('be.visible');

    // Find the maintenance policy selector and verify it's disabled
    cy.findByLabelText('Maintenance Policy')
      .should('be.visible')
      .should('be.disabled');

    // Verify the helper text appears explaining why it's disabled
    cy.findByText(
      MAINTENANCE_POLICY_NOT_AVAILABLE_IN_REGION_TEXT_DETAILS
    ).should('be.visible');
    // });
  });

  it('enables maintenance policy selector when region supports it', () => {
    cy.tag('method:e2e');
    // Create a linode in a region that supports maintenance policies
    // eu-central is known to support maintenance policies
    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: 'eu-central', // Frankfurt, DE - known to support maintenance policies
    });

    cy.defer(() => createTestLinode(linodeCreatePayload)).then((linode) => {
      // Visit the linode details page
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Wait for content to load
      cy.findByText('Stats for this Linode are not available yet');

      // Navigate to the Settings tab
      cy.findByText('Settings').should('be.visible').click();

      // Look for the Host Maintenance Policy section
      cy.findByText('Host Maintenance Policy').should('be.visible');

      // Find the maintenance policy selector and verify it's enabled
      cy.findByLabelText('Maintenance Policy')
        .should('be.visible')
        .should('not.be.disabled');

      // Verify the helper text about region limitation does NOT appear
      cy.findByText(
        MAINTENANCE_POLICY_NOT_AVAILABLE_IN_REGION_TEXT_DETAILS
      ).should('not.exist');
    });
  });
});
