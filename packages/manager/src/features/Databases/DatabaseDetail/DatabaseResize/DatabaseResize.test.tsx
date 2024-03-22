import {
  fireEvent,
  queryByAttribute,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router-dom';

import { databaseFactory, databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseResize } from './DatabaseResize';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('database resize', () => {
  const database = databaseFactory.build();
  const dedicatedTypes = databaseTypeFactory.buildList(7, {
    class: 'dedicated',
  });

  it('should render a loading state', async () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseResize database={database} />
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
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([...standardTypes, ...dedicatedTypes])
        );
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseResize database={database} />
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
        http.get('*/databases/types', () => {
          return HttpResponse.json(
            makeResourcePage([...standardTypes, ...dedicatedTypes])
          );
        })
      );
    });

    it('resize button should be disabled when no input is provided in the form', async () => {
      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseResize database={database} />
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      expect(
        getByText(/Resize Database Cluster/i).closest('button')
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('when a plan is selected, resize button should be enabled and on click of it, it should show a confirmation dialog', async () => {
      // Mock route history so the Plan Selection table displays prices without requiring a region in the DB resize flow.
      const history = createMemoryHistory();
      history.push(`databases/${database.engine}/${database.id}/resize`);
      const { container, getByTestId, getByText } = renderWithTheme(
        <Router history={history}>
          <DatabaseResize database={database} />
        </Router>
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const getById = queryByAttribute.bind(null, 'id');
      fireEvent.click(getById(container, examplePlanType));
      const resizeButton = getByText(/Resize Database Cluster/i);
      expect(resizeButton.closest('button')).toHaveAttribute(
        'aria-disabled',
        'false'
      );
      fireEvent.click(resizeButton);
      getByText(`Resize Database Cluster ${database.label}?`);
    });
  });
});
