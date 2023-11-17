import { fireEvent } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { firewallFactory } from 'src/factories';
import { LinodeConfigInterfaceFactoryWithVPC } from 'src/factories/linodeConfigInterfaceFactory';
import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import { linodeFactory } from 'src/factories/linodes';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { SubnetLinodeRow } from './SubnetLinodeRow';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'circle-progress';

describe('SubnetLinodeRow', () => {
  it('should display linode label, reboot status, vpc ipv4 address, associated firewalls and reboot and unassign button', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    server.use(
      rest.get('*/linodes/instances/:linodeId', (req, res, ctx) => {
        return res(ctx.json(linodeFactory1));
      }),
      rest.get('*/linode/instances/:id/firewalls', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              firewallFactory.buildList(1, { label: 'mock-firewall-0' })
            )
          )
        );
      }),
      rest.get('*/instances/*/configs', async (req, res, ctx) => {
        const configs = linodeConfigFactory.buildList(3);
        return res(ctx.json(makeResourcePage(configs)));
      })
    );

    const handleUnassignLinode = jest.fn();
    const handlePowerActionsLinode = jest.fn();

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
          linodeId={linodeFactory1.id}
          subnetId={0}
        />
      ),
      {
        queryClient,
      }
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
    getByText('mock-firewall-0');

    const rebootLinodeButton = getAllByRole('button')[1];
    expect(rebootLinodeButton).toHaveTextContent('Reboot');
    fireEvent.click(rebootLinodeButton);
    expect(handlePowerActionsLinode).toHaveBeenCalled();
    const unassignLinodeButton = getAllByRole('button')[2];
    expect(unassignLinodeButton).toHaveTextContent('Unassign Linode');
    fireEvent.click(unassignLinodeButton);
    expect(handleUnassignLinode).toHaveBeenCalled();
  });
  it('should not display reboot linode button if the linode has all active interfaces', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const vpcInterface = LinodeConfigInterfaceFactoryWithVPC.build({
      active: true,
    });
    server.use(
      rest.get('*/linodes/instances/:linodeId', (req, res, ctx) => {
        return res(ctx.json(linodeFactory1));
      }),
      rest.get('*/linode/instances/:id/firewalls', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              firewallFactory.buildList(1, { label: 'mock-firewall-0' })
            )
          )
        );
      }),
      rest.get('*/instances/*/configs', (req, res, ctx) => {
        const configs = linodeConfigFactory.build({
          interfaces: [vpcInterface],
        });
        return res(ctx.json(makeResourcePage([configs])));
      })
    );

    const handleUnassignLinode = jest.fn();
    const handlePowerActionsLinode = jest.fn();

    const { getAllByRole, getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handlePowerActionsLinode={handlePowerActionsLinode}
          handleUnassignLinode={handleUnassignLinode}
          linodeId={linodeFactory1.id}
          subnetId={0}
        />
      ),
      {
        queryClient,
      }
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
});
