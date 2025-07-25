import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import LinodeSummary from './LinodeSummary';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeSummary', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({
      linodeId: '123',
    });
  });

  it('should have a select menu for the graphs', async () => {
    const { getByDisplayValue } = renderWithTheme(
      <LinodeSummary linodeCreated="2018-11-01T00:00:00" />
    );
    expect(getByDisplayValue('Last 24 Hours')).toBeInTheDocument();
  });
});
