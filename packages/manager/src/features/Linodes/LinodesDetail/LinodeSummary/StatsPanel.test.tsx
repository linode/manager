import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StatsPanel } from './StatsPanel';

const title = 'Stats About My Linode';

describe('StatsPanel component', () => {
  it('should render a loading spinner on loading state', () => {
    const renderBody = vi.fn();
    const { getByTestId } = renderWithTheme(
      <StatsPanel loading={true} renderBody={renderBody} title={title} />
    );

    expect(getByTestId('circle-progress')).toBeInTheDocument();
    expect(renderBody).not.toHaveBeenCalled();
  });

  it('should call its renderContent function if neither error or loading', () => {
    const renderBody = vi.fn();

    renderWithTheme(
      <StatsPanel loading={false} renderBody={renderBody} title={title} />
    );

    expect(renderBody).toHaveBeenCalled();
  });
});
