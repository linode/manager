import React from 'react';
import userEvent from '@testing-library/user-event';
import { waitForElementToBeRemoved } from '@testing-library/react';

import {
  LinodeConfigInterfaceFactory,
  linodeConfigFactory,
} from 'src/factories';
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

  const publicInterface = LinodeConfigInterfaceFactory.build({
    primary: true,
    purpose: 'public',
  });

  const vpcInterface = LinodeConfigInterfaceFactory.build({
    ipv4: {
      nat_1_1: '10.0.0.0',
    },
    primary: false,
    purpose: 'vpc',
  });

  const vpcInterfaceWithoutNAT = LinodeConfigInterfaceFactory.build({
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
        primaryInterfaceIndex: editableFieldsWithoutVPCInterface.interfaces.findIndex(
          (element) => element.primary === true
        ),
        thisIndex: 0,
        values: editableFieldsWithoutVPCInterface,
      });

      expect(valueReturned?.props.text).toBe(undefined);
    });
  });

  it('should display the correct network interfaces', async () => {
    const props = {
      isReadOnly: false,
      linodeId: 0,
      onClose: vi.fn(),
    };

    const {
      getAllByPlaceholderText,
      findByText,
      getByTestId,
      rerender,
    } = renderWithTheme(
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

    const loadingTestId = 'circle-progress';
    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const interfaceSelectMenu = getAllByPlaceholderText('Select an Interface');

    await userEvent.click(interfaceSelectMenu[0]);

    await findByText('VPC');
    await findByText('Public Internet');
  });
});
