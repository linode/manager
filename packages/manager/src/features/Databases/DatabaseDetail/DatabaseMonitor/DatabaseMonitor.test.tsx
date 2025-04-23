import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { databaseFactory } from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseMonitor } from './DatabaseMonitor';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('database monitor', () => {
  const database = databaseFactory.build({ id: 12 });
  it('should render a loading state', async () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseMonitor database={database} />
    );
    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render CloudPulseDashboardWithFilters', async () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseMonitor database={database} />
    );
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    expect(getByTestId('preset-select')).toBeInTheDocument();
  });
});
