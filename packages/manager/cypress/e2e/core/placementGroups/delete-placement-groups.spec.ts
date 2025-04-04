/**
 * @file Cypress integration tests for VM Placement Groups deletion flows.
 */

import { linodeFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockDeletePlacementGroup,
  mockDeletePlacementGroupError,
  mockGetPlacementGroup,
  mockGetPlacementGroups,
  mockUnassignPlacementGroupLinodes,
  mockUnassignPlacementGroupLinodesError,
} from 'support/intercepts/placement-groups';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountFactory, placementGroupFactory } from 'src/factories';
import { headers as emptyStatePageHeaders } from 'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLandingEmptyStateData';

// Mock an account with 'Placement Group' capability.
const mockAccount = accountFactory.build();

// Warning stating that Placement Group deletion is permanent.
const deletionWarning =
  'Deleting a placement group is permanent and cannot be undone.';

// Warning stating that Linodes must be unassigned before Placement Group deletion.
const unassignWarning =
  'You need to unassign all Linodes before deleting a placement group.';

// Landing page empty state text.
const emptyStateMessage = emptyStatePageHeaders.description;

// Error message that when an unexpected error occurs.
const PlacementGroupErrorMessage = 'An unknown error has occurred.';

describe('Placement Group deletion', () => {
  beforeEach(() => {
    mockGetAccount(mockAccount);
  });

  /*
   * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
   * - Confirms that user is not warned or prompted to unassign Linodes when none are assigned.
   * - Confirms that UI automatically updates to reflect deleted Placement Group.
   * - Confirms that landing page reverts to its empty state when last Placement Group is deleted.
   * - Confirms that user can retry and continue with deletion when unexpected error happens.
   */
  it('can delete without Linodes assigned when unexpected error show up and retry', () => {
    const mockPlacementGroupRegion = chooseRegion();
    const mockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      is_compliant: true,
      label: randomLabel(),
      members: [],
      region: mockPlacementGroupRegion.id,
    });

    mockGetPlacementGroups([mockPlacementGroup]).as('getPlacementGroups');
    mockGetPlacementGroup(mockPlacementGroup).as('getPlacementGroup');

    cy.visitWithLogin('/placement-groups');
    cy.wait('@getPlacementGroups');

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

    // Click "Delete" button next to the mock Placement Group, mock an HTTP 500 error and confirm UI displays the message.
    mockDeletePlacementGroupError(
      mockPlacementGroup.id,
      PlacementGroupErrorMessage
    ).as('deletePlacementGroupError');

    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Placement Group').type(mockPlacementGroup.label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@deletePlacementGroupError');
        cy.findByText(PlacementGroupErrorMessage).should('be.visible');
      });

    // Click "Delete" button next to the mock Placement Group,
    // mock a successful response and confirm that Cloud
    mockDeletePlacementGroup(mockPlacementGroup.id).as('deletePlacementGroup');
    mockGetPlacementGroups([]).as('getPlacementGroups');

    // Confirm deletion warning appears, complete Type-to-Confirm, and submit confirmation.
    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText(deletionWarning).should('be.visible');
        cy.findByText(unassignWarning).should('not.exist');

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
   * - Confirms that user can retry and continue with unassignment when unexpected error happens.
   */
  it('can delete with Linodes assigned when unexpected error show up and retry', () => {
    const mockPlacementGroupRegion = chooseRegion();

    // Linodes that are assigned to the Placement Group being deleted.
    const mockPlacementGroupLinodes = buildArray(3, () =>
      linodeFactory.build({
        id: randomNumber(),
        label: randomLabel(),
        region: mockPlacementGroupRegion.id,
      })
    );

    // Placement Group that will be deleted.
    const mockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      is_compliant: true,
      label: randomLabel(),
      members: mockPlacementGroupLinodes.map((linode) => ({
        is_compliant: true,
        linode_id: linode.id,
      })),
      region: mockPlacementGroupRegion.id,
    });

    // Second unrelated Placement Group to verify landing page content after deletion.
    const secondMockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      is_compliant: true,
      label: randomLabel(),
      members: [],
      region: mockPlacementGroupRegion.id,
    });

    mockGetLinodes(mockPlacementGroupLinodes).as('getLinodes');
    mockGetPlacementGroups([mockPlacementGroup, secondMockPlacementGroup]).as(
      'getPlacementGroups'
    );
    mockGetPlacementGroup(mockPlacementGroup).as('getPlacementGroup');

    cy.visitWithLogin('/placement-groups');
    cy.wait(['@getPlacementGroups']);

    // Click "Delete" button next to the mock Placement Group, and initially mock
    // an API error response and confirm that the error message is displayed in the
    // deletion modal.
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

    mockUnassignPlacementGroupLinodesError(
      mockPlacementGroup.id,
      PlacementGroupErrorMessage
    ).as('UnassignPlacementGroupError');

    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-selection-list]').within(() => {
          // Select the first Linode to unassign
          const mockLinodeToUnassign = mockPlacementGroupLinodes[0];

          cy.findByText(mockLinodeToUnassign.label)
            .should('be.visible')
            .closest('li')
            .within(() => {
              ui.button
                .findByTitle('Unassign')
                .should('be.visible')
                .should('be.enabled')
                .click();
            });
        });

        cy.wait('@UnassignPlacementGroupError');
        cy.findByText(PlacementGroupErrorMessage).should('be.visible');
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
            mockGetPlacementGroup(placementGroupAfterUnassignment).as(
              'getPlacementGroups'
            );

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

            cy.wait(['@unassignLinode']);
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

  /*
   * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
   * - Confirms that user is not warned or prompted to unassign Linodes when none are assigned.
   * - Confirms that UI automatically updates to reflect deleted Placement Group.
   * - Confirms that landing page reverts to its empty state when last Placement Group is deleted.
   * - Confirms that user can close and reopen the dialog when unexpected error happens.
   */
  it('can delete without Linodes assigned when unexpected error show up and reopen the dialog', () => {
    const mockPlacementGroupRegion = chooseRegion();
    const mockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      is_compliant: true,
      label: randomLabel(),
      members: [],
      region: mockPlacementGroupRegion.id,
    });

    mockGetPlacementGroups([mockPlacementGroup]).as('getPlacementGroups');
    mockGetPlacementGroup(mockPlacementGroup).as('getPlacementGroup');

    cy.visitWithLogin('/placement-groups');
    cy.wait('@getPlacementGroups');

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

    // Click "Delete" button next to the mock Placement Group, mock an HTTP 500 error and confirm UI displays the message.
    mockDeletePlacementGroupError(
      mockPlacementGroup.id,
      PlacementGroupErrorMessage
    ).as('deletePlacementGroupError');

    // The dialog can be closed after an unexpect error show up
    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Placement Group').type(mockPlacementGroup.label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@deletePlacementGroupError');
        cy.findByText(PlacementGroupErrorMessage).should('be.visible');

        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`).should(
      'not.exist'
    );

    // Click "Delete" button next to the mock Placement Group,
    // mock a successful response and confirm that Cloud
    mockDeletePlacementGroup(mockPlacementGroup.id).as('deletePlacementGroup');

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

    mockGetPlacementGroups([]).as('getPlacementGroups');

    // Confirm deletion warning appears, complete Type-to-Confirm, and submit confirmation.
    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        // ensure error message not exist when reopening the dialog
        cy.findByText(PlacementGroupErrorMessage).should('not.exist');

        cy.findByLabelText('Placement Group').type(mockPlacementGroup.label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
  });

  /*
   * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
   * - Confirms deletion flow when Placement Group has one or more Linodes assigned to it.
   * - Confirms that user is prompted to unassign Linodes before being able to proceed with deletion.
   * - Confirms that user can close and reopen the dialog when unexpected error happens.
   */
  it('can unassign Linode when unexpected error show up and reopen the dialog', () => {
    const mockPlacementGroupRegion = chooseRegion();

    // Linodes that are assigned to the Placement Group being deleted.
    const mockPlacementGroupLinodes = buildArray(3, () =>
      linodeFactory.build({
        id: randomNumber(),
        label: randomLabel(),
        region: mockPlacementGroupRegion.id,
      })
    );

    // Placement Group that will be deleted.
    const mockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      is_compliant: true,
      label: randomLabel(),
      members: mockPlacementGroupLinodes.map((linode) => ({
        is_compliant: true,
        linode_id: linode.id,
      })),
      region: mockPlacementGroupRegion.id,
    });

    // Second unrelated Placement Group to verify landing page content after deletion.
    const secondMockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      is_compliant: true,
      label: randomLabel(),
      members: [],
      region: mockPlacementGroupRegion.id,
    });

    mockGetLinodes(mockPlacementGroupLinodes).as('getLinodes');
    mockGetPlacementGroups([mockPlacementGroup, secondMockPlacementGroup]).as(
      'getPlacementGroups'
    );
    mockGetPlacementGroup(mockPlacementGroup).as('getPlacementGroup');

    cy.visitWithLogin('/placement-groups');
    cy.wait(['@getPlacementGroups']);

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

    // Click "Delete" button next to the mock Placement Group, mock an HTTP 500 error and confirm UI displays the message.
    mockUnassignPlacementGroupLinodesError(
      mockPlacementGroup.id,
      PlacementGroupErrorMessage
    ).as('UnassignPlacementGroupError');

    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-selection-list]').within(() => {
          // Select the first Linode to unassign
          const mockLinodeToUnassign = mockPlacementGroupLinodes[0];

          cy.findByText(mockLinodeToUnassign.label)
            .should('be.visible')
            .closest('li')
            .within(() => {
              ui.button
                .findByTitle('Unassign')
                .should('be.visible')
                .should('be.enabled')
                .click();
            });
        });

        cy.wait('@UnassignPlacementGroupError');
        cy.findByText(PlacementGroupErrorMessage).should('be.visible');

        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`).should(
      'not.exist'
    );

    // Click "Delete" button next to the mock Placement Group to reopen the dialog.
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

    // Confirm that the error message from the previous attempt is no longer present.
    ui.dialog
      .findByTitle(`Delete Placement Group ${mockPlacementGroup.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText(PlacementGroupErrorMessage).should('not.exist');
      });
  });
});
