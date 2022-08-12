import * as React from 'react';
import { DomainsLanding } from './DomainsLanding';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('Domains Landing', () => {
  it('should initially render a loading state', () => {
    const { getByTestId } = renderWithTheme(<DomainsLanding />);
    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });
});
