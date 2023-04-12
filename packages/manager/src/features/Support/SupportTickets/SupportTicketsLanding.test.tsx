import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import SupportTicketsLanding from './SupportTicketsLanding';

describe('Support Tickets Landing', () => {
  it('should render a header', () => {
    const { getByText } = renderWithTheme(<SupportTicketsLanding />);
    getByText('Tickets');
  });
});
