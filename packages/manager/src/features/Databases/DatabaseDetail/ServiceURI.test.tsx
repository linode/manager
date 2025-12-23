import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it } from 'vitest';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ServiceURI } from './ServiceURI';

const mockDatabase = databaseFactory.build({
  connection_pool_port: 100,
  engine: 'postgresql',
  id: 1,
  platform: 'rdbms-default',
  private_network: null,
});

const mockCredentials = {
  password: 'password123',
  username: 'lnroot',
};

// Hoist query mocks
const queryMocks = vi.hoisted(() => {
  return {
    useDatabaseCredentialsQuery: vi.fn(),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDatabaseCredentialsQuery: queryMocks.useDatabaseCredentialsQuery,
  };
});

describe('ServiceURI', () => {
  it('should render the service URI component and copy icon', async () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({
      data: mockCredentials,
    });
    const { container } = renderWithTheme(
      <ServiceURI database={mockDatabase} />
    );

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    const serviceURIText = screen.getByTestId('service-uri').textContent;

    expect(revealPasswordBtn).toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://{click to reveal password}@db-mysql-primary-0.b.linodeb.net:{connection pool port}/{connection pool label}?sslmode=require`
    );

    // eslint-disable-next-line testing-library/no-container
    const copyButton = container.querySelector('[data-qa-copy-btn]');
    expect(copyButton).toBeInTheDocument();
  });

  it('should reveal password after clicking reveal button', async () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({
      data: mockCredentials,
      refetch: vi.fn(),
    });
    renderWithTheme(<ServiceURI database={mockDatabase} />);

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    await userEvent.click(revealPasswordBtn);

    const serviceURIText = screen.getByTestId('service-uri').textContent;
    expect(revealPasswordBtn).not.toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://lnroot:password123@db-mysql-primary-0.b.linodeb.net:{connection pool port}/{connection pool label}?sslmode=require`
    );
  });

  it('should render error retry button if the credentials call fails', () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({
      error: new Error('Failed to fetch credentials'),
    });

    renderWithTheme(<ServiceURI database={mockDatabase} />);

    const errorRetryBtn = screen.getByRole('button', {
      name: '{error. click to retry}',
    });
    expect(errorRetryBtn).toBeInTheDocument();
  });
});
