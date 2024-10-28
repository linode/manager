import { screen } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ExplainerCopy } from './ExplainerCopy';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

describe('ExplainerCopy Component', () => {
  const linodeId = 1234;

  beforeEach(() => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: { label: 'Test Linode' },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the correct content for v4Private IPType', () => {
    renderWithTheme(<ExplainerCopy ipType="v4Private" linodeId={linodeId} />);

    expect(
      screen.getByText(/Add a private IP address to your Linode/i)
    ).toBeVisible();
    expect(
      screen.getByText(/Data sent explicitly to and from private IP addresses/i)
    ).toBeVisible();
  });

  it('renders the correct content for v4Public IPType with SupportLink', () => {
    renderWithTheme(<ExplainerCopy ipType="v4Public" linodeId={linodeId} />);

    expect(
      screen.getByText(/Public IP addresses, over and above the one included/i)
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Support Ticket' })).toBeVisible();
  });

  it('displays no content when an unknown IPType is provided', () => {
    renderWithTheme(<ExplainerCopy ipType={null as any} linodeId={linodeId} />);

    expect(screen.queryByText(/Add a private IP address/i)).toBeNull();
    expect(screen.queryByText(/Support Ticket/)).toBeNull();
  });
});
