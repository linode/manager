import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import ConnectionDetailsHostRows from './ConnectionDetailsHostRows';

import type { Database } from '@linode/api-v4/lib/databases';

const DEFAULT_PRIMARY = 'private-db-mysql-default-primary.net';
const DEFAULT_STANDBY = 'db-mysql-default-standby.net';

const LEGACY_PRIMARY = 'db-mysql-legacy-primary.net';
const LEGACY_SECONDARY = 'db-mysql-legacy-secondary.net';

describe('ConnectionDetailsHostRows', () => {
  it('should display correctly for default database', async () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: DEFAULT_STANDBY,
      },
      platform: 'rdbms-default',
      private_network: null, // Added to test that Host field renders
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    expect(queryAllByText('Host')).toHaveLength(1);
    expect(queryAllByText(DEFAULT_PRIMARY)).toHaveLength(1);

    expect(queryAllByText('Read-only Host')).toHaveLength(1);
  });

  it('should display N/A for default DB with blank read-only Host field', async () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: undefined,
      },
      platform: 'rdbms-default',
    });

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    expect(queryAllByText('N/A')).toHaveLength(1);
  });

  it('should display Host rows correctly for legacy db', async () => {
    const database = databaseFactory.build({
      hosts: {
        primary: LEGACY_PRIMARY,
        secondary: LEGACY_SECONDARY,
        standby: undefined,
      },
      id: 22,
      platform: 'rdbms-legacy',
      port: 3306,
      ssl_connection: true,
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    expect(queryAllByText('Host')).toHaveLength(1);
    expect(queryAllByText(LEGACY_PRIMARY)).toHaveLength(1);

    expect(queryAllByText('Private Network Host')).toHaveLength(1);
    expect(queryAllByText(LEGACY_SECONDARY)).toHaveLength(1);
  });

  it('should display provisioning text when hosts are not available', async () => {
    const database = databaseFactory.build({
      hosts: undefined,
      platform: 'rdbms-default',
    }) as Database;

    const { getByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    const hostNameProvisioningText = getByText(
      'Your hostname will appear here once it is available.'
    );

    expect(hostNameProvisioningText).toBeInTheDocument();
  });

  it('should display Host when VPC is not configured', async () => {
    const privateStrIndex = DEFAULT_PRIMARY.indexOf('-');
    const baseHostName = DEFAULT_PRIMARY.slice(privateStrIndex + 1);

    const database = databaseFactory.build({
      hosts: {
        primary: baseHostName,
      },
      platform: 'rdbms-default',
      private_network: null, // VPC not configured
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    expect(queryAllByText('Host')).toHaveLength(1);
    expect(queryAllByText(baseHostName)).toHaveLength(1);
  });

  it('should display Private Host field when VPC is configured with public access as false', async () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: undefined,
      },
      platform: 'rdbms-default',
      private_network: {
        public_access: false,
        subnet_id: 1,
        vpc_id: 123,
      },
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );
    expect(queryAllByText('Private Host')).toHaveLength(1);
    expect(queryAllByText(DEFAULT_PRIMARY)).toHaveLength(1);
  });

  it('should display both Private Host and Public Host fields when VPC is configured with public access as true', async () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: undefined,
      },
      platform: 'rdbms-default',
      private_network: {
        public_access: true,
        subnet_id: 1,
        vpc_id: 123,
      },
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );
    // Verify that both Private Host and Public Host fields are rendered
    expect(queryAllByText('Private Host')).toHaveLength(1);
    expect(queryAllByText('Public Host')).toHaveLength(1);

    // Verify that the Private hostname is rendered correctly
    expect(queryAllByText(DEFAULT_PRIMARY)).toHaveLength(1);
    // Verify that the Public hostname is rendered correctly
    const privateStrIndex = DEFAULT_PRIMARY.indexOf('-');
    const baseHostName = DEFAULT_PRIMARY.slice(privateStrIndex + 1);
    const expectedPublicHostname = `public-${baseHostName}`;
    expect(queryAllByText(expectedPublicHostname)).toHaveLength(1);
  });

  it('should display Read-only Host when read-only host is available', async () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: DEFAULT_STANDBY,
      },
      platform: 'rdbms-default',
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    expect(queryAllByText('Read-only Host')).toHaveLength(1);
    expect(queryAllByText(DEFAULT_STANDBY)).toHaveLength(1);
  });
});
