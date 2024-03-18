import { waitFor } from '@testing-library/react';
import * as React from 'react';

import {
  LinodeConfigInterfaceFactory,
  LinodeConfigInterfaceFactoryWithVPC,
  vpcFactory,
} from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { InterfaceListItem } from './InterfaceListItem';

const queryClient = queryClientFactory();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const interfaceListItemTestId = 'interface-list-item';

describe('InterfaceListItem', () => {
  it('should return the correct text for a public interface', () => {
    const publicInterface = LinodeConfigInterfaceFactory.build({
      ipam_address: null,
      purpose: 'public',
    });

    const { getByTestId } = renderWithTheme(
      <InterfaceListItem idx={0} interfaceEntry={publicInterface} />
    );

    expect(getByTestId(interfaceListItemTestId).innerHTML).toEqual(
      'eth0 – Public Internet'
    );
  });

  it('should return the correct text for a VLAN interface', () => {
    const vlanInterface = LinodeConfigInterfaceFactory.build();

    const { getByTestId } = renderWithTheme(
      <InterfaceListItem idx={1} interfaceEntry={vlanInterface} />
    );

    expect(getByTestId(interfaceListItemTestId).innerHTML).toEqual(
      `eth1 – VLAN: ${vlanInterface.label} (${vlanInterface.ipam_address})`
    );
  });

  it('should return the correct text for a VPC interface', async () => {
    const vpc = vpcFactory.build({
      id: 1,
      label: 'first-vpc',
    });

    const vpcInterface = LinodeConfigInterfaceFactoryWithVPC.build({
      vpc_id: 1,
    });

    server.use(
      http.get('*/vpcs/:vpcId', () => {
        return HttpResponse.json(vpc);
      })
    );

    const { getByTestId } = renderWithTheme(
      <InterfaceListItem idx={2} interfaceEntry={vpcInterface} />,
      { queryClient }
    );

    await waitFor(() => {
      expect(getByTestId(interfaceListItemTestId).innerHTML).toEqual(
        `eth2 – VPC: ${vpc.label} (${vpcInterface.ipv4?.vpc})`
      );
    });
  });
});
