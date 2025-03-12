/**
 * @file Integration tests for Placement Group update label flows.
 */

import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetPlacementGroup,
  mockGetPlacementGroups,
  mockUpdatePlacementGroup,
  mockUpdatePlacementGroupError,
} from 'support/intercepts/placement-groups';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountFactory, placementGroupFactory } from 'src/factories';

const mockAccount = accountFactory.build();

describe('Placement Group update label flow', () => {
  // Mock the VM Placement Groups feature flag to be enabled for each test in this block.
  beforeEach(() => {
    mockGetAccount(mockAccount);
  });

  /**
   * - Confirms that a Placement Group's label can be updated from the landing page.
   * - Confirms that clicking "Edit" opens PG edit drawer.
   * - Only the label field is shown in the edit drawer.
   * - A new value can be entered into the label field.
   * - Confirms that Placement Groups landing page updates to reflect successful label update.
   * - Confirms a toast notification is shown upon successful label update.
   */
  it("update to a Placement Group's label is successful", () => {
    const mockPlacementGroupCompliantRegion = chooseRegion();

    const mockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      is_compliant: true,
      label: randomLabel(),
      members: [],
      placement_group_policy: 'flexible',
      placement_group_type: 'anti_affinity:local',
      region: mockPlacementGroupCompliantRegion.id,
    });

    const mockPlacementGroupUpdated = {
      ...mockPlacementGroup,
      label: randomLabel(),
    };

    mockGetPlacementGroups([mockPlacementGroup]).as('getPlacementGroups');
    mockGetPlacementGroup(mockPlacementGroup).as('getPlacementGroup');

    mockUpdatePlacementGroup(
      mockPlacementGroup.id,
      mockPlacementGroupUpdated.label
    ).as('updatePlacementGroupLabel');

    cy.visitWithLogin('/placement-groups');
    cy.wait(['@getPlacementGroups']);

    // Confirm that Placement Group is listed  on landing page, click "Edit" to open drawer.
    cy.findByText(mockPlacementGroup.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Edit').click();
      });

    // Enter new label, click "Edit".
    mockGetPlacementGroups([mockPlacementGroupUpdated]).as(
      'getPlacementGroups'
    );
    cy.get('[data-qa-drawer="true"]').within(() => {
      cy.findByText('Edit').should('be.visible');
      cy.findByDisplayValue(mockPlacementGroup.label)
        .should('be.visible')
        .click();
      cy.focused().type(
        `{selectall}{backspace}${mockPlacementGroupUpdated.label}`
      );

      cy.findByText('Edit').should('be.visible').click();

      cy.wait('@updatePlacementGroupLabel').then((intercept) => {
        expect(intercept.request.body['label']).to.equal(
          mockPlacementGroupUpdated.label
        );
      });
    });

    ui.toast.assertMessage(
      `Placement Group ${mockPlacementGroupUpdated.label} successfully updated.`
    );
  });

  /**
   * - Confirms that an http error is handled gracefully for Placement Group label update.
   * - A new value can be entered into the label field.
   * - Confirms an error notice is shown upon failure to label update.
   */
  it("update to a Placement Group's label fails with error message", () => {
    const mockPlacementGroupCompliantRegion = chooseRegion();

    const mockPlacementGroup = placementGroupFactory.build({
      id: randomNumber(),
      is_compliant: true,
      label: randomLabel(),
      members: [],
      placement_group_policy: 'flexible',
      placement_group_type: 'anti_affinity:local',
      region: mockPlacementGroupCompliantRegion.id,
    });

    const mockPlacementGroupUpdated = {
      ...mockPlacementGroup,
      label: randomLabel(),
    };

    mockGetPlacementGroups([mockPlacementGroup]).as('getPlacementGroups');
    mockGetPlacementGroup(mockPlacementGroup).as('getPlacementGroup');

    mockUpdatePlacementGroupError(
      mockPlacementGroup.id,
      'An unexpected error occurred.',
      400
    ).as('updatePlacementGroupLabelError');

    cy.visitWithLogin('/placement-groups');
    cy.wait(['@getPlacementGroups']);

    // Confirm that Placement Group is listed  on landing page, click "Edit" to open drawer.
    cy.findByText(mockPlacementGroup.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Edit').click();
      });

    // Enter new label, click "Edit".
    cy.get('[data-qa-drawer="true"]').within(() => {
      cy.findByText('Edit').should('be.visible');
      cy.findByDisplayValue(mockPlacementGroup.label)
        .should('be.visible')
        .click();
      cy.focused().type(
        `{selectall}{backspace}${mockPlacementGroupUpdated.label}`
      );

      cy.findByText('Edit').should('be.visible').click();

      // Confirm error message is displayed in the drawer.
      cy.wait('@updatePlacementGroupLabelError');
      cy.findByText('An unexpected error occurred.').should('be.visible');
    });
  });
});
