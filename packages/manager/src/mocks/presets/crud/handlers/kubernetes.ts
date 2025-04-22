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
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getKubernetesClusters = (mockState: MockState) => [
  http.get(
    '*/v4/lke/clusters',
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
    '*/v4beta/lke/clusters',
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
    '*/v4/lke/clusters/:id',
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
    '*/v4beta/lke/clusters/:id',
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

      const cluster = kubernetesClusterFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
        tier: payload.tier,
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
            .filter((pool) => pool.id === id)
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
      const versions = kubernetesEnterpriseTierVersionFactory.buildList(3);
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

export const createKubernetesNodePools = (mockState: MockState) => [
  http.post(
    '*/v4/lke/clusters/:id/pools',
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
    '*/v4/lke/clusters/:id/pools',
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
