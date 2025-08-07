import { linodeFactory, linodeIPFactory } from '@linode/utilities';
import { DateTime } from 'luxon';
import { http } from 'msw';

import {
  kubeEndpointFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  kubernetesDashboardUrlFactory,
  kubernetesEnterpriseTierVersionFactory,
  kubernetesStandardTierVersionFactory,
  kubernetesVersionFactory,
  nodePoolFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type {
  KubeNodePoolResponse,
  KubernetesCluster,
  KubernetesControlPlaneACLPayload,
  KubernetesDashboardResponse,
  KubernetesEndpointResponse,
  KubernetesTieredVersion,
  KubernetesVersion,
  Linode,
  VPC,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getKubernetesClusters = (mockState: MockState) => [
  http.get(
    '*/v4*/lke/clusters',
    ({
      request,
    }): StrictResponse<
      APIErrorResponse | APIPaginatedResponse<KubernetesCluster>
    > => {
      return makePaginatedResponse({
        data: mockState.kubernetesClusters,
        request,
      });
    }
  ),

  http.get(
    '*/v4*/lke/clusters/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | KubernetesCluster>> => {
      const id = Number(params.id);
      const cluster = await mswDB.get('kubernetesClusters', id);

      if (!cluster) {
        return makeNotFoundResponse();
      }

      return makeResponse(cluster);
    }
  ),

  http.get(
    '*/v4/lke/clusters/:id/api-endpoints',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<
        APIErrorResponse | APIPaginatedResponse<KubernetesEndpointResponse>
      >
    > => {
      const id = Number(params.id);
      const cluster = await mswDB.get('kubernetesClusters', id);

      if (!cluster) {
        return makeNotFoundResponse();
      }

      const endpoints = kubeEndpointFactory.buildList(2);

      return makePaginatedResponse({
        data: endpoints,
        request,
      });
    }
  ),

  http.get(
    '*/v4/lke/clusters/:id/control_plane_acl',
    async ({
      params,
    }): Promise<
      StrictResponse<APIErrorResponse | KubernetesControlPlaneACLPayload>
    > => {
      const id = Number(params.id);
      const cluster = await mswDB.get('kubernetesClusters', id);

      if (!cluster) {
        return makeNotFoundResponse();
      }

      const acl = kubernetesControlPlaneACLFactory.build();

      return makeResponse(acl);
    }
  ),

  http.get(
    '*/v4/lke/clusters/:id/dashboard',
    async ({
      params,
    }): Promise<
      StrictResponse<APIErrorResponse | KubernetesDashboardResponse>
    > => {
      const dashboard = kubernetesDashboardUrlFactory.build();

      return makeResponse(dashboard);
    }
  ),
];

export const createKubernetesCluster = (mockState: MockState) => [
  http.post(
    '*/v4/lke/clusters',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | KubernetesCluster>> => {
      const payload = await request.clone().json();

      const cluster = kubernetesClusterFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
        tier: 'standard',
      });

      const createNodePoolPromises = (payload.node_pools || []).map(
        (poolData: MockKubeNodePoolResponse) =>
          mswDB.add(
            'kubernetesNodePools',
            {
              ...nodePoolFactory.build({
                ...poolData,
                nodes: kubeLinodeFactory.buildList(poolData.count),
              }),
              clusterId: cluster.id,
            } as MockKubeNodePoolResponse,
            mockState
          )
      );

      await Promise.all(createNodePoolPromises);
      await mswDB.add('kubernetesClusters', cluster, mockState);

      queueEvents({
        mockState,
        event: {
          action: 'lke_cluster_create',
          entity: {
            id: cluster.id,
            label: cluster.label,
            type: 'lke',
            url: `/v4/lke/clusters/${cluster.id}`,
          },
        },
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(cluster);
    }
  ),

  http.post(
    '*/v4beta/lke/clusters',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | KubernetesCluster>> => {
      const payload = await request.clone().json();
      let vpc: undefined | VPC;

      // Create mock VPC.
      if (payload.tier === 'enterprise') {
        // Default to auto-generated VPC.
        vpc = vpcFactory.build({
          region: payload.region,
          label: `vpc-${payload.label}`,
          subnets: [subnetFactory.build()],
        });

        // Connect BYO VPC.
        if (payload.vpc_id) {
          vpc = {
            ...vpc,
            id: payload.vpc_id,
            subnets: [subnetFactory.build({ id: payload.subnet_id })],
          };
        }
        await mswDB.add('vpcs', vpc, mockState);
      }

      // Create mock cluster.
      const cluster = kubernetesClusterFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
        tier: payload.tier,
        vpc_id: payload.vpc_id,
        subnet_id: payload.subnet_id,
        stack_type: payload.stack_type,
      });

      // Create mock node pools.
      const createNodePoolPromises = (payload.node_pools || []).map(
        (poolData: MockKubeNodePoolResponse) =>
          mswDB.add(
            'kubernetesNodePools',
            {
              ...nodePoolFactory.build({
                ...poolData,
                nodes: kubeLinodeFactory.buildList(poolData.count),
              }),
              clusterId: cluster.id,
            } as MockKubeNodePoolResponse,
            mockState
          )
      );
      await Promise.all(createNodePoolPromises);
      await mswDB.add('kubernetesClusters', cluster, mockState);

      // Create mock Linode instances linked to the newly created mock cluster's node pool nodes.
      const allNodePools = await mswDB.getAll('kubernetesNodePools');
      const createdClusterNodePools = allNodePools?.filter(
        (pool: MockKubeNodePoolResponse) => pool.clusterId === cluster.id
      ) as MockKubeNodePoolResponse[];

      const createLinodePromises = (createdClusterNodePools || []).map(
        (pool) => {
          return (pool?.nodes || []).map((node) => {
            return mswDB.add(
              'linodes',
              {
                ...linodeFactory.build({
                  lke_cluster_id: cluster.id,
                  id: node.instance_id ?? undefined,
                  type: pool.type,
                }),
              },
              mockState
            );
          });
        }
      );
      await Promise.all(createLinodePromises);

      // Create mock Linode IPs linked to the newly created Linode instances and VPC.
      const allLinodes = await mswDB.getAll('linodes');
      const createdClusterNodePoolLinodes = allLinodes?.filter(
        (linode: Linode) => linode.lke_cluster_id === cluster.id
      );

      const createLinodeIpsPromises = (createdClusterNodePoolLinodes || []).map(
        (linode) => {
          const ipData = linodeIPFactory.build({
            ipv4: {
              ...linodeIPFactory.build().ipv4,
              public: [
                {
                  ...linodeIPFactory.build().ipv4.public[0],
                  linode_id: linode.id,
                  region: linode.region,
                },
              ],
              private: [
                {
                  ...linodeIPFactory.build().ipv4.public[0],
                  linode_id: linode.id,
                  region: linode.region,
                },
              ],
              vpc: vpc
                ? [
                    {
                      ...linodeIPFactory.build().ipv4.vpc[0],
                      linode_id: linode.id,
                      region: linode.region,
                      vpc_id: vpc.id,
                      subnet_id: vpc.subnets[0].id,
                    },
                  ]
                : [],
            },
            ipv6: {
              ...linodeIPFactory.build().ipv6,
              slaac: {
                ...linodeIPFactory.build().ipv6?.slaac,
                linode_id: linode.id,
                region: linode.region,
              },
              link_local: {
                ...linodeIPFactory.build().ipv6?.link_local,
                linode_id: linode.id,
                region: linode.region,
              },
              vpc: vpc
                ? [
                    {
                      ...linodeIPFactory.build().ipv6?.vpc[0],
                      linode_id: linode.id,
                      region: linode.region,
                      vpc_id: vpc.id,
                      subnet_id: vpc.subnets[0].id,
                    },
                  ]
                : [],
            },
          });

          return mswDB.add('linodeIps', [linode.id, ipData], mockState);
        }
      );

      await Promise.all(createLinodeIpsPromises);

      queueEvents({
        mockState,
        event: {
          action: 'lke_cluster_create',
          entity: {
            id: cluster.id,
            label: cluster.label,
            type: 'lke',
            url: `/v4/lke/clusters/${cluster.id}`,
          },
        },
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(cluster);
      // Comment out the line above and uncomment below for mock error response.
      // return makeResponse(
      //   {
      //     errors: [
      //       {
      //         reason: 'There is an error configuring this VPC.',
      //         field: 'vpc_id',
      //       },
      //       {
      //         reason: 'There is no /52 ipv6 subnet available inside the VPC.',
      //         field: 'subnet_id',
      //       },
      //     ],
      //   },
      //   400
      // );
    }
  ),
];

export const updateKubernetesCluster = (mockState: MockState) => [
  http.put(
    '*/v4/lke/clusters/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | KubernetesCluster>> => {
      const id = Number(params.id);
      const cluster = await mswDB.get('kubernetesClusters', id);

      if (!cluster) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        updated: DateTime.now().toISO(),
      };
      const updatedCluster = { ...cluster, ...payload };

      await mswDB.update('kubernetesClusters', id, updatedCluster, mockState);

      queueEvents({
        mockState,
        event: {
          action: 'lke_cluster_update',
          entity: {
            id: cluster.id,
            label: cluster.label,
            type: 'lke',
            url: `/v4/lke/clusters/${cluster.id}`,
          },
        },
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedCluster);
    }
  ),

  http.put(
    '*/v4/lke/clusters/:id/control_plane_acl',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | KubernetesControlPlaneACLPayload>
    > => {
      const id = Number(params.id);
      const cluster = await mswDB.get('kubernetesClusters', id);

      if (!cluster) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        updated: DateTime.now().toISO(),
      };
      const updatedCluster = { ...cluster, ...payload };

      await mswDB.update('kubernetesClusters', id, updatedCluster, mockState);

      return makeResponse(updatedCluster);
    }
  ),

  http.post(
    '*/v4/lke/clusters/:id/recycle',
    async ({}): Promise<StrictResponse<APIErrorResponse | {}>> => {
      return makeResponse({});
    }
  ),
];

