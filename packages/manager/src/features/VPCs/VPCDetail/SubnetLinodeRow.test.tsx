import {
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
} from '@linode/utilities';
import {
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import * as React from 'react';

import {
  firewallFactory,
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories';
import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import { linodeFactory } from 'src/factories/linodes';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { WARNING_ICON_UNRECOMMENDED_CONFIG } from '../constants';
import { SubnetLinodeRow } from './SubnetLinodeRow';

beforeAll(() => mockMatchMedia());

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
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    server.use(
      http.get('*/instances/*/configs', async () => {
        const configs = linodeConfigFactory.buildList(3);
        return HttpResponse.json(makeResourcePage(configs));
      })
    );

    const handlePowerActionsLinode = vi.fn();
    const handleUnassignLinode = vi.fn();

    const {
      getAllByRole,
      getAllByText,
      getByTestId,
      getByText,
    } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          isVPCLKEEnterpriseCluster={false}
          linodeId={linodeFactory1.id}
          subnetId={1}
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

    getAllByText('10.0.0.0');
    getByText(mockFirewall0);

    const plusChipButton = getAllByRole('button')[1];
    expect(plusChipButton).toHaveTextContent('+1');

    const rebootLinodeButton = getAllByRole('button')[2];
    expect(rebootLinodeButton).toHaveTextContent('Reboot');
    fireEvent.click(rebootLinodeButton);
    expect(handlePowerActionsLinode).toHaveBeenCalled();

    const unassignLinodeButton = getAllByRole('button')[3];
    expect(unassignLinodeButton).toHaveTextContent('Unassign Linode');
    fireEvent.click(unassignLinodeButton);
    expect(handleUnassignLinode).toHaveBeenCalled();
  });

  it('should not display reboot linode button if the linode has all active interfaces', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const vpcInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      primary: true,
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
      http.get('*/instances/*/configs', () => {
        const configs = linodeConfigFactory.build({
          interfaces: [vpcInterface],
        });
        return HttpResponse.json(makeResourcePage([configs]));
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
          subnetId={0}
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
    fireEvent.click(powerOffButton);
    expect(handlePowerActionsLinode).toHaveBeenCalled();
    const unassignLinodeButton = buttons[1];
    expect(unassignLinodeButton).toHaveTextContent('Unassign Linode');
    fireEvent.click(unassignLinodeButton);
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
      http.get('*/instances/*/configs', async () => {
        return HttpResponse.json(makeResourcePage([configurationProfile]));
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
      http.get('*/instances/*/configs', async () => {
        return HttpResponse.json(makeResourcePage([configurationProfile]));
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
          subnetId={0}
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
