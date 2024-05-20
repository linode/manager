import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetPlacementGroups } from 'support/intercepts/placement-groups';
import { ui } from 'support/ui';
import {
  accountFactory,
  linodeFactory,
  placementGroupFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { mockGetLinodes } from 'support/intercepts/linodes';

import type { Flags } from 'src/featureFlags';

const mockAccount = accountFactory.build();

describe('VM Placement landing page', () => {
  // Mock the VM Placement Groups feature flag to be enabled for each test in this block.
  beforeEach(() => {
    mockAppendFeatureFlags({
      placementGroups: makeFeatureFlagData<Flags['placementGroups']>({
        beta: true,
        enabled: true,
      }),
    });
    mockGetFeatureFlagClientstream();
    mockGetAccount(mockAccount).as('getAccount');
  });

  /**
   * - Confirms landing page empty state is shown when there are no Placement Groups.
   * - Confirms that clicking "Create Placement Groups" opens PG create drawer.
   */
  it('displays empty state when there are no Placement Groups', () => {
    mockGetPlacementGroups([]).as('getPlacementGroups');
    cy.visitWithLogin('/placement-groups');
    cy.wait('@getPlacementGroups');

    ui.heading.find().within(() => {
      cy.findByText('Placement Groups').should('be.visible');
    });

    ui.button
      .findByTitle('Create Placement Group')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer.findByTitle('Create Placement Group').should('be.visible');
  });

  /**
   * - Confirms landing page populated state is shown when there are Placement Groups.
   * - Confirms that each Placement Group is listed on the landing page.
   * - Confirms that clicking a Placement Group's label navigates to its details page.
   */
  it('lists Placement Groups when user has Placement Groups', () => {
    const mockPlacementGroupCompliantRegion = chooseRegion();
    const mockPlacementGroupNoncompliantRegion = chooseRegion();

    const mockPlacementGroupLinode = linodeFactory.build({
      label: randomLabel(),
      id: randomNumber(),
      region: mockPlacementGroupNoncompliantRegion.id,
    });

    const mockPlacementGroupCompliant = placementGroupFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockPlacementGroupCompliantRegion.id,
      affinity_type: 'anti_affinity:local',
      is_compliant: true,
      is_strict: false,
      members: [],
    });

    const mockPlacementGroupNoncompliant = placementGroupFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockPlacementGroupNoncompliantRegion.id,
      affinity_type: 'affinity:local',
      is_compliant: false,
      is_strict: true,
      members: [
        { linode_id: mockPlacementGroupLinode.id, is_compliant: false },
      ],
    });

    const mockPlacementGroups = [
      mockPlacementGroupCompliant,
      mockPlacementGroupNoncompliant,
    ];

    mockGetPlacementGroups(mockPlacementGroups).as('getPlacementGroups');
    mockGetLinodes([mockPlacementGroupLinode]);

    cy.visitWithLogin('/placement-groups');
    cy.wait('@getPlacementGroups');

    // Confirm that compliant Placement Group is listed with expected info.
    cy.findByText(mockPlacementGroupCompliant.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Anti-affinity').should('be.visible');
        cy.findByText('Flexible').should('be.visible');
        cy.findByText('0 of 5').should('be.visible');
        cy.findByText(mockPlacementGroupCompliantRegion.label).should(
          'be.visible'
        );
        cy.findByText('Non-compliant').should('not.exist');
      });

    // Confirm that non-compliant Placement Group is listed with expected info.
    cy.findByText(mockPlacementGroupNoncompliant.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Affinity').should('be.visible');
        cy.findByText('Strict').should('be.visible');
        cy.contains('1 of 5').should('be.visible');
        cy.findByText(mockPlacementGroupNoncompliantRegion.label).should(
          'be.visible'
        );
        cy.findByText('Non-compliant').should('be.visible');
      });

    cy.findByText(mockPlacementGroupCompliant.label).click();
    cy.url().should(
      'endWith',
      `/placement-groups/${mockPlacementGroupCompliant.id}`
    );
  });

  // TODO Re-evaluate whether this test is possible/necessary.
  /**
   * - Confirms that Cloud responds to compliance events and updates status on landing page.
   */
  // it.skip('updates Placement Group compliance status on event');
});
