/**
 * @file Cypress integration tests for OBJ enrollment and cancellation.
 */

import type {
  AccountSettings,
  ObjectStorageCluster,
  ObjectStorageClusterID,
  Region,
} from '@linode/api-v4';
import {
  accountSettingsFactory,
  objectStorageClusterFactory,
  profileFactory,
  regionFactory,
  objectStorageKeyFactory,
  accountFactory,
} from '@src/factories';
import {
  mockGetAccount,
  mockGetAccountSettings,
} from 'support/intercepts/account';
import {
  mockCancelObjectStorage,
  mockCreateAccessKey,
  mockGetBuckets,
  mockGetClusters,
} from 'support/intercepts/object-storage';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetAccessKeys } from 'support/intercepts/object-storage';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';

// Various messages, notes, and warnings that may be shown when enabling Object Storage
// under different circumstances.
const objNotes = {
  // When enabling OBJ, in both the Access Key flow and Create Bucket flow, when OBJ DC-specific pricing is enabled.
  objDCPricing:
    'Object Storage costs a flat rate of $5/month, and includes 250 GB of storage. When you enable Object Storage, 1 TB of outbound data transfer will be added to your global network transfer pool.',

  // Link to further DC-specific pricing information.
  dcPricingLearnMoreNote: 'Learn more about pricing and specifications.',

  // Information regarding the Object Storage cancellation process.
  cancellationExplanation: /To discontinue billing, you.*ll need to cancel Object Storage in your Account Settings./,
};

describe('Object Storage enrollment', () => {
  /*
   * - Confirms that Object Storage can be enabled using mock API data.
   * - Confirms that pricing information link is present in enrollment dialog.
   * - Confirms that cancellation explanation is present in enrollment dialog.
   * - Confirms that DC-specific overage pricing is explained for regions in the Create Bucket drawer.
   * - Confirms that consistent pricing information is shown for all regions in the enable modal.
   */
  it('can enroll in Object Storage', () => {
    mockGetAccount(accountFactory.build({ capabilities: ['Object Storage'] }));
    mockAppendFeatureFlags({
      objMultiCluster: false,
      objectStorageGen2: { enabled: false },
    });

    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
      object_storage: 'disabled',
    });

    const mockAccountSettingsEnabled: AccountSettings = {
      ...mockAccountSettings,
      object_storage: 'active',
    };

    const mockRegions: Region[] = [
      regionFactory.build({
        capabilities: ['Object Storage'],
        label: 'Newark, NJ',
        id: 'us-east',
      }),
      regionFactory.build({
        capabilities: ['Object Storage'],
        label: 'Sao Paulo, BR',
        id: 'br-gru',
      }),
      regionFactory.build({
        capabilities: ['Object Storage'],
        label: 'Jakarta, ID',
        id: 'id-cgk',
      }),
    ];

    // Clusters with special pricing are currently hardcoded rather than
    // retrieved via API, so we have to mock the cluster API request to correspond
    // with that hardcoded data.
    //
    // Because the IDs used in the mocks don't correspond with any actual clusters,
    // we have to cast them as `ObjectStorageClusterID` to satisfy TypeScript.
    const mockClusters: ObjectStorageCluster[] = [
      // Regions with special pricing.
      objectStorageClusterFactory.build({
        id: 'br-gru-0' as ObjectStorageClusterID,
        region: 'br-gru',
      }),
      objectStorageClusterFactory.build({
        id: 'id-cgk-1' as ObjectStorageClusterID,
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

    mockGetAccountSettings(mockAccountSettings).as('getAccountSettings');
    mockGetClusters(mockClusters).as('getClusters');
    mockGetBuckets([]).as('getBuckets');
    mockGetRegions(mockRegions).as('getRegions');
    mockGetAccessKeys([]);

    cy.visitWithLogin('/object-storage/buckets');
    cy.wait([
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
        cy.findByLabelText('Label (required)')
          .should('be.visible')
          .type(randomLabel());

        // Select a region with special pricing structure.
        ui.regionSelect.find().click().type('Jakarta, ID{enter}');

        // Confirm DC-specific overage prices are shown in the drawer.
        cy.contains(
          'For this region, additional storage costs $0.024 per GB.'
        ).should('be.visible');
        cy.contains(
          'Outbound transfer will cost $0.015 per GB if it exceeds the network transfer pool for this region.'
        ).should('be.visible');

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm dialog contents shows the expected information, then cancel.
    ui.dialog
      .findByTitle('Enable Object Storage')
      .should('be.visible')
      .within(() => {
        // Confirm that regular pricing and DC-specific OBJ pricing notes are shown, as well as
        // additional pricing explanation link and cancellation information.
        cy.contains(
          'To create your first bucket, you need to enable Object Storage.'
        );
        cy.contains(objNotes.objDCPricing).should('be.visible');
        cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
        cy.contains(objNotes.cancellationExplanation).should('be.visible');

        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Initiate bucket create flow again, and this time select a region with
    // regular pricing structure.
    ui.drawer.findByTitle('Create Bucket').within(() => {
      // Select a region with regular pricing structure.
      ui.regionSelect.find().click().type('Newark, NJ{enter}');

      // Confirm regular overage prices are shown in the drawer.
      cy.contains(
        'For this region, additional storage costs $0.02 per GB.'
      ).should('be.visible');
      cy.contains(
        'Outbound transfer will cost $0.005 per GB if it exceeds your global network transfer pool.'
      ).should('be.visible');

      ui.buttonGroup
        .findButtonByTitle('Create Bucket')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    ui.dialog
      .findByTitle('Enable Object Storage')
      .should('be.visible')
      .within(() => {
        // Confirm that regular pricing information is shown, as well as
        // additional pricing explanation link and cancellation information.
        cy.contains(objNotes.objDCPricing).should('be.visible');
        cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
        cy.contains(objNotes.cancellationExplanation).should('be.visible');

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
      .findByTitle('Enable Object Storage')
      .should('be.visible')
      .within(() => {
        // Confirm that DC-specific generic pricing notes are shown, as well as
        // additional pricing explanation link and cancellation information.
        cy.contains(
          'To create your first access key, you need to enable Object Storage.'
        );
        cy.contains(objNotes.objDCPricing).should('be.visible');
        cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
        cy.contains(objNotes.cancellationExplanation).should('be.visible');

        // Click "Enable Object Storage".
        ui.button
          .findByAttribute('data-qa-enable-obj', 'true')
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

    cy.findByText('Enable Object Storage').should('not.exist');
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

    ui.toast.assertMessage('Object Storage successfully canceled.');

    // Confirm that settings page updates to reflect that Object Storage is disabled.
    cy.contains(getStartedNote).should('be.visible');
  });
});
