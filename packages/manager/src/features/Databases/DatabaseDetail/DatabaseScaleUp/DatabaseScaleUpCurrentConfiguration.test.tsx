import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { databaseFactory, databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseScaleUpCurrentConfiguration } from './DatabaseScaleUpCurrentConfiguration';

const queryClient = new QueryClient();
const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('database current configuration section', () => {
  const database = databaseFactory.build();
  it('should render a loading state', async () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseScaleUpCurrentConfiguration database={database} />,
      {
        queryClient,
      }
    );

    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should display number of status, version, nodes, region, RAM, CPUs and total disk size', async () => {
    // Mock database types
    const standardTypes = [
      databaseTypeFactory.build({
        class: 'nanode',
        id: 'g6-standard-0',
        label: `Nanode 1 GB`,
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];
    const dedicatedTypes = databaseTypeFactory.buildList(7, {
      class: 'dedicated',
    });
    server.use(
      rest.get('*/databases/types', (req, res, ctx) => {
        return res(
          ctx.json(makeResourcePage([...standardTypes, ...dedicatedTypes]))
        );
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseScaleUpCurrentConfiguration database={database} />,
      {
        queryClient,
      }
    );
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText('Status');
    getByText('Version');
    getByText('Nodes');

    getByText('Region');
    getByText('Newark, NJ');

    getByText('RAM');
    getByText('1 GB');

    getByText('CPUs');
    getByText('2');

    getByText('Total Disk Size');
    getByText('15 GB');
  });
});
