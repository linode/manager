import { DateTime } from 'luxon';
import { http } from 'msw';

import { subnetFactory, vpcFactory, vpcIPFactory } from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeErrorResponse,
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type { CreateSubnetPayload, Subnet, VPC, VPCIP } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getVPCs = () => [
  http.get(
    '*/v4beta/vpcs',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<VPC>>
    > => {
      const vpcs = await mswDB.getAll('vpcs');

      if (!vpcs) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: vpcs,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/vpcs/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | VPC>> => {
      const id = Number(params.id);
      const vpc = await mswDB.get('vpcs', id);

      if (!vpc) {
        return makeNotFoundResponse();
      }

      return makeResponse(vpc);
    }
  ),

  http.get(
    '*/v4beta/vpcs/:id/subnets',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Subnet>>
    > => {
      const id = Number(params.id);
      const vpc = await mswDB.get('vpcs', id);
      const subnetsFromDB = await mswDB.getAll('subnets');

      if (!vpc || !subnetsFromDB) {
        return makeNotFoundResponse();
      }

      const subnets = subnetsFromDB
        .filter((subnetTuple) => subnetTuple[0] === id)
        .map((subnetTuple) => subnetTuple[1]);

      return makePaginatedResponse({
        data: subnets,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/vpcs/:id/subnets/:subnetId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Subnet>> => {
      const id = Number(params.id);
      const subnetId = Number(params.subnetId);
      const vpc = await mswDB.get('vpcs', id);
      const subnet = await mswDB.get('subnets', subnetId);

      if (!vpc || !subnet) {
        return makeNotFoundResponse();
      }

      return makeResponse(subnet[1]);
    }
  ),
];

export const createVPC = (mockState: MockState) => [
  http.post(
    '*/v4beta/vpcs',
    async ({ request }): Promise<StrictResponse<APIErrorResponse | VPC>> => {
      const payload = await request.clone().json();

      const vpc = vpcFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        subnets: [],
        updated: DateTime.now().toISO(),
      });

      const createSubnetPromises = [];
      const vpcSubnets: Subnet[] = [];

      if (payload.subnets) {
        for (const subnetPayload of payload.subnets as CreateSubnetPayload[]) {
          const subnet = subnetFactory.build({
            ...subnetPayload,
            created: DateTime.now().toISO(),
            linodes: [],
            nodebalancers: [],
            updated: DateTime.now().toISO(),
          });
          vpcSubnets.push(subnet);
        }
      }

      // sometimes our factory generates an already existing ID. We must get the actual
      // ID of the newly created VPC in our mock DB
      const createdVPC = await mswDB.add(
        'vpcs',
        { ...vpc, subnets: vpcSubnets },
        mockState
      );

      const vpcIp = vpcIPFactory.build({
        vpc_id: createdVPC.id,
      });

      // add entry for VPC IP
      mswDB.add('vpcsIps', vpcIp, mockState);

      // so that we can assign subnets to the correct VPC
      for (const subnet of vpcSubnets) {
        createSubnetPromises.push(
          mswDB.add('subnets', [createdVPC.id, subnet], mockState)
        );
      }

      // afterwards, we have to update our newly created VPC with the recently created subnets
      // so that all subnet IDs match back
      const returnedSubnets = await Promise.all(createSubnetPromises);
      const actualSubnets = returnedSubnets.map(
        (subnetFromDB) => subnetFromDB[1]
      );

      await mswDB.update(
        'vpcs',
        createdVPC.id,
        {
          ...createdVPC,
          subnets: actualSubnets,
        },
        mockState
      );

      queueEvents({
        event: {
          action: 'vpc_create',
          entity: {
            id: vpc.id,
            label: vpc.label,
            type: 'vpc',
            url: `/v4/vpcs/${vpc.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(createdVPC);
    }
  ),
];

export const updateVPC = (mockState: MockState) => [
  http.put(
    '*/v4beta/vpcs/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | VPC>> => {
      const id = Number(params.id);
      const vpc = await mswDB.get('vpcs', id);

      if (!vpc) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        updated: DateTime.now().toISO(),
      };
      const updatedVPC = { ...vpc, ...payload };

      await mswDB.update('vpcs', id, updatedVPC, mockState);

      queueEvents({
        event: {
          action: 'vpc_update',
          entity: {
            id: updatedVPC.id,
            label: updatedVPC.label,
            type: 'vpc',
            url: `/v4/vpcs/${updatedVPC.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedVPC);
    }
  ),
];

export const deleteVPC = (mockState: MockState) => [
  http.delete(
    '*/v4beta/vpcs/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const vpc = await mswDB.get('vpcs', id);

      if (!vpc) {
        return makeNotFoundResponse();
      }

      if (
        vpc.subnets.some(
          (subnet) =>
            subnet.linodes.length > 0 || subnet.nodebalancers.length > 0
        )
      ) {
        return makeErrorResponse('Cannot delete a VPC with resources attached');
      }

      const vpcsIPs = await mswDB.getAll('vpcsIps');
      const deleteVPCsIPsPromises = [];

      if (vpcsIPs) {
        const vpcsIPsWithMatchingVPCId = vpcsIPs?.filter(
          (vpcIP) => vpcIP.vpc_id === id
        );
        for (const vpcIP of vpcsIPsWithMatchingVPCId) {
          deleteVPCsIPsPromises.push(
            mswDB.delete('vpcsIps', vpcIP.vpc_id, mockState)
          );
        }
      }

      const deleteSubnetPromises = [];

      for (const subnet of vpc.subnets) {
        deleteSubnetPromises.push(
          mswDB.delete('subnets', subnet.id, mockState)
        );
      }

      await Promise.all(deleteSubnetPromises);
      await Promise.all(deleteVPCsIPsPromises);
      await mswDB.delete('vpcs', id, mockState);

      queueEvents({
        event: {
          action: 'vpc_delete',
          entity: {
            id: vpc.id,
            label: vpc.label,
            type: 'vpc',
            url: `/v4/vpc/${vpc.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];

export const createSubnet = (mockState: MockState) => [
  http.post(
    '*/v4beta/vpcs/:id/subnets',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Subnet>> => {
      const vpcId = Number(params.id);
      const vpc = await mswDB.get('vpcs', vpcId);

      if (!vpc) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();

      const subnet = subnetFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        linodes: [],
        updated: DateTime.now().toISO(),
      });

      const updatedVPC = {
        ...vpc,
        subnets: [...vpc.subnets, subnet],
      };

      await mswDB.add('subnets', [vpcId, subnet], mockState);

      await mswDB.update('vpcs', vpcId, updatedVPC, mockState);

      queueEvents({
        event: {
          action: 'subnet_create',
          entity: {
            id: vpcId,
            label: vpc.label,
            type: 'subnet',
            url: `/v4/vpcs/${vpcId}/subnets`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(subnet);
    }
  ),
];

export const updateSubnet = (mockState: MockState) => [
  http.put(
    '*/v4beta/vpcs/:id/subnets/:subnetId',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Subnet>> => {
      const vpcId = Number(params.id);
      const subnetId = Number(params.subnetId);
      const vpc = await mswDB.get('vpcs', vpcId);
      const subnetFromDB = await mswDB.get('subnets', subnetId);

      if (!vpc || !subnetFromDB) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();

      const updatedSubnet = {
        ...subnetFromDB[1],
        ...payload,
        updated: DateTime.now().toISO(),
      };

      const updatedVPC = {
        ...vpc,
        subnets: vpc.subnets.map((subnet) => {
          if (subnet.id === subnetFromDB[1].id) {
            return updatedSubnet;
          }

          return subnet;
        }),
      };

      await mswDB.update(
        'subnets',
        subnetId,
        [vpcId, updatedSubnet],
        mockState
      );

      await mswDB.update('vpcs', vpcId, updatedVPC, mockState);

      queueEvents({
        event: {
          action: 'subnet_update',
          entity: {
            id: vpc.id,
            label: vpc.label,
            type: 'subnets',
            url: `/v4/vpcs/${vpcId}/subnets`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedSubnet);
    }
  ),
];

export const deleteSubnet = (mockState: MockState) => [
  http.delete(
    '*/v4beta/vpcs/:id/subnets/:subnetId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const vpcId = Number(params.id);
      const subnetId = Number(params.subnetId);
      const vpc = await mswDB.get('vpcs', vpcId);
      const subnetFromDB = await mswDB.get('subnets', subnetId);

      if (!vpc || !subnetFromDB) {
        return makeNotFoundResponse();
      }

      if (
        subnetFromDB[1].linodes.length > 0 ||
        subnetFromDB[1].nodebalancers.length > 0
      ) {
        return makeErrorResponse(
          'Cannot delete a subnet with resources associated with it'
        );
      }

      const updatedVPC = {
        ...vpc,
        subnets: vpc.subnets.filter(
          (subnet) => subnet.id !== subnetFromDB[1].id
        ),
      };

      await mswDB.delete('subnets', subnetId, mockState);
      await mswDB.update('vpcs', vpcId, updatedVPC, mockState);

      queueEvents({
        event: {
          action: 'subnet_delete',
          entity: {
            id: vpc.id,
            label: vpc.label,
            type: 'subnet',
            url: `/v4/vpcs/${vpc.id}/subnets`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];

export const getVPCIPs = () => [
  http.get(
    '*/v4beta/vpcs/ips',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<VPCIP>>
    > => {
      const vpcsIPs = await mswDB.getAll('vpcsIps');

      if (!vpcsIPs) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: vpcsIPs,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/vpcs/:vpcId/ips',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<VPCIP>>
    > => {
      const vpcsIPs = await mswDB.getAll('vpcsIps');
      const specificVPCIPs = vpcsIPs?.filter(
        (ip) => ip.vpc_id === +params.vpcId
      );

      if (!specificVPCIPs) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: specificVPCIPs,
        request,
      });
    }
  ),
];
