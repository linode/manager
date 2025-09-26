import {
  grantsFactory,
  linodeConfigInterfaceFactory,
  linodeFactory,
  profileFactory,
} from '@linode/utilities';
import {
  databaseConfigurations,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { mockTieredStandardVersions } from 'support/constants/lke';
import { mockGetUser } from 'support/intercepts/account';
import { mockGetLinodeConfigs } from 'support/intercepts/configs';
import {
  mockGetDatabase,
  mockGetDatabaseCredentials,
  mockGetDatabaseTypes,
  mockResetPassword,
} from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetCustomImages,
  mockGetRecoveryImages,
} from 'support/intercepts/images';
import {
  mockGetLinodeDetails,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import {
  mockGetApiEndpoints,
  mockGetCluster,
  mockGetClusterPools,
  mockGetDashboardUrl,
  mockGetTieredKubernetesVersions,
  mockRecycleAllNodes,
  mockUpdateCluster,
} from 'support/intercepts/lke';
import {
  mockFetchLongviewStatus,
  mockGetLongviewClients,
} from 'support/intercepts/longview';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { mockGetVolume, mockGetVolumes } from 'support/intercepts/volumes';
import { ui } from 'support/ui';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountUserFactory,
  databaseFactory,
  imageFactory,
  kubernetesClusterFactory,
  linodeConfigFactory,
  longviewAppsFactory,
  longviewClientFactory,
  longviewResponseFactory,
  nodePoolFactory,
  VLANFactory,
  volumeFactory,
} from 'src/factories';
import { ADMINISTRATOR } from 'src/features/Account/constants';

import type { LongviewClient } from '@linode/api-v4';
import type { DatabaseClusterConfiguration } from 'support/constants/databases';

