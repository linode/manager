import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DomainsLanding } from './DomainsLanding';

describe('Domains Landing', () => {
  it('should initially render a loading state', () => {
    const { getByTestId } = renderWithTheme(<DomainsLanding />);
    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });
});
