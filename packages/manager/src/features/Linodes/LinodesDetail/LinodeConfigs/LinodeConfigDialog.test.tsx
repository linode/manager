import { linodeConfigInterfaceFactory, linodeFactory } from '@linode/utilities';
import React from 'react';

import { linodeConfigFactory } from 'src/factories';
import { LKE_ENTERPRISE_LINODE_VPC_CONFIG_WARNING } from 'src/features/Kubernetes/constants';
import {
  LINODE_UNREACHABLE_HELPER_TEXT,
  NATTED_PUBLIC_IP_HELPER_TEXT,
  NOT_NATTED_HELPER_TEXT,
} from 'src/features/VPCs/constants';
import 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeConfigDialog, padList } from './LinodeConfigDialog';
import { unrecommendedConfigNoticeSelector } from './LinodeConfigDialog';

import type { MemoryLimit } from './LinodeConfigDialog';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
  useLinodeQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

describe('LinodeConfigDialog', () => {
  describe('padInterface helper method', () => {
    it('should return a list of the correct length unchanged', () => {
      expect(padList([1, 2, 3], 0, 3)).toEqual([1, 2, 3]);
    });

    it('should add the padder until the specified length is reached', () => {
      expect(padList([1], 0, 5)).toEqual([1, 0, 0, 0, 0]);
    });

    it('should return a list longer than the limit unchanged', () => {
      expect(padList([1, 2, 3, 4, 5], 0, 2)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  const publicInterface = linodeConfigInterfaceFactory.build({
    primary: true,
    purpose: 'public',
  });

  const vpcInterface = linodeConfigInterfaceFactory.build({
    ipv4: {
      nat_1_1: '10.0.0.0',
    },
    primary: false,
    purpose: 'vpc',
  });

  const vpcInterfaceWithoutNAT = linodeConfigInterfaceFactory.build({
    primary: false,
    purpose: 'vpc',
  });

  const editableFields = {
    devices: {},
    helpers: {
      devtmpfs_automount: true,
      distro: true,
      modules_dep: true,
      network: true,
      updatedb_disabled: true,
    },
    initrd: null,
    interfaces: [publicInterface, vpcInterface],
    label: 'Test',
    root_device: '/dev/sda',
    setMemoryLimit: 'no_limit' as MemoryLimit,
    useCustomRoot: false,
  };

  describe('unrecommendedConfigNoticeSelector function', () => {
    it('should return a <Notice /> with NATTED_PUBLIC_IP_HELPER_TEXT under the appropriate conditions', () => {
      const valueReturned = unrecommendedConfigNoticeSelector({
        _interface: vpcInterface,
        isLKEEnterpriseCluster: false,
        primaryInterfaceIndex: editableFields.interfaces.findIndex(
          (element) => element.primary === true
        ),
        thisIndex: editableFields.interfaces.findIndex(
          (element) => element.purpose === 'vpc'
        ),
        values: editableFields,
      });

      expect(valueReturned?.props.text).toEqual(NATTED_PUBLIC_IP_HELPER_TEXT);
    });

    it('should return a <Notice /> with LINODE_UNREACHABLE_HELPER_TEXT under the appropriate conditions', () => {
      const editableFieldsWithVPCInterfaceNotNatted = {
        ...editableFields,
        interfaces: [publicInterface, vpcInterfaceWithoutNAT],
      };

      const valueReturned = unrecommendedConfigNoticeSelector({
        _interface: vpcInterfaceWithoutNAT,
        isLKEEnterpriseCluster: false,
        primaryInterfaceIndex: editableFields.interfaces.findIndex(
          (element) => element.primary === true
        ),
        thisIndex: editableFields.interfaces.findIndex(
          (element) => element.purpose === 'vpc'
        ),
        values: editableFieldsWithVPCInterfaceNotNatted,
      });

      expect(valueReturned?.props.text).toEqual(LINODE_UNREACHABLE_HELPER_TEXT);
    });

    it('should return a <Notice /> with NOT_NATTED_HELPER_TEXT under the appropriate conditions', () => {
      const vpcInterfacePrimaryWithoutNAT = {
        ...vpcInterfaceWithoutNAT,
        primary: true,
      };

      const editableFieldsWithSingleInterface = {
        ...editableFields,
        interfaces: [vpcInterfacePrimaryWithoutNAT],
      };

      const valueReturned = unrecommendedConfigNoticeSelector({
        _interface: vpcInterfacePrimaryWithoutNAT,
        isLKEEnterpriseCluster: false,
        primaryInterfaceIndex: editableFieldsWithSingleInterface.interfaces.findIndex(
          (element) => element.primary === true
        ),
        thisIndex: editableFieldsWithSingleInterface.interfaces.findIndex(
          (element) => element.purpose === 'vpc'
        ),
        values: editableFieldsWithSingleInterface,
      });

      expect(valueReturned?.props.text).toEqual(NOT_NATTED_HELPER_TEXT);
    });

    it('should not return a <Notice /> outside of the prescribed conditions', () => {
      const editableFieldsWithoutVPCInterface = {
        ...editableFields,
        interfaces: [publicInterface],
      };

      const valueReturned = unrecommendedConfigNoticeSelector({
        _interface: publicInterface,
        isLKEEnterpriseCluster: false,
        primaryInterfaceIndex: editableFieldsWithoutVPCInterface.interfaces.findIndex(
          (element) => element.primary === true
        ),
        thisIndex: 0,
        values: editableFieldsWithoutVPCInterface,
      });

      expect(valueReturned?.props.text).toBe(undefined);
    });

    it('should return a <Notice /> with LKE_ENTERPRISE_LINODE_VPC_CONFIG_WARNING text if the Linode is associated with a LKE-E cluster', () => {
      const valueReturned = unrecommendedConfigNoticeSelector({
        _interface: vpcInterface,
        isLKEEnterpriseCluster: true,
        primaryInterfaceIndex: editableFields.interfaces.findIndex(
          (element) => element.primary === true
        ),
        thisIndex: editableFields.interfaces.findIndex(
          (element) => element.purpose === 'vpc'
        ),
        values: editableFields,
      });

      expect(valueReturned?.props.text).toEqual(
        LKE_ENTERPRISE_LINODE_VPC_CONFIG_WARNING
      );
    });
  });

  it('should display the correct network interfaces', async () => {
    const props = {
      isReadOnly: false,
      linodeId: 0,
      onClose: vi.fn(),
    };

    const { findByDisplayValue, rerender } = renderWithTheme(
      <LinodeConfigDialog config={undefined} open={false} {...props} />
    );

    rerender(
      <LinodeConfigDialog
        config={linodeConfigFactory.build({
          interfaces: [vpcInterface, publicInterface],
        })}
        open
        {...props}
      />
    );

    await findByDisplayValue('VPC');
    await findByDisplayValue('Public Internet');
  });

  it('should hide the Network Interfaces section if Linode uses new interfaces', () => {
    const props = {
      isReadOnly: false,
      linodeId: 1,
      onClose: vi.fn(),
    };

    const linode = linodeFactory.build({ interface_generation: 'linode' });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: linode,
    });

    queryMocks.useFlags.mockReturnValue({
      linodeInterfaces: { enabled: true },
    });

    const { queryByLabelText } = renderWithTheme(
      <LinodeConfigDialog
        config={linodeConfigFactory.build({ interfaces: null })}
        open={true}
        {...props}
      />
    );

    expect(
      queryByLabelText('Primary Interface (Default Route)')
    ).not.toBeInTheDocument();
    expect(queryByLabelText('eth0')).not.toBeInTheDocument();
    expect(queryByLabelText('eth1')).not.toBeInTheDocument();
    expect(queryByLabelText('eth2')).not.toBeInTheDocument();
  });
});
