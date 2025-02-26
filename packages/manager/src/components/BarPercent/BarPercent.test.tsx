import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BarPercent } from './BarPercent';

describe('BarPercent', () => {
  // Component
  it('should render', () => {
    const { getByRole } = renderWithTheme(<BarPercent max={100} value={50} />);
    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display the right colors when customColors is provided', () => {
    const { getByTestId } = renderWithTheme(
      <BarPercent
        customColors={[{ color: 'red', percentage: 50 }]}
        max={100}
        value={51}
      />
    );

    expect(getByTestId('linear-progress').firstChild).toHaveStyle(
      'background-color: rgb(255, 0, 0)'
    );
  });
});
