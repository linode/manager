import { regionFactory } from '@linode/utilities';
import {
  mockAkamaiObjectStorageDestination,
  mockAuditLogsStream,
  mockAuditLogsStreamPayload,
  mockLKEAuditLogsStream,
} from 'support/constants/delivery';
import {
  mockCreateDestination,
  mockGetDestination,
  mockGetDestinations,
  mockGetStream,
  mockGetStreams,
  mockTestConnection,
  mockUpdateStream,
} from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetClusters } from 'support/intercepts/lke';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { logsStreamForm } from 'support/ui/pages/logs-stream-form';
import { randomLabel } from 'support/util/random';

import { DEFAULT_ERROR_MESSAGE } from 'src/constants';
import { kubernetesClusterFactory } from 'src/factories';

describe('Edit Stream', () => {
  const saveChangesButtonText = 'Save Changes';

  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
        bypassAccountCapabilities: true,
      },
    });
  });

  describe('given Audit Logs Stream Type', () => {
    it('edits stream label and destination and saves', () => {
      // Mock API responses
      mockGetDestinations([mockAkamaiObjectStorageDestination]);
      mockGetDestination(mockAkamaiObjectStorageDestination);
      mockGetStreams([mockAuditLogsStream]);
      mockGetStream(mockAuditLogsStream);

      // Visit the Edit Stream page
      cy.visitWithLogin(`/logs/delivery/streams/${mockAuditLogsStream.id}`);

      const updatedLabel = randomLabel();

      // Change the Name
      cy.findByLabelText('Stream Name')
        .should('be.visible')
        .should('be.enabled')
        .should('have.value', mockAuditLogsStream.label);

      logsStreamForm.setLabel(updatedLabel);

      cy.findByLabelText('Stream Name')
        .should('be.visible')
        .should('be.enabled')
        .should('have.value', updatedLabel);

      // Stream Type should be disabled
      cy.findByLabelText('Stream Type')
        .should('be.visible')
        .should('be.disabled')
        .should('have.attr', 'value', 'Audit Logs');

      // Save button should be enabled initially
      ui.button.findByTitle(saveChangesButtonText).should('be.enabled');

      // Test Connection should be disabled for existing destination
      ui.button.findByTitle('Test Connection').should('be.disabled');

      const newDestinationLabel = randomLabel();
      // Change Destination to a new one
      logsStreamForm.fillOutNewAkamaiObjectStorageDestination(
        newDestinationLabel
      );

      // Test connection button should be enabled
      ui.button.findByTitle('Test Connection').should('be.enabled');

      // Save button should be disabled after changing destination
      ui.button.findByTitle(saveChangesButtonText).should('be.disabled');

      // Test connection with failure
      mockTestConnection(400);
      ui.button.findByTitle('Test Connection').click();

      ui.toast.assertMessage(
        'Delivery connection test failed. Verify your delivery settings and try again.'
      );

      // Save button should remain disabled after failed test
      ui.button.findByTitle(saveChangesButtonText).should('be.disabled');

      // Test connection with success
      mockTestConnection(200);
      ui.button.findByTitle('Test Connection').click();

      ui.toast.assertMessage(
        'Delivery connection test completed successfully. Data can now be sent using this configuration.'
      );

      // Save button should now be enabled
      ui.button.findByTitle(saveChangesButtonText).should('be.enabled');

      // Submit the stream edit form - failure in creating destination
      mockCreateDestination({}, 400);
      ui.button.findByTitle(saveChangesButtonText).should('be.enabled').click();

      ui.toast.assertMessage(DEFAULT_ERROR_MESSAGE);

      // Submit the stream edit form - success
      mockCreateDestination(mockAkamaiObjectStorageDestination);
      mockUpdateStream(
        {
          ...mockAuditLogsStreamPayload,
          id: mockAuditLogsStream.id,
          status: 'active',
        },
        mockAuditLogsStream
      ).as('updateStream');

      ui.button.findByTitle(saveChangesButtonText).click();
      cy.wait('@updateStream')
        .its('request.body')
        .then((body) => {
          expect(body).to.deep.equal({
            label: updatedLabel,
            status: 'active',
            destinations: [mockAkamaiObjectStorageDestination.id],
            details: null,
          });
        });

      ui.toast.assertMessage(
        `Destination ${newDestinationLabel} created successfully`
      );
      ui.toast.assertMessage(`Stream ${updatedLabel} edited successfully`);
      cy.url().should('endWith', 'streams');
    });
  });

  describe('given Kubernetes API Audit Logs Stream Type', () => {
    it('edits stream label and clusters and saves', () => {
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
      const cluster4 = kubernetesClusterFactory.build({
        id: 4,
        label: 'cluster-no-cap',
        region: regionNoCapabilityWithCluster.id,
        control_plane: { audit_logs_enabled: true },
      });

      // Mock API responses
      mockGetDestinations([mockAkamaiObjectStorageDestination]);
      mockGetDestination(mockAkamaiObjectStorageDestination);
      mockGetStreams([mockLKEAuditLogsStream]);
      mockGetStream({
        ...mockLKEAuditLogsStream,
        details: { cluster_ids: [1, 3] },
      });
      mockGetRegions([
        regionWithCapabilityAndCluster,
        regionWithCapabilityNoCluster,
        regionNoCapabilityWithCluster,
      ]);
      mockGetClusters([cluster1, cluster2, cluster3, cluster4]);

      // Visit the Edit Stream page
      cy.visitWithLogin(`/logs/delivery/streams/${mockLKEAuditLogsStream.id}`);

      const updatedLabel = randomLabel();

      // Change the Name
      cy.findByLabelText('Stream Name')
        .should('be.visible')
        .should('be.enabled')
        .should('have.value', mockLKEAuditLogsStream.label);

      logsStreamForm.setLabel(updatedLabel);

      cy.findByLabelText('Stream Name')
        .should('be.visible')
        .should('be.enabled')
        .should('have.value', updatedLabel);

      // Stream Type should be disabled
      cy.findByLabelText('Stream Type')
        .should('be.visible')
        .should('be.disabled')
        .should('have.attr', 'value', 'Kubernetes API Audit Logs');

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

      // Clusters table should be visible
      cy.findByText('Clusters').should('be.visible');
      cy.get('[data-testid="clusters-table"]').should('exist');

      // Verify Clusters Table content
      cy.findByText('cluster-1').should('be.visible');
      cy.findByText('cluster-2').should('be.visible');
      cy.findByText('cluster-3').should('be.visible');
      cy.findByText('cluster-4').should('not.exist');

      // Initially selected clusters should be checked
      logsStreamForm.findClusterCheckbox('cluster-1').should('be.checked');
      logsStreamForm.findClusterCheckbox('cluster-3').should('be.checked');

      // Deselect clusters
      logsStreamForm.findClusterCheckbox('cluster-1').uncheck();
      logsStreamForm.findClusterCheckbox('cluster-3').uncheck();

      // Clusters should be unchecked
      logsStreamForm.findClusterCheckbox('cluster-1').should('not.be.checked');
      logsStreamForm.findClusterCheckbox('cluster-3').should('not.be.checked');

      // TODO: uncomment when "Automatically include all existing and recently configured clusters" feature is available
      // Use "Automatically include all existing and recently configured clusters" to select all eligible clusters
      // cy.findByLabelText(
      //   'Automatically include all existing and recently configured clusters.'
      // ).click();
      // logsStreamForm.findClusterCheckbox('all').should('be.disabled');
      // logsStreamForm
      //   .findClusterCheckbox('cluster-1')
      //   .should('be.disabled')
      //   .should('be.checked');
      // logsStreamForm
      //   .findClusterCheckbox('cluster-3')
      //   .should('be.disabled')
      //   .should('be.checked');

      // Use "Toggle all clusters" to select all eligible clusters
      logsStreamForm.findClusterCheckbox('all').check();

      // Save button should be enabled
      ui.button.findByTitle(saveChangesButtonText).should('be.enabled');

      // Submit the stream edit form - failure
      mockUpdateStream(
        {
          id: mockLKEAuditLogsStream.id,
          label: updatedLabel,
          status: 'active',
          destinations: [mockAkamaiObjectStorageDestination.id],
          details: {
            is_auto_add_all_clusters_enabled: true,
          },
        },
        {},
        400
      ).as('updateStreamFail');

      ui.button.findByTitle(saveChangesButtonText).click();
      cy.wait('@updateStreamFail');
      ui.toast.assertMessage(DEFAULT_ERROR_MESSAGE);

      // Submit the stream edit form - success
      mockUpdateStream(
        {
          id: mockLKEAuditLogsStream.id,
          label: updatedLabel,
          status: 'active',
          destinations: [mockAkamaiObjectStorageDestination.id],
          details: {
            cluster_ids: [1, 3], // TODO: change to is_auto_add_all_clusters_enabled: true when "Automatically include all existing and recently configured clusters" feature is available
          },
        },
        mockLKEAuditLogsStream
      ).as('updateStream');

      ui.button.findByTitle(saveChangesButtonText).click();
      cy.wait('@updateStream')
        .its('request.body')
        .then((body) => {
          expect(body).to.deep.equal({
            label: updatedLabel,
            status: 'active',
            destinations: [mockAkamaiObjectStorageDestination.id],
            details: {
              cluster_ids: [1, 3], // TODO: change to is_auto_add_all_clusters_enabled: true when "Automatically include all existing and recently configured clusters" feature is available
            },
          });
        });

      ui.toast.assertMessage(`Stream ${updatedLabel} edited successfully`);
      cy.url().should('endWith', 'streams');
    });
  });
});
