import {
  fireEvent,
  queryByAttribute,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { databaseFactory, databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseScaleUp from './DatabaseScaleUp';

const queryClient = new QueryClient();
const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('database scale up', () => {
  it('should render a loading state', async () => {
    const database = databaseFactory.build();
    const { getByTestId } = renderWithTheme(
      <DatabaseScaleUp database={database} />,
      {
        queryClient,
      }
    );

    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render configuration, summary sections and input field to choose a plan', async () => {
    // Mock the Database.
    const database = databaseFactory.build();

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

    const { getAllByText, getByTestId } = renderWithTheme(
      <DatabaseScaleUp database={database} />,
      {
        queryClient,
      }
    );
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getAllByText('Current Configuration');
    getAllByText('Choose a Plan');
    getAllByText('Summary');
  });

  describe('On rendering of page', () => {
    const examplePlanType = 'g6-standard-60';
    beforeEach(() => {
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
    });

    it('scale up button should be disabled when no input is provided in the form', async () => {
      const database = databaseFactory.build();
      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseScaleUp database={database} />,
        {
          queryClient,
        }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      expect(
        getByText(/Scale Up Database Cluster/i).closest('button')
      ).toBeDisabled();
    });

    it('when a plan is selected, scale up button should be enabled and on click of it, it should show a confirmation dialog', async () => {
      const database = databaseFactory.build();
      const { container, getByTestId, getByText } = renderWithTheme(
        <DatabaseScaleUp database={database} />,
        {
          queryClient,
        }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const getById = queryByAttribute.bind(null, 'id');
      fireEvent.click(getById(container, examplePlanType));
      const scaleUpButton = getByText(/Scale Up Database Cluster/i);
      expect(scaleUpButton.closest('button')).not.toBeDisabled();
      fireEvent.click(scaleUpButton);
      getByText(`Scale up ${database.label}?`);
    });
  });
});
