import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { LinodeConfigInterfaceFactoryWithVPC } from 'src/factories/linodeConfigInterfaceFactory';
import { linodeIPFactory } from 'src/factories/linodes';
import {
  ipResponseToDisplayRows,
  vpcConfigInterfaceToDisplayRows,
} from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT } from 'src/features/Linodes/PublicIPAddressesTooltip';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { LinodeIPAddressRow } from './LinodeIPAddressRow';

import type { IPAddressRowHandlers } from './LinodeIPAddressRow';

const ips = linodeIPFactory.build();
const ipDisplay = ipResponseToDisplayRows(ips)[0];
const ipDisplayVPC = vpcConfigInterfaceToDisplayRows(
  LinodeConfigInterfaceFactoryWithVPC.build()
)[0];

const handlers: IPAddressRowHandlers = {
  handleOpenEditRDNS: vi.fn(),
  handleOpenEditRDNSForRange: vi.fn(),
  handleOpenIPV6Details: vi.fn(),
  openRemoveIPDialog: vi.fn(),
  openRemoveIPRangeDialog: vi.fn(),
};

describe('LinodeIPAddressRow', () => {
  it('should render a Linode IP Address row', async () => {
    const { getAllByText, getByLabelText } = renderWithTheme(
      wrapWithTableBody(
        <LinodeIPAddressRow
          isVPCOnlyLinode={false}
          linodeId={1}
          readOnly={false}
          {...handlers}
          {...ipDisplay}
        />
      )
    );

    // open the action menu
    await userEvent.click(
      getByLabelText('Action menu for IP Address [object Object]')
    );

    getAllByText(ipDisplay.address);
    getAllByText(ipDisplay.type);
    getAllByText(ipDisplay.gateway);
    getAllByText(ipDisplay.subnetMask);
    getAllByText(ipDisplay.rdns);
    // Check if actions were rendered
    getAllByText('Delete');
    getAllByText('Edit RDNS');
  });
  it('should render a VPC IP Address row', () => {
    const { getAllByText, queryByText } = renderWithTheme(
      wrapWithTableBody(
        <LinodeIPAddressRow
          isVPCOnlyLinode={false}
          linodeId={1}
          readOnly={false}
          {...handlers}
          {...ipDisplayVPC}
        />
      )
    );

    getAllByText(ipDisplayVPC.address);
    getAllByText(ipDisplayVPC.type);
    // No actions should be rendered
    expect(queryByText('Delete')).not.toBeInTheDocument();
    expect(queryByText('Edit RDNS')).not.toBeInTheDocument();
  });

  it('should disable the row if disabled is true and display a tooltip', async () => {
    const { getAllByLabelText, getByLabelText, getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <LinodeIPAddressRow
          isVPCOnlyLinode={true}
          linodeId={1}
          readOnly={false}
          {...handlers}
          {...ipDisplay}
        />
      )
    );

    // open the action menu
    await userEvent.click(
      getByLabelText('Action menu for IP Address [object Object]')
    );

    const deleteBtn = getByTestId('Delete');
    expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');

    const editRDNSBtn = getByTestId('Edit RDNS');
    expect(editRDNSBtn).toHaveAttribute('aria-disabled', 'true');

    expect(getAllByLabelText(PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT)).toHaveLength(2);
  });

  it('should not disable the row if disabled is false', async () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <LinodeIPAddressRow
          isVPCOnlyLinode={false}
          linodeId={1}
          readOnly={false}
          {...handlers}
          {...ipDisplay}
        />
      )
    );

    // open the action menu
    await userEvent.click(
      getByLabelText('Action menu for IP Address [object Object]')
    );

    expect(getByTestId('Delete')).toBeEnabled();

    expect(getByTestId('Edit RDNS')).toBeEnabled();
  });
});

describe('ipResponseToDisplayRows', () => {
  it('should not return a Public IPv4 row if there is a VPC interface with 1:1 NAT', () => {
    const ipDisplays = ipResponseToDisplayRows(
      ips,
      LinodeConfigInterfaceFactoryWithVPC.build()
    );

    expect(
      ipDisplays.find((ipDisplay) => ipDisplay.type === 'IPv4 – Public')
    ).toBeUndefined();
    expect(
      ipDisplays.find((ipDisplay) => ipDisplay.type === 'VPC IPv4 – NAT')
    ).toBeDefined();
  });
});
