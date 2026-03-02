import { screen } from '@testing-library/react';
import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ConnectionDetailsHostRows2 } from './ConnectionDetailsHostRows2';

const DEFAULT_PRIMARY = 'db-mysql-default-primary.net';
const DEFAULT_STANDBY = 'db-mysql-default-standby.net';

const PRIVATE_PRIMARY = `private-${DEFAULT_PRIMARY}`;
const PRIVATE_STANDBY = `private-${DEFAULT_STANDBY}`;

describe('ConnectionDetailsHostRows2', () => {
  it('should display Host and Read-only Host fields for a default database with no VPC configured', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        standby: DEFAULT_STANDBY,
        endpoints: [
          {
            role: 'primary',
            address: DEFAULT_PRIMARY,
            port: 15847,
            public_access: true,
          },
          {
            role: 'standby',
            address: DEFAULT_STANDBY,
            port: 15847,
            public_access: true,
          },
        ],
      },
      platform: 'rdbms-default',
      private_network: null, // No VPC configured, so Host and Read-only Host fields render
    });

    renderWithTheme(<ConnectionDetailsHostRows2 database={database} />);

    expect(screen.getByText('Host')).toBeVisible();
    expect(screen.getByText(DEFAULT_PRIMARY)).toBeVisible();

    expect(screen.getByText('Read-only Host')).toBeVisible();
    expect(screen.getByText(DEFAULT_STANDBY)).toBeVisible();
  });

  it('should display N/A for default DB with blank read-only Host field', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        standby: undefined,
        endpoints: [
          {
            role: 'primary',
            address: DEFAULT_PRIMARY,
            port: 15847,
            public_access: true,
          },
        ],
      },
      platform: 'rdbms-default',
    });

    renderWithTheme(<ConnectionDetailsHostRows2 database={database} />);

    expect(screen.getByText('N/A')).toBeVisible();
  });

  it('should display provisioning text when hosts are not available', () => {
    const database = databaseFactory.build({
      hosts: undefined,
      platform: 'rdbms-default',
    });

    const { getByText } = renderWithTheme(
      <ConnectionDetailsHostRows2 database={database} />
    );

    const hostNameProvisioningText = getByText(
      'Your hostname will appear here once it is available.'
    );

    expect(hostNameProvisioningText).toBeInTheDocument();
  });

  it('should display Private variations of Host and Read-only fields when a VPC is configured with public access set to false', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: PRIVATE_PRIMARY,
        standby: PRIVATE_STANDBY,
        endpoints: [
          {
            role: 'primary',
            address: PRIVATE_PRIMARY,
            port: 15847,
            public_access: false,
          },
          {
            role: 'standby',
            address: PRIVATE_STANDBY,
            port: 15847,
            public_access: false,
          },
        ],
      },
      platform: 'rdbms-default',
      private_network: {
        public_access: false,
        subnet_id: 1,
        vpc_id: 123,
      }, // VPC configuration with public access set to false
    });

    renderWithTheme(<ConnectionDetailsHostRows2 database={database} />);

    expect(screen.getByText('Private Host')).toBeVisible();
    expect(screen.getByText(PRIVATE_PRIMARY)).toBeVisible();
    expect(screen.getByText('Private Read-only Host')).toBeVisible();
    expect(screen.getByText(PRIVATE_STANDBY)).toBeVisible();
  });

  it('should display Private and Public variations of Host and Read-only Host fields when a VPC is configured with public access set to true', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: PRIVATE_PRIMARY,
        standby: PRIVATE_STANDBY,
        endpoints: [
          {
            role: 'primary',
            address: `public-${DEFAULT_PRIMARY}`,
            port: 15847,
            public_access: true,
          },
          {
            role: 'standby',
            address: `public-${DEFAULT_STANDBY}`,
            port: 15847,
            public_access: true,
          },
          {
            role: 'primary',
            address: PRIVATE_PRIMARY,
            port: 15847,
            public_access: false,
          },
          {
            role: 'standby',
            address: PRIVATE_STANDBY,
            port: 15847,
            public_access: false,
          },
        ],
      },
      platform: 'rdbms-default',
      private_network: {
        public_access: true,
        subnet_id: 1,
        vpc_id: 123,
      }, // VPC configuration with public access set to true
    });

    renderWithTheme(<ConnectionDetailsHostRows2 database={database} />);

    // Verify that Private and Public Host and Readonly-host fields are rendered
    expect(screen.getByText('Private Host')).toBeVisible();
    expect(screen.getByText('Public Host')).toBeVisible();
    expect(screen.getByText('Private Read-only Host')).toBeVisible();
    expect(screen.getByText('Public Read-only Host')).toBeVisible();

    // Verify that the Private and Public hostname is rendered correctly
    expect(screen.getByText(PRIVATE_PRIMARY)).toBeVisible();
    expect(screen.getByText(`public-${DEFAULT_PRIMARY}`)).toBeVisible();

    // Verify that the Private and Public read-only hostname is rendered correctly
    expect(screen.getByText(PRIVATE_STANDBY)).toBeVisible();
    expect(screen.getByText(`public-${DEFAULT_STANDBY}`)).toBeVisible();
  });
});
