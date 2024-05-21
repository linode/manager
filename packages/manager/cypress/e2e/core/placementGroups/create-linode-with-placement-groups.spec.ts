import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetAccount } from 'support/intercepts/account';
import {
  accountFactory,
  linodeFactory,
  placementGroupFactory,
} from 'src/factories';
import { regionFactory } from 'src/factories';
import { ui } from 'support/ui/';
import { mockCreateLinode } from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  mockCreatePlacementGroup,
  mockGetPlacementGroups,
} from 'support/intercepts/placement-groups';
import { randomString } from 'support/util/random';
import { CANNOT_CHANGE_AFFINITY_TYPE_ENFORCEMENT_MESSAGE } from 'src/features/PlacementGroups/constants';

import type { Region } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const mockAccount = accountFactory.build();
const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes', 'Placement Group'],
    id: 'us-east',
    label: 'Newark, NJ',
    country: 'us',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-central',
    label: 'Dallas, TX',
    country: 'us',
  }),
];

describe('Linode create flow with Placement Group', () => {
  beforeEach(() => {
    mockGetAccount(mockAccount);
    mockGetRegions(mockRegions).as('getRegions');
    // TODO Remove feature flag mocks when `placementGroups` flag is retired.
    mockAppendFeatureFlags({
      placementGroups: makeFeatureFlagData<Flags['placementGroups']>({
        beta: true,
        enabled: true,
      }),
      linodeCreateRefactor: makeFeatureFlagData<Flags['linodeCreateRefactor']>(
        false
      ),
    });
    mockGetFeatureFlagClientstream();
  });

  /*
   * - Confirms Placement Group create UI flow using mock API data.
   * - Confirms that outgoing Placement Group create request contains expected data.
   * - Confirms that Cloud automatically updates to list new Placement Group on landing page.
   */
  it('can create a linode with a newly created Placement Group', () => {
    cy.visitWithLogin('/linodes/create');

    cy.findByText(
      'Select a Region for your Linode to see existing placement groups.'
    ).should('be.visible');

    // Region without capability
    // Choose region
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(mockRegions[1].label).click();

    // Choose plan
    cy.findByText('Shared CPU').click();
    cy.get('[id="g6-nanode-1"]').click();

    cy.findByText('Placement Groups in Dallas, TX (us-central)').should(
      'be.visible'
    );
    cy.get('[data-testid="placement-groups-no-capability-notice"]').should(
      'be.visible'
    );
    ui.tooltip
      .findByText('Regions that support placement groups')
      .should('be.visible')
      .click();
    cy.get('[data-testid="supported-pg-region-us-east"]').should('be.visible');

    // Region with capability
    // Choose region
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();

    // Choose plan
    cy.findByText('Shared CPU').click();
    cy.get('[id="g6-nanode-1"]').click();

    // Choose Placement Group
    // No Placement Group available
    cy.findByText('Placement Groups in Newark, NJ (us-east)').should(
      'be.visible'
    );
    // Open the select
    cy.get('[data-testid="placement-groups-select"] input').click();
    cy.findByText('There are no placement groups in this region.').click();
    // Close the select
    cy.get('[data-testid="placement-groups-select"] input').click();

    // Create a Placement Group
    ui.button
      .findByTitle('Create Placement Group')
      .should('be.visible')
      .should('be.enabled')
      .click();

    const mockPlacementGroup = placementGroupFactory.build({
      label: 'pg-1-us-east',
      region: mockRegions[0].id,
      affinity_type: 'anti_affinity:local',
      is_strict: true,
      is_compliant: true,
    });

    mockGetPlacementGroups([mockPlacementGroup]).as('getPlacementGroups');
    mockCreatePlacementGroup(mockPlacementGroup).as('createPlacementGroup');

    ui.drawer
      .findByTitle('Create Placement Group')
      .should('be.visible')
      .within(() => {
        // Confirm that the drawer contains the expected default information.
        // - A selection region
        // - An Affinity Type Enforcement message
        // - a disabled "Create Placement Group" button.
        cy.findByText('Newark, NJ (us-east)').should('be.visible');
        cy.findByText(CANNOT_CHANGE_AFFINITY_TYPE_ENFORCEMENT_MESSAGE).should(
          'be.visible'
        );
        ui.buttonGroup
          .findButtonByTitle('Create Placement Group')
          .should('be.disabled');

        // Enter label and submit form.
        cy.findByLabelText('Label').type(mockPlacementGroup.label);

        ui.buttonGroup
          .findButtonByTitle('Create Placement Group')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for outgoing API request and confirm that payload contains expected data.
    cy.wait('@createPlacementGroup').then((xhr) => {
      const requestPayload = xhr.request?.body;
      expect(requestPayload['affinity_type']).to.equal('anti_affinity:local');
      expect(requestPayload['is_strict']).to.equal(true);
      expect(requestPayload['label']).to.equal(mockPlacementGroup.label);
      expect(requestPayload['region']).to.equal(mockRegions[0].id);
    });

    // Confirm that the drawer closes and a success message is displayed.
    ui.toast.assertMessage(
      `Placement Group ${mockPlacementGroup.label} successfully created.`
    );

    // Select the newly created Placement Group.
    cy.wait('@getPlacementGroups');
    cy.get('[data-testid="placement-groups-select"] input').should(
      'have.value',
      mockPlacementGroup.label
    );

    const linodeLabel = 'linode-with-placement-group';
    const mockLinode = linodeFactory.build({
      label: linodeLabel,
      region: mockRegions[0].id,
      placement_group: {
        id: mockPlacementGroup.id,
      },
    });

    // Confirm the Placement group assignment is accounted for in the summary.
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText('Assigned to Placement Group').should('be.visible');
    });

    // Type in a label, password and submit the form.
    mockCreateLinode(mockLinode).as('createLinode');
    cy.get('#linode-label').clear().type('linode-with-placement-group');
    cy.get('#root-password').type(randomString(32));

    cy.get('[data-qa-deploy-linode]').click();

    // Wait for outgoing API request and confirm that payload contains expected data.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request?.body;

      expect(requestPayload['region']).to.equal(mockRegions[0].id);
      expect(requestPayload['label']).to.equal(linodeLabel);
      expect(requestPayload['placement_group'].id).to.equal(
        mockPlacementGroup.id
      );
    });
  });
});
