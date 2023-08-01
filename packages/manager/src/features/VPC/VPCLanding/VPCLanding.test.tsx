import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { subnetFactory } from 'src/factories';
import { vpcFactory } from 'src/factories/vpcs';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import VPCLanding from './VPCLanding';
import VPCRow from './VPCRow';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'circle-progress';

describe('VPC Table Row', () => {
  it('should render a VPC row', () => {
    const vpc = vpcFactory.build();

    const { getAllByText, getByText } = renderWithTheme(
      wrapWithTableBody(<VPCRow vpc={vpc} />),
      { queryClient }
    );

    // Check to see if the row rendered some data
    getByText(vpc.label);
    getAllByText(vpc.id);
    getAllByText(vpc.subnets.length);
    // Check if actions were rendered
    getByText('Edit');
    getByText('Delete');
  });
});

describe('VPC Table', () => {
  it('should render vpc landing table with items', async () => {
    server.use(
      rest.get('*/vpcs', (req, res, ctx) => {
        const vpcsWithSubnet = vpcFactory.buildList(3, {
          subnets: subnetFactory.buildList(Math.floor(Math.random() * 10) + 1),
        });
        return res(ctx.json(makeResourcePage(vpcsWithSubnet)));
      })
    );

    const { getAllByText, getByTestId } = renderWithTheme(<VPCLanding />, {
      queryClient,
    });

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Static text and table column headers
    getAllByText('Label');
    getAllByText('Region');
    getAllByText('VPC ID');
    getAllByText('Subnets');
    getAllByText('Linodes');
  });

  it('should render vpc landing with empty state', async () => {
    server.use(
      rest.get('*/vpcs', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<VPCLanding />, {
      queryClient,
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(
      getByText('Create a private and isolated network.')
    ).toBeInTheDocument();
  });
});
