import { subnetFactory, vpcFactory } from '@src/factories';
import {
  MOCK_DELETE_VPC_ERROR,
  mockDeleteVPC,
  mockDeleteVPCError,
  mockGetVPCs,
  mockUpdateVPC,
} from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { randomLabel, randomPhrase } from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';

import { VPC_LABEL } from 'src/features/VPCs/constants';

// TODO Remove feature flag mocks when feature flag is removed from codebase.
describe('VPC landing page', () => {
  /*
   * - Confirms that VPCs are listed on the VPC landing page.
   */
  it('lists VPC instances', () => {
    const mockVPCs = vpcFactory.buildList(5, {
      region: chooseRegion().id,
    });
    mockGetVPCs(mockVPCs).as('getVPCs');

    cy.visitWithLogin('/vpcs');
    cy.wait('@getVPCs');

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
    mockGetVPCs([]).as('getVPCs');

    cy.visitWithLogin('/vpcs');
    cy.wait('@getVPCs');

    // Confirm that empty state is shown and that each section is present.
    cy.findByText(VPC_LABEL).should('be.visible');
    cy.findByText('Create a private and isolated network').should('be.visible');
    cy.findByText('Getting Started Guides').should('be.visible');

    // Create button exists and navigates user to create page.
    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/vpcs/create');
  });

  /*
   * - Confirms that VPCs can be updated from the VPC landing page.
   * - Confirms that VPC landing page updates to reflected update VPC data.
   * - Confirms VPC deletion flow from landing page using mocked data and API responses.
   * - Confirms landing page automatically updates to reflect deleted VPCs.
   * - Confirms landing page reverts to its empty state when last VPC is deleted.
   */
  it('can update and delete VPCs from VPC landing page', () => {
    const mockVPCs = [
      vpcFactory.build({
        description: randomPhrase(),
        label: randomLabel(),
        region: chooseRegion().id,
      }),
      vpcFactory.build({
        description: randomPhrase(),
        label: randomLabel(),
        region: chooseRegion().id,
      }),
    ];

    const mockUpdatedVPC = {
      ...mockVPCs[1],
      description: randomPhrase(),
      label: randomLabel(),
    };

    mockGetVPCs([mockVPCs[1]]).as('getVPCs');
    mockUpdateVPC(mockVPCs[1].id, mockUpdatedVPC).as('updateVPC');

    cy.visitWithLogin('/vpcs');
    cy.wait('@getVPCs');

    // Find mocked VPC and click its "Edit" button.
    cy.findByText(mockVPCs[1].label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button.findByTitle('Edit').should('be.visible').click();
      });

    // Confirm correct information is shown and update label and description.
    mockGetVPCs([mockUpdatedVPC]).as('getVPCs');
    ui.drawer
      .findByTitle('Edit VPC')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label')
          .should('be.visible')
          .should('have.value', mockVPCs[1].label)
          .clear();
        cy.focused().type(mockUpdatedVPC.label);

        cy.findByLabelText('Description')
          .should('be.visible')
          .should('have.value', mockVPCs[1].description)
          .clear();
        cy.focused().type(mockUpdatedVPC.description);

        // TODO Add interactions/assertions for region selection once feature is available.
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that updated VPC information is shown on the landing page and
    // in the "Edit" drawer.
    cy.wait(['@updateVPC', '@getVPCs']);
    cy.findByText(mockVPCs[1].label).should('not.exist');
    cy.findByText(mockUpdatedVPC.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button.findByTitle('Edit').should('be.visible').click();
      });

    ui.drawer
      .findByTitle('Edit VPC')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label')
          .should('be.visible')
          .should('have.value', mockUpdatedVPC.label);

        cy.findByLabelText('Description')
          .should('be.visible')
          .should('have.value', mockUpdatedVPC.description);
      });

    // Delete VPCs Flow
    mockGetVPCs(mockVPCs).as('getVPCs');
    mockDeleteVPC(mockVPCs[0].id).as('deleteVPC');

    cy.visitWithLogin('/vpcs');
    cy.wait('@getVPCs');

    // Delete the first VPC instance
    cy.findByText(mockVPCs[0].label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // Complete type-to-confirm dialog.
    ui.dialog
      .findByTitle(`Delete VPC ${mockVPCs[0].label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('VPC Label').should('be.visible').click();
        cy.focused().type(mockVPCs[0].label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // Confirm that toast notification appears and VPC is removed from landing page.
    cy.wait(['@deleteVPC', '@getVPCs']);
    ui.toast.assertMessage('VPC deleted successfully.');
    cy.findByText(mockVPCs[0].label).should('not.exist');

    // Delete the second VPC instance
    mockDeleteVPC(mockVPCs[1].id).as('deleteVPC');
    mockGetVPCs([]).as('getVPCs');
    cy.findByText(mockVPCs[1].label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // Complete type-to-confirm dialog.
    ui.dialog
      .findByTitle(`Delete VPC ${mockVPCs[1].label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('VPC Label').should('be.visible').click();
        cy.focused().type(mockVPCs[1].label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // Confirm that toast notification appears and VPC is removed from landing page.
    cy.wait(['@deleteVPC', '@getVPCs']);
    ui.toast.assertMessage('VPC deleted successfully.');
    cy.findByText(mockVPCs[1].label).should('not.exist');

    // Confirm that landing page reverts to its empty state.
    cy.findByText('Create a private and isolated network').should('be.visible');
  });

  /**
   * Confirms UI handles errors gracefully when attempting to delete a VPC
   */
  it('cannot delete a VPC with linodes assigned to it', () => {
    const subnet = subnetFactory.build();
    const mockVPCs = [
      vpcFactory.build({
        label: randomLabel(),
        region: chooseRegion().id,
        subnets: [subnet],
      }),
      vpcFactory.build({
        label: randomLabel(),
        region: chooseRegion().id,
      }),
    ];

    mockGetVPCs(mockVPCs).as('getVPCs');
    mockDeleteVPCError(mockVPCs[0].id).as('deleteVPCError');

    cy.visitWithLogin('/vpcs');
    cy.wait('@getVPCs');

    // Try to delete VPC
    cy.findByText(mockVPCs[0].label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Complete type-to-confirm dialog.
    ui.dialog
      .findByTitle(`Delete VPC ${mockVPCs[0].label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('VPC Label').should('be.visible').click();
        cy.focused().type(mockVPCs[0].label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that VPC doesn't get deleted and that an error appears
    cy.wait(['@deleteVPCError']);
    cy.findByText(MOCK_DELETE_VPC_ERROR).should('be.visible');

    // close Delete dialog for this VPC and open it up for the second VPC to confirm that error message does not persist
    ui.dialog
      .findByTitle(`Delete VPC ${mockVPCs[0].label}`)
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByText(mockVPCs[1].label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByText(MOCK_DELETE_VPC_ERROR).should('not.exist');
  });
});
