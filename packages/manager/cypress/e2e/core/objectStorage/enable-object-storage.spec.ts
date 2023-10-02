/**
 * @file Cypress integration tests for OBJ enrollment and cancellation.
 */

import type { Region } from '@linode/api-v4';
import {
  accountSettingsFactory,
  objectStorageClusterFactory,
  profileFactory,
  regionFactory,
  objectStorageKeyFactory,
} from '@src/factories';
import { mockGetAccountSettings } from 'support/intercepts/account';
import {
  mockCancelObjectStorage,
  mockCreateAccessKey,
  mockGetBuckets,
  mockGetClusters,
} from 'support/intercepts/object-storage';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetAccessKeys } from 'support/intercepts/object-storage';

// Various messages, notes, and warnings that may be shown when enabling Object Storage
// under different circumstances.
const objNotes = {
  // When enabling OBJ using a region with a regular pricing structure, or when
  // DC-specific pricing is disabled.
  regularPricing:
    "Linode Object Storage costs a flat rate of $5/month, and includes 250 GB of storage and 1 TB of outbound data transfer. Beyond that, it's $0.02 per GB per month.",

  // When enabling OBJ using a region with special pricing during the free beta period.
  dcSpecificBetaPricing: /Object Storage for .* is currently in beta\. During the beta period, Object Storage in these regions is free\. After the beta period, customers will be notified before charges for this service begin./,

  // When enabling OBJ without having selected a region.
  dcPricingGenericExplanation:
    'Pricing for monthly rate and overage costs will depend on the data center you select for deployment.',

  // Link to further DC-specific pricing information when DC-specific pricing is enabled.
  dcPricingLearnMoreNote: 'Learn more about pricing and specifications.',

  // Information regarding the Object Storage cancellation process.
  cancellationExplanation:
    "To discontinue billing, you'll need to cancel Object Storage in your Account Settings.",
};