describe('restricted user details pages', () => {
  beforeEach(() => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_databases: false,
        add_images: false,
        add_kubernetes: false,
        add_linodes: false,
        add_longview: false,
        add_volumes: false,
      },
    });

    mockGetProfile(mockProfile).as('getProfile');
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);

    // Mock the APL feature flag to be disabled.
    mockAppendFeatureFlags({
      apl: false,
      dbaasV2: { beta: false, enabled: false },
      // TODO M3-10491 - Remove `iamRbacPrimaryNavChanges` feature flag mock once flag is deleted.
      iamRbacPrimaryNavChanges: true,
    });
  });

  it("should disable action elements and buttons in the 'Linodes' details page", () => {
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes', 'Vlans'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
      status: 'offline',
    });
    const mockVolume = volumeFactory.build();
    const mockPublicConfigInterface = linodeConfigInterfaceFactory.build({
      ipam_address: null,
      purpose: 'public',
    });
    const mockConfig = linodeConfigFactory.build({
      id: randomNumber(),
      interfaces: [
        // The order of this array is significant. Index 0 (eth0) should be public.
        mockPublicConfigInterface,
      ],
    });
    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });

    mockGetVLANs([mockVlan]);
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeVolumes(mockLinode.id, [mockVolume]).as('getLinodeVolumes');
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
    cy.visitWithLogin(`/linodes/${mockLinode.id}`);

    cy.wait(['@getProfile', '@getLinode']);

    // Confirm that a warning message is displayed
    cy.findByText(
      `You don't have permissions to edit this Linode. Please contact your ${ADMINISTRATOR} to request the necessary permissions.`
    );

    // Confirm that the buttons in the action menu are disabled
    ui.actionMenu
      .findByTitle(`Action menu for Linode ${mockLinode.label}`)
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Check all action menu items are disabled
    [
      'Power On',
      'Reboot',
      'Launch LISH Console',
      'Clone',
      'Resize',
      'Rebuild',
      'Rescue',
      'Migrate',
      'Delete',
    ].forEach((menuItem: string) => {
      const tooltipMessage = `You do not have permission to perform this action.`;
      // Find the tooltip icon button and focus it
      ui.actionMenuItem.findByTitle(menuItem).should('be.disabled').focus();
      ui.tooltip.findByText(tooltipMessage);
    });
    cy.reload();

    // Confirm that "Add A Tag" button is disabled and
    // the tooltip is visible with warning message
    ui.button
      .findByTitle('Add a tag')
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');
    ui.tooltip.findByText(
      'You must be an unrestricted User in order to add or modify tags on a Linode.'
    );
  });

  it("should disable action elements and buttons in the 'Images' details page", () => {
    const imageEOLDate = new Date();
    imageEOLDate.setFullYear(imageEOLDate.getFullYear() + 1);
    const mockCustomImage = imageFactory.build({
      eol: imageEOLDate.toISOString(),
      label: randomLabel(),
      type: 'manual',
    });
    const mockRecoveryImage = imageFactory.build({
      eol: imageEOLDate.toISOString(),
      label: randomLabel(),
      type: 'automatic',
    });
    const disabledActions = ['Edit', 'Deploy to New Linode', 'Delete'];
    const enabledActions = ['Rebuild an Existing Linode'];
    const actionsMap: { [id: string]: string } = {
      Delete: 'delete this Image',
      'Deploy to New Linode': 'create Linodes',
      Edit: 'edit this Image',
      'Rebuild an Existing Linode': 'rebuild Linodes',
    };

    // Mock setup to display the Image landing page in a non-empty state
    mockGetCustomImages([mockCustomImage]).as('getCustomImages');
    mockGetRecoveryImages([mockRecoveryImage]).as('getRecoveryImages');

    cy.visitWithLogin(`/images`);
    cy.wait(['@getCustomImages', '@getProfile', '@getRecoveryImages']);

    // Confirm that the "Create Image" button is visible and disabled
    ui.button
      .findByTitle('Create Image')
      .should('be.visible')
      .should('be.disabled')
      .trigger('mouseover');
    ui.tooltip.findByText(
      `You don't have permissions to create Images. Please contact your ${ADMINISTRATOR} to request the necessary permissions.`
    );

    // Confirm that action menu items of each image are disabled in "Custom Images" table
    cy.get(`[id="action-menu-for-image-${mockCustomImage.label}-button"]`)
      .first()
      .should('be.visible')
      .should('be.enabled')
      .click();
    enabledActions.forEach((menuItem: string) => {
      ui.actionMenuItem.findByTitle(menuItem).should('not.be.disabled');
    });
    disabledActions.forEach((menuItem: string) => {
      const tooltipMessage = `You don't have permissions to ${actionsMap[menuItem]}. Please contact your ${ADMINISTRATOR} to request the necessary permissions.`;

      ui.actionMenuItem.findByTitle(menuItem).should('be.disabled');
      ui.button
        .findByAttribute('aria-label', tooltipMessage)
        .trigger('mouseover');
      ui.tooltip.findByText(tooltipMessage);
    });

    cy.reload();

    // Confirm that action menu items of each image are disabled in "Recovery Images" table
    cy.get(`[id="action-menu-for-image-${mockRecoveryImage.label}-button"]`)
      .first()
      .should('be.visible')
      .should('be.enabled')
      .click();
    enabledActions.forEach((menuItem: string) => {
      ui.actionMenuItem.findByTitle(menuItem).should('not.be.disabled');
    });
    disabledActions.forEach((menuItem: string) => {
      const tooltipMessage = `You don't have permissions to ${actionsMap[menuItem]}. Please contact your ${ADMINISTRATOR} to request the necessary permissions.`;

      ui.actionMenuItem.findByTitle(menuItem).should('be.disabled');
      ui.button
        .findByAttribute('aria-label', tooltipMessage)
        .trigger('mouseover');
      ui.tooltip.findByText(tooltipMessage);
    });
  });

  it("should disable action elements and buttons in the 'Volumes' details page", () => {
    const mockVolume = volumeFactory.build();

    mockGetVolumes([mockVolume]).as('getVolumes');
    mockGetVolume(mockVolume).as('getVolume');

    cy.visitWithLogin('/volumes');

    cy.wait(['@getProfile', '@getVolumes']);

    // Confirm that the "Create Volume" button is disabled
    ui.button
      .findByTitle('Create Volume')
      .should('be.visible')
      .should('be.disabled')
      .trigger('mouseover');
    ui.tooltip.findByText(
      `You don't have permissions to create Volumes. Please contact your ${ADMINISTRATOR} to request the necessary permissions.`
    );
    cy.reload();

    // Confirm that restricted users are not allowed to upgrade the volume type
    cy.findByText('UPGRADE TO NVMe').should('not.exist');

    // Confirm that the buttons in the action menu are disabled
    ui.actionMenu
      .findByTitle(`Action menu for Volume ${mockVolume.label}`)
      .should('be.visible')
      .should('be.enabled')
      .click();
    [
      'Show Config',
      'Edit',
      'Manage Tags',
      'Resize',
      'Clone',
      'Attach',
      'Delete',
    ].forEach((menuItem: string) => {
      if (menuItem === 'Show Config') {
        ui.actionMenuItem.findByTitle(menuItem).should('not.be.disabled');
      } else {
        ui.actionMenuItem.findByTitle(menuItem).should('be.disabled');
        // Optionally check tooltip for disabled items

        const tooltipMessage = `You don't have permissions to ${menuItem === 'Manage Tags' ? 'edit' : menuItem.toLocaleLowerCase()} this Volume. Please contact your ${ADMINISTRATOR} to request the necessary permissions.`;
        ui.button
          .findByAttribute('aria-label', tooltipMessage)
          .first()
          .trigger('mouseover');
        ui.tooltip.findByText(tooltipMessage);
      }
    });
  });

  databaseConfigurations.forEach(
    (configuration: DatabaseClusterConfiguration) => {
      describe(`updates a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        it('should disable action elements and buttons in the "Databases" details page', () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const initialPassword = randomString(16);
          const database = databaseFactory.build({
            allow_list: [allowedIp],
            engine: configuration.dbType,
            id: randomNumber(1, 1000),
            label: initialLabel,
            platform: 'rdbms-legacy',
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
          });

          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockResetPassword(database.id, database.engine).as(
            'resetRootPassword'
          );
          mockGetDatabaseCredentials(
            database.id,
            database.engine,
            initialPassword
          ).as('getCredentials');

          cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
          cy.wait(['@getProfile', '@getDatabase', '@getDatabaseTypes']);

          // Confirm that a warning message is displayed
          cy.findByText(
            `You don't have permissions to modify this Database. Please contact an ${ADMINISTRATOR} for details.`
          ).should('be.visible');

          // Confirm that "Manage Access" button is not present
          cy.get('[data-testid="button-access-control"]').should('not.exist');

          // Confirm that "Remove" button is not present
          cy.findByTitle('Remove').should('not.exist');

          // Navigate to "Resize" tab
          ui.tabList.findTabByTitle('Resize').click();

          // Confirm that "Resize Database Cluster" button is disabled
          ui.cdsButton
            .findButtonByTitle('Resize Database Cluster')
            .should('be.visible')
            .should('be.disabled');

          // Navigate to "Settings" tab
          ui.tabList.findTabByTitle('Settings').click();

          // Confirm that "Manage Access" button is disabled
          cy.get('[data-testid="button-access-control"]').within(() => {
            ui.cdsButton
              .findButtonByTitle('Manage Access')
              .should('be.visible')
              .should('be.disabled');
          });

          // Confirm that "Remove" button is disabled
          ui.button
            .findByTitle('Remove')
            .should('be.visible')
            .should('be.disabled');

          // Confirm that "Reset Root Password" button is disabled
          ui.cdsButton
            .findButtonByTitle('Reset Root Password')
            .should('be.visible')
            .should('be.disabled');

          // Confirm that "Delete Cluster" button is disabled
          ui.cdsButton
            .findButtonByTitle('Delete Cluster')
            .should('be.visible')
            .should('be.disabled');

          // Confirm that "Save Changes" button is disabled
          ui.cdsButton
            .findButtonByTitle('Save Changes')
            .should('be.visible')
            .should('be.disabled');
        });
      });
    }
  );

  it.skip("should disable action elements and buttons in the 'Kubernetes' details page", () => {
    // TODO: M3-9585 Not working for kubernets. Skip this test for now.
    const oldVersion = mockTieredStandardVersions[0].id;
    const newVersion = mockTieredStandardVersions[1].id;

    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: oldVersion,
    });

    const mockClusterUpdated = {
      ...mockCluster,
      k8s_version: newVersion,
    };

    const upgradePrompt = 'A new version of Kubernetes is available (1.26).';

    const upgradeNotes = [
      'This upgrades the control plane on your cluster and ensures that any new worker nodes are created using the newer Kubernetes version.',
      // Confirm that the old version and new version are both shown.
      oldVersion,
      newVersion,
    ];

    const mockNodePools = nodePoolFactory.buildList(2);

    mockGetCluster(mockCluster).as('getCluster');
    mockGetTieredKubernetesVersions('standard', mockTieredStandardVersions);
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockUpdateCluster(mockCluster.id, mockClusterUpdated).as('updateCluster');
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getProfile', '@getCluster']);

    // Confirm that upgrade prompt is shown.
    cy.findByText(upgradePrompt).should('be.visible');
    ui.button
      .findByTitle('Upgrade Version')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle(
        `Upgrade Kubernetes version to ${newVersion} on ${mockCluster.label}?`
      )
      .should('be.visible')
      .within(() => {
        upgradeNotes.forEach((note: string) => {
          cy.findAllByText(note, { exact: false }).should('be.visible');
        });

        ui.button
          .findByTitle('Upgrade Version')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for API response and assert toast message is shown.
    cy.wait('@updateCluster');

    // Verify the banner goes away because the version update has happened
    cy.findByText(upgradePrompt).should('not.exist');

    mockRecycleAllNodes(mockCluster.id).as('recycleAllNodes');

    const stepTwoDialogTitle = 'Upgrade complete';

    ui.dialog
      .findByTitle(stepTwoDialogTitle)
      .should('be.visible')
      .within(() => {
        cy.findByText(
          'The cluster’s Kubernetes version has been updated successfully',
          {
            exact: false,
          }
        ).should('be.visible');

        cy.findByText(
          'To upgrade your existing worker nodes, you can recycle all nodes (which may have a performance impact) or perform other upgrade methods.',
          { exact: false }
        ).should('be.visible');

        ui.button
          .findByTitle('Recycle All Nodes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Verify clicking the "Recycle All Nodes" makes an API call
    cy.wait('@recycleAllNodes');

    // Verify the upgrade dialog closed
    cy.findByText(stepTwoDialogTitle).should('not.exist');

    // Verify the banner is still gone after the flow
    cy.findByText(upgradePrompt).should('not.exist');

    // Verify the version is correct after the update
    cy.findByText(`Version ${newVersion}`);

    ui.toast.findByMessage('Recycle started successfully.');
  });

  it("should disable action elements and buttons in the 'Longview' details page", () => {
    const longviewLastUpdatedWaiting = longviewResponseFactory.build({
      ACTION: 'lastUpdated',
      DATA: { updated: 0 },
      NOTIFICATIONS: [],
      VERSION: 0.4,
    });

    const longviewGetValuesWaiting = longviewResponseFactory.build({
      ACTION: 'getValues',
      DATA: {},
      NOTIFICATIONS: [],
      VERSION: 0.4,
    });

    const longviewGetLatestValueWaiting = longviewResponseFactory.build({
      ACTION: 'getLatestValue',
      DATA: {},
      NOTIFICATIONS: [],
      VERSION: 0.4,
    });

    const client: LongviewClient = longviewClientFactory.build({
      api_key: '01AE82DD-6F99-44F6-95781512B64FFBC3',
      apps: longviewAppsFactory.build(),
      created: new Date().toISOString(),
      id: 338283,
      install_code: '748632FC-E92B-491F-A29D44019039017C',
      label: 'longview-client-longview338283',
      updated: new Date().toISOString(),
    });

    mockGetLongviewClients([client]).as('getLongviewClients');
    mockFetchLongviewStatus(client, 'lastUpdated', longviewLastUpdatedWaiting);
    mockFetchLongviewStatus(client, 'getValues', longviewGetValuesWaiting);
    mockFetchLongviewStatus(
      client,
      'getLatestValue',
      longviewGetLatestValueWaiting
    ).as('fetchLongview');

    cy.visitWithLogin('/longview');
    cy.wait(['@getProfile', '@getLongviewClients']);

    // Confirm that the "Add Client" button is disabled
    ui.button
      .findByTitle('Add Client')
      .should('be.visible')
      .should('be.disabled')
      .trigger('mouseover');
    ui.tooltip.findByText(
      `You don't have permissions to create Longview Clients. Please contact your ${ADMINISTRATOR} to request the necessary permissions.`
    );
  });
});
