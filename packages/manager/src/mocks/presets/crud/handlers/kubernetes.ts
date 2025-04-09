// packages/manager/src/mocks/presets/crud/handlers/kubernetes.ts

import { DateTime } from 'luxon';
import { http } from 'msw';

import {
  kubernetesClusterFactory,
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
    '*/v4/lke/clusters/:id/pools',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<
        APIErrorResponse | APIPaginatedResponse<KubeNodePoolResponse>
      >
    > => {
      const id = Number(params.id);
      const cluster = await mswDB.get('kubernetesClusters', id);
      const nodePools = await mswDB.getAll('kubernetesNodePools');

      if (!cluster || !nodePools) {
        return makeNotFoundResponse();
      }

      const clusterPools = nodePools.filter((pool) => pool.id === id);

      return makePaginatedResponse({
        data: clusterPools,
        request,
      });
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
      });

      const createNodePoolPromises = (payload.node_pools || []).map(
        (poolData: KubeNodePoolResponse) =>
          mswDB.add(
            'kubernetesNodePools',
            nodePoolFactory.build({
              ...poolData,
            }),
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
      });

      const createNodePoolPromises = (payload.node_pools || []).map(
        (poolData: KubeNodePoolResponse) =>
          mswDB.add(
            'kubernetesNodePools',
            nodePoolFactory.build({
              ...poolData,
            }),
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
