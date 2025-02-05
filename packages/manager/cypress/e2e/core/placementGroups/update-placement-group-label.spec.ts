/**
 * @file Integration tests for Placement Group update label flows.
 */

import { randomLabel, randomNumber } from 'support/util/random';
import {
  mockGetPlacementGroup,
  mockGetPlacementGroups,
  mockUpdatePlacementGroup,
  mockUpdatePlacementGroupError,
} from 'support/intercepts/placement-groups';
import { accountFactory, placementGroupFactory } from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { chooseRegion } from 'support/util/regions';
import { ui } from 'support/ui';

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
      label: randomLabel(),
      region: mockPlacementGroupCompliantRegion.id,
      placement_group_type: 'anti_affinity:local',
      is_compliant: true,
      placement_group_policy: 'flexible',
      members: [],
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
        .click()
        .type(`{selectall}{backspace}${mockPlacementGroupUpdated.label}`);

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
      label: randomLabel(),
      region: mockPlacementGroupCompliantRegion.id,
      placement_group_type: 'anti_affinity:local',
      is_compliant: true,
      placement_group_policy: 'flexible',
      members: [],
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
        .click()
        .type(`{selectall}{backspace}${mockPlacementGroupUpdated.label}`);

      cy.findByText('Edit').should('be.visible').click();

      // Confirm error message is displayed in the drawer.
      cy.wait('@updatePlacementGroupLabelError');
      cy.findByText('An unexpected error occurred.').should('be.visible');
    });
  });
});
