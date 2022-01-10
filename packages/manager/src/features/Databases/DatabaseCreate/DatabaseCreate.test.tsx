import * as React from 'react';
import DatabaseCreate from './DatabaseCreate';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { QueryClient } from 'react-query';
import { waitForElementToBeRemoved, fireEvent } from '@testing-library/react';
import { rest, server } from 'src/mocks/testServer';
import { databaseTypeFactory, databaseVersionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import cachedRegions from 'src/cachedData/regions.json';

const queryClient = new QueryClient();
const loadingTestId = 'circle-progress';

describe('Database Create', () => {
  it('should render loading state', () => {
    const { getByTestId } = renderWithTheme(<DatabaseCreate />);
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render inputs', async () => {
    const { getAllByText, getByTestId } = renderWithTheme(<DatabaseCreate />);
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getAllByText('Database Label');
    getAllByText('Database Engine');
    getAllByText('Select a Region');
    getAllByText('Choose a Plan');
    getByTestId('database-nodes');
    getByTestId('domain-transfer-input');
    getAllByText('Create Database');
  });

  it('should display the correct node price', async () => {
    const standardTypes: any = [];
    const dedicatedTypes: any = [];
    for (let i = 1; i < 7; i++) {
      standardTypes.push(
        databaseTypeFactory.build({
          id: `g6-standard-${i}`,
          label: `Linode ${2 * i} GB`,
          class: 'standard',
        })
      );
      dedicatedTypes.push(
        databaseTypeFactory.build({
          id: `g6-dedicated-${i}`,
          label: `Dedicated ${4 * i} GB`,
          class: 'dedicated',
        })
      );
    }
    server.use(
      rest.get('*/databases/types', (req, res, ctx) => {
        return res(
          ctx.json(makeResourcePage([...standardTypes, ...dedicatedTypes]))
        );
      }),
      rest.get('*/databases/versions', (req, res, ctx) => {
        const version = databaseVersionFactory.buildList(3);
        return res(ctx.json(makeResourcePage(version)));
      }),
      rest.get('*/regions', async (req, res, ctx) => {
        return res(ctx.json(cachedRegions.data));
      })
    );

    const { getAllByText, getByTestId } = renderWithTheme(<DatabaseCreate />, {
      queryClient,
    });
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // default to $0 if no plan is selected
    const nodeRadioBtns = getByTestId('database-nodes');
    expect(nodeRadioBtns).toHaveTextContent('$0/month $0/hr');

    // update node pricing if a plan is selected

    // const radioBtn = getAllByText('Dedicated 4 GB')[0];
    // fireEvent.click(radioBtn);
    // expect(nodeRadioBtns).toHaveTextContent('$60/month $0.4/hr');
  });
});
