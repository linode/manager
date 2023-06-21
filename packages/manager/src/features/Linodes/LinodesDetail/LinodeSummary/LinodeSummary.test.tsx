import * as React from 'react';
import LinodeSummary from './LinodeSummary';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { MemoryRouter, Route } from 'react-router-dom';

describe('LinodeSummary', () => {
  it('should have a select menu for the graphs', () => {
    const { getByText } = renderWithTheme(
      <MemoryRouter initialEntries={['linode/1']}>
        <Route path="linode/:linodeId">
          <LinodeSummary
            isBareMetalInstance={false}
            linodeCreated="2018-11-01T00:00:00"
          />
        </Route>
      </MemoryRouter>
    );

    expect(getByText('Last 24 Hours')).toBeInTheDocument();
  });
});
