import {
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
  linodeFactory,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  firewallFactory,
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories';
import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { WARNING_ICON_UNRECOMMENDED_CONFIG } from '../constants';
import { SubnetLinodeRow } from './SubnetLinodeRow';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({}),
  useLinodeFirewallsQuery: vi.fn().mockReturnValue({}),
  useLinodeConfigQuery: vi.fn().mockReturnValue({}),
  useLinodeInterfaceQuery: vi.fn().mockReturnValue({}),
  useLinodeInterfaceFirewallsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
    useLinodeFirewallsQuery: queryMocks.useLinodeFirewallsQuery,
    useLinodeConfigQuery: queryMocks.useLinodeConfigQuery,
    useLinodeInterfaceQuery: queryMocks.useLinodeInterfaceQuery,
    useLinodeInterfaceFirewallsQuery:
      queryMocks.useLinodeInterfaceFirewallsQuery,
  };
});

const loadingTestId = 'circle-progress';
const mockFirewall0 = 'mock-firewall-0';
const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
const handlePowerActionsLinode = vi.fn();
const handleUnassignLinode = vi.fn();

const publicInterface = linodeConfigInterfaceFactory.build({
  active: true,
  id: 5,
  ipam_address: null,
  primary: true,
  purpose: 'public',
});

const vpcInterface = linodeConfigInterfaceFactory.build({
  active: true,
  id: 10,
  ipam_address: null,
  purpose: 'vpc',
  subnet_id: 1,
});

const configurationProfile = linodeConfigFactory.build({
  interfaces: [publicInterface, vpcInterface],
});

