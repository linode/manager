import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { LinodeSelect } from './LinodeSelect';

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

describe('LinodeSelect', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('should render a heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <LinodeSelect />,
    });

    const heading = getByText('Select Linode');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });
});
