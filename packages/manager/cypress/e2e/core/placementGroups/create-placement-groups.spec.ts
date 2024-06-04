import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetAccount } from 'support/intercepts/account';
import { accountFactory, placementGroupFactory } from 'src/factories';
import { regionFactory } from 'src/factories';
import { ui } from 'support/ui/';

import type { Flags } from 'src/featureFlags';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  mockCreatePlacementGroup,
  mockGetPlacementGroups,
} from 'support/intercepts/placement-groups';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { CANNOT_CHANGE_AFFINITY_TYPE_ENFORCEMENT_MESSAGE } from 'src/features/PlacementGroups/constants';

const mockAccount = accountFactory.build();

describe('Placement Group create flow', () => {
  beforeEach(() => {
    // TODO Remove feature flag mocks when `placementGroups` flag is retired.
    mockAppendFeatureFlags({
      placementGroups: makeFeatureFlagData<Flags['placementGroups']>({
        beta: true,
        enabled: true,
      }),
    });
    mockGetFeatureFlagClientstream();
    mockGetAccount(mockAccount);
  });

  /*
   * - Confirms Placement Group create UI flow using mock API data.
   * - Confirms that outgoing Placement Group create request contains expected data.
   * - Confirms that Cloud automatically updates to list new Placement Group on landing page.
   */
  it('can create Placement Group', () => {
    const mockRegions = regionFactory.buildList(5, {
      placement_group_limits: {
        maximum_pgs_per_customer: randomNumber(),
      },
      capabilities: [
        'Linodes',
        'NodeBalancers',
        'Block Storage',
        'Object Storage',
        'Kubernetes',
        'Cloud Firewall',
        'Placement Group',
        'Vlans',
        'Premium Plans',
      ],
    });

    const mockPlacementGroupRegion = chooseRegion({
      regions: mockRegions,
      capabilities: ['Placement Group'],
    });

    const mockPlacementGroup = placementGroupFactory.build({
      label: randomLabel(),
      region: mockPlacementGroupRegion.id,
      affinity_type: 'anti_affinity:local',
      is_strict: true,
      is_compliant: true,
    });

    const placementGroupLimitMessage = `Maximum placement groups in region: ${mockPlacementGroupRegion.placement_group_limits.maximum_pgs_per_customer}`;

    mockGetRegions(mockRegions);
    mockGetPlacementGroups([]).as('getPlacementGroups');
    mockCreatePlacementGroup(mockPlacementGroup).as('createPlacementGroup');

    cy.visitWithLogin('/placement-groups');
    cy.wait('@getPlacementGroups');

    ui.button
      .findByTitle('Create Placement Group')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockGetPlacementGroups([mockPlacementGroup]).as('getPlacementGroups');
    ui.drawer
      .findByTitle('Create Placement Group')
      .should('be.visible')
      .within(() => {
        // Confirm that create button is disabled before user selects region, etc.
        ui.buttonGroup
          .findButtonByTitle('Create Placement Group')
          .should('be.disabled');

        // Enter label, select region, and submit form.
        cy.findByLabelText('Label').type(mockPlacementGroup.label);

        cy.findByLabelText('Region')
          .click()
          .type(`${mockPlacementGroupRegion.label}{enter}`);

        cy.findByText(placementGroupLimitMessage).should('be.visible');
        cy.findByText(CANNOT_CHANGE_AFFINITY_TYPE_ENFORCEMENT_MESSAGE).should(
          'be.visible'
        );

        ui.buttonGroup
          .findButtonByTitle('Create Placement Group')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for outgoing API request and confirm that payload contains
    // the options/data chosen by the user.
    cy.wait('@createPlacementGroup').then((xhr) => {
      const requestPayload = xhr.request?.body;
      expect(requestPayload['affinity_type']).to.equal('anti_affinity:local');
      expect(requestPayload['is_strict']).to.equal(true);
      expect(requestPayload['label']).to.equal(mockPlacementGroup.label);
      expect(requestPayload['region']).to.equal(mockPlacementGroupRegion.id);
    });

    ui.toast.assertMessage(
      `Placement Group ${mockPlacementGroup.label} successfully created.`
    );

    // Confirm that Cloud automatically updates to list the new Placement Group,
    // and that the expected information is displayed.
    cy.findByText(mockPlacementGroup.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Anti-affinity').should('be.visible');
        cy.findByText('Strict').should('be.visible');
        cy.findByText(mockPlacementGroupRegion.label).should('be.visible');
        cy.findByText('Non-compliant').should('not.exist');
      });
  });
});
