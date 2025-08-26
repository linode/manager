import { kubernetesClusterFactory } from '@src/factories';
import { latestEnterpriseTierKubernetesVersion } from 'support/constants/lke';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateCluster,
  mockGetTieredKubernetesVersions,
} from 'support/intercepts/lke';
import {} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { addNodes } from 'support/util/lke';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

// Warning that's shown when recommended minimum number of nodes is not met.
const minimumNodeNotice =
  'We recommend a minimum of 3 nodes in each Node Pool to avoid downtime during upgrades and maintenance.';

describe('LKE-E Create Cluster', () => {
  it('Simple Page Check - Phase 2 MTC Flag ON', () => {
    mockAppendFeatureFlags({
      lkeEnterprise: {
        enabled: true,
        la: true,
        postLa: false,
        phase2Mtc: true,
      },
    }).as('getFeatureFlags');
    const mockCluster = kubernetesClusterFactory.build({
      id: randomNumber(10000, 99999),
      label: randomLabel(),
    });

    mockCreateCluster(mockCluster).as('createCluster');
    mockGetTieredKubernetesVersions('enterprise', [
      latestEnterpriseTierKubernetesVersion,
    ]).as('getTieredKubernetesVersions');

    cy.visitWithLogin('/kubernetes/create');
    cy.findByText('Add Node Pools').should('be.visible');

    cy.findByLabelText('Cluster Label').click();
    cy.focused().type(mockCluster.label);

    cy.findByText('LKE Enterprise').click();

    ui.regionSelect.find().click().type(`${chooseRegion().label}{enter}`);

    cy.findByLabelText('Kubernetes Version').should('be.visible').click();
    cy.findByText(latestEnterpriseTierKubernetesVersion.id)
      .should('be.visible')
      .click();

    // Confirms LKE-E Phase 2 IP Stack and VPC options display with the flag ON.
    cy.findByText('IP Stack').should('be.visible');
    cy.findByText('IPv4', { exact: true }).should('be.visible');
    cy.findByText('IPv4 + IPv6 (dual-stack)').should('be.visible');
    cy.findByText('Automatically generate a VPC for this cluster').should(
      'be.visible'
    );
    cy.findByText('Use an existing VPC').should('be.visible');

    cy.findByText('Shared CPU').should('be.visible').click();
    addNodes('Linode 2 GB');

    // Bypass ACL validation
    cy.get('input[name="acl-acknowledgement"]').check();

    // Confirm change is reflected in checkout bar.
    cy.get('[data-testid="kube-checkout-bar"]').within(() => {
      cy.findByText('Linode 2 GB Plan').should('be.visible');
      cy.findByTitle('Remove Linode 2GB Node Pool').should('be.visible');

      cy.get('[data-qa-notice="true"]').within(() => {
        cy.findByText(minimumNodeNotice).should('be.visible');
      });

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait('@createCluster');
    cy.url().should(
      'endWith',
      `/kubernetes/clusters/${mockCluster.id}/summary`
    );
  });

  it('Simple Page Check - Phase 2 MTC Flag OFF', () => {
    mockAppendFeatureFlags({
      lkeEnterprise: {
        enabled: true,
        la: true,
        postLa: false,
        phase2Mtc: false,
      },
    }).as('getFeatureFlags');
    const mockCluster = kubernetesClusterFactory.build({
      id: randomNumber(10000, 99999),
      label: randomLabel(),
    });

    mockCreateCluster(mockCluster).as('createCluster');
    mockGetTieredKubernetesVersions('enterprise', [
      latestEnterpriseTierKubernetesVersion,
    ]).as('getTieredKubernetesVersions');

    cy.visitWithLogin('/kubernetes/create');
    cy.findByText('Add Node Pools').should('be.visible');

    cy.findByLabelText('Cluster Label').click();
    cy.focused().type(mockCluster.label);

    cy.findByText('LKE Enterprise').click();

    ui.regionSelect.find().click().type(`${chooseRegion().label}{enter}`);

    cy.findByLabelText('Kubernetes Version').should('be.visible').click();
    cy.findByText(latestEnterpriseTierKubernetesVersion.id)
      .should('be.visible')
      .click();

    // Confirms LKE-E Phase 2 IP Stack and VPC options do not display with the flag OFF.
    cy.findByText('IP Stack').should('not.exist');
    cy.findByText('IPv4', { exact: true }).should('not.exist');
    cy.findByText('IPv4 + IPv6 (dual-stack)').should('not.exist');
    cy.findByText('Automatically generate a VPC for this cluster').should(
      'not.exist'
    );
    cy.findByText('Use an existing VPC').should('not.exist');

    cy.findByText('Shared CPU').should('be.visible').click();
    addNodes('Linode 2 GB');

    // Bypass ACL validation
    cy.get('input[name="acl-acknowledgement"]').check();

    // Confirm change is reflected in checkout bar.
    cy.get('[data-testid="kube-checkout-bar"]').within(() => {
      cy.findByText('Linode 2 GB Plan').should('be.visible');
      cy.findByTitle('Remove Linode 2GB Node Pool').should('be.visible');

      cy.get('[data-qa-notice="true"]').within(() => {
        cy.findByText(minimumNodeNotice).should('be.visible');
      });

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait('@createCluster');
    cy.url().should(
      'endWith',
      `/kubernetes/clusters/${mockCluster.id}/summary`
    );
  });
});
