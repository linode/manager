import { streamType } from '@linode/api-v4';
import { mockDestination } from 'support/constants/delivery';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateDestination,
  mockCreateStream,
  mockGetDestinations,
  mockTestConnection,
} from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetClusters } from 'support/intercepts/lke';
import { ui } from 'support/ui';
import { logsStreamForm } from 'support/ui/pages/logs-stream-form';
import { randomLabel } from 'support/util/random';

import { accountFactory, kubernetesClusterFactory } from 'src/factories';

describe('Create Stream', () => {
  const account = accountFactory.build();

  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
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
    it('creates new destination and creates stream', () => {
      // Mock API responses
      mockGetDestinations([mockDestination]);

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
      cy.findByRole('button', { name: 'Create Stream' }).should('be.disabled');

      // Test connection with failure
      mockTestConnection(400);
      ui.button.findByTitle('Test Connection').click();

      ui.toast.assertMessage(
        'Delivery connection test failed. Verify your delivery settings and try again.'
      );

      // Create Stream button should remain disabled after failed test
      cy.findByRole('button', { name: 'Create Stream' }).should('be.disabled');

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

      ui.toast.assertMessage(`There was an issue creating your destination`);

      // Submit the stream create form - success
      mockCreateDestination(mockDestination);
      mockCreateStream({ label: streamName }).as('createStream');

      cy.findByRole('button', { name: 'Create Stream' }).click();
      cy.wait('@createStream')
        .its('request.body')
        .then((body) => {
          expect(body).to.deep.equal({
            label: streamName,
            type: streamType.AuditLogs,
            destinations: [mockDestination.id],
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
      mockGetDestinations([mockDestination]);

      // Visit the Create Stream page
      cy.visitWithLogin('/logs/delivery/streams/create');

      const streamName = randomLabel();

      // Give the Name
      logsStreamForm.setLabel(streamName);

      // Select Stream Type
      logsStreamForm.selectStreamType(streamType.AuditLogs);

      // Select existing destination
      logsStreamForm.selectExistingDestination(mockDestination.label);

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
      ui.toast.assertMessage('There was an issue creating your stream');

      // Submit the stream create form - success
      mockCreateStream({ label: streamName }).as('createStream');

      cy.findByRole('button', { name: 'Create Stream' }).click();
      cy.wait('@createStream')
        .its('request.body')
        .then((body) => {
          expect(body).to.deep.equal({
            label: streamName,
            type: streamType.AuditLogs,
            destinations: [mockDestination.id],
            details: null,
          });
        });

      ui.toast.assertMessage(
        `${streamName} created successfully. Stream is being provisioned, which may take up to 45 minutes`
      );
      cy.url().should('endWith', 'streams');
    });
  });

  describe('given Kubernetes API Audit Logs Stream Type', () => {
    it('selects clusters and creates new stream', () => {
      // Mock API responses
      mockGetDestinations([mockDestination]);
      mockGetClusters([
        kubernetesClusterFactory.build({
          id: 1,
          label: 'cluster-1',
          control_plane: { audit_logs_enabled: true },
        }),
        kubernetesClusterFactory.build({
          id: 2,
          label: 'cluster-2',
          control_plane: { audit_logs_enabled: false },
        }),
        kubernetesClusterFactory.build({
          id: 3,
          label: 'cluster-3',
          control_plane: { audit_logs_enabled: true },
        }),
      ]);

      // Visit the Create Stream page
      cy.visitWithLogin('/logs/delivery/streams/create');

      const streamName = randomLabel();

      // Give the Name
      logsStreamForm.setLabel(streamName);

      // Select Stream Type
      logsStreamForm.selectStreamType(streamType.LKEAuditLogs);

      // Select existing destination
      logsStreamForm.selectExistingDestination(mockDestination.label);

      cy.findByText('Clusters').should('be.visible');
      cy.get('[data-testid="clusters-table"]').should('exist');

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
      logsStreamForm.selectExistingDestination(mockDestination.label);

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
            destinations: [mockDestination.id],
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
