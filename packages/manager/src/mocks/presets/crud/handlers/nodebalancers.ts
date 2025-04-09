import {
  nodeBalancerConfigFactory,
  nodeBalancerConfigNodeFactory,
  nodeBalancerFactory,
  nodeBalancerStatsFactory,
} from '@linode/utilities';
import { DateTime } from 'luxon';
import { http } from 'msw';

import { firewallDeviceFactory, nodeBalancerTypeFactory } from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type {
  Firewall,
  FirewallDeviceEntityType,
  NodeBalancer,
  NodeBalancerConfig,
  NodeBalancerConfigNode,
  NodeBalancerStats,
  PriceType,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

const getNodebalancerInfo = async (id: number) => {
  const nodeBalancer = await mswDB.get('nodeBalancers', id);
  if (!nodeBalancer) {
    return makeNotFoundResponse();
  }

  return makeResponse(nodeBalancer);
};

export const getNodeBalancers = (mockState: MockState) => [
  http.get(
    '*/v4/nodebalancers',
    ({
      request,
    }): StrictResponse<
      APIErrorResponse | APIPaginatedResponse<NodeBalancer>
    > => {
      return makePaginatedResponse({
        data: mockState.nodeBalancers,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/nodebalancers/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancer>> =>
      await getNodebalancerInfo(Number(params.id))
  ),

  http.get(
    '*/v4beta/nodebalancers/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancer>> =>
      await getNodebalancerInfo(Number(params.id))
  ),

  http.get(
    '*/v4/nodebalancers/:id/configs',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<
        APIErrorResponse | APIPaginatedResponse<NodeBalancerConfig>
      >
    > => {
      const nodeBalancerId = Number(params.id);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      const nodeBalancerConfigs = await mswDB.getAll('nodeBalancerConfigs');

      if (!nodeBalancer || !nodeBalancerConfigs) {
        return makeNotFoundResponse();
      }

      const configs = nodeBalancerConfigs.filter(
        (config) => config.nodebalancer_id === nodeBalancerId
      );

      return makePaginatedResponse({
        data: configs,
        request,
      });
    }
  ),

  http.get(
    '*/v4/nodebalancers/:id/configs/:configId',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancerConfig>> => {
      const nodeBalancerId = Number(params.id);
      const configId = Number(params.configId);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      const nodeBalancerConfig = await mswDB.get(
        'nodeBalancerConfigs',
        configId
      );

      if (!nodeBalancer || !nodeBalancerConfig) {
        return makeNotFoundResponse();
      }

      return makeResponse(nodeBalancerConfig);
    }
  ),

  http.get(
    '*v4/nodebalancers/:id/configs/:configId/nodes',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<
        APIErrorResponse | APIPaginatedResponse<NodeBalancerConfigNode>
      >
    > => {
      const nodeBalancerId = Number(params.id);
      const configId = Number(params.configId);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      const nodeBalancerConfig = await mswDB.get(
        'nodeBalancerConfigs',
        configId
      );
      const nodeBalancerConfigNodes = await mswDB.getAll(
        'nodeBalancerConfigNodes'
      );

      if (!nodeBalancer || !nodeBalancerConfig || !nodeBalancerConfigNodes) {
        return makeNotFoundResponse();
      }

      const configNodes = nodeBalancerConfigNodes.filter(
        (configNode) =>
          configNode.nodebalancer_id === nodeBalancerId &&
          configNode.config_id === configId
      );

      return makePaginatedResponse({
        data: configNodes,
        request,
      });
    }
  ),

  http.get(
    '*/v4/nodebalancers/:id/configs/:configId/nodes/:nodeId',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancerConfigNode>> => {
      const id = Number(params.id);
      const configId = Number(params.configId);
      const configNodeId = Number(params.nodeId);
      const nodeBalancer = await mswDB.get('nodeBalancers', id);
      const nodeBalancerConfig = await mswDB.get(
        'nodeBalancerConfigs',
        configId
      );
      const nodeBalancerConfigNode = await mswDB.get(
        'nodeBalancerConfigNodes',
        configNodeId
      );

      if (!nodeBalancer || !nodeBalancerConfig || !nodeBalancerConfigNode) {
        return makeNotFoundResponse();
      }

      return makeResponse(nodeBalancerConfigNode);
    }
  ),
];

const createNodeBalancerConfig = async (
  nbId: number,
  config: NodeBalancerConfig,
  mockState: MockState
) => {
  const nodeBalancerConfig = nodeBalancerConfigFactory.build({
    ...config,
    nodebalancer_id: nbId,
  });
  const nbConfigMockData = await mswDB.add(
    'nodeBalancerConfigs',
    nodeBalancerConfig,
    mockState
  );
  if (config?.nodes) {
    const createConfigNodePromises = [];
    for (const configNodePayload of config?.nodes as NodeBalancerConfigNode[]) {
      const nodeBalancerConfigNode = nodeBalancerConfigNodeFactory.build({
        ...configNodePayload,
        config_id: nbConfigMockData.id,
        nodebalancer_id: nbId,
      });

      createConfigNodePromises.push(
        mswDB.add('nodeBalancerConfigNodes', nodeBalancerConfigNode, mockState)
      );
    }
    await Promise.all(createConfigNodePromises);
  }
};

export const createNodeBalancer = (mockState: MockState) => [
  http.post(
    '*/v4/nodebalancers',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancer>> => {
      const payload = await request.clone().json();
      const configPayload = payload?.configs;
      const firewallIdPaylaod = payload?.firewall_id;

      delete payload?.configs;
      delete payload?.firewall_id;

      const nodeBalancer = nodeBalancerFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      });

      const nbMockData = await mswDB.add(
        'nodeBalancers',
        nodeBalancer,
        mockState
      );

      if (firewallIdPaylaod) {
        const firewall = await mswDB.get('firewalls', firewallIdPaylaod);
        if (firewall) {
          const entity = {
            id: nodeBalancer.id,
            label: nodeBalancer.label,
            type: 'nodebalancer' as FirewallDeviceEntityType,
            url: `/nodebalancer/${nodeBalancer.id}`,
          };
          const updatedFirewall = {
            ...firewall,
            entities: [...firewall.entities, entity],
          };

          const firewallDevice = firewallDeviceFactory.build({
            created: DateTime.now().toISO(),
            entity,
            updated: DateTime.now().toISO(),
          });

          await mswDB.add(
            'firewallDevices',
            [firewall.id, firewallDevice],
            mockState
          );

          await mswDB.update(
            'firewalls',
            firewall.id,
            updatedFirewall,
            mockState
          );

          queueEvents({
            event: {
              action: 'firewall_device_add',
              entity: {
                id: firewall.id,
                label: firewall.label,
                type: 'firewallDevice',
                url: `/v4beta/networking/firewalls/${firewall.id}/nodebalancers`,
              },
            },
            mockState,
            sequence: [{ status: 'notification' }],
          });
        }
      }

      const createConfigPromises: Promise<void>[] = configPayload?.map(
        (config: NodeBalancerConfig) =>
          createNodeBalancerConfig(nbMockData.id, config, mockState)
      );

      await Promise.all(createConfigPromises);
      queueEvents({
        event: {
          action: 'nodebalancer_create',
          entity: {
            id: nodeBalancer.id,
            label: nodeBalancer.label,
            type: 'firewall',
            url: `/v4/nodebalancers/${nodeBalancer.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(nodeBalancer);
    }
  ),
  http.post(
    '*/v4/nodebalancers/:id/configs',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancerConfig>> => {
      const nodeBalancerId = Number(params.id);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);

      if (!nodeBalancer) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();

      const nodeBalancerConfig = nodeBalancerConfigFactory.build({
        ...payload,
        nodebalancer_id: nodeBalancerId,
      });

      await mswDB.add('nodeBalancerConfigs', nodeBalancerConfig, mockState);

      queueEvents({
        event: {
          action: 'nodebalancer_config_create',
          entity: {
            id: nodeBalancerId,
            label: nodeBalancer.label,
            type: 'nodebalancer',
            url: `/v4/nodebalancers/${nodeBalancerId}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(nodeBalancerConfig);
    }
  ),
  http.post(
    '*/v4/nodebalancers/:id/configs/:configId/nodes',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancerConfigNode>> => {
      const nodeBalancerId = Number(params.id);
      const configId = Number(params.configId);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      const nodeBalancerConfig = await mswDB.get(
        'nodeBalancerConfigs',
        configId
      );

      if (!nodeBalancer || !nodeBalancerConfig) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();

      const nodeBalancerConfigNode = nodeBalancerConfigNodeFactory.build({
        ...payload,
        config_id: configId,
        nodebalancer_id: nodeBalancerId,
      });

      await mswDB.add(
        'nodeBalancerConfigNodes',
        nodeBalancerConfigNode,
        mockState
      );

      queueEvents({
        event: {
          action: 'nodebalancer_node_create',
          entity: {
            id: nodeBalancerId,
            label: nodeBalancer.label,
            type: 'nodebalancer',
            url: `/v4/nodebalancers/${nodeBalancerId}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(nodeBalancerConfigNode);
    }
  ),
];

export const updateNodeBalancer = (mockState: MockState) => [
  http.put(
    '*/v4/nodebalancers/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancer>> => {
      const nodeBalancerId = Number(params.id);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      if (!nodeBalancer) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        updated: DateTime.now().toISO(),
      };

      const updatedNodeBalancer = { ...nodeBalancer, ...payload };
      await mswDB.update(
        'nodeBalancers',
        nodeBalancerId,
        updatedNodeBalancer,
        mockState
      );

      queueEvents({
        event: {
          action: 'nodebalancer_update',
          entity: {
            id: nodeBalancerId,
            label: updatedNodeBalancer.label,
            type: 'nodebalancer',
            url: `/v4/nodebalancers/${nodeBalancerId}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedNodeBalancer);
    }
  ),
  http.put(
    '*/v4/nodebalancers/:id/configs/:configId',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancer>> => {
      const nodeBalancerId = Number(params.id);
      const configId = Number(params.configId);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      const nodeBalancerConfig = await mswDB.get(
        'nodeBalancerConfigs',
        configId
      );

      if (!nodeBalancer || !nodeBalancerConfig) {
        return makeNotFoundResponse();
      }
      const payload = await request.clone().json();
      delete payload?.nodes;

      const updatedNodeBalancerConfig = { ...nodeBalancerConfig, ...payload };
      await mswDB.update(
        'nodeBalancerConfigs',
        configId,
        updatedNodeBalancerConfig,
        mockState
      );

      queueEvents({
        event: {
          action: 'nodebalancer_config_update',
          entity: {
            id: nodeBalancerId,
            label: updatedNodeBalancerConfig.label,
            type: 'nodebalancer',
            url: `/v4/nodebalancers/${nodeBalancerId}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedNodeBalancerConfig);
    }
  ),
  http.put(
    '*/v4/nodebalancers/:id/configs/:configId/nodes/:nodeId',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | NodeBalancer>> => {
      const nodeBalancerId = Number(params.id);
      const configId = Number(params.configId);
      const nodeId = Number(params.nodeId);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      const nodeBalancerConfig = await mswDB.get(
        'nodeBalancerConfigs',
        configId
      );
      const nodeBalancerConfigNode = await mswDB.get(
        'nodeBalancerConfigNodes',
        nodeId
      );
      if (!nodeBalancer || !nodeBalancerConfig || !nodeBalancerConfigNode) {
        return makeNotFoundResponse();
      }
      const payload = await request.clone().json();

      const updatedNodeBalancerConfigNode = {
        ...nodeBalancerConfigNode,
        ...payload,
      };
      await mswDB.update(
        'nodeBalancerConfigNodes',
        nodeId,
        updatedNodeBalancerConfigNode,
        mockState
      );

      queueEvents({
        event: {
          action: 'nodebalancer_config_update',
          entity: {
            id: nodeBalancerId,
            label: updatedNodeBalancerConfigNode.label,
            type: 'nodebalancer',
            url: `/v4/nodebalancers/${nodeBalancerId}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedNodeBalancerConfigNode);
    }
  ),
];

export const deleteNodeBalancer = (mockState: MockState) => [
  http.delete(
    '*/v4/nodebalancers/:id',
    async ({ params }): Promise<StrictResponse<{} | APIErrorResponse>> => {
      const nodeBalancerId = Number(params.id);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      if (!nodeBalancer) {
        return makeNotFoundResponse();
      }

      const nodeBalancerConfigs = await mswDB.getAll('nodeBalancerConfigs');
      const nodeBalancerConfigNodes = await mswDB.getAll(
        'nodeBalancerConfigNodes'
      );
      const deleteConfigPromises = [];
      const deleteConfigNodePromises = [];

      if (nodeBalancerConfigs) {
        const configs = nodeBalancerConfigs.filter(
          (config) => config.nodebalancer_id === nodeBalancerId
        );
        for (const config of configs) {
          deleteConfigPromises.push(
            mswDB.delete('nodeBalancerConfigs', config.id, mockState)
          );
        }
      }
      if (nodeBalancerConfigNodes) {
        const nodes = nodeBalancerConfigNodes.filter(
          (nodes) => nodes.nodebalancer_id === nodeBalancerId
        );
        for (const node of nodes) {
          deleteConfigNodePromises.push(
            mswDB.delete('nodeBalancerConfigs', node.id, mockState)
          );
        }
      }
      await Promise.all(deleteConfigNodePromises);
      await Promise.all(deleteConfigPromises);
      await mswDB.delete('nodeBalancers', nodeBalancerId, mockState);
      queueEvents({
        event: {
          action: 'nodebalancer_delete',
          entity: {
            id: nodeBalancerId,
            label: nodeBalancer.label,
            type: 'nodebalancer',
            url: `/v4/nodebalancers/${nodeBalancerId}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
  http.delete(
    '*/v4/nodebalancers/:id/configs/:configId',
    async ({ params }): Promise<StrictResponse<{} | APIErrorResponse>> => {
      const nodeBalancerId = Number(params.id);
      const configId = Number(params.configId);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      const nodeBalancerConfig = await mswDB.get(
        'nodeBalancerConfigs',
        configId
      );
      if (!nodeBalancer || !nodeBalancerConfig) {
        return makeNotFoundResponse();
      }
      const nodeBalancerConfigNodes = await mswDB.getAll(
        'nodeBalancerConfigNodes'
      );
      const deleteConfigNodePromises = [];
      if (nodeBalancerConfigNodes) {
        const nodes = nodeBalancerConfigNodes.filter(
          (nodes) =>
            nodes.nodebalancer_id === nodeBalancerId &&
            nodes.config_id === configId
        );
        for (const node of nodes) {
          deleteConfigNodePromises.push(
            mswDB.delete('nodeBalancerConfigNodes', node.id, mockState)
          );
        }
      }
      await Promise.all(deleteConfigNodePromises);
      await mswDB.delete('nodeBalancerConfigs', configId, mockState);

      queueEvents({
        event: {
          action: 'nodebalancer_config_delete',
          entity: {
            id: nodeBalancerId,
            label: nodeBalancer.label,
            type: 'nodebalancer',
            url: `/v4/nodebalancers/${nodeBalancerId}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
  http.delete(
    '*/v4/nodebalancers/:id/configs/:configId/nodes/:nodeId',
    async ({ params }): Promise<StrictResponse<{} | APIErrorResponse>> => {
      const nodeBalancerId = Number(params.id);
      const configId = Number(params.configId);
      const nodeId = Number(params.nodeId);
      const nodeBalancer = await mswDB.get('nodeBalancers', nodeBalancerId);
      const nodeBalancerConfig = await mswDB.get(
        'nodeBalancerConfigs',
        configId
      );
      const nodeBalancerConfigNode = await mswDB.get(
        'nodeBalancerConfigNodes',
        nodeId
      );
      if (!nodeBalancer || !nodeBalancerConfig || !nodeBalancerConfigNode) {
        return makeNotFoundResponse();
      }

      const nodeBalancerConfigNodes = await mswDB.getAll(
        'nodeBalancerConfigNodes'
      );

      const node = nodeBalancerConfigNodes?.filter(
        (node) =>
          node.nodebalancer_id === nodeBalancerId &&
          node.config_id === configId &&
          node.id === nodeId
      );
      if (node) {
        mswDB.delete('nodeBalancerConfigNodes', nodeId, mockState);
      }
      queueEvents({
        event: {
          action: 'nodebalancer_node_delete',
          entity: {
            id: nodeBalancerId,
            label: nodeBalancer.label,
            type: 'nodebalancer',
            url: `/v4/nodebalancers/${nodeBalancerId}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];

export const getNodeBalancerTypes = () => [
  http.get(
    '*/v4/nodebalancers/types',
    ({
      request,
    }): StrictResponse<APIErrorResponse | APIPaginatedResponse<PriceType>> => {
      const templates = nodeBalancerTypeFactory.buildList(1);
      return makePaginatedResponse({
        data: templates,
        request,
      });
    }
  ),
];

export const getNodeBalancerStats = (mockState: MockState) => [
  http.get(
    '*/v4/nodebalancers/:id/stats',
    ({ params }): StrictResponse<APIErrorResponse | NodeBalancerStats> => {
      const id = Number(params.id);
      const nodebalancer = mockState.nodeBalancers.find(
        (stateNode) => stateNode.id === id
      );

      if (!nodebalancer) {
        return makeNotFoundResponse();
      }

      const mockStats = nodeBalancerStatsFactory.build();

      return makeResponse(mockStats);
    }
  ),
];

export const getNodeBalancerFirewalls = (mockState: MockState) => [
  http.get(
    '*/v4/nodebalancers/:id/firewalls',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Firewall>>
    > => {
      const id = Number(params.id);
      const nodeBalancer = mockState.nodeBalancers.find(
        (stateNodeBalancer) => stateNodeBalancer.id === id
      );
      const allFirewalls = await mswDB.getAll('firewalls');

      if (!nodeBalancer || !allFirewalls) {
        return makeNotFoundResponse();
      }

      const nodeBalancerFirewalls = allFirewalls.filter((firewall) =>
        firewall.entities.some(
          (entity) => entity.id === id && entity.type === 'nodebalancer'
        )
      );

      return makePaginatedResponse({
        data: nodeBalancerFirewalls,
        request,
      });
    }
  ),
];
