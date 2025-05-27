import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { SupportTicketsLanding } from './SupportTicketsLanding';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useSearch: vi.fn().mockReturnValue({ dialogOpen: false }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
  };
});

describe('Support Tickets Landing', async () => {
  const { getByText } = await renderWithThemeAndRouter(
    <SupportTicketsLanding />
  );

  it('should render a header', () => {
    getByText('Tickets');
  });
});
