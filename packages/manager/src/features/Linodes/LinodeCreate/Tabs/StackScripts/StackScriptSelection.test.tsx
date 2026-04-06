import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScriptSelection } from './StackScriptSelection';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('StackScriptSelection', () => {
  beforeEach(() => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/linodes/create',
    });
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({
      type: 'StackScripts',
      subtype: 'Community',
    });
    queryMocks.useParams.mockReturnValue({});
  });

  it('should select tab based on query params', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <StackScriptSelection />,
    });

    const communityTabButton = getByText('Community StackScripts');

    expect(communityTabButton).toHaveAttribute('aria-selected', 'true');
  });
});
