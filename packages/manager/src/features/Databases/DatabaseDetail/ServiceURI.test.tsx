import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it } from 'vitest';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ServiceURI } from './ServiceURI';

import type { DatabaseStatus } from '@linode/api-v4';

const mockCredentials = {
  password: 'password123',
  username: 'lnroot',
};

const DEFAULT_PRIMARY = 'db-postgres-default-primary.net';
const DEFAULT_STANDBY = 'db-postgres-default-standby.net';

const PRIVATE_PRIMARY = `private-${DEFAULT_PRIMARY}`;
const PRIVATE_STANDBY = `private-${DEFAULT_STANDBY}`;

const PRIMARY_PUBLIC_CONNECTION_POOL =
  'public-db-postgres-primary-connection-pool-0.b.linodeb.net';
const PRIMARY_PRIVATE_CONNECTION_POOL =
  'private-db-postgres-primary-connection-pool-0.b.linodeb.net';

const databaseWithNoVPC = databaseFactory.build({
  engine: 'postgresql',
  hosts: {
    primary: DEFAULT_PRIMARY,
    standby: DEFAULT_STANDBY,
    endpoints: [
      {
        role: 'primary',
        address: DEFAULT_PRIMARY,
        port: 3306,
        public_access: true,
      },
      {
        role: 'primary-connection-pool',
        address: PRIMARY_PUBLIC_CONNECTION_POOL,
        port: 15848,
        public_access: true,
      },
      {
        role: 'standby-connection-pool',
        address:
          'public-replica-db-postgres-standby-connection-pool-0.b.linodeb.net',
        port: 15848,
        public_access: true,
      },
    ],
  },
  platform: 'rdbms-default',
  private_network: null, // No VPC configured
  status: 'active',
});

const databaseWithPrivateVPC = databaseFactory.build({
  engine: 'postgresql',
  hosts: {
    primary: PRIVATE_PRIMARY,
    standby: PRIVATE_STANDBY,
    endpoints: [
      {
        role: 'primary',
        address: PRIVATE_PRIMARY,
        port: 3306,
        public_access: false,
      },
      {
        role: 'primary-connection-pool',
        address: PRIMARY_PRIVATE_CONNECTION_POOL,
        port: 15848,
        public_access: false,
      },
      {
        role: 'standby-connection-pool',
        address:
          'private-replica-db-postgres-standby-connection-pool-0.b.linodeb.net',
        port: 15848,
        public_access: false,
      },
    ],
  },
  platform: 'rdbms-default',
  private_network: {
    public_access: false,
    subnet_id: 1,
    vpc_id: 123,
  },
  status: 'active',
});

