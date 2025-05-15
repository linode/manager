import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SupportTicketsLanding } from './SupportTicketsLanding';

describe('Support Tickets Landing', () => {
  const { getByText } = renderWithTheme(<SupportTicketsLanding />);

  it('should render a header', () => {
    getByText('Tickets');
  });
});
