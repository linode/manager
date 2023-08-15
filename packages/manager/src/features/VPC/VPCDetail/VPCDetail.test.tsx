import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { vpcFactory } from 'src/factories/vpcs';
import { rest, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTheme,
} from 'src/utilities/testHelpers';

import VPCDetail from './VPCDetail';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'circle-progress';

describe('VPC Detail Summary section', () => {
  it('should display number of subnets and linodes, region, id, creation and update dates', async () => {
    const vpcFactory1 = vpcFactory.build({ id: 100 });
    server.use(
      rest.get('*/vpcs/:vpcId', (req, res, ctx) => {
        return res(ctx.json(vpcFactory1));
      })
    );

    const { getAllByText, getByTestId } = renderWithTheme(<VPCDetail />, {
      queryClient,
    });

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getAllByText('Subnets');
    getAllByText('Linodes');
    getAllByText('0');

    getAllByText('Region');
    getAllByText('Newark, NJ');

    getAllByText('VPC ID');
    getAllByText(vpcFactory1.id);

    getAllByText('Created');
    getAllByText(vpcFactory1.created);

    getAllByText('Updated');
    getAllByText(vpcFactory1.updated);
  });

  it('should display description if one is provided and hide if not', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver...`,
      id: 101,
    });
    server.use(
      rest.get('*/vpcs/:vpcId', (req, res, ctx) => {
        return res(ctx.json(vpcFactory1));
      })
    );

    const {
      getAllByText,
      getByTestId,
      getByText,
      queryByText,
      rerender,
    } = renderWithTheme(<VPCDetail />, {
      queryClient,
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getAllByText('Description');
    getByText(vpcFactory1.description);

    const vpcFactory2 = vpcFactory.build({ id: 102 });
    server.use(
      rest.get('*/vpcs/:vpcId', (req, res, ctx) => {
        return res(ctx.json(vpcFactory2));
      })
    );
    rerender(
      wrapWithTheme(<VPCDetail />, {
        queryClient,
      })
    );
    expect(queryByText('Description')).not.toBeInTheDocument();
  });
});