describe('Object Storage enrollment', () => {
  /*
   * - Confirms that Object Storage can be enabled using mock API data.
   * - Confirms that pricing information link is present in enrollment dialog.
   * - Confirms that cancellation explanation is present in enrollment dialog.
   * - Confirms that free beta pricing is explained for regions with special price structures.
   * - Confirms that regular pricing information is shown for regions with regular price structures.
   * - Confirms that generic pricing information is shown when no region is selected.
   */
  it('can enroll in Object Storage', () => {
    // TODO: DC Pricing - M3-7073: Delete feature flag mocks when DC-specific pricing goes live.
    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
      object_storage: 'disabled',
    });

    const mockAccountSettingsEnabled = {
      ...mockAccountSettings,
      object_storage: 'active',
    };

    const mockRegions: Region[] = [
      regionFactory.build({ label: 'Newark, NJ', id: 'us-east' }),
      regionFactory.build({ label: 'Sao Paulo, BR', id: 'br-gru' }),
      regionFactory.build({ label: 'Jakarta, ID', id: 'id-cgk' }),
    ];

    // Clusters with special pricing are currently hardcoded rather than
    // retrieved via API, so we have to mock the cluster API request to correspond
    // with that hardcoded data.
    const mockClusters = [
      // Regions with special pricing.
      objectStorageClusterFactory.build({
        id: 'br-gru-0',
        region: 'br-gru',
      }),
      objectStorageClusterFactory.build({
        id: 'id-cgk-1',
        region: 'id-cgk',
      }),
      // A region that does not have special pricing.
      objectStorageClusterFactory.build({
        id: 'us-east-1',
        region: 'us-east',
      }),
    ];

    const mockAccessKey = objectStorageKeyFactory.build({
      label: randomLabel(),
    });

    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetAccountSettings(mockAccountSettings).as('getAccountSettings');
    mockGetClusters(mockClusters).as('getClusters');
    mockGetBuckets([]).as('getBuckets');
    mockGetRegions(mockRegions).as('getRegions');
    mockGetAccessKeys([]);

    cy.visitWithLogin('/object-storage/buckets');
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getAccountSettings',
      '@getClusters',
      '@getBuckets',
      '@getRegions',
    ]);

    // Confirm that empty-state message is shown before proceeding.
    cy.findByText('S3-compatible storage solution').should('be.visible');

    // Click create button, select a region with special pricing, and submit.
    ui.button
      .findByTitle('Create Bucket')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        // Select a region with special pricing structure.
        cy.findByText('Region').click().type('Jakarta, ID{enter}');

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm dialog contents shows the expected information for regions
    // with special pricing during beta period, then cancel.
    ui.dialog
      .findByTitle('Just to confirm...')
      .should('be.visible')
      .within(() => {
        // Confirm that DC-specific beta pricing notes are shown, as well as
        // additional pricing explanation link and cancellation information.
        cy.contains(objNotes.dcSpecificBetaPricing).should('be.visible');
        cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
        cy.contains(objNotes.cancellationExplanation).should('be.visible');

        // Confirm that regular pricing information is not shown.
        cy.contains(objNotes.regularPricing).should('not.exist');

        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Initiate bucket create flow again, and this time select a region with
    // regular pricing structure.
    ui.drawer.findByTitle('Create Bucket').within(() => {
      // Select a region with special pricing structure.
      cy.findByText('Region').click().type('Newark, NJ{enter}');

      ui.buttonGroup
        .findButtonByTitle('Create Bucket')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    ui.dialog
      .findByTitle('Just to confirm...')
      .should('be.visible')
      .within(() => {
        // Confirm that regular pricing information is shown, as well as
        // additional pricing explanation link and cancellation information.
        cy.contains(objNotes.regularPricing).should('be.visible');
        cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
        cy.contains(objNotes.cancellationExplanation).should('be.visible');

        // Confirm that DC-specific beta pricing information is not shown.
        cy.contains(objNotes.dcSpecificBetaPricing).should('not.exist');

        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Close the "Create Bucket" drawer, and navigate to the "Access Keys" tab.
    ui.drawer.findByTitle('Create Bucket').within(() => {
      ui.drawerCloseButton.find().should('be.visible').click();
    });

    ui.tabList.findTabByTitle('Access Keys').should('be.visible').click();

    ui.button
      .findByTitle('Create Access Key')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out "Create Access Key" form, then submit.
    ui.drawer
      .findByTitle('Create Access Key')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label')
          .should('be.visible')
          .type(mockAccessKey.label);

        ui.buttonGroup
          .findButtonByTitle('Create Access Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm dialog contents shows the expected information.
    mockCreateAccessKey(mockAccessKey).as('createAccessKey');
    mockGetAccessKeys([mockAccessKey]).as('getAccessKey');
    mockGetAccountSettings(mockAccountSettingsEnabled).as('getAccountSettings');
    ui.dialog
      .findByTitle('Just to confirm...')
      .should('be.visible')
      .within(() => {
        // Confirm that DC-specific generic pricing notes are shown, as well as
        // additional pricing explanation link and cancellation information.
        cy.contains(objNotes.dcPricingGenericExplanation).should('be.visible');
        cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
        cy.contains(objNotes.cancellationExplanation).should('be.visible');

        // Confirm that regular pricing information and DC-specific beta pricing
        // information is not shown.
        cy.contains(objNotes.regularPricing).should('not.exist');
        cy.contains(objNotes.dcSpecificBetaPricing).should('not.exist');

        // Click "Enable Object Storage".
        ui.button
          .findByTitle('Enable Object Storage')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@createAccessKey', '@getAccessKey', '@getAccountSettings']);
    cy.findByText(mockAccessKey.label).should('be.visible');

    // Click through the "Access Keys" dialog which displays the new access key.
    ui.dialog
      .findByTitle('Access Keys')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('I Have Saved My Secret Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.button
      .findByTitle('Create Access Key')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out "Create Access Key" form, then submit.
    ui.drawer
      .findByTitle('Create Access Key')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label').should('be.visible').type(randomLabel());

        ui.buttonGroup
          .findButtonByTitle('Create Access Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByText('Just to confirm...').should('not.exist');
  });

  /*
   * - Confirms Object Storage enrollment dialog contents when DC-specific pricing is disabled.
   * - Confirms expected dialog language is shown when enrolling by creating a bucket.
   * - Confirms expected dialog language is shown when enrolling by creating an access key.
   * - Confirms that "Create a Bucket" dialog cannot be submitted without selecting a region.
   */
  it('can enroll in Object Storage without DC-specific pricing', () => {
    // TODO: DC Pricing - M3-7073: Delete this test when DC-specific pricing feature goes live.
    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
      object_storage: 'disabled',
    });

    const mockRegion = regionFactory.build({
      label: 'Newark, NJ',
      id: 'us-east',
    });

    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetAccountSettings(mockAccountSettings).as('getAccountSettings');
    mockGetBuckets([]).as('getBuckets');
    mockGetAccessKeys([]);
    mockGetRegions([mockRegion]).as('getRegions');

    const confirmModalContents = () => {
      // Confirm that pricing and cancellation explanations are present.
      cy.contains(objNotes.regularPricing).should('be.visible');
      cy.contains(objNotes.cancellationExplanation).should('be.visible');

      // Confirm that DC-specific pricing learn more CTA is not present.
      cy.contains(objNotes.dcPricingLearnMoreNote).should('not.exist');
    };

    // Navigate to Object Storage Buckets page and click "Create Bucket".
    cy.visitWithLogin('/object-storage/buckets');
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getAccountSettings',
      '@getBuckets',
      '@getRegions',
    ]);

    ui.button
      .findByTitle('Create Bucket')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        // Confirm that "Create Bucket" button is disabled until region is selected.
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.disabled');

        cy.findByText('Region')
          .should('be.visible')
          .click()
          .type(`Newark, NJ{enter}`);

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm dialog contents, then cancel.
    ui.dialog
      .findByTitle('Just to confirm...')
      .should('be.visible')
      .within(() => {
        // Confirm that pricing and cancellation explanations are present, but
        // DC-specific information is hidden.
        confirmModalContents();

        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Close "Create Bucket" drawer.
    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        ui.drawerCloseButton.find().click();
      });

    // Switch to "Access Keys" tab and create an access key.
    ui.tabList.findTabByTitle('Access Keys').should('be.visible').click();

    ui.button
      .findByTitle('Create Access Key')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out "Create Access Key" form, then submit.
    ui.drawer
      .findByTitle('Create Access Key')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label').should('be.visible').type(randomLabel());

        ui.buttonGroup
          .findButtonByTitle('Create Access Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm dialog contents shows the expected information.
    ui.dialog
      .findByTitle('Just to confirm...')
      .should('be.visible')
      .within(() => {
        // Confirm that pricing and cancellation explanations are present, but
        // DC-specific information is hidden.
        confirmModalContents();
      });
  });

  /*
   * - Confirms that users can cancel Object Storage using mock API data.
   * - Confirms that users are warned of Object Storage cancellation data loss.
   * - Confirms that Account Settings page updates to reflect cancellation.
   */
  it('can cancel Object Storage', () => {
    const mockProfile = profileFactory.build({
      username: randomLabel(),
    });

    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
      object_storage: 'active',
    });

    // Cancellation notice is shown before cancelling OBJ, and the warning is
    // shown in the Type-to-Confirm when proceeding with cancellation.
    const cancellationNotice =
      'Upon cancellation, all Object Storage Access Keys will be revoked, all buckets will be removed, and their objects deleted.';
    const cancellationWarning =
      'Canceling Object Storage will permanently delete all buckets and their objects. Object Storage Access Keys will be revoked.';

    // Shown on the settings page when Object Storage is not enabled.
    const getStartedNote =
      'To get started with Object Storage, create a Bucket or an Access Key.';

    mockGetProfile(mockProfile).as('getProfile');
    mockGetAccountSettings(mockAccountSettings).as('getAccountSettings');
    mockCancelObjectStorage().as('cancelObjectStorage');
    cy.visitWithLogin('/account/settings');
    cy.wait(['@getProfile', '@getAccountSettings']);

    ui.accordion
      .findByTitle('Object Storage')
      .should('be.visible')
      .within(() => {
        // Confirm that the user is informed that cancelling OBJ will delete their buckets and keys.
        cy.contains(cancellationNotice).should('be.visible');
        ui.button
          .findByTitle('Cancel Object Storage')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.dialog
      .findByTitle('Cancel Object Storage')
      .should('be.visible')
      .within(() => {
        // Confirm that the user is once again warned of cancellation consequences.
        cy.contains(cancellationWarning).should('be.visible');
        cy.findByLabelText('Username')
          .should('be.visible')
          .type(mockProfile.username);

        ui.button
          .findByTitle('Confirm Cancellation')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@cancelObjectStorage');

    // Confirm that settings page updates to reflect that Object Storage is disabled.
    cy.contains(getStartedNote).should('be.visible');
  });
});
