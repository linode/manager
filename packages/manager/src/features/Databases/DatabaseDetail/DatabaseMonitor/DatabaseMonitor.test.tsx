import { waitForElementToBeRemoved } from '@testing-library/react';
import { screen } from '@testing-library/react';
import * as React from 'react';

import { databaseFactory } from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseMonitor } from './DatabaseMonitor';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('database monitor', () => {
  const database = databaseFactory.build({ id: 12 });
  it('should render a loading state', async () => {
    renderWithTheme(<DatabaseMonitor database={database} />);

    const loadingElement = screen.getByTestId(loadingTestId);
    // Should render a loading state
    expect(loadingElement).toBeInTheDocument();
  });

  it('should render CloudPulseDashboardWithFilters', async () => {
    renderWithTheme(<DatabaseMonitor database={database} />);
    const loadingElement = screen.getByTestId(loadingTestId);
    expect(loadingElement).toBeInTheDocument();
    await waitForElementToBeRemoved(loadingElement);

    const startDate = screen.getByText('Start Date');
    expect(startDate).toBeInTheDocument();
  });
});
