import { fireEvent } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

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
  it('should display linode label, status, id, vpc ipv4 address, associated firewalls and unassign button', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    server.use(
      rest.get('*/linodes/instances/:linodeId', (req, res, ctx) => {
        return res(ctx.json(linodeFactory1));
      }),
      rest.get('*/instances/*/configs', async (req, res, ctx) => {
        const configs = linodeConfigFactory.buildList(3);
        return res(ctx.json(makeResourcePage(configs)));
      })
    );

    const handleUnassignLinode = vi.fn();

    const {
      getAllByRole,
      getAllByText,
      getByTestId,
      getByText,
    } = renderWithTheme(
      wrapWithTableBody(
        <SubnetLinodeRow
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

    getAllByText(linodeFactory1.id);
    getAllByText('10.0.0.0');
    getByText('mock-firewall-0');

    const unassignLinodeButton = getAllByRole('button')[0];
    expect(unassignLinodeButton).toHaveTextContent('Unassign Linode');
    fireEvent.click(unassignLinodeButton);
    expect(handleUnassignLinode).toHaveBeenCalled();
  });
});