const databaseWithPublicVPC = databaseFactory.build({
  engine: 'postgresql',
  hosts: {
    primary: PRIVATE_PRIMARY,
    standby: PRIVATE_STANDBY,
    endpoints: [
      {
        role: 'primary',
        address: PRIVATE_PRIMARY,
        port: 3306,
        public_access: false,
      },
      {
        role: 'primary-connection-pool',
        address: PRIMARY_PRIVATE_CONNECTION_POOL,
        port: 15848,
        public_access: false,
      },
      {
        role: 'standby-connection-pool',
        address:
          'private-replica-db-postgres-standby-connection-pool-0.b.linodeb.net',
        port: 15848,
        public_access: false,
      },
      {
        role: 'primary',
        address: DEFAULT_PRIMARY,
        port: 3306,
        public_access: true,
      },
      {
        role: 'primary-connection-pool',
        address: PRIMARY_PUBLIC_CONNECTION_POOL,
        port: 15848,
        public_access: true,
      },
      {
        role: 'standby-connection-pool',
        address:
          'public-replica-db-postgres-standby-connection-pool-0.b.linodeb.net',
        port: 15848,
        public_access: true,
      },
    ],
  },
  platform: 'rdbms-default',
  private_network: {
    public_access: true,
    subnet_id: 1,
    vpc_id: 123,
  },
  status: 'active',
});

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
  queryMocks.useDatabaseCredentialsQuery.mockReturnValue({
    data: mockCredentials,
    refetch: vi.fn(),
  });

  it('should render the service URI component and copy icon', async () => {
    const { container } = renderWithTheme(
      <ServiceURI database={databaseWithNoVPC} />
    );

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    const serviceURIText = screen.getByTestId('service-uri').textContent;

    expect(revealPasswordBtn).toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://{click to reveal password}@${PRIMARY_PUBLIC_CONNECTION_POOL}:15848/{connection pool label}?sslmode=require`
    );

    // eslint-disable-next-line testing-library/no-container
    const copyButton = container.querySelector('[data-qa-copy-btn]');
    expect(copyButton).toBeInTheDocument();
  });

  it('should reveal password after clicking reveal button', async () => {
    renderWithTheme(<ServiceURI database={databaseWithNoVPC} />);

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    await userEvent.click(revealPasswordBtn);

    const serviceURIText = screen.getByTestId('service-uri').textContent;
    expect(revealPasswordBtn).not.toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://lnroot:password123@${PRIMARY_PUBLIC_CONNECTION_POOL}:15848/{connection pool label}?sslmode=require`
    );
  });

  it('should render general service URI if isGeneralServiceURI is true', () => {
    renderWithTheme(
      <ServiceURI database={databaseWithNoVPC} isGeneralServiceURI />
    );

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    const serviceURIText = screen.getByTestId('service-uri').textContent;

    expect(revealPasswordBtn).toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://{click to reveal password}@${DEFAULT_PRIMARY}:3306/defaultdb?sslmode=require`
    );
  });

  it('should reveal general service URI password after clicking reveal button', async () => {
    renderWithTheme(
      <ServiceURI database={databaseWithNoVPC} isGeneralServiceURI />
    );

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    await userEvent.click(revealPasswordBtn);

    const serviceURIText = screen.getByTestId('service-uri').textContent;
    expect(revealPasswordBtn).not.toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://password123@${DEFAULT_PRIMARY}:3306/defaultdb?sslmode=require`
    );
  });

  it('should render private service URI component if there is a private-only VPC', async () => {
    renderWithTheme(<ServiceURI database={databaseWithPrivateVPC} />);

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    const serviceURIText = screen.getByTestId('service-uri').textContent;

    expect(revealPasswordBtn).toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://{click to reveal password}@${PRIMARY_PRIVATE_CONNECTION_POOL}:15848/{connection pool label}?sslmode=require`
    );
  });

  it('should render private general service URI component if there is a private-only VPC', async () => {
    renderWithTheme(
      <ServiceURI database={databaseWithPrivateVPC} isGeneralServiceURI />
    );

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    const serviceURIText = screen.getByTestId('service-uri').textContent;

    expect(revealPasswordBtn).toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://{click to reveal password}@${PRIVATE_PRIMARY}:3306/defaultdb?sslmode=require`
    );
  });

  it('should render public service URI component if there is a VPC with public access', async () => {
    renderWithTheme(<ServiceURI database={databaseWithPublicVPC} />);

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    const serviceURIText = screen.getByTestId('service-uri').textContent;

    expect(revealPasswordBtn).toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://{click to reveal password}@${PRIMARY_PUBLIC_CONNECTION_POOL}:15848/{connection pool label}?sslmode=require`
    );
  });

  it('should render private service URI component if there is a VPC with public access and showPrivateVPC is true', async () => {
    renderWithTheme(
      <ServiceURI database={databaseWithPublicVPC} showPrivateVPC />
    );

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    const serviceURIText = screen.getByTestId('service-uri').textContent;

    expect(revealPasswordBtn).toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://{click to reveal password}@${PRIMARY_PRIVATE_CONNECTION_POOL}:15848/{connection pool label}?sslmode=require`
    );
  });

  it('should render general private service URI if there is a VPC with public access, isGeneralServiceURI is true, and showPrivateVPC is true', () => {
    renderWithTheme(
      <ServiceURI
        database={databaseWithPublicVPC}
        isGeneralServiceURI
        showPrivateVPC
      />
    );

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    const serviceURIText = screen.getByTestId('service-uri').textContent;

    expect(revealPasswordBtn).toBeInTheDocument();
    expect(serviceURIText).toBe(
      `postgres://{click to reveal password}@${PRIVATE_PRIMARY}:3306/defaultdb?sslmode=require`
    );
  });

  it('should disable the reveal password and copy icon if the Database is suspended', async () => {
    const mockDatabase = {
      ...databaseWithNoVPC,
      status: 'suspended' as DatabaseStatus,
    };

    const { container } = renderWithTheme(
      <ServiceURI database={mockDatabase} />
    );

    const revealPasswordBtn = screen.getByRole('button', {
      name: '{click to reveal password}',
    });
    // eslint-disable-next-line testing-library/no-container
    const copyButton = container.querySelector('[data-qa-copy-btn]');
    expect(revealPasswordBtn).toBeDisabled();
    expect(copyButton).toBeDisabled();
  });
});
