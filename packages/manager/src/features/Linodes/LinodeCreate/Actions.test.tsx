import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Actions } from './Actions';

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

describe('Actions', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('should render a create button', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('Create Linode').closest('button');

    expect(button).toBeVisible();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeEnabled();
  });

  it("should render a 'View Code Snippets' button", () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('View Code Snippets').closest('button');

    expect(button).toBeVisible();
    expect(button).toBeEnabled();
  });
});
