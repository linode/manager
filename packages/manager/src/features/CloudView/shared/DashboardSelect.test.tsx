import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  CloudViewDashbboardSelectProps,
  CloudViewDashboardSelect,
} from './DashboardSelect';

const handleDashboardChange = vi.fn();

describe('CloudViewDashboardSelect', () => {
  const props: CloudViewDashbboardSelectProps = {
    handleDashboardChange,
  };

  it('should render a Select component with the correct label', async () => {
    const { getByTestId } = renderWithTheme(
      <CloudViewDashboardSelect {...props} />
    );
    expect(getByTestId('cloudview-dashboard-select')).toBeInTheDocument();
  });
});
