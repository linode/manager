import { H1Header } from '@linode/ui';
import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import SupportSearchLanding from './SupportSearchLanding';

const props = {
  searchAlgolia: vi.fn(),
  searchEnabled: true,
  searchResults: [[], []],
  location: {
    search: '?query=test',
  },
};

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useLocation: queryMocks.useLocation,
  };
});

describe('SupportSearchLanding Component', () => {
  beforeEach(() => {
    queryMocks.useLocation.mockReturnValue({
      search: '?query=test',
      state: {
        supportTicketFormFields: {},
      },
    });
  });

  it('should render', () => {
    renderWithTheme(<SupportSearchLanding {...props} />);
    expect(screen.getByTestId('support-search-landing')).toBeInTheDocument();
  });

  it('should display generic text if no query string is provided', () => {
    renderWithTheme(<H1Header {...props} title="Search" />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('should display query string in the header', () => {
    renderWithTheme(<H1Header {...props} title={props.location.search} />);
    expect(screen.getByText(props.location.search)).toBeInTheDocument();
  });

  it('should display multi-word query string in the header', () => {
    // what is going on here?
    renderWithTheme(<H1Header title="?query=two%20words" />);
    expect(screen.getByText('?query=two%20words')).toBeInTheDocument();
  });

  it('should display empty DocumentationResults components with empty query string', () => {
    renderWithTheme(<SupportSearchLanding {...props} />);
    expect(
      screen.getAllByTestId('data-qa-documentation-no-results')
    ).toHaveLength(2);
  });
});
