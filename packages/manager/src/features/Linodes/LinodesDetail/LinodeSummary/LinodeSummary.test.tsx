import * as React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import { renderWithTheme } from 'src/utilities/testHelpers';

import LinodeSummary from './LinodeSummary';

describe('LinodeSummary', () => {
  it('should have a select menu for the graphs', () => {
    const { getByDisplayValue } = renderWithTheme(
      <MemoryRouter initialEntries={['linode/1']}>
        <Route path="linode/:linodeId">
          <LinodeSummary linodeCreated="2018-11-01T00:00:00" />
        </Route>
      </MemoryRouter>
    );
    expect(getByDisplayValue('Last 24 Hours')).toBeInTheDocument();
  });
});
