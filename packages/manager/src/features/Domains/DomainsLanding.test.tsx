import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { DomainsLanding } from './DomainsLanding';

describe('Domains Landing', () => {
  it('should initially render a loading state', async () => {
    const { getByTestId } = await renderWithThemeAndRouter(<DomainsLanding />);
    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });
});
