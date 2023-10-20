import { fireEvent } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { vpcFactory } from 'src/factories/vpcs';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

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

  it('should display description if one is provided', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database.`,
    });
    server.use(
      rest.get('*/vpcs/:vpcId', (req, res, ctx) => {
        return res(ctx.json(vpcFactory1));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<VPCDetail />, {
      queryClient,
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText('Description');
    getByText(vpcFactory1.description);
  });

  it('should hide description if none is provided', async () => {
    server.use(
      rest.get('*/vpcs/:vpcId', (req, res, ctx) => {
        return res(ctx.json(vpcFactory.build()));
      })
    );

    const { getByTestId, queryByText } = renderWithTheme(<VPCDetail />, {
      queryClient,
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(queryByText('Description')).not.toBeInTheDocument();
  });

  it('should display read more/less button in description if there are more than 150 characters', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver. VPC for webserver.`,
    });
    server.use(
      rest.get('*/vpcs/:vpcId', (req, res, ctx) => {
        return res(ctx.json(vpcFactory1));
      })
    );

    const { getAllByRole, getByTestId } = renderWithTheme(<VPCDetail />, {
      queryClient,
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const readMoreButton = getAllByRole('button')[2];
    expect(readMoreButton.innerHTML).toBe('Read More');

    fireEvent.click(readMoreButton);
    expect(readMoreButton.innerHTML).toBe('Read Less');
  }, 10000);
});
