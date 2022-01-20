import * as React from 'react';
import DatabaseCreate from './DatabaseCreate';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { QueryClient } from 'react-query';
import { waitForElementToBeRemoved, fireEvent } from '@testing-library/react';
import { rest, server } from 'src/mocks/testServer';
import { databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { mockMatchMedia } from 'src/utilities/testHelpers';

const queryClient = new QueryClient();
const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('Database Create', () => {
  it('should render loading state', () => {
    const { getByTestId } = renderWithTheme(<DatabaseCreate />, {
      queryClient,
    });
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render inputs', async () => {
    const { getAllByText, getByTestId } = renderWithTheme(<DatabaseCreate />, {
      queryClient,
    });
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getAllByText('Cluster Label');
    getAllByText('Database Engine');
    getAllByText('Select a Region');
    getAllByText('Choose a Plan');
    getByTestId('database-nodes');
    getByTestId('domain-transfer-input');
    getAllByText('Create Database Cluster');
  });

  it('should display the correct node price and disable 3 nodes for 1 GB plans', async () => {
    const standardTypes = [
      databaseTypeFactory.build({
        id: 'g6-standard-0',
        label: `Linode 1 GB`,
        class: 'standard',
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];
    const dedicatedTypes = [
      databaseTypeFactory.build({
        id: 'g6-dedicated-0',
        label: `Dedicated 1 GB`,
        class: 'dedicated',
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'dedicated' }),
    ];
    server.use(
      rest.get('*/databases/types', (req, res, ctx) => {
        return res(
          ctx.json(makeResourcePage([...standardTypes, ...dedicatedTypes]))
        );
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
    const radioBtn = getAllByText('Linode 1 GB')[0];
    fireEvent.click(radioBtn);
    expect(nodeRadioBtns).toHaveTextContent('$60/month $0.4/hr');
    expect(nodeRadioBtns).toHaveTextContent('$140.00/month $1.00/hr');

    // 3 Node options are disabled for 1 GB plans
    expect(nodeRadioBtns.querySelector('input[type=radio]')).toBeDisabled();
  });
});
