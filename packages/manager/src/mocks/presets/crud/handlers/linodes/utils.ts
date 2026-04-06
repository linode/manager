import { DateTime } from 'luxon';

import { mswDB } from '../../../../indexedDB';

import type { MockState } from 'src/mocks/types';
// shared functionality between different linode related handlers

export const addInterfaceToSubnet = async (inputs: {
  configId?: number;
  interfaceId: number;
  isLinodeInterface: boolean;
  linodeId: number;
  mockState: MockState;
  subnetId?: null | number;
  vpcId?: null | number;
}) => {
  const {
    mockState,
    configId,
    interfaceId,
    isLinodeInterface,
    linodeId,
    subnetId,
    vpcId,
  } = inputs;
  // Update corresponding VPC when creating a VPC Linode Interface
  const subnetFromDB = await mswDB.get('subnets', subnetId ?? -1);
  const vpc = await mswDB.get('vpcs', vpcId ?? subnetFromDB?.[0] ?? -1);

  if (subnetFromDB && vpc) {
    // update VPC/subnet to include this new interface
    const updatedSubnet = {
      ...subnetFromDB[1],
      linodes: [
        ...subnetFromDB[1].linodes,
        {
          id: linodeId,
          interfaces: [
            {
              active: true,
              config_id: isLinodeInterface ? null : (configId ?? -1),
              // ensure interface ID in subnet matches interface ID in DB
              id: interfaceId,
            },
          ],
        },
      ],
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
      subnetFromDB[1].id,
      [vpc.id, updatedSubnet],
      mockState
    );
    await mswDB.update('vpcs', vpc.id, updatedVPC, mockState);
  }
};

export const removeInterfaceFromSubnet = async (inputs: {
  configId?: number;
  interfaceId: number;
  isLinodeInterface: boolean;
  mockState: MockState;
  subnetId: number;
  vpcId?: null | number;
}) => {
  const {
    mockState,
    configId,
    interfaceId,
    isLinodeInterface,
    subnetId,
    vpcId,
  } = inputs;

  const subnetFromDB = await mswDB.get('subnets', subnetId);
  const vpc = await mswDB.get('vpcs', vpcId ?? subnetFromDB?.[0] ?? -1);

  if (subnetFromDB && vpc) {
    // update VPC/subnet to remove interface
    const updatedLinodeData = subnetFromDB[1].linodes
      .map((data) => {
        return {
          ...data,
          interfaces: data.interfaces.filter(
            (iface) =>
              iface.id !== interfaceId &&
              (isLinodeInterface
                ? iface.config_id === null
                : iface.config_id === configId)
          ),
        };
      })
      .filter((linode) => linode.interfaces.length > 0);

    const updatedSubnet = {
      ...subnetFromDB[1],
      linodes: updatedLinodeData,
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
      subnetFromDB[1].id,
      [vpc.id, updatedSubnet],
      mockState
    );
    await mswDB.update('vpcs', vpc.id, updatedVPC, mockState);
  }
};
