import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScripts } from './StackScripts';

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

describe('StackScripts', () => {
  beforeEach(() => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/linode/create',
    });
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('should render a StackScript section', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <StackScripts />,
    });

    expect(getByText('Account StackScripts')).toBeVisible();
    expect(getByText('Community StackScripts')).toBeVisible();
  });

  it('should render an Image section', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <StackScripts />,
    });

    expect(getByText('Select an Image')).toBeVisible();
  });
});
