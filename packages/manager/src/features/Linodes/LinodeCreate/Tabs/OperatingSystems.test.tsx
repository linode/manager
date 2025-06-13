import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { OperatingSystems } from './OperatingSystems';

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

describe('OperatingSystems', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <OperatingSystems />,
    });

    const header = getByText('Choose an OS');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders an image select', () => {
    const { getByLabelText, getByPlaceholderText } =
      renderWithThemeAndHookFormContext({
        component: <OperatingSystems />,
      });

    expect(getByLabelText('Linux Distribution')).toBeVisible();
    expect(getByPlaceholderText('Choose a Linux distribution')).toBeVisible();
  });
});
