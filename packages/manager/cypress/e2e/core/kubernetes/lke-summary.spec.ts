import {
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  nodePoolFactory,
} from 'src/factories';
import { latestKubernetesVersion } from 'support/constants/lke';
import {
  mockGetCluster,
  mockGetKubernetesVersions,
  mockGetClusterPools,
  mockGetDashboardUrl,
  mockGetApiEndpoints,
  mockGetControlPlaneACL,
  mockUpdateCluster,
} from 'support/intercepts/lke';
import { randomLabel } from 'support/util/random';
import { ui } from 'support/ui';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';

const mockNodePools = nodePoolFactory.buildList(2);

describe('LKE summary page', () => {
  beforeEach(() => {
    // Mock the APL feature flag to be disabled.
    mockAppendFeatureFlags({
      apl: false,
    });
  });

  /*
   * - Confirms users can add tags to a cluster in the LKE summary page.
   * - Confirms that an update API request has been sent.
   */
  it('can add tags to a cluster by clicking "Add a Tag" button in summary page', () => {
    const mockACL = kubernetesControlPlaneACLFactory.build({
      acl: {
        enabled: false,
      },
    });
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
      control_plane: mockACL,
    });
    const tag = randomLabel();
    const mockClusterUpdated = {
      ...mockCluster,
      tags: [tag],
    };

    mockGetCluster(mockCluster).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetApiEndpoints(mockCluster.id).as('getApiEndpoints');
    mockGetDashboardUrl(mockCluster.id).as('getDashboardUrl');
    mockGetControlPlaneACL(mockCluster.id, mockACL).as('getControlPlaneACL');
    mockUpdateCluster(mockCluster.id, mockClusterUpdated).as('updateCluster');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
    cy.wait([
      '@getCluster',
      '@getNodePools',
      '@getVersions',
      '@getApiEndpoints',
      '@getDashboardUrl',
    ]);

    // LKE clusters can add tags from summary page
    cy.get('[title="Add a tag"]').first().click();
    cy.get('[data-qa-autocomplete="Create or Select a Tag"]')
      .should('be.visible')
      .clear()
      .type(`${tag}`);
    cy.findByText(`Create "${tag}"`).should('be.visible').click();

    // Confirms that a put request is sent
    cy.wait('@updateCluster').then((xhr) => {
      const data = xhr.response?.body;
      if (data) {
        expect(data.tags).to.deep.equal(mockClusterUpdated.tags);
      }
    });

    // Confirms that the tags drawer shows up and the new tag exists
    cy.get('[aria-label="Display all tags"]').should('be.visible').click();
    ui.drawer
      .findByTitle(`Tags (${mockCluster.label})`)
      .should('be.visible')
      .within(() => {
        cy.findByText(tag).should('be.visible');
      });
  });

  /*
   * - Confirms users can add tags to a cluster in the tags drawer.
   * - Confirms that an update API request has been sent.
   */
  it('can add tags to a cluster by clicking "Add a Tag" button in tags drawer', () => {
    const mockACL = kubernetesControlPlaneACLFactory.build({
      acl: {
        enabled: false,
      },
    });
    const tagExisting = randomLabel();
    const tagNew = randomLabel();
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
      control_plane: mockACL,
      tags: [tagExisting],
    });

    const mockClusterUpdated = {
      ...mockCluster,
      tags: [tagExisting, tagNew],
    };

    mockGetCluster(mockCluster).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetApiEndpoints(mockCluster.id).as('getApiEndpoints');
    mockGetDashboardUrl(mockCluster.id).as('getDashboardUrl');
    mockGetControlPlaneACL(mockCluster.id, mockACL).as('getControlPlaneACL');
    mockUpdateCluster(mockCluster.id, mockClusterUpdated).as('updateCluster');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
    cy.wait([
      '@getCluster',
      '@getNodePools',
      '@getVersions',
      '@getApiEndpoints',
      '@getDashboardUrl',
    ]);

    // Confirms that the tags drawer shows up
    cy.get('[aria-label="Display all tags"]').should('be.visible').click();
    ui.drawer
      .findByTitle(`Tags (${mockCluster.label})`)
      .should('be.visible')
      .within(() => {
        cy.findByText(tagExisting).should('be.visible');

        // LKE clusters can add tags from tags drawer
        cy.get('[title="Add a tag"]').first().click();
        cy.get('[data-qa-autocomplete="Create or Select a Tag"]')
          .should('be.visible')
          .clear()
          .type(`${tagNew}`);
        cy.findByText(`Create "${tagNew}"`).should('be.visible').click();

        // Confirms that a put request is sent
        cy.wait('@updateCluster').then((xhr) => {
          const data = xhr.response?.body;
          if (data) {
            expect(data.tags).to.deep.equal(mockClusterUpdated.tags);
          }
        });

        // New tag should exist
        cy.findByText(tagNew).should('be.visible');
      });
  });

  /*
   * - Confirms users can remove tags from in the tags drawer.
   * - Confirms that an update API request has been sent.
   */
  it('can remove tags to a cluster by clicking "X" button next to the tag in tags drawer', () => {
    const mockACL = kubernetesControlPlaneACLFactory.build({
      acl: {
        enabled: false,
      },
    });
    const tagExisting = randomLabel();
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
      control_plane: mockACL,
      tags: [tagExisting],
    });

    const mockClusterUpdated = {
      ...mockCluster,
      tags: [],
    };

    mockGetCluster(mockCluster).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetApiEndpoints(mockCluster.id).as('getApiEndpoints');
    mockGetDashboardUrl(mockCluster.id).as('getDashboardUrl');
    mockGetControlPlaneACL(mockCluster.id, mockACL).as('getControlPlaneACL');
    mockUpdateCluster(mockCluster.id, mockClusterUpdated).as('updateCluster');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
    cy.wait([
      '@getCluster',
      '@getNodePools',
      '@getVersions',
      '@getApiEndpoints',
      '@getDashboardUrl',
    ]);

    // Confirms that the tags drawer shows up
    cy.get('[aria-label="Display all tags"]').should('be.visible').click();
    ui.drawer
      .findByTitle(`Tags (${mockCluster.label})`)
      .should('be.visible')
      .within(() => {
        cy.findByText(tagExisting).should('be.visible');

        // LKE clusters can remove tags from tags drawer
        cy.get('[title="Delete tag"]').should('be.visible').click();

        // Confirms that a put request is sent
        cy.wait('@updateCluster').then((xhr) => {
          const data = xhr.response?.body;
          if (data) {
            expect(data.tags).to.deep.equal([]);
          }
        });

        // The tag is removed
        cy.findByText(tagExisting).should('not.exist');

        // Close the tags drawer
        cy.get('[aria-label="Close drawer"]').click();
      });

    // Confirms that the tag should not present in the summary page.
    cy.get('[aria-label="Display all tags"]').should('not.exist');
  });
});