describe('SubnetLinodeRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory1,
    });
    queryMocks.useLinodeFirewallsQuery.mockReturnValue({
      data: {
        data: firewallFactory.buildList(1, { label: mockFirewall0 }),
      },
    });
  });

  it('renders the loading state', async () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      isLoading: true,
    });

    const { findByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnet={subnetFactory.build()}
          subnetId={0}
          subnetInterfaces={[{ active: true, config_id: 1, id: 1 }]}
        />
      )
    );

    // Loading state should render
    const loading = await findByTestId(loadingTestId);
    expect(loading).toBeInTheDocument();
  });

  it('should display linode label, reboot status, VPC IPv4 address, associated firewalls, IPv4 chip, and Reboot and Unassign buttons', async () => {
    // @TODO VPC IPv6: This assertion assumes the VPC IPv6 feature flag is off. Once the feature is fully rolled out, update the checks to ensure the
    // VPC IPv6 and VPC IPv6 Ranges cells are displayed/populated.
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const subnetFactory1 = subnetFactory.build({ id: 1, label: 'subnet-1' });
    const config = linodeConfigFactory.build({
      interfaces: [linodeConfigInterfaceFactoryWithVPC.build({ id: 1 })],
    });
    queryMocks.useLinodeConfigQuery.mockReturnValue({
      data: config,
    });

    const { getByLabelText, getByRole, getByText, findByText, queryByText } =
      renderWithTheme(
        wrapWithTableBody(
          <SubnetLinodeRow
            handlePowerActionsLinode={handlePowerActionsLinode}
            handleUnassignLinode={handleUnassignLinode}
            isVPCLKEEnterpriseCluster={false}
            linodeId={linodeFactory1.id}
            subnet={subnetFactory1}
            subnetId={1}
            subnetInterfaces={[{ active: true, config_id: config.id, id: 1 }]}
          />,
          { flags: { vpcIpv6: false } }
        )
      );

    const linodeLabelLink = getByRole('link', { name: 'linode-1' });
    expect(linodeLabelLink).toHaveAttribute(
      'href',
      `/linodes/${linodeFactory1.id}`
    );

    expect(getByText('10.0.0.0')).toBeVisible();

    // VPC IPv6 and VPC IPv6 Ranges columns not present, so contents of those cells should not be in the document
    expect(queryByText('2001:db8::1')).toBeNull();
    expect(queryByText('2001:db8::/64')).toBeNull();

    const plusChipButton = getByRole('button', { name: '+1' });
    expect(plusChipButton).toHaveTextContent('+1');

    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet ${subnetFactory1.label}`
    );
    await userEvent.click(actionMenu);

    const rebootLinodeButton = getByText('Reboot');
    await userEvent.click(rebootLinodeButton);
    expect(handlePowerActionsLinode).toHaveBeenCalled();

    const unassignLinodeButton = getByText('Unassign Linode');
    await userEvent.click(unassignLinodeButton);
    expect(handleUnassignLinode).toHaveBeenCalled();
    const firewall = await findByText(mockFirewall0);
    expect(firewall).toBeVisible();
  });

  it('should display the ip, range, and firewall for a Linode using Linode Interfaces', async () => {
    const vpcLinodeInterface = linodeInterfaceFactoryVPC.build();
    queryMocks.useLinodeInterfaceQuery.mockReturnValue({
      data: vpcLinodeInterface,
    });
    queryMocks.useLinodeInterfaceFirewallsQuery.mockReturnValue({
      data: {
        data: firewallFactory.buildList(1, { label: mockFirewall0 }),
      },
    });

    const { getByRole, getByText, findByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnet={subnetFactory.build()}
          subnetId={1}
          subnetInterfaces={[{ active: true, config_id: null, id: 1 }]}
        />
      )
    );

    const linodeLabelLink = getByRole('link', { name: 'linode-1' });
    expect(linodeLabelLink).toHaveAttribute(
      'href',
      `/linodes/${linodeFactory1.id}/networking/interfaces/1`
    );

    expect(getByText('10.0.0.0')).toBeVisible();
    expect(getByText('10.0.0.1')).toBeVisible();
    const firewall = await findByText(mockFirewall0);
    expect(firewall).toBeVisible();
  });

  it('should display the VPC IPv6 and VPC IPv6 Ranges when vpcIpv6 feature flag is enabled (config/legacy interface)', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const subnetFactory1 = subnetFactory.build({ id: 1, label: 'subnet-1' });
    const config = linodeConfigFactory.build({
      interfaces: [linodeConfigInterfaceFactoryWithVPC.build({ id: 1 })],
    });
    queryMocks.useLinodeInterfaceQuery.mockReturnValue({});
    queryMocks.useLinodeConfigQuery.mockReturnValue({
      data: config,
    });

    const handlePowerActionsLinode = vi.fn();
    const handleUnassignLinode = vi.fn();

    const { findByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnet={subnetFactory1}
          subnetId={1}
          subnetInterfaces={[{ active: true, config_id: config.id, id: 1 }]}
        />,
        {
          flags: { vpcIpv6: true },
        }
      )
    );

    // VPC IPv6 and VPC IPv6 Ranges columns present, so contents of those cells should be populated
    await findByText('2001:db8::1');
    await findByText('2001:db8::/64');
  });

  it('should display the VPC IPv6 and VPC IPv6 Ranges when vpcIpv6 feature flag is enabled (Linode Interface)', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const vpcLinodeInterface = linodeInterfaceFactoryVPC.build({
      id: 1,
    });
    queryMocks.useLinodeInterfaceQuery.mockReturnValue({
      data: vpcLinodeInterface,
    });
    queryMocks.useLinodeConfigQuery.mockReturnValue({});

    const handlePowerActionsLinode = vi.fn();
    const handleUnassignLinode = vi.fn();

    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnet={subnetFactory.build()}
          subnetId={1}
          subnetInterfaces={[
            { active: true, config_id: null, id: vpcLinodeInterface.id },
          ]}
        />,
        {
          flags: { vpcIpv6: true },
        }
      )
    );

    // VPC IPv6 and VPC IPv6 Ranges columns present, so contents of those cells should be populated
    expect(getByTestId('vpc-ipv6-cell')).toHaveTextContent(
      '2600:3c03::f03c:91ff:fe0a:109a'
    );
    expect(getByTestId('linode-ipv6-ranges-cell')).toHaveTextContent(
      '2600:3c03::f03c:91ff:fe0a:109a'
    );
  });

  it('should not display reboot linode button if the linode has all active interfaces', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const subnetFactory1 = subnetFactory.build({ id: 1, label: 'subnet-1' });
    const vpcInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      ip_ranges: [],
      primary: true,
    });
    const config = linodeConfigFactory.build({
      interfaces: [vpcInterface],
    });
    queryMocks.useLinodeConfigQuery.mockReturnValue({
      data: config,
    });

    const { getByRole, getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnet={subnetFactory1}
          subnetId={0}
          subnetInterfaces={[
            { active: true, config_id: config.id, id: vpcInterface.id },
          ]}
        />
      )
    );

    const linodeLabelLink = getByRole('link', { name: 'linode-1' });
    expect(linodeLabelLink).toHaveAttribute(
      'href',
      `/linodes/${linodeFactory1.id}`
    );

    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet ${subnetFactory1.label}`
    );
    await userEvent.click(actionMenu);

    const powerOffButton = getByText('Power Off');
    await userEvent.click(powerOffButton);
    expect(handlePowerActionsLinode).toHaveBeenCalled();
    const unassignLinodeButton = getByText('Unassign Linode');
    await userEvent.click(unassignLinodeButton);
    expect(handleUnassignLinode).toHaveBeenCalled();
  });

  it('should display a warning icon for Linodes using unrecommended configuration profiles', async () => {
    const subnet = subnetFactory.build({
      id: 1,
      linodes: [
        subnetAssignedLinodeDataFactory.build({
          id: 1,
          interfaces: [
            {
              active: true,
              id: 5,
            },
            {
              active: true,
              id: 10,
            },
          ],
        }),
      ],
    });

    queryMocks.useLinodeConfigQuery.mockReturnValue({
      data: configurationProfile,
    });

    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={vi.fn()}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnet={subnet}
          subnetId={subnet.id}
          subnetInterfaces={[{ active: true, config_id: 1, id: 1 }]}
        />
      )
    );

    const warningIcon = getByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG);

    await waitFor(() => {
      expect(warningIcon).toBeInTheDocument();
    });
  });

  it('should not display a warning icon for LKE-E Linodes', async () => {
    const subnet = subnetFactory.build({
      id: 1,
      label: 'lke1234567',
      linodes: [subnetAssignedLinodeDataFactory.build()],
    });

    const { queryByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={vi.fn()}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={true}
          linodeId={linodeFactory1.id}
          subnet={subnet}
          subnetId={subnet.id}
          subnetInterfaces={[{ active: true, config_id: 1, id: 1 }]}
        />
      )
    );

    const warningIcon = queryByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG);

    await waitFor(() => {
      expect(warningIcon).not.toBeInTheDocument();
    });
  });
});
