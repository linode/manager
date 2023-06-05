import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { StatsPanel } from './StatsPanel';

const title = 'Stats About My Linode';

describe('StatsPanel component', () => {
  it('should render a loading spinner on loading state', () => {
    const renderBody = jest.fn();
    const { getByTestId } = renderWithTheme(
      <StatsPanel
        title={title}
        height={300}
        loading={true}
        renderBody={renderBody}
      />
    );

    expect(getByTestId('circle-progress')).toBeInTheDocument();
    expect(renderBody).not.toHaveBeenCalled();
  });

  it('should call its renderContent function if neither error or loading', () => {
    const renderBody = jest.fn();

    renderWithTheme(
      <StatsPanel
        title={title}
        height={300}
        loading={false}
        renderBody={renderBody}
      />
    );

    expect(renderBody).toHaveBeenCalled();
  });
});
