import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Backups } from './Backups';

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

describe('Backups', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('renders a Linode Select section', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Backups />,
    });

    const heading = getByText('Select Linode');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('renders a Backup Select section', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Backups />,
    });

    const heading = getByText('Select Backup');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });
});
