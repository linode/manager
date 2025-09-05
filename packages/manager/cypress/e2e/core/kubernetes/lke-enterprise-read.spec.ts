/**
 * Confirms read operations on LKE-Enterprise clusters.
 */

import {
  linodeFactory,
  linodeIPFactory,
  profileFactory,
} from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeIPAddresses,
  mockGetLinodes,
} from 'support/intercepts/linodes';
import {
  mockGetCluster,
  mockGetClusterPools,
  mockGetKubernetesVersions,
} from 'support/intercepts/lke';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetVPC } from 'support/intercepts/vpc';

import {
  accountFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  nodePoolFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';

const mockProfile = profileFactory.build();

const mockVPC = vpcFactory.build({
  id: 123,
  label: 'lke-e-vpc',
  subnets: [subnetFactory.build()],
});

const mockClusterWithVPC = kubernetesClusterFactory.build({
  id: 1,
  vpc_id: mockVPC.id,
  subnet_id: mockVPC.subnets[0].id,
  tier: 'enterprise',
});
const mockClusterWithoutVPC = kubernetesClusterFactory.build({
  id: 2,
  vpc_id: null,
  tier: 'enterprise',
});
const mockNodePools = [
  nodePoolFactory.build({
    id: 1,
    nodes: [kubeLinodeFactory.build()],
    count: 1,
  }),
];

const mockLinodes = mockNodePools.map((pool, i) =>
  linodeFactory.build({
    id: pool.nodes[i].instance_id ?? undefined,
    lke_cluster_id: mockClusterWithVPC.id,
    type: pool.type,
  })
);
const mockLinodeIPs = linodeIPFactory.build({
  ipv4: {
    public: [
      {
        address: '192.0.2.1',
        linode_id: mockLinodes[0].id,
      },
    ],
    private: [
      {
        linode_id: mockLinodes[0].id,
      },
    ],
    vpc: [
      {
        address: '10.0.0.1',
        linode_id: mockLinodes[0].id,
        vpc_id: mockVPC.id,
        subnet_id: mockVPC.subnets[0].id,
      },
    ],
  },
  ipv6: {
    slaac: {
      address: '2600:abcd::efgh:ijkl:mnop:qrst',
      linode_id: mockLinodes[0].id,
    },
    link_local: {
      linode_id: mockLinodes[0].id,
    },
    vpc: [
      {
        linode_id: mockLinodes[0].id,
        vpc_id: mockVPC.id,
        subnet_id: mockVPC.subnets[0].id,
        ipv6_addresses: [
          {
            slaac_address: '2600:1234::abcd:5678:efgh:9012',
          },
        ],
      },
    ],
  },
});

/**
 * Confirms the expected information is displayed in the cluster summary section of the cluster details page:
 * - Confirms the linked VPC is shown for an LKE-E cluster when it exists.
 * - Confirms a linked VPC is not shown for an LKE-E cluster when it doesn't exist.
 */
describe('LKE-E Cluster Summary - VPC Section', () => {
  beforeEach(() => {
    // TODO LKE-E: Remove once feature is in GA
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        phase2Mtc: { byoVPC: true, dualStack: true },
      },
    });
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      })
    ).as('getAccount');
  });
  /*
   * Confirms LKE-E summary page shows VPC info and links to the correct VPC page when a vpc_id is present.
   */
  it('shows linked VPC in summary for cluster with a VPC', () => {
    mockGetCluster(mockClusterWithVPC).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockClusterWithVPC.id, []).as('getNodePools');
    mockGetVPC(mockVPC).as('getVPC');
    mockGetProfile(mockProfile).as('getProfile');

    cy.visitWithLogin(`/kubernetes/clusters/${mockClusterWithVPC.id}/summary`);
    cy.wait([
      '@getCluster',
      '@getNodePools',
      '@getVersions',
      '@getVPC',
      '@getProfile',
    ]);

    // Verify VPC details appear in the summary
    cy.get('[data-qa-kube-entity-footer]').within(() => {
      cy.contains('VPC:').should('exist');
      cy.findByTestId('assigned-lke-cluster-label')
        .should('contain.text', mockVPC.label)
        .should('have.attr', 'href')
        .and('include', `/vpcs/${mockVPC.id}`);
    });

    // Navigate to the VPC by clicking the link
    cy.findByTestId('assigned-lke-cluster-label').click();

    // Verify the VPC details page loads
    cy.url().should('include', `/vpcs/${mockVPC.id}`);
    cy.contains(mockVPC.label).should('exist');
  });

  /*
   * Confirms VPC info is not shown when cluster's vpc_id is null.
   */
  it('does not show linked VPC in summary when cluster does not specify a VPC', () => {
    mockGetCluster(mockClusterWithoutVPC).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockClusterWithoutVPC.id, []).as('getNodePools');
    mockGetProfile(mockProfile).as('getProfile');

    cy.visitWithLogin(
      `/kubernetes/clusters/${mockClusterWithoutVPC.id}/summary`
    );
    cy.wait(['@getCluster', '@getNodePools', '@getVersions', '@getProfile']);

    // Confirm that no VPC label or link is shown in the summary section
    cy.get('[data-qa-kube-entity-footer]').within(() => {
      cy.contains('VPC:').should('not.exist');
      cy.findByTestId('assigned-lke-cluster-label').should('not.exist');
    });
  });
});

/**
 * Confirms the expected information is shown for a cluster's node pools on the cluster details page.
 */
describe('LKE-E Node Pools', () => {
  /**
   * - Confirms the VPC IP address table headers are shown in the node table.
   * - Confirms the IP address data is shown for a node in the node pool.
   */
  it('shows VPC IPv4 and IPv6 columns for an LKE-E cluster', () => {
    mockAppendFeatureFlags({
      // TODO LKE-E: Remove once feature is in GA
      lkeEnterprise2: {
        enabled: true,
        la: true,
        phase2Mtc: { byoVPC: true, dualStack: true },
      },
    });
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      })
    ).as('getAccount');

    mockGetCluster(mockClusterWithVPC).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockClusterWithVPC.id, mockNodePools).as(
      'getNodePools'
    );
    mockGetVPC(mockVPC).as('getVPC');
    mockGetProfile(mockProfile).as('getProfile');
    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetLinodeIPAddresses(mockLinodes[0].id, mockLinodeIPs).as(
      'getLinodeIPs'
    );

    cy.visitWithLogin(`/kubernetes/clusters/${mockClusterWithVPC.id}/summary`);
    cy.wait([
      '@getCluster',
      '@getNodePools',
      '@getVersions',
      '@getProfile',
      '@getVPC',
    ]);

    // Confirm VPC IP columns are present in the table header
    cy.get('[aria-label="List of Your Cluster Nodes"] thead').within(() => {
      cy.contains('th', 'VPC IPv4').should('be.visible');
      cy.contains('th', 'VPC IPv6').should('be.visible');
    });

    // Confirm VPC IP addresses are present in the table data
    const vpcIPv6 =
      mockLinodeIPs.ipv6?.vpc?.[0]?.ipv6_addresses?.[0]?.slaac_address;
    const vpcIPv4 = mockLinodeIPs.ipv4?.vpc?.[0]?.address;

    cy.get('[data-qa-node-row]').within(() => {
      cy.contains('td', vpcIPv6).should('be.visible');
      cy.contains('td', vpcIPv4).should('be.visible');
    });
  });
});
