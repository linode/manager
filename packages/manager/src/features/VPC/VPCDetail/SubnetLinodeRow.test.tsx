import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { linodeFactory } from 'src/factories/linodes';
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
  it('should linode label, status, id, private ip address, and associated firewalls', async () => {
    const linodeFactory1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    server.use(
      rest.get('*/linodes/instances/:linodeId', (req, res, ctx) => {
        return res(ctx.json(linodeFactory1));
      })
    );

    const { getAllByText, getByTestId, getByText } = renderWithTheme(
      wrapWithTableBody(<SubnetLinodeRow linodeId={linodeFactory1.id} />),
      {
        queryClient,
      }
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText(linodeFactory1.label);
    getAllByText(linodeFactory1.id);
    getAllByText('50.116.6.212');
    getByText('mock-firewall-0');
  });
});
