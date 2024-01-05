import {
  fireEvent,
  queryByAttribute,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { QueryClient } from 'react-query';
import { Router } from 'react-router-dom';

import { databaseFactory, databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseScaleUp } from './DatabaseScaleUp';

const queryClient = new QueryClient();
const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('database scale up', () => {
  const database = databaseFactory.build();
  const dedicatedTypes = databaseTypeFactory.buildList(7, {
    class: 'dedicated',
  });

  it('should render a loading state', async () => {
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
    server.use(
      rest.get('*/databases/types', (req, res, ctx) => {
        return res(
          ctx.json(makeResourcePage([...standardTypes, ...dedicatedTypes]))
        );
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseScaleUp database={database} />,
      {
        queryClient,
      }
    );
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText('Current Configuration');
    getByText('Choose a Plan');
    getByText('Summary');
  });

  describe('On rendering of page', () => {
    const examplePlanType = 'g6-standard-60';
    const dedicatedTypes = databaseTypeFactory.buildList(7, {
      class: 'dedicated',
    });
    const database = databaseFactory.build();
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
      server.use(
        rest.get('*/databases/types', (req, res, ctx) => {
          return res(
            ctx.json(makeResourcePage([...standardTypes, ...dedicatedTypes]))
          );
        })
      );
    });

    it('scale up button should be disabled when no input is provided in the form', async () => {
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
      // Mock route history so the Plan Selection table displays prices without requiring a region in the DB scale up flow.
      const history = createMemoryHistory();
      history.push(`databases/${database.engine}/${database.id}/scale-up`);
      const { container, getByTestId, getByText } = renderWithTheme(
        <Router history={history}>
          <DatabaseScaleUp database={database} />
        </Router>,
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
