import { streamType } from '@linode/api-v4';
import { regionFactory } from '@linode/utilities';
import {
  CREATE_DESTINATION_ERROR_MESSAGE,
  CREATE_STREAM_ERROR_MESSAGE,
  mockAkamaiObjectStorageDestination,
  mockCustomHttpsDestination,
} from 'support/constants/delivery';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateDestination,
  mockCreateStream,
  mockGetDestinations,
  mockTestConnection,
} from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetClusters } from 'support/intercepts/lke';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { logsDestinationForm } from 'support/ui/pages/logs-destination-form';
import { logsStreamForm } from 'support/ui/pages/logs-stream-form';
import { randomLabel } from 'support/util/random';

import { DEFAULT_ERROR_MESSAGE } from 'src/constants';
import { accountFactory, kubernetesClusterFactory } from 'src/factories';

describe('Create Stream', () => {
  const account = accountFactory.build();

  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
        customHttpsEnabled: true,
        bypassAccountCapabilities: true,
      },
    });

    mockGetAccount({
      ...account,
      capabilities: [
        ...account.capabilities,
        'Akamai Cloud Pulse Logs LKE-E Audit',
      ],
    });
  });

  describe('given Audit Logs Stream Type', () => {
    describe('with Akamai Object Storage destination', () => {
      it('creates new destination and creates stream', () => {
        // Mock API responses
        mockGetDestinations([mockAkamaiObjectStorageDestination]);

        // Visit the Create Stream page
        cy.visitWithLogin('/logs/delivery/streams/create');

        const streamName = randomLabel();

        // Give the Name
        logsStreamForm.setLabel(streamName);

        // Select Stream Type
        logsStreamForm.selectStreamType(streamType.AuditLogs);

        // Fill out the Destination form
        logsStreamForm.fillOutNewAkamaiObjectStorageDestination();

        // Test connection button should be enabled
        ui.button
          .findByTitle('Test Connection')
          .should('be.enabled')
          .should('have.attr', 'type', 'button');

        // Create Stream button should be disabled initially
        cy.findByRole('button', { name: 'Create Stream' }).should(
          'be.disabled'
        );

        // Test connection with failure
        mockTestConnection(400);
        ui.button.findByTitle('Test Connection').click();

        ui.toast.assertMessage(
          'Delivery connection test failed. Verify your delivery settings and try again.'
        );

        // Create Stream button should remain disabled after failed test
        cy.findByRole('button', { name: 'Create Stream' }).should(
          'be.disabled'
        );

        // Test connection with success
        mockTestConnection(200);
        ui.button.findByTitle('Test Connection').click();

        ui.toast.assertMessage(
          'Delivery connection test completed successfully. Data can now be sent using this configuration.'
        );

        // Create Stream button should now be enabled
        cy.findByRole('button', { name: 'Create Stream' })
          .should('be.enabled')
          .should('have.attr', 'type', 'button');

        // Submit the stream create form - failure in creating destination
        mockCreateDestination({}, 400);
        cy.findByRole('button', { name: 'Create Stream' })
          .should('be.enabled')
          .should('have.attr', 'type', 'button')
          .click();

        ui.toast.assertMessage(DEFAULT_ERROR_MESSAGE);

        // Submit the stream create form - success
        mockCreateDestination(mockAkamaiObjectStorageDestination);
        mockCreateStream({ label: streamName }).as('createStream');

        cy.findByRole('button', { name: 'Create Stream' }).click();
        cy.wait('@createStream')
          .its('request.body')
          .then((body) => {
            expect(body).to.deep.equal({
              label: streamName,
              type: streamType.AuditLogs,
              destinations: [mockAkamaiObjectStorageDestination.id],
              details: null,
            });
          });

        ui.toast.assertMessage(
          `${streamName} created successfully. Stream is being provisioned, which may take up to 45 minutes`
        );
        cy.url().should('endWith', 'streams');
      });

      it('selects existing destination and creates stream', () => {
        // Mock API responses
        mockGetDestinations([mockAkamaiObjectStorageDestination]);

        // Visit the Create Stream page
        cy.visitWithLogin('/logs/delivery/streams/create');

        const streamName = randomLabel();

        // Give the Name
        logsStreamForm.setLabel(streamName);

        // Select Stream Type
        logsStreamForm.selectStreamType(streamType.AuditLogs);

        // Select existing destination
        logsStreamForm.selectExistingDestination(
          mockAkamaiObjectStorageDestination.label
        );

        // Test Connection should be disabled for existing destination
        ui.button
          .findByTitle('Test Connection')
          .should('be.disabled')
          .should('have.attr', 'type', 'button');

        // Create Stream should be enabled
        cy.findByRole('button', { name: 'Create Stream' })
          .should('be.enabled')
          .should('have.attr', 'type', 'button');

        // Submit the stream create form - failure
        mockCreateStream({}, 400).as('createStreamFail');

        cy.findByRole('button', { name: 'Create Stream' }).click();
        cy.wait('@createStreamFail');
        ui.toast.assertMessage(DEFAULT_ERROR_MESSAGE);

        // Submit the stream create form - success
        mockCreateStream({ label: streamName }).as('createStream');

        cy.findByRole('button', { name: 'Create Stream' }).click();
        cy.wait('@createStream')
          .its('request.body')
          .then((body) => {
            expect(body).to.deep.equal({
              label: streamName,
              type: streamType.AuditLogs,
              destinations: [mockAkamaiObjectStorageDestination.id],
              details: null,
            });
          });

        ui.toast.assertMessage(
          `${streamName} created successfully. Stream is being provisioned, which may take up to 45 minutes`
        );
        cy.url().should('endWith', 'streams');
      });
    });

    describe('with Custom HTTPS destination', () => {
      it('creates new destination and creates stream', () => {
        // Mock API responses
        mockGetDestinations([mockCustomHttpsDestination]);

        // Visit the Create Stream page
        cy.visitWithLogin('/logs/delivery/streams/create');

        const streamName = randomLabel();

        // Give the Name
        logsStreamForm.setLabel(streamName);

        // Select Stream Type
        logsStreamForm.selectStreamType(streamType.AuditLogs);

        // Fill out the Custom HTTPS Destination form
        logsStreamForm.fillOutNewCustomHttpsDestination();

        // Test connection button should be enabled
        ui.button
          .findByTitle('Test Connection')
          .should('be.enabled')
          .should('have.attr', 'type', 'button');

        // Create Stream button should be disabled initially
        cy.findByRole('button', { name: 'Create Stream' }).should(
          'be.disabled'
        );

        // Test connection with failure
        mockTestConnection(400);
        ui.button.findByTitle('Test Connection').click();

        ui.toast.assertMessage(
          'Delivery connection test failed. Verify your delivery settings and try again.'
        );

        // Create Stream button should remain disabled after failed test
        cy.findByRole('button', { name: 'Create Stream' }).should(
          'be.disabled'
        );

        // Test connection with success
        mockTestConnection(200);
        ui.button.findByTitle('Test Connection').click();

        ui.toast.assertMessage(
          'Delivery connection test completed successfully. Data can now be sent using this configuration.'
        );

        // Create Stream button should now be enabled
        cy.findByRole('button', { name: 'Create Stream' })
          .should('be.enabled')
          .should('have.attr', 'type', 'button');

        // Submit the stream create form - failure in creating destination
        mockCreateDestination(
          { errors: [{ reason: CREATE_DESTINATION_ERROR_MESSAGE }] },
          500
        );
        cy.findByRole('button', { name: 'Create Stream' })
          .should('be.enabled')
          .should('have.attr', 'type', 'button')
          .click();

        ui.toast.assertMessage(CREATE_DESTINATION_ERROR_MESSAGE);

        // Submit the stream create form - success
        mockCreateDestination(mockCustomHttpsDestination);
        mockCreateStream({ label: streamName }).as('createStream');

        cy.findByRole('button', { name: 'Create Stream' }).click();
        cy.wait('@createStream')
          .its('request.body')
          .then((body) => {
            expect(body).to.deep.equal({
              label: streamName,
              type: streamType.AuditLogs,
              destinations: [mockCustomHttpsDestination.id],
              details: null,
            });
          });

        ui.toast.assertMessage(
          `${streamName} created successfully. Stream is being provisioned, which may take up to 45 minutes`
        );
        cy.url().should('endWith', 'streams');
      });

      it('selects existing destination and creates stream', () => {
        // Mock API responses
        mockGetDestinations([mockCustomHttpsDestination]);

        // Visit the Create Stream page
        cy.visitWithLogin('/logs/delivery/streams/create');

        const streamName = randomLabel();

        // Give the Name
        logsStreamForm.setLabel(streamName);

        // Select Stream Type
        logsStreamForm.selectStreamType(streamType.AuditLogs);

        // Select Custom HTTPS destination type first (dropdown filters by type)
        logsDestinationForm.selectDestinationType('Custom HTTPS');

        // Select existing destination
        logsStreamForm.selectExistingDestination(
          mockCustomHttpsDestination.label
        );

        // Test Connection should be disabled for existing destination
        ui.button
          .findByTitle('Test Connection')
          .should('be.disabled')
          .should('have.attr', 'type', 'button');

        // Create Stream should be enabled
        cy.findByRole('button', { name: 'Create Stream' })
          .should('be.enabled')
          .should('have.attr', 'type', 'button');

        // Submit the stream create form - failure
        mockCreateStream(
          { errors: [{ reason: CREATE_STREAM_ERROR_MESSAGE }] },
          400
        ).as('createStreamFail');

        cy.findByRole('button', { name: 'Create Stream' }).click();
        cy.wait('@createStreamFail');
        ui.toast.assertMessage(CREATE_STREAM_ERROR_MESSAGE);

        // Submit the stream create form - success
        mockCreateStream({ label: streamName }).as('createStream');

        cy.findByRole('button', { name: 'Create Stream' }).click();
        cy.wait('@createStream')
          .its('request.body')
          .then((body) => {
            expect(body).to.deep.equal({
              label: streamName,
              type: streamType.AuditLogs,
              destinations: [mockCustomHttpsDestination.id],
              details: null,
            });
          });

        ui.toast.assertMessage(
          `${streamName} created successfully. Stream is being provisioned, which may take up to 45 minutes`
        );
        cy.url().should('endWith', 'streams');
      });
    });
  });

  describe('given Kubernetes API Audit Logs Stream Type', () => {
    it('selects clusters and creates new stream', () => {
      const regionWithCapabilityAndCluster = regionFactory.build({
        id: 'us-southeast',
        label: 'Atlanta, GA',
        capabilities: ['ACLP Logs Datacenter LKE-E', 'Object Storage'],
      });
      const regionWithCapabilityNoCluster = regionFactory.build({
        id: 'us-chicago',
        label: 'Chicago, IL',
        capabilities: ['ACLP Logs Datacenter LKE-E', 'Object Storage'],
      });
      const regionNoCapabilityWithCluster = regionFactory.build({
        id: 'us-west',
        label: 'Fremont, CA',
        capabilities: ['Object Storage'],
      });

      const cluster1 = kubernetesClusterFactory.build({
        id: 1,
        label: 'cluster-1',
        region: regionWithCapabilityAndCluster.id,
        control_plane: { audit_logs_enabled: true },
      });
      const cluster2 = kubernetesClusterFactory.build({
        id: 2,
        label: 'cluster-2',
        region: regionWithCapabilityAndCluster.id,
        control_plane: { audit_logs_enabled: false },
      });
      const cluster3 = kubernetesClusterFactory.build({
        id: 3,
        label: 'cluster-3',
        region: regionWithCapabilityAndCluster.id,
        control_plane: { audit_logs_enabled: true },
      });
      const clusterNoCap = kubernetesClusterFactory.build({
        id: 4,
        label: 'cluster-4',
        region: regionNoCapabilityWithCluster.id,
        control_plane: { audit_logs_enabled: true },
      });

      // Mock API responses
      mockGetDestinations([mockAkamaiObjectStorageDestination]);
      mockGetRegions([
        regionWithCapabilityAndCluster,
        regionWithCapabilityNoCluster,
        regionNoCapabilityWithCluster,
      ]);
      mockGetClusters([cluster1, cluster2, cluster3, clusterNoCap]);

      // Visit the Create Stream page
      cy.visitWithLogin('/logs/delivery/streams/create');

      const streamName = randomLabel();

      // Give the Name
      logsStreamForm.setLabel(streamName);

      // Select Stream Type
      logsStreamForm.selectStreamType(streamType.LKEAuditLogs);

      // Select existing destination
      logsStreamForm.selectExistingDestination(
        mockAkamaiObjectStorageDestination.label
      );

      // Expect only 'Atlanta, GA' to be in Region Select (has capability and is in clusters)
      ui.regionSelect.find().should('be.visible').click();

      ui.autocompletePopper
        .findByTitle(regionWithCapabilityAndCluster.id, { exact: false })
        .should('be.visible');

      ui.autocompletePopper
        .find()
        .should('not.contain', regionWithCapabilityNoCluster.id);

      ui.autocompletePopper
        .find()
        .should('not.contain', regionNoCapabilityWithCluster.id);

      // Close the dropdown
      ui.regionSelect.find().type('{esc}');

      cy.findByText('Clusters').should('be.visible');
      cy.get('[data-testid="clusters-table"]').should('exist');

      // Expect only cluster-1, cluster-2, cluster-3 to be in table.
      cy.findByText('cluster-1').should('be.visible');
      cy.findByText('cluster-2').should('be.visible');
      cy.findByText('cluster-3').should('be.visible');
      cy.findByText('cluster-4').should('not.exist');

      // Select cluster-1 and cluster-3 individually
      logsStreamForm.findClusterCheckbox('cluster-1').check();

      logsStreamForm.findClusterCheckbox('cluster-1').should('be.checked');
      logsStreamForm.findClusterCheckbox('cluster-3').check();
      logsStreamForm.findClusterCheckbox('cluster-3').should('be.checked');
      cy.findByLabelText('Toggle cluster-2 cluster').should('be.disabled');

      // Unselect cluster-1 and cluster-3 individually
      logsStreamForm.findClusterCheckbox('cluster-1').uncheck();
      logsStreamForm.findClusterCheckbox('cluster-1').should('not.be.checked');
      logsStreamForm.findClusterCheckbox('cluster-3').uncheck();
      logsStreamForm.findClusterCheckbox('cluster-3').should('not.be.checked');

      // Use "Toggle all clusters" to select all eligible clusters
      logsStreamForm.findClusterCheckbox('all').check();

      logsStreamForm.findClusterCheckbox('all').should('be.checked');
      logsStreamForm.findClusterCheckbox('cluster-1').should('be.checked');
      logsStreamForm.findClusterCheckbox('cluster-3').should('be.checked');
      cy.findByLabelText('Toggle cluster-2 cluster').should('be.disabled');

      // TODO: uncomment when "Automatically include all existing and recently configured clusters" feature is available
      // Use "Toggle all clusters" to unselect all eligible clusters
      // logsStreamForm.findClusterCheckbox('all').uncheck();
      // logsStreamForm.findClusterCheckbox('all').should('not.be.checked');
      // logsStreamForm.findClusterCheckbox('cluster-1').should('not.be.checked');
      // logsStreamForm.findClusterCheckbox('cluster-3').should('not.be.checked');

      // Use "Automatically include all existing and recently configured clusters" to select all eligible clusters
      // cy.findByLabelText(
      //   'Automatically include all existing and recently configured clusters.'
      // )
      //   .should('exist')
      //   .should('be.enabled');
      // cy.findByLabelText(
      //   'Automatically include all existing and recently configured clusters.'
      // ).click();
      //
      // logsStreamForm.findClusterCheckbox('all').should('be.disabled');
      // logsStreamForm
      //   .findClusterCheckbox('cluster-1')
      //   .should('be.disabled')
      //   .should('be.checked');
      // logsStreamForm
      //   .findClusterCheckbox('cluster-3')
      //   .should('be.disabled')
      //   .should('be.checked');
      // cy.findByLabelText('Toggle cluster-2 cluster').should('be.disabled');

      // Select existing destination
      logsStreamForm.selectExistingDestination(
        mockAkamaiObjectStorageDestination.label
      );

      // Create Stream should be enabled
      cy.findByRole('button', { name: 'Create Stream' })
        .should('be.enabled')
        .should('have.attr', 'type', 'button');

      // Submit the stream create form - success
      mockCreateStream({ label: streamName }).as('createStream');
      cy.findByRole('button', { name: 'Create Stream' }).click();
      cy.wait('@createStream')
        .its('request.body')
        .then((body) => {
          expect(body).to.deep.equal({
            label: streamName,
            type: streamType.LKEAuditLogs,
            destinations: [mockAkamaiObjectStorageDestination.id],
            details: {
              cluster_ids: [1, 3], // TODO: change to is_auto_add_all_clusters_enabled: true when "Automatically include all existing and recently configured clusters" feature is available
            },
          });
        });

      ui.toast.assertMessage(
        `${streamName} created successfully. Stream is being provisioned, which may take up to 45 minutes`
      );
      cy.url().should('endWith', 'streams');
    });
  });
});
