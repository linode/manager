/**
 * @file Cypress integration tests for VM Placement Groups deletion flows.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';

import { mockGetAccount } from 'support/intercepts/account';
import {
  mockDeletePlacementGroup,
  mockGetPlacementGroups,
  mockUnassignPlacementGroupLinodes,
} from 'support/intercepts/placement-groups';
import {
  accountFactory,
  linodeFactory,
  placementGroupFactory,
} from 'src/factories';

import type { Flags } from 'src/featureFlags';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import { mockGetLinodes } from 'support/intercepts/linodes';

// Mock an account with 'Placement Group' capability.
const mockAccount = accountFactory.build();

// Warning stating that Placement Group deletion is permanent.
const deletionWarning =
  'Deleting a placement group is permanent and cannot be undone.';

// Warning stating that Linodes must be unassigned before Placement Group deletion.
const unassignWarning =
  'You need to unassign all Linodes before deleting a placement group.';

// Landing page empty state text.
const emptyStateMessage =
  'Control the physical placement or distribution of Linode instances within a data center or availability zone.';

describe('Placement Group deletion', () => {
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
   * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
   * - Confirms that user is not warned or prompted to unassign Linodes when none are assigned.
   * - Confirms that UI automatically updates to reflect deleted Placement Group.
   * - Confirms that landing page reverts to its empty state when last Placement Group is deleted.
   */
  it('can delete without Linodes assigned', () => {
    const mockPlacementGroupRegion = chooseRegion();
    const mockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      members: [],
      region: mockPlacementGroupRegion.id,
      is_compliant: true,
    });

    mockGetPlacementGroups([mockPlacementGroup]).as('getPlacementGroups');

    cy.visitWithLogin('/placement-groups');
    cy.wait('@getPlacementGroups');

    // Click "Delete" button next to the mock Placement Group.
    cy.findByText(mockPlacementGroup.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    mockDeletePlacementGroup(mockPlacementGroup.id).as('deletePlacementGroup');
    mockGetPlacementGroups([]).as('getPlacementGroups');

    // Confirm deletion warning appears, complete Type-to-Confirm, and submit confirmation.
    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText(deletionWarning).should('be.visible');
        cy.findByText(unassignWarning).should('not.exist');

        cy.findByLabelText('Placement Group').type(mockPlacementGroup.label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that UI updates to reflect deleted Placement Group.
    cy.wait(['@deletePlacementGroup', '@getPlacementGroups']);
    ui.toast.assertMessage(
      `Placement Group ${mockPlacementGroup.label} successfully deleted.`
    );
    cy.findByText(emptyStateMessage).should('be.visible');
  });

  /*
   * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
   * - Confirms deletion flow when Placement Group has one or more Linodes assigned to it.
   * - Confirms that user is prompted to unassign Linodes before being able to proceed with deletion.
   * - Confirms that UI automatically updates to reflect unassigned Linodes during deletion.
   * - Confirms that UI automatically updates to reflect deleted Placement Group.
   */
  it('can delete with Linodes assigned', () => {
    const mockPlacementGroupRegion = chooseRegion();

    // Linodes that are assigned to the Placement Group being deleted.
    const mockPlacementGroupLinodes = buildArray(3, () =>
      linodeFactory.build({
        label: randomLabel(),
        id: randomNumber(),
        region: mockPlacementGroupRegion.id,
      })
    );

    // Placement Group that will be deleted.
    const mockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      members: mockPlacementGroupLinodes.map((linode) => ({
        linode_id: linode.id,
        is_compliant: true,
      })),
      region: mockPlacementGroupRegion.id,
      is_compliant: true,
    });

    // Second unrelated Placement Group to verify landing page content after deletion.
    const secondMockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      members: [],
      region: mockPlacementGroupRegion.id,
      is_compliant: true,
    });

    mockGetLinodes(mockPlacementGroupLinodes).as('getLinodes');
    mockGetPlacementGroups([mockPlacementGroup, secondMockPlacementGroup]).as(
      'getPlacementGroups'
    );

    cy.visitWithLogin('/placement-groups');
    cy.wait('@getPlacementGroups');

    // Click "Delete" button next to the mock Placement Group.
    cy.findByText(mockPlacementGroup.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm deletion warning appears and that form cannot be submitted
    // while Linodes are assigned.
    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText(deletionWarning).should('be.visible');
        cy.findByText(unassignWarning).should('be.visible');

        // Confirm that type-to-confirm and submit button are disabled while
        // Linodes remain assigned.
        cy.findByLabelText('Placement Group').should('be.disabled');

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.disabled');

        // Unassign each Linode.
        cy.get('[data-qa-selection-list]').within(() => {
          mockPlacementGroupLinodes.forEach((mockLinode, i) => {
            // Update Placement Group mock to reflect each unassignment.
            const placementGroupAfterUnassignment = {
              ...mockPlacementGroup,
              members: mockPlacementGroup.members.slice(i + 1),
            };

            mockUnassignPlacementGroupLinodes(
              mockPlacementGroup.id,
              placementGroupAfterUnassignment
            ).as('unassignLinode');
            mockGetPlacementGroups([
              placementGroupAfterUnassignment,
              secondMockPlacementGroup,
            ]).as('getPlacementGroups');

            cy.findByText(mockLinode.label)
              .should('be.visible')
              .closest('li')
              .within(() => {
                ui.button
                  .findByTitle('Unassign')
                  .should('be.visible')
                  .should('be.enabled')
                  .click();
              });

            cy.wait('@unassignLinode');
            cy.findByText(mockLinode.label).should('not.exist');
          });
        });

        // Confirm that Type-to-Confirm is now enabled, enter label, and submit.
        cy.findByLabelText('Placement Group')
          .should('be.enabled')
          .type(mockPlacementGroup.label);

        mockDeletePlacementGroup(mockPlacementGroup.id).as(
          'deletePlacementGroup'
        );
        mockGetPlacementGroups([secondMockPlacementGroup]).as(
          'getPlacementGroups'
        );
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@deletePlacementGroup', '@getPlacementGroups']);
    ui.toast.assertMessage(
      `Placement Group ${mockPlacementGroup.label} successfully deleted.`
    );

    // Confirm that deleted Placement Group has been removed from list and that
    // other Placement Group remains.
    cy.findByText(mockPlacementGroup.label).should('not.exist');
    cy.findByText(secondMockPlacementGroup.label).should('be.visible');
  });
});
