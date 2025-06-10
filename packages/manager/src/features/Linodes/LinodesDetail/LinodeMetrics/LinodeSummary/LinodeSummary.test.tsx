import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import LinodeSummary from './LinodeSummary';

describe('LinodeSummary', () => {
  it('should have a select menu for the graphs', async () => {
    const { getByDisplayValue } = await renderWithThemeAndRouter(
      <LinodeSummary linodeCreated="2018-11-01T00:00:00" />
    );
    expect(getByDisplayValue('Last 24 Hours')).toBeInTheDocument();
  });
});
