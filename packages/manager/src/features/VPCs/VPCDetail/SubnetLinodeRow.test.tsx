import { fireEvent } from '@testing-library/react';
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { LinodeConfigInterfaceFactory, firewallFactory } from 'src/factories';
import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import { linodeFactory } from 'src/factories/linodes';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { WARNING_ICON_UNRECOMMENDED_CONFIG } from '../constants';
import { SubnetLinodeRow } from './SubnetLinodeRow';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'circle-progress';

describe('SubnetLinodeRow', () => {
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
    })
  );

  const linodeFactory2 = linodeFactory.build({ id: 2, label: 'linode-2' });

  const handleUnassignLinode = jest.fn();

  it('should display linode label, status, id, vpc ipv4 address, associated firewalls and unassign button', async () => {
    server.use(
      rest.get('*/instances/*/configs', async (req, res, ctx) => {
        const configs = linodeConfigFactory.buildList(3);
        return res(ctx.json(makeResourcePage(configs)));
      })
    );

    const {
      getAllByRole,
      getAllByText,
      getByTestId,
      getByText,
    } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handleUnassignLinode={handleUnassignLinode}
          handleUnrecommendedConfigPresent={jest.fn()}
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

    getAllByText(linodeFactory1.id);
    getAllByText('10.0.0.0');
    getByText('mock-firewall-0');

    const unassignLinodeButton = getAllByRole('button')[0];
    expect(unassignLinodeButton).toHaveTextContent('Unassign Linode');
    fireEvent.click(unassignLinodeButton);
    expect(handleUnassignLinode).toHaveBeenCalled();
  });

  it('should display a warning icon for Linodes using unrecommended configuration profiles', async () => {
    const publicInterface = LinodeConfigInterfaceFactory.build({
      active: true,
      ipam_address: null,
      primary: true,
      purpose: 'public',
    });

    const vpcInterface = LinodeConfigInterfaceFactory.build({
      active: true,
      ipam_address: null,
      purpose: 'vpc',
    });

    const configurationProfile = linodeConfigFactory.build({
      interfaces: [publicInterface, vpcInterface],
    });

    server.use(
      rest.get('*/instances/*/configs', async (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([configurationProfile])));
      })
    );

    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
          handleUnassignLinode={handleUnassignLinode}
          handleUnrecommendedConfigPresent={jest.fn()}
          linodeId={linodeFactory2.id}
          subnetId={1}
        />
      ),
      {
        queryClient,
      }
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const warningIcon = getByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG);

    await waitFor(() => {
      expect(warningIcon).toBeInTheDocument();
    });
  });
});