export const deleteKubernetesCluster = (mockState: MockState) => [
  http.delete(
    '*/v4/lke/clusters/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const cluster = await mswDB.get('kubernetesClusters', id);

      if (!cluster) {
        return makeNotFoundResponse();
      }

      const nodePools = await mswDB.getAll('kubernetesNodePools');
      const deleteNodePoolPromises = nodePools
        ? nodePools
            .filter((pool: MockKubeNodePoolResponse) => pool.clusterId === id)
            .map((pool) =>
              mswDB.delete('kubernetesNodePools', pool.id, mockState)
            )
        : [];

      await Promise.all(deleteNodePoolPromises);
      await mswDB.delete('kubernetesClusters', id, mockState);

      queueEvents({
        mockState,
        event: {
          action: 'lke_cluster_delete',
          entity: {
            id: cluster.id,
            label: cluster.label,
            type: 'lke',
            url: `/v4/lke/clusters/${cluster.id}`,
          },
        },
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];

export const getKubernetesVersions = () => [
  http.get(
    '*/v4/lke/versions',
    ({
      request,
    }): StrictResponse<
      APIErrorResponse | APIPaginatedResponse<KubernetesVersion>
    > => {
      const versions = kubernetesVersionFactory.buildList(3);

      // Send the data in this explicit order to match the API.
      request.headers.set('X-Filter', JSON.stringify({ '+order': 'desc' }));

      return makePaginatedResponse({
        data: versions,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/lke/tiers/standard/versions',
    ({
      request,
    }): StrictResponse<
      APIErrorResponse | APIPaginatedResponse<KubernetesTieredVersion>
    > => {
      // Send the data in this explicit order to match the API.
      request.headers.set('X-Filter', JSON.stringify({ '+order': 'desc' }));

      const versions = kubernetesStandardTierVersionFactory.buildList(3);
      return makePaginatedResponse({
        data: versions,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/lke/tiers/enterprise/versions',
    ({
      request,
    }): StrictResponse<
      APIErrorResponse | APIPaginatedResponse<KubernetesTieredVersion>
    > => {
      const kubeVersion1 = kubernetesEnterpriseTierVersionFactory.build({
        id: 'v1.31.8+lke1',
      });
      const kubeVersion2 = kubernetesEnterpriseTierVersionFactory.build({
        id: 'v1.31.6+lke3',
      });
      const kubeVersion3 = kubernetesEnterpriseTierVersionFactory.build({
        id: 'v1.31.6+lke2',
      });
      const kubeVersion4 = kubernetesEnterpriseTierVersionFactory.build({
        id: 'v1.31.1+lke4',
      });
      const versions = [kubeVersion1, kubeVersion2, kubeVersion3, kubeVersion4];

      // Send the data in this explicit order to match the API.
      request.headers.set('X-Filter', JSON.stringify({ '+order': 'desc' }));

      return makePaginatedResponse({
        data: versions,
        request,
      });
    }
  ),
];

// The pools endpoint doesn't contain the clusterId needed for linkage in the mock DB, so extend the type here.
export interface MockKubeNodePoolResponse extends KubeNodePoolResponse {
  clusterId: number;
}
export interface MockKubeNodePoolBetaResponse extends KubeNodePoolResponse {
  clusterId: number;
}

export const createKubernetesNodePools = (mockState: MockState) => [
  http.post(
    '*/v4*/lke/clusters/:id/pools',
    async ({
      request,
      params,
    }): Promise<
      StrictResponse<APIErrorResponse | MockKubeNodePoolResponse>
    > => {
      const clusterId = Number(params.id);
      const payload = await request.clone().json();
      const clusters = await mswDB.getAll('kubernetesClusters');

      if (!clusters) {
        return makeNotFoundResponse();
      }

      const nodePool: MockKubeNodePoolResponse = {
        ...nodePoolFactory.build({
          nodes: kubeLinodeFactory.buildList(payload.count),
          ...payload,
        }),
        clusterId,
      };
      await mswDB.add('kubernetesNodePools', nodePool, mockState);

      return makeResponse(nodePool);
    }
  ),
];

export const getKubernetesNodePools = () => [
  http.get(
    '*/v4*/lke/clusters/:id/pools',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<
        APIErrorResponse | APIPaginatedResponse<MockKubeNodePoolResponse>
      >
    > => {
      const clusterId = Number(params.id);
      const clusters = await mswDB.getAll('kubernetesClusters');
      const nodePools = (await mswDB.getAll(
        'kubernetesNodePools'
      )) as MockKubeNodePoolResponse[];

      if (!clusters || !nodePools) {
        return makeNotFoundResponse();
      }

      const clusterNodePools = nodePools.filter(
        (pool) => pool.clusterId === clusterId
      );

      return makePaginatedResponse({ data: clusterNodePools, request });
    }
  ),

  http.get(
    '*/v4/lke/clusters/:id/pools/:poolId',
    async ({
      params,
    }): Promise<
      StrictResponse<APIErrorResponse | MockKubeNodePoolResponse[]>
    > => {
      const clusterId = Number(params.id);
      const poolId = Number(params?.poolId);
      const clusters = await mswDB.getAll('kubernetesClusters');
      const nodePools = (await mswDB.getAll(
        'kubernetesNodePools'
      )) as MockKubeNodePoolResponse[];

      if (!clusters || !nodePools) {
        return makeNotFoundResponse();
      }

      const clusterNodePools = nodePools.filter(
        (pool) => pool.clusterId === clusterId
      );
      const nodePool = clusterNodePools.filter((pool) => pool.id === poolId);

      return makeResponse(nodePool);
    }
  ),
];

export const updateKubernetesNodePools = (mockState: MockState) => [
  http.put(
    '*/v4/lke/clusters/:id/pools/:poolId',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | KubeNodePoolResponse>> => {
      const poolId = Number(params.poolId);
      const nodePools = await mswDB.getAll('kubernetesNodePools');

      if (!nodePools) {
        return makeNotFoundResponse();
      }

      const existingPool = nodePools.find((pool) => pool.id === poolId);

      if (!existingPool) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const nodeCount = payload?.count ?? existingPool.count;

      const updatedPool = {
        ...existingPool,
        ...payload,
        nodes: kubeLinodeFactory.buildList(nodeCount),
        updated: DateTime.now().toISO(),
      };

      await mswDB.update('kubernetesNodePools', poolId, updatedPool, mockState);

      return makeResponse(updatedPool);
    }
  ),

  http.post(
    '*/v4/lke/clusters/:id/pools/:poolId/recycle',
    async ({}): Promise<StrictResponse<APIErrorResponse | {}>> => {
      return makeResponse({});
    }
  ),
];

export const deleteKubernetesNodePools = (mockState: MockState) => [
  http.delete(
    '*/v4/lke/clusters/:id/pools/:poolId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.poolId);
      const nodePools = await mswDB.getAll('kubernetesNodePools');

      const deleteNodePoolPromises = nodePools
        ? nodePools
            .filter((pool) => pool.id === id)
            .map((pool) =>
              mswDB.delete('kubernetesNodePools', pool.id, mockState)
            )
        : [];

      await Promise.all(deleteNodePoolPromises);
      await mswDB.delete('kubernetesClusters', id, mockState);

      return makeResponse({});
    }
  ),
];
