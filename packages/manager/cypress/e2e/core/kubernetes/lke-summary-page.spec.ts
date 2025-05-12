import { latestKubernetesVersion } from 'support/constants/lke';
import {
  mockGetApiEndpoints,
  mockGetCluster,
  mockGetClusterPools,
  mockGetControlPlaneACL,
  mockGetDashboardUrl,
  mockGetKubeconfig,
  mockGetKubernetesVersions,
  mockUpdateCluster,
} from 'support/intercepts/lke';
import { ui } from 'support/ui';
import { readDownload } from 'support/util/downloads';
import { randomLabel } from 'support/util/random';

import {
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  nodePoolFactory,
} from 'src/factories';

const mockKubeconfigContents = '---'; // Valid YAML.
const mockKubeconfigResponse = {
  kubeconfig: btoa(mockKubeconfigContents),
};

const mockCluster = kubernetesClusterFactory.build();
const url = `/kubernetes/clusters/${mockCluster.id}`;

const mockNodePools = nodePoolFactory.buildList(2);
const buildTags = (num: number) => {
  const tags: string[] = [];
  for (let i = 0; i < num; i++) {
    tags.push(randomLabel(3));
  }
  return tags;
};

describe('LKE summary page', () => {
  beforeEach(() => {
    mockGetCluster(mockCluster).as('getCluster');
    mockGetKubeconfig(mockCluster.id, mockKubeconfigResponse).as(
      'getKubeconfig'
    );
  });

  it('can download kubeconfig', () => {
    const mockKubeconfigFilename = `${mockCluster.label}-kubeconfig.yaml`;
    cy.visitWithLogin(url);
    cy.wait(['@getCluster']);
    cy.findByText(mockKubeconfigFilename)
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@getKubeconfig');
    readDownload(mockKubeconfigFilename).should('eq', mockKubeconfigContents);
  });

  it('can view kubeconfig contents', () => {
    cy.visitWithLogin(url);
    cy.wait(['@getCluster']);
    // open drawer
    cy.get('p:contains("View")')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@getKubeconfig');
    ui.drawer.findByTitle('View Kubeconfig').should('be.visible');
    cy.get('code')
      .should('be.visible')
      .within(() => {
        cy.get('span').contains(mockKubeconfigContents);
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
      control_plane: mockACL,
      k8s_version: latestKubernetesVersion,
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
    cy.get('[data-qa-kube-entity-footer]').within(() => {
      cy.findByText('Add a tag').click();
    });
    cy.get('[data-qa-autocomplete="Create or Select a Tag"]')
      .should('be.visible')
      .clear();
    cy.focused().type(`${tag}`);
    cy.findByText(`Create "${tag}"`).should('be.visible').click();

    // Confirms that a put request is sent
    cy.wait('@updateCluster').then((xhr) => {
      const data = xhr.response?.body;
      if (data) {
        expect(data.tags).to.deep.equal(mockClusterUpdated.tags);
      }
    });

    // Confirms that the new tag shows up
    cy.get(`[data-qa-tag="${tag}"]`).should('be.visible');
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
    const tagsExisting: string[] = buildTags(5);

    const tagNew = randomLabel();
    const mockCluster = kubernetesClusterFactory.build({
      control_plane: mockACL,
      k8s_version: latestKubernetesVersion,
      tags: tagsExisting,
    });

    const mockClusterUpdated = {
      ...mockCluster,
      tags: [...tagsExisting, tagNew],
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

    // Confirms that button "Display all tags" (i.e., "...") shows up and opens the tags drawer
    cy.get('[aria-label="Display all tags"]').should('be.visible').click();
    ui.drawer
      .findByTitle(`Tags (${mockCluster.label})`)
      .should('be.visible')
      .within(() => {
        tagsExisting.forEach((tag) => {
          cy.findByText(tag).should('be.visible');
        });

        // LKE clusters can add tags from tags drawer
        cy.findByText('Add a tag').click();
        cy.get('[data-qa-autocomplete="Create or Select a Tag"]')
          .should('be.visible')
          .clear();
        cy.focused().type(`${tagNew}`);
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
   * - Confirms users can remove tags in the landing page.
   * - Confirms that an update API request has been sent.
   */
  it('can remove tags to a cluster by clicking "X" button next to the tag in the landing page', () => {
    const mockACL = kubernetesControlPlaneACLFactory.build({
      acl: {
        enabled: false,
      },
    });
    const tagExisting = randomLabel();
    const mockCluster = kubernetesClusterFactory.build({
      control_plane: mockACL,
      k8s_version: latestKubernetesVersion,
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

    // Confirms that the "..." button does not exist if only one tag exists
    cy.get('[aria-label="Display all tags"]').should('not.exist');
    cy.get(`[data-qa-tag="${tagExisting}"]`)
      .should('be.visible')
      .within(() => {
        cy.get(`[aria-label="Delete Tag '${tagExisting}'"]`)
          .should('be.visible')
          .click();
      });

    // Confirms that the tag should not present in the summary page.
    cy.get(`[data-qa-tag="${tagExisting}"]`).should('not.exist');
  });

  /*
   * - Confirms users can remove tags from tags drawer.
   * - Confirms that an update API request has been sent.
   */
  it('can remove tags to a cluster by clicking "X" button next to the tag in tags drawer', () => {
    const mockACL = kubernetesControlPlaneACLFactory.build({
      acl: {
        enabled: false,
      },
    });
    const tagsExisting = buildTags(2);
    const mockCluster = kubernetesClusterFactory.build({
      control_plane: mockACL,
      k8s_version: latestKubernetesVersion,
      tags: tagsExisting,
    });

    const mockClusterUpdated = {
      ...mockCluster,
      tags: [tagsExisting[1]],
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
        // Confirms that each tag is visible
        tagsExisting.forEach((tag) => {
          cy.get(`[data-qa-tag="${tag}"]`).should('be.visible');
        });

        cy.get(`[data-qa-tag="${tagsExisting[0]}"]`)
          .should('be.visible')
          .within(() => {
            // LKE clusters can remove tags from tags drawer
            cy.get(`[aria-label="Delete Tag '${tagsExisting[0]}'"]`)
              .should('be.visible')
              .click();

            // Confirms that a put request is sent
            cy.wait('@updateCluster').then((xhr) => {
              const data = xhr.response?.body;
              if (data) {
                expect(data.tags).to.deep.equal([tagsExisting[1]]);
              }
            });
          });

        // The tag is removed
        cy.findByText(tagsExisting[0]).should('not.exist');

        // Close the tags drawer
        cy.get('[aria-label="Close drawer"]').click();
      });

    // Confirms that the tag should not present in the summary page.
    cy.get('[aria-label="Display all tags"]').should('not.exist');
  });

  // TODO: add test for failure to download yaml file
});
