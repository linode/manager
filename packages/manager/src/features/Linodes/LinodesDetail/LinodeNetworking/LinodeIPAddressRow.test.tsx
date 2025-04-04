import {
  linodeConfigInterfaceFactoryWithVPC,
  linodeIPFactory,
} from '@linode/utilities';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import {
  ipResponseToDisplayRows,
} from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT } from 'src/features/Linodes/PublicIPAddressesTooltip';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { LinodeIPAddressRow } from './LinodeIPAddressRow';

import type { IPAddressRowHandlers } from './LinodeIPAddressRow';

const ips = linodeIPFactory.build();
const ipDisplay = ipResponseToDisplayRows(ips)[0];
const ipDisplayVPC = vpcConfigInterfaceToDisplayRows(
  linodeConfigInterfaceFactoryWithVPC.build()
)[0];

const handlers: IPAddressRowHandlers = {
  handleOpenEditRDNS: vi.fn(),
  handleOpenEditRDNSForRange: vi.fn(),
  handleOpenIPV6Details: vi.fn(),
  openRemoveIPDialog: vi.fn(),
  openRemoveIPRangeDialog: vi.fn(),
};

describe('LinodeIPAddressRow', () => {
  it('should render a Linode IP Address row', () => {
    const { getAllByText } = renderWithTheme(
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
    const { findByRole, getByTestId } = renderWithTheme(
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

    const deleteBtn = getByTestId('action-menu-item-delete');
    expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');
    fireEvent.mouseEnter(deleteBtn);
    const publicIpsUnassignedTooltip = await findByRole('tooltip');
    expect(publicIpsUnassignedTooltip).toContainHTML(
      PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT
    );

    const editRDNSBtn = getByTestId('action-menu-item-edit-rdns');
    expect(editRDNSBtn).toHaveAttribute('aria-disabled', 'true');

    fireEvent.mouseEnter(editRDNSBtn);
    const publicIpsUnassignedTooltip2 = await findByRole('tooltip');
    expect(publicIpsUnassignedTooltip2).toContainHTML(
      PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT
    );
  });

  it('should not disable the row if disabled is false', () => {
    const { getAllByRole } = renderWithTheme(
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

    const buttons = getAllByRole('button');

    const deleteBtn = buttons[1];
    expect(deleteBtn).not.toHaveAttribute('aria-disabled', 'true');

    const editRDNSBtn = buttons[3];
    expect(editRDNSBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});

describe('ipResponseToDisplayRows', () => {
  it('should not return a Public IPv4 row if there is a VPC interface with 1:1 NAT', () => {
    const ipDisplays = ipResponseToDisplayRows(
      ips,
      linodeConfigInterfaceFactoryWithVPC.build()
    );

    expect(
      ipDisplays.find((ipDisplay) => ipDisplay.type === 'Public – IPv4')
    ).toBeUndefined();
    expect(
      ipDisplays.find((ipDisplay) => ipDisplay.type === 'VPC NAT – IPv4')
    ).toBeDefined();
  });
});
