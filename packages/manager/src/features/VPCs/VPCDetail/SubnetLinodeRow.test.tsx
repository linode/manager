import {
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
  linodeFactory,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  firewallFactory,
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories';
import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { WARNING_ICON_UNRECOMMENDED_CONFIG } from '../constants';
import { SubnetLinodeRow } from './SubnetLinodeRow';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

const loadingTestId = 'circle-progress';
const mockFirewall0 = 'mock-firewall-0';

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
  const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });

  server.use(
    http.get('*/linodes/instances/:linodeId', () => {
      return HttpResponse.json(linodeFactory1);
    }),
    http.get('*/linode/instances/:id/firewalls', () => {
      return HttpResponse.json(
        makeResourcePage(firewallFactory.buildList(1, { label: mockFirewall0 }))
      );
    })
  );

  const linodeFactory2 = linodeFactory.build({ id: 2, label: 'linode-2' });

  const handleUnassignLinode = vi.fn();

  it('should display linode label, reboot status, VPC IPv4 address, associated firewalls, IPv4 chip, and Reboot and Unassign buttons', async () => {
    // @TODO VPC IPv6: This assertion assumes the VPC IPv6 feature flag is off. Once the feature is fully rolled out, update the checks to ensure the
    // VPC IPv6 and Linode IPv6 Ranges cells are displayed/populated.
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const config = linodeConfigFactory.build({
      interfaces: [linodeConfigInterfaceFactoryWithVPC.build({ id: 1 })],
    });
    server.use(
      http.get('*/instances/*/configs/:configId', async () => {
        return HttpResponse.json(config);
      })
    );

    const handlePowerActionsLinode = vi.fn();
    const handleUnassignLinode = vi.fn();

    const { getAllByRole, getAllByText, getByTestId, findByText, queryByText } =
      renderWithTheme(
        wrapWithTableBody(
          <SubnetLinodeRow
            handlePowerActionsLinode={handlePowerActionsLinode}
            handleUnassignLinode={handleUnassignLinode}
            isVPCLKEEnterpriseCluster={false}
            linodeId={linodeFactory1.id}
            subnet={subnetFactory.build()}
            subnetId={1}
            subnetInterfaces={[{ active: true, config_id: config.id, id: 1 }]}
          />
        )
      );

    // Loading states should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const linodeLabelLink = getAllByRole('link')[0];
    expect(linodeLabelLink).toHaveAttribute(
      'href',
      `/linodes/${linodeFactory1.id}`
    );

    getAllByText('10.0.0.0');

    // VPC IPv6 and Linode IPv6 Ranges columns not present, so contents of those cells should not be in the document
    expect(queryByText('2001:db8::1')).toBeNull();
    expect(queryByText('2001:db8::/64')).toBeNull();

    const plusChipButton = getAllByRole('button')[1];
    expect(plusChipButton).toHaveTextContent('+1');

    const rebootLinodeButton = getAllByRole('button')[2];
    expect(rebootLinodeButton).toHaveTextContent('Reboot');
    await userEvent.click(rebootLinodeButton);
    expect(handlePowerActionsLinode).toHaveBeenCalled();

    const unassignLinodeButton = getAllByRole('button')[3];
    expect(unassignLinodeButton).toHaveTextContent('Unassign Linode');
    await userEvent.click(unassignLinodeButton);
    expect(handleUnassignLinode).toHaveBeenCalled();
    const firewall = await findByText(mockFirewall0);
    expect(firewall).toBeVisible();
  });

  it('should display the VPC IPv6 and Linode IPv6 Ranges when vpcIpv6 feature flag is enabled (config/legacy interface)', async () => {
    queryMocks.useFlags.mockReturnValue({ vpcIpv6: true });

    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const config = linodeConfigFactory.build({
      interfaces: [linodeConfigInterfaceFactoryWithVPC.build({ id: 1 })],
    });
    server.use(
      http.get('*/instances/*/configs/:configId', async () => {
        return HttpResponse.json(config);
      })
    );

    const handlePowerActionsLinode = vi.fn();
    const handleUnassignLinode = vi.fn();

    const { getByTestId, findByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnet={subnetFactory.build()}
          subnetId={1}
          subnetInterfaces={[{ active: true, config_id: config.id, id: 1 }]}
        />
      )
    );

    // Loading states should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // VPC IPv6 and Linode IPv6 Ranges columns present, so contents of those cells should be populated
    await findByText('2001:db8::1');
    await findByText('2001:db8::/64');
  });

  it('should display the VPC IPv6 and Linode IPv6 Ranges when vpcIpv6 feature flag is enabled (Linode Interface)', async () => {
    queryMocks.useFlags.mockReturnValue({ vpcIpv6: true });

    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const vpcLinodeInterface = linodeInterfaceFactoryVPC.build({
      id: 1,
    });

    server.use(
      http.get('*/instances/*/interfaces/:interfaceId', async () => {
        return HttpResponse.json(vpcLinodeInterface);
      })
    );

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
        />
      )
    );

    // Loading states should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // VPC IPv6 and Linode IPv6 Ranges columns present, so contents of those cells should be populated
    expect(getByTestId('vpc-ipv6-cell')).toHaveTextContent(
      '2600:3c03::f03c:91ff:fe0a:109a'
    );
    expect(getByTestId('linode-ipv6-ranges-cell')).toHaveTextContent(
      '2600:3c03::f03c:91ff:fe0a:109a'
    );
  });

  it('should display the ip, range, and firewall for a Linode using Linode Interfaces', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    server.use(
      http.get('*/instances/*/interfaces/:interfaceId', async () => {
        const vpcLinodeInterface = linodeInterfaceFactoryVPC.build();
        return HttpResponse.json(vpcLinodeInterface);
      }),
      http.get('*/instances/*/interfaces/:interfaceId/firewalls', async () => {
        return HttpResponse.json(
          makeResourcePage(
            firewallFactory.buildList(1, { label: mockFirewall0 })
          )
        );
      })
    );

    const handlePowerActionsLinode = vi.fn();
    const handleUnassignLinode = vi.fn();

    const { getAllByRole, getAllByText, getByTestId, findByText } =
      renderWithTheme(
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

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const linodeLabelLink = getAllByRole('link')[0];
    expect(linodeLabelLink).toHaveAttribute(
      'href',
      `/linodes/${linodeFactory1.id}/networking/interfaces/1`
    );

    getAllByText('10.0.0.0');
    getAllByText('10.0.0.1');
    const firewall = await findByText(mockFirewall0);
    expect(firewall).toBeVisible();
  });

  it('should not display reboot linode button if the linode has all active interfaces', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const vpcInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      ip_ranges: [],
      primary: true,
    });
    const config = linodeConfigFactory.build({
      interfaces: [vpcInterface],
    });
    server.use(
      http.get('*/linodes/instances/:linodeId', () => {
        return HttpResponse.json(linodeFactory1);
      }),
      http.get('*/linode/instances/:id/firewalls', () => {
        return HttpResponse.json(
          makeResourcePage(
            firewallFactory.buildList(1, { label: mockFirewall0 })
          )
        );
      }),
      http.get('*/instances/*/configs/:configId', async () => {
        return HttpResponse.json(config);
      })
    );

    const handleUnassignLinode = vi.fn();
    const handlePowerActionsLinode = vi.fn();

    const { getAllByRole, getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnet={subnetFactory.build()}
          subnetId={0}
          subnetInterfaces={[
            { active: true, config_id: config.id, id: vpcInterface.id },
          ]}
        />
      )
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const linodeLabelLink = getAllByRole('link')[0];
    expect(linodeLabelLink).toHaveAttribute(
      'href',
      `/linodes/${linodeFactory1.id}`
    );

    const buttons = getAllByRole('button');
    expect(buttons.length).toEqual(2);
    const powerOffButton = buttons[0];
    expect(powerOffButton).toHaveTextContent('Power Off');
    await userEvent.click(powerOffButton);
    expect(handlePowerActionsLinode).toHaveBeenCalled();
    const unassignLinodeButton = buttons[1];
    expect(unassignLinodeButton).toHaveTextContent('Unassign Linode');
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

    server.use(
      http.get('*/instances/*/configs/*', async () => {
        return HttpResponse.json(configurationProfile);
      })
    );

    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={vi.fn()}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory2.id}
          subnet={subnet}
          subnetId={subnet.id}
          subnetInterfaces={[{ active: true, config_id: 1, id: 1 }]}
        />
      )
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const warningIcon = getByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG);

    await waitFor(() => {
      expect(warningIcon).toBeInTheDocument();
    });
  });

  it('should hide in-line action buttons for LKE-E Linodes', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });

    server.use(
      http.get('*/linodes/instances/:linodeId', () => {
        return HttpResponse.json(linodeFactory1);
      })
    );
    server.use(
      http.get('*/instances/*/configs/*', async () => {
        return HttpResponse.json(configurationProfile);
      })
    );

    const handleUnassignLinode = vi.fn();
    const handlePowerActionsLinode = vi.fn();

    const { getByTestId, queryByRole } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={true}
          linodeId={linodeFactory1.id}
          subnet={subnetFactory.build()}
          subnetId={0}
          subnetInterfaces={[{ active: true, config_id: 1, id: 1 }]}
        />
      )
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const powerOffButton = queryByRole('button', {
      name: 'Power Off',
    });
    expect(powerOffButton).not.toBeInTheDocument();
    const unassignLinodeButton = queryByRole('button', {
      name: 'Unassign Linode',
    });
    expect(unassignLinodeButton).not.toBeInTheDocument();
  });

  it('should not display a warning icon for LKE-E Linodes', async () => {
    const subnet = subnetFactory.build({
      id: 1,
      label: 'lke1234567',
      linodes: [subnetAssignedLinodeDataFactory.build()],
    });

    const { getByTestId, queryByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={vi.fn()}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={true}
          linodeId={linodeFactory2.id}
          subnet={subnet}
          subnetId={subnet.id}
          subnetInterfaces={[{ active: true, config_id: 1, id: 1 }]}
        />
      )
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const warningIcon = queryByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG);

    await waitFor(() => {
      expect(warningIcon).not.toBeInTheDocument();
    });
  });
});
