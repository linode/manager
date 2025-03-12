import { regionFactory } from '@linode/utilities';
import {
  mockGetCustomImages,
  mockGetImage,
  mockGetRecoveryImages,
  mockUpdateImageRegions,
} from 'support/intercepts/images';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { extendRegion } from 'support/util/regions';

import { imageFactory } from 'src/factories';

import type { Image, Region } from '@linode/api-v4';

describe('Manage Image Replicas', () => {
  /**
   * Adds two new regions to an Image (region3 and region4)
   * and removes one existing region (region 1).
   */
  it("updates an Image's regions", () => {
    const regionOptions: Partial<Region> = {
      capabilities: ['Object Storage'],
      site_type: 'core',
    };
    const region1 = extendRegion(regionFactory.build(regionOptions));
    const region2 = extendRegion(regionFactory.build(regionOptions));
    const region3 = extendRegion(regionFactory.build(regionOptions));
    const region4 = extendRegion(regionFactory.build(regionOptions));

    const image = imageFactory.build({
      size: 50,
      total_size: 100,
      capabilities: ['distributed-sites'],
      regions: [
        { region: region1.id, status: 'available' },
        { region: region2.id, status: 'available' },
      ],
    });

    mockGetRegions([region1, region2, region3, region4]).as('getRegions');
    mockGetCustomImages([image]).as('getImages');
    mockGetRecoveryImages([]);
    mockGetImage(image.id, image).as('getImage');

    cy.visitWithLogin('/images');
    cy.wait(['@getImages', '@getRegions']);

    cy.findByText(image.label)
      .closest('tr')
      .within(() => {
        // Verify total size is rendered
        cy.findByText(`0.1 GB`).should('be.visible'); // 100 / 1024 = 0.09765

        // Verify the number of regions is rendered and click it
        cy.findByText(`${image.regions.length} Regions`)
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@getImage');

    // Verify the Manage Replicas drawer opens and contains basic content
    ui.drawer
      .findByTitle(`Manage Replicas for ${image.label}`)
      .should('be.visible')
      .within(() => {
        // Verify the Image regions render
        cy.findByText(region1.label).should('be.visible');
        cy.findByText(region2.label).should('be.visible');

        cy.findByText('Image will be replicated in these regions (2)').should(
          'be.visible'
        );

        // Verify the "Save" button is disabled because no changes have been made
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.disabled');

        // Close the Manage Replicas drawer
        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByText(image.label)
      .closest('tr')
      .within(() => {
        // Open the Image's action menu
        ui.actionMenu
          .findByTitle(`Action menu for Image ${image.label}`)
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Click "Manage Replicas" option in the action menu
    ui.actionMenuItem
      .findByTitle('Manage Replicas')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Open the Regions Multi-Select
    cy.findByLabelText('Add Regions')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify "Select All" shows up as an option
    ui.autocompletePopper
      .findByTitle('Select All')
      .should('be.visible')
      .should('be.enabled');

    // Verify region3 shows up as an option and select it
    ui.autocompletePopper
      .findByTitle(`${region3.label} (${region3.id})`)
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify region4 shows up as an option and select it
    ui.autocompletePopper
      .findByTitle(`${region4.label} (${region4.id})`)
      .should('be.visible')
      .should('be.enabled')
      .click();

    const updatedImage: Image = {
      ...image,
      regions: [
        { region: region2.id, status: 'available' },
        { region: region3.id, status: 'pending replication' },
        { region: region4.id, status: 'pending replication' },
      ],
      total_size: 150,
    };

    // mock the POST /v4/images/:id:regions response
    mockUpdateImageRegions(image.id, updatedImage);

    // mock the updated paginated response
    mockGetCustomImages([updatedImage]);

    // Click outside of the Region Multi-Select to close the popover
    ui.drawer
      .findByTitle(`Manage Replicas for ${image.label}`)
      .click()
      .within(() => {
        // Verify the existing image regions render
        cy.findByText(region1.label).should('be.visible');
        cy.findByText(region2.label).should('be.visible');

        // Verify the newly selected image regions render
        cy.findByText(region3.label).should('be.visible');
        cy.findByText(region4.label).should('be.visible');
        cy.findAllByText('unsaved').should('be.visible');

        // Verify the count is now 3
        cy.findByText('Image will be replicated in these regions (4)').should(
          'be.visible'
        );

        // Verify the "Save" button is enabled because a new region is selected
        ui.button.findByTitle('Save').should('be.visible').should('be.enabled');

        // Remove region1
        cy.findByLabelText(`Remove ${region1.id}`)
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Verify the image isn't shown in the list after being removed
        cy.findByText(region1.label).should('not.exist');

        // Verify the count is now 3
        cy.findByText('Image will be replicated in these regions (3)').should(
          'be.visible'
        );

        // Save changes
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.toast.assertMessage(`${image.label}'s regions successfully updated.`);

    cy.findByText(image.label)
      .closest('tr')
      .within(() => {
        // Verify the new size is shown
        cy.findByText('0.15 GB'); // 150 / 2014 = 0.1464

        // Verify the new number of regions is shown and click it
        cy.findByText(`${updatedImage.regions.length} Regions`)
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.drawer
      .findByTitle(`Manage Replicas for ${image.label}`)
      .click()
      .within(() => {
        // "Unsaved" regions should transition to "pending replication" because
        // they are now returned by the API
        cy.findAllByText('pending replication').should('be.visible');

        // The save button should be disabled
        ui.button.findByTitle('Save').should('be.disabled');

        cy.findByLabelText('Close drawer').click();
      });
  });
});
