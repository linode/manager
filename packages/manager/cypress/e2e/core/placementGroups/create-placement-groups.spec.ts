import { regionFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreatePlacementGroup,
  mockGetPlacementGroups,
} from 'support/intercepts/placement-groups';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui/';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountFactory, placementGroupFactory } from 'src/factories';
import { CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE } from 'src/features/PlacementGroups/constants';

const mockAccount = accountFactory.build();

describe('Placement Group create flow', () => {
  beforeEach(() => {
    mockGetAccount(mockAccount);
  });

  /*
   * - Confirms Placement Group create UI flow using mock API data.
   * - Confirms that outgoing Placement Group create request contains expected data.
   * - Confirms that Cloud automatically updates to list new Placement Group on landing page.
   */
  it('can create Placement Group', () => {
    const mockRegions = regionFactory.buildList(5, {
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
      placement_group_limits: {
        maximum_pgs_per_customer: randomNumber(),
      },
    });

    const mockPlacementGroupRegion = chooseRegion({
      capabilities: ['Placement Group'],
      regions: mockRegions,
    });

    const mockPlacementGroup = placementGroupFactory.build({
      is_compliant: true,
      label: randomLabel(),
      placement_group_policy: 'strict',
      placement_group_type: 'anti_affinity:local',
      region: mockPlacementGroupRegion.id,
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

        cy.findByLabelText('Region').click();
        cy.focused().type(`${mockPlacementGroupRegion.label}{enter}`);

        cy.findByText(placementGroupLimitMessage).should('be.visible');
        cy.findByText(CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE).should(
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
      expect(requestPayload['placement_group_type']).to.equal(
        'anti_affinity:local'
      );
      expect(requestPayload['placement_group_policy']).to.equal('strict');
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
